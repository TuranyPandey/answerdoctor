import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from database import Base

def gen_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id            = Column(String, primary_key=True, default=gen_id)
    email         = Column(String, unique=True, nullable=False, index=True)
    name          = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)   # null for Google-only users
    google_id     = Column(String, nullable=True, unique=True)
    role          = Column(SAEnum("teacher", "student", name="role_enum"), nullable=False)
    avatar_url    = Column(String, nullable=True)
    is_verified   = Column(Boolean, default=False)
    verification_status = Column(String, default="Standard Account")
    institution   = Column(String, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    taught_classes  = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    enrollments     = relationship("Enrollment", back_populates="student")
    scripts         = relationship("Script", back_populates="student")


class Class(Base):
    __tablename__ = "classes"
    id          = Column(String, primary_key=True, default=gen_id)
    name        = Column(String, nullable=False)
    subject     = Column(String, nullable=False)
    join_code   = Column(String, unique=True, nullable=False, index=True)
    teacher_id  = Column(String, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    teacher     = relationship("User", back_populates="taught_classes", foreign_keys=[teacher_id])
    enrollments = relationship("Enrollment", back_populates="class_", cascade="all, delete-orphan")
    rubric_units = relationship("RubricUnit", back_populates="class_", cascade="all, delete-orphan", order_by="RubricUnit.order")
    scripts     = relationship("Script", back_populates="class_")
    assignments = relationship("Assignment", back_populates="class_", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id         = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    class_id   = Column(String, ForeignKey("classes.id"), nullable=False)
    joined_at  = Column(DateTime, default=datetime.utcnow)

    student    = relationship("User", back_populates="enrollments")
    class_     = relationship("Class", back_populates="enrollments")


class RubricUnit(Base):
    __tablename__ = "rubric_units"
    id       = Column(String, primary_key=True, default=gen_id)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    type     = Column(SAEnum("Concept", "Formula", "Step", "Transformation", "Result", name="rubric_type_enum"), nullable=False)
    label    = Column(String, nullable=False)
    weight   = Column(Float, default=1.0)
    order    = Column(Integer, default=0)

    class_   = relationship("Class", back_populates="rubric_units")
    grading_steps = relationship("GradingStep", back_populates="rubric_unit")


class Script(Base):
    __tablename__ = "scripts"
    id             = Column(String, primary_key=True, default=gen_id)
    student_id     = Column(String, ForeignKey("users.id"), nullable=False)
    class_id       = Column(String, ForeignKey("classes.id"), nullable=False)
    exam_name      = Column(String, nullable=False)
    file_path      = Column(String, nullable=True)
    ocr_text       = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    low_confidence = Column(Boolean, default=False)
    total_marks    = Column(Float, nullable=True)
    scored_marks   = Column(Float, nullable=True)
    ras            = Column(Float, nullable=True)
    cvr            = Column(Float, nullable=True) # Concept Verification Rate (0-1)
    clarity_score  = Column(Float, nullable=True) # Image & OCR legibility (0-100)
    overall_correctness = Column(String, nullable=True) # "Fully Correct" | "Partially Correct" | "Incorrect"
    overall_feedback = Column(Text, nullable=True)     # Holistic AI feedback on entire paper
    status         = Column(SAEnum("pending", "ocr", "grading", "done", "error", name="script_status_enum"), default="pending")
    error_message  = Column(String, nullable=True)
    uploaded_at    = Column(DateTime, default=datetime.utcnow)

    student        = relationship("User", back_populates="scripts")
    class_         = relationship("Class", back_populates="scripts")
    grading_steps  = relationship("GradingStep", back_populates="script", cascade="all, delete-orphan")
    collusion_a    = relationship("CollusionFlag", foreign_keys="CollusionFlag.script_a_id", back_populates="script_a")
    collusion_b    = relationship("CollusionFlag", foreign_keys="CollusionFlag.script_b_id", back_populates="script_b")


class GradingStep(Base):
    __tablename__ = "grading_steps"
    id            = Column(String, primary_key=True, default=gen_id)
    script_id     = Column(String, ForeignKey("scripts.id"), nullable=False)
    rubric_unit_id = Column(String, ForeignKey("rubric_units.id"), nullable=False)
    matched       = Column(Boolean, nullable=False)
    student_text  = Column(Text, nullable=True)
    similarity    = Column(Float, nullable=True)
    feedback      = Column(Text, nullable=True)
    marks_status  = Column(String, nullable=True) # "Full Marks" | "Partial Marks" | "No Marks"
    confidence_score = Column(Float, default=0.90) # Step alignment confidence (0-1)

    script        = relationship("Script", back_populates="grading_steps")
    rubric_unit   = relationship("RubricUnit", back_populates="grading_steps")


class CollusionFlag(Base):
    __tablename__ = "collusion_flags"
    id            = Column(String, primary_key=True, default=gen_id)
    class_id      = Column(String, ForeignKey("classes.id"), nullable=False)
    script_a_id   = Column(String, ForeignKey("scripts.id"), nullable=False)
    script_b_id   = Column(String, ForeignKey("scripts.id"), nullable=False)
    cmi_score     = Column(Float, nullable=False)
    shared_errors = Column(Text, nullable=True)   # JSON string
    matched_phrases = Column(Text, nullable=True) # JSON string
    status        = Column(SAEnum("pending_review", "cleared", "confirmed", name="collusion_status_enum"), default="pending_review")
    created_at    = Column(DateTime, default=datetime.utcnow)

    script_a      = relationship("Script", foreign_keys=[script_a_id], back_populates="collusion_a")
    script_b      = relationship("Script", foreign_keys=[script_b_id], back_populates="collusion_b")


class PYQ(Base):
    __tablename__ = "pyq_bank"
    id            = Column(String, primary_key=True, default=gen_id)
    subject       = Column(String, nullable=False, index=True)
    exam_name     = Column(String, nullable=False)
    year          = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    sample_solution = Column(Text, nullable=True)
    rubric_json   = Column(Text, nullable=True)
    marks         = Column(Float, default=10.0)
    created_at    = Column(DateTime, default=datetime.utcnow)


class Assignment(Base):
    __tablename__ = "assignments"
    id          = Column(String, primary_key=True, default=gen_id)
    class_id    = Column(String, ForeignKey("classes.id"), nullable=False)
    teacher_id  = Column(String, ForeignKey("users.id"), nullable=False)
    title       = Column(String, nullable=False)
    exam_name   = Column(String, nullable=False)
    instructions= Column(Text, nullable=True)
    total_marks = Column(Float, default=10.0)
    due_date    = Column(String, nullable=True)
    file_path   = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    class_      = relationship("Class", back_populates="assignments")
    teacher     = relationship("User")


class Guild(Base):
    __tablename__ = "guilds"
    id          = Column(String, primary_key=True, default=gen_id)
    name        = Column(String, nullable=False, unique=True)
    domain      = Column(String, nullable=False, index=True)
    code        = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon_badge  = Column(String, default="🏛️")
    created_at  = Column(DateTime, default=datetime.utcnow)

    members     = relationship("GuildMember", back_populates="guild", cascade="all, delete-orphan")


class GuildMember(Base):
    __tablename__ = "guild_members"
    id         = Column(String, primary_key=True, default=gen_id)
    guild_id   = Column(String, ForeignKey("guilds.id"), nullable=False)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    joined_at  = Column(DateTime, default=datetime.utcnow)

    guild      = relationship("Guild", back_populates="members")
    user       = relationship("User")


class MarketplaceRubric(Base):
    __tablename__ = "marketplace_rubrics"
    id            = Column(String, primary_key=True, default=gen_id)
    title         = Column(String, nullable=False)
    subject       = Column(String, nullable=False, index=True)
    author_id     = Column(String, ForeignKey("users.id"), nullable=False)
    author_name   = Column(String, nullable=False)
    institution   = Column(String, nullable=True)
    description   = Column(Text, nullable=True)
    rubric_json   = Column(Text, nullable=False) # JSON array of units
    downloads     = Column(Integer, default=0)
    rating        = Column(Float, default=4.9)
    created_at    = Column(DateTime, default=datetime.utcnow)

    author        = relationship("User")




