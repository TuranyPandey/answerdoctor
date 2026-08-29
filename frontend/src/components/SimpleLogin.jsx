import React, { useState } from 'react';
import { LogIn, Mail, Lock, X } from 'lucide-react';

export default function SimpleLogin({ onLoginSuccess, selectedRole = 'student' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(selectedRole);

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      id: Date.now(),
      full_name: email.split('@')[0] || "User",
      email: email || "user@vitstudent.ac.in",
      role: role,
      token: "jwt-token-" + Date.now()
    };
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const handleGoogleModalSubmit = (e) => {
    e.preventDefault();
    const finalName = googleName.trim() || "Google User";
    const finalEmail = googleEmail.trim() || "user@gmail.com";
    
    const user = {
      id: Date.now(),
      full_name: finalName,
      email: finalEmail,
      role: role,
      token: "google-jwt-token-" + Date.now(),
      auth_provider: "google",
      is_google_verified: true
    };
    setShowGoogleModal(false);
    if (onLoginSuccess) onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <LogIn className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AnswerDoctor</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold">Institutional Assessment & Integrity Engine</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-2 rounded-md transition ${
              role === 'student' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-2 rounded-md transition ${
              role === 'teacher' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty Sign In
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? "student@vitstudent.ac.in" : "faculty@vit.ac.in"}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-xs"
          >
            Sign In with Email
          </button>
        </form>

        <div className="relative text-center border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
          >
            Continue with Google SSO
          </button>
        </div>

        {/* Footer Links */}
        <div className="border-t border-slate-100 pt-3 flex justify-between text-[11px] text-slate-500 font-medium">
          <a href="#tos" className="hover:text-slate-900">Terms of Service</a>
          <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
        </div>

      </div>

      {/* DYNAMIC GOOGLE SSO MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Google SSO Authentication</h3>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGoogleModalSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Judge / Evaluator"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Google Email</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="evaluator@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm SSO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
