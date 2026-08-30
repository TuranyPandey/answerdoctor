import React, { useState, useEffect } from 'react';
import { fetchRubric, saveRubric, uploadRubricDocument, fetchPYQs, importPYQToRubric, testRubricSandbox } from '../../services/api';
import { useToast } from '../Toast';

const UNIT_TYPES = ['Concept', 'Formula', 'Step', 'Transformation', 'Result'];

export default function RubricBuilder({ selectedClass }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sandbox Modal state
  const [showSandbox, setShowSandbox] = useState(false);
  const [sampleSolution, setSampleSolution] = useState('');
  const [testingSandbox, setTestingSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState(null);

  // PYQ Modal state
  const [showPyqModal, setShowPyqModal] = useState(false);
  const [pyqs, setPyqs] = useState([]);
  const [pyqSearch, setPyqSearch] = useState('');
  const [pyqLoading, setPyqLoading] = useState(false);
  const [importingPyqId, setImportingPyqId] = useState(null);

  const toast = useToast();

  const loadRubric = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const data = await fetchRubric(selectedClass.id);
      setUnits(data.length > 0 ? data : defaultUnits());
    } catch (err) {
      toast(err.message || 'Failed to load rubric', 'err');
      setUnits(defaultUnits());
    } finally {
      setLoading(false);
    }
  };

  const defaultUnits = () => [
    { type: 'Concept', label: 'Identify thermodynamic system boundary and reference state', weight: 1.5, criteria_notes: 'Accept system state notes or reference boundary sketches' },
    { type: 'Formula', label: 'State the First Law: Q - W = ΔU for closed system', weight: 2.0, criteria_notes: 'Accept q - w = u2 - u1 or enthalpy formulation' },
    { type: 'Step', label: 'Establish initial reference state variables (u1, u2) from steam tables', weight: 2.0, criteria_notes: 'Accept interpolated values or steam chart readings' },
    { type: 'Step', label: 'Compute boundary work W = P(V2 - V1)', weight: 2.0, criteria_notes: 'Accept pdV or integral form' },
    { type: 'Transformation', label: 'Algebraic calculation of Q = ΔU + W', weight: 1.5, criteria_notes: 'Accept equivalent algebraic steps' },
    { type: 'Result', label: 'Final numerical answer with correct units (kJ)', weight: 1.0, criteria_notes: 'Accept +-2% rounding variation' },
  ];

  useEffect(() => {
    loadRubric();
  }, [selectedClass]);

  const handleAddUnit = () => {
    setUnits([
      ...units,
      { type: 'Step', label: 'New reasoning step description', weight: 1.0, criteria_notes: '' },
    ]);
  };

  const handleRemoveUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const next = [...units];
    next[index][field] = field === 'weight' ? parseFloat(value) || 0 : value;
    setUnits(next);
  };

  const handleSave = async () => {
    if (!selectedClass) {
      toast('Select a class first', 'err');
      return;
    }
    setSaving(true);
    try {
      await saveRubric(selectedClass.id, units);
      toast('Rubric decomposition saved successfully!', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to save rubric', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSandboxTest = async (e) => {
    e.preventDefault();
    if (!sampleSolution.trim()) {
      toast('Paste or type a sample student solution first', 'err');
      return;
    }
    setTestingSandbox(true);
    setSandboxResult(null);
    try {
      const res = await testRubricSandbox(units, sampleSolution);
      setSandboxResult(res);
      toast(`Live AI Test Complete! Candidate RAS: ${(res.ras * 100).toFixed(0)}%`, 'ok');
    } catch (err) {
      toast(err.message || 'Sandbox test failed', 'err');
    } finally {
      setTestingSandbox(false);
    }
  };

  // ── Document Rubric Upload ───────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedClass) {
      toast('Please select a classroom first', 'err');
      return;
    }

    setUploading(true);
    try {
      const parsedUnits = await uploadRubricDocument(selectedClass.id, file);
      setUnits(parsedUnits);
      toast(`Successfully parsed '${file.name}' into ${parsedUnits.length} atomic rubric units!`, 'ok');
    } catch (err) {
      toast(err.message || 'Failed to parse rubric document', 'err');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── PYQ Database modal handlers ──────────────────────────────────────────
  const handleOpenPyqModal = async () => {
    setShowPyqModal(true);
    await loadPyqs(pyqSearch);
  };

  const loadPyqs = async (subject = '') => {
    setPyqLoading(true);
    try {
      const data = await fetchPYQs(subject);
      setPyqs(data);
    } catch (err) {
      toast(err.message || 'Failed to load PYQ database', 'err');
    } finally {
      setPyqLoading(false);
    }
  };

  const handleImportPyq = async (pyqId) => {
    if (!selectedClass) {
      toast('Select a class first', 'err');
      return;
    }
    setImportingPyqId(pyqId);
    try {
      const imported = await importPYQToRubric(pyqId, selectedClass.id);
      setUnits(imported);
      toast('PYQ solution criteria imported as class rubric!', 'ok');
      setShowPyqModal(false);
    } catch (err) {
      toast(err.message || 'Failed to import PYQ', 'err');
    } finally {
      setImportingPyqId(null);
    }
  };

  const totalWeight = units.reduce((acc, u) => acc + (u.weight || 0), 0);

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-12">
        <div>
          <h2 className="page-title">Agentic Rubric Decomposer & AI Grader Simulator</h2>
          <p className="page-subtitle">
            Decompose marking schemes into atomic reasoning units and define alternative equivalent solution criteria.
          </p>
        </div>
        <div className="flex gap-8 flex-wrap">
          <button className="secondary-btn flex items-center gap-6" onClick={() => setShowSandbox(true)}>
            🧪 Test Rubric Sandbox
          </button>
          <label className="secondary-btn flex items-center gap-6 cursor-pointer" style={{ margin: 0 }}>
            {uploading ? 'Parsing File...' : '📁 Upload Document (PDF/Image)'}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <button className="secondary-btn flex items-center gap-6" onClick={handleOpenPyqModal}>
            📚 PYQ Database
          </button>
          <button className="secondary-btn" onClick={handleAddUnit}>+ Add Unit</button>
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Rubric'}
          </button>
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-header flex justify-between items-center">
          <div className="card-title">
            Atomic Marking Units {selectedClass ? `— ${selectedClass.name}` : ''}
          </div>
          <div className="text-mono text-amber text-sm font-semibold">
            Total Marks: {totalWeight.toFixed(1)}
          </div>
        </div>
        <div className="card-body">
          {loading || uploading ? (
            <div className="text-mute text-center p-24">
              {uploading ? 'Running Vision OCR & Parsing Document Rubric...' : 'Loading rubric decomposition...'}
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {units.map((unit, index) => (
                <div key={index} className="p-12 bg-slate border-rule flex flex-col gap-8" style={{ borderRadius: '8px' }}>
                  <div className="flex items-center gap-12 flex-wrap">
                    <select
                      className="form-input select text-sm"
                      style={{ width: '130px' }}
                      value={unit.type}
                      onChange={(e) => handleChange(index, 'type', e.target.value)}
                    >
                      {UNIT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="form-input text-sm"
                      style={{ flex: 1 }}
                      value={unit.label}
                      onChange={(e) => handleChange(index, 'label', e.target.value)}
                      placeholder="Describe atomic reasoning requirement..."
                    />

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-mute">Marks:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        className="form-input text-sm text-mono"
                        style={{ width: '70px' }}
                        value={unit.weight}
                        onChange={(e) => handleChange(index, 'weight', e.target.value)}
                      />
                    </div>

                    <button
                      className="danger-btn text-sm"
                      onClick={() => handleRemoveUnit(index)}
                      title="Delete unit"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Equivalent Solution / Criteria Notes */}
                  <div className="flex items-center gap-8 pl-4">
                    <span className="text-xs text-mute font-semibold" style={{ whiteSpace: 'nowrap' }}>Alternative Paths / Notes:</span>
                    <input
                      type="text"
                      className="form-input text-xs"
                      style={{ flex: 1, padding: '4px 8px' }}
                      value={unit.criteria_notes || ''}
                      onChange={(e) => handleChange(index, 'criteria_notes', e.target.value)}
                      placeholder="e.g. Accept Q - W = delta U or q - w = delta u; allow +-2% rounding"
                    />
                  </div>
                </div>
              ))}

              {units.length === 0 && (
                <div className="text-mute text-center p-18">
                  No rubric units added yet. Click "+ Add Unit", "Upload Document", or "PYQ Database" above.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Test Rubric Sandbox Modal ─────────────────────────────────────── */}
      {showSandbox && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header flex justify-between items-center bg-slate">
              <div>
                <div className="card-title">🧪 Interactive Rubric Tester Sandbox</div>
                <div className="text-xs text-mute">Test candidate rubric units live against a sample student solution before saving.</div>
              </div>
              <button className="secondary-btn text-xs" onClick={() => setShowSandbox(false)}>✕ Close</button>
            </div>
            <div className="card-body" style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <form onSubmit={handleRunSandboxTest}>
                <label className="text-xs text-mute font-semibold uppercase block mb-8">
                  Sample Student Answer / Derivation Text:
                </label>
                <textarea
                  rows={6}
                  className="form-input text-mono text-sm mb-12"
                  style={{ width: '100%' }}
                  placeholder="Paste a sample student derivation here to test Gemini grading..."
                  value={sampleSolution}
                  onChange={(e) => setSampleSolution(e.target.value)}
                  disabled={testingSandbox}
                />
                <button type="submit" className="primary-btn" disabled={testingSandbox}>
                  {testingSandbox ? 'Grading Sample with Gemini AI...' : 'Run Live Rubric Test'}
                </button>
              </form>

              {sandboxResult && (
                <div className="mt-16 card p-16" style={{ borderLeft: '4px solid var(--amber, #f59e0b)' }}>
                  <div className="flex justify-between items-center mb-12">
                    <span className="font-bold text-sm">Sandbox Test Results:</span>
                    <span className="badge badge-sage">
                      RAS Score: {(sandboxResult.ras * 100).toFixed(0)}% ({sandboxResult.scored_marks} / {sandboxResult.total_marks} Marks)
                    </span>
                  </div>
                  <div className="flex flex-col gap-10">
                    {sandboxResult.steps?.map((step, idx) => (
                      <div key={idx} className="p-10 bg-slate border-rule rounded">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-xs">{step.rubric_unit?.label || step.label || `Unit #${idx + 1}`}</span>
                          {step.matched ? <span className="badge badge-sage">MATCHED</span> : <span className="badge badge-fault">MISSING</span>}
                        </div>
                        {step.student_text && <div className="text-xs text-mute italic mb-4">"{step.student_text}"</div>}
                        {step.feedback && <div className="text-xs text-fault">Feedback: {step.feedback}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PYQ Database Modal ────────────────────────────────────────────── */}
      {showPyqModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--slate-mid, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
            }}
          >
            <div className="card-header flex justify-between items-center">
              <div>
                <div className="card-title">📚 PYQ Database & Rubric Bank</div>
                <div className="text-xs text-mute mt-4">
                  Browse previous year question papers & official marking schemes to import as rubric units.
                </div>
              </div>
              <button
                className="secondary-btn text-sm"
                onClick={() => setShowPyqModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <div className="p-14 border-b border-rule flex gap-12">
              <input
                type="text"
                className="form-input text-sm"
                placeholder="Search PYQ by subject (e.g. Thermodynamics, Physics, Circuit)..."
                value={pyqSearch}
                onChange={(e) => {
                  setPyqSearch(e.target.value);
                  loadPyqs(e.target.value);
                }}
              />
            </div>

            <div className="card-body" style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
              {pyqLoading ? (
                <div className="text-mute text-center p-24">Loading PYQ records...</div>
              ) : pyqs.length === 0 ? (
                <div className="text-mute text-center p-24">No PYQs found matching '{pyqSearch}'</div>
              ) : (
                <div className="flex flex-col gap-16">
                  {pyqs.map((pyq) => {
                    let rubricList = [];
                    if (pyq.rubric_json) {
                      try {
                        rubricList = JSON.parse(pyq.rubric_json);
                      } catch (_) {}
                    }
                    return (
                      <div
                        key={pyq.id}
                        className="p-14 rounded-md border-rule bg-slate-soft flex flex-col gap-10"
                      >
                        <div className="flex justify-between items-center flex-wrap gap-8">
                          <div>
                            <span className="badge badge-amber mr-8">{pyq.subject}</span>
                            <span className="font-semibold text-sm">{pyq.exam_name} ({pyq.year})</span>
                          </div>
                          <div className="flex items-center gap-12">
                            <span className="text-mono text-xs text-mute font-semibold">Marks: {pyq.marks}</span>
                            <button
                              className="primary-btn text-xs"
                              disabled={importingPyqId === pyq.id}
                              onClick={() => handleImportPyq(pyq.id)}
                            >
                              {importingPyqId === pyq.id ? 'Importing...' : '⚡ Import as Rubric'}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-light font-mono bg-slate-dark p-10 rounded">
                          <strong>Question:</strong> {pyq.question_text}
                        </div>

                        {rubricList.length > 0 && (
                          <div className="text-xs flex flex-col gap-4">
                            <div className="text-mute font-semibold">Atomic Rubric Decomposition:</div>
                            <div className="flex flex-wrap gap-6">
                              {rubricList.map((r, i) => (
                                <span key={i} className="badge badge-sage text-xs">
                                  {r.type}: {r.label} ({r.weight}m)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
