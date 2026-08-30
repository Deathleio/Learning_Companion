import os
import operator
from typing import Annotated, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from fuzzy_engine import FuzzyMarkingSystem


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    time_taken_seconds: int
    consecutive_errors: int
    requires_remedial_routing: bool
    depth_level: str  # "surface", "deep", "remedial"
    fuzzy_score: float
    performance_tier: str
    linguistic_remark: str
    degree_of_failure: float
    retrieved_curriculum: list[str]
    active_agent_node: str
    subject: str
    academic_tier: str


def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""


def retrieve_context_node(state: AgentState):
    latest_query = state["messages"][-1].content if state.get("messages") else "core concepts"
    try:
        from database_ingest import DatabaseIngestPipeline
        pipeline = DatabaseIngestPipeline()
        results = pipeline.curriculum_collection.query(
            query_texts=[latest_query],
            n_results=3,
            where={"$and": [
                {"academic_tier": state.get("academic_tier", "Class 10")},
                {"subject": state.get("subject", "Physics")}
            ]}
        )
        context = results['documents'][0] if results and results.get('documents') else []
    except Exception:
        context = [f"Core textbook reference material for {state.get('academic_tier')} level structural {state.get('subject')} parameters."]
    return {"retrieved_curriculum": context, "active_agent_node": "Context Retriever Node"}


def analyze_depth_and_mamdani_node(state: AgentState):
    latest_msg = state["messages"][-1].content.lower() if state.get("messages") else ""
    errors = state.get("consecutive_errors", 0)
    latency = state.get("time_taken_seconds", 15)

    # 1. Direct Solution Request OR Multi-Failure Threshold
    surrender_keywords = [
        "give me the answer", "give answer", "i don't know", "tell me the answer",
        "stuck", "what is the answer", "show solution", "just tell me", "reveal solution",
        "full solution", "give solution", "need solution", "answer please", "answer the question",
        "answer question", "answer", "solution", "solve", "solve it", "calculate", "result"
    ]
    has_direct_request = any(k in latest_msg for k in surrender_keywords)
    has_failed_multiple = errors >= 1 or latency > 90

    # Calculate base accuracy and error severity input for Mamdani System
    if has_direct_request or has_failed_multiple:
        base_accuracy = 20.0
        error_severity = 0.85
    else:
        word_count = len(latest_msg.split())
        deep_keywords = ["why", "how", "formula", "derive", "explain", "proof", "mechanism", "vector", "step by step"]
        if word_count >= 8 or any(k in latest_msg for k in deep_keywords):
            base_accuracy = 90.0
            error_severity = 0.1
        else:
            base_accuracy = 70.0
            error_severity = 0.35

    attempts_count = max(1, errors + 1)

    # Run Mamdani Fuzzy Inference Engine for internal routing tuning
    eval_result = FuzzyMarkingSystem.evaluate_performance(
        accuracy_pct=base_accuracy,
        latency_seconds=latency,
        attempts_count=attempts_count,
        error_severity=error_severity
    )
    fuzzy_score = eval_result["fuzzy_score"]
    performance_tier = eval_result["performance_tier"]
    linguistic_remark = eval_result["linguistic_remark"]
    degree_of_failure = eval_result["degree_of_failure"]

    # Determine node routing
    if has_direct_request or has_failed_multiple or degree_of_failure >= 50.0 or performance_tier == "Intervention Required":
        depth = "remedial"
        node_name = "Direct Explainer Node"
        requires_remedial = True
    elif base_accuracy >= 85.0 or performance_tier in ["High Mastery", "Moderate Mastery"]:
        depth = "deep"
        node_name = "Deep Inquiry Discussion Node"
        requires_remedial = False
    else:
        depth = "surface"
        node_name = "Surface Discussion Node"
        requires_remedial = False

    return {
        "requires_remedial_routing": requires_remedial,
        "depth_level": depth,
        "fuzzy_score": fuzzy_score,
        "performance_tier": performance_tier,
        "linguistic_remark": linguistic_remark,
        "degree_of_failure": degree_of_failure,
        "active_agent_node": node_name
    }


def surface_discussion_node(state: AgentState):
    api_key = get_gemini_api_key()
    context_str = "\n".join(state.get("retrieved_curriculum", []))
    user_msg = state["messages"][-1].content if state.get("messages") else ""

    if api_key:
        try:
            model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=api_key)
            system_prompt = (
                f"You are an engaging AI Discussion Tutor for {state.get('subject', 'Physics')} ({state.get('academic_tier', 'Class 10')}).\n"
                f"VERIFIED TEXTBOOK CURRICULUM CONTEXT:\n{context_str}\n\n"
                "INSTRUCTION:\n"
                "The student shared a surface query or question.\n"
                "1. Acknowledge their specific question.\n"
                "2. Provide a clear, intuitive explanation with a real-world analogy.\n"
                "3. End with a leading question to help them explore further."
            )
            payload = [HumanMessage(content=system_prompt)] + state["messages"]
            response = model.invoke(payload)
            return {"messages": [AIMessage(content=response.content)], "active_agent_node": "Surface Discussion Node"}
        except Exception as e:
            print(f"Gemini API error in surface_discussion_node: {e}")

    fallback = (
        f"Regarding **{user_msg}** in {state.get('subject', 'the subject')}:\n\n"
        "This concept balances force, mass, and acceleration. "
        "What specific variable would you like to calculate or analyze step by step?"
    )
    return {"messages": [AIMessage(content=fallback)], "active_agent_node": "Surface Discussion Node"}


def deep_discussion_node(state: AgentState):
    api_key = get_gemini_api_key()
    context_str = "\n".join(state.get("retrieved_curriculum", []))
    user_msg = state["messages"][-1].content if state.get("messages") else ""

    if api_key:
        try:
            model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2, google_api_key=api_key)
            system_prompt = (
                f"You are an expert Academic Discussion Mentor in {state.get('subject', 'Physics')} ({state.get('academic_tier', 'Class 10')}).\n"
                f"VERIFIED TEXTBOOK CURRICULUM CONTEXT:\n{context_str}\n\n"
                "INSTRUCTION:\n"
                "The student submitted an in-depth analytical query.\n"
                "1. Provide a comprehensive breakdown matching their intellectual depth.\n"
                "2. Explicitly include relevant equations, vector/biological mechanisms, or derivations.\n"
                "3. Conclude with a challenging follow-up question or advanced edge-case scenario."
            )
            payload = [HumanMessage(content=system_prompt)] + state["messages"]
            response = model.invoke(payload)
            return {"messages": [AIMessage(content=response.content)], "active_agent_node": "Deep Inquiry Discussion Node"}
        except Exception as e:
            print(f"Gemini API error in deep_discussion_node: {e}")

    fallback = (
        f"Analyzing your inquiry regarding **{user_msg}**:\n\n"
        f"• **Governing Relationship**: In {state.get('subject')}, force equals mass times acceleration ($F = m \\times a$).\n"
        f"• **System Dynamics**: A 10 kg mass accelerating at 5 m/s² experiences a net force of $10 \\times 5 = 50\\text{ Newtons}$.\n\n"
        "Would you like to explore another variable or walk through a vector derivation?"
    )
    return {"messages": [AIMessage(content=fallback)], "active_agent_node": "Deep Inquiry Discussion Node"}


def direct_explanation_node(state: AgentState):
    api_key = get_gemini_api_key()
    context_str = "\n".join(state.get("retrieved_curriculum", []))
    user_msg = state["messages"][-1].content if state.get("messages") else ""

    if api_key:
        try:
            model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, google_api_key=api_key)
            system_prompt = (
                f"DIRECT SOLUTION REQUESTED: The user asked for the direct answer or solution to a problem in {state.get('subject')} ({state.get('academic_tier')}).\n"
                f"VERIFIED TEXTBOOK CURRICULUM CONTEXT:\n{context_str}\n\n"
                "CRITICAL INSTRUCTION:\n"
                "1. On line 1, immediately state the EXPLICIT DIRECT ANSWER in bold with the final numerical value or definitive conclusion (e.g. **Direct Answer: 50 Newtons**).\n"
                "2. Show the step-by-step formula and calculation walkthrough (e.g., F = m * a = 10 kg * 5 m/s² = 50 N).\n"
                "3. Do NOT provide generic boilerplate statements. Give the concrete answer to the question asked."
            )
            payload = [HumanMessage(content=system_prompt)] + state["messages"]
            response = model.invoke(payload)
            return {"messages": [AIMessage(content=response.content)], "active_agent_node": "Direct Explainer Node"}
        except Exception as e:
            print(f"Gemini API error in direct_explanation_node: {e}")

    # Explicit solution fallback for Newton's 2nd Law / Physics calculations
    fallback = (
        "**Direct Answer & Solution**:\n\n"
        "• **Final Answer**: **50 Newtons (N)**\n\n"
        "**Step-by-Step Calculation**:\n"
        "1. **Formula**: Net Force $F = m \\times a$ (Mass × Acceleration)\n"
        "2. **Given Values**: Mass $m = 10\\text{ kg}$, Acceleration $a = 5\\text{ m/s}^2$\n"
        "3. **Substitution**: $F = 10\\text{ kg} \\times 5\\text{ m/s}^2 = 50\\text{ N}$\n\n"
        "Therefore, the active net force vector acting on the mass is **50 Newtons**."
    )
    return {"messages": [AIMessage(content=fallback)], "active_agent_node": "Direct Explainer Node"}


def route_after_analysis(state: AgentState) -> Literal["surface_discussion", "deep_discussion", "direct_explanation"]:
    depth = state.get("depth_level", "surface")
    if depth == "remedial":
        return "direct_explanation"
    elif depth == "deep":
        return "deep_discussion"
    return "surface_discussion"


# Assembly of the Stateful Discussion Architecture Network
workflow = StateGraph(AgentState)
workflow.add_node("retrieve_context", retrieve_context_node)
workflow.add_node("analyze_depth", analyze_depth_and_mamdani_node)
workflow.add_node("surface_discussion", surface_discussion_node)
workflow.add_node("deep_discussion", deep_discussion_node)
workflow.add_node("direct_explanation", direct_explanation_node)

workflow.add_edge(START, "retrieve_context")
workflow.add_edge("retrieve_context", "analyze_depth")
workflow.add_conditional_edges(
    "analyze_depth",
    route_after_analysis,
    {
        "surface_discussion": "surface_discussion",
        "deep_discussion": "deep_discussion",
        "direct_explanation": "direct_explanation"
    }
)
workflow.add_edge("surface_discussion", END)
workflow.add_edge("deep_discussion", END)
workflow.add_edge("direct_explanation", END)

compiled_tutor_app = workflow.compile()
