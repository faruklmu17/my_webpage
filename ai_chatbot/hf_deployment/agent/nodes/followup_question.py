"""
STEP 8 & 17 — Follow-Up Question Generator Node with Repetition Protection

Generates conversational, non-repetitive follow-up questions for missing fields.
Rules:
- Never asks for information already known in state or indirectly answered.
- Never repeats identical questions back-to-back.
- Asks for at most 1–2 closely related pieces of missing information.
- Avoids robotic numbered questionnaires.
"""

import re
from typing import Dict, Any, List, Optional
from agent.state import AgentState
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
)


def _get_alternative_question_variation(
    primary: str,
    fields_to_ask: List[str],
    state: AgentState,
) -> str:
    """
    Returns an alternative phrasing when the primary question has already
    been asked in a previous turn of the conversation.
    """
    age = state.get("student_age")

    if "request_type" in fields_to_ask:
        return "Would you prefer weekly structured lessons or flexible 1-on-1 tutoring sessions?"

    if "experience_level" in fields_to_ask:
        if age is not None:
            return f"Have they written any text code before, or would this be their very first time coding?"
        return "Have they written any code before, or would they be starting completely from scratch?"

    if "student_age" in fields_to_ask:
        return "Could you let me know what grade or age group the student is in?"

    if "project_goal" in fields_to_ask:
        return "What kind of app, website, or tools are they hoping to build?"

    if "subject" in fields_to_ask:
        return "Which coding assignment or class topic do they need help with?"

    return "Could you share a few more details so I can recommend the best learning option?"


def build_followup_question_text(state: AgentState) -> str:
    """
    Constructs a natural, contextual follow-up question based on missing_fields
    and previously established state context.
    Guarantees that known or indirectly answered fields are never re-queried.
    """
    missing = state.get("missing_fields") or []
    if not missing:
        return ""

    age = state.get("student_age")
    exp = state.get("experience_level")
    langs = state.get("previous_languages") or []
    target_lang = state.get("programming_language") or "Python"
    intent = state.get("intent")

    # Repetition Protection: verify fields are truly missing
    truly_missing: List[str] = []
    for field in missing:
        if field == "student_age" and age is not None:
            continue
        if field == "experience_level" and (exp is not None or len(langs) > 0):
            continue
        if field == "request_type" and state.get("request_type") is not None:
            continue
        if field == "subject" and (state.get("subject") or state.get("programming_language")):
            continue
        if field == "project_goal" and state.get("project_goal"):
            continue
        truly_missing.append(field)

    if not truly_missing:
        return ""

    # Limit intake to at most top 2 missing fields at a time
    fields_to_ask = truly_missing[:2]
    candidate = ""

    # --- CLASS INQUIRY WORKFLOW ---
    if intent == CLASS_INQUIRY or "request_type" in fields_to_ask or "student_age" in fields_to_ask:
        # Case 1: Both age and experience are missing
        if "student_age" in fields_to_ask and "experience_level" in fields_to_ask:
            all_content = " ".join(str(m.get("content", "")) for m in state.get("messages", []) if isinstance(m, dict)).lower()
            is_he = bool(re.search(r"\b(son|boy|he|him|his)\b", all_content))
            candidate = f"Sure. How old is {'he' if is_he else 'the student'}, and {'has he' if is_he else 'have they'} done any programming before?"

        # Case 2: Age is known, but experience is missing
        elif age is not None and "experience_level" in fields_to_ask:
            candidate = f"Has your {age}-year-old done any programming before (like Scratch or blocks), or would this be their first time?"

        # Case 3: Age is missing, but experience is already known
        elif "student_age" in fields_to_ask and age is None:
            if langs:
                lang_str = ", ".join(langs)
                candidate = f"Awesome that they have experience with {lang_str}! How old is the student?"
            elif exp:
                candidate = "How old is the student?"

        # Case 4: Age and experience are both known; only request_type is missing
        elif "request_type" in fields_to_ask:
            all_content = " ".join(str(m.get("content", "")) for m in state.get("messages", []) if isinstance(m, dict)).lower()
            is_he = bool(re.search(r"\b(son|boy|he|him|his)\b", all_content))
            if is_he:
                candidate = "Great. Is he mainly looking for a structured course, or does he already have something specific he wants to build?"
            else:
                candidate = "Are they looking for a structured course, or do they already have a project they want help building?"

    # --- PROJECT HELP WORKFLOW ---
    elif intent == PROJECT_HELP:
        if "project_goal" in fields_to_ask and "experience_level" in fields_to_ask:
            candidate = "Could you tell me a little about the project they want to build, and what prior programming experience they have?"
        elif "project_goal" in fields_to_ask:
            candidate = "Could you tell me a little more about the specific project or app they want to build?"
        elif "experience_level" in fields_to_ask:
            candidate = f"How much experience do they already have with {target_lang} or building software?"

    # --- ASSIGNMENT HELP WORKFLOW ---
    elif intent == ASSIGNMENT_HELP:
        if "subject" in fields_to_ask:
            candidate = "What specific subject or programming language is the assignment in, and when is it due?"

    # Fallback contextual question for single missing field
    if not candidate:
        field = fields_to_ask[0]
        if field == "student_age":
            candidate = "How old is the student?"
        elif field == "experience_level":
            candidate = "Have they had any prior experience with programming before?"
        elif field == "request_type":
            candidate = "Are you looking for a structured course or 1-on-1 private tutoring?"
        else:
            candidate = "Could you share a little more details about what you are looking for?"

    # Repetition Protection: Avoid repeating the exact question asked in a prior turn
    last_q = state.get("last_question_asked")
    asked_history = state.get("questions_asked") or []

    if candidate == last_q or candidate in asked_history:
        candidate = _get_alternative_question_variation(candidate, fields_to_ask, state)

    return candidate


def generate_followup_question(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Generates a natural follow-up question for missing fields.
    Appends the question to messages, records questions_asked history,
    and marks next_action = 'wait_for_user'.
    """
    question = build_followup_question_text(state)
    messages = list(state.get("messages") or [])
    if question:
        messages.append({"role": "assistant", "content": question})

    questions_asked = list(state.get("questions_asked") or [])
    if question and question not in questions_asked:
        questions_asked.append(question)

    return {
        "messages": messages,
        "response": question,
        "last_question_asked": question,
        "questions_asked": questions_asked,
        "next_action": "wait_for_user",
    }
