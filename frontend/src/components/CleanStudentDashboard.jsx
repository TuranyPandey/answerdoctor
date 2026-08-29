import React, { useState, useEffect } from 'react';
import { 
  LogOut, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, 
  HelpCircle, BookOpen, Layers, RefreshCw, Send, Sparkles, Check, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008/api';

const FALLBACK_SUBMISSION = {
  submission_id: 1,
  assignment_id: 1,
  assignment_title: "CAT-1 Exam: First Law & State Reference Equations",
  student_name: "Mangalapalli Sohum Seshu Krish",
  register_number: "26BCE0616",
  total_ras_score: 60.0,
  ocr_confidence: 0.96,
  is_collusion_flagged: true,
  submission_time: "2026-08-29T16:00:00Z",
  steps: [
    {
      id: 1, step_number: 1, student_text: "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", has_diagram: false, diagram_url: null, similarity_score: 0.41, status: "WEAK",
      diagnosis_text: "Reasoning break at Step 1: You applied the first law formula before establishing the required reference state (T_0 = 298.15 K, P_0 = 1 atm). Without specifying baseline values, internal energy difference calculation is ungrounded.",
      retry_status: "NOT_ATTEMPTED",
      retry_question: {
        question_id: "retry_thermo_ref_state",
        prompt: "Before applying Q - W = delta U for an ideal gas closed system, which reference state parameters must be defined to ensure enthalpy evaluation is path-independent?",
        options: [
          "A) Standard Temperature (T_0 = 298.15 K) and Standard Pressure (P_0 = 1 atm)",
          "B) Maximum pressure reached during compression phase only",
          "C) Arbitrary initial pressure without temperature grounding",
          "D) No reference state is needed for closed systems"
        ],
        correct_option: "A",
        explanation: "Correct! Energy balance evaluations require an established reference state (T_0 = 298.15 K, P_0 = 1 atm) to accurately quantify internal energy and enthalpy changes across process states."
      },
      rubric_unit: { id: 1, category: "concept", label: "1. System boundary & Reference State definition", expected_text: "Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.", weight: 0.20 }
    },
    {
      id: 2, step_number: 2, student_text: "Q - W = delta U where delta U = m * c_v * (T2 - T1)", has_diagram: false, diagram_url: null, similarity_score: 0.88, status: "MATCHED",
      diagnosis_text: "Step 2 matched the rubric requirement for First Law Energy Balance with 88% confidence.",
      retry_status: "NOT_ATTEMPTED", retry_question: null,
      rubric_unit: { id: 2, category: "formula", label: "2. First Law Energy Balance Equation", expected_text: "Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).", weight: 0.20 }
    },
    {
      id: 3, step_number: 3, student_text: "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", has_diagram: true, diagram_url: "diagram_p_v_curve.png", similarity_score: 0.89, status: "MATCHED",
      diagnosis_text: "Step 3 matched boundary work integration requirement with 89% confidence.",
      retry_status: "NOT_ATTEMPTED", retry_question: null,
      rubric_unit: { id: 3, category: "intermediate_step", label: "3. Boundary Work Integration & Specific Heat", expected_text: "W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.", weight: 0.25 }
    },
    {
      id: 4, step_number: 4, student_text: "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", has_diagram: false, diagram_url: null, similarity_score: 0.91, status: "MATCHED",
      diagnosis_text: "Step 4 matched unit conversion requirements with 91% confidence.",
      retry_status: "NOT_ATTEMPTED", retry_question: null,
      rubric_unit: { id: 4, category: "units", label: "4. Unit Conversions & Dimensional Consistency", expected_text: "Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.", weight: 0.15 }
    },
    {
      id: 5, step_number: 5, student_text: "Q_net = 384.6 kJ", has_diagram: false, diagram_url: null, similarity_score: 0.94, status: "MATCHED",
      diagnosis_text: "Step 5 matched final heat transfer answer with 94% confidence.",
      retry_status: "NOT_ATTEMPTED", retry_question: null,
      rubric_unit: { id: 5, category: "final_answer", label: "5. Final Heat Transfer Evaluation (Q_net)", expected_text: "Net heat transfer Q_net = 384.6 kJ (positive indicating heat added to system).", weight: 0.20 }
    }
  ],
  reasoning_map: [
    { step_number: 1, node_type: "concept", title: "1. System boundary & Reference State definition", student_claim: "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", status: "WEAK", has_reasoning_break: true, similarity_pct: 41.0 },
    { step_number: 2, node_type: "formula", title: "2. First Law Energy Balance Equation", student_claim: "Q - W = delta U where delta U = m * c_v * (T2 - T1)", status: "MATCHED", has_reasoning_break: false, similarity_pct: 88.0 },
    { step_number: 3, node_type: "intermediate_step", title: "3. Boundary Work Integration & Specific Heat", student_claim: "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 89.0 },
    { step_number: 4, node_type: "units", title: "4. Unit Conversions & Dimensional Consistency", student_claim: "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", status: "MATCHED", has_reasoning_break: false, similarity_pct: 91.0 },
    { step_number: 5, node_type: "final_answer", title: "5. Final Heat Transfer Evaluation (Q_net)", student_claim: "Q_net = 384.6 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 94.0 }
  ]
};

const PYQ_LIST = [
  {
    id: 1, subject: "Applied Thermodynamics", year: 2025, exam_type: "FAT", difficulty: "Hard",
    title: "Second Law Analysis & Entropy Generation in Polytropic Expansion",
    question_text: "A closed system undergoes a polytropic expansion from 5 bar, 500 K to 1 bar. Calculate net entropy generation S_gen and exergy loss assuming T_0 = 298 K.",
    answer_key_summary: "1. State polytropic relation P1*V1^n = P2*V2^n\n2. S_2 - S_1 = c_p*ln(T2/T1) - R*ln(P2/P1)\n3. Exergy destruction X_destroyed = T_0 * S_gen = 42.8 kJ",
    topics: ["Second Law", "Entropy Generation", "Exergy"]
  },
  {
    id: 2, subject: "Applied Thermodynamics", year: 2024, exam_type: "CAT-2", difficulty: "Hard",
    title: "Rankine Cycle with Reheat & Regeneration Efficiency",
    question_text: "For a steam power plant operating on ideal reheat Rankine cycle between 15 MPa and 10 kPa with reheat at 3 MPa to 500°C, evaluate thermal efficiency.",
    answer_key_summary: "1. Pump work W_p = v1*(P2 - P1)\n2. Turbine work W_t1 = h1 - h2\n3. Thermal efficiency eta_th = W_net / Q_in = 43.5%",
    topics: ["Vapor Power Cycles", "Rankine Cycle", "Thermal Efficiency"]
  },
  {
    id: 3, subject: "Multivariable Calculus", year: 2025, exam_type: "CAT-1", difficulty: "Medium",
    title: "Green's Theorem & Line Integrals over Closed Vector Fields",
    question_text: "Evaluate line integral integral_C (y^2 dx + 3xy dy) where C is boundary of region enclosed by y = x^2 and y = x.",
    answer_key_summary: "1. Apply Green's Theorem: double_integral (dQ/dx - dP/dy) dA\n2. dQ/dx = 3y, dP/dy = 2y -> integrand is y\n3. Result = 1/12",
    topics: ["Vector Calculus", "Green Theorem", "Line Integrals"]
  }
];

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('evaluations'); // 'evaluations', 'reasoning_map', 'doubts', 'pyq'
  const [submission, setSubmission] = useState(FALLBACK_SUBMISSION);
  const [loading, setLoading] = useState(false);
  const [retryModalStep, setRetryModalStep] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [retryFeedback, setRetryFeedback] = useState(null);

  // Doubt Center State
  const [doubtMessages, setDoubtMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I am your AI Reasoning Assistant. Ask any question about why your derivation step was marked weak or how to fix missing assumptions." }
  ]);
  const [doubtInput, setDoubtInput] = useState('');

  // PYQ State
  const [pyqSubject, setPyqSubject] = useState('ALL');
  const [expandedPyqId, setExpandedPyqId] = useState(null);

  const handleRetrySubmit = (step) => {
    if (!selectedOption) return;
    const isCorrect = (selectedOption === 'A');
    if (isCorrect) {
      setSubmission(prev => ({
        ...prev,
        total_ras_score: Math.min(100.0, prev.total_ras_score + 10.0),
        steps: prev.steps.map(s => s.id === step.id ? { ...s, status: 'MATCHED', retry_status: 'PASSED' } : s),
        reasoning_map: prev.reasoning_map.map(r => r.step_number === step.step_number ? { ...r, status: 'MATCHED', has_reasoning_break: false, similarity_pct: 85.0 } : r)
      }));
      setRetryFeedback({ isCorrect: true, text: step.retry_question.explanation });
    } else {
      setRetryFeedback({ isCorrect: false, text: "Incorrect. Make sure to establish standard reference state (T_0 = 298.15 K, P_0 = 1 atm) before evaluating energy balances." });
    }
  };

  const handleSendDoubt = (e) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;
    const qText = doubtInput;
    setDoubtMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: qText }]);
    setDoubtInput('');

    let aiResp = "";
    const qLower = qText.toLowerCase();
    if (qLower.includes("reference state") || qLower.includes("step 1")) {
      aiResp = "Step 1 failed because internal energy (u) and enthalpy (h) are state functions calculated relative to a reference state (T_0 = 298.15 K, P_0 = 1 atm). Omitting T_0 leaves the energy balance floating without zero-point baseline initialization.";
    } else if (qLower.includes("unit") || qLower.includes("bar")) {
      aiResp = "Pressure values given in bar must be multiplied by 100 to convert to kPa (1 bar = 100 kPa) before evaluating Work = P * (V2 - V1).";
    } else {
      aiResp = `Regarding your query "${qText}": Break your derivation into 5 atomic units: 1) State reference conditions, 2) Write conservation equation, 3) Perform integration, 4) Apply SI unit conversions, and 5) Evaluate net final result.`;
    }

    setTimeout(() => {
      setDoubtMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResp }]);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Top Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
              🩺
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hi, {user.full_name?.split(' ')[0] || "Mangalapalli"}!</h1>
              <p className="text-xs text-gray-600">Student Portal • Reg: {user.register_number || "26BCE0616"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-gray-100 text-sm font-medium pt-2">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
              activeTab === 'evaluations'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Submissions & Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning_map')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
              activeTab === 'reasoning_map'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Reasoning Map & Step Retries</span>
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
              activeTab === 'doubts'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>AI Doubt Center</span>
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
              activeTab === 'pyq'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>PYQ Repository Vault</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TAB 1: MY SUBMISSIONS & ANALYSIS */}
        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            
            {/* Performance Stats Cards */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Submissions</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">1</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Class Average</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{submission.total_ras_score.toFixed(1)}%</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Flagged</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">1</p>
                </div>
              </div>
            </section>

            {/* Submissions & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Submissions Selector */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> My Submissions
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 shadow-sm text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{submission.assignment_title}</h3>
                        <p className="text-xs text-gray-600 mt-1">Submitted: 29/8/2026</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{submission.total_ras_score.toFixed(0)}%</p>
                        <AlertCircle className="w-4 h-4 text-red-600 mt-1 inline" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Submission Analysis */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Submission Analysis
                </h2>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm space-y-6 overflow-hidden">
                  
                  {/* Score Banner */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Rubric-Alignment Score (RAS)</p>
                      <p className="text-4xl font-extrabold text-gray-900 mt-1">{submission.total_ras_score.toFixed(1)}%</p>
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        ✓ Passed Rubric Threshold
                      </span>
                    </div>

                    <div className="w-20 h-20 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shadow-inner">
                      <span className="text-2xl font-extrabold text-blue-600">{Math.round(submission.total_ras_score / 20)}/5</span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="px-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">OCR Confidence</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{(submission.ocr_confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">Reasoning Steps Analyzed</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{submission.steps.length}</p>
                    </div>
                  </div>

                  {/* Malpractice Flag Banner */}
                  {submission.is_collusion_flagged && (
                    <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-900 text-sm">Flagged for Review (CMI = 0.92)</p>
                        <p className="text-xs text-red-700 mt-1">
                          This submission was flagged by the Malpractice Radar due to identical step-1 reasoning omissions shared with Rayed Rabbanee (26BCE0606).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step Feedback */}
                  <div className="px-6 pb-6 space-y-4">
                    <h3 className="font-bold text-gray-900 text-base">Step-by-Step Feedback</h3>
                    <div className="space-y-3">
                      {submission.steps.map(step => (
                        <div key={step.id} className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-700">Step {step.step_number}: {step.rubric_unit?.label}</span>
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                              step.status === 'MATCHED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {step.status}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200">{step.student_text}</p>
                          <p className="text-xs text-gray-600">{step.diagnosis_text}</p>
                          
                          {step.status === 'WEAK' && (
                            <button
                              onClick={() => {
                                setRetryModalStep(step);
                                setSelectedOption('');
                                setRetryFeedback(null);
                              }}
                              className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Practice Step Retry Drill to recover marks
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: REASONING MAP & STEP RETRIES */}
        {activeTab === 'reasoning_map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Flowchart Reasoning Map</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Visualization highlighting broken steps vs matched reasoning logic across your derivation.
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">
                AI Diagnostics Engine
              </span>
            </div>

            {/* Flowchart Nodes Container */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm space-y-4">
              {submission.reasoning_map.map((node, idx) => (
                <div key={idx} className="relative">
                  <div className={`p-5 rounded-xl border-2 transition ${
                    node.has_reasoning_break 
                      ? 'border-red-400 bg-red-50/50' 
                      : 'border-green-400 bg-green-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                          node.has_reasoning_break ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                        }`}>
                          {node.node_type}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{node.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-600">{node.similarity_pct}% Similarity</span>
                    </div>

                    <p className="text-xs font-mono text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                      "{node.student_claim}"
                    </p>

                    {node.has_reasoning_break && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">⚠️ Reasoning Break Detected</span>
                        <button
                          onClick={() => {
                            const stepObj = submission.steps.find(s => s.step_number === node.step_number);
                            setRetryModalStep(stepObj);
                            setSelectedOption('');
                            setRetryFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Retry Step Practice
                        </button>
                      </div>
                    )}
                  </div>

                  {idx < submission.reasoning_map.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI DOUBT CENTER */}
        {activeTab === 'doubts' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[560px]">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" /> AI Doubt Assistant
                </h3>
                <p className="text-xs text-gray-600">Ask conceptual doubts grounded strictly in your rubric requirements.</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {doubtMessages.map(m => (
                <div key={m.id} className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-xl max-w-xl leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'bg-gray-100 text-gray-900 font-mono border border-gray-200'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendDoubt} className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Ask why Step 1 was marked weak..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
              >
                Ask Assistant
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PYQ VAULT */}
        {activeTab === 'pyq' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">PYQ Repository Vault</h2>
                <p className="text-xs text-gray-600 mt-1">Previous Year Exam Questions (CAT-1, CAT-2, FAT) with solution schemes.</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                Past Papers Archive
              </span>
            </div>

            <div className="space-y-4">
              {PYQ_LIST.map(q => (
                <div key={q.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-md">{q.exam_type} ({q.year})</span>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md">{q.subject}</span>
                    </div>
                    <button
                      onClick={() => setExpandedPyqId(expandedPyqId === q.id ? null : q.id)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {expandedPyqId === q.id ? 'Hide Solution Scheme' : 'View Solution Scheme'}
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{q.title}</h3>
                  <p className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">{q.question_text}</p>

                  {expandedPyqId === q.id && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-mono text-gray-800 space-y-1">
                      <p className="font-bold text-emerald-900">Atomic Marking Scheme:</p>
                      <pre className="whitespace-pre-wrap">{q.answer_key_summary}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* STEP RETRY MODAL */}
      {retryModalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Step {retryModalStep.step_number} Practice Retry
              </h3>
              <button onClick={() => setRetryModalStep(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-700 font-semibold">{retryModalStep.retry_question?.prompt}</p>

            <div className="space-y-2">
              {retryModalStep.retry_question?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt.charAt(0))}
                  className={`w-full p-3 rounded-xl border text-xs text-left font-medium transition ${
                    selectedOption === opt.charAt(0)
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {retryFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                retryFeedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {retryFeedback.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRetryModalStep(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleRetrySubmit(retryModalStep)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-md"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
