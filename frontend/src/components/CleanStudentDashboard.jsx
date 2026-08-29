import React, { useState, useEffect } from 'react';
import { LogOut, FileText, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard({ user, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, passed: 0, flagged: 0, average: 0 });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // Fetch all submissions and filter for this student
      const res = await fetch('http://127.0.0.1:8000/api/submissions');
      const data = await res.json();
      
      const studentSubs = data.filter(sub => sub.student_id === user.id || sub.student_name === user.full_name);
      setSubmissions(studentSubs);

      // Calculate stats
      if (studentSubs.length > 0) {
        const passed = studentSubs.filter(s => s.total_ras_score >= 60).length;
        const flagged = studentSubs.filter(s => s.is_collusion_flagged).length;
        const avgScore = (studentSubs.reduce((sum, s) => sum + s.total_ras_score, 0) / studentSubs.length).toFixed(1);

        setStats({
          total: studentSubs.length,
          passed,
          flagged,
          average: avgScore
        });

        // Load first submission details
        if (studentSubs.length > 0) {
          setSelectedSubmission(studentSubs[0].id);
          loadSubmissionDetails(studentSubs[0].id);
        }
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetails = async (submissionId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/submissions/${submissionId}`);
      const data = await res.json();
      setSubmissionDetails(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSelectSubmission = (submissionId) => {
    setSelectedSubmission(submissionId);
    loadSubmissionDetails(submissionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hi, {user.full_name.split(' ')[0]}!</h1>
            <p className="text-sm text-gray-600 mt-1">Student Portal • Registration: {user.register_number}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading your submissions...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Stats */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-sm text-gray-600">Submissions</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.passed}</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-sm text-gray-600">Class Average</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.average}%</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-sm text-gray-600">Flagged</p>
                  <p className={`text-3xl font-bold mt-2 ${stats.flagged > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.flagged}
                  </p>
                </div>
              </div>
            </section>

            {/* Submissions List and Details */}
            {submissions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submissions List */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> My Submissions
                  </h2>
                  <div className="space-y-3">
                    {submissions.map(submission => (
                      <button
                        key={submission.id}
                        onClick={() => handleSelectSubmission(submission.id)}
                        className={`w-full p-4 rounded-lg border-2 transition text-left ${
                          selectedSubmission === submission.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">Assignment {submission.assignment_id}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(submission.submission_time).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              submission.total_ras_score >= 60 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {submission.total_ras_score.toFixed(0)}%
                            </p>
                            {submission.is_collusion_flagged && (
                              <AlertCircle className="w-4 h-4 text-red-600 mt-1" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submission Details */}
                {submissionDetails && (
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> Submission Analysis
                    </h2>

                    <div className="bg-white rounded-lg border border-gray-200 space-y-6">
                      {/* Score Card */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-gray-600 text-sm">Overall Score</p>
                            <p className="text-4xl font-bold text-gray-900 mt-1">
                              {submissionDetails.total_ras_score?.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="w-20 h-20 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white">
                              <span className="text-2xl font-bold text-blue-600">
                                {Math.round(submissionDetails.total_ras_score / 20)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm font-medium ${
                          submissionDetails.total_ras_score >= 60 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submissionDetails.total_ras_score >= 60 ? '✓ Passed' : '✗ Below Passing'}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">OCR Confidence</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {(submissionDetails.ocr_confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Steps Analyzed</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {submissionDetails.steps?.length || 0}
                            </p>
                          </div>
                        </div>

                        {submissionDetails.is_collusion_flagged && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-900">Flagged for Review</p>
                              <p className="text-sm text-red-700 mt-1">
                                This submission has been flagged for potential academic integrity concerns.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Steps */}
                      {submissionDetails.steps && submissionDetails.steps.length > 0 && (
                        <div className="px-6 pb-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Step-by-Step Feedback</h3>
                          <div className="space-y-4">
                            {submissionDetails.steps.map((step, idx) => (
                              <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    {step.status === 'MATCHED' ? (
                                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    ) : step.status === 'WEAK' ? (
                                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">Step {step.step_number}: {step.status}</p>
                                    <p className="text-sm text-gray-600 mt-1">{step.student_text}</p>
                                    {step.diagnosis_text && (
                                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                        <p className="font-medium mb-1">Feedback:</p>
                                        <p>{step.diagnosis_text}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions yet. Your assignments will appear here.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
