import React, { useState, useEffect } from 'react';
import { fetchClasses, joinClass, fetchScriptsForClass, uploadSingleScript, fetchStudentAssignments, reverifyScript } from '../../services/api';
import { useToast } from '../Toast';

export default function ScriptList({ onSelectScript }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [loadingScripts, setLoadingScripts] = useState(false);

  // Student Assigned Script Tasks
  const [assignedTasks, setAssignedTasks] = useState([]);

  const [examName, setExamName] = useState('CAT-1');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const loadClasses = async () => {
    try {
      const data = await fetchClasses();
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      toast(err.message || 'Failed to load classes', 'err');
    }
  };

  const loadAssignedTasks = async () => {
    try {
      const list = await fetchStudentAssignments();
      setAssignedTasks(list);
    } catch (_) {
      setAssignedTasks([]);
    }
  };

  useEffect(() => {
    loadClasses();
    loadAssignedTasks();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoadingScripts(true);
      fetchScriptsForClass(selectedClass.id)
        .then(setScripts)
        .catch(() => setScripts([]))
        .finally(() => setLoadingScripts(false));
    }
  }, [selectedClass]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoining(true);
    try {
      const cls = await joinClass(joinCode.toUpperCase());
      toast(`Successfully joined ${cls.name}!`, 'ok');
      setJoinCode('');
      await loadClasses();
      setSelectedClass(cls);
    } catch (err) {
      toast(err.message || 'Failed to join class. Check code.', 'err');
    } finally {
      setJoining(false);
    }
  };

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast('Select or join a class first', 'err');
      return;
    }
    if (!file) {
      toast('Select a script file (Image, PDF, Word, TXT, etc.)', 'err');
      return;
    }
    setUploading(true);
    try {
      await uploadSingleScript(selectedClass.id, examName, file);
      toast('Script submitted! OCR & grading pipeline started.', 'ok');
      setFile(null);
      // Reload scripts and assignments
      const list = await fetchScriptsForClass(selectedClass.id);
      setScripts(list);
      await loadAssignedTasks();
    } catch (err) {
      toast(err.message || 'Upload failed', 'err');
    } finally {
      setUploading(false);
    }
  };

  const handleStartTaskSubmission = (task) => {
    setExamName(task.exam_name);
    const cls = classes.find((c) => c.id === task.class_id);
    if (cls) {
      setSelectedClass(cls);
    }
    toast(`Pre-filled submission for assignment '${task.title}' (${task.exam_name})`, 'info');
  };

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16">
        <div>
          <h2 className="page-title">My Handwritten Scripts</h2>
          <p className="page-subtitle">View step-by-step reasoning diagnostics, submit homework, and view teacher assignments.</p>
        </div>
      </div>

      {/* Assigned Script Tasks from Teacher Banner */}
      {assignedTasks.length > 0 && (
        <div className="card mb-16" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="card-header flex justify-between items-center">
            <div className="card-title">📋 Script Tasks Assigned by Your Instructor ({assignedTasks.length})</div>
          </div>
          <div className="card-body flex flex-col gap-10">
            {assignedTasks.map((t) => (
              <div key={t.id} className="p-12 bg-slate border-rule flex justify-between items-center flex-wrap gap-8" style={{ borderRadius: '8px' }}>
                <div>
                  <div className="flex items-center gap-8 mb-4">
                    <span className="badge badge-sage">{t.exam_name}</span>
                    <span className="font-semibold text-sm">{t.title}</span>
                  </div>
                  {t.instructions && <div className="text-xs text-mute mb-4">{t.instructions}</div>}
                  <div className="text-xs text-mute">Total Marks: {t.total_marks}</div>
                </div>
                <div>
                  {t.has_submitted ? (
                    <span className="badge badge-sage">✓ Submitted</span>
                  ) : (
                    <button
                      className="primary-btn text-xs"
                      onClick={() => handleStartTaskSubmission(t)}
                    >
                      Submit Script for Task →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analytics-grid mb-16">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Join a Classroom</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleJoin} className="flex gap-8">
              <input
                type="text"
                className="form-input text-mono uppercase text-sm"
                placeholder="Enter 8-digit Join Code (e.g. THERM-7X2K)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
              <button type="submit" className="primary-btn text-sm" disabled={joining}>
                {joining ? 'Joining...' : 'Join Class'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Submit Answer Script {selectedClass ? `— ${selectedClass.name}` : ''}</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSingleUpload} className="flex gap-8 items-center">
              <input
                type="text"
                className="form-input text-sm"
                placeholder="Exam Name (e.g. CAT-1)"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                style={{ width: '110px' }}
                required
              />
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt,.zip"
                className="form-input text-sm"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <button type="submit" className="primary-btn text-sm" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="flex gap-8 mb-16">
          {classes.map((cls) => (
            <button
              key={cls.id}
              className={selectedClass?.id === cls.id ? 'primary-btn text-sm' : 'secondary-btn text-sm'}
              onClick={() => setSelectedClass(cls)}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Graded Answer Scripts</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loadingScripts ? (
            <div className="text-mute p-18">Loading your scripts...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Submitted At</th>
                  <th>Scored Marks</th>
                  <th>RAS (Rubric Alignment)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scripts.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.exam_name}</td>
                    <td className="text-mono text-sm">{s.uploaded_at ? new Date(s.uploaded_at).toLocaleDateString() : '—'}</td>
                    <td className="text-mono font-semibold">
                      {s.scored_marks !== null ? `${s.scored_marks} / ${s.total_marks}` : '—'}
                    </td>
                    <td>
                      {s.ras !== null ? (
                        <div className="ras-bar-wrap">
                          <div className="ras-bar-track">
                            <div
                              className="ras-bar-fill"
                              style={{
                                width: `${s.ras * 100}%`,
                                background: s.ras >= 0.75 ? 'var(--sage)' : s.ras >= 0.60 ? 'var(--amber)' : 'var(--fault)',
                              }}
                            />
                          </div>
                          <span className="ras-label">{(s.ras * 100).toFixed(0)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {s.status === 'done' && <span className="badge badge-sage">Graded</span>}
                      {s.status === 'pending' && <span className="badge badge-amber">Pending OCR</span>}
                      {s.status === 'ocr' && <span className="badge badge-amber">Extracting Vision...</span>}
                      {s.status === 'grading' && <span className="badge badge-amber">Aligning Rubric...</span>}
                      {s.status === 'error' && (
                        <span className="badge badge-fault" title={s.error_message || 'Image unreadable or server error'}>
                          ⚠️ Image Quality Alert
                        </span>
                      )}
                    </td>
                    <td>
                      {s.status === 'done' ? (
                        <div className="flex gap-6 items-center">
                          <button
                            className="primary-btn text-sm"
                            onClick={() => onSelectScript(s)}
                          >
                            View Reasoning Map
                          </button>
                          <button
                            className="secondary-btn text-xs"
                            onClick={async () => {
                              try {
                                toast('Queued script for holistic AI concept re-verification...', 'info');
                                await reverifyScript(s.id);
                                toast('✓ Sent script for AI concept re-verification!', 'ok');
                                if (selectedClass) {
                                  const updated = await fetchScriptsForClass(selectedClass.id);
                                  setScripts(updated);
                                }
                              } catch (err) {
                                toast(err.message || 'Re-verification failed', 'err');
                              }
                            }}
                            title="Force fresh AI concept re-verification against rubric key"
                          >
                            🔄 Reverify
                          </button>
                        </div>
                      ) : s.status === 'error' ? (
                        <div className="flex flex-col gap-4">
                          <div className="text-xs text-fault font-semibold">{s.error_message || '⚠️ Picture is low quality or unreadable.'}</div>
                          <button
                            className="secondary-btn text-xs"
                            onClick={() => {
                              setExamName(s.exam_name);
                              toast(`Re-upload script for ${s.exam_name}`, 'info');
                            }}
                          >
                            📷 Re-upload Script
                          </button>
                        </div>
                      ) : (
                        <button className="primary-btn text-sm" disabled>
                          Processing...
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {scripts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-mute" style={{ padding: '24px' }}>
                      No scripts submitted yet for this class. Submit your handwritten answer script above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
