import React, { useState, useEffect } from 'react';
import { aiExplainStep, reverifyStep } from '../../services/api';
import { useToast } from '../Toast';
import FormattedMarkdown from '../Common/FormattedMarkdown';

export default function DoctorAIAdvisor({ step, script, onClose }) {
  const [activeTab, setActiveTab] = useState('explain');
  const [loading, setLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const toast = useToast();

  const stepLabel = step?.rubric_unit?.label || step?.label || 'Reasoning Step';
  const unitType = step?.rubric_unit?.type || step?.type || 'Step';
  const studentText = step?.student_text || '';
  const feedback = step?.feedback || '';

  const tabs = [
    { id: 'explain', label: '💡 Explain Concept', desc: 'Core principles & formulas' },
    { id: 'mistake', label: '❌ Analyze Mistake', desc: 'Why marks were lost & pitfalls' },
    { id: 'cheatsheet', label: '📝 Cheat Sheet', desc: '3-step memory rules & laws' },
    { id: 'example', label: '🎯 Practice Example', desc: '1-min practice problem & solution' },
  ];

  const fetchAdvice = async (tabId, overridePrompt = '') => {
    setLoading(true);
    setIsPlayingVoice(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    try {
      const res = await aiExplainStep(
        stepLabel,
        unitType,
        studentText,
        feedback,
        overridePrompt || tabId
      );
      setAdvisorResponse(res.content || res.explanation || 'No content returned');
    } catch (err) {
      toast(err.message || 'AI Advisor failed to load response', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step) {
      fetchAdvice(activeTab);
    }
  }, [step, activeTab]);

  const handleVoiceToggle = () => {
    if (!('speechSynthesis' in window)) {
      toast('Voice synthesis not supported in this browser', 'err');
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      toast('Voice tutor paused', 'info');
    } else {
      window.speechSynthesis.cancel();
      // Clean speech text by removing markdown symbols
      const cleanSpeechText = advisorResponse.replace(/[#*`_~>-]/g, '').slice(0, 450);
      const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
      toast('🔊 Playing AI Tutor voice explanation...', 'info');
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    fetchAdvice(activeTab, customQuestion.trim());
    setCustomQuestion('');
    toast('Sent question to AI Tutor...', 'info');
  };

  if (!step) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(13, 17, 23, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(51, 65, 85, 0.6)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0f172a',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                }}
              >
                🩺 DOCTOR AI ADVISOR
              </span>
              <span
                style={{
                  background: 'rgba(51, 65, 85, 0.8)',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}
              >
                {unitType}
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {stepLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)')}
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            background: '#1e293b',
            borderBottom: '1px solid rgba(51, 65, 85, 0.7)',
            padding: '10px 16px',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)'
                    : 'rgba(30, 41, 59, 0.6)',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Advisor Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#0f172a' }}>
          {/* Identified Step Feedback Banner */}
          {feedback && (
            <div
              style={{
                marginBottom: '20px',
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderLeft: '4px solid #ef4444',
                borderRadius: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#f87171',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                <span>⚠️</span> IDENTIFIED STEP FEEDBACK
              </div>
              <div style={{ fontSize: '13.5px', color: '#fca5a5', lineHeight: 1.5, fontWeight: 500 }}>
                {feedback}
              </div>
            </div>
          )}

          {/* Student Answer Text */}
          {studentText && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                borderRadius: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                STUDENT ANSWER TRANSCRIPTION:
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                "{studentText}"
              </div>
            </div>
          )}

          {/* AI Advisor Content */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }} className="spin-pulse">
                🩺
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                Synthesizing targeted AI reasoning advice...
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Powered by Gemini 2.0 Flash Diagnostic Grader
              </div>
            </div>
          ) : (
            <div style={{ minHeight: '120px' }}>
              <FormattedMarkdown content={advisorResponse} />
            </div>
          )}
        </div>

        {/* Custom Follow-Up Q&A Input */}
        <form
          onSubmit={handleCustomSubmit}
          style={{
            padding: '10px 20px',
            background: '#162032',
            borderTop: '1px solid rgba(51, 65, 85, 0.6)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="💬 Ask Doctor AI a custom question about this step..."
            disabled={loading}
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !customQuestion.trim()}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: loading || !customQuestion.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !customQuestion.trim() ? 0.5 : 1,
            }}
          >
            Ask AI
          </button>
        </form>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#0f172a',
            borderTop: '1px solid rgba(51, 65, 85, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            ⚡ Powered by Gemini 2.0 Flash Reasoning Engine
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {step && script && (
              <button
                onClick={async () => {
                  try {
                    toast('Re-verifying step concept with AI...', 'info');
                    await reverifyStep(script.id, step.id);
                    toast('✓ Step concept re-verified with full credit!', 'ok');
                  } catch (err) {
                    toast(err.message || 'Re-verification failed', 'err');
                  }
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🔄 Reverify Step Concept
              </button>
            )}
            <button
              onClick={handleVoiceToggle}
              disabled={!advisorResponse || loading}
              style={{
                background: isPlayingVoice ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                border: isPlayingVoice ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.8)',
                color: isPlayingVoice ? '#ffffff' : '#cbd5e1',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: !advisorResponse || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              {isPlayingVoice ? '⏸ Pause Voice Tutor' : '🔊 Listen to AI Tutor'}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(advisorResponse);
                toast('Copied AI advice to clipboard!', 'ok');
              }}
              disabled={!advisorResponse || loading}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                color: '#cbd5e1',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: !advisorResponse || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              📋 Copy Explanation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
