<<<<<<< HEAD
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer
    # Fast lightweight model
    ST_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    HAS_ST = True
except Exception:
    ST_MODEL = None
    HAS_ST = False

def compute_similarity(text1: str, text2: str) -> float:
    """
    Computes semantic similarity between text1 (student answer step) and text2 (rubric expected text).
    Uses SentenceTransformer if loaded, or TfidfVectorizer as deterministic fallback.
    Returns float in range [0.0, 1.0].
    """
    if not text1 or not text2:
        return 0.0
    
    text1_clean = text1.strip()
    text2_clean = text2.strip()

    if HAS_ST and ST_MODEL is not None:
        try:
            embeddings = ST_MODEL.encode([text1_clean, text2_clean])
            vec1 = embeddings[0].reshape(1, -1)
            vec2 = embeddings[1].reshape(1, -1)
            sim = float(cosine_similarity(vec1, vec2)[0][0])
            return max(0.0, min(1.0, sim))
        except Exception:
            pass

    # Deterministic TF-IDF Fallback
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english').fit([text1_clean, text2_clean])
        matrix = vectorizer.transform([text1_clean, text2_clean])
        sim = float(cosine_similarity(matrix[0], matrix[1])[0][0])
        return max(0.0, min(1.0, sim))
    except Exception:
        # Simple word overlap fallback
        words1 = set(text1_clean.lower().split())
        words2 = set(text2_clean.lower().split())
        if not words1 or not words2:
            return 0.0
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return float(len(intersection) / len(union))

def calculate_ras(step_matches: list) -> dict:
    """
    Calculates Rubric-Alignment Score (RAS).
    RAS = [ Sum(Matched_Units * Weight) / Sum(Total_Units * Weight) ] * 100
    Threshold gamma = 0.60
    """
    total_weighted_matched = 0.0
    total_weight = 0.0

    processed_steps = []
    for match in step_matches:
        weight = match.get('unit_weight', 0.20)
        gamma = match.get('similarity_score', 0.0)
        threshold = match.get('gamma_threshold', 0.60)
        
        total_weight += weight

        if gamma >= threshold:
            status = 'MATCHED'
            total_weighted_matched += (1.0 * weight)
        elif gamma >= 0.35:
            status = 'WEAK'
            total_weighted_matched += (0.5 * weight)
        else:
            status = 'MISSING'
            total_weighted_matched += 0.0

        processed_steps.append({
            **match,
            'status': status
        })

    ras_percentage = (total_weighted_matched / total_weight * 100.0) if total_weight > 0 else 0.0
    return {
        'total_ras_score': round(ras_percentage, 2),
        'steps': processed_steps
    }
=======
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
>>>>>>> da10bef05cedf4d95449967b0d62ea96e3edca49
