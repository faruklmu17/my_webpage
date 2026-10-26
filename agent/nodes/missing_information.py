"""
STEP 7 — Missing Information Checker Node

Evaluates what minimum useful fields are missing based on the current active intent.
Tailors required fields per workflow (no single universal checklist).
"""

from typing import Dict, Any, List
from agent.state import AgentState
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
)


def get_required_fields_for_intent(intent: str) -> List[str]:
    """
    Returns the minimal set of required fields for a given intent.
    Intake checklists are intentionally lean to avoid questionnaire fatigue.
    """
    if intent == CLASS_INQUIRY:
        return ["student_age", "experience_level", "request_type"]
    elif intent == PROJECT_HELP:
        return ["project_goal", "experience_level"]
    elif intent == ASSIGNMENT_HELP:
        return ["subject"]
    # General queries and unknown requests require 0 intake fields
    return []


def check_missing_information(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Calculates missing_fields based on state['intent']
    and fields currently present in state.
    Updates state with 'missing_fields': List[str].
    """
    intent = state.get("intent") or UNKNOWN
    required = get_required_fields_for_intent(intent)

    missing: List[str] = []
    for field in required:
        val = state.get(field)
        
        # Flexibility check: for assignment help, a known programming_language
        # satisfies the subject requirement (e.g. Java homework)
        if field == "subject" and (val is None or val == ""):
            if state.get("programming_language"):
                continue
        
        if val is None or val == "" or val == []:
            missing.append(field)

    return {"missing_fields": missing}
