import env from '../config/env';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function evaluateRetryAnswer({ studentAnswer, rubricHint, prompt, sampleAnswer }) {
  if (!env.geminiApiKey) {
    return simulatedEvaluation(studentAnswer, sampleAnswer);
  }

  const systemPrompt = `You are AnswerDoctor's Diagnosis Agent. Your only job is to evaluate a student's answer to a targeted step-level practice question.

Rubric unit being tested: "${rubricHint}"
Original practice question: "${prompt}"

Evaluate the student's answer strictly against the rubric unit. Return a JSON object with:
- "score": number between 0 and 1 (how well the answer addresses the rubric unit)
- "feedback": string (2-3 sentences: what was right, what was wrong or missing, what to do next)
- "matched": boolean (true if score >= ${env.rasThreshold})

Do not hallucinate. Only reference what the student actually wrote. Be specific about the rubric unit.`;

  const body = {
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [{ text: `Student answer: "${studentAnswer}"` }] },
    ],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
  };

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${env.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn('Gemini API error, falling back to simulation');
      return simulatedEvaluation(studentAnswer, sampleAnswer);
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(text);
  } catch {
    return simulatedEvaluation(studentAnswer, sampleAnswer);
  }
}

// Fallback when Gemini is unavailable
function simulatedEvaluation(studentAnswer, sampleAnswer) {
  const words = studentAnswer.toLowerCase().split(/\s+/);
  const keyTerms = ['state', 'table', 'u1', 'u2', 'delta', 'first law', 'reference', 'initial', 'final', 'substitute'];
  const matched = keyTerms.filter((t) => studentAnswer.toLowerCase().includes(t)).length;
  const score = Math.min(1, matched / 5);

  if (score >= 0.7) {
    return { score, matched: true, feedback: 'Your answer correctly identifies the key reasoning step. You established the state variables before applying the law, which is exactly what the rubric requires. Review significant figures in your final numeric expression.' };
  } else if (score >= 0.4) {
    return { score, matched: false, feedback: 'Your answer partially addresses the rubric unit. You mentioned relevant terms but did not explicitly anchor the state variables from the steam tables before applying the First Law. Revisit the reference-state step.' };
  } else {
    return { score, matched: false, feedback: 'Your answer does not yet address the core rubric unit. The key issue is that state properties (u₁, u₂) must be read from steam tables at the specified T and P before any application of Q - W = ΔU. Try again focusing on that step.' };
  }
}
