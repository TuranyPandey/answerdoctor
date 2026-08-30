from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RubricUnit, SubmissionStep, Submission, Assignment
from services.seed_data import seed_thermodynamics_demo
import os

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/assignment/{assignment_id}")
def get_class_analytics(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Assignment not found")
    rubric_units = db.query(RubricUnit).filter(RubricUnit.assignment_id == assignment_id).all()
    submissions = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    cohort_size = len(submissions)
    
    # Compute weakness heatmap per rubric unit
    heatmap = []
    for ru in rubric_units:
        steps = db.query(SubmissionStep).filter(SubmissionStep.rubric_unit_id == ru.id).all()
        matched = sum(1 for s in steps if s.status == "MATCHED")
        weak = sum(1 for s in steps if s.status == "WEAK")
        missing = sum(1 for s in steps if s.status == "MISSING")
        total = len(steps)
        pass_rate = round((matched / total) * 100, 1) if total else 0.0

        heatmap.append({
            "rubric_unit_id": ru.id,
            "category": ru.category,
            "label": ru.label,
            "matched_count": matched,
            "weak_count": weak,
            "missing_count": missing,
            "pass_rate_pct": pass_rate,
            "weakness_level": "CRITICAL" if pass_rate < 50 else ("MODERATE" if pass_rate < 75 else "LOW")
        })

    clusters_data = []
    for item in heatmap:
        frequency = item["weak_count"] + item["missing_count"]
        if frequency:
            clusters_data.append({
                "id": item["rubric_unit_id"],
                "cluster_name": f"Difficulty with {item['label']}",
                "frequency": frequency,
                "percentage": round((frequency / cohort_size) * 100, 1) if cohort_size else 0.0,
                "description": "Answers that were weak or missing for this marking-guide step."
            })

    scores = [s.total_ras_score for s in submissions]
    distribution = {
        "distinction": sum(score >= 80 for score in scores),
        "average": sum(60 <= score < 80 for score in scores),
        "weak": sum(score < 60 for score in scores),
    }

    return {
        "assignment_id": assignment_id,
        "assignment_title": assignment.title,
        "cohort_total_scripts": cohort_size,
        "class_average_ras": round(sum(scores) / cohort_size, 1) if cohort_size else 0.0,
        "score_distribution": distribution,
        "weakness_heatmap": heatmap,
        "error_clusters": clusters_data,
        "alternative_solutions": []
    }

@router.post("/seed-demo")
def trigger_seed_demo():
    """
    One-click reset and seeding of the Mechanical Engineering Thermodynamics CAT Demo data.
    """
    if os.getenv("ALLOW_DEMO_RESET", "false").lower() != "true":
        raise HTTPException(status_code=404, detail="Demo reset is disabled")
    seed_thermodynamics_demo()
    return {"message": "Optional synthetic Thermodynamics sample data loaded."}
