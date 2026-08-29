# AnswerDoctor

Reasoning-level diagnosis and batch grading for handwritten answer scripts, with cohort collusion detection built in.

## Track & Architecture
- **Track**: AI/ML & Open Innovation (DevJams 2026)
- **Domain**: LMS Infrastructure & Script Diagnostics
- **Core Engine**: Gemini 3.6 Flash Multimodal Pipeline, FastAPI, and a Next.js monitoring dashboard
- **Key Metrics**:
  - **RAS (Rubric-Alignment Score)**: score derived from matched rubric units across the reasoning map
  - **CMI (Cohort Malpractice Index)**: pairwise similarity and error-pattern comparison used to flag collusion

## Monorepo Layout
- `/backend`: FastAPI service for rubric decomposition, script grading, and reasoning diagnostics
- `/frontend`: Next.js diagnostic dashboard for teacher and student workflows
- `/demo_assets`: demo inputs for benchmark and collusion runs
- `/docs`: supporting project documentation

## Local Setup

### Backend
```powershell
cd "C:\Users\manga\hackathons\answerdoctor\backend"
& "C:\Users\manga\hackathons\answerdoctor\.venv\Scripts\python.exe" -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify the app is live at:
- http://127.0.0.1:8000/health

### Frontend
```powershell
cd "C:\Users\manga\hackathons\answerdoctor\frontend"
# Create or update .env.local if needed
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npx next dev --hostname 127.0.0.1 --port 3000
```

Open the app at:
- http://127.0.0.1:3000

### Environment Variables
Create a local environment file in the frontend directory for local API wiring:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

This keeps the Next.js app pointing at the running local FastAPI backend during development.

## Demo Dry-Run Workflow

1. **Rubric decomposition**
   - Paste a prompt or upload a rubric answer key
   - Confirm the generated rubric units sum to 1.0

2. **Single script benchmark**
   - Upload `script_A_clean.png`
   - Validate that the Rubric-Alignment Score is 1.0 and all tags are marked as matched

3. **Single script diagnosis**
   - Upload `script_B_broken.png`
   - Validate that broken intermediate steps are red-flagged with a concise root-cause diagnosis

4. **Cohort collusion radar**
   - Upload multiple scripts together, including the broken and collusion pair
   - Confirm the pairwise matrix and CMI threshold trigger the collusion alert when the score is at or above 0.88

## Submission Checklist
- Ensure no active API keys or local env files are pushed to the repo
- Keep the backend running for local demos
- Record a 2–3 minute walkthrough covering the rubric, clean script, broken script, and collusion matrix flow
- Verify the final frontend build passes before deployment

## Notes
- The local backend is implemented in the FastAPI app at `/backend/main.py`
- The frontend app uses a Next.js dashboard layout and Tailwind styling for the auth and rubric experience
- The repo is expected to stay free of tracked secrets, local `.env` files, and generated build artifacts
