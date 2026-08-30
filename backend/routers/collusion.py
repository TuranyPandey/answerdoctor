from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
from services import collusion
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/collusion", tags=["collusion"])


@router.get("/scan/{class_id}", response_model=list[schemas.CollusionOut])
@router.post("/scan/{class_id}", response_model=list[schemas.CollusionOut])
async def trigger_collusion_scan(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    scripts = db.query(models.Script).filter(
        models.Script.class_id == class_id,
        models.Script.status == "done"
    ).all()

    prepared = []
    for s in scripts:
        steps = db.query(models.GradingStep).filter(models.GradingStep.script_id == s.id).all()
        feedbacks = [st.feedback for st in steps if st.feedback]
        prepared.append({
            "script_id": s.id,
            "ocr_text": s.ocr_text or "",
            "feedbacks": feedbacks
        })

    flags = await collusion.detect_collusion(prepared, settings.cmi_threshold)

    saved_flags = []
    for f in flags:
        # Check if pair already flagged
        existing = db.query(models.CollusionFlag).filter(
            models.CollusionFlag.class_id == class_id,
            models.CollusionFlag.script_a_id == f["script_a_id"],
            models.CollusionFlag.script_b_id == f["script_b_id"]
        ).first()
        if not existing:
            cflag = models.CollusionFlag(
                class_id=class_id,
                script_a_id=f["script_a_id"],
                script_b_id=f["script_b_id"],
                cmi_score=f["cmi_score"],
                shared_errors=f["shared_errors"],
                matched_phrases=f["matched_phrases"],
                status="pending_review"
            )
            db.add(cflag)
            saved_flags.append(cflag)

    db.commit()
    for sf in saved_flags:
        db.refresh(sf)

    all_flags = db.query(models.CollusionFlag).filter(models.CollusionFlag.class_id == class_id).all()
    return [_format_flag(f, db) for f in all_flags]


@router.get("/{class_id}", response_model=list[schemas.CollusionOut])
def get_collusion_flags(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    flags = db.query(models.CollusionFlag).filter(models.CollusionFlag.class_id == class_id).all()
    return [_format_flag(f, db) for f in flags]


@router.patch("/{flag_id}", response_model=schemas.CollusionOut)
def update_flag_status(
    flag_id: str,
    body: schemas.CollusionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    flag = db.query(models.CollusionFlag).filter(models.CollusionFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(404, "Flag not found")
    flag.status = body.status
    db.commit()
    db.refresh(flag)
    return _format_flag(flag, db)


def _format_flag(flag: models.CollusionFlag, db: Session) -> schemas.CollusionOut:
    sa = db.query(models.Script).filter(models.Script.id == flag.script_a_id).first()
    sb = db.query(models.Script).filter(models.Script.id == flag.script_b_id).first()

    def detail(s):
        if not s: return None
        steps = db.query(models.GradingStep).filter(models.GradingStep.script_id == s.id).all()
        out = schemas.ScriptDetailOut.model_validate(s)
        out.steps = [schemas.GradingStepOut.model_validate(st) for st in steps]
        out.student = schemas.UserOut.model_validate(s.student) if s.student else None
        return out

    out = schemas.CollusionOut.model_validate(flag)
    out.script_a = detail(sa)
    out.script_b = detail(sb)
    return out
