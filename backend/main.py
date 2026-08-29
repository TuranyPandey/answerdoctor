from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, classrooms, assignments, submissions, malpractice, analytics, pyq, doubts
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AnswerDoctor Enterprise Engine",
    description="Reasoning-level script diagnostics, automated rubric alignment, PYQ vault, and collusion detection (CMI)",
    version="2.0.0"
)

# Enable CORS for Next.js / Vite frontend
cors_origins = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000"
).split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
    """Seed sample data only when explicitly requested for a demo deployment."""
    if os.getenv("ANSWERDOCTOR_SEED_DEMO", "false").lower() == "true":
        from services.seed_data import seed_thermodynamics_demo
        seed_thermodynamics_demo()

@app.get("/")
def root():
    return {
        "status": "active",
        "app": "AnswerDoctor Enterprise Engine",
        "version": "2.0.0",
        "persistent_database": True,
        "demo_preloaded": os.getenv("ANSWERDOCTOR_SEED_DEMO", "false").lower() == "true",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    from sqlalchemy import text
    from database import SessionLocal
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8008")))
