import React, { useState } from 'react';
import { 
  Users, ShieldAlert, Sparkles, FileText, CheckCircle2, XCircle, 
  AlertTriangle, Network, Search, ArrowRight, BarChart3, PieChart, Layers, HelpCircle
} from 'lucide-react';

export default function TeacherDashboard({ analytics, malpractice, assignment, onUploadBatch }) {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, malpractice, rubric, discovery
  const [selectedPair, setSelectedPair] = useState(malpractice?.collusion_pairs?.[0] || null);

  if (!analytics || !assignment) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Batch Ingested</p>
            <h3 className="text-2xl font-bold text-white">{analytics.cohort_total_scripts} Scripts</h3>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">VIT MECH201 CAT-1 Batch</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Class Average RAS</p>
            <h3 className="text-2xl font-bold text-white">{analytics.class_average_ras}%</h3>
            <p className="text-[10px] text-teal-400 font-semibold mt-0.5">Rubric-Alignment Score</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Malpractice Radar</p>
            <h3 className="text-2xl font-bold text-rose-400">{malpractice?.total_flagged_pairs || 1} Pair Flagged</h3>
            <p className="text-[10px] text-rose-400/90 font-semibold mt-0.5">CMI ≥ 0.88 Suspicious Logic</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Discovery Agent</p>
            <h3 className="text-2xl font-bold text-white">{analytics.alternative_solutions.length} Methods</h3>
            <p className="text-[10px] text-violet-400 font-semibold mt-0.5">Valid Unseen Solutions</p>
          </div>
        </div>

      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'analytics', label: 'Class Weakness & Analytics', icon: BarChart3 },
            { id: 'malpractice', label: 'Malpractice Radar (CMI)', icon: ShieldAlert, badge: malpractice?.total_flagged_pairs },
            { id: 'rubric', label: 'Decomposed Rubric (5 Units)', icon: Layers },
            { id: 'discovery', label: 'Alternative Solutions', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onUploadBatch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>Upload Batch ZIP</span>
        </button>
      </div>

      {/* TAB 1: CLASS ANALYTICS & WEAKNESS HEATMAP */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Heatmap Section */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Class-Wide Rubric Unit Weakness Heatmap
                </h3>
                <p className="text-xs text-slate-400">
                  Concept-by-concept analysis across all {analytics.cohort_total_scripts} scripts in the cohort.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Similarity Threshold γ ≥ 0.60
              </span>
            </div>

            <div className="space-y-3">
              {analytics.weakness_heatmap.map(unit => (
                <div key={unit.rubric_unit_id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        unit.category === 'concept' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        unit.category === 'formula' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                        unit.category === 'units' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {unit.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{unit.label}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">Pass Rate: <strong className="text-white">{unit.pass_rate_pct}%</strong></span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        unit.weakness_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {unit.weakness_level}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Stack */}
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${(unit.matched_count / 240) * 100}%` }}
                      title={`Matched: ${unit.matched_count} scripts`}
                    />
                    <div 
                      className="bg-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${(unit.weak_count / 240) * 100}%` }}
                      title={`Weak: ${unit.weak_count} scripts`}
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500" 
                      style={{ width: `${(unit.missing_count / 240) * 100}%` }}
                      title={`Missing: ${unit.missing_count} scripts`}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-mono">
                    <span className="text-emerald-400">✓ Matched: {unit.matched_count} scripts</span>
                    <span className="text-amber-400">! Weak: {unit.weak_count} scripts</span>
                    <span className="text-rose-400">✗ Missing: {unit.missing_count} scripts ({unit.weakness_level === 'CRITICAL' ? '33.3% Class Misconception!' : 'Minor'})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scikit-Learn Error Misconception Clusters */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Scikit-Learn Cohort Misconception Clusters
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Unsupervised clustering of recurring reasoning breaks across all 240 semester scripts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.error_clusters.map(cluster => (
                <div key={cluster.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {cluster.percentage}% Cohort Impact
                      </span>
                      <span className="text-xs font-bold text-slate-300">{cluster.frequency} Scripts</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{cluster.cluster_name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{cluster.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <strong>Sample Students:</strong> Sohum (26BCE0616), Rayed (26BCE0606) + 78 others
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MALPRACTICE RADAR */}
      {activeTab === 'malpractice' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Collusion Pairs List */}
            <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Flagged Collusion Pairs (CMI ≥ 0.88)
              </h3>
              
              <div className="space-y-3">
                {malpractice.collusion_pairs.map(pair => (
                  <div 
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPair?.id === pair.id 
                        ? 'bg-rose-500/10 border-rose-500/50 shadow-md shadow-rose-500/10' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        CMI Score: {pair.cmi_score}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-400">FLAGGED</span>
                    </div>

                    <div className="text-xs font-semibold text-white space-y-1">
                      <p className="flex items-center justify-between">
                        <span>A: {pair.student_a_name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{pair.student_a_reg}</span>
                      </p>
                      <p className="flex items-center justify-between text-slate-300">
                        <span>B: {pair.student_b_name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{pair.student_b_reg}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pair Detailed Inspector */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              {selectedPair && (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Network className="w-5 h-5 text-rose-400" />
                        Collusion Audit Inspector
                      </h3>
                      <p className="text-xs text-slate-400">
                        Pairwise logic comparison between {selectedPair.student_a_name} and {selectedPair.student_b_name}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xl font-bold text-rose-400">CMI = {selectedPair.cmi_score}</div>
                      <div className="text-[10px] text-slate-400">Threshold = 0.88</div>
                    </div>
                  </div>

                  {/* Breakdown Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Semantic Cosine Sim</span>
                      <p className="text-lg font-bold text-white">{selectedPair.cos_sim}</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Shared Error Pattern Match</span>
                      <p className="text-lg font-bold text-rose-400">{selectedPair.error_match_score}</p>
                    </div>
                  </div>

                  {/* Reason Callout */}
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
                    <strong className="block mb-1 font-bold">Audit Flag Reason:</strong>
                    {selectedPair.flagged_reason}
                  </div>

                  {/* Shared Error Side-by-side preview */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <p className="font-semibold text-emerald-400 mb-1">{selectedPair.student_a_name} Step 1:</p>
                      <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded">
                        "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 reference state."
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <p className="font-semibold text-emerald-400 mb-1">{selectedPair.student_b_name} Step 1:</p>
                      <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded">
                        "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 reference state."
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* CMI Pairwise Matrix Visualizer */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Cohort Pairwise Similarity Matrix (CMI)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-400 border-b border-slate-800">Student</th>
                    {malpractice.students.map((st, idx) => (
                      <th key={idx} className="p-2 text-slate-400 border-b border-slate-800">{st.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {malpractice.students.map((st, i) => (
                    <tr key={i} className="border-b border-slate-900">
                      <td className="p-2 text-left font-semibold text-slate-300">{st}</td>
                      {malpractice.cmi_matrix[i].map((val, j) => (
                        <td 
                          key={j} 
                          className={`p-2 font-bold ${
                            val >= 0.88 ? 'bg-rose-500/30 text-rose-300' :
                            val === 1.0 ? 'bg-slate-800 text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DECOMPOSED RUBRIC */}
      {activeTab === 'rubric' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Rubric Decomposer Agent Output</h3>
              <p className="text-xs text-slate-400">Atomic gradeable units for {assignment.title} (Weights sum strictly to 1.0)</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              Total Weight: 1.00 (100%)
            </span>
          </div>

          <div className="space-y-3">
            {assignment.rubric_units.map((unit, idx) => (
              <div key={unit.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {unit.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{unit.label}</h4>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800/80">
                    {unit.expected_text}
                  </p>
                </div>
                <div className="text-right font-mono text-xs pl-4">
                  <div className="font-bold text-emerald-400">Weight: {(unit.weight * 100).toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-400">γ = {unit.gamma_threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCOVERY AGENT */}
      {activeTab === 'discovery' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Alternative Solution Discovery Agent
            </h3>
            <p className="text-xs text-slate-400">
              Surfaces non-standard yet mathematically sound student solutions across the cohort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.alternative_solutions.map(sol => (
              <div key={sol.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{sol.title}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {sol.found_in_count} Scripts
                  </span>
                </div>
                <p className="text-xs text-slate-300">{sol.description}</p>
                <div className="text-[10px] font-semibold text-emerald-400">
                  ⚡ Advantage: {sol.efficiency_gain}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
