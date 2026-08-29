# AnswerDoctor

**AnswerDoctor finds where a student’s reasoning broke—not only whether the final answer was wrong.**

Teachers usually return a mark. Students still have to guess which assumption, formula, transformation, or unit caused them to lose it. AnswerDoctor turns a worked STEM answer into a sequence of assessable reasoning steps, compares those steps with the teacher’s marking guide, and converts the result into feedback that both sides can act on.

[Live prototype](https://answerdoctor.vercel.app) · [Figma UX prototype](https://www.figma.com/make/19wspIBkxbxynYj3YoGwBA/Untitled) · [Repository](https://github.com/sohum123451/answerdoctor)

## The problem

Subjective engineering answers are difficult to evaluate at scale. A correct final value can hide weak reasoning, while one early mistake can make every later line appear wrong. Conventional plagiarism tools also struggle with mathematical work: equations naturally look alike, but an unusual shared mistake can be more revealing than matching words.

AnswerDoctor is built around two questions:

1. Where did this student’s reasoning first diverge from the marking guide?
2. Is the same misunderstanding appearing across the class—or unusually across a pair of answers?

## The experience

### For teachers

The teacher workspace summarizes where a class is losing marks, shows performance against each marking-guide step, and surfaces unusually similar answers for human review. A teacher can also create a marking guide and evaluate a worked answer step by step.

The similarity view is deliberately a review aid. AnswerDoctor does not automatically declare misconduct; it presents the shared wording and error pattern so the teacher can make that decision.

### For students

The student workspace replaces a single unexplained score with a Reasoning Map. Each step is labelled as meeting the guide, needing work, or missing. The student can inspect the first reasoning break, answer a focused retry question, and see recovery credit reflected in the score.

The intended loop is simple:

**See the break → understand why it matters → retry that concept → verify recovery.**

## How AnswerDoctor evaluates an answer

### 1. Decompose the marking guide

The marking guide is separated into weighted units such as the governing concept, formula, intermediate transformation, unit handling, and final result. The included thermodynamics scenario uses five units whose weights total 100%.

### 2. Align answer steps

Each student step is compared with its expected rubric unit. The backend supports SentenceTransformer embeddings when available and falls back to deterministic TF–IDF similarity. A configurable similarity threshold decides whether a unit is matched, weak, or missing.

### 3. Calculate the Rubric-Alignment Score

The **Rubric-Alignment Score (RAS)** is the weighted share of the marking guide satisfied by the answer:

`RAS = weighted matched rubric units / total rubric weight × 100`

This makes the score traceable: every awarded or lost portion maps back to a specific expectation in the marking guide.

### 4. Build a Reasoning Map

The evaluation is presented as a sequence rather than a verdict. In the demo, the important break occurs when the student applies the First Law before defining the required reference state. Later steps can still be recognized instead of being discarded because of that earlier omission.

### 5. Compare cohort error patterns

The **Cohort Malpractice Index (CMI)** combines semantic similarity with shared error-pattern similarity:

`CMI(A, B) = semantic similarity × shared error-pattern match`

A high score creates a teacher-review flag. It is contextual evidence, not an automatic accusation.

## Demonstration scenario

The current prototype follows an Applied Thermodynamics CAT-1 answer about the First Law and state-reference equations.

- The database seed contains one teacher, four students, one classroom, one assignment, five rubric units, and four example submissions.
- Class analytics expand those examples into an explicitly labelled **240-answer simulated cohort** for demonstration.
- The displayed class average of **74.5%**, error clusters, and similarity pair are seeded scenario values—not results from 240 uploaded papers.
- The targeted retry demonstrates a student improving from **60% to 70% RAS** after recovering the missing reference-state concept.

All names, answers, scores, and integrity signals in this scenario are synthetic demonstration data. No VIT student dataset or external answer-script dataset was used.

## What is working today

- Role-based teacher and student prototype journeys
- Weighted rubric decomposition for custom marking guides
- Step-level semantic alignment with deterministic fallback
- RAS calculation and diagnostic feedback
- Seeded classroom analytics and recurring-error clusters
- CMI pair comparison and teacher review interface
- Student Reasoning Map and targeted retry interaction
- SQLite-backed API models for users, classrooms, assignments, submissions, rubric units, retries, PYQs, and doubts
- Responsive React interface with FastAPI endpoints

## Prototype boundaries

AnswerDoctor is a hackathon prototype, not a production assessment system.

- Demo access is not production authentication.
- The visible OCR spike currently returns simulated structured extraction; it has not been validated on a real uploaded handwriting dataset.
- Several dashboard interactions use deterministic seeded or browser-side logic to keep the demonstration reliable.
- The 240-answer view is a simulated cohort derived from the small seeded scenario.
- CMI requires faculty interpretation and must not be treated as proof of misconduct.
- Accuracy, fairness, accessibility, privacy, and institutional workflow validation remain future work.

These constraints are intentional: the prototype demonstrates the reasoning-feedback loop without presenting untested capabilities as complete.

## Technology

AnswerDoctor uses React, Vite and Tailwind CSS for the interface; FastAPI, SQLAlchemy and SQLite for the API and persistence layer; and SentenceTransformers or TF–IDF for semantic alignment. The repository also contains the rubric decomposition, diagnosis, retry, cohort-analysis, PYQ, and doubt-service modules used by the demonstration.

## Team

Built by **Team trpSurgewave** for VIT GDG DevJams 2026:

- Mangalapalli Sohum Seshu Krish (`26BCE0616`)
- Turany Pandey (`26BCE0646`)

## Vision

AnswerDoctor’s long-term goal is not faster automated marking for its own sake. It is a feedback system in which every score can be explained, every misconception can become a targeted learning activity, and every class-level pattern can help a teacher decide what to teach next.

MIT License.
