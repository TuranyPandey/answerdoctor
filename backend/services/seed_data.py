import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal, Base, engine
from models import User, Classroom, ClassroomStudent, Assignment, RubricUnit, Submission, SubmissionStep, CollusionPair, ErrorCluster

import datetime

def seed_thermodynamics_demo():
    # Re-create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    try:
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

    # 1. Create Users
    teacher = User(
        email="prof.sharma@vit.ac.in",
        full_name="Prof. Rajesh Sharma",
        role="teacher"
    )
    student1 = User(
        email="sohum@vit.ac.in",
        full_name="Mangalapalli Sohum Seshu Krish",
        register_number="26BCE0616",
        role="student"
    )
    student2 = User(
        email="rayed@vit.ac.in",
        full_name="Rayed Rabbanee",
        register_number="26BCE0606",
        role="student"
    )
    student3 = User(
        email="pratyush@vit.ac.in",
        full_name="Pratyush Jha",
        register_number="26BCE0604",
        role="student"
    )
    student4 = User(
        email="turany@vit.ac.in",
        full_name="Turany Pandey",
        register_number="26BCE0646",
        role="student"
    )

    db.add_all([teacher, student1, student2, student3, student4])
    db.commit()

    # 2. Create Classroom
    classroom = Classroom(
        name="MECH201 - Applied Thermodynamics (CAT-1)",
        subject="Mechanical Engineering",
        code="THERMO2026",
        teacher_id=teacher.id
    )
    db.add(classroom)
    db.commit()

    # Enroll students
    for st in [student1, student2, student3, student4]:
        db.add(ClassroomStudent(classroom_id=classroom.id, student_id=st.id))
    db.commit()

    # 3. Create Assignment
    assignment = Assignment(
        title="CAT-1 Exam: First Law & State Reference Equations",
        subject="Thermodynamics",
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

    # 5. Submissions & Steps

    # Submission A: Sohum (Reasoning Break at Step 1 - Missing Reference State)
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
        (1, "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", False, None, rubric_objects[0].id, 0.41, "WEAK", "Reasoning break at Step 1: You applied the first law formula before establishing the required reference state (T_0 = 298.15 K, P_0 = 1 atm). Without specifying baseline values, internal energy difference calculation is ungrounded."),
        (2, "Q - W = delta U where delta U = m * c_v * (T2 - T1)", False, None, rubric_objects[1].id, 0.88, "MATCHED", "Step 2 matched the rubric requirement for First Law Energy Balance with 88% confidence."),
        (3, "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", True, "diagram_p_v_curve.png", rubric_objects[2].id, 0.89, "MATCHED", "Step 3 matched boundary work integration requirement with 89% confidence. Preserved P-V process curve diagram crop."),
        (4, "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", False, None, rubric_objects[3].id, 0.91, "MATCHED", "Step 4 matched unit conversion requirements with 91% confidence."),
        (5, "Q_net = 384.6 kJ", False, None, rubric_objects[4].id, 0.94, "MATCHED", "Step 5 matched final heat transfer answer with 94% confidence.")
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

    # Submission B: Rayed (Collusion Pair with Sohum - Same Reference State Error)
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

    steps_rayed = [
        (1, "Applied energy equation Q - W = m*c_v*(T2 - T1) directly without defining T_0 or P_0 reference state.", False, None, rubric_objects[0].id, 0.41, "WEAK", "Reasoning break at Step 1: You applied the first law formula before establishing the required reference state (T_0 = 298.15 K, P_0 = 1 atm)."),
        (2, "Q - W = delta U where delta U = m * c_v * (T2 - T1)", False, None, rubric_objects[1].id, 0.88, "MATCHED", "Step 2 matched first law equation."),
        (3, "W = P * (V2 - V1) = 1.45 * 100 * (1.2 - 0.2) = 145.2 kJ", True, "diagram_p_v_curve.png", rubric_objects[2].id, 0.89, "MATCHED", "Step 3 matched boundary work integration."),
        (4, "Converted pressure 1.45 bar = 145 kPa and T in Kelvin", False, None, rubric_objects[3].id, 0.91, "MATCHED", "Step 4 matched unit conversion."),
        (5, "Q_net = 384.6 kJ", False, None, rubric_objects[4].id, 0.94, "MATCHED", "Step 5 matched final answer.")
    ]

    for s_num, txt, diag, diag_url, r_id, sim, stat, diag_txt in steps_rayed:
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

    # Submission C: Pratyush (Flawless Score)
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

    # Submission D: Turany (Good Score, Minor Unit Slip)
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

    # 6. Collusion Pair (Sohum vs Rayed)
    coll_pair = CollusionPair(
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
    )
    db.add(coll_pair)
    db.commit()

    # 7. Class Error Clusters
    cluster1 = ErrorCluster(
        assignment_id=assignment.id,
        cluster_name="Unspecified Reference State Baseline",
        frequency=80,
        percentage=33.3,
        description="Students applied first law enthalpy equations directly without defining baseline reference temperature T_0 and pressure P_0.",
        affected_students_json='["Mangalapalli Sohum Seshu Krish (26BCE0616)", "Rayed Rabbanee (26BCE0606)", "80 Cohort Students"]'
    )
    cluster2 = ErrorCluster(
        assignment_id=assignment.id,
        cluster_name="Bar to kPa Unit Conversion Slip",
        frequency=45,
        percentage=18.8,
        description="Students substituted pressure values in bar directly into SI equations without multiplying by 100 kPa/bar factor.",
        affected_students_json='["Turany Pandey (26BCE0646)", "45 Cohort Students"]'
    )
    cluster3 = ErrorCluster(
        assignment_id=assignment.id,
        cluster_name="Boundary Work Sign Convention",
        frequency=30,
        percentage=12.5,
        description="Inverted work done on/by system signs during integral P dV computation.",
        affected_students_json='["30 Cohort Students"]'
    )
    db.add_all([cluster1, cluster2, cluster3])
    db.commit()
    db.close()
    print("Database successfully seeded with Mechanical Engineering Thermodynamics CAT Demo data!")

if __name__ == "__main__":
    seed_thermodynamics_demo()
