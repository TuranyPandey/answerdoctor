# Review 2 Prototype Guide

The canonical setup and scope are in [README.md](README.md). This file is limited to the judge demonstration.

## Four-minute flow

1. Open the role selector and state that authentication is represented by clearly labelled demo access.
2. Enter the faculty view and identify the seeded 240-script **simulation**, not a processed production cohort.
3. Open **Auto-Evaluator & Rubric Studio**. Evaluate two transcribed answer steps against rubric 1.
4. Point out that the result is returned by FastAPI and saved as a new submission.
5. Sign out, enter the student view, and open the weak reference-state step.
6. Complete the targeted retry. Show that the updated RAS is loaded from the database.
7. Return to the teacher story: repeated misconceptions become a lecture-level signal; CMI only creates a human-review queue.

## Say clearly

- Implemented: deterministic rubric matching, persisted results, Reasoning Map, targeted retry, seeded analytics and CMI examples.
- Simulated: the 240-script cohort and pre-extracted handwritten answer text.
- Roadmap: production OAuth, OCR/batch ingestion, Supabase/PostgreSQL, LangGraph/LLM orchestration and LMS integration.

## Do not claim

- Do not call Demo access Google OAuth.
- Do not say 240 handwritten scripts were uploaded or OCR-processed.
- Do not call the seeded CMI pair an automatic cheating verdict.
- Do not call the current prototype production-ready.

## Demo inputs

Student name: `Review Two Demo`

Register number: `DEMO-REVIEW-2`

Weak step:

```text
Applied the energy balance directly without defining the reference state.
```

Matched formula step:

```text
Q - W = delta U where delta U = m c_v (T2 - T1).
```

Run `python scratch\test_pipeline.py` immediately before rehearsal to restore deterministic seeded data.
