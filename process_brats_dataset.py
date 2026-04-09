"""
process_brats_dataset.py
-------------------------
Process downloaded BraTS 2021 dataset and extract cases for NeuroLens.
Handles the 13GB dataset structure.
"""

import os
import shutil
import nibabel as nib
import numpy as np
from pathlib import Path
import json


def find_brats_cases(dataset_path):
    """
    Find all BraTS case folders in the downloaded dataset.
    
    BraTS structure:
    dataset_path/
    ├── BraTS2021_00000/
    │   ├── BraTS2021_00000_flair.nii.gz
    │   ├── BraTS2021_00000_t1.nii.gz
    │   ├── BraTS2021_00000_t1ce.nii.gz
    │   ├── BraTS2021_00000_t2.nii.gz
    │   └── BraTS2021_00000_seg.nii.gz
    ├── BraTS2021_00001/
    └── ...
    """
    cases = []
    
    for root, dirs, files in os.walk(dataset_path):
        # Look for folders with BraTS naming pattern
        for dir_name in dirs:
            if dir_name.startswith('BraTS'):
                case_path = os.path.join(root, dir_name)
                
                # Check if it has the required files
                flair_file = None
                seg_file = None
                
                for file in os.listdir(case_path):
                    if file.endswith('_flair.nii.gz'):
                        flair_file = os.path.join(case_path, file)
                    elif file.endswith('_seg.nii.gz'):
                        seg_file = os.path.join(case_path, file)
                
                if flair_file and seg_file:
                    cases.append({
                        'name': dir_name,
                        'path': case_path,
                        'flair': flair_file,
                        'seg': seg_file
                    })
    
    return cases


def analyze_case(flair_path, seg_path):
    """Analyze a case to get tumor statistics."""
    try:
        # Load segmentation
        seg_img = nib.load(seg_path)
        seg_data = seg_img.get_fdata()
        
        # Count tumor voxels
        tumor_voxels = np.sum(seg_data > 0)
        total_voxels = seg_data.size
        tumor_percentage = (tumor_voxels / total_voxels) * 100
        
        # Get tumor center of mass
        if tumor_voxels > 0:
            tumor_coords = np.argwhere(seg_data > 0)
            center = tumor_coords.mean(axis=0)
        else:
            center = [0, 0, 0]
        
        # Load FLAIR to get dimensions
        flair_img = nib.load(flair_path)
        flair_data = flair_img.get_fdata()
        
        return {
            'shape': flair_data.shape,
            'tumor_voxels': int(tumor_voxels),
            'tumor_percentage': float(tumor_percentage),
            'has_tumor': tumor_voxels > 0,
            'center': [float(c) for c in center]
        }
    except Exception as e:
        return {'error': str(e)}


def select_best_cases(cases, num_cases=7):
    """
    Select diverse cases with visible tumors.
    Returns cases with different tumor sizes/locations.
    """
    print(f"\n[2/5] Analyzing {len(cases)} cases to find best samples...")
    
    analyzed_cases = []
    
    for i, case in enumerate(cases[:50]):  # Analyze first 50 to save time
        print(f"  Analyzing {i+1}/50: {case['name']}", end='\r')
        
        stats = analyze_case(case['flair'], case['seg'])
        
        if stats.get('has_tumor') and stats.get('tumor_percentage', 0) > 0.1:
            case['stats'] = stats
            analyzed_cases.append(case)
    
    print()  # New line
    
    # Sort by tumor size (want variety)
    analyzed_cases.sort(key=lambda x: x['stats']['tumor_percentage'])
    
    # Select cases with different tumor sizes
    selected = []
    if len(analyzed_cases) >= num_cases:
        step = len(analyzed_cases) // num_cases
        for i in range(num_cases):
            idx = i * step
            selected.append(analyzed_cases[idx])
    else:
        selected = analyzed_cases[:num_cases]
    
    print(f"\n  Selected {len(selected)} cases with tumors:")
    for i, case in enumerate(selected):
        tumor_pct = case['stats']['tumor_percentage']
        print(f"    {i+1}. {case['name']} - Tumor: {tumor_pct:.2f}%")
    
    return selected


def copy_case_files(case, output_dir, case_number):
    """Copy case files to project directory."""
    case_dir = output_dir / f"case_{case_number:03d}"
    case_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy files
    shutil.copy2(case['flair'], case_dir / 'flair.nii.gz')
    shutil.copy2(case['seg'], case_dir / 'seg.nii.gz')
    
    # Save metadata
    metadata = {
        'original_name': case['name'],
        'case_number': case_number,
        'stats': case.get('stats', {})
    }
    
    with open(case_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    return case_dir


def main():
    """Main processing function."""
    print("=" * 70)
    print("BraTS 2021 Dataset Processor for NeuroLens")
    print("=" * 70)
    print()
    
    # Step 1: Get dataset path
    print("[1/5] Locating downloaded dataset...")
    
    # Try to find kagglehub cache
    import kagglehub
    try:
        dataset_path = kagglehub.dataset_download("dschettler8845/brats-2021-task1")
        print(f"  Found dataset at: {dataset_path}")
    except Exception as e:
        print(f"  Error: {e}")
        print("\n  Please run this first:")
        print("    import kagglehub")
        print('    path = kagglehub.dataset_download("dschettler8845/brats-2021-task1")')
        print("    print(path)")
        print("\n  Then update this script with the path.")
        return
    
    # Step 2: Find all cases
    print("\n[2/5] Scanning for BraTS cases...")
    cases = find_brats_cases(dataset_path)
    print(f"  Found {len(cases)} valid cases")
    
    if len(cases) == 0:
        print("  ERROR: No valid cases found!")
        print(f"  Searched in: {dataset_path}")
        return
    
    # Step 3: Select best cases
    selected_cases = select_best_cases(cases, num_cases=7)
    
    if len(selected_cases) == 0:
        print("  ERROR: No cases with tumors found!")
        return
    
    # Step 4: Copy to project
    print("\n[3/5] Copying selected cases to project...")
    output_dir = Path("data/BraTS_cases")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    copied_cases = []
    for i, case in enumerate(selected_cases):
        print(f"  Copying case {i+1}/{len(selected_cases)}: {case['name']}")
        case_dir = copy_case_files(case, output_dir, i+1)
        copied_cases.append(str(case_dir))
    
    # Step 5: Copy first case to default location
    print("\n[4/5] Setting up default case...")
    default_dir = Path("data/BraTS")
    default_dir.mkdir(parents=True, exist_ok=True)
    
    first_case = selected_cases[0]
    shutil.copy2(first_case['flair'], default_dir / 'flair.nii.gz')
    shutil.copy2(first_case['seg'], default_dir / 'seg.nii.gz')
    print(f"  Default case: {first_case['name']}")
    
    # Step 6: Generate summary
    print("\n[5/5] Creating summary...")
    summary = {
        'dataset_path': dataset_path,
        'total_cases_found': len(cases),
        'cases_selected': len(selected_cases),
        'output_directory': str(output_dir),
        'default_case': first_case['name'],
        'cases': [
            {
                'number': i+1,
                'name': case['name'],
                'tumor_percentage': case['stats']['tumor_percentage'],
                'path': str(output_dir / f"case_{i+1:03d}")
            }
            for i, case in enumerate(selected_cases)
        ]
    }
    
    summary_path = output_dir / 'dataset_summary.json'
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"  Summary saved: {summary_path}")
    
    # Done!
    print("\n" + "=" * 70)
    print("✓ SUCCESS! Real BraTS data is ready")
    print("=" * 70)
    print()
    print("Next steps:")
    print("  1. Generate MRI slices:")
    print("     python src/krishmodel/backend/generate_mri_slices.py")
    print()
    print("  2. Start your app:")
    print("     npm run dev")
    print()
    print("  3. View real brain scans in Doctor Dashboard → 2D Slices")
    print()
    print(f"Cases available: {len(selected_cases)}")
    print(f"Location: {output_dir}")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nProcessing cancelled.")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
