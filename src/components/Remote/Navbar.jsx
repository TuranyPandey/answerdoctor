import React from 'react';
import { Activity, ShieldAlert, Cpu, Sparkles, User, RefreshCw, BookOpen, Layers } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, onReloadDemo, isDemoLoading }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                AnswerDoctor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LangGraph Swarm
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Reasoning-Level Script Diagnostics & Collusion Radar</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Quick One-Click Demo Reset */}
          <button
            onClick={onReloadDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all shadow-sm active:scale-95"
            title="Load Mechanical Engineering Thermodynamics CAT Demo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>{isDemoLoading ? 'Seeding Demo...' : 'Load Thermo CAT Demo'}</span>
          </button>

          {/* Role Switcher Toggle */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentRole('teacher')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'teacher'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher Cockpit</span>
            </button>
            <button
              onClick={() => setCurrentRole('student')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'student'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Student Workspace</span>
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {currentRole === 'teacher' ? 'PS' : 'MS'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-200">
                {currentRole === 'teacher' ? 'Prof. Rajesh Sharma' : 'M. Sohum Seshu Krish'}
              </p>
              <p className="text-[10px] text-slate-400">
                {currentRole === 'teacher' ? 'VIT Mechanical Engg' : '26BCE0616'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
