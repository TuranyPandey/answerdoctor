import React, { useEffect, useState } from 'react';
import { 
  LogOut, Users, BookOpen, BarChart3, ShieldAlert, 
  Sparkles, Send, FileText, CheckCircle, Search, Grid
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { API_BASE } from '../apiConfig';

export default function TeacherDashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'malpractice', 'auto_evaluator', 'pyq'
  
  // Custom Dynamic Assignment Creation
  const [assTitle, setAssTitle] = useState('');
  const [assSubject, setAssSubject] = useState('');
  const [assKeyText, setAssKeyText] = useState('');
  const [evalMsg, setEvalMsg] = useState('');

  // Custom Student Evaluation Form
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [step1Text, setStep1Text] = useState('');
  const [step2Text, setStep2Text] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [malpractice, setMalpractice] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        let response = await fetch(`${API_BASE}/classrooms/?teacher_id=${user.id}`);
        if (!response.ok) throw new Error('Could not load classrooms');
        let rooms = await response.json();
        if (!rooms.length) {
          response = await fetch(`${API_BASE}/classrooms/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `${user.full_name}'s class`, subject: 'General', teacher_id: user.id })
          });
          if (!response.ok) throw new Error('Could not create workspace');
          rooms = [await response.json()];
        }
        setClassroom(rooms[0]);
        response = await fetch(`${API_BASE}/assignments/?teacher_id=${user.id}`);
        if (!response.ok) throw new Error('Could not load assignments');
        const savedAssignments = await response.json();
        setAssignments(savedAssignments);
        if (savedAssignments.length) setAssignmentId(savedAssignments[0].id);
      } catch (error) { setActionError('Could not connect to the persistent workspace. Check the backend.'); }
    };
    loadWorkspace();
  }, [user.id, user.full_name]);

  const refreshReports = async (id) => {
    if (!id) { setAnalytics(null); setMalpractice(null); return; }
    const [analyticsResponse, malpracticeResponse] = await Promise.all([
      fetch(`${API_BASE}/analytics/assignment/${id}`),
      fetch(`${API_BASE}/malpractice/assignment/${id}`)
    ]);
    if (!analyticsResponse.ok || !malpracticeResponse.ok) throw new Error('Could not load reports');
    setAnalytics(await analyticsResponse.json());
    setMalpractice(await malpracticeResponse.json());
  };

  useEffect(() => { refreshReports(assignmentId).catch(() => setActionError('Could not load assignment reports.')); }, [assignmentId]);

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
          subject: assSubject,
          classroom_id: classroom.id,
          answer_key_text: assKeyText,
          total_marks: 100
        })
      });
      if (!response.ok) throw new Error(await response.text());
      const assignment = await response.json();
      setAssignmentId(assignment.id);
      setAssignments(prev => [{ ...assignment, units_count: 0, total_scripts: 0 }, ...prev]);
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
      await refreshReports(assignmentId);
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
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Persistent workspace</p><p className="text-sm font-semibold text-gray-900">{classroom?.name || 'Loading classroom…'} {classroom?.code ? `• Join code ${classroom.code}` : ''}</p></div>
          <select value={assignmentId || ''} onChange={e => setAssignmentId(Number(e.target.value))} className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900">
            <option value="">No assignment selected</option>
            {assignments.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>
        
        {/* TAB 1: CLASSROOM ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Average Reasoning Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics?.class_average_ras ?? 0}%</p>
                <p className="text-xs text-gray-500 mt-1">RAS: score against the marking guide</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Answers Evaluated</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics?.cohort_total_scripts ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Actual saved submissions</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-600 uppercase font-semibold">Similar Answers to Review</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{malpractice?.total_flagged_pairs ?? 0}</p>
              </div>
            </div>

            {/* PICTORIAL CHARTS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Bar Chart: Rubric Unit Pass Rates */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Where Students Lost Marks</h3>
                  <span className="text-xs font-mono font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded">{analytics?.class_average_ras ?? 0}% Class Avg</span>
                </div>
                <p className="text-xs text-gray-500">Percentage of saved submissions meeting each part of the marking guide.</p>
                
                <div className="space-y-3 pt-2">
                  {(analytics?.weakness_heatmap || []).map((item) => (
                    <div key={item.rubric_unit_id} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.label}</span>
                        <span>{item.pass_rate_pct}% Pass Rate</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${item.pass_rate_pct >= 75 ? 'bg-green-500' : item.pass_rate_pct >= 50 ? 'bg-amber-500' : 'bg-red-500'} transition-all duration-500`}
                          style={{ width: `${item.pass_rate_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart / Donut Chart: Cohort Performance Breakdown */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">Class Score Distribution</h3>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">Live records</span>
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
                      <span className="text-xl font-bold text-gray-900">{analytics?.cohort_total_scripts ?? 0}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-green-500"></div>
                      <span className="text-gray-800">Distinction (≥80%): {analytics?.score_distribution?.distinction ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-blue-500"></div>
                      <span className="text-gray-800">Average (60–79%): {analytics?.score_distribution?.average ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-red-500"></div>
                      <span className="text-gray-800">Needs support (&lt;60%): {analytics?.score_distribution?.weak ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Error Misconception Clusters */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Common Class Mistakes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analytics?.error_clusters || []).map(c => (
                  <div key={c.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{c.cluster_name}</span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">{c.frequency} Students ({c.percentage}%)</span>
                    </div>
                    <p className="text-xs text-gray-600">{c.description}</p>
                  </div>
                ))}
                {!analytics?.error_clusters?.length && <p className="text-sm text-gray-500">No recurring weak steps yet. Evaluate answers to build this view.</p>}
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
              {(malpractice?.collusion_pairs || []).map(pair => (
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
              {!malpractice?.collusion_pairs?.length && <p className="text-sm text-gray-500">No answer pairs currently cross the review threshold.</p>}
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
                  <label className="block font-bold text-gray-700 mb-1">Subject</label>
                  <input type="text" value={assSubject} onChange={(e) => setAssSubject(e.target.value)} placeholder="e.g. Applied Thermodynamics" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none" required />
                </div>
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
                  disabled={actionBusy || !classroom}
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
                  disabled={actionBusy || !assignmentId}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {actionBusy ? 'Checking…' : assignmentId ? `Check Answer with Marking Guide ${assignmentId}` : 'Create or select a marking guide first'}
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
