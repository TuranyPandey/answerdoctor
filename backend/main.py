from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, classrooms, assignments, submissions, malpractice, analytics, pyq, doubts
from services.seed_data import seed_thermodynamics_demo

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AnswerDoctor Enterprise Engine",
    description="Reasoning-level script diagnostics, automated rubric alignment, PYQ vault, and collusion detection (CMI)",
    version="2.0.0"
)

# Enable CORS for Next.js / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(classrooms.router)
app.include_router(assignments.router)
app.include_router(submissions.router)
app.include_router(malpractice.router)
app.include_router(analytics.router)
app.include_router(pyq.router)
app.include_router(doubts.router)

@app.on_event("startup")
def startup_db_seed():
    """Auto-seed demo data if empty on server start"""
    try:
        from database import SessionLocal
        from models import User
        db = SessionLocal()
        user_count = db.query(User).count()
        db.close()
        if user_count == 0:
            print("Database empty. Pre-seeding Thermodynamics CAT demo data...")
            seed_thermodynamics_demo()
    except Exception as e:
        print("Startup seed check:", e)

@app.get("/")
def root():
    return {
        "status": "active",
        "app": "AnswerDoctor Enterprise Engine",
        "version": "2.0.0",
        "demo_preloaded": True,
        "docs_url": "/docs"
    }

@app.post("/api/ocr/spike")
def ocr_spike_endpoint():
    """Window A: OCR Spike + LangGraph node calling Gemini/Groq"""
    from services.ocr_service import langgraph_gemini_ocr_node
    return langgraph_gemini_ocr_node()

@app.get("/api/evaluation/demo-single-pair")
def demo_single_qa_pair():
    """Window B: Rubric Decomposer + Semantic Alignment working on 1 real Q&A pair"""
    from services.rubric_decomposer import decompose_answer_key
    from services.semantic_aligner import compute_similarity, calculate_ras

    atomic_units = decompose_answer_key("Thermodynamics Q1 Answer Key")
    student_step_text = "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 reference state."
    expected_rubric_text = atomic_units[0]["expected_text"]

    similarity = compute_similarity(student_step_text, expected_rubric_text)
    
    return {
        "window": "B (Rubric Decomposer + Semantic Alignment on 1 real Q&A pair)",
        "rubric_unit": atomic_units[0],
        "student_step_text": student_step_text,
        "semantic_similarity": round(similarity, 4),
        "alignment_status": "MATCHED" if similarity >= 0.60 else "WEAK_REASONING_BREAK"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8008, reload=True)
