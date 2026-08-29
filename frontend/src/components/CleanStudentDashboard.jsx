import React, { useState } from 'react';
import { LogOut, FileText, TrendingUp, AlertCircle, HelpCircle, BookOpen, Layers, Send, Play, X, Shield } from 'lucide-react';

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
      id: 1, step_number: 1, student_text: "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", similarity_score: 0.41, status: "WEAK",
      diagnosis_text: "Reasoning break at Step 1: Reference state T_0 = 298.15 K missing.",
      retry_question: {
        prompt: "Which reference state parameters must be defined before applying Q - W = delta U?",
        options: [
          "A) Standard Temperature (T_0 = 298.15 K) and Standard Pressure (P_0 = 1 atm)",
          "B) Maximum pressure reached during compression phase only",
          "C) Arbitrary initial pressure without temperature grounding",
          "D) No reference state is needed for closed systems"
        ],
        explanation: "Correct. Energy balance evaluations require an established reference state (T_0 = 298.15 K, P_0 = 1 atm)."
      },
      rubric_unit: { id: 1, category: "concept", label: "1. Reference State", expected_text: "Establish reference state T_0 = 298.15 K, P_0 = 1 atm.", weight: 0.20 }
    },
    {
      id: 2, step_number: 2, student_text: "Q - W = delta U where delta U = m * c_v * (T2 - T1)", similarity_score: 0.88, status: "MATCHED",
      diagnosis_text: "Step 2 matched the rubric requirement for First Law Energy Balance.",
      rubric_unit: { id: 2, category: "formula", label: "2. Energy Balance", expected_text: "Q - W = delta U.", weight: 0.20 }
    },
    {
      id: 3, step_number: 3, student_text: "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", similarity_score: 0.89, status: "MATCHED",
      diagnosis_text: "Step 3 matched boundary work integration requirement.",
      rubric_unit: { id: 3, category: "intermediate_step", label: "3. Work Integration", expected_text: "W = P*(V2 - V1) = 145.2 kJ.", weight: 0.25 }
    },
    {
      id: 4, step_number: 4, student_text: "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", similarity_score: 0.91, status: "MATCHED",
      diagnosis_text: "Step 4 matched unit conversion requirements.",
      rubric_unit: { id: 4, category: "units", label: "4. Unit Conversions", expected_text: "Convert bar to kPa.", weight: 0.15 }
    },
    {
      id: 5, step_number: 5, student_text: "Q_net = 384.6 kJ", similarity_score: 0.94, status: "MATCHED",
      diagnosis_text: "Step 5 matched final heat transfer answer.",
      rubric_unit: { id: 5, category: "final_answer", label: "5. Final Result", expected_text: "Q_net = 384.6 kJ.", weight: 0.20 }
    }
  ],
  reasoning_map: [
    { step_number: 1, node_type: "concept", title: "1. Reference State", student_claim: "Applied equation directly without T_0.", status: "WEAK", has_reasoning_break: true, similarity_pct: 41.0 },
    { step_number: 2, node_type: "formula", title: "2. Energy Balance", student_claim: "Q - W = delta U", status: "MATCHED", has_reasoning_break: false, similarity_pct: 88.0 },
    { step_number: 3, node_type: "intermediate_step", title: "3. Work Integration", student_claim: "W = P*(V2 - V1) = 145.2 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 89.0 },
    { step_number: 4, node_type: "units", title: "4. Unit Conversions", status: "MATCHED", has_reasoning_break: false, similarity_pct: 91.0, student_claim: "1.45 bar = 145 kPa" },
    { step_number: 5, node_type: "final_answer", title: "5. Final Result", student_claim: "Q_net = 384.6 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 94.0 }
  ]
};

const STEP_BAR_ITEMS = [
  { step: 'Step 1', score: 41, color: 'bg-red-600' },
  { step: 'Step 2', score: 88, color: 'bg-emerald-600' },
  { step: 'Step 3', score: 89, color: 'bg-emerald-600' },
  { step: 'Step 4', score: 91, color: 'bg-emerald-600' },
  { step: 'Step 5', score: 94, color: 'bg-emerald-600' }
];

const PYQ_LIST = [
  {
    id: 1, subject: "Applied Thermodynamics", year: 2025, exam_type: "FAT", difficulty: "Hard",
    title: "Second Law Analysis & Entropy Generation in Polytropic Expansion",
    question_text: "A closed system undergoes a polytropic expansion from 5 bar, 500 K to 1 bar. Calculate net entropy generation S_gen and exergy loss assuming T_0 = 298 K.",
    answer_key_summary: "1. State polytropic relation P1*V1^n = P2*V2^n\n2. S_2 - S_1 = c_p*ln(T2/T1) - R*ln(P2/P1)\n3. Exergy destruction X_destroyed = T_0 * S_gen = 42.8 kJ"
  },
  {
    id: 2, subject: "Applied Thermodynamics", year: 2024, exam_type: "CAT-2", difficulty: "Hard",
    title: "Rankine Cycle with Reheat & Regeneration Efficiency",
    question_text: "For a steam power plant operating on ideal reheat Rankine cycle between 15 MPa and 10 kPa with reheat at 3 MPa to 500°C, evaluate thermal efficiency.",
    answer_key_summary: "1. Pump work W_p = v1*(P2 - P1)\n2. Turbine work W_t1 = h1 - h2\n3. Thermal efficiency eta_th = W_net / Q_in = 43.5%"
  }
];

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('evaluations');
  const [submission, setSubmission] = useState(FALLBACK_SUBMISSION);
  const [retryModalStep, setRetryModalStep] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [retryFeedback, setRetryFeedback] = useState(null);

  const [doubtMessages, setDoubtMessages] = useState([
    { id: 1, sender: 'ai', text: "AnswerDoctor AI Assistant initialized. Enter specific questions regarding step-by-step derivation alignment or reference state definitions." }
  ]);
  const [doubtInput, setDoubtInput] = useState('');
  const [expandedPyqId, setExpandedPyqId] = useState(null);

  const [hwTitle, setHwTitle] = useState('Applied Thermodynamics Homework 3');
  const [hwStep1, setHwStep1] = useState('State reference conditions T_0 = 298.15 K and P_0 = 1 atm.');
  const [hwStep2, setHwStep2] = useState('Energy balance Q - W = delta U = m * c_v * (T2 - T1).');
  const [hwStep3, setHwStep3] = useState('Calculated boundary work W = 145.2 kJ and Q_net = 384.6 kJ.');
  const [hwResult, setHwResult] = useState(null);

  const handleRetrySubmit = (step) => {
    if (!selectedOption) return;
    const isCorrect = (selectedOption === 'A');
    if (isCorrect) {
      setSubmission(prev => ({
        ...prev,
        total_ras_score: Math.min(100.0, prev.total_ras_score + 10.0),
        steps: prev.steps.map(s => s.id === step.id ? { ...s, status: 'MATCHED' } : s),
        reasoning_map: prev.reasoning_map.map(r => r.step_number === step.step_number ? { ...r, status: 'MATCHED', has_reasoning_break: false, similarity_pct: 85.0 } : r)
      }));
      setRetryFeedback({ isCorrect: true, text: step.retry_question.explanation });
    } else {
      setRetryFeedback({ isCorrect: false, text: "Incorrect. Make sure to establish standard reference state (T_0 = 298.15 K, P_0 = 1 atm)." });
    }
  };

  const handleSendDoubt = (qText) => {
    if (!qText || !qText.trim()) return;
    const userMsg = qText.trim();
    setDoubtMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setDoubtInput('');

    let aiResp = "";
    const qLower = userMsg.toLowerCase();
    
    if (qLower.includes("step 1") || qLower.includes("reference state") || qLower.includes("fail")) {
      aiResp = "Step 1 failed because internal energy (u) and enthalpy (h) are state functions calculated relative to a reference state (T_0 = 298.15 K, P_0 = 1 atm). Omitting T_0 leaves the energy balance floating without zero-point baseline initialization.";
    } else if (qLower.includes("bar") || qLower.includes("kpa") || qLower.includes("unit")) {
      aiResp = "Unit Conversion Protocol: 1 bar = 100 kPa = 10^5 N/m^2. When substituting pressure into boundary work integral W = integral P dV in SI units (kJ), multiply bar values by 100 to get kPa.";
    } else if (qLower.includes("polytropic") || qLower.includes("work")) {
      aiResp = "Polytropic Boundary Work Formula: W_12 = (P_1*V_1 - P_2*V_2) / (n - 1). Ensure n != 1. For ideal gas, this simplifies to m*R*(T_1 - T_2) / (n - 1).";
    } else {
      aiResp = `Analysis for "${userMsg}": Break your answer into 5 atomic units: 1) Reference State, 2) First Law Equation, 3) Work Integral, 4) Unit Conversions, 5) Final Answer with Units.`;
    }

    setTimeout(() => {
      setDoubtMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResp }]);
    }, 250);
  };

  const handleRunSelfEvaluation = (e) => {
    e.preventDefault();
    const step1Lower = (hwStep1 || '').toLowerCase();
    const step2Lower = (hwStep2 || '').toLowerCase();
    const step3Lower = (hwStep3 || '').toLowerCase();

    let match1 = 0.40;
    if (step1Lower.includes('t_0') || step1Lower.includes('298') || step1Lower.includes('reference') || step1Lower.includes('boundary')) {
      match1 = 0.94;
    }

    let match2 = 0.45;
    if (step2Lower.includes('q - w') || step2Lower.includes('delta u') || step2Lower.includes('c_v') || step2Lower.includes('energy')) {
      match2 = 0.91;
    }

    let match3 = 0.50;
    if (step3Lower.includes('w') || step3Lower.includes('kj') || step3Lower.includes('145') || step3Lower.includes('384')) {
      match3 = 0.89;
    }

    const computedRas = Math.round(((match1 * 0.33) + (match2 * 0.33) + (match3 * 0.34)) * 100.0);

    setHwResult({
      assignment: hwTitle || "Applied Thermodynamics Homework",
      ras_score: computedRas,
      status: computedRas >= 70 ? "READY_FOR_SUBMISSION" : "NEEDS_REVISION",
      steps_matched: [
        { step: 1, text: hwStep1, match: match1, status: match1 >= 0.60 ? "MATCHED" : "WEAK", label: "1. Reference State Definition" },
        { step: 2, text: hwStep2, match: match2, status: match2 >= 0.60 ? "MATCHED" : "WEAK", label: "2. Energy Balance Equation" },
        { step: 3, text: hwStep3, match: match3, status: match3 >= 0.60 ? "MATCHED" : "WEAK", label: "3. Boundary Work & Heat Calculation" }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      
      {/* Off-white Header */}
      <header className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Student Portal: {user.full_name || "Mangalapalli Sohum"}</h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                Google Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{user.email || "student@vitstudent.ac.in"} | Reg: {user.register_number || "26BCE0616"}</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 border-t border-slate-200 text-xs font-semibold pt-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-3 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'evaluations'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Exam Submissions
          </button>

          <button
            onClick={() => setActiveTab('self_evaluator')}
            className={`px-3 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'self_evaluator'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Self-Evaluator Studio (Homework)
          </button>

          <button
            onClick={() => setActiveTab('reasoning_map')}
            className={`px-3 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'reasoning_map'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Reasoning Map & Retries
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-3 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'doubts'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Doubt Center
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-3 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'pyq'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            PYQ Vault Archive
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TAB 1: MY SUBMISSIONS */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            
            {/* 4 Performance Metric Cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded border border-slate-300 p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase">Submissions</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">1</p>
              </div>
              
              <div className="bg-slate-50 rounded border border-slate-300 p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase">Passed</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">1</p>
              </div>
              
              <div className="bg-slate-50 rounded border border-slate-300 p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase">Class Average RAS</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{submission.total_ras_score.toFixed(1)}%</p>
              </div>
              
              <div className="bg-slate-50 rounded border border-slate-300 p-4">
                <p className="text-xs text-slate-600 font-semibold uppercase">Collusion Status</p>
                <p className="text-2xl font-bold text-red-700 mt-1">1 Flagged</p>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Bar Chart */}
              <div className="bg-slate-50 rounded border border-slate-300 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Step-by-Step Similarity Alignment (%)</h3>
                  <span className="text-xs font-mono font-bold text-slate-700">5 Steps</span>
                </div>
                <p className="text-xs text-slate-600">Comparison of derivation steps against rubric expected values.</p>
                
                <div className="space-y-2.5 pt-1">
                  {STEP_BAR_ITEMS.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span>{item.step}</span>
                        <span>{item.score}% Match</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded h-2.5">
                        <div
                          className={`h-2.5 rounded ${item.color}`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut Chart */}
              <div className="bg-slate-50 rounded border border-slate-300 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Step Competency Breakdown</h3>
                  <span className="text-xs font-mono font-bold text-emerald-700">80% Pass Rate</span>
                </div>
                <p className="text-xs text-slate-600">Proportion of Matched Steps vs Weak Conceptual Steps.</p>
                
                <div className="flex items-center justify-around py-3">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-red-600"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-600"
                        strokeWidth="4"
                        strokeDasharray="80, 100"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-bold text-slate-900">4/5</span>
                      <span className="text-[10px] text-slate-600 font-semibold uppercase">Matched</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-600"></div>
                      <span className="text-slate-800">Matched Steps: 4 (80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-600"></div>
                      <span className="text-slate-800">Weak Steps: 1 (20%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Submissions List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Submissions List</h2>
                <div className="p-4 bg-slate-50 border border-blue-600 rounded text-left space-y-1">
                  <h3 className="font-bold text-slate-900 text-xs">{submission.assignment_title}</h3>
                  <p className="text-xs text-slate-600">Submitted: 29/08/2026</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">Score: {submission.total_ras_score.toFixed(0)}%</p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">Detailed Feedback</h2>

                <div className="bg-slate-50 border border-slate-300 rounded p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold">Reasoning Alignment Score (RAS)</p>
                      <p className="text-2xl font-bold text-slate-900">{submission.total_ras_score.toFixed(1)}%</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">Passed</span>
                  </div>

                  {submission.is_collusion_flagged && (
                    <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800 font-semibold">
                      Flagged for Collusion Audit: High similarity pair detected (CMI = 0.92). Shared reference state omission with Rayed Rabbanee.
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-900">Step Feedback:</h4>
                    {submission.steps.map(step => (
                      <div key={step.id} className="p-3 bg-white border border-slate-200 rounded text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Step {step.step_number}</span>
                          <span className={step.status === 'MATCHED' ? 'text-emerald-700' : 'text-red-700'}>{step.status}</span>
                        </div>
                        <p className="text-slate-700">{step.student_text}</p>
                        <p className="text-slate-500">{step.diagnosis_text}</p>

                        {step.status === 'WEAK' && (
                          <button
                            onClick={() => {
                              setRetryModalStep(step);
                              setSelectedOption('');
                              setRetryFeedback(null);
                            }}
                            className="mt-1 text-xs font-bold text-blue-700 hover:underline block"
                          >
                            Practice Step Retry Drill
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: STUDENT SELF-EVALUATOR STUDIO */}
        {activeTab === 'self_evaluator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-50 rounded border border-slate-300 p-5 space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">Self-Evaluator Studio (Homework Practice)</h3>
                <p className="text-xs text-slate-600 mt-0.5">Input homework derivation steps to compute pre-submission alignment scores.</p>
              </div>

              <form onSubmit={handleRunSelfEvaluation} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Homework Title</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Step 1: Reference State</label>
                  <textarea
                    rows={2}
                    value={hwStep1}
                    onChange={(e) => setHwStep1(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Step 2: Energy Balance</label>
                  <textarea
                    rows={2}
                    value={hwStep2}
                    onChange={(e) => setHwStep2(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Step 3: Integration & Result</label>
                  <textarea
                    rows={2}
                    value={hwStep3}
                    onChange={(e) => setHwStep3(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded font-mono text-slate-900 text-xs focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded text-xs transition"
                >
                  Run Self-Evaluation & Compute RAS
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="bg-slate-50 rounded border border-slate-300 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Evaluation Report</h3>
              {!hwResult ? (
                <div className="p-8 text-center border border-dashed border-slate-300 rounded text-xs text-slate-500">
                  Enter derivation steps on the left and click Run Self-Evaluation.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-white border border-slate-300 rounded flex justify-between items-center">
                    <div>
                      <p className="text-slate-600 font-semibold">{hwResult.assignment}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{hwResult.ras_score}% RAS Score</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">
                      Ready for Submission
                    </span>
                  </div>

                  <div className="space-y-2">
                    {hwResult.steps_matched.map((s, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{s.label}</span>
                          <span className="text-emerald-700">{(s.match * 100).toFixed(0)}%</span>
                        </div>
                        <p className="font-mono text-slate-600">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: REASONING MAP */}
        {activeTab === 'reasoning_map' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 border border-slate-300 rounded flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900">Flowchart Reasoning Map</h2>
              <span className="text-xs font-semibold text-slate-600">Diagnostics Engine</span>
            </div>

            <div className="bg-slate-50 p-6 border border-slate-300 rounded space-y-4">
              {submission.reasoning_map.map((node, idx) => (
                <div key={idx} className="space-y-2">
                  <div className={`p-4 rounded border text-xs ${
                    node.has_reasoning_break ? 'border-red-400 bg-red-50' : 'border-emerald-400 bg-emerald-50'
                  }`}>
                    <div className="flex justify-between font-bold text-slate-900 mb-1">
                      <span>{node.title}</span>
                      <span>{node.similarity_pct}% Similarity</span>
                    </div>
                    <p className="font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                      "{node.student_claim}"
                    </p>

                    {node.has_reasoning_break && (
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-red-700">Reasoning Break Detected</span>
                        <button
                          onClick={() => {
                            const stepObj = submission.steps.find(s => s.step_number === node.step_number);
                            setRetryModalStep(stepObj);
                            setSelectedOption('');
                            setRetryFeedback(null);
                          }}
                          className="px-2.5 py-1 bg-blue-700 text-white font-bold text-xs rounded hover:bg-blue-800"
                        >
                          Retry Step Practice
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AI DOUBT CENTER */}
        {activeTab === 'doubts' && (
          <div className="bg-slate-50 border border-slate-300 rounded flex flex-col h-[500px]">
            <div className="p-3 border-b border-slate-200 bg-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-xs">AI Doubt Assistant</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {doubtMessages.map(m => (
                <div key={m.id} className={`flex text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded max-w-lg ${
                    m.sender === 'user' ? 'bg-blue-700 text-white font-medium' : 'bg-white text-slate-900 border border-slate-300'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-slate-200 bg-slate-100 flex gap-2 text-xs">
              <span className="font-semibold text-slate-600">Suggested Questions:</span>
              <button
                onClick={() => handleSendDoubt("Why did Step 1 fail?")}
                className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-200"
              >
                Why did Step 1 fail?
              </button>
              <button
                onClick={() => handleSendDoubt("How to convert bar to kPa?")}
                className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-200"
              >
                How to convert bar to kPa?
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendDoubt(doubtInput); }} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded">
                Send Question
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: PYQ VAULT */}
        {activeTab === 'pyq' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-300 rounded">
              <h2 className="text-sm font-bold text-slate-900">PYQ Repository Vault</h2>
            </div>

            <div className="space-y-3">
              {PYQ_LIST.map(q => (
                <div key={q.id} className="bg-slate-50 p-4 border border-slate-300 rounded space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{q.exam_type} ({q.year})</span>
                    <button
                      onClick={() => setExpandedPyqId(expandedPyqId === q.id ? null : q.id)}
                      className="font-bold text-blue-700 hover:underline"
                    >
                      {expandedPyqId === q.id ? 'Hide Solution' : 'View Solution'}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{q.title}</h3>
                  <p className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800">{q.question_text}</p>

                  {expandedPyqId === q.id && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono text-slate-800">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded max-w-lg w-full p-6 space-y-4 border border-slate-300">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Step {retryModalStep.step_number} Practice Retry</h3>
              <button onClick={() => setRetryModalStep(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium">{retryModalStep.retry_question?.prompt}</p>

            <div className="space-y-2">
              {retryModalStep.retry_question?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt.charAt(0))}
                  className={`w-full p-2.5 rounded border text-xs text-left font-medium transition ${
                    selectedOption === opt.charAt(0)
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {retryFeedback && (
              <div className={`p-2.5 rounded text-xs font-bold ${
                retryFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {retryFeedback.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRetryModalStep(null)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded">
                Close
              </button>
              <button onClick={() => handleRetrySubmit(retryModalStep)} className="px-4 py-1.5 bg-blue-700 text-white text-xs font-bold rounded">
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer with Terms of Service & Privacy Policy */}
      <footer className="border-t border-slate-200 bg-slate-50 py-4 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>AnswerDoctor Enterprise Systems</span>
          <div className="flex gap-4">
            <a href="#tos" className="hover:underline">Terms of Service</a>
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
