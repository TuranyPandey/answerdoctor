import React, { useState, useEffect } from 'react';
import { fetchPYQs, submitPYQPractice, fetchAIHint, generatePYQVariants } from '../../services/api';
import { useToast } from '../Toast';

export default function StudentPYQPractice() {
  const [pyqs, setPyqs] = useState([]);
  const [subject, setSubject] = useState('');
  const [selectedPYQ, setSelectedPYQ] = useState(null);
  const [solutionInput, setSolutionInput] = useState('');
  const [file, setFile] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [loadingPYQs, setLoadingPYQs] = useState(false);

  // AI Hint state
  const [hintLevel, setHintLevel] = useState(1);
  const [hintText, setHintText] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);

  const toast = useToast();

  const loadPYQs = async () => {
    setLoadingPYQs(true);
    try {
      const list = await fetchPYQs(subject);
      setPyqs(list);
      if (list.length > 0 && !selectedPYQ) {
        setSelectedPYQ(list[0]);
      }
    } catch (err) {
      toast(err.message || 'Failed to load PYQ database', 'err');
    } finally {
      setLoadingPYQs(false);
    }
  };

  useEffect(() => {
    loadPYQs();
  }, [subject]);

  const handleSubmitPractice = async (e) => {
    e.preventDefault();
    if (!selectedPYQ) return;
    if (!solutionInput.trim() && !file) {
      toast('Please write out your step-by-step solution or attach an answer file (Image/PDF/Word/TXT)', 'err');
      return;
    }

    setEvaluating(true);
    setGradingResult(null);
    try {
      const res = await submitPYQPractice(selectedPYQ.id, solutionInput, file);
      setGradingResult(res);
      if (res.ras >= 0.75) {
        toast(`Excellent derivation! RAS Score: ${(res.ras * 100).toFixed(0)}%`, 'ok');
      } else {
        toast(`Graded! RAS Score: ${(res.ras * 100).toFixed(0)}%. Review feedback below.`, 'info');
      }
    } catch (err) {
      toast(err.message || 'PYQ grading failed', 'err');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRequestHint = async (level) => {
    if (!selectedPYQ) return;
    setLoadingHint(true);
    try {
      const res = await fetchAIHint(selectedPYQ.question_text, level);
      setHintText(res.hint || res.content || 'Hint unavailable');
      setHintLevel(level);
      toast(`Level ${level} AI Hint unlocked!`, 'info');
    } catch (err) {
      toast(err.message || 'Failed to load hint', 'err');
    } finally {
      setLoadingHint(false);
    }
  };

  const [generatingVariants, setGeneratingVariants] = useState(false);

  const handleGenerateVariants = async () => {
    if (!selectedPYQ) return;
    setGeneratingVariants(true);
    try {
      const variants = await generatePYQVariants(selectedPYQ.id);
      toast(`Generated ${variants.length} new AI PYQ Variants in PYQ Bank!`, 'ok');
      await loadPYQs();
    } catch (err) {
      toast(err.message || 'Variant generation failed', 'err');
    } finally {
      setGeneratingVariants(false);
    }
  };

  const handleSelectPaper = (pyq) => {
    setSelectedPYQ(pyq);
    setGradingResult(null);
    setSolutionInput('');
    setFile(null);
    setHintText('');
    setHintLevel(1);
  };

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">PYQ Practice & Mock Exam Simulator</h2>
          <p className="page-subtitle">
            Practice Previous Year Question papers with instant step-by-step AI alignment grading & file/OCR recognition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-16" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Left Column: PYQ Explorer */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div className="card-title">PYQ Bank ({pyqs.length})</div>
          </div>
          <div className="p-12 border-b border-rule bg-slate">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input text-xs mb-8"
              style={{ width: '100%' }}
            >
              <option value="">All Subjects & Grade Levels</option>
              <option value="AP Biology">AP / K-12 Biology</option>
              <option value="Chemistry">Chemistry & Stoichiometry</option>
              <option value="Physics">Physics & Mechanics</option>
              <option value="Mathematics">Calculus & Linear Algebra</option>
              <option value="Computer Science">CS, Algorithms & AI</option>
              <option value="Thermodynamics">Thermodynamics & Energy</option>
              <option value="Electromagnetics">Electromagnetics</option>
              <option value="Circuit Theory">Circuit Theory</option>
              <option value="Economics">Economics & Business</option>
              <option value="Medicine">Medicine & Physiology</option>
            </select>
            {selectedPYQ && (
              <button
                type="button"
                className="secondary-btn text-xs full-width"
                onClick={handleGenerateVariants}
                disabled={generatingVariants}
              >
                {generatingVariants ? 'Generating Variants...' : '⚡ Generate AI PYQ Variants'}
              </button>
            )}
          </div>

          <div className="pyq-list" style={{ maxHeight: '600px', overflowY: 'auto', padding: '8px' }}>
            {loadingPYQs ? (
              <div className="text-mute p-12 text-center text-xs">Loading PYQs...</div>
            ) : (
              pyqs.map((pyq) => (
                <div
                  key={pyq.id}
                  onClick={() => handleSelectPaper(pyq)}
                  className={`p-12 mb-8 border-rule cursor-pointer transition-all ${
                    selectedPYQ?.id === pyq.id ? 'bg-slate-mid border-amber' : 'bg-slate hover:bg-slate-mid'
                  }`}
                  style={{
                    borderRadius: '8px',
                    borderLeft: selectedPYQ?.id === pyq.id ? '4px solid var(--amber, #f59e0b)' : '1px solid #334155',
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="step-type-tag" style={{ fontSize: '10px' }}>{pyq.subject || 'Engineering'}</span>
                    <span className="text-mono text-xs font-semibold">{pyq.marks} Marks</span>
                  </div>
                  <div className="font-semibold text-xs mb-4">{pyq.exam_name}</div>
                  <div className="text-xs text-mute truncate">{pyq.question_text}</div>
                </div>
              ))
            )}

            {pyqs.length === 0 && !loadingPYQs && (
              <div className="text-mute p-18 text-center text-xs">No PYQs found for this subject filter.</div>
            )}
          </div>
        </div>

        {/* Right Column: Problem Workspace & AI Grader */}
        <div>
          {selectedPYQ ? (
            <div className="flex flex-col gap-16">
              {/* Question Details Card */}
              <div className="card">
                <div className="card-header flex justify-between items-center">
                  <div>
                    <span className="badge badge-sage mb-4">{selectedPYQ.subject}</span>
                    <h3 className="card-title text-base font-bold">{selectedPYQ.exam_name} — Question</h3>
                  </div>
                  <div className="flex items-center gap-12">
                    <span className="text-mono font-bold text-amber">{selectedPYQ.marks} Marks</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-sm mb-16" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedPYQ.question_text}
                  </div>

                  {/* AI Hints Toolbar */}
                  <div className="p-12 bg-slate-mid border-rule rounded-md" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-8">
                      <span className="text-xs font-bold uppercase text-mute">💡 AI Tutor Hints:</span>
                      <div className="flex gap-6">
                        <button
                          type="button"
                          className={hintLevel === 1 && hintText ? 'primary-btn text-xs' : 'secondary-btn text-xs'}
                          onClick={() => handleRequestHint(1)}
                          disabled={loadingHint}
                        >
                          L1: Concept
                        </button>
                        <button
                          type="button"
                          className={hintLevel === 2 && hintText ? 'primary-btn text-xs' : 'secondary-btn text-xs'}
                          onClick={() => handleRequestHint(2)}
                          disabled={loadingHint}
                        >
                          L2: Formula
                        </button>
                        <button
                          type="button"
                          className={hintLevel === 3 && hintText ? 'primary-btn text-xs' : 'secondary-btn text-xs'}
                          onClick={() => handleRequestHint(3)}
                          disabled={loadingHint}
                        >
                          L3: First Step
                        </button>
                      </div>
                    </div>
                    {loadingHint && <div className="text-xs text-mute">Generating hint from AI Tutor...</div>}
                    {hintText && !loadingHint && (
                      <div className="text-xs text-light mt-4" style={{ lineHeight: 1.5 }}>
                        {hintText}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Solution Submission Form */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Interactive Solution Workspace (Text & File Upload)</div>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmitPractice}>
                    <label className="text-xs text-mute font-semibold uppercase block mb-8">
                      1. Type your step-by-step derivation & governing equations below:
                    </label>
                    <textarea
                      rows={6}
                      className="form-input text-mono text-sm mb-16"
                      style={{ width: '100%', resize: 'vertical' }}
                      placeholder="Step 1: State the first law of thermodynamics Q - W = delta U&#10;Step 2: Calculate heat input Q = m * Cp * (T2 - T1)..."
                      value={solutionInput}
                      onChange={(e) => setSolutionInput(e.target.value)}
                      disabled={evaluating}
                    />

                    <label className="text-xs text-mute font-semibold uppercase block mb-8">
                      2. Or attach handwritten solution file (Image, PDF, Word, TXT):
                    </label>
                    <div className="mb-16 flex items-center gap-12 bg-slate p-12 border-rule" style={{ borderRadius: '8px' }}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt"
                        className="form-input text-xs"
                        onChange={(e) => setFile(e.target.files[0] || null)}
                        disabled={evaluating}
                      />
                      {file && (
                        <span className="badge badge-sage text-xs">
                          📎 {file.name} ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-12">
                      <div className="flex items-center gap-8">
                        <span className="text-xs text-mute">
                          Flexible AI grading (Vision OCR + Rubric alignment)
                        </span>
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
                            rec.onstart = () => toast('🎙️ Listening... Speak your solution now!', 'info');
                            rec.onresult = (e) => {
                              const text = e.results[0][0].transcript;
                              setSolutionInput((prev) => (prev ? `${prev}\n${text}` : text));
                              toast('🎙️ Voice solution captured!', 'ok');
                            };
                            rec.onerror = () => toast('Voice recognition error. Please speak clearly into mic.', 'err');
                            rec.start();
                          }}
                        >
                          🎙️ Speak Solution (Voice to Text)
                        </button>
                      </div>
                      <button type="submit" className="primary-btn" disabled={evaluating}>
                        {evaluating ? 'Grading & Extracting OCR with AI...' : 'Submit Solution for AI Evaluation'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Picture Quality Alert / OCR Error Banner */}
              {gradingResult && gradingResult.low_confidence && (
                <div className="card mb-16 p-16" style={{ borderLeft: '4px solid var(--fault, #ef4444)', background: 'rgba(239, 68, 68, 0.1)' }}>
                  <div className="flex justify-between items-center flex-wrap gap-8">
                    <div>
                      <div className="font-bold text-fault text-sm mb-4">⚠️ Picture Quality Alert: Low Legibility</div>
                      <div className="text-xs text-mute">
                        The uploaded handwritten script has low image contrast, blurry focus, or unreadable symbols (Clarity: {((gradingResult.clarity_score || 40)).toFixed(0)}%).
                      </div>
                    </div>
                    <button
                      className="secondary-btn text-xs"
                      onClick={() => setFile(null)}
                    >
                      📷 Re-take & Re-upload Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Grading Result Report */}
              {gradingResult && (
                <div className="card" style={{ borderLeft: '4px solid var(--amber, #f59e0b)' }}>
                  <div className="card-header flex justify-between items-center">
                    <div className="card-title flex items-center gap-8">
                      <span>Grading Diagnostic Report</span>
                      <span className="badge badge-sage">
                        RAS: {(gradingResult.ras * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-mono font-bold text-sage">
                        Score: {gradingResult.scored_marks} / {gradingResult.total_marks} Marks
                      </span>
                      <button
                        className="secondary-btn text-xs"
                        onClick={() => window.print()}
                      >
                        📄 Print Report
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {gradingResult.ocr_text && (
                      <div className="mb-16 p-12 bg-slate border-rule" style={{ borderRadius: '6px' }}>
                        <div className="text-xs text-mute font-semibold uppercase mb-4">
                          Extracted Solution Text (OCR Confidence: {(gradingResult.ocr_confidence * 100).toFixed(0)}%):
                        </div>
                        <div className="text-xs text-mono" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          {gradingResult.ocr_text}
                        </div>
                      </div>
                    )}

                    <h4 className="text-xs text-mute uppercase font-semibold mb-12">Step-by-Step AI Evaluation Breakdown:</h4>
                    <div className="flex flex-col gap-12">
                      {gradingResult.steps?.map((step, idx) => (
                        <div key={idx} className="p-12 bg-slate border-rule" style={{ borderRadius: '8px' }}>
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-8">
                              <span className="step-type-tag">{step.rubric_unit?.type || step.type || 'STEP'}</span>
                              <span className="font-semibold text-sm">{step.rubric_unit?.label || step.label}</span>
                            </div>
                            {step.matched ? (
                              <span className="badge badge-sage">MATCHED (γ ≥ 0.60)</span>
                            ) : (
                              <span className="badge badge-fault font-semibold">MISSING / WEAK</span>
                            )}
                          </div>
                          {step.student_text && (
                            <div className="text-xs text-mute italic mb-4">"{step.student_text}"</div>
                          )}
                          {step.feedback && (
                            <div className="text-xs text-fault mt-4">
                              <strong>Feedback:</strong> {step.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-24 text-center text-mute">
              Select a PYQ from the left sidebar to start practicing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
