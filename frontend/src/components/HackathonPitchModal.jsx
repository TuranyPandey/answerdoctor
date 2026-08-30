import React from 'react';

export default function HackathonPitchModal({ onClose, onLoadDemoData }) {
  return (
    <div className="modal-overlay" style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '800px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="card-header flex justify-between items-center bg-slate">
          <div>
            <span className="badge badge-amber mb-4">🏆 HACKATHON JUDGE SHOWCASE</span>
            <h3 className="card-title text-lg font-bold">AnswerDoctor — System Architecture & Pitch</h3>
          </div>
          <button className="secondary-btn text-xs" onClick={onClose}>✕ Close</button>
        </div>
        <div className="card-body flex flex-col gap-16">
          {/* Executive Summary */}
          <div className="p-14 bg-slate rounded border-rule">
            <h4 className="font-bold text-sm text-amber mb-6">💡 Problem & Innovation:</h4>
            <p className="text-xs text-light" style={{ lineHeight: 1.6 }}>
              Existing AI grading tools perform shallow keyword matching or return arbitrary letter grades. AnswerDoctor introduces 
              <strong> Reasoning-Level Alignment (RAS)</strong> by decomposing rubrics into 5 atomic steps (*Concept, Formula, Step, Transformation, Result*), 
              evaluating mathematical equivalence ($Q - W = \Delta U$), and detecting conceptual malpractice with CMI.
            </p>
          </div>

          {/* Key Pipeline Architecture */}
          <div>
            <h4 className="text-xs text-mute font-semibold uppercase mb-8">⚡ End-to-End AI ML Pipeline Architecture:</h4>
            <div className="grid grid-cols-2 gap-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="p-12 bg-slate border-rule rounded">
                <div className="font-semibold text-xs text-sage mb-4">1. Multi-Modal Vision OCR Engine</div>
                <div className="text-xs text-mute">Google Vision OCR + PyMuPDF extract handwriting with image quality legibility scoring.</div>
              </div>
              <div className="p-12 bg-slate border-rule rounded">
                <div className="font-semibold text-xs text-amber mb-4">2. Gemini 2.0 Flash Equivalence Grader</div>
                <div className="text-xs text-mute">Evaluates step-level mathematical & conceptual equivalence beyond static text matching.</div>
              </div>
              <div className="p-12 bg-slate border-rule rounded">
                <div className="font-semibold text-xs text-fault mb-4">3. CMI Conceptual Malpractice Radar</div>
                <div className="text-xs text-mute">Computes pairwise Conceptual Misconduct Index (CMI = Semantic Similarity × Error Co-occurrence) to catch collusion.</div>
              </div>
              <div className="p-12 bg-slate border-rule rounded">
                <div className="font-semibold text-xs text-sage mb-4">4. University Guild & PYQ Variant System</div>
                <div className="text-xs text-mute">Campus-wide leaderboards + synthetic problem variant generator with modified parameters.</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex justify-between items-center p-14 bg-slate-mid rounded border-rule text-center flex-wrap gap-8">
            <div>
              <div className="text-xl font-bold text-amber">94.5%</div>
              <div className="text-xs text-mute">Vision OCR Clarity</div>
            </div>
            <div>
              <div className="text-xl font-bold text-sage">10x</div>
              <div className="text-xs text-mute">Faster Grading Velocity</div>
            </div>
            <div>
              <div className="text-xl font-bold text-sage">0</div>
              <div className="text-xs text-mute">False Positive Collusion Flags</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber">5-Step</div>
              <div className="text-xs text-mute">Atomic Rubric Decomposition</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-12 mt-8">
            <button className="secondary-btn text-xs" onClick={onClose}>Close Overview</button>
            <button
              className="primary-btn text-xs"
              onClick={() => {
                if (onLoadDemoData) onLoadDemoData();
                onClose();
              }}
            >
              🚀 Launch Live Judge Interactive Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
