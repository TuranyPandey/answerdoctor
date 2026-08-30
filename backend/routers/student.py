from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from services import grader, ocr
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter(prefix="/student", tags=["student"])


class AIExplainRequest(BaseModel):
    step_label: str
    unit_type: str
    student_text: str = ""
    feedback: str = ""
    prompt_type: str = "explain"  # "explain", "mistake", "cheatsheet", "example"


class PYQPracticeRequest(BaseModel):
    pyq_id: str
    student_solution: str = ""


class AIHintRequest(BaseModel):
    question_text: str
    step_label: str = ""
    hint_level: int = 1  # 1: Concept, 2: Formula, 3: First Step


@router.get("/scripts")
def get_student_scripts(
    student_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Fetch all evaluated scripts for a student."""
    target_id = student_id if (student_id and current_user.role == "teacher") else current_user.id
    scripts = (
        db.query(models.Script)
        .filter(models.Script.student_id == target_id)
        .order_by(models.Script.uploaded_at.desc())
        .all()
    )
    return [schemas.ScriptOut.model_validate(s) for s in scripts]


@router.get("/analytics")
def get_student_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    scripts = (
        db.query(models.Script)
        .filter(models.Script.student_id == current_user.id, models.Script.status == "done")
        .order_by(models.Script.uploaded_at.desc())
        .all()
    )

    total_scripts = len(scripts)
    if total_scripts == 0:
        return {
            "total_scripts": 0,
            "average_ras": 0.0,
            "average_score_percent": 0.0,
            "category_stats": [
                {"type": "Concept", "total": 0, "matched": 0, "pass_rate": 100.0},
                {"type": "Formula", "total": 0, "matched": 0, "pass_rate": 100.0},
                {"type": "Step", "total": 0, "matched": 0, "pass_rate": 100.0},
                {"type": "Transformation", "total": 0, "matched": 0, "pass_rate": 100.0},
                {"type": "Result", "total": 0, "matched": 0, "pass_rate": 100.0},
            ],
            "script_history": [],
            "weak_spots": [],
        }

    valid_ras = [s.ras for s in scripts if s.ras is not None]
    average_ras = sum(valid_ras) / len(valid_ras) if valid_ras else 0.0

    score_percents = [
        (s.scored_marks / s.total_marks * 100)
        for s in scripts
        if s.scored_marks is not None and s.total_marks and s.total_marks > 0
    ]
    average_score_percent = sum(score_percents) / len(score_percents) if score_percents else 0.0

    # Collect step stats by unit type
    script_ids = [s.id for s in scripts]
    steps = (
        db.query(models.GradingStep)
        .filter(models.GradingStep.script_id.in_(script_ids))
        .all()
    )

    cats = {"Concept": [0, 0], "Formula": [0, 0], "Step": [0, 0], "Transformation": [0, 0], "Result": [0, 0]}

    for step in steps:
        utype = step.rubric_unit.type if step.rubric_unit else "Step"
        if utype not in cats:
            cats[utype] = [0, 0]
        cats[utype][0] += 1
        if step.matched:
            cats[utype][1] += 1

    category_stats = []
    weak_spots = []

    for utype, (tot, mat) in cats.items():
        rate = round((mat / tot * 100), 1) if tot > 0 else 100.0
        category_stats.append({
            "type": utype,
            "total": tot,
            "matched": mat,
            "pass_rate": rate,
        })
        if tot > 0 and rate < 75.0:
            weak_spots.append({
                "type": utype,
                "pass_rate": rate,
                "advice": f"Your {utype} reasoning step pass rate is {rate}%. Review basic governing laws and variable definitions in this category."
            })

    script_history = [
        {
            "id": s.id,
            "exam_name": s.exam_name,
            "uploaded_at": s.uploaded_at.isoformat(),
            "scored_marks": s.scored_marks,
            "total_marks": s.total_marks,
            "ras": s.ras,
        }
        for s in scripts
    ]

    return {
        "total_scripts": total_scripts,
        "average_ras": round(average_ras, 4),
        "average_score_percent": round(average_score_percent, 1),
        "category_stats": category_stats,
        "script_history": script_history,
        "weak_spots": weak_spots,
    }


@router.post("/ai-explain")
async def ai_explain_step(
    body: AIExplainRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    """Generate diagnostic AI explanations & study cheat sheets for a reasoning step."""
    prompt_intent = {
        "explain": f"Explain the core engineering concept behind '{body.step_label}' clearly in 3 concise bullet points with key formulas.",
        "mistake": f"Explain why a student might lose marks on '{body.step_label}' given error feedback: '{body.feedback}'. List 2 common pitfalls to avoid.",
        "cheatsheet": f"Create a 3-step memory cheat sheet and governing equation for '{body.step_label}'.",
        "example": f"Provide a brief 1-minute practice problem and step-by-step solution demonstrating '{body.step_label}'.",
    }.get(body.prompt_type, f"Explain '{body.step_label}' clearly.")

    if grader.settings.gemini_api_key and grader.settings.gemini_api_key.startswith("AIza"):
        try:
            raw = await grader._generate(
                prompt=f"{prompt_intent}\nTarget Unit Type: {body.unit_type}\nStudent text context: \"{body.student_text[:500]}\"",
                system="You are Doctor AI Advisor, an expert engineering tutor who explains complex problem solving with clarity, precision, and encouragement.",
            )
            return {"content": raw}
        except Exception as err:
            print(f"Gemini AI advisor error: {err}")

    # Fallback response
    fallback_content = (
        f"### 💡 AI Advisor: {body.step_label}\n\n"
        f"**Key Focus ({body.unit_type}):** Ensure all reference states, governing laws, and algebraic transformations are explicitly stated.\n\n"
        f"- **Concept Check:** Always identify given state variables and unit consistency.\n"
        f"- **Formulation:** Apply the fundamental law directly before substituting numerical values.\n"
        f"- **Pro Tip:** Write out intermediate units (e.g. kJ, kPa, A, V) to avoid order-of-magnitude errors."
    )
    return {"content": fallback_content}


@router.post("/ai-hint")
async def get_ai_hint(
    body: AIHintRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    """Generate progressive hints for problem solving."""
    levels = {
        1: f"Provide a Level 1 HINT (Governing Concept & Physics Laws) for solving this problem: \"{body.question_text[:500]}\". Keep it brief (2 sentences), do not reveal full numerical calculations.",
        2: f"Provide a Level 2 HINT (Key Formula & Variable Setup) for solving: \"{body.question_text[:500]}\". Mention governing equations and symbol definitions.",
        3: f"Provide a Level 3 HINT (First Derivation Step) for: \"{body.question_text[:500]}\". Show how to start the first algebraic substitution step.",
    }
    prompt = levels.get(body.hint_level, levels[1])

    if grader.settings.gemini_api_key and grader.settings.gemini_api_key.startswith("AIza"):
        try:
            hint_text = await grader._generate(
                prompt=prompt,
                system="You are Doctor AI Tutor. Provide helpful, encouraging problem-solving hints without giving away the final numerical answer directly."
            )
            return {"hint": hint_text, "level": body.hint_level}
        except Exception as err:
            print(f"AI hint error: {err}")

    fallbacks = {
        1: "💡 Level 1 Hint (Concept): Identify given system state properties (e.g., initial & final temperatures/pressures) and determine if the process is constant volume, constant pressure, or adiabatic.",
        2: "📐 Level 2 Hint (Formula): Apply the First Law of Thermodynamics: Q - W = ΔU. For ideal gases, ΔU = m * Cv * (T2 - T1).",
        3: "✏️ Level 3 Hint (First Step): Substitute your given values for mass m, specific heat Cv, and boundary pressures to isolate the unknown work parameter W.",
    }
    return {"hint": fallbacks.get(body.hint_level, fallbacks[1]), "level": body.hint_level}


@router.post("/pyq-practice")
async def pyq_practice_attempt(
    pyq_id: str = Form(...),
    student_solution: Optional[str] = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Grade a student's practice submission for a PYQ using AI, accepting text, images, or document uploads."""
    pyq = db.query(models.PYQ).filter(models.PYQ.id == pyq_id).first()
    if not pyq:
        raise HTTPException(404, "PYQ not found")

    combined_text = student_solution or ""
    ocr_confidence = 1.0

    if file:
        file_bytes = await file.read()
        extracted_text, confidence = await ocr.process_file(file_bytes, file.filename, file.content_type)
        ocr_confidence = confidence
        if extracted_text:
            combined_text = f"{combined_text}\n\n[Extracted File/OCR Content ({file.filename})]:\n{extracted_text}".strip()

    if not combined_text.strip():
        raise HTTPException(400, "Please provide typed derivation text or upload an answer file (Image, PDF, DOCX, TXT).")

    rubric_units = []
    if pyq.rubric_json:
        try:
            rubric_units = json.loads(pyq.rubric_json)
        except Exception:
            pass

    if not rubric_units:
        lines = [l.strip() for l in (pyq.sample_solution or pyq.question_text).splitlines() if l.strip()]
        types = ["Concept", "Formula", "Step", "Transformation", "Result"]
        for idx, line in enumerate(lines[:5]):
            rubric_units.append({
                "id": f"unit_{idx}",
                "type": types[idx % len(types)],
                "label": line[:120],
                "weight": round(pyq.marks / max(1, min(5, len(lines))), 1),
            })
    else:
        for idx, u in enumerate(rubric_units):
            if "id" not in u:
                u["id"] = f"unit_{idx}"

    graded_steps = await grader.grade_script(combined_text, rubric_units, grader.settings.ras_threshold)

    total_weight = sum(u.get("weight", 2.0) for u in rubric_units)
    matched_weight = 0.0

    for step in graded_steps:
        u = next((item for item in rubric_units if item.get("id") == step.get("id")), None)
        w = u.get("weight", 2.0) if u else 2.0
        if step.get("matched"):
            matched_weight += w

    ras = round(matched_weight / max(total_weight, 1.0), 4)
    scored_marks = round(ras * total_weight, 2)

    return {
        "pyq_id": pyq.id,
        "subject": pyq.subject,
        "exam_name": pyq.exam_name,
        "scored_marks": scored_marks,
        "total_marks": total_weight,
        "ras": ras,
        "ocr_text": combined_text if file else None,
        "ocr_confidence": ocr_confidence,
        "steps": graded_steps,
        "rubric_units": rubric_units,
    }

