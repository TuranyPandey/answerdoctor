const LOCAL_API_URL = 'http://127.0.0.1:8008/api';
const RENDER_API_URL = 'https://answerdoctor-api-dz19.onrender.com/api';

export const API_BASE = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? RENDER_API_URL : LOCAL_API_URL)
).replace(/\/$/, '');
