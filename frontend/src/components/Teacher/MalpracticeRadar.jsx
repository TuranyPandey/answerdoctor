import React, { useState, useEffect } from 'react';
import env from '../../config/env';
import { fetchCollusionPairs, scanCollusion, updateCollusionStatus } from '../../services/api';
import { useToast } from '../Toast';

export default function MalpracticeRadar({ selectedClass }) {
  const [pairs, setPairs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null);
  const toast = useToast();

  const loadPairs = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await fetchCollusionPairs(selectedClass.id);
      setPairs(data);
    } catch (err) {
      toast(err.message || 'Failed to load collusion radar flags', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPairs();
  }, [selectedClass]);

  const handleRunScan = async () => {
    if (!selectedClass) return;
    setScanning(true);
    try {
      const res = await scanCollusion(selectedClass.id);
      setPairs(res);
      toast(`Collusion radar scan complete. ${res.length} pair(s) flagged above CMI threshold (${env.cmiThreshold})`, 'ok');
    } catch (err) {
      toast(err.message || 'Scan failed', 'err');
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (flagId, newStatus) => {
    try {
      await updateCollusionStatus(flagId, newStatus);
      toast(`Status updated to ${newStatus}`, 'ok');
      await loadPairs();
      if (selectedPair?.id === flagId) {
        setSelectedPair((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast(err.message || 'Failed to update status', 'err');
    }
  };

  if (!selectedClass) {
    return (
      <div className="page-body">
        <div className="text-mute text-center p-24">Please select a class from Classrooms to view Malpractice Radar.</div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h2 className="page-title">Cohort Malpractice & Collusion Radar — {selectedClass.name}</h2>
          <p className="page-subtitle">
            Cross-clusters sentence-transformer embeddings across the cohort to catch scripts with suspiciously identical phrasing or shared reasoning leaps.
          </p>
        </div>
        <button className="primary-btn" onClick={handleRunScan} disabled={scanning}>
          {scanning ? 'Scanning Cohort Embeddings...' : 'Run Collusion Radar Scan'}
        </button>
      </div>

      <div className="card mb-16 p-14 bg-slate-mid">
        <div className="text-sm text-mute">
          <strong className="text-amber">CMI Threshold Policy:</strong> {env.collusionReviewNote} (CMI ≥ {env.cmiThreshold}). Formula: <code className="text-mono">CMI = CosSim(Emb_i, Emb_j) × ErrorPatternMatch(S_i, S_j)</code>.
        </div>
      </div>

      {loading ? (
        <div className="text-mute">Loading radar scan data...</div>
      ) : (
        <div className="analytics-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Flagged Script Pairs ({pairs.length})</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student A</th>
                    <th>Student B</th>
                    <th>CMI Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map((p) => (
                    <tr key={p.id} className={selectedPair?.id === p.id ? 'bg-slate-soft' : ''}>
                      <td style={{ fontWeight: 600 }}>{p.script_a?.student?.name || 'Student A'}</td>
                      <td style={{ fontWeight: 600 }}>{p.script_b?.student?.name || 'Student B'}</td>
                      <td><span className="cmi-score">{(p.cmi_score * 100).toFixed(1)}%</span></td>
                      <td>
                        {p.status === 'pending_review' && <span className="badge badge-amber">Review Needed</span>}
                        {p.status === 'confirmed' && <span className="badge badge-fault">Confirmed</span>}
                        {p.status === 'cleared' && <span className="badge badge-sage">Cleared</span>}
                      </td>
                      <td>
                        <button
                          className="secondary-btn text-sm"
                          onClick={() => setSelectedPair(p)}
                        >
                          Compare
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pairs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-mute" style={{ padding: '24px' }}>
                        No script pairs flagged above CMI threshold ({env.cmiThreshold}). Click "Run Collusion Radar Scan" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {selectedPair ? `Side-by-Side Comparison (CMI: ${(selectedPair.cmi_score * 100).toFixed(1)}%)` : 'Select a Flagged Pair'}
              </div>
            </div>
            <div className="card-body">
              {selectedPair ? (
                <div>
                  <div className="flex justify-between items-center mb-12">
                    <div>
                      <span className="badge badge-fault">CMI: {(selectedPair.cmi_score * 100).toFixed(1)}% Match</span>
                    </div>
                    <div className="flex gap-8">
                      <button
                        className="secondary-btn text-sm"
                        onClick={() => handleUpdateStatus(selectedPair.id, 'cleared')}
                      >
                        Clear Flag
                      </button>
                      <button
                        className="danger-btn text-sm"
                        onClick={() => handleUpdateStatus(selectedPair.id, 'confirmed')}
                      >
                        Confirm Collusion
                      </button>
                    </div>
                  </div>

                  <div className="analytics-grid mb-12">
                    <div className="p-10 border-rule">
                      <div className="text-xs font-semibold text-amber mb-4">
                        {selectedPair.script_a?.student?.name} ({selectedPair.script_a?.student?.email})
                      </div>
                      <div className="step-student-text text-sm" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {selectedPair.script_a?.ocr_text || 'No OCR text available'}
                      </div>
                    </div>
                    <div className="p-10 border-rule">
                      <div className="text-xs font-semibold text-amber mb-4">
                        {selectedPair.script_b?.student?.name} ({selectedPair.script_b?.student?.email})
                      </div>
                      <div className="step-student-text text-sm" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {selectedPair.script_b?.ocr_text || 'No OCR text available'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-mute text-center p-18">
                  Click "Compare" on any flagged pair to inspect side-by-side OCR text and matched reasoning steps.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
