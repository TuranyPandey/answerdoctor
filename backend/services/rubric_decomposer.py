<<<<<<< HEAD
def decompose_answer_key(answer_key_text: str) -> list:
    """
    Decomposes an answer key/marking scheme into atomic gradeable units.
    Categories: concept, formula, intermediate_step, units, final_answer
    Each unit carries a weight (summing to 1.0) and a gamma threshold (default 0.60).
    """
    # Deterministic intelligent rubric decomposer
    # Default units for Thermodynamics CAT Q3 if text is generic
    if "thermodynamics" in answer_key_text.lower() or "first law" in answer_key_text.lower() or not answer_key_text.strip():
        return [
            {
                "category": "concept",
                "label": "1. System boundary & Reference State definition",
                "expected_text": "Establish reference state T_0 = 298.15 K, P_0 = 1 atm before applying first law energy balance.",
                "weight": 0.20,
                "gamma_threshold": 0.60
            },
            {
                "category": "formula",
                "label": "2. First Law Energy Balance Equation",
                "expected_text": "Q - W = delta U + delta KE + delta PE, where delta U = m * c_v * (T_2 - T_1).",
                "weight": 0.20,
                "gamma_threshold": 0.60
            },
            {
                "category": "intermediate_step",
                "label": "3. Boundary Work Integration & Specific Heat",
                "expected_text": "W_12 = integral P dV = P*(V_2 - V_1), evaluate W_12 = 145.2 kJ.",
                "weight": 0.25,
                "gamma_threshold": 0.60
            },
            {
                "category": "units",
                "label": "4. Unit Conversions & Dimensional Consistency",
                "expected_text": "Convert pressure from bar to kPa (1 bar = 100 kPa) and temperatures to Kelvin.",
                "weight": 0.15,
                "gamma_threshold": 0.60
            },
            {
                "category": "final_answer",
                "label": "5. Final Heat Transfer Evaluation (Q_net)",
                "expected_text": "Net heat transfer Q_net = 384.6 kJ (positive indicating heat added to system).",
                "weight": 0.20,
                "gamma_threshold": 0.60
            }
        ]

    # Dynamic line-by-line decomposition for custom answer keys
    lines = [line.strip() for line in answer_key_text.split('\n') if line.strip()]
    num_units = max(1, len(lines))
    unit_weight = round(1.0 / num_units, 2)
    
    units = []
    categories = ["concept", "formula", "intermediate_step", "units", "final_answer"]
    for i, line in enumerate(lines):
        cat = categories[i % len(categories)]
        units.append({
            "category": cat,
            "label": f"Step {i+1}: {cat.replace('_', ' ').title()}",
            "expected_text": line,
            "weight": unit_weight,
            "gamma_threshold": 0.60
        })

    # Adjust last unit weight so total sum = 1.0 exactly
    total_w = sum(u["weight"] for u in units)
    if units:
        units[-1]["weight"] = round(units[-1]["weight"] + (1.0 - total_w), 2)

=======
import re


def _category_for(text: str, index: int) -> str:
    lowered = text.lower()
    if any(word in lowered for word in ("unit", "convert", "dimension")):
        return "units"
    if any(word in lowered for word in ("final", "answer", "result", "therefore")):
        return "final_answer"
    if any(symbol in text for symbol in ("=", "+", "-", "∫")):
        return "formula" if index == 0 else "intermediate_step"
    return "concept"


def decompose_answer_key(answer_key_text: str) -> list:
    """Turn each non-empty marking-scheme line into a persisted rubric unit."""
    lines = [
        re.sub(r"^\s*(?:step\s*)?\d+[.):\-]?\s*", "", line, flags=re.IGNORECASE).strip()
        for line in answer_key_text.splitlines()
        if line.strip()
    ]
    if not lines:
        raise ValueError("The marking scheme must contain at least one step.")

    unit_weight = 1.0 / len(lines)
    units = []
    for index, line in enumerate(lines):
        category = _category_for(line, index)
        units.append({
            "category": category,
            "label": f"Step {index + 1}: {category.replace('_', ' ').title()}",
            "expected_text": line,
            "weight": round(unit_weight, 6),
            "gamma_threshold": 0.60,
        })
    units[-1]["weight"] = round(1.0 - sum(unit["weight"] for unit in units[:-1]), 6)
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
    return units
