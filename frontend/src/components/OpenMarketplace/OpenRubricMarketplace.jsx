import React, { useState, useEffect } from 'react';
import { fetchMarketplaceRubrics, forkMarketplaceRubric, publishRubricToMarketplace } from '../../services/api';
import { useToast } from '../Toast';

export default function OpenRubricMarketplace({ selectedClass, user }) {
  const [rubrics, setRubrics] = useState([]);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubSubject, setPubSubject] = useState('Thermodynamics');
  const [pubDesc, setPubDesc] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [forkingId, setForkingId] = useState(null);

  const toast = useToast();

  const loadMarketplace = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceRubrics(subject);
      setRubrics(data || []);
    } catch (err) {
      toast(err.message || 'Failed to load live marketplace rubrics', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, [subject]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast('Select a classroom first to publish its rubric', 'err');
      return;
    }
    if (!pubTitle || !pubSubject) return;

    setPublishing(true);
    try {
      await publishRubricToMarketplace(selectedClass.id, pubTitle, pubSubject, pubDesc);
      toast(`Published '${pubTitle}' to OpenRubric Marketplace!`, 'ok');
      setPubTitle('');
      setPubDesc('');
      setShowPublishModal(false);
      await loadMarketplace();
    } catch (err) {
      toast(err.message || 'Publish failed', 'err');
    } finally {
      setPublishing(false);
    }
  };

  const handleFork = async (rubricId) => {
    if (!selectedClass) {
      toast('Select a classroom first to import this rubric', 'err');
      return;
    }
    setForkingId(rubricId);
    try {
      const res = await forkMarketplaceRubric(rubricId, selectedClass.id);
      toast(res.message || 'Forked rubric into your class!', 'ok');
      await loadMarketplace();
    } catch (err) {
      toast(err.message || 'Fork failed', 'err');
    } finally {
      setForkingId(null);
    }
  };

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">🌐 OpenRubric Public Marketplace</h2>
          <p className="page-subtitle">
            Open-source, decentralized grading rubrics & Q&A solution models contributed by educators worldwide.
          </p>
        </div>
        {user?.role === 'teacher' && selectedClass && (
          <button className="primary-btn text-xs" onClick={() => setShowPublishModal(true)}>
            + Publish {selectedClass.name} Rubric
          </button>
        )}
      </div>

      {showPublishModal && (
        <div className="card mb-16 p-18 border-amber">
          <div className="card-title mb-12">Publish Rubric to OpenRubric Global Marketplace</div>
          <form onSubmit={handlePublish} className="flex flex-col gap-12">
            <div className="flex gap-12 flex-wrap">
              <input
                type="text"
                className="form-input text-sm"
                style={{ flex: 1 }}
                placeholder="Rubric Title (e.g. Thermodynamics Isochoric Process Rubric)"
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                required
              />
              <select
                value={pubSubject}
                onChange={(e) => setPubSubject(e.target.value)}
                className="form-input text-sm"
                style={{ width: '180px' }}
              >
                <option value="Thermodynamics">Thermodynamics</option>
                <option value="Electromagnetics">Electromagnetics</option>
                <option value="Circuit Theory">Circuit Theory</option>
                <option value="Fluid Mechanics">Fluid Mechanics</option>
              </select>
            </div>
            <textarea
              className="form-input text-sm"
              rows={2}
              placeholder="Description of criteria, equations, and derivation steps..."
              value={pubDesc}
              onChange={(e) => setPubDesc(e.target.value)}
            />
            <div className="flex justify-end gap-8">
              <button type="button" className="secondary-btn text-xs" onClick={() => setShowPublishModal(false)}>Cancel</button>
              <button type="submit" className="primary-btn text-xs" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish to Global Marketplace'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subject Filter Bar */}
      <div className="card mb-16 p-12 flex justify-between items-center flex-wrap gap-12">
        <div className="flex items-center gap-8">
          <span className="text-xs text-mute font-semibold uppercase">Filter Subject:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input text-xs"
            style={{ width: '200px' }}
          >
            <option value="">All Open Subjects</option>
            <option value="Thermodynamics">Thermodynamics</option>
            <option value="Electromagnetics">Electromagnetics</option>
            <option value="Circuit Theory">Circuit Theory</option>
            <option value="Fluid Mechanics">Fluid Mechanics</option>
          </select>
        </div>
        <div className="text-xs text-mute font-mono">
          Open Innovation Protocol | Verified MIT / Stanford / IIT Rubrics
        </div>
      </div>

      {/* Marketplace Rubric Cards Grid */}
      <div className="grid grid-cols-2 gap-16" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {rubrics.map((r) => {
          let units = [];
          try {
            units = JSON.parse(r.rubric_json);
          } catch (_) {}

          return (
            <div key={r.id} className="card p-16 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--amber, #f59e0b)' }}>
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="badge badge-amber">{r.subject}</span>
                  <span className="text-xs font-mono text-sage">★ {r.rating} ({r.downloads} Forks)</span>
                </div>
                <h3 className="card-title text-base font-bold mb-4">{r.title}</h3>
                <div className="text-xs text-mute mb-12">
                  Contributed by <strong>{r.author_name}</strong> ({r.institution || 'Academic Institution'})
                </div>
                <p className="text-xs text-light mb-12" style={{ lineHeight: 1.5 }}>
                  {r.description || 'Verified atomic rubric decomposition for engineering evaluation.'}
                </p>

                {/* Rubric Step Preview */}
                <div className="flex flex-col gap-6 mb-16">
                  {units.slice(0, 4).map((u, i) => (
                    <div key={i} className="p-8 bg-slate rounded text-xs flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <span className="step-type-tag" style={{ fontSize: '9px' }}>{u.type}</span>
                        <span className="truncate" style={{ maxWidth: '200px' }}>{u.label}</span>
                      </div>
                      <span className="text-mono font-semibold">{u.weight} Marks</span>
                    </div>
                  ))}
                  {units.length > 4 && (
                    <div className="text-xs text-mute text-center">+ {units.length - 4} more rubric steps</div>
                  )}
                </div>
              </div>

              {user?.role === 'teacher' && selectedClass && (
                <button
                  className="primary-btn text-xs full-width flex items-center justify-center gap-6"
                  onClick={() => handleFork(r.id)}
                  disabled={forkingId === r.id}
                >
                  {forkingId === r.id ? 'Forking Rubric...' : `🍴 Fork Rubric into ${selectedClass.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
