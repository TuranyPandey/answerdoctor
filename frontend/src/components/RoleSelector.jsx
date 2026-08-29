import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

export default function RoleSelector({ onSelectRole, onDirectLogin }) {
  const handleContinue = (role) => {
    const defaultUser = {
      id: Date.now(),
      full_name: role === 'student' ? "Mangalapalli Sohum Seshu Krish" : "Prof. Rajesh Sharma",
      email: role === 'student' ? "mangalapalli.ss@gmail.com" : "prof.sharma@vit.ac.in",
      register_number: role === 'student' ? "26BCE0616" : undefined,
      role: role,
      token: "jwt-token-2026"
    };

    if (onDirectLogin) {
      onDirectLogin(defaultUser);
    } else if (onSelectRole) {
      onSelectRole({ role, authType: 'login' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tight">
              AD
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AnswerDoctor</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold">Institutional Assessment & Integrity Engine</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          <button
            onClick={() => handleContinue('student')}
            className="w-full p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-600 rounded-xl text-left space-y-1 transition group"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Student Portal</span>
              <span className="text-xs font-semibold text-slate-500">Sign In</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Access exam reasoning maps, step retry drills, and self-evaluators.</p>
          </button>

          <button
            onClick={() => handleContinue('teacher')}
            className="w-full p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-600 rounded-xl text-left space-y-1 transition group"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Faculty Portal</span>
              <span className="text-xs font-semibold text-slate-500">Sign In</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Access classroom analytics, rubric decomposition, and CMI collusion radar.</p>
          </button>
        </div>

        {/* AlignUI Footer Links */}
        <div className="border-t border-slate-100 pt-4 flex justify-between text-[11px] text-slate-500 font-medium">
          <a href="#tos" className="hover:text-slate-900">Terms of Service</a>
          <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
        </div>

      </div>
    </div>
  );
}
