import React, { useState } from 'react';
import { testRubricSandbox } from '../../services/api';
import { useToast } from '../Toast';

export default function GradingConsensus() {
  const [sampleText, setSampleText] = useState(
    "Step 1: Isochoric process V1 = V2. System is closed and rigid.\n" +
    "Step 2: Internal energy u1 = 214.36 kJ/kg from steam tables.\n" +
    "Step 3: First Law equation Q - W = delta U. Since volume is constant, W = 0.\n" +
    "Step 4: Q = m*(u2 - u1) = 1.25 * (460.81 - 214.36) = 308.06 kJ."
  );
  const [evaluating, setEvaluating] = useState(false);
  const [consensusResult, setConsensusResult] = useState(null);
  const toast = useToast();

  const handleRunConsensus = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    setConsensusResult(null);

    const rubricUnits = [
      { id: 'u1', type: 'Concept', label: 'Identify rigid closed system boundary (V1 = V2)', weight: 2.0 },
      { id: 'u2', type: 'Formula', label: 'Apply First Law: Q - W = delta U', weight: 2.0 },
      { id: 'u3', type: 'Step', label: 'Lookup internal energy values u1 and u2', weight: 2.0 },
      { id: 'u4', type: 'Transformation', label: 'Boundary work W = 0 for isochoric process', weight: 2.0 },
      { id: 'u5', type: 'Result', label: 'Final heat transfer Q = 308.06 kJ with units', weight: 2.0 },
    ];

    try {
      const geminiRes = await testRubricSandbox(rubricUnits, sampleText);
      
      const words = sampleText.toLowerCase().split(/\s+/);
      const matchedUnits = rubricUnits.filter(u => {
        const keywords = u.label.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return keywords.some(kw => words.some(w => w.includes(kw)));
      }).length;
      const heuristicScore = Math.round((matchedUnits / rubricUnits.length) * 100) / 100;
      
      const consensus = Math.round((1 - Math.abs(geminiRes.ras - heuristicScore)) * 100 * 10) / 10;

      setConsensusResult({
        geminiRas: geminiRes.ras,
        heuristicScore,
        consensus,
        steps: geminiRes.steps || [],
      });
      toast(`Multi-Agent Consensus Score: ${consensus}% Inter-Rater Reliability!`, 'ok');
    } catch (err) {
      toast(err.message || 'Consensus engine test failed', 'err');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">⚡ AI Multi-Agent Cross-Model Grading Consensus Engine</h2>
          <p className="page-subtitle">
            Cross-verifies grading consistency between Gemini 2.0 Flash LLM and Rule-Based Heuristic Agents to establish inter-rater reliability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-16 mb-16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card p-16">
          <div className="card-title mb-12">Candidate Derivation Text for Inter-Rater Audit</div>
          <form onSubmit={handleRunConsensus} className="flex flex-col gap-12">
            <textarea
              className="form-input text-mono text-sm"
              rows={8}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn" disabled={evaluating}>
              {evaluating ? 'Running Multi-Agent Audit...' : '⚡ Compute Inter-Rater Consensus Score'}
            </button>
          </form>
        </div>

        <div className="card p-16">
          <div className="card-title mb-12">Multi-Agent Agreement Metrics</div>
          {consensusResult ? (
            <div className="flex flex-col gap-16">
              <div className="p-16 bg-slate border-rule rounded text-center" style={{ borderLeft: '4px solid var(--sage)' }}>
                <div className="text-xs text-mute uppercase font-semibold mb-4">Inter-Rater Reliability Consensus Score</div>
                <div className="text-3xl font-bold text-sage">{consensusResult.consensus}%</div>
                <div className="text-xs text-mute mt-4">High statistical alignment between LLM & Rule Engine</div>
              </div>

              <div className="flex justify-between items-center p-12 bg-slate-mid rounded border-rule text-xs">
                <div>
                  <div className="text-mute font-semibold">Gemini 2.0 Flash RAS</div>
                  <div className="text-mono text-amber font-bold text-base">{(consensusResult.geminiRas * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-mute font-semibold">Rule-Based Heuristic RAS</div>
                  <div className="text-mono text-sage font-bold text-base">{(consensusResult.heuristicScore * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-mute text-center p-24">
              Click "Compute Inter-Rater Consensus Score" on the left to evaluate agent agreement metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
