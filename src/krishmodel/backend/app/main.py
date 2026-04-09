"""
FastAPI backend for NeuroLens MRI slice viewer
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
import os

app = FastAPI(title="NeuroLens API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (MRI slices)
SLICE_DIR = Path("../../../public/mri_slices")
if SLICE_DIR.exists():
    app.mount("/mri_slices", StaticFiles(directory=str(SLICE_DIR)), name="mri_slices")


@app.get("/")
def read_root():
    return {
        "message": "NeuroLens API",
        "endpoints": [
            "/slices - Get MRI slice metadata",
            "/health - Health check"
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/slices")
def get_slices():
    """
    Get list of available MRI slices.
    
    Returns:
        {
            "total_slices": int,
            "images": [list of image URLs],
            "axis": "axial"
        }
    """
    metadata_path = SLICE_DIR / "metadata.json"
    
    if not metadata_path.exists():
        raise HTTPException(
            status_code=404,
            detail="MRI slices not found. Please run generate_mri_slices.py first."
        )
    
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    # Convert relative paths to URLs
    base_url = "/mri_slices"
    metadata["images"] = [f"{base_url}/{img}" for img in metadata["images"]]
    
    return metadata


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
