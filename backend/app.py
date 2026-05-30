import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

# Load the .env file automatically
load_dotenv()

from tutor_graph import compiled_tutor_app

app = FastAPI(title="Agentic Feedback Engine Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatSessionPayload(BaseModel):
    message: str
    time_taken: int
    consecutive_errors: int
    history: list[dict] = []

@app.post("/api/tutor/chat")
async def run_session_cycle(payload: ChatSessionPayload):
    messages_history = []
    
    for chat in payload.history:
        if chat.get("sender") in ["user", "student"]:
            messages_history.append(HumanMessage(content=chat["text"]))
        else:
            messages_history.append(AIMessage(content=chat["text"]))
            
    messages_history.append(HumanMessage(content=payload.message))
    
    initial_graph_state = {
        "messages": messages_history,
        "time_taken_seconds": payload.time_taken,
        "consecutive_errors": payload.consecutive_errors,
        "requires_remedial_routing": False,
        "retrieved_curriculum": [],
        "active_agent_node": "Initialization"
    }
    
    final_graph_state = compiled_tutor_app.invoke(initial_graph_state)
    
    return {
        "response": final_graph_state["messages"][-1].content,
        "active_node": final_graph_state["active_agent_node"],
        "remedial_triggered": final_graph_state["requires_remedial_routing"],
        "context_pulled": final_graph_state["retrieved_curriculum"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)