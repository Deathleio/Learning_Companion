import operator
from typing import Annotated, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    time_taken_seconds: int
    consecutive_errors: int
    requires_remedial_routing: bool
    retrieved_curriculum: list[str]
    active_agent_node: str

def retrieve_context_node(state: AgentState):
    latest_query = state["messages"][-1].content
    from database_ingest import DatabaseIngestPipeline
    pipeline = DatabaseIngestPipeline()
    context = pipeline.query_verified_context(latest_query)
    return {"retrieved_curriculum": context, "active_agent_node": "Context Retriever Node"}

def analyze_performance_node(state: AgentState):
    latest_msg = state["messages"][-1].content.lower()
    
    # Frustration trigger check 1: Manual sliders from frontend metrics
    metrics_frustrated = state["time_taken_seconds"] > 90 or state["consecutive_errors"] >= 2
    
    # Frustration trigger check 2: Text matching for explicit surrender keywords
    surrender_keywords = ["give me the answer", "give me answers", "i don't know", "tell me the answer", "stuck"]
    text_frustrated = any(keyword in latest_msg for keyword in surrender_keywords)
    
    # Route to remedial path if either condition is met
    is_frustrated = metrics_frustrated or text_frustrated
    
    return {"requires_remedial_routing": is_frustrated, "active_agent_node": "Performance Analyzer Node"}

def socratic_hint_node(state: AgentState):
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
    context_str = "\n".join(state["retrieved_curriculum"])
    
    system_prompt = (
        "You are an empathetic Socratic Hinting Agent. The student is facing a cognitive obstacle.\n"
        f"Verified Curriculum Boundaries:\n{context_str}\n\n"
        "CRITICAL DIRECTION: Do not provide completed solutions, answers, or formulas. "
        "Formulate a single age-appropriate leading question to guide their problem-solving path."
    )
    
    payload = [HumanMessage(content=system_prompt)] + state["messages"]
    response = model.invoke(payload)
    return {"messages": [AIMessage(content=response.content)], "active_agent_node": "Socratic Hint Agent Node"}

def direct_explanation_node(state: AgentState):
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    context_str = "\n".join(state["retrieved_curriculum"])
    
    system_prompt = (
        "The learner is over-frustrated and has failed multiple times. Socratic boundaries are now completely lowered.\n"
        f"Verified Curriculum Context:\n{context_str}\n\n"
        "CRITICAL INSTRUCTION: You must explicitly state the final answer, values, formulas, and conclusions clearly. "
        "Provide a direct, transparent, step-by-step breakdown of how the problem is calculated, "
        "reveal the definitive solution immediately, and explain why it is correct to alleviate their frustration."
    )
    
    payload = [HumanMessage(content=system_prompt)] + state["messages"]
    response = model.invoke(payload)
    return {"messages": [AIMessage(content=response.content)], "active_agent_node": "Direct Explainer Agent Node"}

def route_after_analysis(state: AgentState) -> Literal["socratic_hint", "direct_explanation"]:
    if state["requires_remedial_routing"]:
        return "direct_explanation"
    return "socratic_hint"

# Assembly of the Stateful Architecture Network
workflow = StateGraph(AgentState)
workflow.add_node("retrieve_context", retrieve_context_node)
workflow.add_node("analyze_performance", analyze_performance_node)
workflow.add_node("socratic_hint", socratic_hint_node)
workflow.add_node("direct_explanation", direct_explanation_node)

workflow.add_edge(START, "retrieve_context")
workflow.add_edge("retrieve_context", "analyze_performance")
workflow.add_conditional_edges(
    "analyze_performance",
    route_after_analysis,
    {"socratic_hint": "socratic_hint", "direct_explanation": "direct_explanation"}
)
workflow.add_edge("socratic_hint", END)
workflow.add_edge("direct_explanation", END)

compiled_tutor_app = workflow.compile()