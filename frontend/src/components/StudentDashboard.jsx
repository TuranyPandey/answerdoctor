import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw, Sparkles, 
  Layers, FileText, Image as ImageIcon, Award, ShieldAlert, ChevronRight, HelpCircle
} from 'lucide-react';

export default function StudentDashboard({ submission, onRetrySubmit }) {
  const [selectedStep, setSelectedStep] = useState(submission?.steps?.[0] || null);
  const [activeRetryStep, setActiveRetryStep] = useState(null); // step object when opening retry modal/card
  const [selectedOption, setSelectedOption] = useState('');
  const [retryResult, setRetryResult] = useState(null);
  const [isSubmittingRetry, setIsSubmittingRetry] = useState(false);

  if (!submission) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const handleRetrySubmit = async () => {
    if (!selectedOption || !activeRetryStep) return;
    setIsSubmittingRetry(true);
    try {
      const res = await onRetrySubmit(activeRetryStep.id, selectedOption);
      setRetryResult(res);
    } catch (err) {
      console.error("Retry submit error:", err);
    } finally {
      setIsSubmittingRetry(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Student Overview Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Personal Diagnosis
            </span>
            {submission.is_collusion_flagged && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> CMI Radar Flagged (0.92)
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mt-1">{submission.student_name}</h2>
          <p className="text-xs text-slate-400 font-mono">
            Register: {submission.register_number} • Course: MECH201 Thermodynamics CAT-1
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Rubric-Alignment Score (RAS)</p>
            <div className="text-3xl font-extrabold text-white flex items-center justify-end gap-1">
              <span className={submission.total_ras_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                {submission.total_ras_score}%
              </span>
              <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400">OCR Confidence: {roundPct(submission.ocr_confidence)}%</p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-8 h-8 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE: THE REASONING MAP FLOWCHART */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              The Reasoning Map
            </h3>
            <p className="text-xs text-slate-400">
              Structured representation of derivation logic: Concept → Approach → Steps → Transformation → Result
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-lg text-slate-400 border border-slate-800">
            5 Atomic Rubric Nodes
          </span>
        </div>

        {/* Horizontal Flowchart Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {submission.reasoning_map.map((node, index) => {
            const isBreak = node.has_reasoning_break;
            return (
              <div 
                key={index}
                onClick={() => setSelectedStep(submission.steps[index])}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                  isBreak 
                    ? 'node-break border-rose-500/50 glow-red ring-1 ring-rose-500/30' 
                    : 'node-matched border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isBreak ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {node.node_type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Step {node.step_number}</span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{node.title}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 font-mono">{node.student_claim}</p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">Similarity: {node.similarity_pct}%</span>
                  {isBreak ? (
                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                      <XCircle className="w-3 h-3" /> Error
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Pass
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP DIAGNOSIS & RETRY PRACTICE DRILL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Line-by-Line Step Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Line-by-Line Script Derivation Diagnostics
            </h3>

            <div className="space-y-3">
              {submission.steps.map(step => {
                const isBreak = step.status !== 'MATCHED';
                return (
                  <div 
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isBreak ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-300">Step {step.step_number}</span>
                          <span className="text-xs font-bold text-white">{step.rubric_unit?.label}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-2">
                          "{step.student_text}"
                        </p>
                      </div>

                      <div className="text-right font-mono text-xs shrink-0">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isBreak ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {step.status} ({roundPct(step.similarity_score)}%)
                        </span>
                      </div>
                    </div>

                    {/* Preserved Diagram Crop Callout */}
                    {step.has_diagram && (
                      <div className="mt-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                        <div className="text-xs">
                          <p className="font-bold text-indigo-200">Preserved Diagram Crop</p>
                          <p className="text-slate-400 text-[11px]">
                            Handwritten P-V process curve diagram detected & preserved as visual crop (excluded from text scoring).
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Diagnosis Explanation */}
                    {step.diagnosis_text && (
                      <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
                        isBreak ? 'bg-rose-950/40 text-rose-200 border border-rose-500/30' : 'bg-slate-950 text-slate-300'
                      }`}>
                        <strong>Diagnosis:</strong> {step.diagnosis_text}
                      </div>
                    )}

                    {/* Step-Level Retry Trigger Button */}
                    {isBreak && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Concept Gap Detected
                        </span>

                        <button
                          onClick={() => {
                            setActiveRetryStep(step);
                            setSelectedOption('');
                            setRetryResult(null);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Retry This Step</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Step-Level Retry Practice Drill Card */}
        <div className="lg:col-span-1">
          {activeRetryStep ? (
            <div className="glass-panel rounded-2xl p-6 border border-violet-500/40 glow-violet sticky top-24 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Step-Level Retry Drill
                </h3>
                <button 
                  onClick={() => setActiveRetryStep(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">Targeting Step {activeRetryStep.step_number}:</p>
                <p className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded">
                  {activeRetryStep.rubric_unit?.label}
                </p>
              </div>

              {/* Retry Question Prompt */}
              {activeRetryStep.retry_question && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium text-white leading-relaxed">
                    {activeRetryStep.retry_question.prompt}
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2">
                    {activeRetryStep.retry_question.options.map((opt, i) => {
                      const optKey = opt.charAt(0);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedOption(optKey)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            selectedOption === optKey
                              ? 'bg-violet-500/20 border-violet-500 text-white font-semibold shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit Retry Button */}
                  <button
                    onClick={handleRetrySubmit}
                    disabled={!selectedOption || isSubmittingRetry}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmittingRetry ? 'Evaluating Answer...' : 'Submit Step Retry Answer'}
                  </button>

                  {/* Result Feedback Banner */}
                  {retryResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                      retryResult.is_correct ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {retryResult.is_correct ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>Step Mastered! (+10 RAS Credit)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-rose-400" />
                            <span>Incorrect. Review Concept & Try Again</span>
                          </>
                        )}
                      </div>
                      <p>{retryResult.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center space-y-3 sticky top-24">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Targeted Practice Drills</h4>
              <p className="text-xs text-slate-400">
                Click <strong>"Retry This Step"</strong> on any reasoning break step to practice the specific concept and improve your score!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function roundPct(val) {
  if (!val) return 0;
  return Math.round(val * (val <= 1.0 ? 100 : 1));
}
