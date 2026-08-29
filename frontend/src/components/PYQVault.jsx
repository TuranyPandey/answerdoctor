import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, ChevronDown, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function PYQVault({ apiBase }) {
  const [pyqs, setPyqs] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPYQs();
  }, [selectedSubject, selectedYear, selectedExam]);

  const fetchPYQs = async () => {
    setLoading(true);
    try {
      let url = `${apiBase}/pyq?`;
      if (selectedSubject !== 'ALL') url += `subject=${selectedSubject}&`;
      if (selectedYear) url += `year=${selectedYear}&`;
      if (selectedExam !== 'ALL') url += `exam_type=${selectedExam}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        setPyqs(await res.json());
      }
    } catch (err) {
      console.warn("PYQ API offline; using fallback vault entries.", err);
      setPyqs([
        {
          id: 1, subject: "Applied Thermodynamics", year: 2025, exam_type: "FAT", difficulty: "Hard",
          title: "Second Law Analysis & Entropy Generation in Polytropic Expansion",
          question_text: "A closed system undergoes a polytropic expansion from 5 bar, 500 K to 1 bar. Calculate the net entropy generation S_gen and exergy loss assuming T_0 = 298 K.",
          answer_key_summary: "1. State polytropic relation P1*V1^n = P2*V2^n\n2. S_2 - S_1 = c_p*ln(T2/T1) - R*ln(P2/P1)\n3. Calculate exergy destruction X_destroyed = T_0 * S_gen = 42.8 kJ",
          topics: ["Second Law", "Entropy Generation", "Exergy Analysis"]
        },
        {
          id: 2, subject: "Applied Thermodynamics", year: 2024, exam_type: "CAT-2", difficulty: "Hard",
          title: "Rankine Cycle with Reheat & Regeneration",
          question_text: "For a steam power plant operating on ideal reheat Rankine cycle between 15 MPa and 10 kPa with reheat at 3 MPa to 500°C, evaluate thermal efficiency.",
          answer_key_summary: "1. Pump work W_p = v1*(P2 - P1)\n2. High pressure turbine work W_t1 = h1 - h2\n3. Thermal efficiency eta_th = W_net / Q_in = 43.5%",
          topics: ["Vapor Power Cycles", "Rankine Cycle", "Thermal Efficiency"]
        },
        {
          id: 3, subject: "Multivariable Calculus", year: 2025, exam_type: "CAT-1", difficulty: "Medium",
          title: "Green's Theorem & Line Integrals over Closed Vector Fields",
          question_text: "Evaluate the line integral integral_C (y^2 dx + 3xy dy) where C is the boundary of the region enclosed by y = x^2 and y = x.",
          answer_key_summary: "1. Apply Green's Theorem: double_integral (dQ/dx - dP/dy) dA\n2. dQ/dx = 3y, dP/dy = 2y -> integrand is y\n3. Evaluate double integral over region 0 <= x <= 1, x^2 <= y <= x -> Result = 1/12",
          topics: ["Vector Calculus", "Green Theorem", "Line Integrals"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Institutional Archive
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">PYQ Holder & Repository Vault</h2>
          <p className="text-xs text-slate-400">
            Categorized Previous Year Questions (CAT-1, CAT-2, FAT) with atomic marking schemes and benchmark solutions.
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          
          {/* Subject Filter */}
          <div className="text-xs">
            <label className="block text-slate-400 font-semibold mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              <option value="Applied Thermodynamics">Applied Thermodynamics</option>
              <option value="Multivariable Calculus">Multivariable Calculus</option>
              <option value="Data Structures">Data Structures & Algorithms</option>
            </select>
          </div>

          {/* Exam Type Filter */}
          <div className="text-xs">
            <label className="block text-slate-400 font-semibold mb-1">Exam Type</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="ALL">All Exams</option>
              <option value="CAT-1">CAT-1</option>
              <option value="CAT-2">CAT-2</option>
              <option value="FAT">FAT (Final Assessment)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="text-xs">
            <label className="block text-slate-400 font-semibold mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 text-white px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Showing {pyqs.length} Vault Questions
        </div>
      </div>

      {/* PYQ Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading PYQ Repository...</div>
        ) : pyqs.map(q => {
          const isExpanded = expandedId === q.id;
          return (
            <div key={q.id} className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {q.exam_type} ({q.year})
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {q.subject}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      q.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{q.title}</h3>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-all"
                >
                  {isExpanded ? 'Hide Solution Scheme' : 'View Solution Scheme'}
                </button>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono leading-relaxed">
                {q.question_text}
              </p>

              {/* Topic Tags */}
              <div className="flex items-center gap-2 pt-1">
                {q.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Expandable Solution & Marking Scheme */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Atomic Marking Scheme Breakdown
                  </h4>
                  <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {q.answer_key_summary}
                  </pre>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
