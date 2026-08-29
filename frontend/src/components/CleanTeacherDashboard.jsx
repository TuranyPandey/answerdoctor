import React, { useState, useEffect } from 'react';
import { LogOut, Users, BookOpen, BarChart3, AlertCircle } from 'lucide-react';

export default function TeacherDashboard({ user, onLogout }) {
  const [classrooms, setClassrooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // Fetch classrooms for teacher
      const classRes = await fetch('http://127.0.0.1:8000/api/classrooms');
      const classData = await classRes.json();
      
      // Filter classrooms for this teacher
      const teacherClasses = classData.filter(c => c.teacher_id === user.id);
      setClassrooms(teacherClasses);

      if (teacherClasses.length > 0) {
        setSelectedClassroom(teacherClasses[0].id);
        
        // Fetch assignments
        const assignRes = await fetch('http://127.0.0.1:8000/api/assignments');
        const assignData = await assignRes.json();
        const classAssign = assignData.filter(a => a.classroom_id === teacherClasses[0].id);
        setAssignments(classAssign);

        // Fetch analytics
        if (classAssign.length > 0) {
          const analyticsRes = await fetch(`http://127.0.0.1:8000/api/analytics/${classAssign[0].id}`);
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomChange = async (classroomId) => {
    setSelectedClassroom(classroomId);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/assignments');
      const data = await res.json();
      const classAssign = data.filter(a => a.classroom_id === classroomId);
      setAssignments(classAssign);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.full_name}</h1>
            <p className="text-sm text-gray-600 mt-1">Teacher Portal</p>
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
            <p className="text-gray-600">Loading your classroom data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Classrooms Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">My Classrooms</h2>
              </div>
              
              {classrooms.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-600">No classrooms yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classrooms.map(classroom => (
                    <button
                      key={classroom.id}
                      onClick={() => handleClassroomChange(classroom.id)}
                      className={`p-6 rounded-lg border-2 transition text-left ${
                        selectedClassroom === classroom.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{classroom.subject}</p>
                          <p className="text-xs text-gray-500 mt-2">Code: {classroom.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                          <p className="text-xs text-gray-600">Assignments</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Assignments Section */}
            {assignments.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
                </div>
                
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Subject: {assignment.subject}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                              {assignment.exam_type}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {assignment.total_scripts} submissions
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                              {assignment.total_marks} marks
                            </span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap">
                          View Analytics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Analytics Preview */}
            {analytics && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Analytics Summary</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-sm text-gray-600">Class Average</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.class_average_ras?.toFixed(1) || 'N/A'}%</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.cohort_total_scripts || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-sm text-gray-600">Flagged for Review</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{analytics.weakness_heatmap?.length || 0}</p>
                  </div>
                </div>

                {/* Weakness Heatmap */}
                {analytics.weakness_heatmap && (
                  <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Student Weakness Analysis</h3>
                    <div className="space-y-3">
                      {analytics.weakness_heatmap.map(weakness => (
                        <div key={weakness.rubric_unit_id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{weakness.label}</p>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  weakness.pass_rate_pct >= 75 ? 'bg-green-500' :
                                  weakness.pass_rate_pct >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${weakness.pass_rate_pct}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-sm font-semibold px-3 py-1 rounded ${
                            weakness.weakness_level === 'LOW' ? 'bg-green-100 text-green-700' :
                            weakness.weakness_level === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {weakness.pass_rate_pct.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
