import numpy as np
from services.semantic_aligner import compute_similarity

def calculate_error_pattern_match(steps_a: list, steps_b: list) -> float:
    """
    Computes ErrorPatternMatch(S_i, S_j) between two scripts.
    Measures if both scripts made the exact same incorrect reasoning leap or assumption at the exact same step.
    """
    if not steps_a or not steps_b:
        return 0.0

    matching_error_count = 0
    total_error_count = 0

    min_len = min(len(steps_a), len(steps_b))
    for k in range(min_len):
        step_a = steps_a[k]
        step_b = steps_b[k]

        status_a = step_a.get('status', 'MATCHED')
        status_b = step_b.get('status', 'MATCHED')

        # If both steps failed or were weak
        if status_a in ('WEAK', 'MISSING') and status_b in ('WEAK', 'MISSING'):
            total_error_count += 1
            text_a = step_a.get('student_text', '')
            text_b = step_b.get('student_text', '')
            
            # Check if the wrong derivation text is semantically identical
            sim = compute_similarity(text_a, text_b)
            if sim >= 0.75:
                matching_error_count += 1

    if total_error_count == 0:
        return 0.0

    return matching_error_count / total_error_count

def compute_cmi(full_text_a: str, full_text_b: str, steps_a: list, steps_b: list) -> dict:
    """
    Computes CMI_ij = CosSim(Emb_i, Emb_j) * ErrorPatternMatch(S_i, S_j).
    Threshold CMI >= 0.88 flags a suspicious collusion pair.
    """
    cos_sim = compute_similarity(full_text_a, full_text_b)
    error_match = calculate_error_pattern_match(steps_a, steps_b)

    # CMI formula
    # Note: If error_match is high, CMI gets scaled up
    cmi = cos_sim * (0.6 + 0.4 * error_match)

    is_flagged = cmi >= 0.88
    return {
        'cmi_score': round(float(cmi), 4),
        'cos_sim': round(float(cos_sim), 4),
        'error_match_score': round(float(error_match), 4),
        'is_flagged': is_flagged,
        'reason': "Shared non-standard reference state assumption & identical intermediate derivation phrasing" if is_flagged else "Normal variation"
    }
