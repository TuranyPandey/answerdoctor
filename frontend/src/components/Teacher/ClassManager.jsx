import React, { useState, useEffect } from 'react';
import { fetchClasses, createClass, fetchStudentsForClass, createAssignment, fetchAssignments } from '../../services/api';
import { useToast } from '../Toast';
import StudentHistoryModal from './StudentHistoryModal';

export default function ClassManager({ selectedClass, onSelectClass }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  // Assignment Modal & State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignExamName, setAssignExamName] = useState('CAT-1');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignTotalMarks, setAssignTotalMarks] = useState(10);
  const [assignFile, setAssignFile] = useState(null);
  const [postingAssign, setPostingAssign] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const toast = useToast();

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await fetchClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        onSelectClass(data[0]);
      }
    } catch (err) {
      toast(err.message || 'Failed to load classes', 'err');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentsForClass = async (classId) => {
    if (!classId) return;
    try {
      const list = await fetchAssignments(classId);
      setAssignments(list);
    } catch (_) {
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass.id)
        .then(setStudents)
        .catch(() => setStudents([]));
      loadAssignmentsForClass(selectedClass.id);
    }
  }, [selectedClass]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!name || !subject) return;
    try {
      const newCls = await createClass({ name, subject });
      toast(`Class '${newCls.name}' created! Code: ${newCls.join_code}`, 'ok');
      setName('');
      setSubject('');
      setShowModal(false);
      await loadClasses();
      onSelectClass(newCls);
    } catch (err) {
      toast(err.message || 'Failed to create class', 'err');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast('Please select a class first', 'err');
      return;
    }
    if (!assignTitle || !assignExamName) {
      toast('Fill in assignment title and exam code', 'err');
      return;
    }

    setPostingAssign(true);
    try {
      await createAssignment(
        selectedClass.id,
        assignTitle,
        assignExamName,
        assignInstructions,
        assignTotalMarks,
        assignFile
      );
      toast(`Assigned '${assignTitle}' to ${selectedClass.name}!`, 'ok');
      setAssignTitle('');
      setAssignInstructions('');
      setAssignFile(null);
      setShowAssignModal(false);
      await loadAssignmentsForClass(selectedClass.id);
    } catch (err) {
      toast(err.message || 'Failed to post assignment', 'err');
    } finally {
      setPostingAssign(false);
    }
  };

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">Classrooms & Script Assignments</h2>
          <p className="page-subtitle">Manage class cohorts, student rosters, and assign script tasks/exams</p>
        </div>
        <div className="flex gap-8 flex-wrap">
          {selectedClass && (
            <button className="secondary-btn flex items-center gap-6" onClick={() => setShowAssignModal(true)}>
              📋 Assign Script Task
            </button>
          )}
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Create New Class
          </button>
        </div>
      </div>

      {showModal && (
        <div className="card mb-16 p-18">
          <div className="card-title mb-12">New Classroom</div>
          <form onSubmit={handleCreateClass} className="flex gap-12 items-center flex-wrap">
            <input
              type="text"
              className="form-input"
              placeholder="Class Name (e.g. Thermodynamics 201)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Subject (e.g. Mechanical Engineering)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn">Save Class</button>
            <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* ── Assign Script Task Modal ─────────────────────────────────────── */}
      {showAssignModal && selectedClass && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px' }}>
            <div className="card-header flex justify-between items-center bg-slate">
              <div>
                <div className="card-title">📋 Assign Script Task — {selectedClass.name}</div>
                <div className="text-xs text-mute">Post an answer script task or exam for all enrolled students.</div>
              </div>
              <button className="secondary-btn text-xs" onClick={() => setShowAssignModal(false)}>✕ Close</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateAssignment} className="flex flex-col gap-12">
                <div>
                  <label className="text-xs text-mute font-semibold uppercase block mb-4">Assignment Title:</label>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="e.g. Thermodynamics Midterm Exam 1"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-12">
                  <div style={{ flex: 1 }}>
                    <label className="text-xs text-mute font-semibold uppercase block mb-4">Exam Identifier Code:</label>
                    <input
                      type="text"
                      className="form-input text-sm"
                      placeholder="e.g. CAT-1"
                      value={assignExamName}
                      onChange={(e) => setAssignExamName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ width: '130px' }}>
                    <label className="text-xs text-mute font-semibold uppercase block mb-4">Total Marks:</label>
                    <input
                      type="number"
                      className="form-input text-sm text-mono"
                      value={assignTotalMarks}
                      onChange={(e) => setAssignTotalMarks(parseFloat(e.target.value) || 10)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-mute font-semibold uppercase block mb-4">Instructions for Students:</label>
                  <textarea
                    rows={3}
                    className="form-input text-sm"
                    placeholder="e.g. Show full state equations, energy balance calculations, and explicit units..."
                    value={assignInstructions}
                    onChange={(e) => setAssignInstructions(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-mute font-semibold uppercase block mb-4">Attach Question Paper (Optional PDF/Image):</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.txt"
                    className="form-input text-xs"
                    onChange={(e) => setAssignFile(e.target.files[0] || null)}
                  />
                </div>

                <div className="flex justify-end gap-8 mt-8">
                  <button type="button" className="secondary-btn text-xs" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="primary-btn text-xs" disabled={postingAssign}>
                    {postingAssign ? 'Posting Assignment...' : 'Publish Script Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-mute">Loading classrooms...</div>
      ) : (
        <div className="flex flex-col gap-16">
          <div className="analytics-grid">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Classroom Roster</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Subject</th>
                      <th>Join Code</th>
                      <th>Students</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id} className={selectedClass?.id === cls.id ? 'bg-slate-soft' : ''}>
                        <td style={{ fontWeight: 600 }}>{cls.name}</td>
                        <td>{cls.subject}</td>
                        <td><span className="badge badge-amber">{cls.join_code}</span></td>
                        <td>{cls.student_count || 0} enrolled</td>
                        <td>
                          <button
                            className={selectedClass?.id === cls.id ? 'primary-btn text-sm' : 'secondary-btn text-sm'}
                            onClick={() => onSelectClass(cls)}
                          >
                            {selectedClass?.id === cls.id ? 'Active' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {classes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-mute" style={{ padding: '24px' }}>
                          No classrooms created yet. Click "+ Create New Class" above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  {selectedClass ? `Enrolled Students in ${selectedClass.name}` : 'Select a Classroom'}
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {selectedClass ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((stu) => (
                        <tr key={stu.id}>
                          <td style={{ fontWeight: 500 }}>{stu.name}</td>
                          <td className="text-mono text-sm">{stu.email}</td>
                          <td><span className="badge badge-sage">{stu.role}</span></td>
                          <td>
                            <button
                              className="secondary-btn text-xs"
                              onClick={() => setSelectedHistoryStudent(stu)}
                            >
                              📜 View History & Progress
                            </button>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-mute" style={{ padding: '24px' }}>
                            No students enrolled yet. Share join code <strong className="text-amber">{selectedClass.join_code}</strong> with students.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-mute p-18 text-center">Select a class to view roster</div>
                )}
              </div>
            </div>
          </div>

          {/* Active Assigned Script Tasks */}
          {selectedClass && (
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <div className="card-title">Active Script Tasks Assigned to {selectedClass.name} ({assignments.length})</div>
                <button className="primary-btn text-xs" onClick={() => setShowAssignModal(true)}>+ Post New Assignment</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Exam Code</th>
                      <th>Marks</th>
                      <th>Submission Status</th>
                      <th>Date Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td className="font-semibold">{a.title}</td>
                        <td><span className="badge badge-sage">{a.exam_name}</span></td>
                        <td className="text-mono">{a.total_marks} Marks</td>
                        <td>
                          <span className="badge badge-amber">
                            {a.submitted_count || 0} / {a.total_students || 0} Students Submitted
                          </span>
                        </td>
                        <td className="text-mono text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {assignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-mute p-18">
                          No script tasks assigned yet to this classroom. Click "+ Post New Assignment" above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedHistoryStudent && (
        <StudentHistoryModal
          student={selectedHistoryStudent}
          selectedClass={selectedClass}
          onClose={() => setSelectedHistoryStudent(null)}
        />
      )}
    </div>
  );
}
