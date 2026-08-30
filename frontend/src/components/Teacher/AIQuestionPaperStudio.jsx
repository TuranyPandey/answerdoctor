import React, { useState } from 'react';
import { generateQuestionPaper, createAssignment } from '../../services/api';
import { useToast } from '../Toast';

export default function AIQuestionPaperStudio({ selectedClass }) {
  const [subject, setSubject] = useState('Thermodynamics');
  const [topic, setTopic] = useState('First Law Energy Balance & Boundary Work');
  const [gradeLevel, setGradeLevel] = useState('Undergraduate University');
  const [difficulty, setDifficulty] = useState('Medium');
  const [marks, setMarks] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const toast = useToast();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic) {
      toast('Enter subject and topic', 'err');
      return;
    }

    setGenerating(true);
    setGeneratedPaper(null);
    try {
      const res = await generateQuestionPaper(`${subject} (${gradeLevel})`, topic, difficulty, marks);
      setGeneratedPaper(res);
      toast(`Successfully generated '${res.exam_name}' with Gemini AI!`, 'ok');
    } catch (err) {
      toast(err.message || 'Paper generation failed', 'err');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishAssignment = async () => {
    if (!selectedClass) {
      toast('Select a classroom first', 'err');
      return;
    }
    if (!generatedPaper) return;

    setPublishing(true);
    try {
      await createAssignment(
        selectedClass.id,
        generatedPaper.exam_name,
        generatedPaper.exam_name.slice(0, 15),
        generatedPaper.question_text,
        generatedPaper.marks
      );
      toast(`Published '${generatedPaper.exam_name}' as assignment to ${selectedClass.name}!`, 'ok');
    } catch (err) {
      toast(err.message || 'Failed to publish assignment', 'err');
    } finally {
      setPublishing(false);
    }
  };

  let rubricList = [];
  if (generatedPaper?.rubric_json) {
    try {
      rubricList = JSON.parse(generatedPaper.rubric_json);
    } catch (_) {}
  }

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">📄 AI Question Paper & Exam Studio</h2>
          <p className="page-subtitle">
            Author rigorous exam questions, step-by-step solutions, and atomic marking rubrics with Gemini ML.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-16" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Left Column: Generator Controls */}
        <div className="card p-16">
          <div className="card-title mb-16">Exam Authoring Parameters</div>
          <form onSubmit={handleGenerate} className="flex flex-col gap-12">
            <div>
              <label className="text-xs text-mute font-semibold uppercase block mb-4">Subject Name:</label>
              <input
                type="text"
                className="form-input text-sm"
                placeholder="e.g. Thermodynamics, Circuit Theory"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-mute font-semibold uppercase block mb-4">Topic / Target Concept:</label>
              <input
                type="text"
                className="form-input text-sm"
                placeholder="e.g. Entropy Generation in Rigid Vessel"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-mute font-semibold uppercase block mb-4">Target Grade / Academic Level:</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="form-input text-sm"
              >
                <option value="Elementary (K-5)">Elementary School (K-5)</option>
                <option value="Middle School (6-8)">Middle School (6-8)</option>
                <option value="High School AP/IB">High School (AP / IB / A-Levels)</option>
                <option value="Undergraduate University">Undergraduate University</option>
                <option value="Postgraduate Research">Postgraduate / Research</option>
              </select>
            </div>

            <div className="flex gap-8">
              <div style={{ flex: 1 }}>
                <label className="text-xs text-mute font-semibold uppercase block mb-4">Difficulty Level:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="Easy">Easy (Recall & Apply)</option>
                  <option value="Medium">Medium (Analyze)</option>
                  <option value="Hard">Hard (Evaluate & Derive)</option>
                </select>
              </div>
              <div style={{ width: '90px' }}>
                <label className="text-xs text-mute font-semibold uppercase block mb-4">Marks:</label>
                <input
                  type="number"
                  className="form-input text-sm text-mono"
                  value={marks}
                  onChange={(e) => setMarks(parseFloat(e.target.value) || 10)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-btn mt-8" disabled={generating}>
              {generating ? 'Authoring Paper with Gemini ML...' : '⚡ Generate Question Paper'}
            </button>
          </form>
        </div>

        {/* Right Column: Generated Paper & Rubric Studio */}
        <div>
          {generatedPaper ? (
            <div className="flex flex-col gap-16">
              <div className="card" style={{ borderLeft: '4px solid var(--amber, #f59e0b)' }}>
                <div className="card-header flex justify-between items-center">
                  <div>
                    <span className="badge badge-amber mb-4">{generatedPaper.subject}</span>
                    <h3 className="card-title text-base font-bold">{generatedPaper.exam_name}</h3>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-mono font-bold text-amber">{generatedPaper.marks} Marks</span>
                    {selectedClass && (
                      <button
                        className="primary-btn text-xs"
                        onClick={handlePublishAssignment}
                        disabled={publishing}
                      >
                        {publishing ? 'Publishing...' : `📋 Publish to ${selectedClass.name}`}
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-16">
                    <div className="text-xs text-mute font-semibold uppercase mb-6">Generated Question Statement:</div>
                    <div className="p-14 bg-slate border-rule rounded text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedPaper.question_text}
                    </div>
                  </div>

                  {generatedPaper.sample_solution && (
                    <div className="mb-16">
                      <div className="text-xs text-mute font-semibold uppercase mb-6">Worked Sample Solution Derivation:</div>
                      <div className="p-14 bg-slate-mid border-rule rounded text-xs text-mono" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {generatedPaper.sample_solution}
                      </div>
                    </div>
                  )}

                  {rubricList.length > 0 && (
                    <div>
                      <div className="text-xs text-mute font-semibold uppercase mb-8">Generated Atomic Rubric Units ({rubricList.length}):</div>
                      <div className="flex flex-col gap-8">
                        {rubricList.map((r, i) => (
                          <div key={i} className="p-10 bg-slate border-rule rounded flex justify-between items-center">
                            <div className="flex items-center gap-8">
                              <span className="step-type-tag">{r.type}</span>
                              <span className="text-xs font-semibold">{r.label}</span>
                            </div>
                            <span className="text-mono text-xs font-bold text-sage">{r.weight} Marks</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-24 text-center text-mute">
              Enter subject, topic, and difficulty parameters on the left to author a new Question Paper.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
