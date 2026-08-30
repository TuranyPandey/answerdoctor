import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { API_BASE } from '../apiConfig';


const loadGoogleIdentity = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) return resolve(window.google);
  const existing = document.querySelector('script[data-answerdoctor-google]');
  if (existing) {
    existing.addEventListener('load', () => resolve(window.google), { once: true });
    existing.addEventListener('error', reject, { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.dataset.answerdoctorGoogle = 'true';
  script.onload = () => resolve(window.google);
  script.onerror = reject;
  document.head.appendChild(script);
});


export default function AccountAccess({ role, onLogin, onBack, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const googleButton = useRef(null);

  const readResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
      throw new Error(detail || 'Could not access account.');
    }
    return data;
  };

  useEffect(() => {
    fetch(`${API_BASE}/auth/config`)
      .then(readResponse)
      .then((config) => setGoogleClientId(config.google_client_id || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return;
    let active = true;
    loadGoogleIdentity().then((google) => {
      if (!active || !googleButton.current) return;
      googleButton.current.innerHTML = '';
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setLoading(true);
          setNotice('');
          try {
            const response = await fetch(`${API_BASE}/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                credential,
                role,
                mode,
                register_number: mode === 'register' && role === 'student' ? registerNumber : null,
              }),
            });
            onLogin(await readResponse(response));
          } catch (error) {
            setNotice(error.message);
          } finally {
            setLoading(false);
          }
        },
      });
      google.accounts.id.renderButton(googleButton.current, {
        theme: theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        width: googleButton.current.offsetWidth,
        text: mode === 'register' ? 'signup_with' : 'signin_with',
      });
    }).catch(() => setNotice('Google sign-in could not be loaded.'));
    return () => { active = false; };
  }, [googleClientId, mode, onLogin, registerNumber, role, theme]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice('');
    try {
      const creating = mode === 'register';
      const response = await fetch(`${API_BASE}/auth/${creating ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creating
          ? { email, password, full_name: fullName, register_number: role === 'student' ? registerNumber : null, role }
          : { email, password, role }),
      });
      onLogin(await readResponse(response));
    } catch (error) {
      setNotice(error.message === 'Failed to fetch' ? 'Backend unavailable. Start the AnswerDoctor API and try again.' : error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setNotice('');
  };

  return (
    <div className="theme-page page-transition min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      <div className="absolute right-5 top-5"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Change role</button>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div><p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Secure account</p><h1 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Sign in' : 'Create an account'}</h1><p className="text-xs text-gray-600 mt-1">Your password is securely hashed and your session is protected.</p></div>
          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-xs font-bold">
            <button type="button" onClick={() => changeMode('login')} className={`py-2 rounded-md ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}>Sign in</button>
            <button type="button" onClick={() => changeMode('register')} className={`py-2 rounded-md ${mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <label className="block text-xs font-bold text-gray-700">Full name<input required autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-normal" placeholder="Your name" /></label>}
            <label className="block text-xs font-bold text-gray-700">Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-normal" placeholder={role === 'teacher' ? 'teacher@college.edu' : 'student@college.edu'} /></label>
            <label className="block text-xs font-bold text-gray-700">Password<input required minLength={8} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-normal" placeholder="At least 8 characters" /></label>
            {mode === 'register' && role === 'student' && <label className="block text-xs font-bold text-gray-700">Registration number<input required value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-normal uppercase" placeholder="26BCE0001" /></label>}
            {notice && <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">{notice}</p>}
            <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">{mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}{loading ? 'Connecting…' : mode === 'login' ? `Sign in as ${role}` : `Create ${role} account`}</button>
          </form>
          {googleClientId && <><div className="flex items-center gap-3 text-[11px] text-gray-400"><span className="h-px flex-1 bg-gray-200" />OR<span className="h-px flex-1 bg-gray-200" /></div><div ref={googleButton} className="w-full min-h-10" /></>}
          <p className="text-[11px] text-center text-gray-500">Password sign-in and Google identity tokens are verified by the AnswerDoctor API.</p>
        </div>
      </div>
    </div>
  );
}
