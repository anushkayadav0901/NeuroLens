# MRI Slice Viewer Setup Guide

## 📋 Overview

This adds a 2D MRI slice viewer with tumor overlay to your NeuroLens app.

## 🔧 Requirements

### Python Dependencies
```bash
pip install nibabel numpy pillow fastapi uvicorn
```

### BraTS Dataset
You need two files:
- `flair.nii.gz` - MRI scan
- `seg.nii.gz` - Tumor segmentation mask

Download from: https://www.med.upenn.edu/cbica/brats2020/data.html

## 📁 Setup Steps

### Step 1: Prepare Data

1. Create data directory:
```bash
mkdir -p data/BraTS
```

2. Place your BraTS files:
```
data/BraTS/
├── flair.nii.gz
└── seg.nii.gz
```

### Step 2: Generate Slices

Run the Python script:
```bash
python src/krishmodel/backend/generate_mri_slices.py
```

This will:
- Load NIfTI files
- Extract axial slices
- Overlay tumor segmentation (red)
- Save to `public/mri_slices/`
- Generate `metadata.json`

Output:
```
public/mri_slices/
├── slice_000.png
├── slice_001.png
├── ...
├── slice_154.png
└── metadata.json
```

### Step 3: Start Backend

```bash
cd src/krishmodel/backend/app
python main.py
```

Backend runs on: http://localhost:8000

Test endpoint: http://localhost:8000/slices

### Step 4: Add to React

Update your Doctor.jsx or create new page:

```javascript
import MRISliceViewer from '../components/MRISliceViewer';

// In your component:
<MRISliceViewer />
```

### Step 5: Start Frontend

```bash
npm run dev
```

## 🎨 Features

✅ Scroll through brain slices
✅ Red tumor overlay
✅ Toggle tumor visibility
✅ Keyboard navigation (arrow keys)
✅ Smooth transitions
✅ Dark medical UI
✅ Slice counter
✅ Professional styling

## 🔍 API Endpoints

### GET /slices
Returns:
```json
{
  "total_slices": 155,
  "images": [
    "/mri_slices/slice_000.png",
    "/mri_slices/slice_001.png",
    ...
  ],
  "axis": "axial"
}
```

### GET /health
Returns:
```json
{
  "status": "healthy"
}
```

## 🎯 Usage

1. **Navigate slices**: Use slider or arrow keys
2. **Toggle tumor**: Click "Show/Hide Tumor" button
3. **View info**: Slice number shown in bottom-left

## 🐛 Troubleshooting

### "MRI slices not found"
- Run `generate_mri_slices.py` first
- Check `public/mri_slices/` exists
- Verify `metadata.json` is present

### "Failed to load MRI slices"
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`
- Verify frontend can reach backend

### "Module not found: nibabel"
```bash
pip install nibabel numpy pillow
```

### Images not displaying
- Check browser console for errors
- Verify image paths in metadata.json
- Ensure static files are mounted correctly

## 📊 Customization

### Change tumor color
In `generate_mri_slices.py`:
```python
tumor_color=(255, 0, 0)  # Red (default)
tumor_color=(0, 255, 0)  # Green
tumor_color=(255, 255, 0)  # Yellow
```

### Change overlay transparency
```python
alpha=0.5  # 50% transparent (default)
alpha=0.7  # More opaque
alpha=0.3  # More transparent
```

### Extract different axis
```python
extract_slices(flair_path, seg_path, output_dir, axis=2)
# axis=0: Sagittal
# axis=1: Coronal
# axis=2: Axial (default)
```

## 🚀 Integration Example

Add to Doctor Dashboard:

```javascript
// Doctor.jsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* 3D Viewer */}
  <div className="h-[600px]">
    <ViewerPanel {...props} />
  </div>
  
  {/* 2D Slice Viewer */}
  <div className="h-[600px]">
    <MRISliceViewer />
  </div>
</div>
```

## ✨ Result

You now have a professional MRI slice viewer that:
- Displays real medical imaging data
- Shows tumor segmentation overlay
- Provides smooth navigation
- Looks like real radiology software

Perfect for demos and presentations! 🎉
