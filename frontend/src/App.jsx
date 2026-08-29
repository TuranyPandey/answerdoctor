import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import BatchUploadModal from './components/BatchUploadModal';

const API_BASE = 'http://127.0.0.1:8008/api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('teacher'); // 'teacher' or 'student'
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // App Data
  const [assignment, setAssignment] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [malpractice, setMalpractice] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Assignment details
      const assRes = await fetch(`${API_BASE}/assignments/1`);
      const assData = await assRes.json();
      setAssignment(assData);

      // Class analytics
      const anaRes = await fetch(`${API_BASE}/analytics/assignment/1`);
      const anaData = await anaRes.json();
      setAnalytics(anaData);

      // Malpractice CMI report
      const malRes = await fetch(`${API_BASE}/malpractice/assignment/1`);
      const malData = await malRes.json();
      setMalpractice(malData);

      // Student submission (Sohum 26BCE0616 for demo)
      const subRes = await fetch(`${API_BASE}/submissions/student/2/assignment/1`);
      const subData = await subRes.json();
      setSubmission(subData);
    } catch (err) {
      console.error("Error fetching data from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleReloadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await fetch(`${API_BASE}/analytics/seed-demo`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error("Seed demo error:", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleRetrySubmit = async (stepId, selectedOption) => {
    const res = await fetch(`${API_BASE}/submissions/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step_id: stepId, selected_option: selectedOption })
    });
    const data = await res.json();
    // Refresh submission score
    const subRes = await fetch(`${API_BASE}/submissions/${submission.submission_id}`);
    const updatedSub = await subRes.json();
    setSubmission(updatedSub);
    return data;
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole}
        onReloadDemo={handleReloadDemo}
        isDemoLoading={isDemoLoading}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            <p className="text-xs text-slate-400 font-mono">Connecting to AnswerDoctor Agent Engine...</p>
          </div>
        ) : (
          <>
            {currentRole === 'teacher' ? (
              <TeacherDashboard 
                analytics={analytics}
                malpractice={malpractice}
                assignment={assignment}
                onUploadBatch={() => setIsUploadOpen(true)}
              />
            ) : (
              <StudentDashboard 
                submission={submission}
                onRetrySubmit={handleRetrySubmit}
              />
            )}
          </>
        )}
      </main>

      {/* Batch Script Upload Modal */}
      <BatchUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onComplete={fetchAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        AnswerDoctor • Powered by LangGraph Swarm & Sentence Transformers • Review 0 Screening Submission
      </footer>

    </div>
  );
}
