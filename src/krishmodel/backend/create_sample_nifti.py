"""
Create sample NIfTI files for demo purposes
"""

import numpy as np
import nibabel as nib
import os

def create_sample_brain_nifti():
    """Create a simple synthetic brain MRI volume."""
    print("Creating sample brain MRI...")
    
    # Create 3D volume (smaller for demo: 128x128x64)
    shape = (128, 128, 64)
    
    # Create brain-like structure
    z, y, x = np.mgrid[0:shape[0], 0:shape[1], 0:shape[2]]
    
    # Normalize coordinates
    zn = (z - shape[0] / 2) / (shape[0] / 2)
    yn = (y - shape[1] / 2) / (shape[1] / 2)
    xn = (x - shape[2] / 2) / (shape[2] / 2)
    
    # Create ellipsoid brain
    brain = (xn ** 2 / 0.7 + yn ** 2 / 0.85 + zn ** 2 / 0.75) < 1.0
    
    # Add intensity variations
    volume = brain.astype(np.float32) * 1000
    
    # Add internal structures
    inner = (xn ** 2 / 0.5 + yn ** 2 / 0.6 + zn ** 2 / 0.55) < 1.0
    volume[inner] = 700
    
    core = (xn ** 2 / 0.25 + yn ** 2 / 0.3 + zn ** 2 / 0.28) < 1.0
    volume[core] = 400
    
    # Add noise
    noise = np.random.normal(0, 50, shape).astype(np.float32)
    volume = volume + noise * brain
    volume = np.clip(volume, 0, 1000)
    
    return volume

def create_sample_tumor_nifti(shape):
    """Create a sample tumor segmentation mask."""
    print("Creating sample tumor segmentation...")
    
    z, y, x = np.mgrid[0:shape[0], 0:shape[1], 0:shape[2]]
    
    # Tumor in left temporal region
    cx, cy, cz = shape[0] * 0.35, shape[1] * 0.55, shape[2] * 0.50
    
    # Create irregular tumor
    dx = (x - cx) / 12.0
    dy = (y - cy) / 10.0
    dz = (z - cz) / 9.0
    
    tumor = (dx ** 2 + dy ** 2 + dz ** 2) < 1.0
    
    # Add second smaller tumor
    cx2, cy2, cz2 = shape[0] * 0.65, shape[1] * 0.45, shape[2] * 0.60
    dx2 = (x - cx2) / 8.0
    dy2 = (y - cy2) / 7.0
    dz2 = (z - cz2) / 6.0
    
    tumor2 = (dx2 ** 2 + dy2 ** 2 + dz2 ** 2) < 1.0
    
    # Combine tumors (label 1)
    seg = tumor.astype(np.uint8)
    seg[tumor2] = 1
    
    return seg

def main():
    print("=" * 60)
    print("Creating Sample NIfTI Files for Demo")
    print("=" * 60)
    
    # Create output directory
    os.makedirs("data/BraTS", exist_ok=True)
    
    # Create brain volume
    brain_volume = create_sample_brain_nifti()
    
    # Create tumor segmentation
    tumor_seg = create_sample_tumor_nifti(brain_volume.shape)
    
    # Create NIfTI images
    print("\nSaving NIfTI files...")
    
    # Brain MRI (flair)
    brain_img = nib.Nifti1Image(brain_volume, np.eye(4))
    nib.save(brain_img, "data/BraTS/flair.nii.gz")
    print(f"  ✓ Saved: data/BraTS/flair.nii.gz")
    print(f"    Shape: {brain_volume.shape}")
    
    # Tumor segmentation
    seg_img = nib.Nifti1Image(tumor_seg, np.eye(4))
    nib.save(seg_img, "data/BraTS/seg.nii.gz")
    print(f"  ✓ Saved: data/BraTS/seg.nii.gz")
    print(f"    Shape: {tumor_seg.shape}")
    print(f"    Tumor voxels: {np.sum(tumor_seg)}")
    
    print("\n" + "=" * 60)
    print("Sample data created successfully!")
    print("=" * 60)
    print("\nNext step: Run generate_mri_slices.py")

if __name__ == "__main__":
    main()
