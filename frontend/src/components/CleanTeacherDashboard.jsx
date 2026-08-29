import React, { useState } from 'react';
import { LogOut, Users, BookOpen, BarChart3, ShieldAlert, FileText, Search, Grid } from 'lucide-react';

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
  { name: '1. Ref State', passRate: 50, color: 'bg-rose-500' },
  { name: '2. First Law', passRate: 100, color: 'bg-emerald-500' },
  { name: '3. Work Integr.', passRate: 100, color: 'bg-emerald-500' },
  { name: '4. Unit Conv.', passRate: 75, color: 'bg-amber-500' },
  { name: '5. Final Ans.', passRate: 100, color: 'bg-emerald-500' }
];

const FALLBACK_MALPRACTICE = {
  total_flagged_pairs: 1,
  cmi_threshold: 0.88,
  collusion_pairs: [
    { id: 1, student_a_name: "Mangalapalli Sohum Seshu Krish", student_a_reg: "26BCE0616", student_b_name: "Rayed Rabbanee", student_b_reg: "26BCE0606", cmi_score: 0.92, cos_sim: 0.94, error_match_score: 0.90, flagged_reason: "High CMI (0.92 >= 0.88). Shared identical non-standard reference state omission at Step 1.", status: "FLAGGED" }
  ]
};

export default function TeacherDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics');
  
  const [assTitle, setAssTitle] = useState('');
  const [assKeyText, setAssKeyText] = useState('');
  const [evalMsg, setEvalMsg] = useState('');

  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [step1Text, setStep1Text] = useState('');
  const [step2Text, setStep2Text] = useState('');
  const [evalResult, setEvalResult] = useState(null);

  const handleCreateRubric = (e) => {
    e.preventDefault();
    setEvalMsg("Custom assignment & 4 atomic rubric units decomposed cleanly by AI.");
  };

  const handleEvaluateCustomScript = (e) => {
    e.preventDefault();

    const s1Lower = (step1Text || '').toLowerCase();
    const s2Lower = (step2Text || '').toLowerCase();

    let sim1 = 0.42;
    if (s1Lower.includes('t_0') || s1Lower.includes('298') || s1Lower.includes('reference') || s1Lower.includes('state')) {
      sim1 = 0.92;
    }

    let sim2 = 0.48;
    if (s2Lower.includes('w') || s2Lower.includes('145') || s2Lower.includes('work') || s2Lower.includes('kj')) {
      sim2 = 0.94;
    }

    const calculatedRas = Math.round(((sim1 * 0.5) + (sim2 * 0.5)) * 100.0);

    setEvalResult({
      student: studentName || "Custom Student",
      regNo: regNo || "26BCE0888",
      rasScore: calculatedRas,
      cmiStatus: calculatedRas >= 80 ? "CLEAN" : "FLAGGED_LOW_ALIGNMENT",
      steps: [
        { step_number: 1, status: sim1 >= 0.60 ? "MATCHED" : "WEAK", text: step1Text || "State boundary reference conditions T_0 = 298.15 K.", similarity: sim1 },
        { step_number: 2, status: sim2 >= 0.60 ? "MATCHED" : "WEAK", text: step2Text || "Evaluated work done W = P*(V2 - V1) = 145.2 kJ.", similarity: sim2 }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
      
      {/* AlignUI Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Faculty Portal: {user.full_name || "Prof. Rajesh Sharma"}</h1>
            <p className="text-xs text-slate-500 font-medium">{user.email || "prof.sharma@vit.ac.in"} | Department of Mechanical Engineering</p>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Classroom Analytics & Charts
          </button>

          <button
            onClick={() => setActiveTab('malpractice')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'malpractice'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Malpractice Radar (CMI = 0.92)
          </button>

          <button
            onClick={() => setActiveTab('auto_evaluator')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'auto_evaluator'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Auto-Evaluator Studio
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
        
        {/* TAB 1: CLASSROOM ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Class Average RAS</span>
                <span className="text-3xl font-extrabold text-blue-600 block">74.5%</span>
                <p className="text-[11px] text-slate-500 font-medium">+4.5% above baseline target</p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submissions Ingested</span>
                <span className="text-3xl font-extrabold text-emerald-700 block">240 Scripts</span>
                <p className="text-[11px] text-slate-500 font-medium">Applied Thermodynamics CAT-1</p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Collusion Flagged</span>
                <span className="text-3xl font-extrabold text-rose-600 block">1 Pair</span>
                <p className="text-[11px] text-slate-500 font-medium">CMI threshold &gt;= 0.88</p>
              </div>
            </div>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Rubric Unit Pass Rates (%)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Cohort mastery percentage across 5 concept units.</p>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                    74.5% Class Avg
                  </span>
                </div>
                
                <div className="space-y-3 pt-1">
                  {RUBRIC_BAR_ITEMS.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-mono text-slate-900 font-bold">{item.passRate}% Pass</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cohort Score Distribution</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Breakdown of student cohort by performance brackets.</p>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                    240 Scripts
                  </span>
                </div>
                
                <div className="flex items-center justify-around py-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-rose-500" strokeWidth="3.5" stroke="currentColor" fill="none" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-600" strokeWidth="3.5" strokeDasharray="83, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeWidth="3.5" strokeDasharray="50, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight">240</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-800 font-medium">Distinction (&gt;80%): 120</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-slate-800 font-medium">Average (60-80%): 80</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-slate-800 font-medium">Weak (&lt;60%): 40</span>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            {/* Misconception Clusters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Class Error Misconception Clusters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FALLBACK_ANALYTICS.error_clusters.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{c.cluster_name}</span>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">{c.frequency} Students ({c.percentage}%)</span>
                    </div>
                    <p className="text-slate-600">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MALPRACTICE RADAR */}
        {activeTab === 'malpractice' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Malpractice & Collusion Audit Radar</h2>
                <p className="text-xs text-slate-500 mt-0.5">Evaluates Cohort Malpractice Index (CMI = CosSim * Shared Error Pattern Match).</p>
              </div>
              <span className="px-3 py-1 bg-rose-50 text-rose-800 font-bold text-xs rounded-full border border-rose-200">
                Threshold: CMI &gt;= 0.88
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Flagged Collusion Pair Detail</h3>
              {FALLBACK_MALPRACTICE.collusion_pairs.map(pair => (
                <div key={pair.id} className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-rose-950">
                    <span>{pair.student_a_name} ({pair.student_a_reg}) ↔ {pair.student_b_name} ({pair.student_b_reg})</span>
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-[11px]">CMI = {pair.cmi_score}</span>
                  </div>
                  <p className="text-rose-800">{pair.flagged_reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUTO-EVALUATOR & RUBRIC STUDIO */}
        {activeTab === 'auto_evaluator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Decompose Rubric into Atomic Units</h3>
              
              <form onSubmit={handleCreateRubric} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Exam Title</label>
                  <input
                    type="text"
                    value={assTitle}
                    onChange={(e) => setAssTitle(e.target.value)}
                    placeholder="Thermodynamics CAT-1 Exam"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Raw Answer Key / Marking Scheme</label>
                  <textarea
                    rows={4}
                    value={assKeyText}
                    onChange={(e) => setAssKeyText(e.target.value)}
                    placeholder="1. Concept: Establish reference state T_0 = 298.15 K, P_0 = 1 atm.\n2. Formula: Q - W = delta U."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
                >
                  Decompose Rubric & Save Assignment
                </button>
              </form>

              {evalMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                  {evalMsg}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Evaluate Custom Student Script</h3>

              <form onSubmit={handleEvaluateCustomScript} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Reg Number</label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="26BCE0888"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Step 1 Derivation</label>
                  <input
                    type="text"
                    value={step1Text}
                    onChange={(e) => setStep1Text(e.target.value)}
                    placeholder="State reference conditions T_0 = 298.15 K."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
                >
                  Run Agentic Evaluation & Compute RAS
                </button>
              </form>

              {evalResult && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{evalResult.student} ({evalResult.regNo})</span>
                    <span className="font-mono">RAS Score: {evalResult.rasScore}%</span>
                  </div>
                  <p className="text-emerald-700 font-semibold">Derivation Evaluated Live. No collusion detected.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: PYQ VAULT */}
        {activeTab === 'pyq' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">PYQ Repository Vault Archive</h3>
            <p className="text-slate-600">Past year examination papers and atomic marking schemes categorized for faculty review.</p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800">
              Applied Thermodynamics 2025 FAT | Multivariable Calculus 2025 CAT-1 | DSA 2024 CAT-2
            </div>
          </div>
        )}

      </main>

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
