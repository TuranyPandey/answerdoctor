from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Assignment, Classroom, ClassroomStudent, DocumentQuestionBlock, Submission, UploadedDocument, User
from security import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    assignment = db.query(Assignment).filter(Assignment.id == document.assignment_id).first()
    classroom = db.query(Classroom).filter(Classroom.id == assignment.classroom_id).first() if assignment else None
    if current_user.role == "teacher":
        allowed = classroom and classroom.teacher_id == current_user.id
    else:
        enrolled = classroom and db.query(ClassroomStudent).filter(
            ClassroomStudent.classroom_id == classroom.id,
            ClassroomStudent.student_id == current_user.id).first() is not None
        if document.document_type == "answer_sheet":
            submission = db.query(Submission).filter(Submission.id == document.submission_id).first()
            allowed = bool(enrolled and submission and submission.student_id == current_user.id)
        else:
            allowed = bool(enrolled)
    if not allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this document")
    blocks = db.query(DocumentQuestionBlock).filter(
        DocumentQuestionBlock.document_id == document.id).order_by(DocumentQuestionBlock.block_order).all()
    return {
        "document_id": document.id,
        "document_type": document.document_type,
        "assignment_id": document.assignment_id,
        "submission_id": document.submission_id,
        "filename": document.original_filename,
        "raw_text": document.raw_text,
        "extraction_method": document.extraction_method,
        "page_count": document.page_count,
        "confidence": document.confidence,
        "question_blocks": [{
            "id": block.id,
            "question_number": block.question_number,
            "label": block.label,
            "text": block.text,
            "block_order": block.block_order,
        } for block in blocks],
        "created_at": document.created_at,
    }
