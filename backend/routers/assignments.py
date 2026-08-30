import os
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/assignments", tags=["assignments"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=schemas.AssignmentOut)
async def create_assignment(
    class_id: str = Form(...),
    title: str = Form(...),
    exam_name: str = Form(...),
    instructions: Optional[str] = Form(None),
    total_marks: float = Form(10.0),
    due_date: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """Teacher posts a new script assignment / exam task for a classroom."""
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")
    if cls.teacher_id != current_user.id:
        raise HTTPException(403, "Not your class")

    saved_file_path = None
    if file:
        filename = f"assign_{cls.id[:6]}_{file.filename}"
        saved_file_path = os.path.join(UPLOAD_DIR, filename)
        content = await file.read()
        with open(saved_file_path, "wb") as f:
            f.write(content)

    assignment = models.Assignment(
        class_id=class_id,
        teacher_id=current_user.id,
        title=title,
        exam_name=exam_name,
        instructions=instructions,
        total_marks=total_marks,
        due_date=due_date,
        file_path=saved_file_path,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return _enrich_assignment(assignment, db)


@router.get("", response_model=list[schemas.AssignmentOut])
def list_assignments(
    class_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """List assigned script tasks for a classroom."""
    query = db.query(models.Assignment)
    if class_id:
        query = query.filter(models.Assignment.class_id == class_id)
    elif current_user.role == "teacher":
        query = query.filter(models.Assignment.teacher_id == current_user.id)

    assignments = query.order_by(models.Assignment.created_at.desc()).all()
    return [_enrich_assignment(a, db, current_user.id if current_user.role == "student" else None) for a in assignments]


@router.get("/student", response_model=list[schemas.AssignmentOut])
def list_student_assignments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """List assigned script tasks for all classes enrolled by student."""
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == current_user.id).all()
    class_ids = [e.class_id for e in enrollments]

    if not class_ids:
        return []

    assignments = (
        db.query(models.Assignment)
        .filter(models.Assignment.class_id.in_(class_ids))
        .order_by(models.Assignment.created_at.desc())
        .all()
    )

    return [_enrich_assignment(a, db, current_user.id) for a in assignments]


def _enrich_assignment(a: models.Assignment, db: Session, student_id: Optional[str] = None) -> schemas.AssignmentOut:
    total_students = db.query(models.Enrollment).filter(models.Enrollment.class_id == a.class_id).count()

    # Count submitted scripts matching exam_name and class_id
    from sqlalchemy import func
    submitted_count = db.query(func.count(func.distinct(models.Script.student_id))).filter(
        models.Script.class_id == a.class_id,
        models.Script.exam_name == a.exam_name,
    ).scalar() or 0

    has_submitted = False
    if student_id:
        existing = db.query(models.Script).filter(
            models.Script.class_id == a.class_id,
            models.Script.exam_name == a.exam_name,
            models.Script.student_id == student_id,
        ).first()
        has_submitted = existing is not None

    out = schemas.AssignmentOut.model_validate(a)
    out.submitted_count = submitted_count
    out.total_students = total_students
    out.has_submitted = has_submitted
    return out
