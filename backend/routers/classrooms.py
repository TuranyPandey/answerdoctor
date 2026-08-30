import random
import string

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Classroom, ClassroomStudent, User
from security import get_current_user

router = APIRouter(prefix="/api/classrooms", tags=["Classrooms"])

class ClassroomCreate(BaseModel):
    name: str
    subject: str

class JoinClassroom(BaseModel):
    code: str

def _classroom_response(classroom: Classroom, db: Session):
    return {
        "id": classroom.id, "name": classroom.name, "subject": classroom.subject,
        "code": classroom.code,
        "teacher_name": classroom.teacher.full_name if classroom.teacher else "Instructor",
        "student_count": db.query(ClassroomStudent).filter(ClassroomStudent.classroom_id == classroom.id).count(),
        "created_at": classroom.created_at,
    }

def _unique_code(db: Session) -> str:
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "".join(random.choices(alphabet, k=6))
        if not db.query(Classroom).filter(Classroom.code == code).first():
            return code
    raise HTTPException(status_code=503, detail="Could not generate a unique class code.")

@router.get("")
def get_classrooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "teacher":
        classrooms = db.query(Classroom).filter(Classroom.teacher_id == current_user.id).order_by(Classroom.created_at.desc()).all()
    else:
        classrooms = (db.query(Classroom).join(ClassroomStudent, ClassroomStudent.classroom_id == Classroom.id)
            .filter(ClassroomStudent.student_id == current_user.id).order_by(Classroom.created_at.desc()).all())
    return [_classroom_response(classroom, db) for classroom in classrooms]

@router.post("/create", status_code=201)
def create_classroom(req: ClassroomCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create classes.")
    name, subject = req.name.strip(), req.subject.strip()
    if not name or not subject:
        raise HTTPException(status_code=400, detail="Class name and subject are required.")
    classroom = Classroom(name=name, subject=subject, code=_unique_code(db), teacher_id=current_user.id)
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return _classroom_response(classroom, db)

@router.post("/join")
def join_classroom(req: JoinClassroom, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only student accounts can join classes.")
    classroom = db.query(Classroom).filter(Classroom.code == req.code.strip().upper()).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid class code.")
    existing = db.query(ClassroomStudent).filter(
        ClassroomStudent.classroom_id == classroom.id, ClassroomStudent.student_id == current_user.id).first()
    if not existing:
        db.add(ClassroomStudent(classroom_id=classroom.id, student_id=current_user.id))
        db.commit()
    return {"message": "Successfully joined class.", "classroom": _classroom_response(classroom, db)}

@router.get("/{classroom_id}/students")
def list_classroom_students(classroom_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Class not found.")
    if current_user.role != "teacher" or classroom.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only this class's teacher can view its roster.")
    students = (db.query(User).join(ClassroomStudent, ClassroomStudent.student_id == User.id)
        .filter(ClassroomStudent.classroom_id == classroom_id).order_by(User.full_name).all())
    return [{"id": s.id, "full_name": s.full_name, "email": s.email, "register_number": s.register_number} for s in students]
