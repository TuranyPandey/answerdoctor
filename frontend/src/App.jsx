import React, { useState } from 'react';
import SimpleLogin from './components/SimpleLogin';
import CleanTeacherDashboard from './components/CleanTeacherDashboard';
import CleanStudentDashboard from './components/CleanStudentDashboard';


export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

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
