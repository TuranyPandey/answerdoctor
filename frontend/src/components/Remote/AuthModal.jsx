import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, BookOpen, Layers } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    // Simulates instant verified Google OAuth response
    const mockGoogleUser = {
      full_name: role === 'teacher' ? 'Prof. Rajesh Sharma' : 'Mangalapalli Sohum',
      email: role === 'teacher' ? 'prof.sharma@vit.ac.in' : 'mangalapalli.ss@gmail.com',
      register_number: role === 'teacher' ? null : '26BCE0616',
      role: role,
      token: "mock-google-jwt-token-xyz",
      avatar_url: role === 'teacher' 
        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
        : "https://api.dicebear.com/7.x/avataaars/svg?seed=Sohum"
    };

    localStorage.setItem("user", JSON.stringify(mockGoogleUser));
    localStorage.setItem("token", mockGoogleUser.token);

    onLoginSuccess(mockGoogleUser);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mockUser = {
      full_name: fullName || (role === 'teacher' ? 'Faculty Member' : 'Student User'),
      email: email || (role === 'teacher' ? 'faculty@vit.ac.in' : 'student@vit.ac.in'),
      register_number: regNo || (role === 'teacher' ? null : '26BCE0000'),
      role: role,
      token: "mock-credentials-jwt-token",
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'user'}`
    };

    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", mockUser.token);

    onLoginSuccess(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {isSignUp ? 'Create Institutional Account' : 'Sign In to AnswerDoctor'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              role === 'student' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              role === 'teacher' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty Portal</span>
          </button>
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google / Gmail</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">or institutional email</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <User className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mangalapalli Sohum"
                  className="bg-transparent text-white focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Mail className="w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mangalapalli.ss@gmail.com"
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>
          </div>

          {role === 'student' && isSignUp && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Registration Number</label>
              <input 
                type="text" 
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="e.g. 26BCE0616"
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password</label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Lock className="w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 mt-2"
          >
            {isSignUp ? 'Create Account' : `Sign In as ${role === 'teacher' ? 'Faculty' : 'Student'}`}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-800">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-all"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
