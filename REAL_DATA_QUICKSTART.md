# Real BraTS Data - Quick Start Guide

## You're downloading 13GB BraTS 2021 dataset ✓

Follow these steps to integrate real medical data into NeuroLens:

---

## Step 1: Download Dataset (You're doing this now)

```python
import kagglehub

# Download latest version (13GB - will take time)
path = kagglehub.dataset_download("dschettler8845/brats-2021-task1")
print("Path to dataset files:", path)
```

**This will download to:** `~/.cache/kagglehub/datasets/...`

**Time estimate:** 30-60 minutes depending on internet speed

---

## Step 2: Process Dataset

Once download completes, run:

```bash
pip install kagglehub nibabel numpy pillow

python process_brats_dataset.py
```

**What this does:**
- Scans all 1,251 cases in the dataset
- Analyzes tumor sizes
- Selects 7 diverse cases (small, medium, large tumors)
- Copies them to `data/BraTS_cases/`
- Sets up default case in `data/BraTS/`

**Output:**
```
data/
├── BraTS/
│   ├── flair.nii.gz  ← Default case (REAL DATA)
│   └── seg.nii.gz    ← Real tumor segmentation
└── BraTS_cases/
    ├── case_001/
    ├── case_002/
    ├── case_003/
    ├── case_004/
    ├── case_005/
    ├── case_006/
    └── case_007/
```

---

## Step 3: Generate MRI Slices

```bash
python src/krishmodel/backend/generate_mri_slices.py
```

**What this does:**
- Reads REAL BraTS NIfTI files
- Extracts 155 axial slices (full brain)
- Overlays REAL tumor segmentation
- Saves to `public/mri_slices/`

**Output:**
```
public/mri_slices/
├── metadata.json
├── slice_000.png  ← Real brain MRI
├── slice_001.png
├── ...
└── slice_154.png
```

---

## Step 4: View in App

```bash
npm run dev
```

1. Navigate to **Doctor Dashboard**
2. Click **"2D Slices"** button
3. See REAL brain scans with actual tumors!

---

## What You'll See

### Before (Fake Data)
- Synthetic sphere brain
- Fake blob tumor
- 64 slices
- Not realistic

### After (Real Data)
- Actual patient MRI
- Real glioblastoma tumor
- 155 slices
- Medical-grade quality
- Real anatomy visible

---

## Verify It's Real Data

Check file sizes:

```bash
# Fake data (current)
ls -lh data/BraTS/flair.nii.gz
# Output: ~33 KB (tiny = fake)

# Real data (after processing)
ls -lh data/BraTS/flair.nii.gz
# Output: ~7-10 MB (large = real)
```

Check dimensions:

```python
import nibabel as nib

img = nib.load('data/BraTS/flair.nii.gz')
print(img.shape)

# Fake: (64, 64, 64)
# Real: (240, 240, 155)
```

---

## Troubleshooting

### Download is slow
- 13GB takes time, be patient
- Check: `~/.cache/kagglehub/datasets/`

### "No module named kagglehub"
```bash
pip install kagglehub
```

### "No cases found"
- Make sure download completed
- Check the path printed by kagglehub
- Update `process_brats_dataset.py` if needed

### Slices look wrong
- Verify files are in `data/BraTS/`
- Check file size (should be ~7-10 MB each)
- Re-run `generate_mri_slices.py`

---

## Advanced: Use Different Cases

To switch between the 7 selected cases:

```bash
# Copy a different case
cp data/BraTS_cases/case_003/flair.nii.gz data/BraTS/
cp data/BraTS_cases/case_003/seg.nii.gz data/BraTS/

# Regenerate slices
python src/krishmodel/backend/generate_mri_slices.py

# Refresh app
npm run dev
```

---

## Summary

```
Download (30-60 min) → Process (5 min) → Generate Slices (2 min) → View in App
        ↓                    ↓                    ↓                    ↓
    13GB dataset      7 best cases      155 PNG slices      Real brain scans
```

**Total time:** ~45-70 minutes
**Result:** Production-ready medical imaging app with real data

---

## Need Help?

If you get stuck, share:
1. Output of `kagglehub.dataset_download()`
2. Contents of `data/BraTS/` folder
3. Any error messages

I'll help you debug!
