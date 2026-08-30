import React from 'react';
import env from '../../config/env';

// Simple inline SVG icons (no lucide)
const Icons = {
  classes:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="0"/><path d="M5 8h6M5 5h6M5 11h4"/></svg>,
  upload:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10V3M5 6l3-3 3 3"/><path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1"/></svg>,
  rubric:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h10M3 7h7M3 11h5"/><circle cx="12" cy="11" r="2"/></svg>,
  analytics:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="3" height="6"/><rect x="6" y="5" width="3" height="9"/><rect x="10" y="2" width="3" height="12"/></svg>,
  radar:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>,
  scripts:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8v12H4z"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>,
  map:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="2" y1="10" x2="14" y2="10"/></svg>,
  retry:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8a5 5 0 104-5"/><path d="M3 3v5h5"/></svg>,
  studentAnalytics: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 13h12M4 10l3-4 2 2 3-5"/></svg>,
  pyq:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>,
  paperStudio: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v12H3z"/><path d="M6 6h4M6 9h4M6 12h2"/></svg>,
  guilds:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 14h12V6L8 2 2 6v8z"/><path d="M6 14V9h4v5"/></svg>,
  marketplace: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 2a6 6 0 000 12M2 8h12"/></svg>,
  trajectory:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="3" cy="4" r="2"/><circle cx="13" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><path d="M4.5 5.5l2.5 4.5M11.5 5.5l-2.5 4.5"/></svg>,
  riskRadar:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l6 12H2L8 2z"/><path d="M8 6v4M8 12h.01"/></svg>,
  consensus:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l3 3 7-7"/></svg>,
  logout:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 8H3M7 5l-3 3 3 3"/><path d="M12 2v12"/></svg>,
};

const TEACHER_NAV = [
  { id: 'classes',      label: 'Classes',              icon: 'classes'      },
  { id: 'paper-studio', label: 'AI Paper Studio',      icon: 'paperStudio'  },
  { id: 'upload',       label: 'Batch Upload',          icon: 'upload'       },
  { id: 'rubric',       label: 'Rubric Builder',        icon: 'rubric'       },
  { id: 'analytics',    label: 'Analytics',             icon: 'analytics'    },
  { id: 'radar',        label: 'Malpractice Radar',     icon: 'radar'        },
  { id: 'risk-radar',   label: 'Predictive At-Risk',    icon: 'riskRadar'    },
  { id: 'consensus',    label: 'AI Consensus Engine',  icon: 'consensus'    },
  { id: 'marketplace',  label: 'OpenRubric Market',     icon: 'marketplace'  },
  { id: 'guilds',       label: 'University Guild',     icon: 'guilds'       },
];

const STUDENT_NAV = [
  { id: 'scripts',           label: 'My Scripts',          icon: 'scripts'          },
  { id: 'map',               label: 'Reasoning Map',       icon: 'map'              },
  { id: 'trajectory',        label: 'Reasoning DAG Graph', icon: 'trajectory'       },
  { id: 'retry',             label: 'Step Retry',          icon: 'retry'            },
  { id: 'student-analytics', label: 'Weak-Spot Heatmap',   icon: 'studentAnalytics' },
  { id: 'pyq-practice',      label: 'PYQ Simulator',       icon: 'pyq'              },
  { id: 'marketplace',      label: 'OpenRubric Market',   icon: 'marketplace'      },
  { id: 'guilds',            label: 'University Guild',     icon: 'guilds'           },
];

export default function Sidebar({ role, user, activeView, onNav, onLogout, themeChoice, onToggleTheme }) {
  const nav = role === 'teacher' ? TEACHER_NAV : STUDENT_NAV;
  const initials = user?.name ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const isVerified = user?.is_verified || (user?.email && (user.email.endsWith('.edu') || user.email.endsWith('.ac.in')));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="app-name">{env.appName}</div>
        <div className="app-role flex items-center gap-4">
          <span>{role === 'teacher' ? 'Instructor View' : 'Student View'}</span>
          {isVerified && <span title="Verified Academic Educator" style={{ color: 'var(--sage, #10b981)', fontSize: '12px' }}>✓</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item${activeView === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            {Icons[item.icon]}
            {item.label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: '16px' }}>UI Choice</div>
        <div style={{ padding: '4px 16px 8px' }}>
          <select
            value={themeChoice || 'classic'}
            onChange={(e) => onToggleTheme && onToggleTheme(e.target.value)}
            className="form-input text-xs"
            style={{ width: '100%', padding: '6px 8px', fontSize: '11px', cursor: 'pointer' }}
          >
            <option value="classic">⚡ Classic View (Current UI)</option>
            <option value="modern-dark">✨ Modern Vercel Glass (Dark)</option>
            <option value="modern-light">☀️ Modern Vercel Glass (Light)</option>
          </select>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip mb-8">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name flex items-center gap-4">
              <span>{user?.name ?? 'User'}</span>
              {isVerified && <span className="text-sage" title="Verified Academic Educator">✓</span>}
            </div>
            <div className="user-email">{user?.email ?? ''}</div>
          </div>
        </div>
        <div className="text-xs mb-8" style={{ fontSize: '10px', color: isVerified ? 'var(--sage, #10b981)' : 'var(--mute)' }}>
          {isVerified ? '✓ Verified Academic Educator' : 'Standard Account'}
        </div>
        <button className="ghost-btn full-width" onClick={onLogout} style={{ justifyContent: 'flex-start' }}>
          {Icons.logout} Sign out
        </button>
      </div>
    </aside>
  );
}
