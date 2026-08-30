const LOCAL_API_URL = 'http://127.0.0.1:8008/api';
const PRODUCTION_API_URL = '/api';

export const API_BASE = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL)
).replace(/\/$/, '');

const TOKEN_KEY = 'answerdoctor-access-token';
const USER_KEY = 'answerdoctor-user';

export const getAccessToken = () => window.localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const saveSession = (authResponse) => {
  const { access_token, token_type: _tokenType, ...user } = authResponse;
  window.localStorage.setItem(TOKEN_KEY, access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const clearSession = () => {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

export const apiFetch = (path, options = {}) => {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(path.startsWith('http') ? path : `${API_BASE}${path}`, { ...options, headers });
};
