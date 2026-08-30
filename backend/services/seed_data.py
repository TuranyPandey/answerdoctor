import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal, Base, engine
from models import User, Classroom, ClassroomStudent, Assignment, RubricUnit, Submission, SubmissionStep, CollusionPair, ErrorCluster, PYQQuestion, DoubtQuery
import datetime

def seed_thermodynamics_demo():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        db.query(DoubtQuery).delete()
        db.query(PYQQuestion).delete()
        db.query(CollusionPair).delete()
        db.query(ErrorCluster).delete()
        db.query(SubmissionStep).delete()
        db.query(Submission).delete()
        db.query(RubricUnit).delete()
        db.query(Assignment).delete()
        db.query(ClassroomStudent).delete()
        db.query(Classroom).delete()
        db.query(User).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        print("Clear error:", e)

    # 1. Users
    teacher = User(
        email="prof.sharma@vit.ac.in",
        full_name="Prof. Rajesh Sharma",
        role="teacher",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
    )
    student1 = User(
        email="sohum@vit.ac.in",
        full_name="Mangalapalli Sohum Seshu Krish",
        register_number="26BCE0616",
        role="student",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sohum"
    )
    student2 = User(
        email="rayed@vit.ac.in",
        full_name="Rayed Rabbanee",
        register_number="26BCE0606",
        role="student",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Rayed"
    )
    student3 = User(
        email="pratyush@vit.ac.in",
        full_name="Pratyush Jha",
        register_number="26BCE0604",
        role="student",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Pratyush"
    )
    student4 = User(
        email="turany@vit.ac.in",
        full_name="Turany Pandey",
        register_number="26BCE0646",
        role="student",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Turany"
    )

    db.add_all([teacher, student1, student2, student3, student4])
    db.commit()

    # 2. Classroom
    classroom = Classroom(
        name="MECH201 - Applied Thermodynamics",
        subject="Mechanical Engineering",
        code="THERMO2026",
        teacher_id=teacher.id
    )
    db.add(classroom)
    db.commit()

    for st in [student1, student2, student3, student4]:
        db.add(ClassroomStudent(classroom_id=classroom.id, student_id=st.id))
    db.commit()

    # 3. Assignment
    assignment = Assignment(
        title="CAT-1 Exam: First Law & State Reference Equations",
        subject="Thermodynamics",
        exam_type="CAT-1",
        year=2026,
        classroom_id=classroom.id,
        answer_key_text="""1. Concept: Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.
2. Formula: Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).
3. Intermediate Step: W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.
4. Units: Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.
5. Final Answer: Net heat transfer Q_net = 384.6 kJ (positive indicating heat added).""",
        total_marks=100.0,
        total_scripts=240,
        status="GRADED"
    )
    db.add(assignment)
    db.commit()

    # 4. Rubric Units
    units_data = [
        ("concept", "1. System boundary & Reference State definition", "Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.", 0.20),
        ("formula", "2. First Law Energy Balance Equation", "Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).", 0.20),
        ("intermediate_step", "3. Boundary Work Integration & Specific Heat", "W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.", 0.25),
        ("units", "4. Unit Conversions & Dimensional Consistency", "Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.", 0.15),
        ("final_answer", "5. Final Heat Transfer Evaluation (Q_net)", "Net heat transfer Q_net = 384.6 kJ (positive indicating heat added to system).", 0.20)
    ]

    rubric_objects = []
    for cat, lbl, txt, w in units_data:
        ru = RubricUnit(
            assignment_id=assignment.id,
            category=cat,
            label=lbl,
            expected_text=txt,
            weight=w,
            gamma_threshold=0.60
        )
        db.add(ru)
        rubric_objects.append(ru)
    db.commit()

    # 5. Submissions
    sub_sohum = Submission(
        assignment_id=assignment.id,
        student_id=student1.id,
        student_name=student1.full_name,
        register_number=student1.register_number,
        total_ras_score=60.0,
        ocr_confidence=0.96,
        is_collusion_flagged=True
    )
    db.add(sub_sohum)
    db.commit()

    steps_sohum = [
        (1, "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", False, None, rubric_objects[0].id, 0.41, "WEAK", "Reasoning break at Step 1: You applied the first law formula before establishing the required reference state (T_0 = 298.15 K, P_0 = 1 atm)."),
        (2, "Q - W = delta U where delta U = m * c_v * (T2 - T1)", False, None, rubric_objects[1].id, 0.88, "MATCHED", "Step 2 matched the rubric requirement for First Law Energy Balance."),
        (3, "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", True, "diagram_p_v_curve.png", rubric_objects[2].id, 0.89, "MATCHED", "Step 3 matched boundary work integration requirement with P-V diagram crop."),
        (4, "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", False, None, rubric_objects[3].id, 0.91, "MATCHED", "Step 4 matched unit conversion requirements."),
        (5, "Q_net = 384.6 kJ", False, None, rubric_objects[4].id, 0.94, "MATCHED", "Step 5 matched final heat transfer answer.")
    ]

    for s_num, txt, diag, diag_url, r_id, sim, stat, diag_txt in steps_sohum:
        db.add(SubmissionStep(
            submission_id=sub_sohum.id,
            step_number=s_num,
            student_text=txt,
            has_diagram=diag,
            diagram_url=diag_url,
            rubric_unit_id=r_id,
            similarity_score=sim,
            status=stat,
            diagnosis_text=diag_txt,
            retry_status="NOT_ATTEMPTED"
        ))

    sub_rayed = Submission(
        assignment_id=assignment.id,
        student_id=student2.id,
        student_name=student2.full_name,
        register_number=student2.register_number,
        total_ras_score=60.0,
        ocr_confidence=0.94,
        is_collusion_flagged=True
    )
    db.add(sub_rayed)
    db.commit()

    for s_num, txt, diag, diag_url, r_id, sim, stat, diag_txt in steps_sohum:
        db.add(SubmissionStep(
            submission_id=sub_rayed.id,
            step_number=s_num,
            student_text=txt,
            has_diagram=diag,
            diagram_url=diag_url,
            rubric_unit_id=r_id,
            similarity_score=sim,
            status=stat,
            diagnosis_text=diag_txt
        ))

    sub_pratyush = Submission(
        assignment_id=assignment.id,
        student_id=student3.id,
        student_name=student3.full_name,
        register_number=student3.register_number,
        total_ras_score=100.0,
        ocr_confidence=0.98,
        is_collusion_flagged=False
    )
    db.add(sub_pratyush)
    db.commit()

    for idx, (cat, lbl, txt, w) in enumerate(units_data):
        db.add(SubmissionStep(
            submission_id=sub_pratyush.id,
            step_number=idx+1,
            student_text=f"Explicitly established {lbl} with complete derivation: {txt}",
            has_diagram=(idx == 2),
            diagram_url="diagram_pv_clean.png" if idx == 2 else None,
            rubric_unit_id=rubric_objects[idx].id,
            similarity_score=0.96,
            status="MATCHED",
            diagnosis_text=f"Step {idx+1} perfectly matched rubric unit '{lbl}'."
        ))

    sub_turany = Submission(
        assignment_id=assignment.id,
        student_id=student4.id,
        student_name=student4.full_name,
        register_number=student4.register_number,
        total_ras_score=80.0,
        ocr_confidence=0.95,
        is_collusion_flagged=False
    )
    db.add(sub_turany)
    db.commit()

    steps_turany = [
        (1, "Defined reference state T_0 = 298.15 K, P_0 = 1 atm clearly.", False, None, rubric_objects[0].id, 0.95, "MATCHED", "Step 1 matched reference state definition."),
        (2, "Q - W = delta U formula applied.", False, None, rubric_objects[1].id, 0.90, "MATCHED", "Step 2 matched first law equation."),
        (3, "Work done W = 145.2 kJ.", True, "diagram_p_v_turany.png", rubric_objects[2].id, 0.92, "MATCHED", "Step 3 matched work calculation."),
        (4, "Substituted 1.45 bar directly without converting bar to kPa.", False, None, rubric_objects[3].id, 0.40, "WEAK", "Reasoning break at Step 4: Unit conversion slip (bar not converted to kPa)."),
        (5, "Q_net = 38.46 kJ due to unit error.", False, None, rubric_objects[4].id, 0.80, "MATCHED", "Final answer correctly followed previous intermediate value.")
    ]
    for s_num, txt, diag, diag_url, r_id, sim, stat, diag_txt in steps_turany:
        db.add(SubmissionStep(
            submission_id=sub_turany.id,
            step_number=s_num,
            student_text=txt,
            has_diagram=diag,
            diagram_url=diag_url,
            rubric_unit_id=r_id,
            similarity_score=sim,
            status=stat,
            diagnosis_text=diag_txt
        ))

    db.commit()

    # 6. Collusion Pair
    db.add(CollusionPair(
        assignment_id=assignment.id,
        student_a_id=student1.id,
        student_a_name=student1.full_name,
        student_a_reg=student1.register_number,
        student_b_id=student2.id,
        student_b_name=student2.full_name,
        student_b_reg=student2.register_number,
        cmi_score=0.92,
        cos_sim=0.94,
        error_match_score=0.90,
        flagged_reason="High CMI (0.92 >= 0.88). Shared identical non-standard reference state omission at Step 1 and verbatim boundary work integration phrasing.",
        status="FLAGGED"
    ))

    # 7. Error Clusters
    db.add_all([
        ErrorCluster(
            assignment_id=assignment.id,
            cluster_name="Unspecified Reference State Baseline",
            frequency=80, percentage=33.3,
            description="Students applied first law enthalpy equations directly without defining baseline reference temperature T_0 and pressure P_0.",
            affected_students_json='["Mangalapalli Sohum Seshu Krish (26BCE0616)", "Rayed Rabbanee (26BCE0606)", "80 Cohort Students"]'
        ),
        ErrorCluster(
            assignment_id=assignment.id,
            cluster_name="Bar to kPa Unit Conversion Slip",
            frequency=45, percentage=18.8,
            description="Students substituted pressure values in bar directly into SI equations without multiplying by 100 kPa/bar factor.",
            affected_students_json='["Turany Pandey (26BCE0646)", "45 Cohort Students"]'
        )
    ])

    # 8. Seed PYQs (Previous Year Questions Repository)
    pyqs = [
        PYQQuestion(
            subject="Applied Thermodynamics",
            year=2025,
            exam_type="FAT",
            title="Second Law Analysis & Entropy Generation in Polytropic Expansion",
            question_text="A closed system undergoes a polytropic expansion from 5 bar, 500 K to 1 bar. Calculate the net entropy generation S_gen and exergy loss assuming T_0 = 298 K.",
            answer_key_summary="1. State polytropic relation P1*V1^n = P2*V2^n\n2. S_2 - S_1 = c_p*ln(T2/T1) - R*ln(P2/P1)\n3. Calculate exergy destruction X_destroyed = T_0 * S_gen = 42.8 kJ",
            difficulty="Hard",
            topics_json='["Second Law", "Entropy Generation", "Exergy Analysis"]'
        ),
        PYQQuestion(
            subject="Applied Thermodynamics",
            year=2024,
            exam_type="CAT-2",
            title="Rankine Cycle with Reheat & Regeneration",
            question_text="For a steam power plant operating on ideal reheat Rankine cycle between 15 MPa and 10 kPa with reheat at 3 MPa to 500°C, evaluate thermal efficiency.",
            answer_key_summary="1. Pump work W_p = v1*(P2 - P1)\n2. High pressure turbine work W_t1 = h1 - h2\n3. Thermal efficiency eta_th = W_net / Q_in = 43.5%",
            difficulty="Hard",
            topics_json='["Vapor Power Cycles", "Rankine Cycle", "Thermal Efficiency"]'
        ),
        PYQQuestion(
            subject="Multivariable Calculus",
            year=2025,
            exam_type="CAT-1",
            title="Green's Theorem & Line Integrals over Closed Vector Fields",
            question_text="Evaluate the line integral integral_C (y^2 dx + 3xy dy) where C is the boundary of the region enclosed by y = x^2 and y = x.",
            answer_key_summary="1. Apply Green's Theorem: double_integral (dQ/dx - dP/dy) dA\n2. dQ/dx = 3y, dP/dy = 2y -> integrand is y\n3. Evaluate double integral over region 0 <= x <= 1, x^2 <= y <= x -> Result = 1/12",
            difficulty="Medium",
            topics_json='["Vector Calculus", "Green Theorem", "Line Integrals"]'
        ),
        PYQQuestion(
            subject="Data Structures & Algorithms",
            year=2025,
            exam_type="FAT",
            title="Dynamic Programming: 0/1 Knapsack & Memory Bounded Derivation",
            question_text="Given items with weights w = [2, 3, 4, 5] and values v = [3, 4, 5, 6] with knapsack capacity W = 8, construct the DP table and trace optimal subset.",
            answer_key_summary="1. Recurrence: dp[i][w] = max(dp[i-1][w], v[i-1] + dp[i-1][w-w[i-1]])\n2. Optimal Value = 10\n3. Selected items: Item 2 (w=3, v=4) and Item 4 (w=5, v=6)",
            difficulty="Medium",
            topics_json='["Dynamic Programming", "Knapsack Problem", "Algorithms"]'
        )
    ]
    db.add_all(pyqs)
    db.commit()

    # 9. Seed Initial Doubt Query
    db.add(DoubtQuery(
        student_id=student1.id,
        step_id=1,
        user_question="Why did Step 1 fail when I wrote Q - W = m*c_v*(T2 - T1)?",
        ai_response="Your step failed because in thermodynamics evaluations, enthalpy (h) and internal energy (u) are relative state functions evaluated against a reference state (T_0 = 298.15 K, P_0 = 1 atm). Omitting T_0 leaves the energy balance floating without zero-point baseline initialization."
    ))

    db.commit()
    db.close()
    print("Database successfully seeded with Thermodynamics Demo, PYQ Vault, and Doubt Query models!")

if __name__ == "__main__":
    seed_thermodynamics_demo()
