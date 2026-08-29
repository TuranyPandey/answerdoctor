import os
import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError(f"GEMINI_API_KEY not found in {env_path}")

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AnswerDoctor Core API", version="1.2.0")

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

Ensure the weights of all units sum up to exactly 1.0.

Return ONLY a valid JSON object matching this schema:
{
  "question_title": "string",
  "total_weight": 1.0,
  "rubric_units": [
    {
      "step_id": 1,
      "title": "Short title of step",
      "target_concept": "Detailed expectation of this step",
      "weight": 0.25
    }
  ]
}
"""

ALIGNMENT_PROMPT = """
You are AnswerDoctor's Semantic Alignment and Diagnostic Agent.
Evaluate the student's handwritten answer script against the decomposed rubric units.

Rules:
1. Transcribe the student's handwritten work step by step.
2. Align each student step against the decomposed rubric units.
3. Classify each step:
   - "matched" (concept and math are correct)
   - "broken" (intermediate step has derivation errors, incorrect assumptions, or wrong formulas)
   - "missing" (required rubric unit was omitted completely)
4. Compute the Rubric-Alignment Score (RAS): sum(weights of matched units) / sum(all unit weights).
5. For any "broken" or "missing" step, write a concise, one-sentence diagnostic explanation pointing out the root cause.

Return ONLY a valid JSON object matching this schema:
{
  "student_id": "string",
  "ras_score": 0.0,
  "cohort_malpractice_flag": false,
  "reasoning_map": [
    {
      "step": 1,
      "label": "Rubric Unit Title",
      "status": "matched" | "broken" | "missing",
      "score": 0.0 to 1.0,
      "feedback": "One concise diagnosis sentence."
    }
  ]
}
"""

@app.get("/health")
def health():
    return {"status": "healthy", "service": "AnswerDoctor Pipeline"}

@app.post("/api/decompose-rubric")
async def decompose_rubric(
    rubric_file: Optional[UploadFile] = File(None),
    rubric_text: Optional[str] = Form(None)
):
    if not rubric_file and not rubric_text:
        raise HTTPException(status_code=400, detail="Provide either a rubric image/file or rubric text.")

    contents_payload = []
    
    if rubric_file:
        file_bytes = await rubric_file.read()
        contents_payload.append(
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=rubric_file.content_type or "image/png"
            )
        )
        contents_payload.append("Extract and decompose the grading rubric from this uploaded answer key/scheme:")
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
    decomposed_rubric_json: Optional[str] = Form(None)
):
    contents = await file.read()
    
    rubric_context = (
        decomposed_rubric_json 
        if decomposed_rubric_json 
        else "Default: 1. Concept/Formula, 2. Derivation Step, 3. Final Answer."
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                types.Part.from_bytes(
                    data=contents, 
                    mime_type=file.content_type or "image/png"
                ),
                f"Decomposed Rubric Units Context:\n{rubric_context}\n\nEvaluate student derivation steps:"
            ],
            config=types.GenerateContentConfig(
                system_instruction=ALIGNMENT_PROMPT,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")