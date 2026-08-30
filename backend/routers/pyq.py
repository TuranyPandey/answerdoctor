from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth
import json

router = APIRouter(prefix="/pyq", tags=["pyq"])


def _seed_pyqs_if_empty(db: Session):
    if db.query(models.PYQ).count() == 0:
        default_pyqs = [
            models.PYQ(
                subject="Thermodynamics",
                exam_name="End-Semester Exam 2024",
                year=2024,
                question_text="A closed rigid vessel contains steam at 100 kPa and 300 K. It is heated until pressure reaches 400 kPa. Calculate total heat transfer Q and state change.",
                sample_solution=(
                    "1. Isochoric process (v1 = v2).\n"
                    "2. State 1: u1 = 214.36 kJ/kg from steam table at 100 kPa, 300 K.\n"
                    "3. State 2: u2 = 460.81 kJ/kg at 400 kPa.\n"
                    "4. First Law: Q - W = ΔU. W = 0 since volume is constant.\n"
                    "5. Q = m(u2 - u1) = 1.25 * (460.81 - 214.36) = 308.06 kJ."
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "Identify rigid closed system boundary (V1 = V2 = Constant)", "weight": 2.0},
                    {"type": "Formula", "label": "Apply First Law: Q - W = ΔU = m(u2 - u1)", "weight": 2.0},
                    {"type": "Step", "label": "Lookup internal energy values u1 = 214.36 kJ/kg, u2 = 460.81 kJ/kg", "weight": 2.0},
                    {"type": "Transformation", "label": "Boundary work W = 0 for isochoric process; Q = m(u2 - u1)", "weight": 2.0},
                    {"type": "Result", "label": "Final heat transfer Q = 308.06 kJ with correct units", "weight": 2.0}
                ]),
                marks=10.0
            ),
            models.PYQ(
                subject="Electromagnetics",
                exam_name="Mid-Semester Exam 2023",
                year=2023,
                question_text="Derive Gauss's Law for a spherically symmetric charge distribution of radius R with total charge Q. Find Electric field E inside (r < R) and outside (r >= R).",
                sample_solution=(
                    "1. Gauss Law: ∮ E·dA = Q_enc / ε0\n"
                    "2. Spherical Gaussian surface area = 4 * π * r^2\n"
                    "3. Outside (r >= R): Q_enc = Q => E(4πr^2) = Q/ε0 => E = Q / (4πε0 r^2)\n"
                    "4. Inside (r < R): Q_enc = Q * (r/R)^3 => E = (Q r) / (4πε0 R^3)"
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "State Gauss's Law integral flux equation: ∮ E·dA = Q_enclosed / ε0", "weight": 2.0},
                    {"type": "Formula", "label": "Define Gaussian spherical surface at radius r", "weight": 2.0},
                    {"type": "Step", "label": "Calculate enclosed charge Q_enc for r < R and r ≥ R", "weight": 2.0},
                    {"type": "Transformation", "label": "Evaluate surface integral E * (4π r^2) = Q_enc / ε0", "weight": 2.0},
                    {"type": "Result", "label": "State electric field E(r) equations for both domains", "weight": 2.0}
                ]),
                marks=10.0
            ),
            models.PYQ(
                subject="Circuit Theory",
                exam_name="Final Assessment 2022",
                year=2022,
                question_text="Using Kirchhoff's Voltage Law (KVL), analyze a 2-mesh circuit with V1=12V, R1=4Ω, R2=6Ω, R3=2Ω to calculate loop currents I1 and I2.",
                sample_solution=(
                    "1. Mesh 1 KVL: 12 - 4*I1 - 6*(I1 - I2) = 0 => 10*I1 - 6*I2 = 12\n"
                    "2. Mesh 2 KVL: -6*(I2 - I1) - 2*I2 = 0 => -6*I1 + 8*I2 = 0\n"
                    "3. Solving linear system: I2 = 0.75 * I1\n"
                    "4. 10*I1 - 4.5*I1 = 12 => 5.5*I1 = 12 => I1 = 2.18 A, I2 = 1.64 A."
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "Identify independent mesh loops I1 and I2 with clockwise reference", "weight": 2.0},
                    {"type": "Formula", "label": "Write KVL equation for Loop 1: 12 - 4*I1 - 6*(I1 - I2) = 0", "weight": 2.0},
                    {"type": "Formula", "label": "Write KVL equation for Loop 2: -6*(I2 - I1) - 2*I2 = 0", "weight": 2.0},
                    {"type": "Transformation", "label": "Solve simultaneous linear system of equations for I1 and I2", "weight": 2.0},
                    {"type": "Result", "label": "Calculate mesh currents I1 = 2.18A and I2 = 1.64A", "weight": 2.0}
                ]),
                marks=10.0
            ),
            models.PYQ(
                subject="AP Biology",
                exam_name="AP Biology Exam 2024 (High School)",
                year=2024,
                question_text="Explain the light-dependent reactions of photosynthesis occurring in the thylakoid membrane. Describe the roles of Photosystem II, Electron Transport Chain, and ATP Synthase.",
                sample_solution=(
                    "1. PS II absorbs photon (680nm) and splits H2O -> 2H+ + 1/2 O2 + 2e-.\n"
                    "2. Electrons pass down ETC generating H+ gradient across thylakoid membrane.\n"
                    "3. Chemiosmosis drives ATP Synthase to phosphorylate ADP + Pi -> ATP.\n"
                    "4. PS I absorbs photon (700nm) and reduces NADP+ -> NADPH."
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "Identify thylakoid membrane boundary & light reaction inputs", "weight": 2.0},
                    {"type": "Formula", "label": "State water photolysis reaction: 2H2O -> O2 + 4H+ + 4e-", "weight": 2.0},
                    {"type": "Step", "label": "Describe proton accumulation in thylakoid lumen", "weight": 2.0},
                    {"type": "Transformation", "label": "Explain chemiosmotic ATP synthesis via ATP Synthase", "weight": 2.0},
                    {"type": "Result", "label": "State net products: ATP, NADPH, and O2 byproduct", "weight": 2.0}
                ]),
                marks=10.0
            ),
            models.PYQ(
                subject="Computer Science",
                exam_name="Algorithms & Data Structures Midterm",
                year=2024,
                question_text="Derive the average and worst-case time complexity of QuickSort. Explain the choice of pivot selection and partitioning step.",
                sample_solution=(
                    "1. Partition step scans n elements comparing against pivot: O(n) work per level.\n"
                    "2. Best/Average case: Balanced splits T(n) = 2T(n/2) + O(n) => O(n log n).\n"
                    "3. Worst case: Sorted array with last element pivot T(n) = T(n-1) + O(n) => O(n^2)."
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "Explain divide-and-conquer strategy & pivot partitioning", "weight": 2.0},
                    {"type": "Formula", "label": "Formulate recurrence relation T(n) = 2T(n/2) + O(n)", "weight": 2.0},
                    {"type": "Step", "label": "Apply Master Theorem to solve for average case O(n log n)", "weight": 2.0},
                    {"type": "Transformation", "label": "Analyze worst-case degradation to O(n^2) for unbalanced partitions", "weight": 2.0},
                    {"type": "Result", "label": "State Big-O time and space complexity bounds", "weight": 2.0}
                ]),
                marks=10.0
            ),
            models.PYQ(
                subject="Economics",
                exam_name="Microeconomics Final Exam",
                year=2023,
                question_text="A firm has demand equation Q = 500 - 10P and cost function C(Q) = 50 + 5Q. Calculate profit-maximizing output Q*, price P*, and total profit.",
                sample_solution=(
                    "1. Inverse demand: P = 50 - 0.1Q => Total Revenue TR = 50Q - 0.1Q^2.\n"
                    "2. Marginal Revenue MR = dTR/dQ = 50 - 0.2Q.\n"
                    "3. Marginal Cost MC = dC/dQ = 5.\n"
                    "4. Profit max MR = MC => 50 - 0.2Q = 5 => 0.2Q = 45 => Q* = 225 units.\n"
                    "5. P* = 50 - 0.1(225) = $27.50. Profit = TR - C = (225*27.5) - (50 + 5*225) = $4,987.50."
                ),
                rubric_json=json.dumps([
                    {"type": "Concept", "label": "State profit maximization condition: MR = MC", "weight": 2.0},
                    {"type": "Formula", "label": "Derive Marginal Revenue MR = 50 - 0.2Q and MC = 5", "weight": 2.0},
                    {"type": "Step", "label": "Equate MR = MC to solve optimal quantity Q* = 225", "weight": 2.0},
                    {"type": "Transformation", "label": "Calculate equilibrium price P* = $27.50", "weight": 2.0},
                    {"type": "Result", "label": "State maximum total profit = $4,987.50", "weight": 2.0}
                ]),
                marks=10.0
            )
        ]
        db.add_all(default_pyqs)
        db.commit()


@router.get("", response_model=list[schemas.PYQOut])
def list_pyqs(
    subject: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    _seed_pyqs_if_empty(db)
    query = db.query(models.PYQ)
    if subject:
        query = query.filter(models.PYQ.subject.ilike(f"%{subject}%"))
    return [schemas.PYQOut.model_validate(p) for p in query.order_by(models.PYQ.year.desc()).all()]


@router.post("", response_model=schemas.PYQOut)
def create_pyq(
    body: schemas.PYQCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    pyq = models.PYQ(
        subject=body.subject,
        exam_name=body.exam_name,
        year=body.year,
        question_text=body.question_text,
        sample_solution=body.sample_solution,
        rubric_json=body.rubric_json,
        marks=body.marks,
    )
    db.add(pyq)
    db.commit()
    db.refresh(pyq)
    return schemas.PYQOut.model_validate(pyq)


@router.delete("/{pyq_id}")
def delete_pyq(
    pyq_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    pyq = db.query(models.PYQ).filter(models.PYQ.id == pyq_id).first()
    if not pyq:
        raise HTTPException(404, "PYQ not found")
    db.delete(pyq)
    db.commit()
    return {"message": "PYQ deleted"}


@router.post("/{pyq_id}/to-rubric/{class_id}", response_model=list[schemas.RubricUnitOut])
def import_pyq_to_rubric(
    pyq_id: str,
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """Import PYQ solution criteria directly as rubric units for a class."""
    pyq = db.query(models.PYQ).filter(models.PYQ.id == pyq_id).first()
    if not pyq:
        raise HTTPException(404, "PYQ not found")

    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")

    rubric_items = []
    if pyq.rubric_json:
        try:
            parsed = json.loads(pyq.rubric_json)
            if isinstance(parsed, list):
                rubric_items = parsed
        except Exception:
            pass

    if not rubric_items:
        # Generate items from solution text lines
        lines = [l.strip() for l in (pyq.sample_solution or pyq.question_text).splitlines() if l.strip()]
        types = ["Concept", "Formula", "Step", "Transformation", "Result"]
        for idx, line in enumerate(lines[:5]):
            rubric_items.append({
                "type": types[idx % len(types)],
                "label": line[:120],
                "weight": round(pyq.marks / max(1, min(5, len(lines))), 1)
            })

    # Clear existing and add imported units
    db.query(models.RubricUnit).filter(models.RubricUnit.class_id == class_id).delete()
    new_units = []
    for order, item in enumerate(rubric_items):
        u = models.RubricUnit(
            class_id=class_id,
            type=item.get("type", "Step"),
            label=item.get("label", "Criteria Step"),
            weight=float(item.get("weight", 2.0)),
            order=order,
        )
        db.add(u)
        new_units.append(u)

    db.commit()
    for u in new_units:
        db.refresh(u)
    return [schemas.RubricUnitOut.model_validate(u) for u in new_units]


class GeneratePaperRequest(schemas.BaseModel):
    subject: str
    topic: str
    difficulty: str = "Medium"  # Easy, Medium, Hard
    marks: float = 10.0


class GenerateVariantsRequest(schemas.BaseModel):
    pyq_id: str


@router.post("/generate-paper")
async def generate_question_paper(
    body: GeneratePaperRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("teacher")),
):
    """AI Question Paper Studio: Generate a full exam question, sample solution, and decomposed rubric units."""
    from services import grader
    prompt = f"""
Generate an engineering exam problem for subject "{body.subject}" on topic "{body.topic}" at {body.difficulty} difficulty level (Total marks: {body.marks}).

Return JSON:
{{
  "exam_name": "{body.subject} — {body.topic} Quiz",
  "subject": "{body.subject}",
  "question_text": "<Clear, rigorous engineering problem statement with explicit initial state properties & parameters>",
  "sample_solution": "<Step-by-step worked solution derivation>",
  "rubric_units": [
    {{"type": "Concept", "label": "<requirement>", "weight": 2.0}},
    {{"type": "Formula", "label": "<requirement>", "weight": 2.0}},
    {{"type": "Step", "label": "<requirement>", "weight": 2.0}},
    {{"type": "Transformation", "label": "<requirement>", "weight": 2.0}},
    {{"type": "Result", "label": "<requirement>", "weight": 2.0}}
  ]
}}
"""
    if grader.settings.gemini_api_key and grader.settings.gemini_api_key.startswith("AIza"):
        try:
            raw = await grader._generate(prompt, system="You are AnswerDoctor's AI Exam Paper Author.", json_mode=True)
            clean = grader._clean_json(raw)
            data = json.loads(clean)
            pyq = models.PYQ(
                subject=data.get("subject", body.subject),
                exam_name=data.get("exam_name", f"{body.subject} Quiz"),
                year=2026,
                question_text=data.get("question_text", ""),
                sample_solution=data.get("sample_solution", ""),
                rubric_json=json.dumps(data.get("rubric_units", [])),
                marks=body.marks,
            )
            db.add(pyq)
            db.commit()
            db.refresh(pyq)
            return schemas.PYQOut.model_validate(pyq)
        except Exception as err:
            print(f"Gemini paper generator failed ({err}). Using fallback...")

    # Fallback paper creation
    q_text = f"An engineering system in {body.subject} ({body.topic}) operates at initial state T1 = 300K, P1 = 100kPa. Compute heat transfer Q and net work W."
    sol = "1. State equations: Q - W = delta U.\n2. Calculate boundary work W.\n3. Compute final heat transfer Q."
    units = [
        {"type": "Concept", "label": f"Identify system boundary and initial state properties for {body.topic}", "weight": 2.0},
        {"type": "Formula", "label": "Apply first law governing equation: Q - W = delta U", "weight": 2.0},
        {"type": "Step", "label": "Calculate internal energy and work integral", "weight": 2.0},
        {"type": "Transformation", "label": "Algebraic evaluation of net heat transfer Q", "weight": 2.0},
        {"type": "Result", "label": "State final numerical answer with units", "weight": 2.0},
    ]
    pyq = models.PYQ(
        subject=body.subject,
        exam_name=f"{body.subject} — {body.topic} Quiz",
        year=2026,
        question_text=q_text,
        sample_solution=sol,
        rubric_json=json.dumps(units),
        marks=body.marks,
    )
    db.add(pyq)
    db.commit()
    db.refresh(pyq)
    return schemas.PYQOut.model_validate(pyq)


@router.post("/generate-variants")
async def generate_pyq_variants(
    body: GenerateVariantsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """AI Synthetic PYQ Variant Generator: Generate 3 new problem variants with modified state variables."""
    from services import grader
    pyq = db.query(models.PYQ).filter(models.PYQ.id == body.pyq_id).first()
    if not pyq:
        raise HTTPException(404, "Target PYQ not found")

    prompt = f"""
Given target PYQ problem in {pyq.subject}:
\"{pyq.question_text}\"

Generate 3 SYNTHETIC PRACTICE VARIANT PROBLEMS with altered physical state parameters (e.g. different initial pressures/temperatures or boundary constraints), along with sample solutions and rubric units.

Return JSON array of 3 objects:
[
  {{
    "exam_name": "{pyq.exam_name} (Variant A)",
    "subject": "{pyq.subject}",
    "year": 2026,
    "question_text": "<Variant problem>",
    "sample_solution": "<Step-by-step solution>",
    "rubric_units": [{{"type": "Concept", "label": "<req>", "weight": 2.0}}, {{"type": "Formula", "label": "<req>", "weight": 2.0}}, {{"type": "Result", "label": "<req>", "weight": 2.0}}],
    "marks": {pyq.marks}
  }}
]
"""
    if grader.settings.gemini_api_key and grader.settings.gemini_api_key.startswith("AIza"):
        try:
            raw = await grader._generate(prompt, system="You are AnswerDoctor's Synthetic Problem Generator.", json_mode=True)
            clean = grader._clean_json(raw)
            variants_data = json.loads(clean)
            if isinstance(variants_data, dict) and "variants" in variants_data:
                variants_data = variants_data["variants"]
            created_pyqs = []
            for v in variants_data[:3]:
                np = models.PYQ(
                    subject=v.get("subject", pyq.subject),
                    exam_name=v.get("exam_name", f"{pyq.exam_name} Variant"),
                    year=2026,
                    question_text=v.get("question_text", ""),
                    sample_solution=v.get("sample_solution", ""),
                    rubric_json=json.dumps(v.get("rubric_units", [])),
                    marks=v.get("marks", pyq.marks),
                )
                db.add(np)
                created_pyqs.append(np)
            db.commit()
            for np in created_pyqs:
                db.refresh(np)
            return [schemas.PYQOut.model_validate(np) for np in created_pyqs]
        except Exception as err:
            print(f"Gemini variant generator failed ({err}). Using fallback...")

    # Fallback variant creation
    variant = models.PYQ(
        subject=pyq.subject,
        exam_name=f"{pyq.exam_name} (AI Variant)",
        year=2026,
        question_text=f"Variant Practice Problem: {pyq.question_text} (Modified state variables P = 250 kPa, T = 450 K)",
        sample_solution=pyq.sample_solution,
        rubric_json=pyq.rubric_json,
        marks=pyq.marks,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return [schemas.PYQOut.model_validate(variant)]

