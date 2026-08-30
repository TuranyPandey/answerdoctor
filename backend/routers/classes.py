import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/classes", tags=["classes"])


def _gen_code(name: str) -> str:
    prefix = name[:4].upper().replace(" ", "")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{suffix}"


@router.post("", response_model=schemas.ClassOut)
def create_class(
    body: schemas.ClassCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    cls = models.Class(
        name=body.name,
        subject=body.subject,
        join_code=_gen_code(body.name),
        teacher_id=current_user.id,
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return _enrich(cls, db)


@router.get("", response_model=list[schemas.ClassOut])
def list_classes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if current_user.role == "teacher":
        classes = db.query(models.Class).filter(models.Class.teacher_id == current_user.id).all()
    else:
        enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == current_user.id).all()
        class_ids = [e.class_id for e in enrollments]
        classes = db.query(models.Class).filter(models.Class.id.in_(class_ids)).all()
    return [_enrich(c, db) for c in classes]


@router.get("/{class_id}", response_model=schemas.ClassOut)
def get_class(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")
    return _enrich(cls, db)


@router.post("/join", response_model=schemas.ClassOut)
def join_class(
    body: schemas.JoinClassRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    cls = db.query(models.Class).filter(models.Class.join_code == body.join_code).first()
    if not cls:
        raise HTTPException(404, "Invalid join code")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.class_id == cls.id,
    ).first()
    if existing:
        raise HTTPException(409, "Already enrolled in this class")

    enroll = models.Enrollment(student_id=current_user.id, class_id=cls.id)
    db.add(enroll)
    db.commit()
    return _enrich(cls, db)


@router.get("/{class_id}/students", response_model=list[schemas.UserOut])
def list_students(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.class_id == class_id).all()
    students = [e.student for e in enrollments]
    return [schemas.UserOut.model_validate(s) for s in students]


def _enrich(cls: models.Class, db: Session) -> schemas.ClassOut:
    student_count = db.query(models.Enrollment).filter(models.Enrollment.class_id == cls.id).count()
    from sqlalchemy import func
    exam_count = db.query(func.count(func.distinct(models.Script.exam_name))).filter(
        models.Script.class_id == cls.id
    ).scalar() or 0
    out = schemas.ClassOut.model_validate(cls)
    out.student_count = student_count
    out.exam_count = exam_count
    return out
