from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, classrooms, assignments, submissions, malpractice, analytics
from services.seed_data import seed_thermodynamics_demo

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AnswerDoctor API Engine",
    description="Reasoning-level diagnosis & batch grading platform for handwritten answer scripts with collusion detection (CMI)",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
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
        "app": "AnswerDoctor Engine",
        "demo_preloaded": True,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
