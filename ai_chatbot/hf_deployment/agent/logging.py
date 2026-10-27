"""
STEP 18 — Agent Observability & Structured Graph Logging

Provides developer-safe, structured logging of all LangGraph events:
- conversation_id / thread_id
- node_name
- execution_time_ms
- detected_intent & confidence
- extracted_fields
- missing_fields
- selected_route
- recommended_class_id & reasoning

Maintains developer explainability: answers "Why did the chatbot recommend this class?"
without exposing internal logs or hidden model prompts to end users.
"""

import time
import logging
from typing import Dict, Any, List, Optional, Callable
from functools import wraps

logger = logging.getLogger("agent.workflow")

# In-memory structured trace store for session debugging and developer explainability
_SESSION_TRACES: Dict[str, List[Dict[str, Any]]] = {}


def log_event(event: Dict[str, Any], conversation_id: str = "default") -> None:
    """
    Records a structured graph event to standard python logging and the in-memory trace.
    """
    logger.info(
        "Workflow Node: %s | Intent: %s (%.2f) | Route: %s | Rec: %s | Time: %.2fms",
        event.get("node_name"),
        event.get("detected_intent"),
        event.get("intent_confidence", 0.0) or 0.0,
        event.get("selected_route"),
        event.get("recommended_class_id"),
        event.get("execution_time_ms", 0.0),
    )

    if conversation_id not in _SESSION_TRACES:
        _SESSION_TRACES[conversation_id] = []
    _SESSION_TRACES[conversation_id].append(event)


def get_session_trace(conversation_id: str = "default") -> List[Dict[str, Any]]:
    """Retrieves all logged node execution events for a given session."""
    return list(_SESSION_TRACES.get(conversation_id, []))


def clear_session_traces() -> None:
    """Clears all in-memory traces (used in test setup/teardown)."""
    _SESSION_TRACES.clear()


def explain_recommendation(conversation_id: str = "default") -> Optional[Dict[str, Any]]:
    """
    Explains why a recommendation was made for a session by looking up
    the recommendation node event in the session trace.
    """
    events = get_session_trace(conversation_id)
    for event in reversed(events):
        if event.get("node_name") == "recommend_class":
            return {
                "conversation_id": conversation_id,
                "recommended_class_id": event.get("recommended_class_id"),
                "recommended_class": event.get("recommended_class"),
                "recommendation_reason": event.get("recommendation_reason"),
                "facts_used": event.get("extracted_facts", {}),
            }
    return None


def observe_node(node_name: str) -> Callable:
    """
    Decorator for graph nodes that measures execution time and records structured metadata.
    """
    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(state: Dict[str, Any], *args, **kwargs) -> Dict[str, Any]:
            start_time = time.perf_counter()
            result = fn(state, *args, **kwargs)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            # Determine thread / conversation id
            thread_id = None
            if args and isinstance(args[0], dict):
                thread_id = args[0].get("configurable", {}).get("thread_id")
            if not thread_id and isinstance(kwargs.get("config"), dict):
                thread_id = kwargs["config"].get("configurable", {}).get("thread_id")

            conv_id = state.get("conversation_id") or thread_id or "default"

            # Build safe developer-facing log snapshot
            extracted_facts = {
                "student_age": result.get("student_age", state.get("student_age")),
                "experience_level": result.get("experience_level", state.get("experience_level")),
                "programming_language": result.get("programming_language", state.get("programming_language")),
                "request_type": result.get("request_type", state.get("request_type")),
                "project_goal": result.get("project_goal", state.get("project_goal")),
            }

            event = {
                "node_name": node_name,
                "conversation_id": conv_id,
                "execution_time_ms": round(elapsed_ms, 2),
                "detected_intent": result.get("intent", state.get("intent")),
                "intent_confidence": result.get("intent_confidence", state.get("intent_confidence")),
                "extracted_facts": {k: v for k, v in extracted_facts.items() if v is not None},
                "missing_fields": result.get("missing_fields", state.get("missing_fields")),
                "recommended_class": result.get("recommended_class", state.get("recommended_class")),
                "recommended_class_id": result.get("recommended_class_id", state.get("recommended_class_id")),
                "recommendation_reason": result.get("recommendation_reason", state.get("recommendation_reason")),
                "next_action": result.get("next_action", state.get("next_action")),
            }

            log_event(event, conversation_id=conv_id)
            return result

        return wrapper
    return decorator
