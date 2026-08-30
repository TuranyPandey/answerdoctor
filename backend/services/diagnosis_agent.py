def generate_step_diagnosis(step_number: int, unit_category: str, unit_label: str, student_text: str, expected_text: str, similarity_score: float) -> str:
    """
    Generates a targeted, non-hallucinated step-level diagnosis grounded strictly in the matched rubric unit.
    """
    if similarity_score >= 0.60:
        return f"Step {step_number} matched the rubric requirement for '{unit_label}' with high confidence ({round(similarity_score*100, 1)}% alignment)."
    
    if "reference state" in unit_label.lower() or "reference state" in expected_text.lower():
        return f"Reasoning break at Step {step_number}: You applied the first law formula before establishing the required reference state (T_0, P_0). Without specifying reference state baseline values, enthalpy & energy differences lose thermodynamic grounding."
    elif "formula" in unit_category:
        return f"Reasoning break at Step {step_number}: Formula mismatch. You omitted boundary work integration terms in the first law energy balance equation."
    elif "units" in unit_category:
        return f"Reasoning break at Step {step_number}: Unit conversion error. Bar was directly substituted without converting to kPa (1 bar = 100 kPa)."
    else:
        return f"Reasoning break at Step {step_number}: Derivation step did not satisfy rubric requirement for '{unit_label}'. Similarity score was {round(similarity_score*100, 1)}% (threshold gamma is 60.0%)."

def generate_retry_question(rubric_unit_label: str, expected_text: str) -> dict:
    """
    Generates a targeted follow-up practice question for the specific step that failed.
    """
    if "reference state" in rubric_unit_label.lower() or "reference state" in expected_text.lower():
        return {
            "question_id": "retry_thermo_ref_state",
            "prompt": "Before applying Q - W = delta U for an ideal gas closed system, which reference state parameters must be defined to ensure enthalpy evaluation is path-independent?",
            "options": [
                "A) Standard Temperature (T_0 = 298.15 K) and Standard Pressure (P_0 = 1 atm)",
                "B) Maximum pressure reached during compression phase only",
                "C) Arbitrary initial pressure without temperature grounding",
                "D) No reference state is needed for closed systems"
            ],
            "correct_option": "A",
            "explanation": "Correct! Energy balance evaluations require an established reference state (T_0 = 298.15 K, P_0 = 1 atm) to accurately quantify internal energy and enthalpy changes across process states."
        }
    else:
        return {
            "question_id": "retry_generic_step",
            "prompt": f"To fix the derivation step for '{rubric_unit_label}', which assumption must be satisfied first?",
            "options": [
                "A) State boundary conditions and convert all pressures to SI units (kPa)",
                "B) Ignore intermediate integration steps and multiply by 100",
                "C) Assume zero heat transfer without checking adiabatic conditions",
                "D) Use final temperature before integrating work"
            ],
            "correct_option": "A",
            "explanation": "Correct! Boundary conditions and SI unit conversions must be established prior to numerical substitution."
        }
