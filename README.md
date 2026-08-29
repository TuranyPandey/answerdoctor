<<<<<<< HEAD
# AnswerDoctor 🩺

> **Reasoning-level diagnosis and batch grading for handwritten answer scripts, with collusion detection built in.**

---

## 📌 Executive Summary

When students get exam scripts back, they usually see a numeric mark and a line struck through in red pen — almost never the **reason** why their reasoning broke. 
**AnswerDoctor** is a role-based LMS infrastructure platform sitting on top of a multi-agent AI pipeline. It replaces blind markdowns with step-by-step **Reasoning Maps**, class-wide misconception heatmaps, step-level retry practice drills, student self-evaluators for homework, and built-in malpractice collusion detection.

- **One-Line Pitch:** *AnswerDoctor doesn't just mark whether an answer is right — it shows a student where their reasoning broke, gives them a way to fix it, and shows the teacher where the whole class is making the same mistake.*

---

## 👥 Team & Submission Info

- **Team Name:** `trpSurgewave`
- **Track / Domain:** AI/ML & Open Innovation — LMS infrastructure & script diagnostics
- **Team Members:**
  - **Mangalapalli Sohum Seshu Krish** (`26BCE0616`, Team Lead)
  - **Turany Pandey** (`26BCE0646`)
- **GitHub Repository:** [https://github.com/sohum123451/answerdoctor](https://github.com/sohum123451/answerdoctor)
- **Figma UI Design System:** [https://www.figma.com/design/VqJLOgjVz4WRdnOEdMEhmr/Untitled?t=mCcqh2FUMmMXaeum-1](https://www.figma.com/design/VqJLOgjVz4WRdnOEdMEhmr/Untitled?t=mCcqh2FUMmMXaeum-1)
- **Live Vercel Application:** [https://answerdoctor.vercel.app](https://answerdoctor.vercel.app)

---

## 🚀 Key Features

### 1. The Reasoning Map
Every answer is represented as a structured map:
$$\text{Concept} \longrightarrow \text{Approach} \longrightarrow \text{Steps} \longrightarrow \text{Transformation} \longrightarrow \text{Result}$$
- **For Students:** Pinpoints the exact line where reasoning broke (e.g. *"Reasoning break at Step 1: You applied the first law formula before establishing the required reference state (T_0, P_0)"*).
- **For Teachers:** Cohort-wide view of how the class approached each question and which misconceptions recur.

### 2. Rubric Decomposer Agent (LangGraph)
Deconstructs marking schemes into atomic gradeable units:
- Categories: `Concept`, `Formula`, `Intermediate Step`, `Units`, `Final Answer`
- Weights sum strictly to `1.0` (100%).
- Individual similarity thresholds ($\gamma \ge 0.60$).

### 3. Scoring Engine: RAS & CMI

#### Rubric-Alignment Score (RAS)
$$\text{RAS} = \frac{\sum (\text{Matched\_Units} \times \text{Unit\_Weight})}{\sum (\text{Total\_Units} \times \text{Unit\_Weight})} \times 100$$
Any unit scoring below $\gamma = 0.60$ is flagged as *"Missing / Weak"* rather than silently penalized.

#### Cohort Malpractice Index (CMI)
$$\text{CMI}_{ij} = \text{CosSim}(\text{Emb}_i, \text{Emb}_j) \times \text{ErrorPatternMatch}(S_i, S_j)$$
A pairwise CMI score $\ge 0.88$ flags suspicious collusion pairs (e.g. Sohum `26BCE0616` with $\text{CMI} = 0.92$ on shared reference state omission).

### 4. Student Self-Evaluator Studio (Homework & Self-Practice)
Allows students to input homework derivation steps, calculate dynamic semantic vector similarity, and receive instant RAS feedback before submitting to faculty.

### 5. Interactive Step-Level Retry Drill
When a student identifies a reasoning break, they can launch an interactive follow-up practice drill targeting the exact failed concept. Correctly answering the drill awards credit directly back to their RAS score!

### 6. AI Doubt Assistant & PYQ Vault
Interactive AI tutor answering step derivation doubts and searchable repository vault of past examination papers.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Agent Swarm** | LangGraph, Sentence-Transformers, Scikit-learn | Rubric decomposition, deterministic semantic alignment ($\gamma \ge 0.60$), CMI malpractice auditing |
| **Backend API** | FastAPI, SQLite (SQLAlchemy), Pydantic | Role-based REST endpoints, batch script processing, SQLite foreign key pragmas |
| **Frontend Web App** | React 19, Vite, Tailwind CSS, Lucide Icons | Clean White Enterprise UI, interactive Reasoning Map canvas, CMI matrix visualizer |
| **Vision & OCR** | OpenCV, Spatial Bounding Box Alignment | Digitizes handwritten scripts, preserves diagram image crops |

---

## 💻 Quick Start & Running Locally

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt

# Run FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8008
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Launch Vite dev server
npx vite --port 3000
```

### 4. Open Application
Navigate to `http://localhost:3000/` in your browser.

---

## 🌐 Production & Vercel Deployment

The frontend includes production Vercel configurations ([`vercel.json`](file:///c:/Users/manga/hackathons/practise/answerdoctor/vercel.json) & [`frontend/vercel.json`](file:///c:/Users/manga/hackathons/practise/answerdoctor/frontend/vercel.json)) supporting Vite monorepo builds (`npm run --prefix frontend build`).

---

## 📄 License
MIT License. Built for Team `trpSurgewave`.
=======
# AnswerDoctor

**AnswerDoctor finds where a student’s reasoning broke—not only whether the final answer was wrong.**

Teachers usually return a mark. Students still have to guess which assumption, formula, transformation, or unit caused them to lose it. AnswerDoctor turns a worked STEM answer into a sequence of assessable reasoning steps, compares those steps with the teacher’s marking guide, and converts the result into feedback that both sides can act on.

[Live prototype](https://answerdoctor.vercel.app) · [Figma UX prototype](https://www.figma.com/make/19wspIBkxbxynYj3YoGwBA/Untitled) · [Repository](https://github.com/sohum123451/answerdoctor)

## The problem

Subjective engineering answers are difficult to evaluate at scale. A correct final value can hide weak reasoning, while one early mistake can make every later line appear wrong. Conventional plagiarism tools also struggle with mathematical work: equations naturally look alike, but an unusual shared mistake can be more revealing than matching words.

AnswerDoctor is built around two questions:

1. Where did this student’s reasoning first diverge from the marking guide?
2. Is the same misunderstanding appearing across the class—or unusually across a pair of answers?

## The experience

### For teachers

The teacher workspace summarizes where a class is losing marks, shows performance against each marking-guide step, and surfaces unusually similar answers for human review. A teacher can also create a marking guide and evaluate a worked answer step by step.

The similarity view is deliberately a review aid. AnswerDoctor does not automatically declare misconduct; it presents the shared wording and error pattern so the teacher can make that decision.

### For students

The student workspace replaces a single unexplained score with a Reasoning Map. Each step is labelled as meeting the guide, needing work, or missing. The student can inspect the first reasoning break, answer a focused retry question, and see recovery credit reflected in the score.

The intended loop is simple:

**See the break → understand why it matters → retry that concept → verify recovery.**

## How AnswerDoctor evaluates an answer

### 1. Decompose the marking guide

The marking guide is separated into weighted units such as the governing concept, formula, intermediate transformation, unit handling, and final result. The included thermodynamics scenario uses five units whose weights total 100%.

### 2. Align answer steps

Each student step is compared with its expected rubric unit. The backend supports SentenceTransformer embeddings when available and falls back to deterministic TF–IDF similarity. A configurable similarity threshold decides whether a unit is matched, weak, or missing.

### 3. Calculate the Rubric-Alignment Score

The **Rubric-Alignment Score (RAS)** is the weighted share of the marking guide satisfied by the answer:

`RAS = weighted matched rubric units / total rubric weight × 100`

This makes the score traceable: every awarded or lost portion maps back to a specific expectation in the marking guide.

### 4. Build a Reasoning Map

The evaluation is presented as a sequence rather than a verdict. In the demo, the important break occurs when the student applies the First Law before defining the required reference state. Later steps can still be recognized instead of being discarded because of that earlier omission.

### 5. Compare cohort error patterns

The **Cohort Malpractice Index (CMI)** combines semantic similarity with shared error-pattern similarity:

`CMI(A, B) = semantic similarity × shared error-pattern match`

A high score creates a teacher-review flag. It is contextual evidence, not an automatic accusation.

## Optional demonstration scenario

An Applied Thermodynamics CAT-1 sample remains available when the backend is explicitly started with demo seeding enabled.

- The database seed contains one teacher, four students, one classroom, one assignment, five rubric units, and four example submissions.
- Demo records stay labelled as synthetic and are never expanded into a fictional cohort.
- In normal operation, class size, average score, weak-step clusters, and similarity pairs are calculated from saved submissions.
- The targeted retry demonstrates a student improving from **60% to 70% RAS** after recovering the missing reference-state concept.

All names, answers, scores, and integrity signals in this scenario are synthetic demonstration data. No VIT student dataset or external answer-script dataset was used.

## What is working today

- Persistent teacher and student account profiles
- Teacher-owned classrooms with reusable join codes
- Weighted rubric decomposition from custom marking-guide steps
- Step-level semantic alignment with deterministic fallback
- RAS calculation and diagnostic feedback
- Database-derived classroom analytics and recurring-error clusters
- CMI pair comparison and teacher review interface
- Student Reasoning Map and targeted retry interaction
- SQLite-backed API models for users, classrooms, assignments, submissions, rubric units, retries, PYQs, and doubts
- Responsive React interface with FastAPI endpoints

## Prototype boundaries

AnswerDoctor is a hackathon prototype, not a production assessment system.

- Account identity is persistent, but password authentication and institutional SSO are not implemented yet.
- The visible OCR spike currently returns simulated structured extraction; it has not been validated on a real uploaded handwriting dataset.
- Semantic scoring and doubt responses currently use deterministic local logic rather than a validated production ML service.
- CMI requires faculty interpretation and must not be treated as proof of misconduct.
- Accuracy, fairness, accessibility, privacy, and institutional workflow validation remain future work.

These constraints are intentional: the prototype demonstrates the reasoning-feedback loop without presenting untested capabilities as complete.

## Technology

AnswerDoctor uses React, Vite and Tailwind CSS for the interface; FastAPI, SQLAlchemy and SQLite for the API and persistence layer; and SentenceTransformers or TF–IDF for semantic alignment. The repository also contains the rubric decomposition, diagnosis, retry, cohort-analysis, PYQ, and doubt-service modules used by the demonstration.

## Team

Built by **Team trpSurgewave** for VIT GDG DevJams 2026:

- Mangalapalli Sohum Seshu Krish (`26BCE0616`)
- Turany Pandey (`26BCE0646`)

## Vision

AnswerDoctor’s long-term goal is not faster automated marking for its own sake. It is a feedback system in which every score can be explained, every misconception can become a targeted learning activity, and every class-level pattern can help a teacher decide what to teach next.

MIT License.
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
