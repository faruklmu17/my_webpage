"""
STEP 3 — Agent State Model

Defines the single, shared, strongly typed state model for the LangGraph workflow.
Contains normalized structured fields extracted from the user's conversation.
"""

from typing import TypedDict, Optional, List, Dict, Any


class AgentState(TypedDict, total=False):
    """
    Shared conversation state passed through all LangGraph nodes.
    total=False allows optional fields to be omitted without raising errors.
    """
    # Raw conversation message list
    messages: List[Dict[str, Any]]

    # Intent detection
    intent: Optional[str]
    intent_confidence: Optional[float]

    # Normalized student background
    student_age: Optional[int]
    experience_level: Optional[str]            # "beginner", "intermediate", "advanced"
    previous_languages: Optional[List[str]]     # e.g. ["Scratch", "Python"]

    # Request and learning goals
    request_type: Optional[str]                # "long_term_course", "project_help", "assignment_help"
    project_goal: Optional[str]
    programming_language: Optional[str]
    subject: Optional[str]                     # e.g. "AP Computer Science"

    # Learning format preferences
    preferred_class_type: Optional[str]        # "1-on-1", "group"
    duration_preference: Optional[str]

    # Dynamic intake tracking
    missing_fields: List[str]

    # Recommendation outputs
    recommended_class: Optional[str]
    recommendation_reason: Optional[str]

    # Routing control
    next_action: Optional[str]
