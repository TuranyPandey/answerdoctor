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
<<<<<<< HEAD
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Auto-create if not present for demo smoothness
        role = req.role if req.role else ("teacher" if "prof" in req.email else "student")
        user = User(email=req.email, full_name=req.email.split('@')[0].title(), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
=======
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Create an account first.")
    if req.role and user.role != req.role:
        raise HTTPException(status_code=403, detail=f"This email belongs to a {user.role} account.")
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "register_number": user.register_number,
        "role": user.role
    }

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
<<<<<<< HEAD
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        return existing
    user = User(
        email=req.email,
        full_name=req.full_name,
        register_number=req.register_number,
=======
    email = req.email.strip().lower()
    if req.role not in ("teacher", "student"):
        raise HTTPException(status_code=400, detail="Role must be teacher or student.")
    if req.role == "student" and not req.register_number:
        raise HTTPException(status_code=400, detail="Students need a registration number.")
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    if req.register_number and db.query(User).filter(User.register_number == req.register_number.strip().upper()).first():
        raise HTTPException(status_code=409, detail="This registration number is already in use.")
    user = User(
        email=email,
        full_name=req.full_name.strip(),
        register_number=req.register_number.strip().upper() if req.register_number else None,
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
        role=req.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
<<<<<<< HEAD
    return user
=======
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "register_number": user.register_number, "role": user.role
    }
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
