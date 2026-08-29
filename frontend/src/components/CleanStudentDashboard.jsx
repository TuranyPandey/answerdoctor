import React, { useEffect, useState } from 'react';
import { 
  LogOut, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, 
  HelpCircle, BookOpen, Layers, Sparkles, Send, Award, Target, Check, X
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
        explanation: "Correct! Energy balance evaluations require an established reference state (T_0 = 298.15 K, P_0 = 1 atm)."
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
    { step_number: 4, node_type: "units", title: "4. Unit Conversions", student_claim: "1.45 bar = 145 kPa", status: "MATCHED", has_reasoning_break: false, similarity_pct: 91.0 },
    { step_number: 5, node_type: "final_answer", title: "5. Final Result", student_claim: "Q_net = 384.6 kJ", status: "MATCHED", has_reasoning_break: false, similarity_pct: 94.0 }
  ]
};

const STEP_BAR_ITEMS = [
  { step: 'Step 1', score: 41, color: 'bg-red-500' },
  { step: 'Step 2', score: 88, color: 'bg-green-500' },
  { step: 'Step 3', score: 89, color: 'bg-green-500' },
  { step: 'Step 4', score: 91, color: 'bg-green-500' },
  { step: 'Step 5', score: 94, color: 'bg-green-500' }
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
  const [activeTab, setActiveTab] = useState('evaluations'); // 'evaluations', 'reasoning_map', 'doubts', 'pyq'
  const [submission, setSubmission] = useState(FALLBACK_SUBMISSION);
  const [retryModalStep, setRetryModalStep] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [retryFeedback, setRetryFeedback] = useState(null);
  const [dataSource, setDataSource] = useState('Loading backend data…');
  const [retryBusy, setRetryBusy] = useState(false);

  // Doubt Center State
  const [doubtMessages, setDoubtMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! Ask any question about why Step 1 failed or how to fix missing reference states." }
  ]);
  const [doubtInput, setDoubtInput] = useState('');
  const [expandedPyqId, setExpandedPyqId] = useState(null);

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        const response = await fetch(`${API_BASE}/submissions/student/${user.id}/assignment/1`);
        if (!response.ok) throw new Error('Submission unavailable');
        setSubmission(await response.json());
        setDataSource('Database-backed seeded submission');
      } catch (error) {
        setSubmission(FALLBACK_SUBMISSION);
        setDataSource('Local preview dataset — backend offline');
      }
    };
    loadSubmission();
  }, [user.id]);

  const handleRetrySubmit = async (step) => {
    if (!selectedOption) return;
    setRetryBusy(true);
    setRetryFeedback(null);
    try {
      const response = await fetch(`${API_BASE}/submissions/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: step.id, selected_option: selectedOption })
      });
      if (!response.ok) throw new Error('Retry unavailable');
      const result = await response.json();
      const refreshed = await fetch(`${API_BASE}/submissions/${submission.submission_id}`);
      if (!refreshed.ok) throw new Error('Could not refresh submission');
      setSubmission(await refreshed.json());
      setRetryFeedback({ isCorrect: result.is_correct, text: `${result.explanation} Updated RAS: ${result.new_total_ras}%.` });
    } catch (error) {
      setRetryFeedback({ isCorrect: false, text: 'The backend is offline, so this retry was not saved. Start FastAPI on port 8008.' });
    } finally {
      setRetryBusy(false);
    }
  };

  const handleSendDoubt = (qText) => {
    if (!qText.trim()) return;
    setDoubtMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: qText }]);
    setDoubtInput('');

    let aiResp = "";
    const qLower = qText.toLowerCase();
    if (qLower.includes("reference state") || qLower.includes("step 1")) {
      aiResp = "Step 1 failed because internal energy (u) and enthalpy (h) are state functions calculated relative to a reference state (T_0 = 298.15 K, P_0 = 1 atm). Omitting T_0 leaves the energy balance floating without zero-point baseline initialization.";
    } else {
      aiResp = `Regarding "${qText}": Break your derivation into 5 atomic units: 1) Reference State, 2) Conservation Equation, 3) Integration, 4) Units, 5) Final Answer.`;
    }

    setTimeout(() => {
      setDoubtMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResp }]);
    }, 350);
  };

  return (
    <div className="readable-dashboard min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Hi, {user.full_name || "Student Evaluator"}!</h1>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">{dataSource}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">Student workspace • {user.email || "student@vitstudent.ac.in"} • ID: {user.register_number || "26BCE0616"}</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-gray-100 text-sm font-medium pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'evaluations'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Results</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning_map')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'reasoning_map'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Fix My Mistakes</span>
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'doubts'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Ask Why</span>
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'pyq'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Practice Papers</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TAB 1: MY SUBMISSIONS & CHARTS */}
        {activeTab === 'evaluations' && (
          <div className="space-y-8">
            
            {/* Quick Stats Cards */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Latest Result</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Answers Checked</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">1</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Your Latest Score</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{submission.total_ras_score.toFixed(1)}%</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600">Teacher Reviews</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">1</p>
                </div>
              </div>
            </section>

            {/* PICTORIAL CHARTS SECTION (Bar Chart & Pie Chart) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Visual Bar Chart: Step Similarity Scores */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">How Each Step Matched the Marking Guide</h3>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">5 Steps Analyzed</span>
                </div>
                <p className="text-xs text-gray-500">A step-by-step comparison with what the teacher expected.</p>
                
                <div className="space-y-3 pt-2">
                  {STEP_BAR_ITEMS.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.step}</span>
                        <span>{item.score}% Match</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Donut / Pie Chart: Step Competency Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Steps Meeting the Marking Guide</h3>
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">80% Pass Rate</span>
                </div>
                <p className="text-xs text-gray-500">How many answer steps are complete and how many need another attempt.</p>
                
                <div className="flex items-center justify-around py-4">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-red-500"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        strokeWidth="4"
                        strokeDasharray="80, 100"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-900">4/5</span>
                      <span className="text-xs text-gray-500 font-bold uppercase">Complete</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-green-500"></div>
                      <span className="text-gray-800">Complete Steps: 4 (80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-red-500"></div>
                      <span className="text-gray-800">Steps to Fix: 1 (20%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Submissions & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Submissions Selector */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> My Checked Answers
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border-2 border-blue-600 bg-blue-50 shadow-sm text-left">
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
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Detailed Result
                </h2>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm space-y-6">
                  
                  {/* Score Card */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Overall Reasoning Score</p>
                      <p className="text-4xl font-bold text-gray-900 mt-1">{submission.total_ras_score.toFixed(1)}%</p>
                      <p className="text-sm font-medium text-green-600 mt-2">✓ Passed</p>
                    </div>

                    <div className="w-20 h-20 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white">
                      <span className="text-2xl font-bold text-blue-600">{Math.round(submission.total_ras_score / 20)}/5</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">Demo Text-Reading Confidence</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{(submission.ocr_confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600">Steps Analyzed</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{submission.steps.length}</p>
                    </div>
                  </div>

                  {/* Malpractice Flag Banner */}
                  {submission.is_collusion_flagged && (
                    <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Teacher Similarity Review</p>
                        <p className="text-sm text-red-700 mt-1">
                          Parts of this answer resemble another submission. Your teacher will compare them; this is not an automatic misconduct decision.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="px-6 pb-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Where You Gained or Lost Marks</h3>
                    <div className="space-y-3">
                      {submission.steps.map(step => (
                        <div key={step.id} className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-gray-900">Step {step.step_number}: {step.status === 'MATCHED' ? 'Meets the guide' : 'Needs work'}</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              step.status === 'MATCHED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {step.status === 'MATCHED' ? 'Complete' : 'Needs work'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{step.student_text}</p>
                          <p className="text-xs text-gray-500">{step.diagnosis_text}</p>

                          {step.retry_status === 'PASSED' && (
                            <p className="text-xs font-bold text-green-700">Retry passed — recovery credit has been added to RAS.</p>
                          )}

                          {step.status === 'WEAK' && step.retry_status !== 'PASSED' && (
                            <button
                              onClick={() => {
                                setRetryModalStep(step);
                                setSelectedOption('');
                                setRetryFeedback(null);
                              }}
                              className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Practise this step to recover marks
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

        {/* TAB 2: REASONING MAP */}
        {activeTab === 'reasoning_map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">How Your Answer Progressed</h2>
                <p className="text-xs text-gray-600 mt-1">Follow your solution in order and see the first step that needs fixing.</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">
                Checked against the marking guide
              </span>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm space-y-4">
              {submission.reasoning_map.map((node, idx) => (
                <div key={idx} className="relative">
                  <div className={`p-5 rounded-lg border-2 transition ${
                    node.has_reasoning_break ? 'border-red-400 bg-red-50/50' : 'border-green-400 bg-green-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">{node.title}</h4>
                      <span className="text-xs font-mono font-bold text-gray-600">{node.similarity_pct}% match to guide</span>
                    </div>

                    <p className="text-xs font-mono text-gray-800 bg-white p-3 rounded border border-gray-200">
                      "{node.student_claim}"
                    </p>

                    {node.has_reasoning_break && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">First Step to Fix</span>
                        <button
                          onClick={() => {
                            const stepObj = submission.steps.find(s => s.step_number === node.step_number);
                            setRetryModalStep(stepObj);
                            setSelectedOption('');
                            setRetryFeedback(null);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Practise This Step
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[520px]">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" /> Ask Why This Step Lost Marks
              </h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {doubtMessages.map(m => (
                <div key={m.id} className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-lg max-w-xl leading-relaxed ${
                    m.sender === 'user' ? 'bg-blue-600 text-white font-medium' : 'bg-gray-100 text-gray-900 font-mono border border-gray-200'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendDoubt(doubtInput); }} className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Ask why this step needs work..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
              >
                Get Explanation
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PYQ VAULT */}
        {activeTab === 'pyq' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Practice with Past Papers</h2>
            </div>

            <div className="space-y-4">
              {PYQ_LIST.map(q => (
                <div key={q.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">{q.exam_type} ({q.year})</span>
                    <button
                      onClick={() => setExpandedPyqId(expandedPyqId === q.id ? null : q.id)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {expandedPyqId === q.id ? 'Hide Solution Scheme' : 'View Solution Scheme'}
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{q.title}</h3>
                  <p className="text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded border border-gray-200">{q.question_text}</p>

                  {expandedPyqId === q.id && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs font-mono text-gray-800">
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
                <Sparkles className="w-5 h-5 text-purple-600" /> Practise Step {retryModalStep.step_number} Again
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
                  className={`w-full p-3 rounded-lg border text-xs text-left font-medium transition ${
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
              <div className={`p-3 rounded-lg text-xs font-bold ${
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
                disabled={retryBusy || !selectedOption}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50"
              >
                {retryBusy ? 'Saving…' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
