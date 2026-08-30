import os
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User
from security import create_access_token, get_current_user, hash_password, verify_password


router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str
    register_number: Optional[str] = None
    role: Literal["teacher", "student"]


class GoogleLoginRequest(BaseModel):
    credential: str
    role: Literal["teacher", "student"]
    mode: Literal["login", "register"] = "login"
    register_number: Optional[str] = None


def _user_response(user: User, include_token: bool = True):
    response = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "register_number": user.register_number,
        "role": user.role,
        "avatar_url": user.avatar_url,
    }
    if include_token:
        response.update({"access_token": create_access_token(user), "token_type": "bearer"})
    return response


def _normalized_email(email: str) -> str:
    email = email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    return email


def _validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")


@router.get("/config")
def auth_config():
    return {"google_client_id": os.getenv("GOOGLE_CLIENT_ID", "")}


@router.get("/me")
def current_account(current_user: User = Depends(get_current_user)):
    return _user_response(current_user, include_token=False)


@router.get("/users")
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required.")
    return [_user_response(user, include_token=False) for user in db.query(User).all()]


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = _normalized_email(req.email)
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        if user and not user.password_hash:
            raise HTTPException(
                status_code=409,
                detail="This older account has no password. Sign in with Google or ask an administrator to reset it.",
            )
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if req.role and user.role != req.role:
        raise HTTPException(status_code=403, detail=f"This email belongs to a {user.role} account.")
    return _user_response(user)


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    email = _normalized_email(req.email)
    _validate_password(req.password)
    full_name = req.full_name.strip()
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if req.role == "student" and not req.register_number:
        raise HTTPException(status_code=400, detail="Students need a registration number.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    register_number = req.register_number.strip().upper() if req.register_number else None
    if register_number and db.query(User).filter(User.register_number == register_number).first():
        raise HTTPException(status_code=409, detail="This registration number is already in use.")
    user = User(
        email=email,
        full_name=full_name,
        password_hash=hash_password(req.password),
        register_number=register_number,
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_response(user)


@router.post("/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured yet.")
    try:
        claims = id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            client_id,
        )
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Google could not verify this sign-in.")

    email = _normalized_email(claims.get("email", ""))
    if not claims.get("email_verified") or not claims.get("sub"):
        raise HTTPException(status_code=401, detail="Google did not provide a verified account.")

    user = db.query(User).filter(User.google_id == claims["sub"]).first()
    if not user:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            google_is_authoritative = email.endswith("@gmail.com") or bool(claims.get("hd"))
            if not google_is_authoritative:
                raise HTTPException(
                    status_code=409,
                    detail="This email already has an account. Sign in with its password instead.",
                )
            if existing.role != req.role:
                raise HTTPException(status_code=403, detail=f"This email belongs to a {existing.role} account.")
            existing.google_id = claims["sub"]
            existing.avatar_url = existing.avatar_url or claims.get("picture")
            user = existing
        else:
            if req.mode != "register":
                raise HTTPException(status_code=404, detail="No account found. Choose Create account first.")
            register_number = req.register_number.strip().upper() if req.register_number else None
            if req.role == "student" and not register_number:
                raise HTTPException(status_code=400, detail="Students need a registration number before using Google.")
            if register_number and db.query(User).filter(User.register_number == register_number).first():
                raise HTTPException(status_code=409, detail="This registration number is already in use.")
            user = User(
                email=email,
                full_name=(claims.get("name") or email.split("@", 1)[0]).strip(),
                register_number=register_number,
                role=req.role,
                google_id=claims["sub"],
                avatar_url=claims.get("picture"),
            )
            db.add(user)
        db.commit()
        db.refresh(user)
    elif user.role != req.role:
        raise HTTPException(status_code=403, detail=f"This Google account belongs to a {user.role} account.")
    return _user_response(user)
