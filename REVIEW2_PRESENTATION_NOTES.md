# AnswerDoctor Review 2 - Presenter Notepad

Use the words shown in the UI first. Mention the technical name only if a judge asks how it works.

## Teacher UI: renamed / also known as

- **Class Overview** - previously “Classroom Analytics & Charts.” Also known as the teacher analytics dashboard.
- **Average Reasoning Score** - also known as **RAS**, or Rubric-Alignment Score. It is the weighted score for how many marking-guide steps the answer satisfies.
- **Demo Class Size** - previously “Seeded Scenario Size.” The 240 answers are a simulated cohort used to demonstrate patterns; they were not uploaded and OCR-processed.
- **Similar Answers to Review** - previously “Flagged Collusion Pairs.” A flag asks the teacher to compare two answers; it is not a cheating verdict.
- **Where Students Lost Marks** - previously “Rubric Unit Pass Rates.” Each bar shows the percentage of the demo class satisfying that marking-guide step.
- **Common Class Mistakes** - previously “Error Misconception Clusters.” These group repeated reasoning errors that may need reteaching.
- **Similarity Review** - previously “Malpractice Radar.” The technical score is **CMI**, or Cohort Malpractice Index.
- **Review threshold: 0.88 CMI** - technical rule used to shortlist unusually similar answers for human review.
- **Grade an Answer** - previously “Auto-Evaluator & Rubric Studio.” This is the live teacher flow.
- **Create a Marking Guide** - previously “Decompose Rubric into Atomic Units.” The system splits the expected answer into independently checkable steps.
- **Check a Student Answer** - previously “Evaluate Custom Student Derivation.” It compares each transcribed answer step with its corresponding marking-guide step.
- **Past Papers** - previously “PYQ Vault Archive.” PYQ means Previous Year Question.

## Student UI: renamed / also known as

- **My Results** - previously “My Submissions & Analysis.”
- **Fix My Mistakes** - previously “Reasoning Map & Step Retries.” The technical visual is the **Reasoning Map**.
- **Ask Why** - previously “AI Doubt Center.” In Review 2 this is a deterministic prototype guide, not a general-purpose AI tutor.
- **Practice Papers** - previously “PYQ Repository Vault.”
- **Overall Reasoning Score** - also known as RAS. It is calculated from the weighted marking-guide steps.
- **How Each Step Matched the Marking Guide** - previously “Step-by-Step Similarity Alignment.”
- **Steps Meeting the Marking Guide** - previously “Step Competency Breakdown.”
- **Teacher Similarity Review** - previously “Flagged for Review.” Emphasize that the teacher makes the decision.
- **How Your Answer Progressed** - previously “Flowchart Reasoning Map.”
- **First Step to Fix** - previously “Reasoning Break Detected.”
- **Practise this step to recover marks** - previously “Step Retry Drill.”
- **Demo Text-Reading Confidence** - previously “OCR Confidence.” This value is seeded for the prototype because live handwriting OCR is not implemented yet.

## Deliberately omitted or softened in the UI

- **Google SSO / password login** - omitted because production authentication is not implemented. The UI says Demo access.
- **Agentic / AI grading claims** - omitted from core actions. The current scorer is deterministic pure-Python TF-IDF matching; it is not an LLM making the grade.
- **Automatic malpractice accusation** - omitted. CMI only creates a teacher review queue.
- **Live OCR and batch upload claims** - omitted. Review 2 uses pre-transcribed answer steps and a seeded text-reading confidence value.
- **Supabase/PostgreSQL claims** - omitted. The current hackathon build uses SQLite.
- **Production-ready wording** - omitted. Call it a working Review 2 prototype.

## Thirty-second explanation

“AnswerDoctor breaks the teacher’s marking guide into checkable reasoning steps. It compares a student’s solution step by step, shows the first place the reasoning diverged, and gives the student a focused retry. The teacher also sees repeated class mistakes and a human-review queue for unusually similar answers. For this review, the live evaluation and retry are database-backed; the 240-student class and handwriting extraction are clearly labelled simulations.”

## If a judge asks what is actually live

- Live: marking-guide creation, deterministic answer checking, database persistence, Reasoning Map, retry and RAS update.
- Seeded demonstration: 240-answer cohort analytics, CMI example, past papers and text-reading confidence.
- Roadmap: handwriting OCR, batch uploads, production OAuth, PostgreSQL/Supabase, LangGraph/LLM orchestration and LMS integration.
