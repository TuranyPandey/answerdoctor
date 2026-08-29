# AnswerDoctor

AnswerDoctor is a hackathon prototype for reasoning-level diagnosis of written exam answers. It matches answer steps against a teacher-defined rubric, identifies the first weak reasoning step, and gives the student a targeted retry.

## Review 2 demo scope

The working path is intentionally narrow:

1. Enter the clearly labelled faculty or student demo.
2. Use the seeded Applied Thermodynamics assessment.
3. Create a rubric or evaluate transcribed answer steps from the faculty view.
4. Inspect the saved Rubric-Alignment Score (RAS) and step diagnostics.
5. Retry a weak step from the student view and persist the updated score.
6. Inspect a seeded cohort misconception view and a teacher-review CMI flag.

The 240-script cohort is a **simulated seeded scenario** used to demonstrate the analytics UI. The repository does not currently process 240 uploaded handwritten scripts.

## What is implemented

- React 19 and Vite frontend
- FastAPI and SQLAlchemy backend
- SQLite demo database seeded on first startup
- Deterministic rubric decomposition and pure-Python TF-IDF step similarity matching
- Persisted submissions, Reasoning Maps, targeted retry state and RAS updates
- Seeded teacher analytics, PYQ entries, doubt-guide responses and CMI review examples

## What is roadmap

- Production authentication and Google OAuth
- Handwriting OCR and batch ZIP/PDF ingestion
- PostgreSQL/Supabase deployment
- LangGraph orchestration and external LLM diagnosis
- Institution/LMS integration

The UI uses **Demo access** and does not collect or validate passwords. OCR and production authentication must not be presented as completed features.

## Run locally

Prerequisites: Python 3.10+ and Node.js 18+.

Backend, from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
Set-Location backend
python -m uvicorn main:app --host 127.0.0.1 --port 8008
```

Frontend, in a second terminal from the repository root:

```powershell
npm install --prefix frontend
npm run dev --prefix frontend
```

Open `http://localhost:3000`. API documentation is available at `http://127.0.0.1:8008/docs`.

For a hosted frontend, set `VITE_API_URL` to the public backend URL ending in `/api`.

## Verification

With the backend running:

```powershell
python scratch\test_pipeline.py
npm run build
```

The pipeline test resets the local demo database before checking assignment details, analytics, the CMI review list, the Reasoning Map and a persisted retry.

## Team workflow before Review 2

- Stabilization branch: `codex/review2-stabilize`
- Do not rewrite or delete old branches before judging.
- Keep commits small and descriptive.
- Merge to `main` only after the local pipeline, production frontend build and hosted preview all pass.

## Judge-safe one-line pitch

AnswerDoctor shows where a student's reasoning diverged from the rubric, gives them a focused retry, and helps the teacher see repeated misconceptions across a cohort.
