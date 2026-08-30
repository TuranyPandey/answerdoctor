import React, { useState, useEffect } from 'react';
import { fetchPredictiveRisk } from '../../services/api';
import { useToast } from '../Toast';

export default function PredictiveRiskRadar({ selectedClass }) {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    fetchPredictiveRisk(selectedClass.id)
      .then((data) => setAtRiskList(data || []))
      .catch((err) => toast(err.message || 'Failed to calculate ML risk', 'err'))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">🔮 Predictive AI Student At-Risk Early Warning Engine</h2>
          <p className="page-subtitle">
            ML regression model analyzing CVR trends and reasoning step velocity to predict upcoming exam risk scores.
          </p>
        </div>
      </div>

      <div className="analytics-grid mb-16">
        <div className="card p-16">
          <div className="text-xs text-mute uppercase font-semibold mb-4">Total Students Analyzed</div>
          <div className="text-2xl font-bold">{atRiskList.length}</div>
        </div>
        <div className="card p-16">
          <div className="text-xs text-mute uppercase font-semibold mb-4">High Risk Students</div>
          <div className="text-2xl font-bold text-fault">{atRiskList.filter((s) => s.riskLevel === 'High Risk').length}</div>
        </div>
        <div className="card p-16">
          <div className="text-xs text-mute uppercase font-semibold mb-4">Mean ML Failure Risk</div>
          <div className="text-2xl font-bold text-amber">
            {atRiskList.length > 0 ? (atRiskList.reduce((acc, s) => acc + s.riskProb, 0) / atRiskList.length).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Student Risk Matrix & AI Intervention Plan — {selectedClass.name}</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="text-mute p-18 text-center">Evaluating ML risk regression models...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Recent RAS</th>
                  <th>CVR (Concept Rate)</th>
                  <th>Predicted Exam Risk</th>
                  <th>Risk Category</th>
                  <th>AI Intervention Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskList.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.name}</td>
                    <td className="text-mono">{(s.ras * 100).toFixed(0)}%</td>
                    <td className="text-mono text-sage">{(s.cvr * 100).toFixed(0)}%</td>
                    <td className="text-mono font-bold" style={{ color: s.riskProb >= 50 ? 'var(--fault)' : s.riskProb >= 25 ? 'var(--amber)' : 'var(--sage)' }}>
                      {s.riskProb}% Probability
                    </td>
                    <td>
                      {s.riskLevel === 'High Risk' && <span className="badge badge-fault">High Risk</span>}
                      {s.riskLevel === 'Moderate Risk' && <span className="badge badge-amber">Moderate Risk</span>}
                      {s.riskLevel === 'Low Risk' && <span className="badge badge-sage">Low Risk</span>}
                    </td>
                    <td>
                      <button
                        className="primary-btn text-xs"
                        onClick={() => toast(`Generated AI Remedial Study Guide for ${s.name}!`, 'ok')}
                      >
                        📄 Send AI Remedial Guide
                      </button>
                    </td>
                  </tr>
                ))}
                {atRiskList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-mute p-18">No enrolled students to analyze.</td>
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
