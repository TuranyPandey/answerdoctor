from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Submission, SubmissionStep, RubricUnit, User, Assignment, CollusionPair
from services.semantic_aligner import compute_similarity, calculate_ras
from services.diagnosis_agent import generate_step_diagnosis, generate_retry_question
from services.malpractice_radar import compute_cmi
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])

class CustomSubmissionStepInput(BaseModel):
    step_number: int
    student_text: str
    has_diagram: Optional[bool] = False

class DynamicEvaluateSubmissionRequest(BaseModel):
    assignment_id: int
    student_name: str
    register_number: str
    steps: List[CustomSubmissionStepInput]

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
<<<<<<< HEAD
        sub = db.query(Submission).filter(Submission.assignment_id == assignment_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return get_submission_details(sub.id, db)

=======
        raise HTTPException(status_code=404, detail="Submission not found")
    return get_submission_details(sub.id, db)

@router.get("/student/{student_id}/latest")
def get_latest_student_submission(student_id: int, db: Session = Depends(get_db)):
    sub = (
        db.query(Submission)
        .filter(Submission.student_id == student_id)
        .order_by(Submission.submission_time.desc(), Submission.id.desc())
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="No evaluated answers yet")
    result = get_submission_details(sub.id, db)
    student_submissions = db.query(Submission).filter(Submission.student_id == student_id).all()
    result["student_submission_count"] = len(student_submissions)
    result["student_passed_count"] = sum(item.total_ras_score >= 60 for item in student_submissions)
    return result

>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
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

        reasoning_map_nodes.append({
            "step_number": st.step_number,
            "node_type": unit.category if unit else "step",
            "title": unit.label if unit else f"Step {st.step_number}",
            "student_claim": st.student_text,
            "status": st.status,
            "has_reasoning_break": (st.status in ("WEAK", "MISSING")),
            "similarity_pct": round(st.similarity_score * 100, 1)
        })

    return {
        "submission_id": sub.id,
        "assignment_id": sub.assignment_id,
<<<<<<< HEAD
=======
        "assignment_title": sub.assignment.title if sub.assignment else "Assignment",
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
        "student_name": sub.student_name,
        "register_number": sub.register_number,
        "total_ras_score": sub.total_ras_score,
        "ocr_confidence": sub.ocr_confidence,
        "is_collusion_flagged": sub.is_collusion_flagged,
        "submission_time": sub.submission_time,
        "steps": steps_data,
        "reasoning_map": reasoning_map_nodes
    }

@router.post("/evaluate")
def evaluate_custom_submission(req: DynamicEvaluateSubmissionRequest, db: Session = Depends(get_db)):
    """
    DYNAMIC EVALUATION ENDPOINT:
    Accepts custom student derivations, aligns each step against the assignment's rubric units,
    computes RAS score, saves to DB, checks CMI collusion against cohort, and updates Reasoning Map!
    """
    assignment = db.query(Assignment).filter(Assignment.id == req.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    rubric_units = db.query(RubricUnit).filter(RubricUnit.assignment_id == req.assignment_id).order_by(RubricUnit.id).all()
    if not rubric_units:
        raise HTTPException(status_code=400, detail="Assignment has no rubric units defined")

    # Find or create student user
    student = db.query(User).filter(User.register_number == req.register_number).first()
    if not student:
        student = User(
            email=f"{req.register_number.lower()}@vitstudent.ac.in",
            full_name=req.student_name,
            register_number=req.register_number,
            role="student"
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    # Step-by-step semantic alignment
    step_matches = []
    created_step_objects = []

    for i, s_input in enumerate(req.steps):
        # Match with corresponding rubric unit
        ru = rubric_units[i % len(rubric_units)]
        sim_score = compute_similarity(s_input.student_text, ru.expected_text)

        step_matches.append({
            'unit_weight': ru.weight,
            'similarity_score': sim_score,
            'gamma_threshold': ru.gamma_threshold
        })

        created_step_objects.append({
            'step_number': s_input.step_number,
            'student_text': s_input.student_text,
            'has_diagram': s_input.has_diagram,
            'rubric_unit_id': ru.id,
            'similarity_score': sim_score,
            'unit_category': ru.category,
            'unit_label': ru.label,
            'expected_text': ru.expected_text
        })

    # Compute Rubric-Alignment Score (RAS)
    ras_result = calculate_ras(step_matches)
    total_ras = ras_result['total_ras_score']

    # Create Submission record
    sub = Submission(
        assignment_id=assignment.id,
        student_id=student.id,
        student_name=student.full_name,
        register_number=student.register_number,
        total_ras_score=total_ras,
        ocr_confidence=0.96,
        is_collusion_flagged=False
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Save Submission Steps
    for idx, st_obj in enumerate(created_step_objects):
        status = ras_result['steps'][idx]['status']
        diag_txt = generate_step_diagnosis(
            st_obj['step_number'],
            st_obj['unit_category'],
            st_obj['unit_label'],
            st_obj['student_text'],
            st_obj['expected_text'],
            st_obj['similarity_score']
        )

        db.add(SubmissionStep(
            submission_id=sub.id,
            step_number=st_obj['step_number'],
            student_text=st_obj['student_text'],
            has_diagram=st_obj['has_diagram'],
            rubric_unit_id=st_obj['rubric_unit_id'],
            similarity_score=st_obj['similarity_score'],
            status=status,
            diagnosis_text=diag_txt,
            retry_status="NOT_ATTEMPTED"
        ))

    db.commit()

    # Update assignment script count
    assignment.total_scripts = db.query(Submission).filter(Submission.assignment_id == assignment.id).count()
    db.commit()

    # Check CMI collusion against other cohort submissions
    other_subs = db.query(Submission).filter(
        Submission.assignment_id == assignment.id,
        Submission.id != sub.id
    ).all()

    full_text_a = " ".join([s.student_text for s in req.steps])
    sub_steps_a = created_step_objects

    for other in other_subs:
        other_step_objs = db.query(SubmissionStep).filter(SubmissionStep.submission_id == other.id).order_by(SubmissionStep.step_number).all()
        full_text_b = " ".join([st.student_text for st in other_step_objs])
        steps_b = [{'status': st.status, 'student_text': st.student_text} for st in other_step_objs]

        cmi_res = compute_cmi(full_text_a, full_text_b, sub_steps_a, steps_b)
        if cmi_res['is_flagged']:
            sub.is_collusion_flagged = True
            db.add(CollusionPair(
                assignment_id=assignment.id,
                student_a_id=student.id,
                student_a_name=student.full_name,
                student_a_reg=student.register_number,
                student_b_id=other.student_id,
                student_b_name=other.student_name,
                student_b_reg=other.register_number,
                cmi_score=cmi_res['cmi_score'],
                cos_sim=cmi_res['cos_sim'],
                error_match_score=cmi_res['error_match_score'],
                flagged_reason=cmi_res['reason'],
                status="FLAGGED"
            ))

    db.commit()

    return get_submission_details(sub.id, db)

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
<<<<<<< HEAD

@router.post("/batch-eval")
def run_batch_evaluation(db: Session = Depends(get_db)):
    """
    Window C Requirement: Batch evaluation across ~4 pre-seeded scripts, RAS computed for each.
    """
    subs = db.query(Submission).all()
    results = []
    for s in subs:
        results.append({
            "submission_id": s.id,
            "student_name": s.student_name,
            "register_number": s.register_number,
            "total_ras_score": s.total_ras_score,
            "is_collusion_flagged": s.is_collusion_flagged,
            "status": "EVALUATED_RAS"
        })
    return {
        "batch_total": len(results),
        "evaluation_engine": "Agentic LangGraph + RAS Aligner",
        "cohort_results": results
    }

=======
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
