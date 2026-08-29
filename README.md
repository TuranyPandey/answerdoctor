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
