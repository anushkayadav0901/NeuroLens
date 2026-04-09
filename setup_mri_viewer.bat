@echo off
echo ========================================
echo NeuroLens - MRI Slice Viewer Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo [1/3] Installing Python dependencies...
pip install nibabel numpy pillow fastapi uvicorn --quiet

echo.
echo [2/3] Checking for BraTS data...
if not exist "data\BraTS\flair.nii.gz" (
    echo WARNING: BraTS data not found!
    echo Please place your files in: data\BraTS\
    echo   - flair.nii.gz
    echo   - seg.nii.gz
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Generating MRI slices...
python src\krishmodel\backend\generate_mri_slices.py

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: python src\krishmodel\backend\app\main.py
echo 2. Start frontend: npm run dev
echo 3. Open browser and navigate to MRI viewer
echo.
pause
