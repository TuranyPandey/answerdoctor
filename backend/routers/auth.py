from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    role: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str
    full_name: str
    register_number: Optional[str] = None
    role: str # 'teacher' or 'student'

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Auto-create if not present for demo smoothness
        role = req.role if req.role else ("teacher" if "prof" in req.email else "student")
        user = User(email=req.email, full_name=req.email.split('@')[0].title(), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "register_number": user.register_number,
        "role": user.role
    }

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        return existing
    user = User(
        email=req.email,
        full_name=req.full_name,
        register_number=req.register_number,
        role=req.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
