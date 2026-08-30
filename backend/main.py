import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database import engine, Base
import models
from routers import auth, classes, rubric, scripts, analytics, collusion, pyq, student, assignments, guilds

settings = get_settings()

import db_migrations

# Create SQLite tables & migrate missing columns
Base.metadata.create_all(bind=engine)
db_migrations.run_migrations()

app = FastAPI(
    title="AnswerDoctor API",
    description="Reasoning-level diagnosis and batch grading for handwritten answer scripts with collusion detection",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(classes.router, prefix="/api")
app.include_router(rubric.router, prefix="/api")
app.include_router(scripts.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(collusion.router, prefix="/api")
app.include_router(pyq.router, prefix="/api")
app.include_router(student.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(guilds.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.appName if hasattr(settings, "appName") else "AnswerDoctor",
        "version": "1.0.0",
    }

@app.get("/health")
def health():
    from sqlalchemy import text
    from database import SessionLocal
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "8008"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
