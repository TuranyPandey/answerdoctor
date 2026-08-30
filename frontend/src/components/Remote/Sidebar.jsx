import React from 'react';
import { 
  LayoutDashboard, BookOpen, Layers, HelpCircle, FileText, 
  ShieldAlert, Sparkles, PlusCircle, CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentRole, onOpenDynamicIngestion }) {
  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'malpractice', label: 'Malpractice Radar (CMI)', icon: ShieldAlert },
    { id: 'pyq', label: 'PYQ Vault', icon: FileText },
    { id: 'doubts', label: 'AI Doubt Center', icon: HelpCircle }
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'My Submissions & Map', icon: Layers },
    { id: 'doubts', label: 'AI Doubt Center', icon: HelpCircle },
    { id: 'pyq', label: 'PYQ Vault', icon: BookOpen }
  ];

  const navItems = currentRole === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-md shadow-emerald-500/20">
            🩺
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">AnswerDoctor</h1>
            <p className="text-[10px] font-mono text-emerald-400">Enterprise Engine v2.0</p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Portal</span>
            <span className="font-bold text-white capitalize">{currentRole} Portal</span>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
            currentRole === 'teacher' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-300'
          }`}>
            {currentRole === 'teacher' ? 'FACULTY' : 'STUDENT'}
          </span>
        </div>

        {/* Dynamic Data Creation Action Button */}
        {currentRole === 'teacher' && (
          <div className="px-3 mb-3">
            <button
              onClick={onOpenDynamicIngestion}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Custom Data</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Evaluation Engine Online</span>
        </div>
        <p className="text-[10px]">VIT Review 0 Final Build</p>
      </div>

    </aside>
  );
}
