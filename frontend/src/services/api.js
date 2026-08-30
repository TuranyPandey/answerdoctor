import env from '../config/env';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return await res.json();
}

// ── Auth API ────────────────────────────────────────────────────────────────
export async function loginWithGoogle(idToken, role) {
  const res = await fetch(`${env.apiUrl}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken, role }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function loginWithEmail(email, password) {
  const res = await fetch(`${env.apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function registerWithEmail(email, password, name, role) {
  const res = await fetch(`${env.apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function fetchMe() {
  const res = await fetch(`${env.apiUrl}/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Classes API ─────────────────────────────────────────────────────────────
export async function fetchClasses() {
  const res = await fetch(`${env.apiUrl}/classes`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function createClass(payload) {
  const res = await fetch(`${env.apiUrl}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  return await handleResponse(res);
}

export async function joinClass(joinCode) {
  const res = await fetch(`${env.apiUrl}/classes/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ join_code: joinCode }),
  });
  return await handleResponse(res);
}

export async function fetchStudentsForClass(classId) {
  const res = await fetch(`${env.apiUrl}/classes/${classId}/students`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Rubric API ──────────────────────────────────────────────────────────────
export async function fetchRubric(classId) {
  const res = await fetch(`${env.apiUrl}/rubric/${classId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function saveRubric(classId, units) {
  const res = await fetch(`${env.apiUrl}/rubric/${classId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ units }),
  });
  return await handleResponse(res);
}

export async function uploadRubricDocument(classId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${env.apiUrl}/rubric/${classId}/upload-file`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return await handleResponse(res);
}

// ── PYQ Database API ────────────────────────────────────────────────────────
export async function fetchPYQs(subject = '') {
  const url = subject ? `${env.apiUrl}/pyq?subject=${encodeURIComponent(subject)}` : `${env.apiUrl}/pyq`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function importPYQToRubric(pyqId, classId) {
  const res = await fetch(`${env.apiUrl}/pyq/${pyqId}/to-rubric/${classId}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Scripts & Batch API ──────────────────────────────────────────────────────
export async function uploadSingleScript(classId, examName, file) {
  const formData = new FormData();
  formData.append('class_id', classId);
  formData.append('exam_name', examName);
  formData.append('file', file);

  const res = await fetch(`${env.apiUrl}/scripts/upload`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return await handleResponse(res);
}

export async function uploadBatchFiles(classId, examName, filesInput) {
  const formData = new FormData();
  formData.append('class_id', classId);
  formData.append('exam_name', examName);

  const fileList = Array.isArray(filesInput)
    ? filesInput
    : filesInput instanceof FileList
    ? Array.from(filesInput)
    : [filesInput];

  fileList.forEach((file) => {
    formData.append('files', file);
  });

  const res = await fetch(`${env.apiUrl}/scripts/batch-upload`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return await handleResponse(res);
}

export const uploadBatchZip = uploadBatchFiles;

export async function fetchScriptsForClass(classId) {
  const res = await fetch(`${env.apiUrl}/scripts?class_id=${classId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchScriptsForStudent(studentId = '') {
  const url = studentId ? `${env.apiUrl}/student/scripts?student_id=${studentId}` : `${env.apiUrl}/student/scripts`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchScriptDetail(scriptId) {
  const res = await fetch(`${env.apiUrl}/scripts/${scriptId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function retryStepAnswer(scriptId, rubricUnitId, studentAnswer) {
  const res = await fetch(`${env.apiUrl}/scripts/${scriptId}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ rubric_unit_id: rubricUnitId, student_answer: studentAnswer }),
  });
  return await handleResponse(res);
}

export async function reprocessAllScripts() {
  const res = await fetch(`${env.apiUrl}/scripts/reprocess-all`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function reverifyScript(scriptId) {
  const res = await fetch(`${env.apiUrl}/scripts/${scriptId}/reverify`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function reverifyStep(scriptId, stepId) {
  const res = await fetch(`${env.apiUrl}/scripts/${scriptId}/reverify-step/${stepId}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Analytics API ────────────────────────────────────────────────────────────
export async function fetchAnalytics(classId) {
  const res = await fetch(`${env.apiUrl}/analytics/${classId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchPredictiveRisk(classId) {
  const res = await fetch(`${env.apiUrl}/analytics/predictive-risk/${classId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Collusion Radar API ──────────────────────────────────────────────────────
export async function scanCollusion(classId) {
  const res = await fetch(`${env.apiUrl}/collusion/scan/${classId}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchCollusionPairs(classId) {
  const res = await fetch(`${env.apiUrl}/collusion/${classId}`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function updateCollusionStatus(flagId, status) {
  const res = await fetch(`${env.apiUrl}/collusion/${flagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  return await handleResponse(res);
}

// ── Student Analytics & AI Advisor API ───────────────────────────────────────
export async function fetchStudentAnalytics() {
  const res = await fetch(`${env.apiUrl}/student/analytics`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function aiExplainStep(stepLabel, unitType, studentText = '', feedback = '', promptType = 'explain') {
  const res = await fetch(`${env.apiUrl}/student/ai-explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({
      step_label: stepLabel,
      unit_type: unitType,
      student_text: studentText,
      feedback: feedback,
      prompt_type: promptType,
    }),
  });
  return await handleResponse(res);
}

export async function fetchAIHint(questionText, hintLevel = 1, stepLabel = '') {
  const res = await fetch(`${env.apiUrl}/student/ai-hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({
      question_text: questionText,
      hint_level: hintLevel,
      step_label: stepLabel,
    }),
  });
  return await handleResponse(res);
}

export async function submitPYQPractice(pyqId, studentSolution = '', file = null) {
  const formData = new FormData();
  formData.append('pyq_id', pyqId);
  if (studentSolution) {
    formData.append('student_solution', studentSolution);
  }
  if (file) {
    formData.append('file', file);
  }

  const res = await fetch(`${env.apiUrl}/student/pyq-practice`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return await handleResponse(res);
}

export async function testRubricSandbox(rubricUnits, sampleSolution) {
  const res = await fetch(`${env.apiUrl}/rubric/test-sandbox`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({
      rubric_units: rubricUnits,
      sample_solution: sampleSolution,
    }),
  });
  return await handleResponse(res);
}

// ── Teacher Script Assignments API ──────────────────────────────────────────
export async function createAssignment(classId, title, examName, instructions = '', totalMarks = 10.0, file = null) {
  const formData = new FormData();
  formData.append('class_id', classId);
  formData.append('title', title);
  formData.append('exam_name', examName);
  if (instructions) formData.append('instructions', instructions);
  formData.append('total_marks', totalMarks.toString());
  if (file) formData.append('file', file);

  const res = await fetch(`${env.apiUrl}/assignments`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: formData,
  });
  return await handleResponse(res);
}

export async function fetchAssignments(classId = '') {
  const url = classId ? `${env.apiUrl}/assignments?class_id=${classId}` : `${env.apiUrl}/assignments`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchStudentAssignments() {
  const res = await fetch(`${env.apiUrl}/assignments/student`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

// ── Verification & AI Studio API ─────────────────────────────────────────────
export async function verifyInstitution(institution, facultyCode = '') {
  const res = await fetch(`${env.apiUrl}/auth/verify-institution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ institution, faculty_code: facultyCode }),
  });
  return await handleResponse(res);
}

export async function generateQuestionPaper(subject, topic, difficulty = 'Medium', marks = 10.0) {
  const res = await fetch(`${env.apiUrl}/pyq/generate-paper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ subject, topic, difficulty, marks }),
  });
  return await handleResponse(res);
}

export async function generatePYQVariants(pyqId) {
  const res = await fetch(`${env.apiUrl}/pyq/generate-variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ pyq_id: pyqId }),
  });
  return await handleResponse(res);
}

// ── University Guild System API ──────────────────────────────────────────────
export async function fetchGuilds() {
  const res = await fetch(`${env.apiUrl}/guilds`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function fetchMyGuilds() {
  const res = await fetch(`${env.apiUrl}/guilds/my`, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function createGuild(name, domain, description = '', iconBadge = '🏛️') {
  const res = await fetch(`${env.apiUrl}/guilds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ name, domain, description, icon_badge: iconBadge }),
  });
  return await handleResponse(res);
}

export async function joinGuild(code = '', guildId = '') {
  const res = await fetch(`${env.apiUrl}/guilds/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ code, guild_id: guildId }),
  });
  return await handleResponse(res);
}

// ── OpenRubric Public Marketplace API ───────────────────────────────────────
export async function fetchMarketplaceRubrics(subject = '') {
  const url = subject ? `${env.apiUrl}/rubric/marketplace/list?subject=${subject}` : `${env.apiUrl}/rubric/marketplace/list`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}

export async function publishRubricToMarketplace(classId, title, subject, description = '') {
  const res = await fetch(`${env.apiUrl}/rubric/marketplace/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ class_id: classId, title, subject, description }),
  });
  return await handleResponse(res);
}

export async function forkMarketplaceRubric(rubricId, classId) {
  const res = await fetch(`${env.apiUrl}/rubric/marketplace/${rubricId}/fork/${classId}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  return await handleResponse(res);
}





