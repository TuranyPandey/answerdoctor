import React, { useState } from 'react';
import { ArrowLeft, BookOpenCheck, FlaskConical, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008/api';

const DEMO_ACCOUNTS = {
  teacher: { email: 'prof.sharma@vit.ac.in', full_name: 'Prof. Rajesh Sharma', role: 'teacher' },
  student: { email: 'sohum@vit.ac.in', full_name: 'Mangalapalli Sohum Seshu Krish', register_number: '26BCE0616', role: 'student' }
};

export default function DemoAccess({ role, onLogin, onBack, theme, onToggleTheme }) {
  const account = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.student;
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const enterDemo = async () => {
    setLoading(true);
    setNotice('');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, role: account.role })
      });
      if (!response.ok) throw new Error('Demo API unavailable');
      onLogin(await response.json());
    } catch (error) {
      setNotice('Backend is offline. Entering the clearly labelled local preview dataset.');
      window.setTimeout(() => onLogin({ ...account, id: role === 'teacher' ? 1 : 2, preview_mode: true }), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-page page-transition min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      <div className="absolute right-5 top-5"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Change role
        </button>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><FlaskConical className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Review 2 prototype</p>
              <h1 className="text-2xl font-bold text-gray-900">Demo access</h1>
              <p className="text-xs text-gray-600 mt-1">No real Google sign-in or password authentication is used in this prototype.</p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><BookOpenCheck className="w-4 h-4 text-purple-600" />{role === 'teacher' ? 'Faculty demonstration' : 'Student demonstration'}</div>
            <p className="text-xs text-gray-600">{account.full_name}</p>
            <p className="text-xs font-mono text-gray-500">{account.email}</p>
          </div>
          {notice && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{notice}</p>}
          <button type="button" onClick={enterDemo} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> {loading ? 'Connecting to demo…' : `Enter ${role === 'teacher' ? 'faculty' : 'student'} demo`}
          </button>
          <p className="text-[11px] text-center text-gray-500">Seeded educational data only. Production authentication is a post-hackathon milestone.</p>
        </div>
      </div>
    </div>
  );
}
