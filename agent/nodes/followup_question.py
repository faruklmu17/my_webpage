"""
STEP 8 — Follow-Up Question Generator Node

Generates conversational, non-repetitive follow-up questions for missing fields.
Rules:
- Never asks for information already known in state.
- Asks for at most 1–2 closely related pieces of missing information.
- Avoids robotic numbered questionnaires.
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


def build_followup_question_text(state: AgentState) -> str:
    """
    Constructs a natural, contextual follow-up question based on missing_fields
    and previously established state context.
    """
    missing = state.get("missing_fields") or []
    if not missing:
        return ""

    age = state.get("student_age")
    exp = state.get("experience_level")
    langs = state.get("previous_languages") or []
    target_lang = state.get("programming_language") or "Python"
    intent = state.get("intent")

    # Limit intake to at most top 2 missing fields at a time
    fields_to_ask = missing[:2]

    # --- CLASS INQUIRY WORKFLOW ---
    if intent == CLASS_INQUIRY or "request_type" in fields_to_ask or "student_age" in fields_to_ask:
        # Case 1: Both age and experience are missing
        if "student_age" in fields_to_ask and "experience_level" in fields_to_ask:
            return f"How old is the student, and have they had any prior experience with coding before (like Scratch or {target_lang})?"

        # Case 2: Age is known, but experience and request type are missing
        if age is not None and "experience_level" in fields_to_ask:
            return f"Has your {age}-year-old done any programming before (like Scratch or blocks), or would this be their first time?"

        # Case 3: Age is missing, but experience is already known
        if "student_age" in fields_to_ask and age is None:
            if langs:
                lang_str = ", ".join(langs)
                return f"Awesome that they have experience with {lang_str}! How old is the student?"
            elif exp:
                return "How old is the student?"

        # Case 4: Age and experience are both known; only request_type is missing
        if "request_type" in fields_to_ask:
            return "Are they looking for a structured course, or do they already have a project they want help building?"

    # --- PROJECT HELP WORKFLOW ---
    if intent == PROJECT_HELP:
        if "project_goal" in fields_to_ask and "experience_level" in fields_to_ask:
            return "Could you tell me a little about the project they want to build, and what prior programming experience they have?"
        if "project_goal" in fields_to_ask:
            return "Could you tell me a little more about the specific project or app they want to build?"
        if "experience_level" in fields_to_ask:
            return f"How much experience do they already have with {target_lang} or building software?"

    # --- ASSIGNMENT HELP WORKFLOW ---
    if intent == ASSIGNMENT_HELP:
        if "subject" in fields_to_ask:
            return "What specific subject or programming language is the assignment in, and when is it due?"

    # Fallback contextual question for single missing field
    field = fields_to_ask[0]
    if field == "student_age":
        return "How old is the student?"
    elif field == "experience_level":
        return "Have they had any prior experience with programming before?"
    elif field == "request_type":
        return "Are you looking for a structured course or 1-on-1 private tutoring?"

    return "Could you share a little more details about what you are looking for?"


def generate_followup_question(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Generates a natural follow-up question for missing fields.
    Appends the question to messages and marks next_action = 'wait_for_user'.
    """
    question = build_followup_question_text(state)
    messages = list(state.get("messages") or [])
    if question:
        messages.append({"role": "assistant", "content": question})

    return {
        "messages": messages,
        "next_action": "wait_for_user",
    }
