import React, { useState, useEffect } from 'react';
import env from '../../config/env';
import { uploadBatchZip, fetchScriptsForClass, reprocessAllScripts } from '../../services/api';
import { useToast } from '../Toast';

export default function BatchUpload({ selectedClass, onViewScript }) {
  const [examName, setExamName] = useState('CAT-1');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [classScripts, setClassScripts] = useState([]);
  const toast = useToast();

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      await reprocessAllScripts();
      toast('Queued failed scripts for reprocessing', 'ok');
      await loadClassScripts();
    } catch (err) {
      toast(err.message || 'Reprocessing failed', 'err');
    } finally {
      setReprocessing(false);
    }
  };

  const loadClassScripts = async () => {
    if (!selectedClass) return;
    try {
      const scripts = await fetchScriptsForClass(selectedClass.id);
      setClassScripts(scripts);
    } catch (_) {}
  };

  useEffect(() => {
    loadClassScripts();
  }, [selectedClass]);

  useEffect(() => {
    let intervalId = null;
    const hasPending = batchResults.some(r => r.status === 'processing' || r.status === 'pending' || r.status === 'ocr' || r.status === 'grading') ||
                       classScripts.some(s => s.status === 'pending' || s.status === 'ocr' || s.status === 'grading');

    if (selectedClass) {
      intervalId = setInterval(async () => {
        try {
          const scripts = await fetchScriptsForClass(selectedClass.id);
          setClassScripts(scripts);
          setBatchResults(prev =>
            prev.map(r => {
              if (!r.script_id) return r;
              const matched = scripts.find(s => s.id === r.script_id);
              if (matched) {
                return {
                  ...r,
                  status: matched.status,
                  scored_marks: matched.scored_marks,
                  total_marks: matched.total_marks,
                  ras: matched.ras,
                  error: matched.error_message || r.error,
                };
              }
              return r;
            })
          );
        } catch (_) {}
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [batchResults, classScripts, selectedClass]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast('Please select a class first from Classrooms tab', 'err');
      return;
    }
    if (!files || files.length === 0) {
      toast('Please select one or more files (Image, PDF, Word, TXT, etc.)', 'err');
      return;
    }

    setUploading(true);
    try {
      const results = await uploadBatchZip(selectedClass.id, examName, files);
      setBatchResults(results);
      toast(`Upload submitted for ${results.length} script(s)`, 'ok');
      await loadClassScripts();
    } catch (err) {
      toast(err.message || 'Script upload failed', 'err');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="mb-16">
        <h2 className="page-title">Script Upload & Processing</h2>
        <p className="page-subtitle">
          Upload student answer scripts (Images, PDF, Word documents, Text files, or ZIP archives) for automatic OCR, rubric alignment, and collusion detection.
        </p>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">
            Pipeline Ingestion {selectedClass ? `— ${selectedClass.name}` : '(No Class Selected)'}
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpload}>
            <div className="flex gap-16 items-center mb-16">
              <div style={{ flex: 1 }}>
                <label className="form-label">Exam / Assessment Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. CAT-1, FAT, Quiz 2"
                  required
                />
              </div>
              <div style={{ flex: 2 }}>
                <label className="form-label">Script File(s) — Images, PDF, Word, Text, Archives</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt,.zip"
                  className="form-input"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  required
                />
              </div>
              <div style={{ paddingTop: '18px' }}>
                <button type="submit" className="primary-btn" disabled={uploading}>
                  {uploading ? 'Processing Pipeline...' : 'Start Ingestion'}
                </button>
              </div>
            </div>
          </form>

          <div className="text-sm text-mute">
            <strong>Supported File Formats:</strong> Images (PNG, JPG, WEBP), PDFs, Word Documents (.docx, .doc), Text files (.txt), or ZIP archives. Select single or multiple files directly without needing a ZIP file.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div className="card-title">All Class Submissions & Pipeline Status</div>
          <div className="flex items-center gap-12">
            {classScripts.some(s => s.status === 'error') && (
              <button
                className="secondary-btn text-sm"
                onClick={handleReprocess}
                disabled={reprocessing}
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                {reprocessing ? 'Reprocessing Pipeline...' : '⚡ Reprocess Failed Scripts'}
              </button>
            )}
            {selectedClass && (
              <div className="text-sm text-mute">{classScripts.length} script(s) uploaded</div>
            )}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Email</th>
                <th>Student Name</th>
                <th>Exam Name</th>
                <th>Pipeline Status</th>
                <th>Marks Scored</th>
                <th>RAS Alignment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classScripts.map((s) => (
                <tr key={s.id}>
                  <td className="text-mono">{s.student?.email || '—'}</td>
                  <td>{s.student?.name || '—'}</td>
                  <td>{s.exam_name}</td>
                  <td>
                    {(s.status === 'processing' || s.status === 'pending' || s.status === 'ocr' || s.status === 'grading') && (
                      <span className="badge badge-amber">OCR & Grading ({s.status})...</span>
                    )}
                    {s.status === 'done' && <span className="badge badge-sage">Graded & Aligned</span>}
                    {s.status === 'error' && <span className="badge badge-fault" title={s.error_message}>{s.error_message || 'Failed'}</span>}
                  </td>
                  <td className="text-mono">
                    {s.status === 'done' ? (
                      <strong className="text-sage">{s.scored_marks} / {s.total_marks}</strong>
                    ) : '—'}
                  </td>
                  <td className="text-mono">
                    {s.status === 'done' && s.ras !== null ? (
                      <span className="text-amber" style={{ fontWeight: 600 }}>{(s.ras * 100).toFixed(0)}%</span>
                    ) : '—'}
                  </td>
                  <td>
                    {s.status === 'done' ? (
                      <button
                        className="primary-btn text-sm"
                        onClick={() => onViewScript && onViewScript(s)}
                      >
                        View Reasoning Map →
                      </button>
                    ) : s.status === 'error' ? (
                      <button
                        className="secondary-btn text-xs"
                        onClick={handleReprocess}
                        disabled={reprocessing}
                        style={{ color: '#f87171' }}
                      >
                        Retry Script
                      </button>
                    ) : (
                      <span className="text-mute text-xs">Processing...</span>
                    )}
                  </td>
                </tr>
              ))}
              {classScripts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-mute" style={{ padding: '24px' }}>
                    No scripts uploaded yet for this class. Select files above and click "Start Ingestion".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

