@echo off
echo ========================================
echo NeuroLens - Real BraTS Data Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    pause
    exit /b 1
)

echo [Step 1/3] Installing dependencies...
pip install kagglehub nibabel numpy pillow -q

echo.
echo [Step 2/3] Processing BraTS dataset...
echo This will:
echo   - Find downloaded BraTS cases
echo   - Select 7 diverse cases with tumors
echo   - Copy to data/BraTS_cases/
echo   - Setup default case
echo.
python process_brats_dataset.py

if errorlevel 1 (
    echo.
    echo ERROR: Processing failed
    echo.
    echo Make sure you've downloaded the dataset first:
    echo   python -c "import kagglehub; print(kagglehub.dataset_download('dschettler8845/brats-2021-task1'))"
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Generating MRI slices...
python src\krishmodel\backend\generate_mri_slices.py

if errorlevel 1 (
    echo ERROR: Slice generation failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Real BraTS data is ready
echo ========================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open Doctor Dashboard
echo   3. Click "2D Slices" button
echo   4. View REAL brain scans!
echo.
echo Cases available: 7
echo Location: data/BraTS_cases/
echo Slices: public/mri_slices/
echo.
pause
