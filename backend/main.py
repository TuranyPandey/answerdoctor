import os
import json
import base64
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

app = FastAPI(title="AnswerDoctor Core API", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def evaluate_with_gemini(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
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

async def evaluate_with_reka(file_bytes: bytes, mime_type: str, rubric_context: str) -> dict:
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

async def run_evaluation_pipeline(file_bytes: bytes, mime_type: str, rubric_context: str, provider: str = "gemini") -> dict:
    if provider == "reka":
        return await evaluate_with_reka(file_bytes, mime_type, rubric_context)
    try:
        return await evaluate_with_gemini(file_bytes, mime_type, rubric_context)
    except Exception as gemini_err:
        if reka_client:
            return await evaluate_with_reka(file_bytes, mime_type, rubric_context)
        raise gemini_err

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

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents_payload,
            config=types.GenerateContentConfig(
                system_instruction=DECOMPOSER_PROMPT,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
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
    evaluations = []

    for file in files:
        contents = await file.read()
        eval_result = await run_evaluation_pipeline(contents, file.content_type or "image/png", rubric_context, provider=provider)
        evaluations.append(eval_result)

    embeddings = []
    for ev in evaluations:
        text_summary = ev.get("derivation_text_summary") or str(ev.get("reasoning_map"))
        embed_resp = client.models.embed_content(
            model="text-embedding-004",
            contents=text_summary
        )
        embeddings.append(embed_resp.embedding.values)

    embeddings_matrix = np.array(embeddings)
    cos_sim_matrix = cosine_similarity(embeddings_matrix)

    collusion_flags = []
    n = len(evaluations)
    for i in range(n):
        for j in range(i + 1, n):
            sim = float(cos_sim_matrix[i][j])
            
            err_i = set(evaluations[i].get("error_pattern", []))
            err_j = set(evaluations[j].get("error_pattern", []))
            
            if not err_i and not err_j:
                err_match = 1.0
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
        "cohort_size": n,
        "evaluations": evaluations,
        "malpractice_radar": collusion_flags
    }