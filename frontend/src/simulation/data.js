import env from '../config/env';

// ── Simulation Data ────────────────────────────────────────────────────────

export const CLASSES = [
  {
    id: 'cls-thermo-201',
    name: 'Thermodynamics 201',
    subject: 'Mechanical Engineering',
    joinCode: 'THERM-7X2K',
    teacherId: 'teacher-1',
    studentCount: 12,
    examCount: 3,
    createdAt: '2026-01-10',
  },
  {
    id: 'cls-circuits-301',
    name: 'Circuits & Systems 301',
    subject: 'Electrical Engineering',
    joinCode: 'CIRC-9M4P',
    teacherId: 'teacher-1',
    studentCount: 18,
    examCount: 2,
    createdAt: '2026-01-12',
  },
  {
    id: 'cls-calculus-102',
    name: 'Calculus II',
    subject: 'Mathematics',
    joinCode: 'CALC-5R8Q',
    teacherId: 'teacher-1',
    studentCount: 24,
    examCount: 4,
    createdAt: '2026-01-08',
  },
];

export const STUDENTS = [
  { id: 'stu-001', name: 'Arjun Mehta', regNo: '26BCE0601', classId: 'cls-thermo-201' },
  { id: 'stu-002', name: 'Divya Nair', regNo: '26BCE0602', classId: 'cls-thermo-201' },
  { id: 'stu-003', name: 'Karan Patel', regNo: '26BCE0603', classId: 'cls-thermo-201' },
  { id: 'stu-004', name: 'Priya Sharma', regNo: '26BCE0604', classId: 'cls-thermo-201' },
  { id: 'stu-005', name: 'Rohan Das', regNo: '26BCE0605', classId: 'cls-thermo-201' },
  { id: 'stu-006', name: 'Sneha Iyer', regNo: '26BCE0606', classId: 'cls-thermo-201' },
  { id: 'stu-007', name: 'Vikram Bose', regNo: '26BCE0607', classId: 'cls-thermo-201' },
  { id: 'stu-008', name: 'Ananya Gupta', regNo: '26BCE0608', classId: 'cls-thermo-201' },
  { id: 'stu-009', name: 'Ravi Kumar', regNo: '26BCE0609', classId: 'cls-thermo-201' },
  { id: 'stu-010', name: 'Meera Pillai', regNo: '26BCE0610', classId: 'cls-thermo-201' },
  { id: 'stu-011', name: 'Aditya Joshi', regNo: '26BCE0611', classId: 'cls-thermo-201' },
  { id: 'stu-012', name: 'Kavya Reddy', regNo: '26BCE0612', classId: 'cls-thermo-201' },
];

export const RUBRIC_UNITS = {
  'cls-thermo-201': [
    { id: 'ru-1', type: 'Concept', label: 'Identify thermodynamic system and boundary', weight: 1.5 },
    { id: 'ru-2', type: 'Formula', label: 'State the correct form of the First Law (Q - W = ΔU)', weight: 2.0 },
    { id: 'ru-3', type: 'Step', label: 'Establish reference state before applying the law', weight: 2.0 },
    { id: 'ru-4', type: 'Step', label: 'Correctly compute work done (W = PΔV or W = ∫PdV)', weight: 2.0 },
    { id: 'ru-5', type: 'Transformation', label: 'Algebraic rearrangement to isolate the unknown', weight: 1.5 },
    { id: 'ru-6', type: 'Result', label: 'Correct numerical answer with appropriate units', weight: 1.0 },
  ],
  'cls-circuits-301': [
    { id: 'rc-1', type: 'Concept', label: 'Identify circuit topology (series/parallel/mesh)', weight: 1.5 },
    { id: 'rc-2', type: 'Formula', label: 'Apply Kirchhoff\'s Voltage Law correctly', weight: 2.0 },
    { id: 'rc-3', type: 'Step', label: 'Assign mesh currents with consistent direction', weight: 2.0 },
    { id: 'rc-4', type: 'Step', label: 'Write system of equations for each mesh', weight: 2.0 },
    { id: 'rc-5', type: 'Transformation', label: 'Solve system of equations (substitution/matrix)', weight: 1.5 },
    { id: 'rc-6', type: 'Result', label: 'Correct branch currents with units (A or mA)', weight: 1.0 },
  ],
  'cls-calculus-102': [
    { id: 'cc-1', type: 'Concept', label: 'Identify integration technique (substitution, parts, partial fractions)', weight: 1.5 },
    { id: 'cc-2', type: 'Formula', label: 'State the correct antiderivative rule', weight: 2.0 },
    { id: 'cc-3', type: 'Step', label: 'Perform substitution or decomposition correctly', weight: 2.0 },
    { id: 'cc-4', type: 'Step', label: 'Integrate term-by-term without sign errors', weight: 2.0 },
    { id: 'cc-5', type: 'Transformation', label: 'Back-substitute and simplify', weight: 1.5 },
    { id: 'cc-6', type: 'Result', label: 'Correct final answer including constant of integration', weight: 1.0 },
  ],
};

export const SCRIPTS = [
  {
    id: 'scr-001',
    studentId: 'stu-001',
    classId: 'cls-thermo-201',
    examName: 'CAT-1',
    uploadedAt: '2026-03-15',
    totalMarks: 10,
    scoredMarks: 7.5,
    ras: 0.75,
    ocrConfidence: 0.93,
    steps: [
      { rubricId: 'ru-1', matched: true, studentText: 'The system is a closed piston-cylinder with gas as working fluid. Boundary is piston surface.', similarity: 0.91, feedback: null },
      { rubricId: 'ru-2', matched: true, studentText: 'First Law: Q - W = ΔU for closed system.', similarity: 0.87, feedback: null },
      { rubricId: 'ru-3', matched: false, studentText: 'Applying first law directly with P = 100 kPa.', similarity: 0.41, feedback: 'The reference state (initial temperature and internal energy at state 1) was not established before applying the law. You jumped straight to applying Q - W = ΔU without anchoring the state variables u₁ and u₂ from the steam tables.' },
      { rubricId: 'ru-4', matched: true, studentText: 'W = P(V₂ - V₁) = 100 × (0.4 - 0.1) = 30 kJ', similarity: 0.83, feedback: null },
      { rubricId: 'ru-5', matched: false, studentText: 'Q = ΔU + W = 20 + 30 = 50 kJ (assumed ΔU = 20)', similarity: 0.38, feedback: 'ΔU cannot be assumed as 20 kJ. It must be computed from u₂ - u₁ using table values at the respective states. The rearrangement step is structurally correct but was applied to an incorrect ΔU value, propagating the error forward.' },
      { rubricId: 'ru-6', matched: true, studentText: 'Q = 50 kJ', similarity: 0.72, feedback: null },
    ],
    errorCluster: 'reference-state-skipped',
  },
  {
    id: 'scr-002',
    studentId: 'stu-002',
    classId: 'cls-thermo-201',
    examName: 'CAT-1',
    uploadedAt: '2026-03-15',
    totalMarks: 10,
    scoredMarks: 5.5,
    ras: 0.55,
    ocrConfidence: 0.88,
    steps: [
      { rubricId: 'ru-1', matched: true, studentText: 'Closed system, rigid boundary, ideal gas assumption.', similarity: 0.78, feedback: null },
      { rubricId: 'ru-2', matched: false, studentText: 'Q = W + ΔH (used enthalpy instead of internal energy)', similarity: 0.31, feedback: 'For a closed system, the First Law is Q - W = ΔU (change in internal energy), not ΔH. Enthalpy H = U + PV is relevant for open systems (control volumes) or constant-pressure processes when explicitly stated. The formula applied here is incorrect for the given closed-system scenario.' },
      { rubricId: 'ru-3', matched: false, studentText: 'Applied formula directly.', similarity: 0.29, feedback: 'Reference state not established — same issue as previous step, cascading from the formula error.' },
      { rubricId: 'ru-4', matched: true, studentText: 'W = PΔV = 100 × 0.3 = 30 kJ', similarity: 0.81, feedback: null },
      { rubricId: 'ru-5', matched: true, studentText: 'Q = ΔH + W = 15 + 30 = 45 kJ', similarity: 0.69, feedback: null },
      { rubricId: 'ru-6', matched: false, studentText: 'Q = 45 kJ', similarity: 0.44, feedback: 'Answer is structurally presented but derived from an incorrect formula. Correct approach would yield Q = 63.2 kJ using proper state-table values.' },
    ],
    errorCluster: 'formula-confusion-u-vs-h',
  },
  {
    id: 'scr-003',
    studentId: 'stu-003',
    classId: 'cls-thermo-201',
    examName: 'CAT-1',
    uploadedAt: '2026-03-15',
    totalMarks: 10,
    scoredMarks: 9.0,
    ras: 0.90,
    ocrConfidence: 0.95,
    steps: [
      { rubricId: 'ru-1', matched: true, studentText: 'Closed system. Working fluid is steam. System boundary = piston.', similarity: 0.92, feedback: null },
      { rubricId: 'ru-2', matched: true, studentText: 'First Law for closed system: Q - W = ΔU = m(u₂ - u₁)', similarity: 0.94, feedback: null },
      { rubricId: 'ru-3', matched: true, studentText: 'State 1: T₁=200°C, P₁=100kPa → u₁=2506.1 kJ/kg from steam tables. State 2: P₂=100kPa, T₂=300°C → u₂=2793.2 kJ/kg.', similarity: 0.89, feedback: null },
      { rubricId: 'ru-4', matched: true, studentText: 'Constant pressure → W = P(V₂-V₁) = mP(v₂-v₁) = 2×100×(2.639-2.172) = 93.4 kJ', similarity: 0.91, feedback: null },
      { rubricId: 'ru-5', matched: true, studentText: 'ΔU = 2×(2793.2-2506.1) = 574.2 kJ. Q = 574.2 + 93.4 = 667.6 kJ', similarity: 0.86, feedback: null },
      { rubricId: 'ru-6', matched: false, studentText: 'Q = 667 kJ', similarity: 0.57, feedback: 'Minor: final answer truncated — should read 667.6 kJ to match significant figures required by the rubric. The derivation is fully correct.' },
    ],
    errorCluster: 'sig-fig-truncation',
  },
];

export const BATCH_SCRIPTS = [
  { studentId: 'stu-001', studentName: 'Arjun Mehta', regNo: '26BCE0601', filename: 'arjun_cat1.pdf', ras: 0.75, score: 7.5, flag: false },
  { studentId: 'stu-002', studentName: 'Divya Nair', regNo: '26BCE0602', filename: 'divya_cat1.pdf', ras: 0.55, score: 5.5, flag: false },
  { studentId: 'stu-003', studentName: 'Karan Patel', regNo: '26BCE0603', filename: 'karan_cat1.pdf', ras: 0.90, score: 9.0, flag: false },
  { studentId: 'stu-004', studentName: 'Priya Sharma', regNo: '26BCE0604', filename: 'priya_cat1.pdf', ras: 0.68, score: 6.5, flag: true, collusionPair: 'stu-005', cmi: 0.94 },
  { studentId: 'stu-005', studentName: 'Rohan Das', regNo: '26BCE0605', filename: 'rohan_cat1.pdf', ras: 0.68, score: 6.5, flag: true, collusionPair: 'stu-004', cmi: 0.94 },
  { studentId: 'stu-006', studentName: 'Sneha Iyer', regNo: '26BCE0606', filename: 'sneha_cat1.pdf', ras: 0.82, score: 8.0, flag: false },
  { studentId: 'stu-007', studentName: 'Vikram Bose', regNo: '26BCE0607', filename: 'vikram_cat1.pdf', ras: 0.43, score: 4.0, flag: false },
  { studentId: 'stu-008', studentName: 'Ananya Gupta', regNo: '26BCE0608', filename: 'ananya_cat1.pdf', ras: 0.71, score: 7.0, flag: true, collusionPair: 'stu-009', cmi: 0.91 },
  { studentId: 'stu-009', studentName: 'Ravi Kumar', regNo: '26BCE0609', filename: 'ravi_cat1.pdf', ras: 0.71, score: 7.0, flag: true, collusionPair: 'stu-008', cmi: 0.91 },
  { studentId: 'stu-010', studentName: 'Meera Pillai', regNo: '26BCE0610', filename: 'meera_cat1.pdf', ras: 0.85, score: 8.5, flag: false },
  { studentId: 'stu-011', studentName: 'Aditya Joshi', regNo: '26BCE0611', filename: 'aditya_cat1.pdf', ras: 0.60, score: 6.0, flag: false },
  { studentId: 'stu-012', studentName: 'Kavya Reddy', regNo: '26BCE0612', filename: 'kavya_cat1.pdf', ras: 0.78, score: 7.5, flag: false },
];

export const ERROR_CLUSTERS = [
  { id: 'ec-1', label: 'Reference state skipped', count: 4, percentage: 33, color: '#b03a2e', classId: 'cls-thermo-201' },
  { id: 'ec-2', label: 'ΔU vs ΔH confusion', count: 3, percentage: 25, color: '#c8851c', classId: 'cls-thermo-201' },
  { id: 'ec-3', label: 'Work calculation: constant P assumed incorrectly', count: 2, percentage: 17, color: '#4a7c5f', classId: 'cls-thermo-201' },
  { id: 'ec-4', label: 'Significant figure truncation', count: 2, percentage: 17, color: '#2e4a7c', classId: 'cls-thermo-201' },
  { id: 'ec-5', label: 'Other', count: 1, percentage: 8, color: '#8a8f9c', classId: 'cls-thermo-201' },
];

export const COLLUSION_PAIRS = [
  {
    id: 'cp-1',
    classId: 'cls-thermo-201',
    studentA: { id: 'stu-004', name: 'Priya Sharma', regNo: '26BCE0604' },
    studentB: { id: 'stu-005', name: 'Rohan Das', regNo: '26BCE0605' },
    cmi: 0.94,
    sharedErrors: ['Reference state skipped', 'Same ΔU value assumed (20 kJ)'],
    matchedPhrases: ['applying Q minus W equals delta U directly', 'assumed delta U equals 20'],
    status: 'pending_review',
  },
  {
    id: 'cp-2',
    classId: 'cls-thermo-201',
    studentA: { id: 'stu-008', name: 'Ananya Gupta', regNo: '26BCE0608' },
    studentB: { id: 'stu-009', name: 'Ravi Kumar', regNo: '26BCE0609' },
    cmi: 0.91,
    sharedErrors: ['Reference state skipped', 'Identical intermediate step: W = 30 kJ computed same way'],
    matchedPhrases: ['work done is P times delta V equals 30 kJ', 'Q equals 50 kJ'],
    status: 'pending_review',
  },
];

export const PER_QUESTION_RAS = [
  { question: 'Q1 — First Law Application', avgRas: 0.72, weakCount: 3 },
  { question: 'Q2 — Carnot Efficiency', avgRas: 0.81, weakCount: 1 },
  { question: 'Q3 — Entropy Change', avgRas: 0.54, weakCount: 5 },
  { question: 'Q4 — Steady-State Flow', avgRas: 0.65, weakCount: 4 },
  { question: 'Q5 — P-V Diagram Analysis', avgRas: 0.88, weakCount: 1 },
];

export const RETRY_QUESTIONS = {
  'ru-3': {
    prompt: 'A closed piston-cylinder contains 1.5 kg of steam at T₁ = 150°C and P₁ = 200 kPa. It is heated at constant pressure to T₂ = 250°C. Before applying the First Law, identify the state properties (u₁ and u₂) you would look up in the steam tables, and explain why you need them.',
    rubricHint: 'Establishing state variables u₁ and u₂ from tables before applying Q - W = m(u₂ - u₁)',
    sampleAnswer: 'At State 1: T₁=150°C, P₁=200kPa → from superheated steam tables, u₁ ≈ 2577.1 kJ/kg. At State 2: T₂=250°C, P₂=200kPa → u₂ ≈ 2731.2 kJ/kg. We need these values to compute ΔU = m(u₂ - u₁) = 1.5 × (2731.2 - 2577.1) = 231.2 kJ. Without anchoring u₁ and u₂ to specific state table entries, any assumed ΔU value is ungrounded.',
  },
  'ru-5': {
    prompt: 'Given Q - W = ΔU for a closed system where W = 30 kJ, and you must compute ΔU from the steam tables for a 2 kg system where u₁ = 2506.1 kJ/kg and u₂ = 2793.2 kJ/kg — write out the full algebraic steps to find Q.',
    rubricHint: 'Compute ΔU = m(u₂ - u₁) explicitly, then rearrange Q - W = ΔU to find Q',
    sampleAnswer: 'Step 1: ΔU = m(u₂ - u₁) = 2 × (2793.2 - 2506.1) = 2 × 287.1 = 574.2 kJ. Step 2: From First Law: Q = ΔU + W = 574.2 + 30 = 604.2 kJ. Note: ΔU must always be computed from state table values, not assumed.',
  },
};

// Build simulation delay helper
export function simulateDelay(ms = 800) {
  return new Promise((res) => setTimeout(res, ms));
}

// Given a class id, get its rubric
export function getRubricForClass(classId) {
  return RUBRIC_UNITS[classId] ?? [];
}

// Get student's scripts
export function getStudentScripts(studentId) {
  return SCRIPTS.filter((s) => s.studentId === studentId);
}

// Get full script by id
export function getScript(scriptId) {
  return SCRIPTS.find((s) => s.id === scriptId) ?? null;
}

// Enrich steps with rubric label
export function enrichSteps(script, classId) {
  const rubric = getRubricForClass(classId);
  return script.steps.map((step) => ({
    ...step,
    rubricUnit: rubric.find((r) => r.id === step.rubricId) ?? null,
  }));
}

// Cohort analytics
export function getCohortAnalytics(classId) {
  return {
    perQuestion: PER_QUESTION_RAS,
    errorClusters: ERROR_CLUSTERS.filter((e) => e.classId === classId),
    collusionPairs: COLLUSION_PAIRS.filter((p) => p.classId === classId),
  };
}

// Score distribution for a batch
export function getScoreDistribution() {
  const buckets = { '0-4': 0, '4-6': 0, '6-8': 0, '8-10': 0 };
  BATCH_SCRIPTS.forEach(({ score }) => {
    if (score < 4) buckets['0-4']++;
    else if (score < 6) buckets['4-6']++;
    else if (score < 8) buckets['6-8']++;
    else buckets['8-10']++;
  });
  return buckets;
}
