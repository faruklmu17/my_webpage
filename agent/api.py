"""
STEP 21 — Chat API Integration

Exposes the compiled LangGraph workflow via FastAPI endpoints and Python handlers.
Flow:
Frontend Chat -> Chat API -> Load conversation state -> Invoke LangGraph -> Save updated state -> Return user-facing response
"""

import logging
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel, Field

from agent.graph import persistent_graph

logger = logging.getLogger("agent.api")

router = APIRouter()

SAFE_FALLBACK_MESSAGE = (
    "I can still help. Tell me a little about what the student wants to learn or build."
)


class ChatRequest(BaseModel):
    message: str = Field(..., description="User message text")
    conversation_id: Optional[str] = Field(
        default=None, description="Optional conversation / session ID"
    )
    history: Optional[List[Dict[str, Any]]] = Field(
        default=None, description="Optional previous message history"
    )


class ChatResponse(BaseModel):
    reply: str = Field(..., description="User-facing bot response string")
    response: str = Field(..., description="Alias matching LangGraph state response")
    conversation_id: str = Field(..., description="Unique conversation session ID")
    intent: Optional[str] = Field(default=None, description="Detected conversation intent")
    recommended_class: Optional[str] = Field(
        default=None, description="Class ID if recommendation was generated"
    )
    missing_fields: List[str] = Field(
        default_factory=list, description="List of required fields still missing"
    )
    state: Dict[str, Any] = Field(
        default_factory=dict, description="Structured agent state snapshot"
    )


def handle_chat_request(
    message: str,
    conversation_id: Optional[str] = None,
    graph_instance=None,
) -> Dict[str, Any]:
    """
    Executes a single conversational turn through the persistent LangGraph workflow.
    Ensures safe error recovery, conversation persistence, and session isolation.
    """
    target_graph = graph_instance if graph_instance is not None else persistent_graph

    # Sanitize and ensure conversation_id
    clean_conv_id = (conversation_id or "").strip()
    if not clean_conv_id:
        clean_conv_id = f"session_{uuid.uuid4().hex[:12]}"

    # Validate message
    clean_msg = (message or "").strip()
    if not clean_msg:
        fallback_msg = "Please let me know what questions you have about Faruk's classes or tutoring!"
        return {
            "reply": fallback_msg,
            "response": fallback_msg,
            "conversation_id": clean_conv_id,
            "intent": None,
            "recommended_class": None,
            "missing_fields": [],
            "state": {},
        }

    config = {"configurable": {"thread_id": clean_conv_id}}

    try:
        input_state = {
            "messages": [{"role": "user", "content": clean_msg}],
            "conversation_id": clean_conv_id,
        }
        result = target_graph.invoke(input_state, config=config)

        reply_text = result.get("response") or SAFE_FALLBACK_MESSAGE

        state_snapshot = {
            "student_age": result.get("student_age"),
            "experience_level": result.get("experience_level"),
            "previous_languages": result.get("previous_languages") or [],
            "request_type": result.get("request_type"),
            "project_goal": result.get("project_goal"),
            "format_preference": result.get("format_preference"),
            "intent": result.get("intent"),
            "recommended_class": result.get("recommended_class"),
            "recommendation_reason": result.get("recommendation_reason"),
            "missing_fields": result.get("missing_fields") or [],
        }

        return {
            "reply": reply_text,
            "response": reply_text,
            "conversation_id": clean_conv_id,
            "intent": result.get("intent"),
            "recommended_class": result.get("recommended_class"),
            "missing_fields": result.get("missing_fields") or [],
            "state": state_snapshot,
        }

    except Exception as exc:
        logger.error(
            f"Error during LangGraph conversation turn for session '{clean_conv_id}': {exc}",
            exc_info=True,
        )
        return {
            "reply": SAFE_FALLBACK_MESSAGE,
            "response": SAFE_FALLBACK_MESSAGE,
            "conversation_id": clean_conv_id,
            "intent": None,
            "recommended_class": None,
            "missing_fields": [],
            "state": {},
        }


@router.post("/api/chat", response_model=ChatResponse)
@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> Dict[str, Any]:
    """
    HTTP POST endpoint for frontends to submit chat turns.
    """
    return handle_chat_request(
        message=request.message,
        conversation_id=request.conversation_id,
    )


def create_app() -> FastAPI:
    """
    Factory creating a FastAPI app with the Chat API routes attached.
    """
    app = FastAPI(title="Faruk AI Chatbot LangGraph API", version="1.0.0")
    app.include_router(router)
    return app
