# 🚀 Quick Start - MRI Slice Viewer

## ⚡ Fast Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
pip install nibabel numpy pillow fastapi uvicorn
```

### 2️⃣ Get BraTS Data
Download sample from: https://www.med.upenn.edu/cbica/brats2020/

Place in:
```
data/BraTS/
├── flair.nii.gz
└── seg.nii.gz
```

### 3️⃣ Generate Slices
```bash
python src/krishmodel/backend/generate_mri_slices.py
```

### 4️⃣ Start Backend
```bash
cd src/krishmodel/backend/app
python main.py
```

### 5️⃣ Add to React
```javascript
import MRISliceViewer from '../components/MRISliceViewer';

// In your component:
<MRISliceViewer />
```

### 6️⃣ Start Frontend
```bash
npm run dev
```

## ✅ Done!

Navigate to your app and see the MRI slice viewer in action!

## 🎮 Controls

- **Slider**: Scroll through slices
- **Arrow Keys**: Navigate (← →)
- **Toggle Button**: Show/hide tumor overlay

## 📸 What You Get

- Grayscale MRI slices
- Red tumor overlay
- Smooth transitions
- Professional medical UI
- Real-time slice navigation

## 🔧 Troubleshooting

**Backend not starting?**
```bash
pip install fastapi uvicorn
```

**Slices not loading?**
- Check `public/mri_slices/` folder exists
- Verify `metadata.json` is present
- Ensure backend is running on port 8000

**CORS errors?**
- Backend already configured for localhost:5173, 5174, 3000
- Check browser console for specific error

## 💡 Tips

- Start at middle slice (automatically done)
- Use keyboard for faster navigation
- Toggle tumor to see MRI clearly
- Combine with 3D viewer for complete view

---

**Need help?** Check `MRI_SLICE_VIEWER_SETUP.md` for detailed instructions.
