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
    user_name = body.name or body.full_name or body.email.split("@")[0].capitalize()
    user_role = body.role or "teacher"
    pwd = body.password or "password"

    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        token = auth.create_access_token(existing.id)
        return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(existing))

    is_verified, status, inst = _check_verification(body.email, user_role)

    user = models.User(
        email=body.email,
        name=user_name,
        hashed_password=auth.hash_password(pwd),
        role=user_role,
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
    user_role = body.role or "teacher"

    # Prototype sign in: if user doesn't exist yet, auto-register on sign-in
    if not user:
        user_name = body.full_name or body.name or body.email.split("@")[0].capitalize()
        is_verified, status, inst = _check_verification(body.email, user_role)
        user = models.User(
            email=body.email,
            name=user_name,
            hashed_password=auth.hash_password(body.password or "password"),
            role=user_role,
            is_verified=is_verified,
            verification_status=status,
            institution=inst,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # If user role was specified, update role if needed
        if body.role and user.role != body.role:
            user.role = body.role
            db.commit()
            db.refresh(user)

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
