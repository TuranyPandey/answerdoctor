import React, { useState } from 'react';
import { 
  LogOut, Users, BookOpen, BarChart3, ShieldAlert, 
  Sparkles, Send, FileText, CheckCircle, Search, Grid
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008/api';

const FALLBACK_ANALYTICS = {
  class_average_ras: 74.5,
  cohort_total_scripts: 240,
  weakness_heatmap: [
    { rubric_unit_id: 1, label: "1. System boundary", pass_rate_pct: 50.0, weakness_level: "HIGH" },
    { rubric_unit_id: 2, label: "2. First Law", pass_rate_pct: 100.0, weakness_level: "LOW" },
    { rubric_unit_id: 3, label: "3. Work Integration", pass_rate_pct: 100.0, weakness_level: "LOW" },
    { rubric_unit_id: 4, label: "4. Unit Conversions", pass_rate_pct: 75.0, weakness_level: "MODERATE" },
    { rubric_unit_id: 5, label: "5. Final Answer", pass_rate_pct: 100.0, weakness_level: "LOW" }
  ],
  error_clusters: [
    { id: 1, cluster_name: "Unspecified Reference State Baseline", frequency: 80, percentage: 33.3, description: "Students applied first law enthalpy equations directly without defining baseline reference temperature T_0 and pressure P_0." },
    { id: 2, cluster_name: "Bar to kPa Unit Conversion Slip", frequency: 45, percentage: 18.8, description: "Students substituted pressure values in bar directly into SI equations without multiplying by 100 kPa/bar factor." }
  ]
};

const RUBRIC_BAR_ITEMS = [
  { name: '1. Ref State', passRate: 50, color: 'bg-red-500' },
  { name: '2. First Law', passRate: 100, color: 'bg-green-500' },
  { name: '3. Work Integr.', passRate: 100, color: 'bg-green-500' },
  { name: '4. Unit Conv.', passRate: 75, color: 'bg-amber-500' },
  { name: '5. Final Ans.', passRate: 100, color: 'bg-green-500' }
];

const FALLBACK_MALPRACTICE = {
  total_flagged_pairs: 1,
  cmi_threshold: 0.88,
  collusion_pairs: [
    { id: 1, student_a_name: "Mangalapalli Sohum Seshu Krish", student_a_reg: "26BCE0616", student_b_name: "Rayed Rabbanee", student_b_reg: "26BCE0606", cmi_score: 0.92, cos_sim: 0.94, error_match_score: 0.90, flagged_reason: "High CMI (0.92 >= 0.88). Shared identical non-standard reference state omission at Step 1.", status: "FLAGGED" }
  ]
};

export default function TeacherDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'malpractice', 'auto_evaluator', 'pyq'
  
  // Custom Dynamic Assignment Creation
  const [assTitle, setAssTitle] = useState('');
  const [assKeyText, setAssKeyText] = useState('');
  const [evalMsg, setEvalMsg] = useState('');

  // Custom Student Evaluation Form
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [step1Text, setStep1Text] = useState('');
  const [step2Text, setStep2Text] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [assignmentId, setAssignmentId] = useState(1);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleCreateRubric = async (e) => {
    e.preventDefault();
    setActionBusy(true);
    setActionError('');
    setEvalMsg('');
    try {
      const response = await fetch(`${API_BASE}/assignments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assTitle,
          subject: 'Applied Thermodynamics',
          classroom_id: 1,
          answer_key_text: assKeyText,
          total_marks: 100
        })
      });
      if (!response.ok) throw new Error(await response.text());
      const assignment = await response.json();
      setAssignmentId(assignment.id);
      setEvalMsg(`Assignment ${assignment.id} saved. Its rubric is ready for deterministic step matching.`);
    } catch (error) {
      setActionError('Could not save the rubric. Start the FastAPI backend on port 8008 and try again.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleEvaluateCustomScript = async (e) => {
    e.preventDefault();
    setActionBusy(true);
    setActionError('');
    setEvalResult(null);
    try {
      const response = await fetch(`${API_BASE}/submissions/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignmentId,
          student_name: studentName,
          register_number: regNo,
          steps: [
            { step_number: 1, student_text: step1Text, has_diagram: false },
            { step_number: 2, student_text: step2Text || 'Q - W = delta U', has_diagram: false }
          ]
        })
      });
      if (!response.ok) throw new Error(await response.text());
      setEvalResult(await response.json());
    } catch (error) {
      setActionError('Evaluation failed. Confirm the backend is running and the selected assignment has rubric units.');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="readable-dashboard min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.full_name || "Prof. Rajesh Sharma"}</h1>
            <p className="text-xs text-gray-600 mt-0.5">Teacher workspace • {user.email || "prof.sharma@vit.ac.in"} • Mechanical Engineering</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition whitespace-nowrap"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-gray-100 text-sm font-medium pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Class Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('malpractice')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'malpractice'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Similarity Review</span>
          </button>

          <button
            onClick={() => setActiveTab('auto_evaluator')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'auto_evaluator'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Grade an Answer</span>
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
            <span>Past Papers</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main key={activeTab} className="dashboard-view-transition max-w-7xl mx-auto px-6 py-8">
        
        {/* TAB 1: CLASSROOM ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Average Reasoning Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">74.5%</p>
                <p className="text-xs text-gray-500 mt-1">RAS: score against the marking guide</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Demo Class Size</p>
                <p className="text-3xl font-bold text-green-600 mt-2">240 Simulated Answers</p>
                <p className="text-xs text-gray-500 mt-1">Illustrative cohort, not uploaded scripts</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Similar Answers to Review</p>
                <p className="text-3xl font-bold text-red-600 mt-2">1 Pair</p>
              </div>
            </div>

            {/* PICTORIAL CHARTS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Bar Chart: Rubric Unit Pass Rates */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Where Students Lost Marks</h3>
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">74.5% Class Avg</span>
                </div>
                <p className="text-xs text-gray-500">Percentage of the demo class meeting each part of the marking guide.</p>
                
                <div className="space-y-3 pt-2">
                  {RUBRIC_BAR_ITEMS.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.name}</span>
                        <span>{item.passRate}% Pass Rate</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart / Donut Chart: Cohort Performance Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Demo Class Score Distribution</h3>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">Seeded scenario</span>
                </div>
                <p className="text-xs text-gray-500">Breakdown of student cohort by performance brackets.</p>
                
                <div className="flex items-center justify-around py-4">
                  {/* SVG Donut Chart */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-red-500" strokeWidth="4" stroke="currentColor" fill="none" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-500" strokeWidth="4" strokeDasharray="83, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-green-500" strokeWidth="4" strokeDasharray="50, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-gray-900">240</span>
                      <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-green-500"></div>
                      <span className="text-gray-800">Distinction (&gt;80%): 120 (50%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-blue-500"></div>
                      <span className="text-gray-800">Average (60-80%): 80 (33.3%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-red-500"></div>
                      <span className="text-gray-800">Weak (&lt;60%): 40 (16.7%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Error Misconception Clusters */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Common Class Mistakes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FALLBACK_ANALYTICS.error_clusters.map(c => (
                  <div key={c.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{c.cluster_name}</span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">{c.frequency} Students ({c.percentage}%)</span>
                    </div>
                    <p className="text-xs text-gray-600">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MALPRACTICE RADAR */}
        {activeTab === 'malpractice' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Answers Needing a Similarity Check</h2>
                <p className="text-xs text-gray-600 mt-1">Highlights unusually similar wording and shared mistakes for a teacher to review. It never makes an automatic accusation.</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                Review threshold: 0.88 CMI
              </span>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Possible Similarity Match</h3>
              {FALLBACK_MALPRACTICE.collusion_pairs.map(pair => (
                <div key={pair.id} className="p-5 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-red-900 text-sm">
                      {pair.student_a_name} ({pair.student_a_reg}) ↔ {pair.student_b_name} ({pair.student_b_reg})
                    </h4>
                    <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded">
                      CMI = {pair.cmi_score}
                    </span>
                  </div>
                  <p className="text-xs text-red-800">{pair.flagged_reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUTO-EVALUATOR & RUBRIC STUDIO */}
        {activeTab === 'auto_evaluator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Create Custom Rubric Form */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Create a Marking Guide
              </h3>
              
              <form onSubmit={handleCreateRubric} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Exam Title</label>
                  <input
                    type="text"
                    value={assTitle}
                    onChange={(e) => setAssTitle(e.target.value)}
                    placeholder="e.g. Thermodynamics CAT-1 Exam"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Answer / Marking Scheme</label>
                  <textarea
                    rows={4}
                    value={assKeyText}
                    onChange={(e) => setAssKeyText(e.target.value)}
                    placeholder="1. Concept: Establish reference state T_0 = 298.15 K, P_0 = 1 atm.\n2. Formula: Q - W = delta U.\n3. Result: Q_net = 384.6 kJ."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionBusy}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {actionBusy ? 'Saving…' : 'Create and Save Marking Guide'}
                </button>
              </form>

              {evalMsg && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-xs font-bold">
                  {evalMsg}
                </div>
              )}
            </div>

            {/* Test Custom Student Derivation Form */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" /> Check a Student Answer
              </h3>

              <form onSubmit={handleEvaluateCustomScript} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reg Number</label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="26BCE0888"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Answer Step 1</label>
                  <input
                    type="text"
                    value={step1Text}
                    onChange={(e) => setStep1Text(e.target.value)}
                    placeholder="State reference conditions T_0 = 298.15 K."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Answer Step 2</label>
                  <input
                    type="text"
                    value={step2Text}
                    onChange={(e) => setStep2Text(e.target.value)}
                    placeholder="Q - W = delta U"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionBusy}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {actionBusy ? 'Checking…' : `Check Answer with Marking Guide ${assignmentId}`}
                </button>
              </form>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-bold">{actionError}</div>
              )}

              {evalResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span>{evalResult.student_name} ({evalResult.register_number})</span>
                    <span>Overall Score: {evalResult.total_ras_score}%</span>
                  </div>
                  <p className="text-green-700 font-bold">Saved as submission {evalResult.submission_id}. Result returned by FastAPI.</p>
                  <div className="space-y-1">
                    {evalResult.steps.map((step) => (
                      <p key={step.id} className="text-gray-700">Step {step.step_number}: {step.status === 'MATCHED' ? 'Meets the guide' : 'Needs review'} ({Math.round(step.similarity_score * 100)}% match)</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: PYQ VAULT */}
        {activeTab === 'pyq' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Past Paper Library</h3>
            <p className="text-xs text-gray-600">Previous examination questions and their marking guides, organized for teachers.</p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-gray-800">
              Applied Thermodynamics 2025 FAT • Multivariable Calculus 2025 CAT-1 • DSA 2024 CAT-2
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
