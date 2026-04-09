"""
download_sample_brats.py
-------------------------
Downloads a sample BraTS case for testing.
"""

import os
import urllib.request
import gzip
import shutil
from pathlib import Path


def download_file(url, output_path):
    """Download file with progress."""
    print(f"Downloading: {os.path.basename(output_path)}")
    
    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(downloaded * 100 / total_size, 100)
        print(f"\r  Progress: {percent:.1f}%", end='')
    
    urllib.request.urlretrieve(url, output_path, progress)
    print()  # New line after progress


def setup_sample_data():
    """
    Download sample BraTS data from public sources.
    
    Note: This downloads a small sample case for testing.
    For full dataset, visit:
    - https://www.kaggle.com/datasets/dschettler8845/brats-2021-task1
    - https://www.synapse.org/#!Synapse:syn25829067
    """
    
    print("=" * 60)
    print("BraTS Sample Data Downloader")
    print("=" * 60)
    print()
    
    # Create output directory
    output_dir = Path("data/BraTS")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("⚠️  IMPORTANT:")
    print("This script requires you to manually download BraTS data.")
    print()
    print("Automated download is not available due to:")
    print("  - BraTS requires registration and agreement to terms")
    print("  - Files are hosted on Synapse/Kaggle with authentication")
    print()
    print("=" * 60)
    print("MANUAL DOWNLOAD INSTRUCTIONS")
    print("=" * 60)
    print()
    print("Option 1: Kaggle (Recommended)")
    print("-" * 60)
    print("1. Install Kaggle CLI:")
    print("   pip install kaggle")
    print()
    print("2. Setup Kaggle API token:")
    print("   - Go to: https://www.kaggle.com/settings")
    print("   - Click 'Create New API Token'")
    print("   - Place kaggle.json in: ~/.kaggle/")
    print()
    print("3. Download dataset:")
    print("   kaggle datasets download -d dschettler8845/brats-2021-task1")
    print()
    print("4. Extract and copy files:")
    print("   - Extract the zip file")
    print("   - Find a case folder (e.g., BraTS2021_00001)")
    print("   - Copy *_flair.nii.gz to data/BraTS/flair.nii.gz")
    print("   - Copy *_seg.nii.gz to data/BraTS/seg.nii.gz")
    print()
    print()
    print("Option 2: Direct Download (Small Sample)")
    print("-" * 60)
    print("1. Visit: https://www.med.upenn.edu/cbica/brats2020/data.html")
    print("2. Download training data sample")
    print("3. Extract and copy files as above")
    print()
    print()
    print("Option 3: Use Hugging Face")
    print("-" * 60)
    print("1. Visit: https://huggingface.co/datasets/Spirit-26/BraTS-2024-Complete")
    print("2. Download a sample case")
    print("3. Extract and copy files")
    print()
    print("=" * 60)
    print()
    
    # Check if files already exist
    flair_path = output_dir / "flair.nii.gz"
    seg_path = output_dir / "seg.nii.gz"
    
    if flair_path.exists() and seg_path.exists():
        print("✓ BraTS files already exist!")
        print(f"  - {flair_path}")
        print(f"  - {seg_path}")
        print()
        
        # Check if they're real or fake
        import nibabel as nib
        try:
            img = nib.load(str(flair_path))
            data = img.get_fdata()
            print(f"  File info:")
            print(f"    Shape: {data.shape}")
            print(f"    Data range: [{data.min():.2f}, {data.max():.2f}]")
            
            # Simple heuristic: real BraTS data is usually 240x240x155
            if data.shape == (240, 240, 155):
                print("  ✓ Looks like REAL BraTS data!")
            elif data.shape == (64, 64, 64):
                print("  ⚠️  Looks like FAKE/SAMPLE data")
                print("     Consider replacing with real BraTS files")
            else:
                print(f"  ? Unknown data format (shape: {data.shape})")
        except Exception as e:
            print(f"  Error reading file: {e}")
    else:
        print("❌ No BraTS files found")
        print(f"   Expected location: {output_dir.absolute()}")
        print()
        print("Please follow the instructions above to download data.")
    
    print()
    print("=" * 60)
    print("After downloading, run:")
    print("  python src/krishmodel/backend/generate_mri_slices.py")
    print("=" * 60)


if __name__ == "__main__":
    try:
        setup_sample_data()
    except KeyboardInterrupt:
        print("\n\nDownload cancelled.")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
