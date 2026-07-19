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

        try:
            response      = model.invoke([HumanMessage(content=hint_prompt)])
            hint_response = response.content
        except Exception as e:
            print("GEMINI API ERROR IN EVALUATE-SHORT-ANSWER:", e)
            if degree_of_failure >= 60.0:
                hint_response = (
                    f"Fuzzy System Calibration: Intervention Required. Let's walk through the concept.\n"
                    f"Governing Formula: {payload.hint_formula or 'Determine relation from question parameters'}.\n"
                    f"Remediation Analysis: {gap_analysis}\n"
                    f"Focus on substituting the known values step-by-step to calculate the correct answer."
                )
            else:
                hint_response = (
                    f"Fuzzy System Calibration: Developing Trajectory. You are very close!\n"
                    f"Socratic Nudge: Look closely at your values. Did you apply the operation correctly?\n"
                    f"Misconception Hint: {payload.hint_misconception or 'Double check calculation order.'}"
                )
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

    # ══════════════════════════════════════════════════════════════════════════════
    # RESOLVE QUESTION DETAILS & CONSTRUCT PERFORMANCE PROFILE
    # ══════════════════════════════════════════════════════════════════════════════
    subject_repo = FLASHCARD_REPOSITORY.get(payload.current_subject, {})
    tier_data = subject_repo.get(payload.current_tier, {"finalExam": []})
    exam_questions = {q["qId"]: q for q in tier_data.get("finalExam", [])}

    correct_details = []
    incorrect_details = []
    
    if payload.question_details:
        for q_detail in payload.question_details:
            q_id = q_detail.get("qId")
            is_corr = q_detail.get("is_correct", False)
            attempts = q_detail.get("attempts", 1)
            latency = q_detail.get("latency_seconds", 0)
            q_fuzzy_score = q_detail.get("fuzzy_score", 0.0)
            
            repo_q = exam_questions.get(q_id, {})
            topic = repo_q.get("moduleOrigin", "Unknown Topic")
            q_text = repo_q.get("text", "Unknown Question")
            formula = repo_q.get("formula", "")
            misconception = repo_q.get("misconception", "")
            
            info = {
                "qId": q_id,
                "topic": topic,
                "question": q_text,
                "formula": formula,
                "misconception": misconception,
                "attempts": attempts,
                "latency": latency,
                "fuzzy_score": q_fuzzy_score
            }
            if is_corr:
                correct_details.append(info)
            else:
                incorrect_details.append(info)

    # ══════════════════════════════════════════════════════════════════════════════
    # MAMDANI-CALIBRATED EXAM EVALUATION STUDY HINT GENERATION
    # ══════════════════════════════════════════════════════════════════════════════
    rating_tier = assessment["performance_tier"]
    calculated_score = assessment["fuzzy_score"]
    
    correct_desc = ""
    for idx, q in enumerate(correct_details, 1):
        correct_desc += f"  {idx}. Topic: {q['topic']} | Question: {q['question']} (Fuzzy Score: {q['fuzzy_score']}%, Latency: {q['latency']}s, Attempts: {q['attempts']})\n"
        
    incorrect_desc = ""
    for idx, q in enumerate(incorrect_details, 1):
        incorrect_desc += f"  {idx}. Topic: {q['topic']} | Question: {q['question']}\n"
        if q['formula']:
            incorrect_desc += f"     - Governing Formula: {q['formula']}\n"
        if q['misconception']:
            incorrect_desc += f"     - Common Misconception: {q['misconception']}\n"
        incorrect_desc += f"     - (Fuzzy Score: {q['fuzzy_score']}%, Latency: {q['latency']}s, Attempts: {q['attempts']})\n"

    prompt_context = (
        f"SUBJECT: {payload.current_subject} | LEVEL: {payload.current_tier}\n"
        f"OVERALL PERFORMANCE METRICS (Mamdani Fuzzy Inference System):\n"
        f"  - Fuzzy Evaluation Score: {calculated_score}%\n"
        f"  - Performance Rating Tier: {rating_tier}\n"
        f"  - Average Pacing Latency: {average_latency:.1f} seconds per question\n\n"
    )
    if correct_desc:
        prompt_context += f"TOPICS MASTERED / CORRECT ANSWERS:\n{correct_desc}\n"
    if incorrect_desc:
        prompt_context += f"TOPICS REQUIRING ATTENTION / INCORRECT ANSWERS:\n{incorrect_desc}\n"

    # Select level of hint based on performance tier
    if rating_tier == "High Mastery":
        level_instruction = (
            "Decided Hint Level: LEVEL 4 - ADVANCED CONCEPTUAL CHALLENGE (High Mastery)\n"
            "DIRECTIVE:\n"
            "1. Praise the student briefly and enthusiastically for their high mastery performance.\n"
            "2. Offer an advanced extension question or high-level conceptual challenge related to the course material "
            "   (e.g., if it is Class 10 Physics, present a challenging physics concept or scenario to think about).\n"
            "3. Provide brief guidance on how they would approach this advanced challenge."
        )
    elif rating_tier == "Moderate Mastery":
        level_instruction = (
            "Decided Hint Level: LEVEL 3 - EFFICIENCY & PRECISION CALIBRATION (Moderate Mastery)\n"
            "DIRECTIVE:\n"
            "1. Acknowledge their solid conceptual grasp (Moderate Mastery).\n"
            "2. Focus on efficiency, speed, or precision. Suggest specific pacing tips or minor calculations tricks.\n"
            "3. Give them one specific study hint on how to polish their execution (e.g. dimensional analysis, estimating answers, checking units) to reach the next tier."
        )
    elif rating_tier == "Developing":
        level_instruction = (
            "Decided Hint Level: LEVEL 2 - SOCRATIC STUDY HINT & GUIDANCE (Developing)\n"
            "DIRECTIVE:\n"
            "1. Reassure the student that they are on a developing trajectory and close to mastery.\n"
            "2. Do NOT give direct formulas or worked-out solutions for the missed questions.\n"
            "3. Pinpoint the conceptual gaps in the incorrect topics. Ask 1-2 Socratic questions that guide them to discover "
            "   the correct relationships or formulas for themselves during their review.\n"
            "4. Suggest a targeted area of study."
        )
    else:  # Intervention Required
        level_instruction = (
            "Decided Hint Level: LEVEL 1 - DEEP CONCEPT WALKTHROUGH & FORMULA REMEDIATION (Intervention Required)\n"
            "DIRECTIVE:\n"
            "1. Reassure the student and provide an encouraging, highly structured study path.\n"
            "2. Identify every failed topic clearly.\n"
            "3. State the governing formulas and explain the core concepts step-by-step for those failed topics.\n"
            "4. Provide a structured review checklist or revision guide to help rebuild their foundation."
        )

    hint_prompt = (
        "You are an expert academic tutor. You are analyzing a student's final exam performance details.\n"
        "Your task is to generate a custom 'Remediation Hint & Study Plan' for this student based on the Decided Hint Level.\n\n"
        + prompt_context +
        level_instruction + "\n\n"
        "FORMATTING REQUIREMENT:\n"
        "- Respond in clean, readable, professional markdown.\n"
        "- Keep it concise, engaging, and highly personalized. Address the student directly as 'You'.\n"
        "- Do not use placeholders. Use actual subject names, topics, and values from the context."
    )

    remediation_hint = ""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def get_fallback_hint():
        if rating_tier == "High Mastery":
            return (
                f"Congratulations on your outstanding performance! You have achieved High Mastery with a score of {calculated_score}%.\n\n"
                f"**Level 4 Advanced Challenge:** Try applying these concepts to multi-body scenarios or deriving the governing equations from first principles."
            )
        elif rating_tier == "Moderate Mastery":
            return (
                f"Great job! You achieved Moderate Mastery with a score of {calculated_score}%.\n\n"
                f"**Level 3 Efficiency Calibration:** To refine your performance and reach the highest tier, focus on speed and pacing (average latency: {average_latency:.1f}s).\n"
                f"*Tip: Try dimensional analysis or estimation techniques to verify your steps quickly.*"
            )
        elif rating_tier == "Developing":
            topics_list = ", ".join(set(q["topic"] for q in incorrect_details)) if incorrect_details else "the missed topics"
            return (
                f"You are on a developing trajectory with a score of {calculated_score}%.\n\n"
                f"**Level 2 Socratic Guidance:** Review the following topics that you struggled with: {topics_list}.\n"
                f"*Socratic Study Tip: For each missed question, ask yourself what the physical quantities represent and how they vary in relation to each other.*"
            )
        else:
            remediation_steps = ""
            for idx, q in enumerate(incorrect_details, 1):
                formula_part = f" (Formula: {q['formula']})" if q['formula'] else ""
                remediation_steps += f"  - Topic: {q['topic']}{formula_part}\n"
            remediation_steps = remediation_steps or "  - Review all module formulas.\n"
            return (
                f"Targeted review recommended. Let's rebuild your foundation (Overall Score: {calculated_score}%).\n\n"
                f"**Level 1 Deep Concept Walkthrough:** Focus on these areas:\n"
                f"{remediation_steps}\n"
                f"*Study Advice: Write down these formulas and practice at least 3 basic calculations for each before retaking the assessment.*"
            )

    if api_key:
        try:
            model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2, google_api_key=api_key)
            response = model.invoke([HumanMessage(content=hint_prompt)])
            remediation_hint = response.content.strip()
        except Exception as e:
            print("GEMINI API ERROR IN EVALUATE-EXAM:", e)
            remediation_hint = get_fallback_hint()
    else:
        remediation_hint = get_fallback_hint()
    
    return {
        "subject": payload.current_subject,
        "grade_tier": payload.current_tier,
        "calculated_score": assessment["fuzzy_score"],
        "rating_tier": assessment["performance_tier"],
        "mentor_remark": assessment["linguistic_remark"],
        "remediation_hint": remediation_hint,
        "growth_metrics": analytics
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)