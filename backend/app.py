import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Load the .env file automatically
load_dotenv()

from fuzzy_engine import FuzzyMarkingSystem
from analytics import PathPerformanceAnalytics
from theory_repo import FLASHCARD_REPOSITORY
from tutor_graph import compiled_tutor_app

app = FastAPI(title="Unified Agentic Socratic Tutoring Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API PAYLOAD SCHEMAS ---
class ChatSessionPayload(BaseModel):
    message: str
    time_taken: int
    consecutive_errors: int
    current_tier: str
    current_subject: str
    history: list[dict] = []

class ShortAnswerPayload(BaseModel):
    question_text: str
    student_raw_input: str
    expected_answer: str
    seconds_spent: int
    attempts_count: int
    current_tier: str
    current_subject: str
    hint_formula: str = ""
    hint_misconception: str = ""

class ExamSubmissionPayload(BaseModel):
    correct_answers: int = 0
    total_questions: int = 0
    total_elapsed_time: int = 0
    current_tier: str
    current_subject: str
    mock_chat_history: list[dict] = []
    question_details: list[dict] = []

class TheoryRequestPayload(BaseModel):
    current_tier: str
    current_subject: str

# --- CORE RAG UTILITY FACTORY ---
def execute_rag_vector_lookup(subject: str, tier: str, query: str) -> list[str]:
    """
    Queries the background vector store infrastructure (ChromaDB collection) 
    to retrieve localized, verified semantic core chunks.
    """
    try:
        from database_ingest import DatabaseIngestPipeline
        pipeline = DatabaseIngestPipeline()
        results = pipeline.curriculum_collection.query(
            query_texts=[query],
            n_results=3,
            where={"$and": [{"academic_tier": tier}, {"subject": subject}]}
        )
        return results['documents'][0] if results and results.get('documents') else []
    except Exception:
        return [f"Core textbook reference material for {tier} level structural {subject} parameters."]

# --- BACKEND ENDPOINT ROUTERS ---

@app.post("/api/tutor/load-theory")
async def load_dynamic_theory(payload: TheoryRequestPayload):
    subject_repo = FLASHCARD_REPOSITORY.get(payload.current_subject, {})
    tier_data = subject_repo.get(payload.current_tier, {"cards": [], "quizzes": [], "finalExam": []})
    return {
        "cards": tier_data.get("cards", []),
        "quizzes": tier_data.get("quizzes", []),
        "finalExam": tier_data.get("finalExam", [])
    }

@app.post("/api/tutor/chat")
async def run_session_cycle(payload: ChatSessionPayload):
    """
    Socratic Mock Practice Test Agent (100% Local Inference Execution).
    Runs the student session through the LangGraph state machine workflow using local Ollama processing.
    """
    messages_history = []
    for chat in payload.history[-4:]:
        if chat.get("sender") in ["user", "student"]:
            messages_history.append(HumanMessage(content=chat["text"]))
        else:
            messages_history.append(AIMessage(content=chat["text"]))

    # Append current message turn
    messages_history.append(HumanMessage(content=payload.message))

    initial_graph_state = {
        "messages": messages_history,
        "time_taken_seconds": payload.time_taken,
        "consecutive_errors": payload.consecutive_errors,
        "requires_remedial_routing": False,
        "retrieved_curriculum": [],
        "active_agent_node": "Initialization",
        "subject": payload.current_subject,
        "academic_tier": payload.current_tier
    }

    # Execute LangGraph stateful workflow
    final_graph_state = compiled_tutor_app.invoke(initial_graph_state)
    response_text = final_graph_state["messages"][-1].content

    return {
        "response": response_text,
        "active_node": final_graph_state["active_agent_node"],
        "remedial_triggered": final_graph_state["requires_remedial_routing"],
        "context_pulled": final_graph_state["retrieved_curriculum"]
    }

@app.post("/api/tutor/evaluate-short-answer")
async def evaluate_short_answer(payload: ShortAnswerPayload):
    """
    3-Stage Pipeline for Mamdani-driven adaptive hint generation.

    Stage 1 — Gemini Diagnostic Grader
        Scores the answer AND produces a precise gap_analysis string that
        identifies exactly what was wrong in the student's specific response
        (wrong formula, wrong unit, wrong sign, missing step, etc.).

    Stage 2 — Mamdani Fuzzy Inference System
        Takes (accuracy_pct, seconds_spent) → fuzzy_score, performance_tier,
        linguistic_remark, degree_of_failure.

    Stage 3 — Mamdani-Calibrated Gemini Hint
        The hint type is entirely determined by the Mamdani output:
          degree_of_failure >= 60  →  "Intervention Required" tier
                                       Gemini delivers the full formula walkthrough,
                                       anchored to the gap_analysis.
          degree_of_failure <  60  →  "Developing" tier
                                       Gemini delivers a Socratic nudge that
                                       targets ONLY the specific gap identified.
    This guarantees every hint is about the student's actual mistake, not generic.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key missing from backend environment.")

    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2, google_api_key=api_key)

    # ══════════════════════════════════════════════════════════════════════════════
    # STAGE 1 — Combined Grading + Specific Gap Diagnosis
    # We ask Gemini to simultaneously score and diagnose the exact error so that
    # the hint is always anchored to what the student actually got wrong.
    # ══════════════════════════════════════════════════════════════════════════════
    diagnostic_prompt = (
        "You are a precise academic grading diagnostic engine.\n\n"
        f"SUBJECT: {payload.current_subject} | LEVEL: {payload.current_tier}\n"
        f"QUESTION: {payload.question_text}\n"
        f"EXPECTED ANSWER: {payload.expected_answer}\n"
        f"STUDENT SUBMITTED: {payload.student_raw_input}\n\n"
        "Your job is TWO things:\n"
        "  A) Score the student's answer with partial credit (accept unit variants, rounding ±5%, white-space).\n"
        "  B) Write a 1-2 sentence gap_analysis that describes the SPECIFIC error in the student's\n"
        "     submission. Be precise: name the wrong value, missing concept, incorrect unit, wrong sign,\n"
        "     or missing step. Do NOT be generic ('the answer is wrong'). Reference the student's actual words.\n\n"
        "Respond ONLY with a minified JSON object — no markdown, no explanation:\n"
        '{"accuracy_percentage": <float 0.0-100.0>, "is_logically_correct": <true|false>, '
        '"gap_analysis": "<1-2 sentence diagnosis of the exact error in the student\'s answer>"}'
    )
    gap_analysis = "No specific error analysis available."
    try:
        diag_res   = model.invoke([HumanMessage(content=diagnostic_prompt)])
        clean_json = diag_res.content.replace("```json", "").replace("```", "").strip()
        diag_data  = json.loads(clean_json)
        base_accuracy = float(diag_data.get("accuracy_percentage", 0.0))
        is_correct    = bool(diag_data.get("is_logically_correct", False))
        gap_analysis  = str(diag_data.get("gap_analysis", gap_analysis)).strip()
    except Exception:
        is_correct    = payload.student_raw_input.strip().lower() == payload.expected_answer.strip().lower()
        base_accuracy = 100.0 if is_correct else 0.0
        gap_analysis  = (
            f"The student wrote '{payload.student_raw_input}' but the expected answer "
            f"is '{payload.expected_answer}'."
        )

    # ══════════════════════════════════════════════════════════════════════════════
    # STAGE 2 — Attempt Penalty + Mamdani Fuzzy Inference
    # ══════════════════════════════════════════════════════════════════════════════
    if is_correct and payload.attempts_count > 1:
        accuracy_pct = max(50.0, base_accuracy - ((payload.attempts_count - 1) * 15.0))
    else:
        accuracy_pct = base_accuracy

    evaluation        = FuzzyMarkingSystem.evaluate_performance(accuracy_pct, payload.seconds_spent)
    fuzzy_score       = evaluation["fuzzy_score"]
    performance_tier  = evaluation["performance_tier"]
    linguistic_remark = evaluation["linguistic_remark"]
    degree_of_failure = round(100.0 - fuzzy_score, 1)

    # ══════════════════════════════════════════════════════════════════════════════
    # STAGE 3 — Mamdani-Calibrated Gemini Hint
    # The gap_analysis from Stage 1 is the ANCHOR of every hint prompt.
    # Mamdani tier decides depth: full walkthrough vs. Socratic nudge.
    # ══════════════════════════════════════════════════════════════════════════════
    hint_response = ""
    if not is_correct:
        # Common context block injected into every hint prompt
        shared_context = (
            f"SUBJECT: {payload.current_subject} | LEVEL: {payload.current_tier}\n"
            f"QUESTION: {payload.question_text}\n"
            f"STUDENT'S ANSWER: {payload.student_raw_input}\n"
            f"EXPECTED ANSWER: {payload.expected_answer}\n\n"
            f"MAMDANI FUZZY SYSTEM DIAGNOSIS:\n"
            f"  Performance Tier   : {performance_tier}\n"
            f"  Fuzzy Score        : {fuzzy_score}%\n"
            f"  Degree of Failure  : {degree_of_failure}%\n"
            f"  Linguistic Verdict : {linguistic_remark}\n\n"
            f"SPECIFIC ERROR IN STUDENT'S ANSWER (from diagnostic engine):\n"
            f"  {gap_analysis}\n\n"
        )

        if degree_of_failure >= 60.0:
            # ── INTERVENTION REQUIRED: Full remediation with formula ──────────
            hint_prompt = (
                "You are an academic remediation tutor. The Mamdani Fuzzy System has classified "
                "this student in the 'Intervention Required' tier — they need a full worked solution.\n\n"
                + shared_context +
                f"GOVERNING FORMULA / KEY CONCEPT: {payload.hint_formula or 'derive from question'}\n\n"
                "DIRECTIVE:\n"
                "1. In ONE sentence, confirm exactly what the student got wrong (reference their answer).\n"
                "2. State the governing formula clearly.\n"
                "3. Substitute the correct values step-by-step and show the full solution.\n"
                "4. Keep the language direct and encouraging.\n"
                "Do NOT be generic. Every sentence must be about THIS student's specific mistake."
            )
        else:
            # ── DEVELOPING: Targeted Socratic nudge ──────────────────────────
            hint_prompt = (
                "You are a Socratic tutoring assistant. The Mamdani Fuzzy System has classified "
                "this student in the 'Developing' tier — they are close but need a targeted nudge.\n\n"
                + shared_context +
                f"KNOWN MISCONCEPTION PATTERN: {payload.hint_misconception or 'general conceptual gap'}\n\n"
                "DIRECTIVE:\n"
                "1. In ONE sentence, pinpoint exactly what is wrong in the student's answer "
                "   (reference their specific words/values).\n"
                "2. Ask ONE Socratic question that leads them to discover the correct approach "
                "   without giving away the answer or formula.\n"
                "3. Optionally add a one-sentence conceptual reminder.\n"
                "Do NOT be generic. Every sentence must address THIS student's specific error."
            )

        response      = model.invoke([HumanMessage(content=hint_prompt)])
        hint_response = response.content
    else:
        hint_response = (
            f"Correct! {linguistic_remark} "
            f"Fuzzy Mastery Score: {fuzzy_score}% — {performance_tier}."
        )

    return {
        "is_correct":        is_correct,
        "fuzzy_score":       fuzzy_score,
        "degree_of_failure": degree_of_failure,
        "performance_tier":  performance_tier,
        "linguistic_remark": linguistic_remark,
        "gap_analysis":      gap_analysis,
        "assigned_hint":     hint_response
    }

@app.post("/api/tutor/evaluate-exam")
async def evaluate_final_exam(payload: ExamSubmissionPayload):
    # Determine accuracy and latency based on detailed metrics or basic parameters
    if payload.question_details:
        total_qs = len(payload.question_details)
        correct_qs = sum(1 for q in payload.question_details if q.get("is_correct", False))
        # Compute overall exam accuracy as the average of individual questions' fuzzy scores
        accuracy = sum(q.get("fuzzy_score", 0.0) for q in payload.question_details) / max(1, total_qs)
        total_time = sum(q.get("latency_seconds", 0) for q in payload.question_details)
        average_latency = total_time / max(1, total_qs)
    else:
        total_qs = max(1, payload.total_questions)
        correct_qs = payload.correct_answers
        accuracy = (correct_qs / total_qs) * 100
        average_latency = payload.total_elapsed_time / total_qs

    assessment = FuzzyMarkingSystem.evaluate_performance(accuracy, int(average_latency))
    analytics = PathPerformanceAnalytics.calculate_pathway_improvement(
        mock_history=payload.mock_chat_history,
        exam_score=assessment["fuzzy_score"],
        exam_latency=average_latency
    )
    
    return {
        "subject": payload.current_subject,
        "grade_tier": payload.current_tier,
        "calculated_score": assessment["fuzzy_score"],
        "rating_tier": assessment["performance_tier"],
        "mentor_remark": assessment["linguistic_remark"],
        "growth_metrics": analytics
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)