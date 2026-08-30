"""Exercise embedded-text and OCR PDF uploads against an isolated database."""
import asyncio
import io
import os
import sys
import tempfile
from pathlib import Path

import pymupdf
from starlette.datastructures import Headers, UploadFile


db_file = Path(tempfile.gettempdir()) / "answerdoctor-document-upload-smoke.db"
db_file.unlink(missing_ok=True)
os.environ["ANSWERDOCTOR_DB_PATH"] = str(db_file)
os.environ["ANSWERDOCTOR_SEED_DEMO"] = "false"
os.environ["AUTH_SECRET"] = "document-upload-smoke-secret-at-least-32-bytes"
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from database import Base, SessionLocal, engine
from models import User
from routers.assignments import upload_marking_guide
from routers.auth import RegisterRequest, register
from routers.classrooms import ClassroomCreate, JoinClassroom, create_classroom, join_classroom
from routers.documents import get_document
from routers.submissions import upload_answer_sheet


def pdf_with_embedded_text(lines: list[str]) -> bytes:
    document = pymupdf.open()
    page = document.new_page(width=612, height=792)
    for index, line in enumerate(lines):
        page.insert_text((54, 72 + index * 42), line, fontsize=24)
    content = document.tobytes()
    document.close()
    return content


def image_only_pdf(lines: list[str]) -> bytes:
    source = pymupdf.open()
    page = source.new_page(width=612, height=792)
    for index, line in enumerate(lines):
        page.insert_text((54, 72 + index * 52), line, fontsize=30)
    image = page.get_pixmap(dpi=180, alpha=False).tobytes("png")
    source.close()

    scanned = pymupdf.open()
    scanned_page = scanned.new_page(width=612, height=792)
    scanned_page.insert_image(scanned_page.rect, stream=image)
    content = scanned.tobytes()
    scanned.close()
    return content


def pdf_upload(filename: str, content: bytes) -> UploadFile:
    return UploadFile(
        file=io.BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": "application/pdf"}),
    )


async def run_flow():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        teacher_auth = register(RegisterRequest(
            email="pdf-teacher@example.edu", full_name="PDF Teacher",
            password="teacher-pass-123", role="teacher",
        ), db)
        teacher = db.get(User, teacher_auth["id"])
        classroom = create_classroom(
            ClassroomCreate(name="OCR Lab", subject="Physics"), db, teacher,
        )
        student_auth = register(RegisterRequest(
            email="pdf-student@example.edu", full_name="PDF Student",
            password="student-pass-123", register_number="OCR001", role="student",
        ), db)
        student = db.get(User, student_auth["id"])
        join_classroom(JoinClassroom(code=classroom["code"]), db, student)

        guide = await upload_marking_guide(
            title="PDF Exam", subject="Physics", classroom_id=classroom["id"],
            total_marks=20.0,
            file=pdf_upload("guide.pdf", pdf_with_embedded_text([
                "Q1. State Newton's second law and define force.",
                "Q2. Calculate acceleration using F = m a.",
            ])),
            db=db, current_user=teacher,
        )
        assert guide["extraction_method"] == "embedded_text"
        assert guide["questions_detected"] == ["Q1", "Q2"]

        answer = await upload_answer_sheet(
            assignment_id=guide["id"],
            file=pdf_upload("scan.pdf", image_only_pdf([
                "Q1. Force equals mass times acceleration.",
                "Q2. Acceleration equals force divided by mass.",
            ])),
            student_name=student.full_name,
            register_number=student.register_number,
            db=db, current_user=teacher,
        )
        assert answer["extraction_method"] == "ocr"
        assert answer["ocr_confidence"] > 0
        assert answer["questions_detected"] == ["Q1", "Q2"]

        document = get_document(answer["answer_document_id"], db, student)
        assert document["document_type"] == "answer_sheet"
        assert len(document["question_blocks"]) == 2
        print(
            "PDF upload flow passed: embedded guide + OCR answer sheet "
            f"(confidence {answer['ocr_confidence']:.4f})"
        )
    finally:
        db.close()
        engine.dispose()
        db_file.unlink(missing_ok=True)


if __name__ == "__main__":
    asyncio.run(run_flow())
