"""
STEP 13 — Response Generator Nodes

Converts structured graph decisions into clean, warm, human-friendly responses.
Does not make routing decisions.

Guarantees:
- Friendly, conversational tone.
- No internal graph terminology (no mention of nodes, states, confidence, JSON, or schemas).
- Grounded in catalog facts and user context.
- Provides clear next steps.
"""

import re
from typing import Dict, Any, Optional
from agent.state import AgentState
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
)


def generate_response(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Formats final response for workflow recommendations
    or delegates to appropriate conversational format.
    """
    recommended_class = state.get("recommended_class")
    reason = state.get("recommendation_reason") or ""
    intent = state.get("intent")

    if recommended_class:
        # 1. Assignment Help Recommendation Response
        if intent == ASSIGNMENT_HELP:
            text = (
                f"For help with your coursework, I recommend **{recommended_class}**.\n\n"
                f"{reason}\n\n"
                f"Would you like to set up a 1-on-1 tutoring session to review your assignment together?"
            )
            return {"response": text}

        # 2. Project Help Recommendation Response
        elif intent == PROJECT_HELP:
            text = (
                f"Based on your project goals, I think **{recommended_class}** is the ideal match.\n\n"
                f"{reason}\n\n"
                f"Would you like to schedule a 1-on-1 session to walk through your project code and architecture?"
            )
            return {"response": text}

        # 3. Class Inquiry / General Course Recommendation Response
        else:
            text = (
                f"Based on what you've described, I think **{recommended_class}** would be the best fit.\n\n"
                f"{reason}\n\n"
                f"Would you like to schedule a free intro call or discuss next steps for enrolling?"
            )
            return {"response": text}

    # If a specific response was already set (e.g. from follow-up generator) and no recommendation
    if state.get("response"):
        return {"response": state["response"]}

    # If no recommendation exists and intent is general question
    if intent == GENERAL_QUESTION:
        return general_response(state)

    # Fallback to clarification if information is incomplete or unknown
    return clarification(state)


def general_response(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Handles general questions about Faruk's classes,
    credentials, teaching format, and course overview.
    Guards against revealing internal instructions or system prompts.
    """
    # 0. Prompt Inspection Guardrail: Never reveal internal prompts or hidden instructions
    messages = state.get("messages", [])
    last_msg = ""
    for m in reversed(messages):
        if isinstance(m, dict) and m.get("role") == "user":
            last_msg = m.get("content", "").lower()
            break
        elif isinstance(m, str):
            last_msg = m.lower()
            break

    if re.search(r"\b(?:hidden\s+prompt|system\s+prompt|system\s+instructions?|hidden\s+instructions?|internal\s+instructions?)\b", last_msg):
        return {
            "response": (
                "I cannot share internal system instructions or prompts. "
                "I am Faruk's AI assistant and can help you with questions about his background, "
                "course offerings, and tutoring."
            )
        }

    intent = state.get("intent")
    if intent == "PRICING":
        text = (
            "Faruk offers flexible rates for both private 1-on-1 project tutoring and small group courses. "
            "Pricing depends on the format, meeting frequency, and whether you are seeking short-term assignment help "
            "or a multi-month curriculum. Introductory consultations are complimentary.\n\n"
            "Could you share which subject or course you are interested in so I can provide the exact details?"
        )
        return {"response": text}

    text = (
        "Faruk is a software engineer and educator offering live, interactive 1-on-1 tutoring "
        "and small group courses. Offerings include beginner Python & AI for kids, full-stack AI web "
        "development (React, Python, APIs, and databases), AP Computer Science prep (Java), robotics "
        "with Arduino, and professional QA test automation training.\n\n"
        "All sessions are live online and customized to each student's pace and goals. "
        "Could you tell me a little about what you or your student are hoping to learn?"
    )
    return {"response": text}


def clarification(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Prompts the user gently when the intent is unclear or low-confidence,
    without exposing any internal jargon.
    """
    text = (
        "I'd love to help you find the right option! Are you looking for programming courses "
        "for a student, 1-on-1 guidance building a personal software project, or help with a school "
        "computer science assignment?"
    )
    return {"response": text}
