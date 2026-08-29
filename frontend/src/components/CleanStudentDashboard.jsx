import React, { useState } from 'react';
import { 
  LogOut, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, 
  HelpCircle, BookOpen, Layers, Send, Play, X, ShieldCheck, Search, ChevronRight, ArrowUpRight
} from 'lucide-react';

const FALLBACK_SUBMISSION = {
  submission_id: 1,
  assignment_id: 1,
  assignment_title: "Applied Thermodynamics CAT-1 Exam: First Law & Reference State Equations",
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
      rubric_unit: { id: 1, category: "concept", label: "1. Reference State Baseline", expected_text: "Establish reference state T_0 = 298.15 K, P_0 = 1 atm.", weight: 0.20 }
    },
    {
      id: 2, step_number: 2, student_text: "Q - W = delta U where delta U = m * c_v * (T2 - T1)", similarity_score: 0.88, status: "MATCHED",
      diagnosis_text: "Step 2 matched the rubric requirement for First Law Energy Balance.",
      rubric_unit: { id: 2, category: "formula", label: "2. Energy Balance Equation", expected_text: "Q - W = delta U.", weight: 0.20 }
    },
    {
      id: 3, step_number: 3, student_text: "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", similarity_score: 0.89, status: "MATCHED",
      diagnosis_text: "Step 3 matched boundary work integration requirement.",
      rubric_unit: { id: 3, category: "intermediate_step", label: "3. Boundary Work Integration", expected_text: "W = P*(V2 - V1) = 145.2 kJ.", weight: 0.25 }
    },
    {
      id: 4, step_number: 4, student_text: "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", similarity_score: 0.91, status: "MATCHED",
      diagnosis_text: "Step 4 matched unit conversion requirements.",
      rubric_unit: { id: 4, category: "units", label: "4. Unit Conversions Protocol", expected_text: "Convert bar to kPa.", weight: 0.15 }
    },
    {
      id: 5, step_number: 5, student_text: "Q_net = 384.6 kJ", similarity_score: 0.94, status: "MATCHED",
      diagnosis_text: "Step 5 matched final heat transfer answer.",
      rubric_unit: { id: 5, category: "final_answer", label: "5. Final Heat Transfer Result", expected_text: "Q_net = 384.6 kJ.", weight: 0.20 }
    }
  ],
  reasoning_map: [
    { step_number: 1, node_type: "concept", title: "1. Reference State Baseline", student_claim: "Applied equation directly without T_0.", status: "WEAK", has_reasoning_break: true, similarity_pct: 41.0 },
    { step_number: 2, node_type: "formula", title: "2. Energy Balance Equation", student_claim: "Q - W = delta U", status: "MATCHED", has_reasoning_break: false, similarity_pct: 88.0 },
    { step_number: 3, node_type: "intermediate_step", title: "3. Boundary Work Integration", student_claim: "W = P*(V2 - V1) = 145.2 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 89.0 },
    { step_number: 4, node_type: "units", title: "4. Unit Conversions Protocol", student_claim: "1.45 bar = 145 kPa", status: "MATCHED", has_reasoning_break: false, similarity_pct: 91.0 },
    { step_number: 5, node_type: "final_answer", title: "5. Final Heat Transfer Result", student_claim: "Q_net = 384.6 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 94.0 }
  ]
};

const ALIGN_BAR_ITEMS = [
  { step: 'Step 1: Baseline', score: 41, color: 'bg-rose-500' },
  { step: 'Step 2: Energy Eq', score: 88, color: 'bg-emerald-500' },
  { step: 'Step 3: Work Integr', score: 89, color: 'bg-emerald-500' },
  { step: 'Step 4: Unit Conv', score: 91, color: 'bg-emerald-500' },
  { step: 'Step 5: Final Result', score: 94, color: 'bg-emerald-500' }
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
    { id: 1, sender: 'ai', text: "AnswerDoctor AlignUI Assistant active. Enter questions regarding step-by-step derivation alignment or reference state definitions." }
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
      setRetryFeedback({ isCorrect: false, text: "Incorrect. Establish standard reference state (T_0 = 298.15 K, P_0 = 1 atm)." });
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      
      {/* AlignUI Header Component */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          
          {/* Brand & Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
                AD
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">AnswerDoctor</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs w-64">
              <Search size={14} className="text-slate-400" />
              <span>Search derivations or units...</span>
              <span className="ml-auto font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">⌘K</span>
            </div>
          </div>

          {/* User Status Badge & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-bold text-xs text-slate-900">{user.full_name || "Mangalapalli Sohum"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={10} /> Google Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Reg: {user.register_number || "26BCE0616"}</p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>

        </div>

        {/* AlignUI Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'evaluations'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Exam Analytics
          </button>

          <button
            onClick={() => setActiveTab('self_evaluator')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'self_evaluator'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Self-Evaluator Studio (Homework)
          </button>

          <button
            onClick={() => setActiveTab('reasoning_map')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'reasoning_map'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Reasoning Map & Step Drills
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'doubts'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            AI Doubt Assistant
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'pyq'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            PYQ Vault Archive
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* TAB 1: EXAM ANALYTICS & DASHBOARD */}
        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            
            {/* AlignUI Performance Metrics Strip */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Submissions</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">1</span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ArrowUpRight size={12} /> Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Applied Thermodynamics CAT-1</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Evaluation Status</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-emerald-700">Passed</span>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    60.0% RAS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Threshold: 60.0% Minimum</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cohort Class Avg</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-blue-600">74.5%</span>
                  <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    240 Cohort
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">+14.5% above baseline</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">CMI Collusion Audit</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-rose-600">0.92 CMI</span>
                  <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Flagged
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Shared error pattern detected</p>
              </div>

            </section>

            {/* AlignUI Chart & Distribution Cards */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Step-by-Step Similarity Alignment Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Step-by-Step Alignment Rate</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Semantic vector match percentage per derivation step.</p>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                    5 Atomic Steps
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {ALIGN_BAR_ITEMS.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span className="text-slate-700 font-medium">{item.step}</span>
                        <span className="font-mono text-slate-900 font-bold">{item.score}% Match</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competency Distribution Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Step Competency Distribution</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ratio of verified matched steps vs reasoning breaks.</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                    80% Pass Rate
                  </span>
                </div>

                <div className="flex items-center justify-around py-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-rose-500"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeWidth="3.5"
                        strokeDasharray="80, 100"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight">4/5</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Matched</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-800 font-medium">Matched Units: 4 (80%)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-slate-800 font-medium">Reasoning Breaks: 1 (20%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Detailed Step Diagnostics Card */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Detailed Derivation Feedback</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Itemized diagnostic feedback per derivation line.</p>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  RAS Score: {submission.total_ras_score.toFixed(1)}%
                </span>
              </div>

              {submission.is_collusion_flagged && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertCircle size={15} />
                    <span>Collusion Audit Notice (CMI = 0.92)</span>
                  </div>
                  <p>Flagged for shared reference state omission at Step 1 with student Rayed Rabbanee (26BCE0606).</p>
                </div>
              )}

              <div className="space-y-4">
                {submission.steps.map(step => (
                  <div key={step.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Step {step.step_number}: {step.rubric_unit?.label}</span>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        step.status === 'MATCHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {step.status} ({(step.similarity_score * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <p className="font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                      {step.student_text}
                    </p>
                    <p className="text-slate-500 text-xs">{step.diagnosis_text}</p>

                    {step.status === 'WEAK' && (
                      <button
                        onClick={() => {
                          setRetryModalStep(step);
                          setSelectedOption('');
                          setRetryFeedback(null);
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                      >
                        Launch Practice Step Retry Drill <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: SELF-EVALUATOR STUDIO */}
        {activeTab === 'self_evaluator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Self-Evaluator Studio (Homework Pre-Submission)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Test homework derivations before turning them in to faculty.</p>
              </div>

              <form onSubmit={handleRunSelfEvaluation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Homework Title</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Step 1: Reference State Baseline</label>
                  <textarea
                    rows={2}
                    value={hwStep1}
                    onChange={(e) => setHwStep1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Step 2: Energy Balance Equation</label>
                  <textarea
                    rows={2}
                    value={hwStep2}
                    onChange={(e) => setHwStep2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Step 3: Work Integration & Final Heat Result</label>
                  <textarea
                    rows={2}
                    value={hwStep3}
                    onChange={(e) => setHwStep3(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
                >
                  Run AlignUI Instant Self-Evaluation & Compute RAS
                </button>
              </form>
            </div>

            {/* Live Evaluation Report Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Evaluation Report</h3>
                <span className="text-xs font-semibold text-slate-500">Live Diagnostics</span>
              </div>

              {!hwResult ? (
                <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Input homework derivation steps on the left and click Run Self-Evaluation.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-slate-600 font-semibold">{hwResult.assignment}</p>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">{hwResult.ras_score}% RAS Score</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Ready for Submission
                    </span>
                  </div>

                  <div className="space-y-3">
                    {hwResult.steps_matched.map((s, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-900 font-bold">{s.label}</span>
                          <span className="text-emerald-600 font-mono font-bold">{(s.match * 100).toFixed(0)}%</span>
                        </div>
                        <p className="font-mono text-slate-600 text-xs">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: REASONING MAP FLOWCHART */}
        {activeTab === 'reasoning_map' && (
          <div className="space-y-6">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Flowchart Reasoning Map Diagnostics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visual map of step-by-step mathematical logic and reasoning breaks.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md border border-slate-200">
                5 Active Nodes
              </span>
            </div>

            <div className="space-y-4">
              {submission.reasoning_map.map((node, idx) => (
                <div key={idx} className={`p-5 rounded-xl border shadow-xs space-y-2 text-xs ${
                  node.has_reasoning_break ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span className="text-sm">{node.title}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                      node.has_reasoning_break ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {node.similarity_pct}% Similarity
                    </span>
                  </div>

                  <p className="font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    "{node.student_claim}"
                  </p>

                  {node.has_reasoning_break && (
                    <div className="mt-3 flex justify-between items-center pt-2 border-t border-rose-200">
                      <span className="font-bold text-rose-700">Reasoning Break Detected: Missing Baseline Reference State</span>
                      <button
                        onClick={() => {
                          const stepObj = submission.steps.find(s => s.step_number === node.step_number);
                          setRetryModalStep(stepObj);
                          setSelectedOption('');
                          setRetryFeedback(null);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Retry Step Practice
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AI DOUBT ASSISTANT */}
        {activeTab === 'doubts' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[520px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">AI Doubt Assistant</h3>
                <p className="text-[11px] text-slate-500">Step derivation tutor & concept clarification.</p>
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {doubtMessages.map(m => (
                <div key={m.id} className={`flex text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3.5 rounded-xl max-w-lg ${
                    m.sender === 'user' ? 'bg-blue-600 text-white font-medium shadow-xs' : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex gap-2 text-xs overflow-x-auto">
              <span className="font-semibold text-slate-500 whitespace-nowrap">Suggested Prompts:</span>
              <button
                onClick={() => handleSendDoubt("Why did Step 1 fail?")}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 font-medium whitespace-nowrap"
              >
                Why did Step 1 fail?
              </button>
              <button
                onClick={() => handleSendDoubt("How to convert bar to kPa?")}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 font-medium whitespace-nowrap"
              >
                How to convert bar to kPa?
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendDoubt(doubtInput); }} className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex gap-2">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium"
              />
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: PYQ VAULT ARCHIVE */}
        {activeTab === 'pyq' && (
          <div className="space-y-4">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">PYQ Repository Vault Archive</h2>
              <p className="text-xs text-slate-500 mt-0.5">Past year examination papers and atomic marking schemes.</p>
            </div>

            <div className="space-y-4">
              {PYQ_LIST.map(q => (
                <div key={q.id} className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{q.exam_type} ({q.year})</span>
                    <button
                      onClick={() => setExpandedPyqId(expandedPyqId === q.id ? null : q.id)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {expandedPyqId === q.id ? 'Hide Solution' : 'View Solution'}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{q.title}</h3>
                  <p className="font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800">{q.question_text}</p>

                  {expandedPyqId === q.id && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg font-mono text-slate-800">
                      <pre className="whitespace-pre-wrap">{q.answer_key_summary}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* AlignUI Step Retry Modal */}
      {retryModalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Step {retryModalStep.step_number} Practice Retry</h3>
              <button onClick={() => setRetryModalStep(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium">{retryModalStep.retry_question?.prompt}</p>

            <div className="space-y-2">
              {retryModalStep.retry_question?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt.charAt(0))}
                  className={`w-full p-3 rounded-lg border text-xs text-left font-medium transition ${
                    selectedOption === opt.charAt(0)
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {retryFeedback && (
              <div className={`p-3 rounded-lg text-xs font-bold ${
                retryFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {retryFeedback.text}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRetryModalStep(null)} className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                Close
              </button>
              <button onClick={() => handleRetrySubmit(retryModalStep)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs">
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AlignUI Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="font-medium">AnswerDoctor Enterprise Systems • AlignUI Inspired</span>
          <div className="flex gap-6 font-semibold">
            <a href="#tos" className="hover:text-slate-900">Terms of Service</a>
            <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
