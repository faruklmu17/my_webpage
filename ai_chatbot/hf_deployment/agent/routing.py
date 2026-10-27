"""
STEP 11 & 12 — Workflow Router and Information-Complete Decision

Provides deterministic conditional edges for the LangGraph workflow:
1. `route_intent(state)`:
   - CLASS_INQUIRY, PROJECT_HELP, ASSIGNMENT_HELP -> "check_missing_information"
   - GENERAL_QUESTION -> "general_response"
   - UNKNOWN / low confidence / invalid -> "clarification"

2. `route_missing_information(state)`:
   - missing_fields present and non-empty -> "generate_followup_question"
   - no missing_fields -> "recommend_class"
"""

from typing import Any, Mapping
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
    normalize_intent,
)

# Route destination node names
NODE_CHECK_MISSING = "check_missing_information"
NODE_GENERAL_RESPONSE = "general_response"
NODE_CLARIFICATION = "clarification"
NODE_FOLLOWUP_QUESTION = "generate_followup_question"
NODE_RECOMMEND_CLASS = "recommend_class"

# Minimum intent confidence threshold
CONFIDENCE_THRESHOLD = 0.60

WORKFLOW_INTENTS = {
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
}


def route_intent(state: Mapping[str, Any]) -> str:
    """
    Evaluates the current state's intent and confidence score to determine
    the next node in the graph.

    Routing rules:
    - If confidence is provided and < CONFIDENCE_THRESHOLD (0.60) -> "clarification"
    - If intent is CLASS_INQUIRY, PROJECT_HELP, or ASSIGNMENT_HELP -> "check_missing_information"
    - If intent is GENERAL_QUESTION -> "general_response"
    - If intent is UNKNOWN, None, or any unrecognized/invalid value -> "clarification"
    """
    raw_intent = state.get("intent")
    confidence = state.get("intent_confidence")

    # If confidence is explicitly set below the threshold, safely fall back to clarification
    if confidence is not None:
        try:
            if float(confidence) < CONFIDENCE_THRESHOLD:
                return NODE_CLARIFICATION
        except (ValueError, TypeError):
            return NODE_CLARIFICATION

    normalized = normalize_intent(raw_intent)

    if normalized in WORKFLOW_INTENTS:
        return NODE_CHECK_MISSING
    elif normalized in {GENERAL_QUESTION, "PRICING", "TECHNICAL_QUESTION"}:
        return NODE_GENERAL_RESPONSE
    else:
        # UNKNOWN, invalid strings, None
        return NODE_CLARIFICATION


def route_missing_information(state: Mapping[str, Any]) -> str:
    """
    Evaluates whether any required information fields are still missing.

    Routing rules:
    - If missing_fields contains one or more items -> "generate_followup_question"
    - If missing_fields is empty or None -> "recommend_class"
    """
    missing_fields = state.get("missing_fields")

    if missing_fields and isinstance(missing_fields, (list, set, tuple)) and len(missing_fields) > 0:
        return NODE_FOLLOWUP_QUESTION

    return NODE_RECOMMEND_CLASS
