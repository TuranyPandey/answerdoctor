const LOCAL_API_URL = 'http://127.0.0.1:8008/api';
const PRODUCTION_API_URL = '/api';

export const API_BASE = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL)
).replace(/\/$/, '');
