from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Classroom, ClassroomStudent, User
from pydantic import BaseModel
import random
import string

router = APIRouter(prefix="/api/classrooms", tags=["Classrooms"])

class ClassroomCreate(BaseModel):
    name: str
    subject: str
    teacher_id: int

class JoinClassroom(BaseModel):
    code: str
    student_id: int

@router.get("/")
def get_classrooms(teacher_id: int = None, student_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Classroom)
    if teacher_id:
        query = query.filter(Classroom.teacher_id == teacher_id)
    if student_id:
        joined_ids = [cs.classroom_id for cs in db.query(ClassroomStudent).filter(ClassroomStudent.student_id == student_id).all()]
        query = query.filter(Classroom.id.in_(joined_ids))
    
    classrooms = query.all()
    result = []
    for c in classrooms:
        student_count = db.query(ClassroomStudent).filter(ClassroomStudent.classroom_id == c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "subject": c.subject,
            "code": c.code,
            "teacher_name": c.teacher.full_name if c.teacher else "Instructor",
            "student_count": student_count,
            "created_at": c.created_at
        })
    return result

@router.post("/create")
def create_classroom(req: ClassroomCreate, db: Session = Depends(get_db)):
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    cls = Classroom(
        name=req.name,
        subject=req.subject,
        code=code,
        teacher_id=req.teacher_id
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls

@router.post("/join")
def join_classroom(req: JoinClassroom, db: Session = Depends(get_db)):
    cls = db.query(Classroom).filter(Classroom.code == req.code.upper()).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Invalid classroom code")
    
    existing = db.query(ClassroomStudent).filter(
        ClassroomStudent.classroom_id == cls.id,
        ClassroomStudent.student_id == req.student_id
    ).first()
    if not existing:
        db.add(ClassroomStudent(classroom_id=cls.id, student_id=req.student_id))
        db.commit()
    return {"message": "Successfully joined classroom", "classroom": cls}
