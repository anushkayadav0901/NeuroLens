import { useState } from 'react';
import DoctorNavbar from '../components/DoctorNavbar';
import UploadPanel from '../components/UploadPanel';
import ViewerPanel from '../components/ViewerPanel';
import MRISliceViewer from '../components/MRISliceViewer';
import SummaryPanel from '../components/SummaryPanel';
import ChatPanel from '../components/ChatPanel';
import { getCaseData } from '../utils/caseMapper';

function Doctor() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [highlightTumor, setHighlightTumor] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisState, setAnalysisState] = useState('idle');
  const [viewMode, setViewMode] = useState('3d');

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
        {/* 3-Column Grid Layout */}
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

export default Doctor;
