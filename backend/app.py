import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Load the .env file automatically
load_dotenv()

from fuzzy_engine import FuzzyMarkingSystem
from analytics import PathPerformanceAnalytics
from theory_repo import FLASHCARD_REPOSITORY

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
    correct_answers: int
    total_questions: int
    total_elapsed_time: int
    current_tier: str
    current_subject: str
    mock_chat_history: list[dict] = []

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
    tier_data = subject_repo.get(payload.current_tier, {"cards": []})
    return {"cards": tier_data["cards"]}

@app.post("/api/tutor/chat")
async def run_session_cycle(payload: ChatSessionPayload):
    """
    Socratic Mock Practice Test Agent.
    Fuses real-time ChromaDB RAG vector context with the Gemini API model to return 
    the exact progressive step hint when the student provides an incorrect or incomplete entry.
    """
    retrieved_chunks = execute_rag_vector_lookup(
        subject=payload.current_subject,
        tier=payload.current_tier,
        query=payload.message
    )
    context_blob = "\n".join(retrieved_chunks)

    accuracy_metric = 0.0 if payload.consecutive_errors > 0 else 100.0
    evaluation = FuzzyMarkingSystem.evaluate_performance(accuracy_metric, payload.time_taken)
    degree_of_failure = round(100.0 - evaluation["fuzzy_score"], 1)

    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
    
    system_prompt = (
        f"You are the Core Socratic Hinting Agent for an Intelligent Tutoring Platform.\n"
        f"Target Audience Level: {payload.current_tier} | Subject Area: {payload.current_subject}\n"
        f"Active Session Metric: Consecutive Errors = {payload.consecutive_errors} | Calculated Failure Index = {degree_of_failure}%\n\n"
        f"Verified Background Knowledge RAG Context Chunks:\n{context_blob}\n\n"
        f"Incoming Student Transaction: {payload.message}\n\n"
        "PEDAGOGICAL COMPLIANCE RULES:\n"
        "1. Never provide the direct numerical answer, final solution string, or source code blocks.\n"
        "2. Analyze the context chunks to formulate a highly detailed, step-by-step guidance question or progressive hint.\n"
        "3. If consecutive errors are high, lower the friction by referencing explicit formulas from the RAG chunks. Otherwise, use minimalist diagnostic questions."
    )

    messages_history = [HumanMessage(content=system_prompt)]
    for chat in payload.history[-4:]:
        if chat.get("sender") in ["user", "student"]:
            messages_history.append(HumanMessage(content=chat["text"]))
        else:
            messages_history.append(AIMessage(content=chat["text"]))

    response = model.invoke(messages_history)
    
    return {
        "response": response.content,
        "active_node": "SocraticScaffoldingNode" if payload.consecutive_errors > 0 else "DiagnosticEvaluationNode",
        "remedial_triggered": payload.consecutive_errors > 1,
        "context_pulled": retrieved_chunks
    }

@app.post("/api/tutor/evaluate-short-answer")
async def evaluate_short_answer(payload: ShortAnswerPayload):
    """
    Evaluates final examination short-answers via an LLM Semantic Grader.
    Pipes the continuous semantic score through the custom Mamdani Fuzzy System to perform 
    grading, and explicitly returns the direct computation formula under high failure vectors.
    """
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    
    # 1. AI Semantic Parsing Loop to calculate partial verification scores
    grader_prompt = (
        f"You are an academic grading parser evaluating an engineering short-answer entry.\n"
        f"Question: {payload.question_text}\n"
        f"Expected Reference Solution: {payload.expected_answer}\n"
        f"Student's Alphanumeric Entry: {payload.student_raw_input}\n\n"
        "Instructions:\n"
        "Assess partial correctness fractions. If an entry matches numerical indices but contains unit variants, variations in whitespace, "
        "or rounding deviations, score it with continuous partial metrics.\n"
        "Respond ONLY with a valid minified JSON block matching this structural format:\n"
        '{"accuracy_percentage": float (0.0 to 100.0), "is_logically_correct": boolean}'
    )
    
    try:
        grader_res = model.invoke([HumanMessage(content=grader_prompt)])
        clean_json = grader_res.content.replace("```json", "").replace("```", "").strip()
        grade_data = json.loads(clean_json)
        base_accuracy = float(grade_data.get("accuracy_percentage", 0.0))
        is_correct = bool(grade_data.get("is_logically_correct", False))
    except Exception:
        # Code safe fallback comparison if JSON decoding encounters exceptions
        is_correct = payload.student_raw_input.strip().lower() == payload.expected_answer.strip().lower()
        base_accuracy = 100.0 if is_correct else 0.0

    # 2. Factor in step-down penalty values based on retake index turns
    if is_correct and payload.attempts_count > 1:
        accuracy_pct = max(50.0, base_accuracy - ((payload.attempts_count - 1) * 15.0))
    else:
        accuracy_pct = base_accuracy
        
    # 3. Process the continuous semantic accuracy parameter directly via your Mamdani Fuzzy Engine
    evaluation = FuzzyMarkingSystem.evaluate_performance(accuracy_pct, payload.seconds_spent)
    degree_of_failure = round(100.0 - evaluation["fuzzy_score"], 1)
    
    hint_response = ""
    if not is_correct:
        # 4. Implement Adaptive Hinting Threshold Bounds
        if degree_of_failure >= 60.0:
            # High Failure Vector: Explicitly deliver the direct computational rule formula
            system_prompt = (
                f"The student's answer is deeply deficient. Calculated Failure Scale: {degree_of_failure}%.\n"
                f"Question Asked: {payload.question_text}\n"
                f"Student's Attempt: {payload.student_raw_input}\n"
                f"Mandatory Directive: Explicitly state the governing formula ({payload.hint_formula}) in your response. "
                "Break down each variable in the equation and detail the immediate mathematical setup sequence to clear their blockage."
            )
        else:
            # Low Failure Vector / Close Attempt Typo: Serve targeted Socratic validation hints
            system_prompt = (
                f"The student's answer is close or contains a subtle conceptual/unit format misstep. Failure Scale: {degree_of_failure}%.\n"
                f"Question Asked: {payload.question_text}\n"
                f"Expected Concept Reference: {payload.expected_answer}\n"
                f"Student's Input: {payload.student_raw_input}\n"
                f"Mapped Misconception Pattern: {payload.hint_misconception}\n\n"
                "Provide a precise Socratic hint mapping out where their unit annotation or approximation deviated. Do not expose the direct formula."
            )
            
        response = model.invoke([HumanMessage(content=system_prompt)])
        hint_response = response.content
    else:
        hint_response = "Correct! Your understanding satisfies the evaluation criteria."

    return {
        "is_correct": is_correct,
        "fuzzy_score": evaluation["fuzzy_score"],
        "degree_of_failure": degree_of_failure,
        "performance_tier": evaluation["performance_tier"],
        "assigned_hint": hint_response
    }

@app.post("/api/tutor/evaluate-exam")
async def evaluate_final_exam(payload: ExamSubmissionPayload):
    accuracy = (payload.correct_answers / payload.total_questions) * 100
    average_latency = payload.total_elapsed_time / payload.total_questions
    
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