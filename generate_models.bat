@echo off
echo ========================================
echo NeuroLens - Generate 3D Models
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from python.org
    pause
    exit /b 1
)

echo Python found!
echo.

REM Install dependencies
echo Installing required libraries...
pip install numpy scipy scikit-image --quiet
echo.

REM Run the script
echo Generating 3D models...
python src/krishmodel/backend/generate_sample_data.py

echo.
echo ========================================
echo Done! Check these folders:
echo - sample_data/
echo - app/static/
echo ========================================
pause
