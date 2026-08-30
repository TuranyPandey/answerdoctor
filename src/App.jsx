import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import env from './config/env';
import { ToastProvider } from './components/Toast';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';

// Teacher Views
import ClassManager from './components/Teacher/ClassManager';
import BatchUpload from './components/Teacher/BatchUpload';
import RubricBuilder from './components/Teacher/RubricBuilder';
import Analytics from './components/Teacher/Analytics';
import MalpracticeRadar from './components/Teacher/MalpracticeRadar';
import AIQuestionPaperStudio from './components/Teacher/AIQuestionPaperStudio';

// Student Views
import ScriptList from './components/Student/ScriptList';
import ReasoningMap from './components/Student/ReasoningMap';
import StepRetry from './components/Student/StepRetry';
import StudentAnalytics from './components/Student/StudentAnalytics';
import StudentPYQPractice from './components/Student/StudentPYQPractice';
import UniversityGuildHub from './components/Guild/UniversityGuildHub';
import OpenRubricMarketplace from './components/OpenMarketplace/OpenRubricMarketplace';
import ReasoningTrajectory from './components/Student/ReasoningTrajectory';
import PredictiveRiskRadar from './components/Teacher/PredictiveRiskRadar';
import GradingConsensus from './components/Teacher/GradingConsensus';

import { fetchMe } from './services/api';

function MainApp() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedScript, setSelectedScript] = useState(null);
  const [retryContext, setRetryContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeChoice, setThemeChoice] = useState(() => localStorage.getItem('theme_choice') || 'classic');

  useEffect(() => {
    localStorage.setItem('theme_choice', themeChoice);
    const root = document.documentElement;
    root.classList.remove('theme-classic', 'theme-modern', 'dark', 'light');

    if (themeChoice === 'modern-dark') {
      root.classList.add('theme-modern', 'dark');
    } else if (themeChoice === 'modern-light') {
      root.classList.add('theme-modern', 'light');
    } else {
      root.classList.add('theme-classic');
    }
  }, [themeChoice]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe()
        .then((u) => {
          setUser(u);
          setActiveView(u.role === 'teacher' ? 'classes' : 'scripts');
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    setActiveView(userObj.role === 'teacher' ? 'classes' : 'scripts');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSelectedClass(null);
    setSelectedScript(null);
    setRetryContext(null);
  };

  const handleSelectScript = (script) => {
    setSelectedScript(script);
    setActiveView('map');
  };

  const handleSelectStepRetry = (scriptId, rubricUnit) => {
    setRetryContext({ scriptId, rubricUnit });
    setActiveView('retry');
  };

  if (loading) {
    return (
      <div className="auth-page text-mute text-center p-24">
        Initializing AnswerDoctor session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100 }}>
          <select
            value={themeChoice}
            onChange={(e) => setThemeChoice(e.target.value)}
            className="form-input text-xs"
            style={{ padding: '6px 12px', borderRadius: themeChoice.startsWith('modern') ? '8px' : '0px' }}
          >
            <option value="classic">⚡ Classic Technical UI</option>
            <option value="modern-dark">✨ Modern Vercel Glass (Dark)</option>
            <option value="modern-light">☀️ Modern Vercel Glass (Light)</option>
          </select>
        </div>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        role={user.role}
        user={user}
        activeView={activeView}
        onNav={setActiveView}
        onLogout={handleLogout}
        themeChoice={themeChoice}
        onToggleTheme={setThemeChoice}
      />
      <main className="main-content">
        {user.role === 'teacher' && (
          <>
            {activeView === 'classes' && (
              <ClassManager
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
              />
            )}
            {activeView === 'paper-studio' && (
              <AIQuestionPaperStudio selectedClass={selectedClass} />
            )}
            {activeView === 'upload' && (
              <BatchUpload selectedClass={selectedClass} onViewScript={handleSelectScript} />
            )}
            {activeView === 'rubric' && (
              <RubricBuilder selectedClass={selectedClass} />
            )}
            {activeView === 'analytics' && (
              <Analytics selectedClass={selectedClass} />
            )}
            {activeView === 'radar' && (
              <MalpracticeRadar selectedClass={selectedClass} />
            )}
            {activeView === 'risk-radar' && (
              <PredictiveRiskRadar selectedClass={selectedClass} />
            )}
            {activeView === 'consensus' && (
              <GradingConsensus />
            )}
            {activeView === 'marketplace' && (
              <OpenRubricMarketplace selectedClass={selectedClass} user={user} />
            )}
            {activeView === 'map' && (
              <ReasoningMap
                script={selectedScript}
                onSelectStepRetry={handleSelectStepRetry}
              />
            )}
            {activeView === 'guilds' && (
              <UniversityGuildHub user={user} />
            )}
          </>
        )}

        {user.role === 'student' && (
          <>
            {activeView === 'scripts' && (
              <ScriptList onSelectScript={handleSelectScript} />
            )}
            {activeView === 'map' && (
              <ReasoningMap
                script={selectedScript}
                onSelectStepRetry={handleSelectStepRetry}
              />
            )}
            {activeView === 'trajectory' && (
              <ReasoningTrajectory script={selectedScript} />
            )}
            {activeView === 'retry' && (
              <StepRetry retryContext={retryContext} />
            )}
            {activeView === 'student-analytics' && (
              <StudentAnalytics onSelectScript={handleSelectScript} />
            )}
            {activeView === 'pyq-practice' && (
              <StudentPYQPractice />
            )}
            {activeView === 'marketplace' && (
              <OpenRubricMarketplace selectedClass={selectedClass} user={user} />
            )}
            {activeView === 'guilds' && (
              <UniversityGuildHub user={user} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const clientId = env.googleClientId || 'dummy-id';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
