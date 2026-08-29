"""End-to-end smoke test for the database-backed prototype."""
import os
import sys
import tempfile
from pathlib import Path


db_file = Path(tempfile.gettempdir()) / "answerdoctor-persistence-smoke.db"
if db_file.exists():
    db_file.unlink()
os.environ["ANSWERDOCTOR_DB_PATH"] = str(db_file)
os.environ["ANSWERDOCTOR_SEED_DEMO"] = "false"
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from database import Base, SessionLocal, engine
from routers.auth import LoginRequest, RegisterRequest, login, register
from routers.classrooms import ClassroomCreate, create_classroom
from routers.assignments import AssignmentCreate, create_assignment
from routers.submissions import CustomSubmissionStepInput, DynamicEvaluateSubmissionRequest, evaluate_custom_submission, get_latest_student_submission
from routers.analytics import get_class_analytics


Base.metadata.create_all(bind=engine)
db = SessionLocal()
teacher = register(RegisterRequest(email="teacher@example.edu", full_name="Test Teacher", role="teacher"), db)
classroom = create_classroom(ClassroomCreate(name="Physics A", subject="Physics", teacher_id=teacher["id"]), db)
assignment = create_assignment(AssignmentCreate(
    title="Motion Test", subject="Physics", classroom_id=classroom.id,
    answer_key_text="State Newton's second law\nF = m * a\nFinal answer: a = F / m", total_marks=10
), db)
student = register(RegisterRequest(
    email="student@example.edu", full_name="Test Student", register_number="TEST001", role="student"
), db)
evaluation = evaluate_custom_submission(DynamicEvaluateSubmissionRequest(
    assignment_id=assignment.id, student_name="Test Student", register_number="TEST001",
    steps=[
        CustomSubmissionStepInput(step_number=1, student_text="Newton's second law relates force and acceleration"),
        CustomSubmissionStepInput(step_number=2, student_text="F = m * a"),
        CustomSubmissionStepInput(step_number=3, student_text="Final answer a = F / m"),
    ]
), db)
latest = get_latest_student_submission(student["id"], db)
assert latest["assignment_title"] == "Motion Test"
assert latest["student_submission_count"] == 1
analytics = get_class_analytics(assignment.id, db)
assert analytics["cohort_total_scripts"] == 1
assert login(LoginRequest(email="teacher@example.edu", role="teacher"), db)["id"] == teacher["id"]
db.close()

engine.dispose()
db_file.unlink(missing_ok=True)
print("Persistent prototype flow passed")
