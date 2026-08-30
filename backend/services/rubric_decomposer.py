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
    return units
