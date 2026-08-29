import React, { useState } from 'react';
import RoleSelector from './components/RoleSelector';
import AuthForm from './components/SimpleLogin';
import CleanTeacherDashboard from './components/CleanTeacherDashboard';
import CleanStudentDashboard from './components/CleanStudentDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [authStep, setAuthStep] = useState('role'); // 'role', 'auth', 'dashboard'
  const [roleData, setRoleData] = useState(null);

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
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  if (authStep === 'auth') {
    return (
      <AuthForm 
        role={roleData?.role}
        authType={roleData?.authType}
        onLogin={handleLogin}
        onBack={handleBackToRole}
      />
    );
  }

  if (authStep === 'dashboard' && user) {
    return (
      <>
        {user.role === 'teacher' ? (
          <CleanTeacherDashboard user={user} onLogout={handleLogout} />
        ) : (
          <CleanStudentDashboard user={user} onLogout={handleLogout} />
        )}
      </>
    );
  }

  return null;
}
