from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Assignment, RubricUnit, Submission
from services.rubric_decomposer import decompose_answer_key
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

class AssignmentCreate(BaseModel):
    title: str
    subject: str
    classroom_id: int
    answer_key_text: str
    total_marks: float = 100.0

@router.get("/classroom/{classroom_id}")
def list_assignments(classroom_id: int, db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.classroom_id == classroom_id).all()
    res = []
    for a in assignments:
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

    # Decompose answer key into atomic units
    units = decompose_answer_key(req.answer_key_text)
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
