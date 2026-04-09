import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

function MRISliceViewer() {
  const [slices, setSlices] = useState([]);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [totalSlices, setTotalSlices] = useState(0);
  const [showTumor, setShowTumor] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSlices();
  }, []);

  const fetchSlices = async () => {
    try {
      // Try to load from local metadata first
      const metadataResponse = await fetch('/mri_slices/metadata.json');
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        const imageUrls = metadata.images.map(img => `/mri_slices/${img}`);
        setSlices(imageUrls);
        setTotalSlices(metadata.total_slices);
        setCurrentSlice(Math.floor(metadata.total_slices / 2));
        setLoading(false);
        return;
      }

      // Fallback to backend if local files not found
      const response = await fetch('http://localhost:8000/slices');
      if (!response.ok) {
        throw new Error('Failed to load MRI slices');
      }
      const data = await response.json();
      setSlices(data.images);
      setTotalSlices(data.total_slices);
      setCurrentSlice(Math.floor(data.total_slices / 2));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSliceChange = (e) => {
    setCurrentSlice(parseInt(e.target.value));
  };

  const nextSlice = () => {
    if (currentSlice < totalSlices - 1) {
      setCurrentSlice(currentSlice + 1);
    }
  };

  const prevSlice = () => {
    if (currentSlice > 0) {
      setCurrentSlice(currentSlice - 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowLeft') prevSlice();
    if (e.key === 'ArrowRight') nextSlice();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlice]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-panel p-6">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-slate-400">Loading MRI slices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-panel p-6">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <p className="text-xs text-slate-500">
            Make sure MRI slices are in public/mri_slices/ or backend is running on port 8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-gradient-to-br from-panel to-panel/50 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">MRI Slice Viewer</h2>
          <p className="text-xs text-slate-400">Axial View</p>
        </div>
        
        {/* Tumor Toggle */}
        <button
          onClick={() => setShowTumor(!showTumor)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
            showTumor
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border bg-surface text-slate-400 hover:border-accent/50'
          }`}
        >
          {showTumor ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>{showTumor ? 'Hide' : 'Show'} Tumor</span>
        </button>
      </div>

      {/* Image Display */}
      <div className="relative mb-4 flex-1 overflow-hidden rounded-lg border border-border bg-black">
        {slices[currentSlice] && (
          <img
            src={slices[currentSlice]}
            alt={`MRI Slice ${currentSlice}`}
            className={`h-full w-full object-contain transition-opacity duration-200 ${
              showTumor ? 'opacity-100' : 'opacity-100'
            }`}
            style={{
              filter: showTumor ? 'none' : 'grayscale(100%)',
              imageRendering: 'crisp-edges'
            }}
          />
        )}
        
        {/* Slice indicator overlay */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-accent/30 bg-black/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Slice</p>
          <p className="text-lg font-semibold text-white">
            {currentSlice + 1} / {totalSlices}
          </p>
        </div>

        {/* Glow effect on tumor */}
        {showTumor && (
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(255,0,0,0.1)]" />
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Slider */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlice}
            disabled={currentSlice === 0}
            className="rounded-lg border border-border bg-surface p-2 text-slate-300 transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          <input
            type="range"
            min="0"
            max={totalSlices - 1}
            value={currentSlice}
            onChange={handleSliceChange}
            className="flex-1 accent-accent"
            style={{
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${(currentSlice / (totalSlices - 1)) * 100}%, #1f2937 ${(currentSlice / (totalSlices - 1)) * 100}%, #1f2937 100%)`
            }}
          />

          <button
            onClick={nextSlice}
            disabled={currentSlice === totalSlices - 1}
            className="rounded-lg border border-border bg-surface p-2 text-slate-300 transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Use arrow keys to navigate</span>
          <span>{totalSlices} slices loaded</span>
        </div>
      </div>
    </div>
  );
}

export default MRISliceViewer;
