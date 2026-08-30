import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, Sparkles, User, Bot, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AIDoubtCenter({ apiBase, user, submission }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your AnswerDoctor AI Reasoning Assistant. Select a rejected step or type your concept doubt below to understand why your derivation step was marked weak and how to fix it."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedStepId, setSelectedStepId] = useState(submission?.steps?.[0]?.id || null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputQuery };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/doubts/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id || 1,
          step_id: selectedStepId,
          question_text: currentQuery
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.ai_response }]);
      } else {
        throw new Error("Doubt API offline");
      }
    } catch (err) {
      console.warn("Doubt API offline; generating local assistant response.", err);
      // Fallback local assistant response
      let localResp = "";
      const qLower = currentQuery.toLowerCase();
      if ("reference state" in qLower || "step 1" in qLower || "first law" in qLower) {
        localResp = "Your Step 1 failed because in thermodynamics evaluations, enthalpy (h) and internal energy (u) are state functions calculated relative to a reference state (T_0 = 298.15 K, P_0 = 1 atm). Omitting T_0 leaves the energy balance floating without zero-point baseline initialization.";
      } else if ("bar" in qLower || "unit" in qLower || "kpa" in qLower) {
        localResp = "Pressure values given in bar must be converted to kPa (1 bar = 100 kPa) before numerical evaluation in SI equations. Always multiply bar values by 100.";
      } else {
        localResp = `Regarding your query "${currentQuery}": Break the derivation into 5 atomic units: 1) State reference conditions, 2) Write conservation equation, 3) Perform integration/transformation, 4) Apply SI unit conversions, and 5) Evaluate net final result.`;
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: localResp }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Interactive Reasoning Assistant
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">AI Doubt Center & Conceptual Verifier</h2>
          <p className="text-xs text-slate-400">
            Ask targeted questions about rejected steps, missing assumptions, or formula derivations grounded strictly in your rubric.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Step Selection Drawer */}
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Submission Step</h3>
          
          <div className="space-y-2">
            {submission?.steps?.map(step => (
              <button
                key={step.id}
                onClick={() => {
                  setSelectedStepId(step.id);
                  setInputQuery(`Why did Step ${step.step_number} (${step.rubric_unit?.label}) get marked ${step.status}?`);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedStepId === step.id
                    ? 'bg-violet-600/20 border-violet-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400">Step {step.step_number}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    step.status === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="line-clamp-1 text-[11px]">{step.rubric_unit?.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[520px]">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`p-4 rounded-2xl max-w-xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-violet-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none font-mono'
                }`}>
                  {m.text}
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono">
                  Analyzing rubric alignment & reasoning break...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-3">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a doubt (e.g. Why was baseline reference state required in Step 1?)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all flex items-center gap-2"
            >
              <span>Ask AI Assistant</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
