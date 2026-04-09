# NeuroLens - Real BraTS Data Integration

## 🎯 Goal
Replace fake synthetic data with real BraTS 2021 medical imaging dataset.

## 📊 Current Status
- ✅ Download script running (13GB BraTS 2021)
- ⏳ Waiting for download to complete
- ⏳ Processing pipeline ready
- ⏳ Integration scripts ready

---

## 🚀 Quick Start (After Download)

### Option 1: Automated (Recommended)
```bash
setup_real_brats.bat
```

### Option 2: Manual Steps
```bash
# Step 1: Process dataset
python process_brats_dataset.py

# Step 2: Generate slices
python src/krishmodel/backend/generate_mri_slices.py

# Step 3: Start app
npm run dev
```

---

## 📁 What You're Downloading

**Dataset**: BraTS 2021 Task 1
- **Size**: 13 GB
- **Cases**: 1,251 patients
- **Type**: Glioblastoma (brain tumor) MRI scans
- **Quality**: Medical research grade
- **Annotations**: Expert radiologists

**Each case contains**:
- `*_flair.nii.gz` - FLAIR MRI sequence
- `*_t1.nii.gz` - T1 MRI sequence
- `*_t1ce.nii.gz` - T1 contrast-enhanced
- `*_t2.nii.gz` - T2 MRI sequence
- `*_seg.nii.gz` - Tumor segmentation mask

---

## 🔄 Processing Pipeline

```
Download (kagglehub)
    ↓
1,251 BraTS cases
    ↓
process_brats_dataset.py
    ↓
Select 7 best cases
    ↓
Copy to data/BraTS_cases/
    ↓
generate_mri_slices.py
    ↓
155 PNG slices
    ↓
public/mri_slices/
    ↓
View in React app
```

---

## 📂 Output Structure

```
data/
├── BraTS/                          ← Default case
│   ├── flair.nii.gz               (7-10 MB)
│   └── seg.nii.gz                 (7-10 MB)
│
└── BraTS_cases/                    ← 7 selected cases
    ├── case_001/
    │   ├── flair.nii.gz
    │   ├── seg.nii.gz
    │   └── metadata.json
    ├── case_002/
    ├── case_003/
    ├── case_004/
    ├── case_005/
    ├── case_006/
    ├── case_007/
    └── dataset_summary.json

public/
└── mri_slices/                     ← Generated slices
    ├── metadata.json
    ├── slice_000.png
    ├── slice_001.png
    └── ... (155 total)
```

---

## 🔍 Verification

### Check if you have real data:

```python
import nibabel as nib
import os

# Check file size
size = os.path.getsize('data/BraTS/flair.nii.gz') / (1024**2)
print(f"Size: {size:.2f} MB")

# Check dimensions
img = nib.load('data/BraTS/flair.nii.gz')
print(f"Shape: {img.shape}")

# Verdict
if size < 1 and img.shape == (64, 64, 64):
    print("❌ FAKE DATA (synthetic)")
elif size > 5 and img.shape == (240, 240, 155):
    print("✅ REAL DATA (BraTS)")
```

---

## 📊 Comparison

| Metric | Fake (Before) | Real (After) |
|--------|---------------|--------------|
| File Size | 33 KB | 7-10 MB |
| Dimensions | 64³ | 240×240×155 |
| Slices | 64 | 155 |
| Source | Python script | Patient MRI |
| Quality | Synthetic | Medical-grade |
| Realism | 0/10 | 10/10 |

---

## 🛠️ Scripts Created

### Processing
- `process_brats_dataset.py` - Main processing script
- `setup_real_brats.bat` - Automated setup (Windows)
- `download_sample_brats.py` - Helper/info script

### Generation
- `generate_mri_slices.py` - Extract PNG slices (already exists)

### Documentation
- `REAL_DATA_QUICKSTART.md` - Step-by-step guide
- `REAL_DATA_SETUP.md` - Detailed setup
- `FAKE_VS_REAL_DATA.md` - Comparison
- `DOWNLOAD_INSTRUCTIONS.txt` - Quick reference
- `README_REAL_DATA.md` - This file

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Download dataset | 30-60 min | ⏳ In Progress |
| Process dataset | 5 min | ⏳ Waiting |
| Generate slices | 2 min | ⏳ Waiting |
| View in app | Instant | ⏳ Waiting |
| **Total** | **~45-70 min** | |

---

## 🎨 What Changes in Your App

### 3D Viewer
- No changes needed
- Still uses OBJ models from `public/models/`

### 2D Slice Viewer
- **Before**: 64 slices of synthetic sphere
- **After**: 155 slices of real brain MRI
- **Tumor**: Real glioblastoma segmentation
- **Quality**: Medical-grade visualization

---

## 🐛 Troubleshooting

### Download Issues
```bash
# Check download location
python -c "import kagglehub; print(kagglehub.dataset_download('dschettler8845/brats-2021-task1'))"

# Typical location: ~/.cache/kagglehub/datasets/...
```

### Processing Issues
```bash
# Install dependencies
pip install kagglehub nibabel numpy pillow

# Run with verbose output
python process_brats_dataset.py
```

### Slice Generation Issues
```bash
# Check files exist
dir data\BraTS\*.nii.gz

# Check file sizes (should be ~7-10 MB each)
# If small (~33 KB), still using fake data

# Regenerate
python src\krishmodel\backend\generate_mri_slices.py
```

---

## 🎯 Success Criteria

You'll know it worked when:

1. ✅ Files in `data/BraTS/` are 7-10 MB each
2. ✅ Dimensions are 240×240×155 (not 64³)
3. ✅ 155 slices generated (not 64)
4. ✅ Slices show real brain anatomy
5. ✅ Tumor looks irregular (not a blob)
6. ✅ App displays medical-grade visualization

---

## 📞 Need Help?

If stuck, provide:
1. Output of kagglehub download
2. File sizes: `dir data\BraTS\*.nii.gz`
3. Error messages
4. Screenshot of slice viewer

---

## 🎉 Next Steps After Setup

1. **Test with different cases**
   ```bash
   # Switch to case 3
   copy data\BraTS_cases\case_003\*.nii.gz data\BraTS\
   python src\krishmodel\backend\generate_mri_slices.py
   ```

2. **Integrate with 3D viewer**
   - Generate 3D tumor meshes from real segmentation
   - Update `generate_sample_data.py` to use real data

3. **Add more features**
   - Multiple view planes (axial, coronal, sagittal)
   - Measurement tools
   - Comparison mode (before/after)

4. **Deploy**
   - Your app now has real medical data
   - Ready for demos, hackathons, portfolio

---

## 📚 Resources

- **BraTS Challenge**: https://www.synapse.org/brats
- **Dataset Paper**: https://arxiv.org/abs/2107.02314
- **NIfTI Format**: https://nifti.nimh.nih.gov/
- **Nibabel Docs**: https://nipy.org/nibabel/

---

## ✅ Checklist

- [x] Download script running
- [ ] Download complete
- [ ] Dataset processed
- [ ] Slices generated
- [ ] Verified real data
- [ ] Tested in app
- [ ] Ready for demo

---

**Status**: Waiting for download to complete...
**Next**: Run `setup_real_brats.bat` or `process_brats_dataset.py`
