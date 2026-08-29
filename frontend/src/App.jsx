import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import PYQVault from './components/PYQVault';
import AIDoubtCenter from './components/AIDoubtCenter';
import AuthModal from './components/AuthModal';
import DynamicIngestionModal from './components/DynamicIngestionModal';
import BatchUploadModal from './components/BatchUploadModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008/api';

// --- FALLBACK DEMO DATASET ---
const FALLBACK_ASSIGNMENT = {
  id: 1,
  title: "CAT-1 Exam: First Law & State Reference Equations",
  subject: "Thermodynamics",
  exam_type: "CAT-1",
  year: 2026,
  answer_key_text: "1. Concept: Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.\n2. Formula: Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).\n3. Intermediate Step: W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.\n4. Units: Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.\n5. Final Answer: Net heat transfer Q_net = 384.6 kJ (positive indicating heat added).",
  total_marks: 100.0,
  total_scripts: 240,
  rubric_units: [
    { id: 1, category: "concept", label: "1. System boundary & Reference State definition", expected_text: "Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.", weight: 0.20, gamma_threshold: 0.60 },
    { id: 2, category: "formula", label: "2. First Law Energy Balance Equation", expected_text: "Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).", weight: 0.20, gamma_threshold: 0.60 },
    { id: 3, category: "intermediate_step", label: "3. Boundary Work Integration & Specific Heat", expected_text: "W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.", weight: 0.25, gamma_threshold: 0.60 },
    { id: 4, category: "units", label: "4. Unit Conversions & Dimensional Consistency", expected_text: "Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.", weight: 0.15, gamma_threshold: 0.60 },
    { id: 5, category: "final_answer", label: "5. Final Heat Transfer Evaluation (Q_net)", expected_text: "Net heat transfer Q_net = 384.6 kJ (positive indicating heat added to system).", weight: 0.20, gamma_threshold: 0.60 }
  ]
};

const FALLBACK_ANALYTICS = {
  assignment_id: 1,
  cohort_total_scripts: 240,
  class_average_ras: 74.5,
  weakness_heatmap: [
    { rubric_unit_id: 1, category: "concept", label: "1. System boundary & Reference State definition", matched_count: 120, weak_count: 80, missing_count: 40, pass_rate_pct: 50.0, weakness_level: "CRITICAL" },
    { rubric_unit_id: 2, category: "formula", label: "2. First Law Energy Balance Equation", matched_count: 240, weak_count: 0, missing_count: 0, pass_rate_pct: 100.0, weakness_level: "LOW" },
    { rubric_unit_id: 3, category: "intermediate_step", label: "3. Boundary Work Integration & Specific Heat", matched_count: 240, weak_count: 0, missing_count: 0, pass_rate_pct: 100.0, weakness_level: "LOW" },
    { rubric_unit_id: 4, category: "units", label: "4. Unit Conversions & Dimensional Consistency", matched_count: 180, weak_count: 45, missing_count: 15, pass_rate_pct: 75.0, weakness_level: "MODERATE" },
    { rubric_unit_id: 5, category: "final_answer", label: "5. Final Heat Transfer Evaluation (Q_net)", matched_count: 240, weak_count: 0, missing_count: 0, pass_rate_pct: 100.0, weakness_level: "LOW" }
  ],
  error_clusters: [
    { id: 1, cluster_name: "Unspecified Reference State Baseline", frequency: 80, percentage: 33.3, description: "Students applied first law enthalpy equations directly without defining baseline reference temperature T_0 and pressure P_0.", affected_students_json: '["Mangalapalli Sohum Seshu Krish (26BCE0616)", "Rayed Rabbanee (26BCE0606)", "80 Cohort Students"]' },
    { id: 2, cluster_name: "Bar to kPa Unit Conversion Slip", frequency: 45, percentage: 18.8, description: "Students substituted pressure values in bar directly into SI equations without multiplying by 100 kPa/bar factor.", affected_students_json: '["Turany Pandey (26BCE0646)", "45 Cohort Students"]' }
  ],
  alternative_solutions: [
    { id: 1, title: "Alternative Method A: Exergy Balance Approach", found_in_count: 8, description: "Student derived state change via dead-state Exergy equation (e_2 - e_1) rather than standard enthalpy integral. Conceptually valid and scored 100% matched by Discovery Agent.", efficiency_gain: "Saves 2 derivation lines" },
    { id: 2, title: "Alternative Method B: Ideal Gas Polytropic Relation P*V^1.3 = C", found_in_count: 14, description: "Used polytropic exponent n = 1.3 for air boundary work. Reached valid Q_net = 384.6 kJ.", efficiency_gain: "Equivalent accuracy" }
  ]
};

const FALLBACK_MALPRACTICE = {
  assignment_id: 1,
  total_flagged_pairs: 1,
  cmi_threshold: 0.88,
  collusion_pairs: [
    { id: 1, student_a_name: "Mangalapalli Sohum Seshu Krish", student_a_reg: "26BCE0616", student_b_name: "Rayed Rabbanee", student_b_reg: "26BCE0606", cmi_score: 0.92, cos_sim: 0.94, error_match_score: 0.90, flagged_reason: "High CMI (0.92 >= 0.88). Shared identical non-standard reference state omission at Step 1 and verbatim boundary work integration phrasing.", status: "FLAGGED" }
  ],
  students: ["Mangalapalli Sohum Seshu Krish (26BCE0616)", "Rayed Rabbanee (26BCE0606)", "Pratyush Jha (26BCE0604)", "Turany Pandey (26BCE0646)"],
  cmi_matrix: [
    [1.0, 0.92, 0.29, 0.36],
    [0.92, 1.0, 0.32, 0.39],
    [0.21, 0.28, 1.0, 0.17],
    [0.24, 0.31, 0.38, 1.0]
  ]
};

const FALLBACK_SUBMISSION = {
  submission_id: 1,
  assignment_id: 1,
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
      diagnosis_text: "Step 3 matched boundary work integration requirement with 89% confidence. Preserved P-V process curve diagram crop.",
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

export default function App() {
  const [currentRole, setCurrentRole] = useState('teacher'); // 'teacher' or 'student'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'malpractice', 'pyq', 'doubts'
  
  // Modals & State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDynamicIngestionOpen, setIsDynamicIngestionOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Authenticated User
  const [user, setUser] = useState({
    full_name: "Prof. Rajesh Sharma",
    email: "prof.sharma@vit.ac.in",
    role: "teacher",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
  });

  // App Data
  const [assignment, setAssignment] = useState(FALLBACK_ASSIGNMENT);
  const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
  const [malpractice, setMalpractice] = useState(FALLBACK_MALPRACTICE);
  const [submission, setSubmission] = useState(FALLBACK_SUBMISSION);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const [assRes, anaRes, malRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/assignments/1`, { signal: controller.signal }),
        fetch(`${API_BASE}/analytics/assignment/1`, { signal: controller.signal }),
        fetch(`${API_BASE}/malpractice/assignment/1`, { signal: controller.signal }),
        fetch(`${API_BASE}/submissions/student/2/assignment/1`, { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);

      if (assRes.ok && anaRes.ok && malRes.ok && subRes.ok) {
        setAssignment(await assRes.json());
        setAnalytics(await anaRes.json());
        setMalpractice(await malRes.json());
        setSubmission(await subRes.json());
      } else {
        throw new Error("API non-200");
      }
    } catch (err) {
      console.warn("Backend API offline; using preloaded demo dataset.", err);
      setAssignment(FALLBACK_ASSIGNMENT);
      setAnalytics(FALLBACK_ANALYTICS);
      setMalpractice(FALLBACK_MALPRACTICE);
      setSubmission(FALLBACK_SUBMISSION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRoleSwitch = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'student' && user.role === 'teacher') {
      setUser({
        full_name: "Mangalapalli Sohum Seshu Krish",
        email: "sohum@vit.ac.in",
        register_number: "26BCE0616",
        role: "student",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sohum"
      });
    } else if (newRole === 'teacher' && user.role === 'student') {
      setUser({
        full_name: "Prof. Rajesh Sharma",
        email: "prof.sharma@vit.ac.in",
        role: "teacher",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
      });
    }
  };

  const handleReloadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      await fetch(`${API_BASE}/analytics/seed-demo`, { method: 'POST', signal: controller.signal });
      clearTimeout(timeoutId);
      await fetchAllData();
    } catch (err) {
      console.warn("Seed demo API offline; using fallback demo dataset.", err);
      setAssignment(FALLBACK_ASSIGNMENT);
      setAnalytics(FALLBACK_ANALYTICS);
      setMalpractice(FALLBACK_MALPRACTICE);
      setSubmission(FALLBACK_SUBMISSION);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleRetrySubmit = async (stepId, selectedOption) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE}/submissions/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: stepId, selected_option: selectedOption }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const subRes = await fetch(`${API_BASE}/submissions/${submission.submission_id}`);
        setSubmission(await subRes.json());
        return data;
      }
    } catch (err) {
      console.warn("Backend offline; processing retry drill locally.", err);
    }

    const isCorrect = (selectedOption.toUpperCase() === 'A');
    if (isCorrect && submission) {
      setSubmission(prev => ({
        ...prev,
        total_ras_score: Math.min(100.0, prev.total_ras_score + 10.0),
        steps: prev.steps.map(s => s.id === stepId ? { ...s, retry_status: 'PASSED' } : s)
      }));
    }
    return {
      is_correct: isCorrect,
      explanation: isCorrect 
        ? "Correct! Energy balance evaluations require an established reference state (T_0 = 298.15 K, P_0 = 1 atm) to accurately quantify internal energy and enthalpy changes across process states."
        : "Incorrect. Try again by selecting Option A.",
      new_retry_status: isCorrect ? 'PASSED' : 'FAILED',
      new_total_ras: isCorrect ? 70.0 : submission.total_ras_score
    };
  };

  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Enterprise Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole}
        onOpenDynamicIngestion={() => setIsDynamicIngestionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Enterprise Header */}
        <Header 
          currentRole={currentRole}
          setCurrentRole={handleRoleSwitch}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onReloadDemo={handleReloadDemo}
          isDemoLoading={isDemoLoading}
        />

        {/* Dynamic View Switcher */}
        <main className="p-8 flex-1 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-emerald-500"></div>
              <p className="text-xs text-slate-400 font-mono">Initializing AnswerDoctor Engine...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                currentRole === 'teacher' ? (
                  <TeacherDashboard 
                    analytics={analytics}
                    malpractice={malpractice}
                    assignment={assignment}
                    onUploadBatch={() => setIsBatchUploadOpen(true)}
                  />
                ) : (
                  <StudentDashboard 
                    submission={submission}
                    onRetrySubmit={handleRetrySubmit}
                  />
                )
              )}

              {activeTab === 'malpractice' && (
                <TeacherDashboard 
                  analytics={analytics}
                  malpractice={malpractice}
                  assignment={assignment}
                  onUploadBatch={() => setIsBatchUploadOpen(true)}
                />
              )}

              {activeTab === 'pyq' && (
                <PYQVault apiBase={API_BASE} />
              )}

              {activeTab === 'doubts' && (
                <AIDoubtCenter 
                  apiBase={API_BASE} 
                  user={user} 
                  submission={submission} 
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-5 text-center text-xs text-slate-500 font-mono">
          AnswerDoctor Enterprise Engine • Powered by LangGraph Swarm & Sentence Transformers • Review 0 Final Build
        </footer>

      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          setCurrentRole(loggedUser.role);
        }}
      />

      <DynamicIngestionModal 
        isOpen={isDynamicIngestionOpen}
        onClose={() => setIsDynamicIngestionOpen(false)}
        apiBase={API_BASE}
        onComplete={fetchAllData}
      />

      <BatchUploadModal 
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onComplete={fetchAllData}
      />

    </div>
  );
}
