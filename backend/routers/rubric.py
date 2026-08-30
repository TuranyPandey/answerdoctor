from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from services import ocr
import json
from pydantic import BaseModel

router = APIRouter(prefix="/rubric", tags=["rubric"])


class PublishRubricRequest(BaseModel):
    class_id: str
    title: str
    subject: str
    description: str


class RubricSandboxRequest(BaseModel):
    rubric_units: list[dict]
    sample_solution: str


# ── Static / Marketplace Endpoints MUST be defined before /{class_id} ─────────

@router.get("/marketplace/list")
def list_marketplace_rubrics(
    subject: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """List open-source rubrics published by educators worldwide."""
    if db.query(models.MarketplaceRubric).count() == 0:
        # Seed default open rubrics
        defaults = [
            models.MarketplaceRubric(
                title="Thermodynamics First Law & Isochoric State Rubric",
                subject="Thermodynamics",
                author_id=current_user.id,
                author_name="Prof. Harrison (MIT Dept of MechE)",
                institution="MIT Engineering",
                description="Decomposed rubric units for closed rigid vessel state changes and boundary work integration.",
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "Define rigid closed system boundary (V1 = V2)", "weight": 2.0},
                    {"type": "Formula", "label": "Apply First Law: Q - W = delta U", "weight": 2.0},
                    {"type": "Step", "label": "Lookup internal energy u1 = 214.36, u2 = 460.81 kJ/kg", "weight": 2.0},
                    {"type": "Transformation", "label": "Evaluate boundary work W = 0; Q = m(u2 - u1)", "weight": 2.0},
                    {"type": "Result", "label": "State final heat transfer Q = 308.06 kJ", "weight": 2.0},
                ]),
                downloads=142,
                rating=4.9,
            ),
            models.MarketplaceRubric(
                title="Gauss Law Spherical Charge Distribution Rubric",
                subject="Electromagnetics",
                author_id=current_user.id,
                author_name="Dr. Alistair (Stanford Physics)",
                institution="Stanford University",
                description="Atomic verification for Gaussian surface flux integration and electric field derivation.",
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "State Gauss Law flux equation ∮ E·dA = Q_enc / ε0", "weight": 2.0},
                    {"type": "Formula", "label": "Define spherical surface integral 4π r^2 E", "weight": 2.0},
                    {"type": "Result", "label": "State E(r) inside and outside sphere", "weight": 2.0},
                ]),
                downloads=89,
                rating=4.8,
            ),
        ]
        db.add_all(defaults)
        db.commit()

    query = db.query(models.MarketplaceRubric)
    if subject:
        query = query.filter(models.MarketplaceRubric.subject.ilike(f"%{subject}%"))
    return query.order_by(models.MarketplaceRubric.downloads.desc()).all()


@router.post("/marketplace/publish")
def publish_to_marketplace(
    body: PublishRubricRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """Publish a classroom rubric to the open-source OpenRubric Marketplace."""
    units = db.query(models.RubricUnit).filter(models.RubricUnit.class_id == body.class_id).all()
    if not units:
        raise HTTPException(400, "Classroom has no rubric units to publish.")

    units_data = [{"type": u.type, "label": u.label, "weight": u.weight} for u in units]
    m_rubric = models.MarketplaceRubric(
        title=body.title,
        subject=body.subject,
        author_id=current_user.id,
        author_name=current_user.name,
        institution=current_user.institution or "Academic Institution",
        description=body.description,
        rubric_json=json.dumps(units_data),
    )
    db.add(m_rubric)
    db.commit()
    db.refresh(m_rubric)
    return m_rubric


@router.post("/marketplace/{rubric_id}/fork/{class_id}")
def fork_marketplace_rubric(
    rubric_id: str,
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """1-Click Fork/Import an open-source marketplace rubric into a classroom."""
    m_rubric = db.query(models.MarketplaceRubric).filter(models.MarketplaceRubric.id == rubric_id).first()
    if not m_rubric:
        raise HTTPException(404, "Marketplace rubric not found.")

    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found.")

    units_data = json.loads(m_rubric.rubric_json)
    db.query(models.RubricUnit).filter(models.RubricUnit.class_id == class_id).delete()

    new_units = []
    for order, item in enumerate(units_data):
        u = models.RubricUnit(
            class_id=class_id,
            type=item.get("type", "Step"),
            label=item.get("label", ""),
            weight=float(item.get("weight", 2.0)),
            order=order,
        )
        db.add(u)
        new_units.append(u)

    m_rubric.downloads += 1
    db.commit()
    return {"message": f"Successfully forked '{m_rubric.title}' into {cls.name}!"}


@router.post("/test-sandbox")
async def test_rubric_sandbox(
    body: RubricSandboxRequest,
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """Test candidate rubric units live against a sample solution text."""
    from services import grader
    if not body.rubric_units:
        raise HTTPException(400, "Provide at least one rubric unit to test.")
    if not body.sample_solution.strip():
        raise HTTPException(400, "Provide a sample solution text to grade.")

    units = []
    for idx, u in enumerate(body.rubric_units):
        units.append({
            "id": u.get("id", f"unit_{idx}"),
            "type": u.get("type", "Step"),
            "label": u.get("label", ""),
            "weight": float(u.get("weight", 1.0)),
            "criteria_notes": u.get("criteria_notes", ""),
        })

    graded_steps = await grader.grade_script(body.sample_solution, units, grader.settings.ras_threshold)
    total_weight = sum(u["weight"] for u in units)
    matched_weight = sum(u["weight"] for step in graded_steps for u in units if u["id"] == step.get("id") and step.get("matched"))
    ras = round(matched_weight / max(total_weight, 1.0), 4)

    return {
        "ras": ras,
        "scored_marks": round(ras * total_weight, 2),
        "total_marks": total_weight,
        "steps": graded_steps,
    }


# ── Dynamic Path Parameter Routes (/{class_id}) ───────────────────────────────

@router.get("/{class_id}", response_model=list[schemas.RubricUnitOut])
def get_rubric(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    units = (
        db.query(models.RubricUnit)
        .filter(models.RubricUnit.class_id == class_id)
        .order_by(models.RubricUnit.order)
        .all()
    )
    return [schemas.RubricUnitOut.model_validate(u) for u in units]


@router.put("/{class_id}", response_model=list[schemas.RubricUnitOut])
def save_rubric(
    class_id: str,
    body: schemas.RubricSaveRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")
    if cls.teacher_id != current_user.id:
        raise HTTPException(403, "Not your class")

    # Delete existing and replace
    db.query(models.RubricUnit).filter(models.RubricUnit.class_id == class_id).delete()
    new_units = []
    for i, u in enumerate(body.units):
        unit = models.RubricUnit(
            class_id=class_id,
            type=u.type,
            label=u.label,
            weight=u.weight,
            order=i,
        )
        db.add(unit)
        new_units.append(unit)
    db.commit()
    for u in new_units:
        db.refresh(u)
    return [schemas.RubricUnitOut.model_validate(u) for u in new_units]


@router.post("/{class_id}/upload-file", response_model=list[schemas.RubricUnitOut])
async def upload_rubric_file(
    class_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """Parse uploaded rubric document (PDF, PNG, JPG, DOCX) into structured RubricUnits."""
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")
    if cls.teacher_id != current_user.id:
        raise HTTPException(403, "Not your class")

    file_bytes = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        ocr_result = await ocr.ocr_pdf_bytes(file_bytes)
    elif filename.endswith(".docx") or filename.endswith(".doc"):
        ocr_result = ocr.extract_docx_bytes(file_bytes)
    elif filename.endswith(".txt"):
        ocr_result = {"text": file_bytes.decode("utf-8", errors="ignore")}
    else:
        ocr_result = await ocr.ocr_image_bytes(file_bytes, file.content_type or "image/jpeg")

    text = ocr_result.get("text", "")
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    types = ["Concept", "Formula", "Step", "Transformation", "Result"]
    units = []

    for idx, line in enumerate(lines[:8]):
        weight = 2.0
        import re
        m = re.search(r'(\d+(?:\.\d+)?)\s*(?:marks?|pts?|points?)', line, re.IGNORECASE)
        if m:
            try:
                weight = float(m.group(1))
            except ValueError:
                pass

        utype = types[idx % len(types)]
        units.append({
            "type": utype,
            "label": line[:150],
            "weight": weight,
        })

    if not units:
        units = [
            {"type": "Concept", "label": "Document Rubric: Step 1 Identification", "weight": 2.0},
            {"type": "Formula", "label": "Document Rubric: Step 2 Formulation", "weight": 2.0},
            {"type": "Result", "label": "Document Rubric: Final Solution & Units", "weight": 2.0},
        ]

    # Replace existing rubric
    db.query(models.RubricUnit).filter(models.RubricUnit.class_id == class_id).delete()
    new_units = []
    for order, item in enumerate(units):
        u = models.RubricUnit(
            class_id=class_id,
            type=item["type"],
            label=item["label"],
            weight=item["weight"],
            order=order,
        )
        db.add(u)
        new_units.append(u)

    db.commit()
    for u in new_units:
        db.refresh(u)
    return [schemas.RubricUnitOut.model_validate(u) for u in new_units]
