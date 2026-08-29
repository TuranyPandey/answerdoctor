import os
import json
import base64
import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Annotated
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

try:
    from reka.client import Reka
except ImportError:
    Reka = None

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError(f"GEMINI_API_KEY not found in {env_path}")

client = genai.Client(api_key=GEMINI_API_KEY)

REKA_API_KEY = os.getenv("REKA_API_KEY")
reka_client = Reka(api_key=REKA_API_KEY) if (Reka and REKA_API_KEY) else None

app = FastAPI(title="AnswerDoctor Core API", version="1.4.1")

# --- CORS ---
# NOTE: allow_origins=["*"] combined with allow_credentials=True is rejected by
# browsers (invalid per the CORS spec), so any credentialed fetch from the
# frontend would silently fail. List explicit origins instead. Add your actual
# dev/prod frontend URLs here.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://answerdoctor.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# How long to wait on a single Gemini/Reka call before treating it as a
# provider hang and failing fast (into fallback / a per-script error entry)
# rather than freezing the request indefinitely.
PROVIDER_TIMEOUT_SECONDS = 20

DECOMPOSER_PROMPT = """
You are AnswerDoctor's Rubric Decomposer Agent.
Analyze the provided exam question and answer key/marking scheme.
Break it down into atomic, gradable reasoning units:
1. Concept Identification / Given conditions
2. Governing Formula / Law
3. Intermediate Derivation Steps / Mathematical logic
4. Transformation / Units / Calculation
5. Final Numeric / Symbolic Result

Ensure weights sum to 1.0.
Return ONLY valid JSON:
{
  "question_title": "string",
  "total_weight": 1.0,
  "rubric_units": [
    {
      "step_id": 1,
      "title": "Short title of step",
      "target_concept": "Detailed expectation",
      "weight": 0.25
    }
  ]
}
"""

ALIGNMENT_PROMPT = """
You are AnswerDoctor's Semantic Alignment and Diagnostic Agent.
Evaluate the student's handwritten answer script against the decomposed rubric units.

Rules:
1. Extract student ID (or generate a mock ID like 26BCE0616 if unreadable).
2. Transcribe the student's handwritten steps and mathematical derivation.
3. Align each student step against the rubric units:
   - "matched" (concept and math are correct)
   - "broken" (intermediate step has derivation errors, incorrect assumptions, or wrong formulas)
   - "missing" (required rubric unit was omitted completely)
4. Compute the Rubric-Alignment Score (RAS): sum(weights of matched units) / sum(all unit weights).
5. For any "broken" or "missing" step, write a concise, one-sentence diagnostic explanation pointing out the root cause.
6. Provide a concise summary of the student's overall derivation steps and phrasing for embedding checks.

Return ONLY a valid JSON object matching this schema:
{
  "student_id": "string",
  "ras_score": 0.0,
  "derivation_text_summary": "string summarizing their derivation and mathematical phrasing",
  "error_pattern": [1, 2],
  "reasoning_map": [
    {
      "step": 1,
      "label": "Rubric Unit Title",
      "status": "matched",
      "score": 1.0,
      "feedback": "One concise diagnosis sentence."
    }
  ]
}
"""


# ---------------------------------------------------------------------------
# Provider calls
#
# The google-genai / reka-api clients used here are synchronous, so each call
# is pushed onto a worker thread via asyncio.to_thread. That lets FastAPI run
# several evaluations concurrently (see batch_evaluate) instead of blocking
# the event loop on each one sequentially, and lets us wrap each call with a
# timeout so a hung provider fails fast instead of freezing the request.
# ---------------------------------------------------------------------------

def _call_gemini_evaluate(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            f"Rubric Units:\n{rubric_context}\n\nEvaluate student derivation steps:"
        ],
        config=types.GenerateContentConfig(
            system_instruction=ALIGNMENT_PROMPT,
            response_mime_type="application/json"
        )
    )
    return json.loads(response.text)


async def evaluate_with_gemini(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
    return await asyncio.wait_for(
        asyncio.to_thread(_call_gemini_evaluate, file_bytes, mime_type, rubric_context),
        timeout=PROVIDER_TIMEOUT_SECONDS,
    )


def _call_reka_evaluate(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
    if not reka_client:
        raise HTTPException(status_code=500, detail="REKA_API_KEY is not configured or reka-api is not installed.")

    base64_image = base64.b64encode(file_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_image}"
    prompt = f"{ALIGNMENT_PROMPT}\n\nDecomposed Rubric Units Context:\n{rubric_context}\n\nEvaluate student derivation steps. Output ONLY valid JSON."

    response = reka_client.chat.create(
        model="reka-flash",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": data_url},
                    {"type": "text", "text": prompt}
                ]
            }
        ]
    )
    raw_content = response.responses[0].message.content.strip()
    if raw_content.startswith("```json"):
        raw_content = raw_content.removeprefix("```json").removesuffix("```").strip()
    elif raw_content.startswith("```"):
        raw_content = raw_content.removeprefix("```").removesuffix("```").strip()

    return json.loads(raw_content)


async def evaluate_with_reka(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
    if not reka_client:
        raise HTTPException(status_code=500, detail="REKA_API_KEY is not configured or reka-api is not installed.")
    return await asyncio.wait_for(
        asyncio.to_thread(_call_reka_evaluate, file_bytes, mime_type, rubric_context),
        timeout=PROVIDER_TIMEOUT_SECONDS,
    )


async def run_evaluation_pipeline(file_bytes: bytes, mime_type: str, rubric_context: str, provider: str = "gemini") -> dict:
    if provider == "reka":
        return await evaluate_with_reka(file_bytes, mime_type, rubric_context)
    try:
        return await evaluate_with_gemini(file_bytes, mime_type, rubric_context)
    except Exception as gemini_err:
        if reka_client:
            return await evaluate_with_reka(file_bytes, mime_type, rubric_context)
        raise gemini_err


async def safe_evaluate(file_bytes: bytes, mime_type: str, rubric_context: str, provider: str, fallback_id: str) -> dict:
    """
    Wraps run_evaluation_pipeline so that ONE bad script (bad scan, malformed
    model JSON, provider timeout) can't take down an entire batch request.
    Failures degrade to a flagged entry for manual review instead of a 500
    that aborts every other script in the batch.
    """
    try:
        return await run_evaluation_pipeline(file_bytes, mime_type, rubric_context, provider=provider)
    except Exception as e:
        return {
            "student_id": fallback_id,
            "evaluation_failed": True,
            "error": str(e),
            "ras_score": None,
            "derivation_text_summary": None,
            "error_pattern": [],
            "reasoning_map": [],
        }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AnswerDoctor Core",
        "providers": {
            "gemini": True,
            "reka": reka_client is not None
        }
    }


@app.post("/api/decompose-rubric")
async def decompose_rubric(
    rubric_file: Optional[UploadFile] = File(None),
    rubric_text: Optional[str] = Form(None)
):
    if not rubric_file and not rubric_text:
        raise HTTPException(status_code=400, detail="Provide either a rubric file or rubric text.")

    contents_payload = []
    if rubric_file:
        file_bytes = await rubric_file.read()
        contents_payload.append(types.Part.from_bytes(data=file_bytes, mime_type=rubric_file.content_type or "image/png"))
        contents_payload.append("Extract and decompose the grading rubric from this uploaded answer key:")
    else:
        contents_payload.append(f"Deconstruct this marking scheme into atomic steps:\n\n{rubric_text}")

    def _call_decompose():
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents_payload,
            config=types.GenerateContentConfig(
                system_instruction=DECOMPOSER_PROMPT,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)

    try:
        return await asyncio.wait_for(asyncio.to_thread(_call_decompose), timeout=PROVIDER_TIMEOUT_SECONDS)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {str(e)}")


@app.post("/api/evaluate")
async def evaluate_script(
    file: UploadFile = File(...),
    decomposed_rubric_json: Optional[str] = Form(None),
    provider: Optional[str] = Query("gemini", description="Inference engine provider: 'gemini' or 'reka'")
):
    contents = await file.read()
    rubric_context = decomposed_rubric_json or "Default: 1. Approach and Formula, 2. Derivation Step, 3. Final Answer."
    try:
        return await run_evaluation_pipeline(contents, file.content_type or "image/png", rubric_context, provider=provider)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@app.post("/api/batch-evaluate")
async def batch_evaluate(
    files: Annotated[list[UploadFile], File(description="Upload multiple student answer scripts")],
    decomposed_rubric_json: Optional[str] = Form(None),
    provider: Optional[str] = Query("gemini", description="Inference engine provider: 'gemini' or 'reka'")
):
    rubric_context = decomposed_rubric_json or "Default: 1. Approach and Formula, 2. Derivation Step, 3. Final Answer."

    # Read all uploads up front (UploadFile streams can't be read concurrently
    # from multiple tasks), then fan the actual evaluations out concurrently.
    file_payloads = [(await f.read(), f.content_type or "image/png") for f in files]

    evaluations = await asyncio.gather(*[
        safe_evaluate(contents, mime, rubric_context, provider, fallback_id=f"Student_{i+1}")
        for i, (contents, mime) in enumerate(file_payloads)
    ])

    # Only embed scripts that actually evaluated successfully — a failed
    # entry has no derivation_text_summary worth comparing, and shouldn't
    # be silently treated as similarity 0 against everyone else.
    embeddable_indices = [i for i, ev in enumerate(evaluations) if not ev.get("evaluation_failed")]

    def _embed(text_summary: str):
        embed_resp = client.models.embed_content(
            model="text-embedding-004",
            contents=text_summary
        )
        return embed_resp.embedding.values

    embeddings = {}
    if embeddable_indices:
        embed_results = await asyncio.gather(*[
            asyncio.to_thread(
                _embed,
                evaluations[i].get("derivation_text_summary") or str(evaluations[i].get("reasoning_map"))
            )
            for i in embeddable_indices
        ])
        embeddings = dict(zip(embeddable_indices, embed_results))

    cos_sim_matrix = None
    if len(embeddable_indices) >= 2:
        embeddings_matrix = np.array([embeddings[i] for i in embeddable_indices])
        cos_sim_matrix = cosine_similarity(embeddings_matrix)

    collusion_flags = []
    for a, i in enumerate(embeddable_indices):
        for b, j in enumerate(embeddable_indices):
            if b <= a:
                continue

            sim = float(cos_sim_matrix[a][b])

            err_i = set(evaluations[i].get("error_pattern", []))
            err_j = set(evaluations[j].get("error_pattern", []))

            if not err_i and not err_j:
                # Both scripts are fully correct — there's no shared *mistake*
                # for the malpractice radar to catch here, so don't let high
                # embedding similarity between two clean, independently-correct
                # answers alone trigger a collusion flag.
                err_match = 0.0
            elif not err_i or not err_j:
                err_match = 0.2
            else:
                err_match = len(err_i.intersection(err_j)) / len(err_i.union(err_j))

            cmi = sim * err_match
            is_flagged = cmi >= 0.88

            if is_flagged:
                evaluations[i]["cohort_malpractice_flag"] = True
                evaluations[j]["cohort_malpractice_flag"] = True

            collusion_flags.append({
                "student_a": evaluations[i].get("student_id", f"Student_{i+1}"),
                "student_b": evaluations[j].get("student_id", f"Student_{j+1}"),
                "cosine_similarity": round(sim, 3),
                "error_pattern_match": round(err_match, 3),
                "cmi_score": round(cmi, 3),
                "flagged": is_flagged
            })

    return {
        "cohort_size": len(evaluations),
        "evaluated_count": len(embeddable_indices),
        "failed_count": len(evaluations) - len(embeddable_indices),
        "evaluations": evaluations,
        "malpractice_radar": collusion_flags
    }