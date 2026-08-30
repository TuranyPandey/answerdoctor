"""Smoke-test password authentication and protected API routes."""
import os
import sys
import tempfile
from pathlib import Path


db_file = Path(tempfile.gettempdir()) / "answerdoctor-auth-smoke.db"
db_file.unlink(missing_ok=True)
os.environ["ANSWERDOCTOR_DB_PATH"] = str(db_file)
os.environ["ANSWERDOCTOR_SEED_DEMO"] = "false"
os.environ["AUTH_SECRET"] = "smoke-test-secret-that-is-not-used-in-production"
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from fastapi import HTTPException
from main import app
from database import SessionLocal, engine
from models import User
from routers.auth import LoginRequest, RegisterRequest, login, register
from security import get_current_user


db = SessionLocal()
registration = register(RegisterRequest(
    email="secure@example.edu",
    full_name="Secure Teacher",
    password="correct-horse-123",
    role="teacher",
), db)
token = registration["access_token"]

stored = db.query(User).filter(User.email == "secure@example.edu").one()
assert stored.password_hash and stored.password_hash != "correct-horse-123"

try:
    login(LoginRequest(
        email="secure@example.edu",
        password="definitely-wrong",
        role="teacher",
    ), db)
    raise AssertionError("Wrong password was accepted")
except HTTPException as error:
    assert error.status_code == 401

assert get_current_user(token, db).id == stored.id
db.close()

engine.dispose()
db_file.unlink(missing_ok=True)
print("Authentication flow passed")
