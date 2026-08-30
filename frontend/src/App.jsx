import React, { useEffect, useState } from 'react';
import RoleSelector from './components/RoleSelector';
import AuthForm from './components/SimpleLogin';
import CleanTeacherDashboard from './components/CleanTeacherDashboard';
import CleanStudentDashboard from './components/CleanStudentDashboard';

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('answerdoctor-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [user, setUser] = useState(null);
  const [authStep, setAuthStep] = useState('role'); // 'role', 'auth', 'dashboard'
  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('answerdoctor-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');

  const handleRoleSelect = (data) => {
    setRoleData(data);
    setAuthStep('auth');
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setAuthStep('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthStep('role');
    setRoleData(null);
  };

  const handleBackToRole = () => {
    setAuthStep('role');
    setRoleData(null);
  };

  if (authStep === 'role') {
    return <RoleSelector onSelectRole={handleRoleSelect} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (authStep === 'auth') {
    return (
      <AuthForm 
        role={roleData?.role}
        authType={roleData?.authType}
        onLogin={handleLogin}
        onBack={handleBackToRole}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (authStep === 'dashboard' && user) {
    return (
      <>
        {user.role === 'teacher' ? (
          <CleanTeacherDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        ) : (
          <CleanStudentDashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
        )}
      </>
    );
  }

  return null;
}
