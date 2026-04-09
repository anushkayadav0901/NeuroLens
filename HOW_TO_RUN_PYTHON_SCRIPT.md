# How to Generate 3D Brain Models (Windows)

## Quick Start Guide

### Step 1: Check if Python is Installed
Open Command Prompt (search "cmd" in Windows) and type:
```bash
python --version
```

If you see a version number (like Python 3.x.x), you're good! If not, download Python from [python.org](https://www.python.org/downloads/)

### Step 2: Install Required Libraries
In Command Prompt, run these commands one by one:
```bash
pip install numpy
pip install scipy
pip install scikit-image
```

### Step 3: Navigate to Your Project Folder
```bash
cd C:\Users\YourUsername\Downloads\neutrolens
```
(Replace with your actual project path)

### Step 4: Run the Script
```bash
python src/krishmodel/backend/generate_sample_data.py
```

### Step 5: Find Your Generated Files
The script will create:
- `sample_data/volume.npy` - Brain volume data
- `sample_data/mask.npy` - Tumor mask data
- `app/static/tumor.obj` - 3D tumor mesh (THIS IS WHAT YOU NEED!)
- `app/static/brain.obj` - 3D brain mesh

---

## Generate Different Tumor Models

To create different tumor shapes/positions, edit the script:

### Option 1: Change Random Seed (Easy)
Open `src/krishmodel/backend/generate_sample_data.py` and find line 62:
```python
np.random.seed(42)  # Change this number!
```

Change `42` to any other number:
- `np.random.seed(123)` - Different tumor shape
- `np.random.seed(999)` - Another variation
- `np.random.seed(555)` - Yet another variation

### Option 2: Change Tumor Location
Find line 54-56 in the script:
```python
cx, cy, cz = shape[2] * 0.35, shape[1] * 0.55, shape[0] * 0.50
```

Modify the multipliers:
- **Left temporal** (default): `0.35, 0.55, 0.50`
- **Right frontal**: `0.65, 0.45, 0.60`
- **Top parietal**: `0.50, 0.70, 0.55`

### Option 3: Change Tumor Size
Find line 59-61:
```python
dx = (x - cx) / 12.0
dy = (y - cy) / 10.0
dz = (z - cz) / 9.0
```

Make numbers smaller for larger tumor:
- Small tumor: `/ 15.0, / 13.0, / 12.0`
- Medium tumor (default): `/ 12.0, / 10.0, / 9.0`
- Large tumor: `/ 8.0, / 7.0, / 6.0`

---

## Quick Commands Reference

### Run script:
```bash
python src/krishmodel/backend/generate_sample_data.py
```

### Check if files were created:
```bash
dir app\static\*.obj
```

### Generate multiple versions:
1. Run script → saves to `app/static/tumor.obj`
2. Rename file: `move app\static\tumor.obj app\static\tumor_v1.obj`
3. Change seed in script
4. Run script again → saves new `tumor.obj`
5. Rename: `move app\static\tumor.obj app\static\tumor_v2.obj`
6. Repeat!

---

## Troubleshooting

### "python is not recognized"
- Install Python from python.org
- Make sure to check "Add Python to PATH" during installation

### "No module named 'numpy'"
- Run: `pip install numpy scipy scikit-image`

### "No such file or directory"
- Make sure you're in the correct folder
- Use `cd` command to navigate to project folder

### Script runs but no files appear
- Check if `app/static/` folder exists
- Script creates folders automatically, but check permissions

---

## What's Next?

Once you have `tumor.obj` and `brain.obj` files:
1. You can load them in Three.js (replace the sphere)
2. Use OBJLoader to import the meshes
3. Display real tumor geometry instead of placeholder sphere

The generated meshes are production-ready and look realistic!
