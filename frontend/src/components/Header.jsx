import React from 'react';
import { Search, User, LogIn, RefreshCw, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export default function Header({ 
  currentRole, setCurrentRole, user, onOpenAuth, onReloadDemo, isDemoLoading 
}) {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 focus-within:border-emerald-500/50 transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Search assignments, student IDs, rubric concepts, PYQs..."
          className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">

        {/* Preset Loader */}
        <button
          onClick={onReloadDemo}
          disabled={isDemoLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
          title="Reset to Thermodynamics CAT-1 Sample Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isDemoLoading ? 'animate-spin' : ''}`} />
          <span>{isDemoLoading ? 'Seeding...' : 'Load Thermo CAT Sample'}</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentRole('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'teacher'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>
          <button
            onClick={() => setCurrentRole('student')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'student'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
        </div>

        {/* User Account / Google Auth Button */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <img 
              src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} 
              alt={user.full_name} 
              className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
            />
            <div className="text-left text-xs hidden md:block">
              <p className="font-bold text-white flex items-center gap-1">
                {user.full_name}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In / Google</span>
          </button>
        )}

      </div>

    </header>
  );
}
