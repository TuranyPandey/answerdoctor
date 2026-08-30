from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import PYQQuestion
from typing import Optional
import json

router = APIRouter(prefix="/api/pyq", tags=["PYQ Vault"])

@router.get("")
def get_pyqs(subject: Optional[str] = None, year: Optional[int] = None, exam_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PYQQuestion)
    if subject and subject != "ALL":
        query = query.filter(PYQQuestion.subject.ilike(f"%{subject}%"))
    if year:
        query = query.filter(PYQQuestion.year == year)
    if exam_type and exam_type != "ALL":
        query = query.filter(PYQQuestion.exam_type == exam_type)
    
    questions = query.all()
    res = []
    for q in questions:
        res.append({
            "id": q.id,
            "subject": q.subject,
            "year": q.year,
            "exam_type": q.exam_type,
            "title": q.title,
            "question_text": q.question_text,
            "answer_key_summary": q.answer_key_summary,
            "difficulty": q.difficulty,
            "topics": json.loads(q.topics_json) if q.topics_json else []
        })
    return res

@router.get("/{pyq_id}")
def get_pyq_detail(pyq_id: int, db: Session = Depends(get_db)):
    q = db.query(PYQQuestion).filter(PYQQuestion.id == pyq_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="PYQ not found")
    return {
        "id": q.id,
        "subject": q.subject,
        "year": q.year,
        "exam_type": q.exam_type,
        "title": q.title,
        "question_text": q.question_text,
        "answer_key_summary": q.answer_key_summary,
        "difficulty": q.difficulty,
        "topics": json.loads(q.topics_json) if q.topics_json else []
    }
