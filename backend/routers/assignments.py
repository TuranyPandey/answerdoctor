from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
<<<<<<< HEAD
from models import Assignment, RubricUnit, Submission
from services.rubric_decomposer import decompose_answer_key
from pydantic import BaseModel
from typing import List
=======
from models import Assignment, RubricUnit, Submission, Classroom
from services.rubric_decomposer import decompose_answer_key
from pydantic import BaseModel
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

class AssignmentCreate(BaseModel):
    title: str
    subject: str
    classroom_id: int
    answer_key_text: str
    total_marks: float = 100.0

<<<<<<< HEAD
=======
@router.get("/")
def list_teacher_assignments(teacher_id: int, db: Session = Depends(get_db)):
    assignments = (
        db.query(Assignment)
        .join(Classroom, Assignment.classroom_id == Classroom.id)
        .filter(Classroom.teacher_id == teacher_id)
        .order_by(Assignment.created_at.desc())
        .all()
    )
    return [_assignment_summary(a, db) for a in assignments]

def _assignment_summary(a: Assignment, db: Session):
    submissions_count = db.query(Submission).filter(Submission.assignment_id == a.id).count()
    return {
        "id": a.id, "title": a.title, "subject": a.subject,
        "classroom_id": a.classroom_id, "total_marks": a.total_marks,
        "total_scripts": submissions_count,
        "units_count": db.query(RubricUnit).filter(RubricUnit.assignment_id == a.id).count(),
        "status": a.status, "created_at": a.created_at
    }

>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
@router.get("/classroom/{classroom_id}")
def list_assignments(classroom_id: int, db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.classroom_id == classroom_id).all()
    res = []
    for a in assignments:
<<<<<<< HEAD
        units_count = db.query(RubricUnit).filter(RubricUnit.assignment_id == a.id).count()
        submissions_count = db.query(Submission).filter(Submission.assignment_id == a.id).count()
        res.append({
            "id": a.id,
            "title": a.title,
            "subject": a.subject,
            "total_marks": a.total_marks,
            "total_scripts": max(a.total_scripts, submissions_count),
            "units_count": units_count,
            "status": a.status,
            "created_at": a.created_at
        })
=======
        res.append(_assignment_summary(a, db))
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
    return res

@router.get("/{assignment_id}")
def get_assignment_details(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    rubric_units = db.query(RubricUnit).filter(RubricUnit.assignment_id == assignment_id).all()
    return {
        "id": assignment.id,
        "title": assignment.title,
        "subject": assignment.subject,
        "answer_key_text": assignment.answer_key_text,
        "total_marks": assignment.total_marks,
        "total_scripts": assignment.total_scripts,
        "rubric_units": [
            {
                "id": ru.id,
                "category": ru.category,
                "label": ru.label,
                "expected_text": ru.expected_text,
                "weight": ru.weight,
                "gamma_threshold": ru.gamma_threshold
            } for ru in rubric_units
        ]
    }

@router.post("/create")
def create_assignment(req: AssignmentCreate, db: Session = Depends(get_db)):
<<<<<<< HEAD
=======
    classroom = db.query(Classroom).filter(Classroom.id == req.classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    try:
        units = decompose_answer_key(req.answer_key_text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
    assignment = Assignment(
        title=req.title,
        subject=req.subject,
        classroom_id=req.classroom_id,
        answer_key_text=req.answer_key_text,
        total_marks=req.total_marks,
        status="GRADED"
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

<<<<<<< HEAD
    # Decompose answer key into atomic units
    units = decompose_answer_key(req.answer_key_text)
=======
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
    for u in units:
        db.add(RubricUnit(
            assignment_id=assignment.id,
            category=u["category"],
            label=u["label"],
            expected_text=u["expected_text"],
            weight=u["weight"],
            gamma_threshold=u["gamma_threshold"]
        ))
    db.commit()
    return assignment
