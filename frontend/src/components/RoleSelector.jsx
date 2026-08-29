import React, { useState } from 'react';
import { BookOpen, Stethoscope, Users } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function RoleSelector({ onSelectRole, theme, onToggleTheme }) {
  const [selectedRole, setSelectedRole] = useState('teacher');
  const roles = [
    { id: 'teacher', label: 'Teacher', icon: Users, selected: 'border-blue-600 bg-blue-50 text-blue-600' },
    { id: 'student', label: 'Student', icon: BookOpen, selected: 'border-purple-600 bg-purple-50 text-purple-600' }
  ];

  return (
    <div className="theme-page page-transition min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      <div className="absolute right-5 top-5"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3"><Stethoscope className="w-8 h-8 text-blue-600" /><h1 className="text-3xl font-bold text-gray-900">AnswerDoctor</h1></div>
          <p className="text-sm text-gray-600">See where reasoning broke, then practise the exact missing step.</p>
          <p className="text-[11px] mt-2 font-bold uppercase tracking-widest text-blue-600">Review 2 working prototype</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div><h2 className="text-lg font-semibold text-gray-900">How will you use AnswerDoctor?</h2><p className="text-xs text-gray-500 mt-1">Choose a workspace, then sign in or create a persistent account.</p></div>
          <div className="grid grid-cols-2 gap-4">
            {roles.map(({ id, label, icon: Icon, selected }) => (
              <button key={id} onClick={() => setSelectedRole(id)} className={`p-6 rounded-xl border-2 transition flex flex-col items-center gap-3 ${selectedRole === id ? selected : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                <Icon className="w-8 h-8" /><span className="font-semibold text-sm text-gray-800">{label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => onSelectRole({ role: selectedRole })} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">Continue</button>
          <p className="text-xs text-center text-gray-500">Records are stored by the running backend, not embedded in this page.</p>
        </div>
      </div>
    </div>
  );
}
