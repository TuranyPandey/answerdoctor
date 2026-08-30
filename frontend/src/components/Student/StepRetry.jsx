import React, { useState } from 'react';
import { retryStepAnswer } from '../../services/api';
import { useToast } from '../Toast';
import DoctorAIAdvisor from './DoctorAIAdvisor';

const SAMPLE_PRACTICE_STEPS = [
  { id: 'p1', type: 'Concept', label: 'Identify thermodynamic system boundary and reference state variables (P1, V1, T1)' },
  { id: 'p2', type: 'Formula', label: 'State the First Law of Thermodynamics: Q - W = ΔU for closed system' },
  { id: 'p3', type: 'Step', label: 'Compute boundary work integral W = P * (V2 - V1)' },
  { id: 'p4', type: 'Transformation', label: 'Algebraic calculation of heat input Q = m * Cv * (T2 - T1) + W' },
  { id: 'p5', type: 'Result', label: 'State final numerical answer with correct engineering units (kJ)' },
];

export default function StepRetry({ retryContext }) {
  const [selectedUnit, setSelectedUnit] = useState(retryContext?.rubricUnit || SAMPLE_PRACTICE_STEPS[0]);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [advisorStep, setAdvisorStep] = useState(null);
  const toast = useToast();

  const scriptId = retryContext?.scriptId || 'practice_demo';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      toast('Please enter your revised reasoning step answer', 'err');
      return;
    }

    setEvaluating(true);
    setResult(null);
    try {
      const res = await retryStepAnswer(scriptId, selectedUnit.id, studentAnswer);
      setResult(res);
      if (res.matched) {
        toast('Great job! Step reasoning requirement fulfilled.', 'ok');
      } else {
        toast('Step reasoning still has gaps. Review feedback below.', 'info');
      }
    } catch (err) {
      toast(err.message || 'Evaluation failed', 'err');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="page-body">
      <div className="mb-16 flex justify-between items-center flex-wrap gap-8">
        <div>
          <h2 className="page-title">Step-Level Targeted Retry Practice</h2>
          <p className="page-subtitle">
            Drill the exact reasoning steps where you need reinforcement. Re-submit your derivation for real-time Gemini AI evaluation against the rubric.
          </p>
        </div>
      </div>

      {!retryContext && (
        <div className="card mb-16" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-header">
            <div className="card-title text-xs uppercase font-bold text-mute">Choose a Practice Reasoning Step:</div>
          </div>
          <div className="card-body">
            <div className="flex gap-8 flex-wrap">
              {SAMPLE_PRACTICE_STEPS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={selectedUnit?.id === u.id ? 'primary-btn text-xs' : 'secondary-btn text-xs'}
                  onClick={() => {
                    setSelectedUnit(u);
                    setResult(null);
                    setStudentAnswer('');
                  }}
                  style={{ borderRadius: '6px' }}
                >
                  <span className="step-type-tag mr-4" style={{ fontSize: '10px' }}>{u.type}</span>
                  {u.label.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="retry-panel card mb-16">
        <div className="card-header flex justify-between items-center">
          <div className="card-title flex items-center gap-8">
            <span className="step-type-tag">{selectedUnit.type}</span>
            <span>Target Step Requirement: {selectedUnit.label}</span>
          </div>
          <button
            type="button"
            className="secondary-btn text-xs"
            onClick={() => setAdvisorStep(selectedUnit)}
          >
            🩺 Ask Doctor AI Advisor
          </button>
        </div>

        <div className="retry-prompt p-14 bg-slate border-b border-rule">
          <strong>Practice Question / Task:</strong> Write out your complete reasoning step for:{' '}
          <em>"{selectedUnit.label}"</em>. Be clear about state variables, initial assumptions, and mathematical formulations.
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="retry-input form-input text-mono text-sm p-14"
            style={{ width: '100%', border: 'none', borderRadius: 0, outline: 'none' }}
            placeholder="Type your corrected reasoning step derivation here..."
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            disabled={evaluating}
            rows={6}
            required
          />
          <div className="p-14 flex justify-between items-center bg-slate border-t border-rule flex-wrap gap-8">
            <div className="flex items-center gap-8">
              <span className="text-xs text-mute">Evaluated by Gemini AI against rubric alignment threshold (γ ≥ 0.60)</span>
              <button
                type="button"
                className="secondary-btn text-xs flex items-center gap-4"
                onClick={() => {
                  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                  if (!SpeechRecognition) {
                    toast('Voice dictation speech-to-text is not supported in this browser.', 'err');
                    return;
                  }
                  const rec = new SpeechRecognition();
                  rec.lang = 'en-US';
                  rec.onstart = () => toast('🎙️ Listening... Speak your derivation now!', 'info');
                  rec.onresult = (e) => {
                    const text = e.results[0][0].transcript;
                    setStudentAnswer((prev) => (prev ? `${prev} ${text}` : text));
                    toast('🎙️ Voice captured!', 'ok');
                  };
                  rec.onerror = () => toast('Voice recognition error. Please speak clearly into mic.', 'err');
                  rec.start();
                }}
              >
                🎙️ Speak Your Step (Voice to Text)
              </button>
            </div>
            <button type="submit" className="primary-btn" disabled={evaluating}>
              {evaluating ? 'Diagnosing Step with Gemini...' : 'Submit Step for AI Evaluation'}
            </button>
          </div>
        </form>

        {result && (
          <div className="eval-result bg-slate-mid p-16 border-t border-rule">
            <div className="eval-score-bar flex items-center gap-12 mb-8">
              <span className="text-xs uppercase font-semibold text-mute">Step Evaluation Score:</span>
              <span className="text-mono font-bold text-amber font-lg">{(result.score * 100).toFixed(0)}%</span>
              {result.matched ? (
                <span className="badge badge-sage">PASSED (γ ≥ 0.60)</span>
              ) : (
                <span className="badge badge-fault">NEEDS REVISION (γ &lt; 0.60)</span>
              )}
            </div>
            <div className="eval-feedback text-sm" style={{ lineHeight: 1.5 }}>
              <strong>Diagnostic Feedback:</strong> {result.feedback}
            </div>
          </div>
        )}
      </div>

      {advisorStep && (
        <DoctorAIAdvisor
          step={advisorStep}
          onClose={() => setAdvisorStep(null)}
        />
      )}
    </div>
  );
}
