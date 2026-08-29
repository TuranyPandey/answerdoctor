from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import CollusionPair, Submission, SubmissionStep
from services.semantic_aligner import compute_similarity
from pydantic import BaseModel

router = APIRouter(prefix="/api/malpractice", tags=["Malpractice Radar"])

class ReviewActionRequest(BaseModel):
    pair_id: int
    action: str # 'DISMISS' or 'CONFIRM'

@router.get("/assignment/{assignment_id}")
def get_malpractice_report(assignment_id: int, db: Session = Depends(get_db)):
    pairs = db.query(CollusionPair).filter(CollusionPair.assignment_id == assignment_id).all()
    
    pairs_list = []
    for p in pairs:
        pairs_list.append({
            "id": p.id,
            "student_a_name": p.student_a_name,
            "student_a_reg": p.student_a_reg,
            "student_b_name": p.student_b_name,
            "student_b_reg": p.student_b_reg,
            "cmi_score": p.cmi_score,
            "cos_sim": p.cos_sim,
            "error_match_score": p.error_match_score,
            "flagged_reason": p.flagged_reason,
            "status": p.status
        })

    # CMI Matrix visualization data
    subs = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    student_labels = [f"{s.student_name} ({s.register_number})" for s in subs]
    
    submission_text = {}
    for sub in subs:
        steps = db.query(SubmissionStep).filter(SubmissionStep.submission_id == sub.id).order_by(SubmissionStep.step_number).all()
        submission_text[sub.id] = " ".join(step.student_text for step in steps)

    matrix = []
    for i, s1 in enumerate(subs):
        row = []
        for j, s2 in enumerate(subs):
            if i == j:
                row.append(1.0)
            else:
                row.append(compute_similarity(submission_text[s1.id], submission_text[s2.id]))
        matrix.append(row)

    return {
        "assignment_id": assignment_id,
        "total_flagged_pairs": len(pairs_list),
        "cmi_threshold": 0.88,
        "collusion_pairs": pairs_list,
        "students": student_labels,
        "cmi_matrix": matrix
    }

@router.post("/review")
def review_collusion_pair(req: ReviewActionRequest, db: Session = Depends(get_db)):
    pair = db.query(CollusionPair).filter(CollusionPair.id == req.pair_id).first()
    if not pair:
        raise HTTPException(status_code=404, detail="Pair not found")
    pair.status = "DISMISSED" if req.action == "DISMISS" else "CONFIRMED"
    db.commit()
    return {"message": f"Pair status updated to {pair.status}", "pair_id": pair.id}
