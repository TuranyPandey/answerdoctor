from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    id_token: str
    role: str  # "teacher" | "student"

class EmailAuthRequest(BaseModel):
    email: str
    password: Optional[str] = "password"
    name: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "teacher"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

# ── User ──────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar_url: Optional[str] = None
    is_verified: bool = False
    verification_status: Optional[str] = "Standard Account"
    institution: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ── Class ─────────────────────────────────────────────────────────────
class ClassCreate(BaseModel):
    name: str
    subject: str

class ClassOut(BaseModel):
    id: str
    name: str
    subject: str
    join_code: str
    teacher_id: str
    created_at: datetime
    student_count: Optional[int] = 0
    exam_count: Optional[int] = 0

    class Config:
        from_attributes = True

class JoinClassRequest(BaseModel):
    join_code: str

# ── Rubric ────────────────────────────────────────────────────────────
class RubricUnitCreate(BaseModel):
    type: str
    label: str
    weight: float = 1.0
    order: int = 0

class RubricUnitOut(BaseModel):
    id: str
    class_id: str
    type: str
    label: str
    weight: float
    order: int

    class Config:
        from_attributes = True

class RubricSaveRequest(BaseModel):
    units: List[RubricUnitCreate]

# ── Script ────────────────────────────────────────────────────────────
class ScriptOut(BaseModel):
    id: str
    student_id: str
    class_id: str
    exam_name: str
    ocr_confidence: Optional[float] = None
    low_confidence: bool = False
    total_marks: Optional[float] = None
    scored_marks: Optional[float] = None
    ras: Optional[float] = None
    cvr: Optional[float] = None
    clarity_score: Optional[float] = None
    overall_correctness: Optional[str] = None
    overall_feedback: Optional[str] = None
    status: str
    uploaded_at: datetime
    error_message: Optional[str] = None
    student: Optional[UserOut] = None

    class Config:
        from_attributes = True

class GradingStepOut(BaseModel):
    id: str
    rubric_unit_id: str
    matched: bool
    student_text: Optional[str] = None
    similarity: Optional[float] = None
    feedback: Optional[str] = None
    marks_status: Optional[str] = None
    confidence_score: Optional[float] = 0.90
    rubric_unit: Optional[RubricUnitOut] = None

    class Config:
        from_attributes = True

class ScriptDetailOut(ScriptOut):
    steps: List[GradingStepOut] = []
    student: Optional[UserOut] = None

# ── Analytics ─────────────────────────────────────────────────────────
class QuestionRAS(BaseModel):
    question: str
    avg_ras: float
    weak_count: int

class ErrorCluster(BaseModel):
    label: str
    count: int
    percentage: float

class ScoreDistribution(BaseModel):
    bucket: str
    count: int

class AnalyticsOut(BaseModel):
    total_scripts: int
    avg_ras: float
    flagged_count: int
    per_exam: List[QuestionRAS]
    error_clusters: List[ErrorCluster]
    score_distribution: List[ScoreDistribution]

# ── Collusion ─────────────────────────────────────────────────────────
class CollusionOut(BaseModel):
    id: str
    cmi_score: float
    shared_errors: Optional[str] = None
    matched_phrases: Optional[str] = None
    status: str
    created_at: datetime
    script_a: Optional[ScriptDetailOut] = None
    script_b: Optional[ScriptDetailOut] = None

    class Config:
        from_attributes = True

class CollusionStatusUpdate(BaseModel):
    status: str  # "pending_review" | "cleared" | "confirmed"

# ── Batch Upload ──────────────────────────────────────────────────────
class BatchResult(BaseModel):
    student_email: str
    student_name: str
    script_id: Optional[str] = None
    ras: Optional[float] = None
    scored_marks: Optional[float] = None
    total_marks: Optional[float] = None
    status: str
    error: Optional[str] = None

# ── Retry ─────────────────────────────────────────────────────────────
class RetrySubmit(BaseModel):
    rubric_unit_id: str
    student_answer: str

class RetryResult(BaseModel):
    score: float
    matched: bool
    feedback: str

# ── PYQ Bank ─────────────────────────────────────────────────────────
class PYQCreate(BaseModel):
    subject: str
    exam_name: str
    year: int
    question_text: str
    sample_solution: Optional[str] = None
    rubric_json: Optional[str] = None
    marks: float = 10.0

class PYQOut(BaseModel):
    id: str
    subject: str
    exam_name: str
    year: int
    question_text: str
    sample_solution: Optional[str] = None
    rubric_json: Optional[str] = None
    marks: float
    created_at: datetime

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    class_id: str
    title: str
    exam_name: str
    instructions: Optional[str] = None
    total_marks: float = 10.0
    due_date: Optional[str] = None


class AssignmentOut(BaseModel):
    id: str
    class_id: str
    teacher_id: str
    title: str
    exam_name: str
    instructions: Optional[str] = None
    total_marks: float
    due_date: Optional[str] = None
    file_path: Optional[str] = None
    created_at: datetime
    submitted_count: Optional[int] = 0
    total_students: Optional[int] = 0
    has_submitted: Optional[bool] = False

    class Config:
        from_attributes = True


class GuildCreate(BaseModel):
    name: str
    domain: str
    description: Optional[str] = None
    icon_badge: Optional[str] = "🏛️"


class JoinGuildRequest(BaseModel):
    code: Optional[str] = None
    guild_id: Optional[str] = None


class GuildMemberOut(BaseModel):
    id: str
    user_id: str
    joined_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


class GuildOut(BaseModel):
    id: str
    name: str
    domain: str
    code: str
    description: Optional[str] = None
    icon_badge: str = "🏛️"
    created_at: datetime
    member_count: Optional[int] = 0
    avg_ras: Optional[float] = 0.0
    has_joined: Optional[bool] = False
    members: List[GuildMemberOut] = []

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
