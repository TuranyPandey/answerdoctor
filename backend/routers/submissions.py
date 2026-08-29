from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Submission, SubmissionStep, RubricUnit, User, Assignment
from services.diagnosis_agent import generate_retry_question
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])

class StepRetryRequest(BaseModel):
    step_id: int
    selected_option: str # 'A', 'B', 'C', 'D'

@router.get("/assignment/{assignment_id}")
def list_submissions(assignment_id: int, db: Session = Depends(get_db)):
    subs = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    res = []
    for s in subs:
        res.append({
            "id": s.id,
            "student_id": s.student_id,
            "student_name": s.student_name,
            "register_number": s.register_number,
            "total_ras_score": s.total_ras_score,
            "ocr_confidence": s.ocr_confidence,
            "is_collusion_flagged": s.is_collusion_flagged,
            "submission_time": s.submission_time
        })
    return res

@router.get("/student/{student_id}/assignment/{assignment_id}")
def get_student_submission(student_id: int, assignment_id: int, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == student_id
    ).first()
    if not sub:
        # Return first submission for demo fallback if specific ID not found
        sub = db.query(Submission).filter(Submission.assignment_id == assignment_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return get_submission_details(sub.id, db)

@router.get("/{submission_id}")
def get_submission_details(submission_id: int, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    steps = db.query(SubmissionStep).filter(SubmissionStep.submission_id == submission_id).order_by(SubmissionStep.step_number).all()
    
    steps_data = []
    reasoning_map_nodes = []
    
    for st in steps:
        unit = db.query(RubricUnit).filter(RubricUnit.id == st.rubric_unit_id).first() if st.rubric_unit_id else None
        
        # Build Retry practice question if step is WEAK or MISSING
        retry_q = None
        if st.status in ("WEAK", "MISSING") and unit:
            retry_q = generate_retry_question(unit.label, unit.expected_text)

        step_dict = {
            "id": st.id,
            "step_number": st.step_number,
            "student_text": st.student_text,
            "has_diagram": st.has_diagram,
            "diagram_url": st.diagram_url,
            "similarity_score": st.similarity_score,
            "status": st.status,
            "diagnosis_text": st.diagnosis_text,
            "retry_status": st.retry_status,
            "retry_question": retry_q,
            "rubric_unit": {
                "id": unit.id,
                "category": unit.category,
                "label": unit.label,
                "expected_text": unit.expected_text,
                "weight": unit.weight
            } if unit else None
        }
        steps_data.append(step_dict)

        # Construct Reasoning Map Flowchart Node
        reasoning_map_nodes.append({
            "step_number": st.step_number,
            "node_type": unit.category if unit else "step",
            "title": unit.label if unit else f"Step {st.step_number}",
            "student_claim": st.student_text,
            "status": st.status, # MATCHED, WEAK, MISSING
            "has_reasoning_break": (st.status in ("WEAK", "MISSING")),
            "similarity_pct": round(st.similarity_score * 100, 1)
        })

    return {
        "submission_id": sub.id,
        "assignment_id": sub.assignment_id,
        "student_name": sub.student_name,
        "register_number": sub.register_number,
        "total_ras_score": sub.total_ras_score,
        "ocr_confidence": sub.ocr_confidence,
        "is_collusion_flagged": sub.is_collusion_flagged,
        "submission_time": sub.submission_time,
        "steps": steps_data,
        "reasoning_map": reasoning_map_nodes
    }

@router.post("/retry")
def process_step_retry(req: StepRetryRequest, db: Session = Depends(get_db)):
    step = db.query(SubmissionStep).filter(SubmissionStep.id == req.step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    unit = db.query(RubricUnit).filter(RubricUnit.id == step.rubric_unit_id).first()
    retry_q = generate_retry_question(unit.label if unit else "", unit.expected_text if unit else "")
    
    is_correct = (req.selected_option.upper() == retry_q["correct_option"])
    step.retry_attempts += 1
    if is_correct:
        step.retry_status = "PASSED"
        # Update submission score reward (+5 RAS credit for completing drill)
        sub = db.query(Submission).filter(Submission.id == step.submission_id).first()
        if sub:
            sub.total_ras_score = min(100.0, round(sub.total_ras_score + 10.0, 1))
    else:
        step.retry_status = "FAILED"
    
    db.commit()
    return {
        "is_correct": is_correct,
        "explanation": retry_q["explanation"],
        "new_retry_status": step.retry_status,
        "new_total_ras": step.submission.total_ras_score if step.submission else 60.0
    }
