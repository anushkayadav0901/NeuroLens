@echo off
echo ========================================
echo NeuroLens - Real BraTS Data Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python first
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
pip show nibabel >nul 2>&1
if errorlevel 1 (
    echo Installing nibabel...
    pip install nibabel numpy pillow
) else (
    echo Dependencies OK
)

echo.
echo [2/4] Checking for BraTS data files...
if not exist "data\BraTS\flair.nii.gz" (
    echo.
    echo ERROR: flair.nii.gz not found!
    echo.
    echo Please download BraTS dataset and place files in:
    echo   data\BraTS\flair.nii.gz
    echo   data\BraTS\seg.nii.gz
    echo.
    echo Download from:
    echo   - Kaggle: https://www.kaggle.com/datasets/dschettler8845/brats-2021-task1
    echo   - Official: https://www.synapse.org/#!Synapse:syn25829067
    echo.
    pause
    exit /b 1
)

if not exist "data\BraTS\seg.nii.gz" (
    echo ERROR: seg.nii.gz not found!
    pause
    exit /b 1
)

echo Found BraTS files!
echo   - flair.nii.gz
echo   - seg.nii.gz

echo.
echo [3/4] Generating MRI slices from real data...
python src\krishmodel\backend\generate_mri_slices.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to generate slices
    pause
    exit /b 1
)

echo.
echo [4/4] Verifying output...
if exist "public\mri_slices\metadata.json" (
    echo SUCCESS! Real MRI slices generated
    echo.
    echo Output location: public\mri_slices\
    echo.
    echo Next steps:
    echo   1. Run: npm run dev
    echo   2. Open Doctor Dashboard
    echo   3. Click "2D Slices" button
    echo   4. View REAL brain scans!
) else (
    echo ERROR: Slices not generated properly
)

echo.
echo ========================================
pause
