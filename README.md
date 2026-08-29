# AnswerDoctor

Reasoning-level diagnosis and batch grading for handwritten answer scripts, with cohort collusion detection built in.

## Track & Architecture
- **Track**: AI/ML & Open Innovation (DevJams 2026)
- **Domain**: LMS Infrastructure & Script Diagnostics
- **Core Engine**: Gemini 3.6 Flash Multimodal Pipeline, LangGraph agents, FastAPI
- **Key Metrics**: 
  - **RAS (Rubric-Alignment Score)**: Deterministic evaluation across decomposed atomic units.
  - **CMI (Cohort Malpractice Index)**: Pairwise cosine similarity and error pattern tracking ($CMI \ge 0.88$ flag).

## Monorepo Layout
- `/backend`: FastAPI microservice handling rubric decomposition, multimodal handwriting OCR, step alignment, and collusion analysis.
- `/frontend`: Next.js diagnostic dashboard with role-based views for teachers and students.

## Quickstart (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
