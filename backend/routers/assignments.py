from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Assignment, Classroom, ClassroomStudent, DocumentQuestionBlock, RubricUnit, Submission, UploadedDocument, User
from security import get_current_user
from services.document_ingestion import extract_pdf_text, split_question_blocks
from services.rubric_decomposer import decompose_answer_key

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

class AssignmentCreate(BaseModel):
    title: str
    subject: str
    classroom_id: int
    answer_key_text: str
    total_marks: float = 100.0

def assert_class_access(classroom_id: int, current_user: User, db: Session, teacher_only=False):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found.")
    if current_user.role == "teacher":
        allowed = classroom.teacher_id == current_user.id
    else:
        allowed = not teacher_only and db.query(ClassroomStudent).filter(
            ClassroomStudent.classroom_id == classroom_id, ClassroomStudent.student_id == current_user.id).first() is not None
    if not allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this class.")
    return classroom

def assignment_summary(assignment: Assignment, db: Session):
    guide = db.query(UploadedDocument).filter(
        UploadedDocument.assignment_id == assignment.id, UploadedDocument.document_type == "marking_guide").order_by(UploadedDocument.id.desc()).first()
    return {
        "id": assignment.id, "title": assignment.title, "subject": assignment.subject,
        "classroom_id": assignment.classroom_id, "total_marks": assignment.total_marks,
        "total_scripts": db.query(Submission).filter(Submission.assignment_id == assignment.id).count(),
        "units_count": db.query(RubricUnit).filter(RubricUnit.assignment_id == assignment.id).count(),
        "status": assignment.status, "marking_guide_document_id": guide.id if guide else None,
        "created_at": assignment.created_at,
    }

def _create_question_rubric(assignment: Assignment, blocks: list[dict], db: Session):
    unit_weight = 1.0 / len(blocks)
    for index, block in enumerate(blocks):
        weight = round(unit_weight, 6)
        if index == len(blocks) - 1:
            weight = round(1.0 - sum(round(unit_weight, 6) for _ in blocks[:-1]), 6)
        db.add(RubricUnit(assignment_id=assignment.id, category="question", label=block["label"],
            expected_text=block["text"], weight=weight, gamma_threshold=0.60))

def _save_guide(assignment, current_user, file, extracted, blocks, db):
    document = UploadedDocument(document_type="marking_guide", assignment_id=assignment.id,
        uploaded_by_id=current_user.id, original_filename=file.filename or "marking-guide.pdf",
        mime_type="application/pdf", raw_text=extracted.text, extraction_method=extracted.extraction_method,
        page_count=extracted.page_count, confidence=extracted.confidence)
    db.add(document)
    db.flush()
    for block in blocks:
        db.add(DocumentQuestionBlock(document_id=document.id, **block))
    return document

@router.get("")
def list_assignments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "teacher":
        assignments = db.query(Assignment).join(Classroom).filter(Classroom.teacher_id == current_user.id).order_by(Assignment.created_at.desc()).all()
    else:
        assignments = (db.query(Assignment).join(ClassroomStudent, ClassroomStudent.classroom_id == Assignment.classroom_id)
            .filter(ClassroomStudent.student_id == current_user.id).order_by(Assignment.created_at.desc()).all())
    return [assignment_summary(assignment, db) for assignment in assignments]

@router.get("/classroom/{classroom_id}")
def list_classroom_assignments(classroom_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_class_access(classroom_id, current_user, db)
    assignments = db.query(Assignment).filter(Assignment.classroom_id == classroom_id).order_by(Assignment.created_at.desc()).all()
    return [assignment_summary(assignment, db) for assignment in assignments]

@router.get("/{assignment_id}")
def get_assignment_details(assignment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    assert_class_access(assignment.classroom_id, current_user, db)
    units = db.query(RubricUnit).filter(RubricUnit.assignment_id == assignment_id).order_by(RubricUnit.id).all()
    guide = db.query(UploadedDocument).filter(UploadedDocument.assignment_id == assignment.id,
        UploadedDocument.document_type == "marking_guide").order_by(UploadedDocument.id.desc()).first()
    return {**assignment_summary(assignment, db), "answer_key_text": assignment.answer_key_text,
        "marking_guide": {"document_id": guide.id, "filename": guide.original_filename,
            "extraction_method": guide.extraction_method, "confidence": guide.confidence,
            "page_count": guide.page_count} if guide else None,
        "rubric_units": [{"id": u.id, "category": u.category, "label": u.label,
            "expected_text": u.expected_text, "weight": u.weight, "gamma_threshold": u.gamma_threshold} for u in units]}

@router.post("/create", status_code=201)
def create_assignment(req: AssignmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_class_access(req.classroom_id, current_user, db, teacher_only=True)
    try:
        units = decompose_answer_key(req.answer_key_text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    assignment = Assignment(title=req.title.strip(), subject=req.subject.strip(), classroom_id=req.classroom_id,
        answer_key_text=req.answer_key_text.strip(), total_marks=req.total_marks, status="GRADED")
    db.add(assignment)
    db.flush()
    for unit in units:
        db.add(RubricUnit(assignment_id=assignment.id, **unit))
    db.commit()
    db.refresh(assignment)
    return assignment_summary(assignment, db)

@router.post("/upload-guide", status_code=201)
async def upload_marking_guide(title: str = Form(...), subject: str = Form(...), classroom_id: int = Form(...),
    total_marks: float = Form(100.0), file: UploadFile = File(...), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    assert_class_access(classroom_id, current_user, db, teacher_only=True)
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Upload a PDF marking guide.")
    try:
        extracted = extract_pdf_text(await file.read())
        blocks = split_question_blocks(extracted.text)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    assignment = Assignment(title=title.strip(), subject=subject.strip(), classroom_id=classroom_id,
        answer_key_text=extracted.text, total_marks=total_marks, status="GRADED")
    db.add(assignment)
    db.flush()
    _create_question_rubric(assignment, blocks, db)
    document = _save_guide(assignment, current_user, file, extracted, blocks, db)
    db.commit()
    db.refresh(assignment)
    response = assignment_summary(assignment, db)
    response.update({"marking_guide_document_id": document.id, "extraction_method": extracted.extraction_method,
        "ocr_confidence": extracted.confidence, "questions_detected": [block["label"] for block in blocks]})
    return response
