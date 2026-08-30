// Central config — ALL env vars are read here and nowhere else
const env = {
  apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  simulationMode: import.meta.env.VITE_SIMULATION_MODE === 'true',
  cmiThreshold: parseFloat(import.meta.env.VITE_CMI_THRESHOLD ?? '0.88'),
  rasThreshold: parseFloat(import.meta.env.VITE_RAS_THRESHOLD ?? '0.60'),
  appName: import.meta.env.VITE_APP_NAME ?? 'AnswerDoctor',
  appTagline: import.meta.env.VITE_APP_TAGLINE ?? '',
  pipelineStages: (import.meta.env.VITE_PIPELINE_STAGES ?? '').split(',').filter(Boolean),
  maxFileSizeMb: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? '50', 10),
  collusionReviewNote: import.meta.env.VITE_COLLUSION_REVIEW_NOTE ?? 'Flagged for review',
};

export default env;
