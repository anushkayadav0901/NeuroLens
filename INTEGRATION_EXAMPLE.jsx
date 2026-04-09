// Example: How to integrate MRI Slice Viewer into Doctor Dashboard

import { useState } from 'react';
import DoctorNavbar from '../components/DoctorNavbar';
import UploadPanel from '../components/UploadPanel';
import ViewerPanel from '../components/ViewerPanel';
import MRISliceViewer from '../components/MRISliceViewer';
import SummaryPanel from '../components/SummaryPanel';
import ChatPanel from '../components/ChatPanel';
import { getCaseData } from '../utils/caseMapper';

function DoctorWithMRI() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [highlightTumor, setHighlightTumor] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisState, setAnalysisState] = useState('idle');
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setAnalysisState('idle');
    setHighlightTumor(true);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setAnalysisState('idle');
    setHighlightTumor(false);
  };

  const handleAnalyze = () => {
    if (uploadedFile && analysisState === 'idle') {
      setAnalysisState('analyzing');
      
      const processingTime = 2000 + Math.random() * 1000;
      
      setTimeout(() => {
        const caseData = getCaseData(uploadedFile);
        setAnalysisData(caseData);
        setAnalysisState('completed');
      }, processingTime);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      <DoctorNavbar />

      <main className="mx-auto max-w-[1800px] p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT SIDEBAR - Upload + Controls */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <UploadPanel
                fileName={uploadedFile?.name}
                onFileUpload={handleFileUpload}
                highlightTumor={highlightTumor}
                setHighlightTumor={setHighlightTumor}
                showWireframe={showWireframe}
                setShowWireframe={setShowWireframe}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                analysisState={analysisState}
              />
            </div>
          </div>

          {/* CENTER PANEL - Viewer (3D or 2D) */}
          <div className="lg:col-span-5">
            {/* View Mode Toggle */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === '3d'
                    ? 'bg-accent text-slate-950'
                    : 'border border-border bg-panel text-slate-300 hover:border-accent'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === '2d'
                    ? 'bg-accent text-slate-950'
                    : 'border border-border bg-panel text-slate-300 hover:border-accent'
                }`}
              >
                2D Slices
              </button>
            </div>

            {/* Viewer */}
            <div className="h-[600px] lg:h-[calc(100vh-180px)]">
              {viewMode === '3d' ? (
                <ViewerPanel 
                  showWireframe={showWireframe} 
                  analysisData={analysisData}
                  highlightTumor={highlightTumor}
                  analysisState={analysisState}
                />
              ) : (
                <MRISliceViewer />
              )}
            </div>
          </div>

          {/* RIGHT PANEL - Summary + Chat */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <SummaryPanel analysisData={analysisData} analysisState={analysisState} />
              <ChatPanel analysisData={analysisData} analysisState={analysisState} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorWithMRI;


// ============================================
// ALTERNATIVE: Side-by-side 3D + 2D
// ============================================

function DoctorSideBySide() {
  // ... same state as above ...

  return (
    <div className="min-h-screen bg-surface text-white">
      <DoctorNavbar />

      <main className="mx-auto max-w-[1800px] p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3">
            <UploadPanel {...props} />
          </div>

          {/* CENTER - 3D Viewer */}
          <div className="lg:col-span-4">
            <div className="h-[600px]">
              <ViewerPanel {...props} />
            </div>
          </div>

          {/* CENTER-RIGHT - 2D Slices */}
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              <MRISliceViewer />
            </div>
          </div>

          {/* RIGHT - Summary + Chat */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <SummaryPanel {...props} />
              <ChatPanel {...props} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// ============================================
// ALTERNATIVE: Tabbed View
// ============================================

function DoctorTabbed() {
  const [activeTab, setActiveTab] = useState('3d'); // '3d', '2d', 'analysis'

  return (
    <div className="min-h-screen bg-surface text-white">
      <DoctorNavbar />

      <main className="mx-auto max-w-[1400px] p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === '3d'
                ? 'border-b-2 border-accent text-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Visualization
          </button>
          <button
            onClick={() => setActiveTab('2d')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === '2d'
                ? 'border-b-2 border-accent text-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MRI Slices
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'analysis'
                ? 'border-b-2 border-accent text-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analysis
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-200px)]">
          {activeTab === '3d' && <ViewerPanel {...props} />}
          {activeTab === '2d' && <MRISliceViewer />}
          {activeTab === 'analysis' && (
            <div className="grid grid-cols-2 gap-6">
              <SummaryPanel {...props} />
              <ChatPanel {...props} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
