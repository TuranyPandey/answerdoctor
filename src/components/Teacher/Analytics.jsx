import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../../services/api';
import { useToast } from '../Toast';

export default function Analytics({ selectedClass }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadAnalytics = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const res = await fetchAnalytics(selectedClass.id);
      setData(res);
    } catch (err) {
      toast(err.message || 'Failed to load analytics', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedClass]);

  if (!selectedClass) {
    return (
      <div className="page-body">
        <div className="text-mute text-center p-24">Please select a class from Classrooms to view analytics.</div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="page-body">
        <div className="text-mute text-center p-24">Loading class-wide reasoning analytics...</div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">Class-Wide Reasoning Analytics — {selectedClass.name}</h2>
          <p className="page-subtitle">
            Cohort-level diagnostic trends, question-by-question RAS breakdown, and machine-clustered misconceptions.
          </p>
        </div>
        <button className="secondary-btn text-xs flex items-center gap-6" onClick={() => window.print()}>
          🖨️ Print Class Diagnostic Report
        </button>
      </div>

      <div className="stat-grid mb-16">
        <div className="stat-tile">
          <div className="stat-value">{data.total_scripts}</div>
          <div className="stat-label">Graded Scripts</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value text-amber">{(data.avg_ras * 100).toFixed(1)}%</div>
          <div className="stat-label">Mean Cohort RAS</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value text-fault">{data.flagged_count}</div>
          <div className="stat-label">Collusion Flags</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value text-sage">{data.error_clusters?.length || 0}</div>
          <div className="stat-label">Misconception Clusters</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Rubric Unit Alignment (Per-Question RAS Heatmap)</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rubric Unit / Step Requirement</th>
                  <th>Cohort Avg RAS</th>
                  <th>Weak Count</th>
                </tr>
              </thead>
              <tbody>
                {data.per_exam.map((q, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{q.question}</td>
                    <td>
                      <div className="ras-bar-wrap">
                        <div className="ras-bar-track">
                          <div
                            className="ras-bar-fill"
                            style={{
                              width: `${q.avg_ras * 100}%`,
                              background: q.avg_ras >= 0.75 ? 'var(--sage)' : q.avg_ras >= 0.60 ? 'var(--amber)' : 'var(--fault)',
                            }}
                          />
                        </div>
                        <span className="ras-label">{(q.avg_ras * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      {q.weak_count > 0 ? (
                        <span className="badge badge-fault">{q.weak_count} students missed</span>
                      ) : (
                        <span className="badge badge-sage">0 missed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.per_exam.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-mute text-center p-18">No graded scripts available for heatmap.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recurring Misconception Clusters (scikit-learn / Gemini)</div>
          </div>
          <div className="card-body">
            {data.error_clusters && data.error_clusters.length > 0 ? (
              <div className="bar-chart">
                {data.error_clusters.map((c, i) => (
                  <div key={i} className="chart-bar-row">
                    <div className="chart-bar-label" title={c.label}>{c.label}</div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${c.percentage}%`,
                          background: i % 2 === 0 ? 'var(--fault)' : 'var(--amber)',
                        }}
                      />
                    </div>
                    <div className="chart-bar-count">{c.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-mute text-center p-18">
                No error clusters detected yet. Upload graded scripts to analyze class-wide misconception patterns.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
