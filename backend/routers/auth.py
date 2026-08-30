from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["auth"])

ACADEMIC_DOMAINS = [".edu", ".ac.in", ".edu.in", ".edu.au", ".ac.uk", ".edu.cn", "school", "univ", "college", "mit.edu", "stanford.edu"]


def _check_verification(email: str, role: str) -> tuple[bool, str, Optional[str]]:
    domain = email.split("@")[-1].lower() if "@" in email else ""
    is_academic = any(domain.endswith(d) or d in domain for d in ACADEMIC_DOMAINS)
    if is_academic:
        status = "Verified Academic Educator" if role == "teacher" else "Verified Student"
        institution_name = domain.split(".")[0].upper() + " Institution"
        return True, status, institution_name
    return False, "Standard Account", None


class VerificationRequest(BaseModel):
    institution: str
    faculty_code: Optional[str] = None


@router.post("/google", response_model=schemas.TokenResponse)
async def google_login(body: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    google_data = await auth.verify_google_token(body.id_token)

    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name", email)
    avatar_url = google_data.get("picture")

    user = db.query(models.User).filter(models.User.google_id == google_id).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()

    is_verified, status, inst = _check_verification(email, body.role or "student")

    if not user:
        user = models.User(
            email=email,
            name=name,
            google_id=google_id,
            avatar_url=avatar_url,
            role=body.role,
            is_verified=is_verified,
            verification_status=status,
            institution=inst,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_id:
            user.google_id = google_id
            user.avatar_url = avatar_url
        if is_verified and not user.is_verified:
            user.is_verified = True
            user.verification_status = status
            user.institution = inst
        db.commit()
        db.refresh(user)

    token = auth.create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/register", response_model=schemas.TokenResponse)
def register(body: schemas.EmailAuthRequest, db: Session = Depends(get_db)):
    if not body.name or not body.role:
        raise HTTPException(400, "name and role required for registration")
    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        raise HTTPException(409, "Email already registered")

    is_verified, status, inst = _check_verification(body.email, body.role)

    user = models.User(
        email=body.email,
        name=body.name,
        hashed_password=auth.hash_password(body.password),
        role=body.role,
        is_verified=is_verified,
        verification_status=status,
        institution=inst,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.EmailAuthRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(401, "Invalid email or password")
    if not auth.verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    token = auth.create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/verify-institution", response_model=schemas.UserOut)
def verify_institution(
    body: VerificationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Verify standard account with academic institution details."""
    current_user.institution = body.institution
    current_user.is_verified = True
    current_user.verification_status = "Verified Academic Educator" if current_user.role == "teacher" else "Verified Academic Student"
    db.commit()
    db.refresh(current_user)
    return schemas.UserOut.model_validate(current_user)


@router.get("/me", response_model=schemas.UserOut)
async def me(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserOut.model_validate(current_user)
