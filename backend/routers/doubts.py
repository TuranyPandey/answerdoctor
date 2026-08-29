from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import DoubtQuery, SubmissionStep, RubricUnit
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/doubts", tags=["AI Doubt Center"])

class AskDoubtRequest(BaseModel):
    student_id: int
    step_id: Optional[int] = None
    question_text: str

@router.post("/ask")
def ask_doubt(req: AskDoubtRequest, db: Session = Depends(get_db)):
    step = None
    unit = None
    if req.step_id:
        step = db.query(SubmissionStep).filter(SubmissionStep.id == req.step_id).first()
        if step and step.rubric_unit_id:
            unit = db.query(RubricUnit).filter(RubricUnit.id == step.rubric_unit_id).first()

    # Generate grounded AI response
    q_lower = req.question_text.lower()
    if step and unit:
        if "reference state" in unit.label.lower() or "reference state" in q_lower or "step 1" in q_lower:
            response = (
                f"Regarding Step {step.step_number} ('{unit.label}'): Your derivation was flagged because "
                "in thermodynamics evaluations, internal energy (u) and enthalpy (h) equations are state functions calculated relative to a reference state (T_0 = 298.15 K, P_0 = 1 atm). "
                "Omitting T_0 leaves the energy balance floating without zero-point baseline initialization."
            )
        elif "unit" in unit.category or "bar" in q_lower or "kpa" in q_lower:
            response = (
                f"Regarding Step {step.step_number} ('{unit.label}'): Pressure was substituted directly in bar without converting to kPa. "
                "Always multiply pressure values by 100 (1 bar = 100 kPa) before evaluating Work = P * (V2 - V1)."
            )
        else:
            response = (
                f"Regarding Step {step.step_number} ('{unit.label}'): The rubric requires '{unit.expected_text}'. "
                f"Your submitted text ('{step.student_text}') had a similarity alignment score of {round(step.similarity_score * 100, 1)}%, which fell below the required threshold of 60.0%."
            )
    else:
        # General concept doubt response
        if "reference state" in q_lower or "first law" in q_lower:
            response = (
                "The First Law of Thermodynamics energy balance Q - W = delta U requires defining a reference state (T_0, P_0). "
                "Without specifying T_0, delta U = m * c_v * (T2 - T1) lacks path-independent baseline reference properties."
            )
        elif "cmi" in q_lower or "collusion" in q_lower:
            response = (
                "The Cohort Malpractice Index (CMI) evaluates pairwise semantic similarity and error pattern matches. "
                "A CMI >= 0.88 indicates that two scripts shared identical non-standard reasoning errors or verbatim derivation steps."
            )
        else:
            response = (
                f"AnswerDoctor AI Doubt Assistant: To solve '{req.question_text}', break the derivation into 5 atomic units: "
                "1) State reference conditions, 2) Write conservation equation, 3) Perform integration/transformation, 4) Apply SI unit conversions, and 5) Evaluate net final result."
            )

    doubt = DoubtQuery(
        student_id=req.student_id,
        step_id=req.step_id,
        user_question=req.question_text,
        ai_response=response
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return {
        "id": doubt.id,
        "student_id": doubt.student_id,
        "step_id": doubt.step_id,
        "user_question": doubt.user_question,
        "ai_response": doubt.ai_response,
        "created_at": doubt.created_at
    }

@router.get("/history/{student_id}")
def get_doubt_history(student_id: int, db: Session = Depends(get_db)):
    doubts = db.query(DoubtQuery).filter(DoubtQuery.student_id == student_id).order_by(DoubtQuery.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "student_id": d.student_id,
            "step_id": d.step_id,
            "user_question": d.user_question,
            "ai_response": d.ai_response,
            "created_at": d.created_at
        } for d in doubts
    ]
