"""
generate_mri_slices.py
----------------------
Extracts 2D slices from BraTS .nii.gz files and overlays tumor segmentation.
Outputs PNG images for web display.
"""

import numpy as np
import nibabel as nib
from PIL import Image
import os
from pathlib import Path


def normalize_slice(slice_data):
    """Normalize MRI slice to 0-255 range."""
    slice_min = np.min(slice_data)
    slice_max = np.max(slice_data)
    
    if slice_max - slice_min == 0:
        return np.zeros_like(slice_data, dtype=np.uint8)
    
    normalized = ((slice_data - slice_min) / (slice_max - slice_min) * 255)
    return normalized.astype(np.uint8)


def create_tumor_overlay(mri_slice, seg_slice, tumor_color=(255, 0, 0), alpha=0.5):
    """
    Create RGB image with tumor overlay.
    
    Args:
        mri_slice: Grayscale MRI slice (2D array)
        seg_slice: Binary segmentation mask (2D array)
        tumor_color: RGB tuple for tumor color
        alpha: Transparency of overlay (0-1)
    
    Returns:
        RGB image as numpy array
    """
    # Normalize MRI to 0-255
    mri_normalized = normalize_slice(mri_slice)
    
    # Create RGB image from grayscale
    rgb_image = np.stack([mri_normalized] * 3, axis=-1)
    
    # Create tumor mask (any non-zero value is tumor)
    tumor_mask = seg_slice > 0
    
    # Apply red overlay where tumor exists
    if np.any(tumor_mask):
        rgb_image[tumor_mask] = (
            rgb_image[tumor_mask] * (1 - alpha) + 
            np.array(tumor_color) * alpha
        ).astype(np.uint8)
    
    return rgb_image


def extract_slices(flair_path, seg_path, output_dir, axis=2):
    """
    Extract axial slices from NIfTI files and save as PNG.
    
    Args:
        flair_path: Path to flair.nii.gz (MRI)
        seg_path: Path to seg.nii.gz (segmentation)
        output_dir: Directory to save output images
        axis: Slice axis (0=sagittal, 1=coronal, 2=axial)
    
    Returns:
        List of output file paths
    """
    print("=" * 60)
    print("MRI Slice Extraction")
    print("=" * 60)
    
    # Load NIfTI files
    print(f"\n[1/4] Loading MRI data...")
    flair_img = nib.load(flair_path)
    flair_data = flair_img.get_fdata()
    print(f"  MRI shape: {flair_data.shape}")
    
    print(f"\n[2/4] Loading segmentation mask...")
    seg_img = nib.load(seg_path)
    seg_data = seg_img.get_fdata()
    print(f"  Segmentation shape: {seg_data.shape}")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Get number of slices along specified axis
    num_slices = flair_data.shape[axis]
    print(f"\n[3/4] Extracting {num_slices} slices along axis {axis}...")
    
    output_files = []
    
    for i in range(num_slices):
        # Extract slice
        if axis == 0:
            mri_slice = flair_data[i, :, :]
            seg_slice = seg_data[i, :, :]
        elif axis == 1:
            mri_slice = flair_data[:, i, :]
            seg_slice = seg_data[:, i, :]
        else:  # axis == 2 (axial)
            mri_slice = flair_data[:, :, i]
            seg_slice = seg_data[:, :, i]
        
        # Rotate for correct orientation (axial view)
        mri_slice = np.rot90(mri_slice)
        seg_slice = np.rot90(seg_slice)
        
        # Create overlay
        rgb_image = create_tumor_overlay(mri_slice, seg_slice)
        
        # Save as PNG
        output_path = os.path.join(output_dir, f"slice_{i:03d}.png")
        img = Image.fromarray(rgb_image)
        img.save(output_path)
        
        output_files.append(output_path)
        
        if (i + 1) % 20 == 0:
            print(f"  Processed {i + 1}/{num_slices} slices...")
    
    print(f"\n[4/4] Complete! Saved {len(output_files)} slices to {output_dir}")
    print("=" * 60)
    
    return output_files


def generate_slice_metadata(output_files):
    """Generate metadata JSON for frontend."""
    import json
    
    metadata = {
        "total_slices": len(output_files),
        "images": [os.path.basename(f) for f in output_files],
        "axis": "axial"
    }
    
    metadata_path = os.path.join(os.path.dirname(output_files[0]), "metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nMetadata saved: {metadata_path}")
    return metadata


if __name__ == "__main__":
    # Example usage
    # Update these paths to your BraTS data location
    
    # Option 1: Use sample data (if you have it)
    flair_path = "data/BraTS/flair.nii.gz"
    seg_path = "data/BraTS/seg.nii.gz"
    output_dir = "public/mri_slices"
    
    # Check if files exist
    if not os.path.exists(flair_path):
        print(f"ERROR: {flair_path} not found!")
        print("\nPlease update the paths in this script to point to your BraTS data.")
        print("Expected files:")
        print("  - flair.nii.gz (MRI scan)")
        print("  - seg.nii.gz (tumor segmentation)")
        print("\nTo get real BraTS data:")
        print("  1. Download: python -c \"import kagglehub; print(kagglehub.dataset_download('dschettler8845/brats-2021-task1'))\"")
        print("  2. Process: python process_brats_dataset.py")
        print("  3. Run this script again")
        exit(1)
    
    # Check file size to detect fake vs real data
    file_size = os.path.getsize(flair_path) / (1024 * 1024)  # MB
    
    print(f"\nFile size: {file_size:.2f} MB")
    if file_size < 1:
        print("⚠️  WARNING: This looks like FAKE/SAMPLE data (file too small)")
        print("   Real BraTS files are typically 7-10 MB")
        print("   Consider using real data for better results")
        print()
    else:
        print("✓ File size looks good (likely real BraTS data)")
        print()
    
    # Extract slices
    output_files = extract_slices(flair_path, seg_path, output_dir, axis=2)
    
    # Generate metadata
    metadata = generate_slice_metadata(output_files)
    
    print(f"\n✓ Ready for frontend!")
    print(f"  Total slices: {metadata['total_slices']}")
    print(f"  Output directory: {output_dir}")
    print(f"  Data type: {'REAL' if file_size > 1 else 'FAKE/SAMPLE'}")
