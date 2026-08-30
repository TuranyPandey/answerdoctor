import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Layers, Activity, Sparkles, X } from 'lucide-react';

export default function BatchUploadModal({ isOpen, onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const pipelineSteps = [
    "Batch Vision Agent: OCR Page cropping & text extraction...",
    "Diagram Preserver: Detecting free-body / circuit / P-V curve crops...",
    "Rubric Decomposer Agent: Aligning atomic units (Concept, Formula, Steps)...",
    "Semantic Alignment: sentence-transformers similarity matching (γ ≥ 0.60)...",
    "Malpractice Radar: Cross-clustering CMI cohort logic matrix..."
  ];

  const handleUpload = () => {
    setIsProcessing(true);
    let curr = 0;
    const interval = setInterval(() => {
      curr += 1;
      if (curr < pipelineSteps.length) {
        setStepIndex(curr);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          onComplete();
          onClose();
        }, 800);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Batch Script Ingestion</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isProcessing ? (
          <div className="space-y-4">
            <div 
              onClick={() => setFile({ name: 'Thermodynamics_CAT1_Batch_240Scripts.zip' })}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-slate-900"
            >
              <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-bounce" />
              <p className="text-xs font-bold text-white">Drop batch ZIP or scanned PDF scripts here</p>
              <p className="text-[11px] text-slate-400 mt-1">Supports multi-page ZIP files with student ID mappings</p>
              {file && (
                <div className="mt-4 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg inline-flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                Run Multi-Agent Pipeline
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Activity className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-1">Processing Batch Cohort</h4>
              <p className="text-xs text-emerald-400 font-mono font-medium">
                {pipelineSteps[stepIndex]}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / pipelineSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
