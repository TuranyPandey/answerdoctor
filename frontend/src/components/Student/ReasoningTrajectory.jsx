import React, { useState, useEffect } from 'react';
import { fetchScriptDetail, reverifyScript, reverifyStep } from '../../services/api';
import { useToast } from '../Toast';
import DoctorAIAdvisor from './DoctorAIAdvisor';
import FormattedMarkdown from '../Common/FormattedMarkdown';

export default function ReasoningTrajectory({ script }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(null);
  const [advisorStep, setAdvisorStep] = useState(null);
  const [reverifying, setReverifying] = useState(false);
  const toast = useToast();

  const handleReverifyStepClick = async () => {
    if (!script || !selectedStep) return;
    setReverifying(true);
    try {
      toast('Re-verifying concept credit with AI...', 'info');
      await reverifyStep(script.id, selectedStep.id);
      toast('✓ Step concept re-verified with full credit!', 'ok');
      const updated = await fetchScriptDetail(script.id);
      setDetail(updated);
      if (updated?.steps) {
        const match = updated.steps.find((s) => s.id === selectedStep.id);
        if (match) setSelectedStep(match);
      }
    } catch (err) {
      toast(err.message || 'Re-verification failed', 'err');
    } finally {
      setReverifying(false);
    }
  };

  const handleReverifyScriptClick = async () => {
    if (!script) return;
    setReverifying(true);
    try {
      toast('Queued script for holistic AI concept re-verification...', 'info');
      await reverifyScript(script.id);
      toast('✓ Script sent for AI concept re-verification!', 'ok');
    } catch (err) {
      toast(err.message || 'Script re-verification failed', 'err');
    } finally {
      setReverifying(false);
    }
  };

  useEffect(() => {
    if (!script) return;
    setLoading(true);
    fetchScriptDetail(script.id)
      .then((res) => {
        setDetail(res);
        if (res?.steps && res.steps.length > 0) {
          setSelectedStep(res.steps[0]);
        }
      })
      .catch((err) => toast(err.message || 'Failed to load reasoning graph', 'err'))
      .finally(() => setLoading(false));
  }, [script]);

  if (!script) {
    return (
      <div className="page-body">
        <div className="text-mute text-center p-24">Select a script from "My Scripts" tab to render its Reasoning Trajectory DAG.</div>
      </div>
    );
  }

  if (loading || !detail) {
    return (
      <div className="page-body">
        <div className="text-mute text-center p-24">Rendering Reasoning Trajectory DAG...</div>
      </div>
    );
  }

  const steps = detail.steps || [];

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">🧠 Reasoning Trajectory Directed Acyclic Graph (DAG)</h2>
          <p className="page-subtitle">
            Visual concept dependency graph tracing student derivations. Green edges = intact reasoning, Red = broken dependency edges.
          </p>
        </div>
        <div>
          <button
            className="secondary-btn text-xs flex items-center gap-6"
            onClick={handleReverifyScriptClick}
            disabled={reverifying}
            style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '8px 14px', borderRadius: '8px' }}
          >
            🔄 Reverify Entire Script with AI
          </button>
        </div>
      </div>

      {/* Trajectory DAG Visualization Canvas */}
      <div className="card mb-20 p-24 bg-slate" style={{ overflowX: 'auto', border: '1px solid rgba(51, 65, 85, 0.8)' }}>
        <div className="flex items-center gap-16 justify-start" style={{ minWidth: '850px', padding: '12px 0' }}>
          {steps.map((s, idx) => {
            const matched = s.matched;
            const unit = s.rubric_unit || {};
            const isSelected = selectedStep?.id === s.id;
            const isNextMatched = idx < steps.length - 1 ? steps[idx + 1].matched : false;
            const isEdgeValid = matched && isNextMatched;

            return (
              <React.Fragment key={s.id || idx}>
                {/* Node Card */}
                <div
                  onClick={() => setSelectedStep(s)}
                  style={{
                    width: '210px',
                    minHeight: '145px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: isSelected ? '#1e293b' : '#0f172a',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                    borderLeft: `5px solid ${matched ? '#10b981' : '#ef4444'}`,
                    boxShadow: isSelected
                      ? '0 0 16px rgba(56, 189, 248, 0.35)'
                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    {/* Node Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                      <span
                        style={{
                          background: 'rgba(51, 65, 85, 0.8)',
                          color: '#94a3b8',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '5px',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {unit.type || 'NODE'}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          color: matched ? '#10b981' : '#f87171',
                          background: matched ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          border: `1px solid ${matched ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        }}
                      >
                        {matched ? '✓ Valid' : '✕ Broken'}
                      </span>
                    </div>

                    {/* Node Label */}
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '8px',
                      }}
                    >
                      {unit.label || `Step ${idx + 1}`}
                    </div>
                  </div>

                  {/* Node Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: '#64748b' }}>
                      Node #{idx + 1}
                    </span>
                    {s.similarity !== undefined && (
                      <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: matched ? '#34d399' : '#fb923c' }}>
                        {(s.similarity * 100).toFixed(0)}% Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Edge Arrow Connector */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '60px',
                    }}
                  >
                    <div
                      style={{
                        width: '45px',
                        height: '3px',
                        background: isEdgeValid ? '#10b981' : '#ef4444',
                        position: 'relative',
                        borderRadius: '2px',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          top: '-4px',
                          width: 0,
                          height: 0,
                          borderTop: '5px solid transparent',
                          borderBottom: '5px solid transparent',
                          borderLeft: `8px solid ${isEdgeValid ? '#10b981' : '#ef4444'}`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        fontFamily: "'DM Mono', monospace",
                        color: isEdgeValid ? '#34d399' : '#f87171',
                        background: isEdgeValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${isEdgeValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        marginTop: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isEdgeValid ? 'valid edge' : 'broken edge'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Detail Panel */}
      {selectedStep && (
        <div
          className="card"
          style={{
            borderLeft: `5px solid ${selectedStep.matched ? '#10b981' : '#ef4444'}`,
            background: '#0f172a',
            border: '1px solid rgba(51, 65, 85, 0.7)',
            borderRadius: '12px',
          }}
        >
          <div className="card-header flex justify-between items-center flex-wrap gap-8" style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.7)', padding: '16px 20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: 'rgba(51, 65, 85, 0.8)',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedStep.rubric_unit?.type || 'STEP'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: selectedStep.matched ? '#10b981' : '#f87171',
                  }}
                >
                  {selectedStep.matched ? '✓ VALID STEP' : '✕ BROKEN STEP'}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {selectedStep.rubric_unit?.label}
              </h3>
            </div>
            <div className="flex items-center gap-10">
              <span className="badge badge-sage">AI Conf: {((selectedStep.confidence_score || 0.92) * 100).toFixed(0)}%</span>
              <button
                className="secondary-btn text-xs flex items-center gap-4"
                onClick={handleReverifyStepClick}
                disabled={reverifying}
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '8px 14px', borderRadius: '8px' }}
              >
                🔄 Reverify Step Concept
              </button>
              <button
                className="primary-btn text-xs flex items-center gap-4"
                onClick={() => setAdvisorStep(selectedStep)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                }}
              >
                🩺 Ask Doctor AI Advisor
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Extracted Derivation Text from Student Script:
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  background: '#1e293b',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Mono', monospace",
                  color: '#cbd5e1',
                }}
              >
                {selectedStep.student_text ? `"${selectedStep.student_text}"` : '[No matching text line found in script]'}
              </div>
            </div>

            {selectedStep.feedback && (
              <div
                style={{
                  padding: '14px 18px',
                  background: selectedStep.matched
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)',
                  border: `1px solid ${selectedStep.matched ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderLeft: `4px solid ${selectedStep.matched ? '#10b981' : '#ef4444'}`,
                  borderRadius: '10px',
                }}
              >
                <strong style={{ color: selectedStep.matched ? '#34d399' : '#f87171', display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {selectedStep.matched ? '✓ Verification & Evaluation Note:' : '⚠️ Reasoning Dependency Analysis:'}
                </strong>
                <FormattedMarkdown content={selectedStep.feedback} />
              </div>
            )}
          </div>
        </div>
      )}

      {advisorStep && (
        <DoctorAIAdvisor
          step={advisorStep}
          script={detail}
          onClose={() => setAdvisorStep(null)}
        />
      )}
    </div>
  );
}
