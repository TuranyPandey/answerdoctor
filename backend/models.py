from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    register_number = Column(String, nullable=True)
    role = Column(String) # 'teacher' or 'student'
    created_at = Column(DateTime, default=datetime.utcnow)

class Classroom(Base):
    __tablename__ = "classrooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    subject = Column(String)
    code = Column(String, unique=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", foreign_keys=[teacher_id])

class ClassroomStudent(Base):
    __tablename__ = "classroom_students"
    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    student_id = Column(Integer, ForeignKey("users.id"))

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    subject = Column(String)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    answer_key_text = Column(Text)
    total_marks = Column(Float, default=100.0)
    total_scripts = Column(Integer, default=0)
    status = Column(String, default="GRADED") # 'PROCESSING', 'GRADED'
    created_at = Column(DateTime, default=datetime.utcnow)

    rubric_units = relationship("RubricUnit", back_populates="assignment", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")

class RubricUnit(Base):
    __tablename__ = "rubric_units"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    category = Column(String) # 'concept', 'formula', 'intermediate_step', 'units', 'final_answer'
    label = Column(String)
    expected_text = Column(Text)
    weight = Column(Float) # sum of weights = 1.0
    gamma_threshold = Column(Float, default=0.60)

    assignment = relationship("Assignment", back_populates="rubric_units")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    student_name = Column(String)
    register_number = Column(String)
    script_image_url = Column(String, nullable=True)
    total_ras_score = Column(Float, default=0.0) # 0.0 to 100.0
    ocr_confidence = Column(Float, default=0.95)
    is_collusion_flagged = Column(Boolean, default=False)
    submission_time = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("Assignment", back_populates="submissions")
    steps = relationship("SubmissionStep", back_populates="submission", cascade="all, delete-orphan")

class SubmissionStep(Base):
    __tablename__ = "submission_steps"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    step_number = Column(Integer)
    student_text = Column(Text)
    has_diagram = Column(Boolean, default=False)
    diagram_url = Column(String, nullable=True)
    rubric_unit_id = Column(Integer, ForeignKey("rubric_units.id"), nullable=True)
    similarity_score = Column(Float, default=0.0) # gamma value
    status = Column(String) # 'MATCHED', 'WEAK', 'MISSING'
    diagnosis_text = Column(Text, nullable=True)
    retry_status = Column(String, default="NOT_ATTEMPTED") # 'NOT_ATTEMPTED', 'PASSED', 'FAILED'
    retry_attempts = Column(Integer, default=0)

    submission = relationship("Submission", back_populates="steps")

class CollusionPair(Base):
    __tablename__ = "collusion_pairs"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_a_id = Column(Integer)
    student_a_name = Column(String)
    student_a_reg = Column(String)
    student_b_id = Column(Integer)
    student_b_name = Column(String)
    student_b_reg = Column(String)
    cmi_score = Column(Float) # >= 0.88 is flagged
    cos_sim = Column(Float)
    error_match_score = Column(Float)
    flagged_reason = Column(Text)
    status = Column(String, default="FLAGGED") # 'FLAGGED', 'REVIEWED', 'DISMISSED'

class ErrorCluster(Base):
    __tablename__ = "error_clusters"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    cluster_name = Column(String)
    frequency = Column(Integer)
    percentage = Column(Float)
    description = Column(Text)
    affected_students_json = Column(Text) # JSON string list of student names
