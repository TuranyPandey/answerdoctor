import math
import re
from collections import Counter


def _features(text: str) -> list[str]:
    """Return stable unigram and bigram features without native dependencies."""
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    bigrams = [f"{left}_{right}" for left, right in zip(tokens, tokens[1:])]
    return tokens + bigrams


def compute_similarity(text1: str, text2: str) -> float:
    """Compute a deterministic two-document TF-IDF cosine similarity."""
    if not text1 or not text2:
        return 0.0

    counts = [Counter(_features(text1)), Counter(_features(text2))]
    vocabulary = set(counts[0]) | set(counts[1])
    if not vocabulary:
        return 0.0

    vectors = []
    for current in counts:
        vector = {}
        total = sum(current.values()) or 1
        for term in vocabulary:
            document_frequency = int(term in counts[0]) + int(term in counts[1])
            inverse_document_frequency = math.log(3 / (1 + document_frequency)) + 1
            vector[term] = (current[term] / total) * inverse_document_frequency
        vectors.append(vector)

    dot_product = sum(vectors[0][term] * vectors[1][term] for term in vocabulary)
    magnitude_a = math.sqrt(sum(value * value for value in vectors[0].values()))
    magnitude_b = math.sqrt(sum(value * value for value in vectors[1].values()))
    if not magnitude_a or not magnitude_b:
        return 0.0
    return round(max(0.0, min(1.0, dot_product / (magnitude_a * magnitude_b))), 4)


def calculate_ras(step_matches: list) -> dict:
    """Calculate weighted Rubric-Alignment Score (RAS)."""
    total_weighted_matched = 0.0
    total_weight = 0.0
    processed_steps = []

    for match in step_matches:
        weight = match.get('unit_weight', 0.20)
        similarity = match.get('similarity_score', 0.0)
        threshold = match.get('gamma_threshold', 0.60)
        total_weight += weight

        if similarity >= threshold:
            status = 'MATCHED'
            total_weighted_matched += weight
        elif similarity >= 0.35:
            status = 'WEAK'
            total_weighted_matched += 0.5 * weight
        else:
            status = 'MISSING'

        processed_steps.append({**match, 'status': status})

    ras_percentage = (total_weighted_matched / total_weight * 100.0) if total_weight else 0.0
    return {'total_ras_score': round(ras_percentage, 2), 'steps': processed_steps}
