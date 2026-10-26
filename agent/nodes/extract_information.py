"""
STEP 5 — Information Extraction Node

Extracts structured facts from the user's latest conversation messages
into a strongly typed ExtractedInfo model, updating AgentState.
Preserves existing state values unless explicitly corrected or updated.
"""

import re
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from agent.state import AgentState


class ExtractedInfo(BaseModel):
    """Structured facts extracted from conversation context."""
    student_age: Optional[int] = None
    experience_level: Optional[str] = None          # "beginner", "intermediate", "advanced"
    previous_languages: List[str] = Field(default_factory=list)
    request_type: Optional[str] = None              # "long_term_course", "project_help", "assignment_help"
    project_goal: Optional[str] = None
    programming_language: Optional[str] = None
    subject: Optional[str] = None                   # e.g. "AP Computer Science"
    preferred_class_type: Optional[str] = None      # "1-on-1", "group"
    duration_preference: Optional[str] = None


def _extract_from_text(text: str) -> ExtractedInfo:
    """
    Extracts facts deterministically from natural language text.
    Ensures zero hallucination on generic inquiries.
    """
    text_lower = text.lower()
    info = ExtractedInfo()

    # 1. Age extraction (e.g. "is 12", "13 years old", "daughter is 14", "turned 11")
    age_match = re.search(
        r"\b(?:is|turned|age(?:d)?|daughter|son|kid|student)?\s*([6-9]|1\d|2[0-5])\s*(?:years?\s*old|yo|-year-old|\b)",
        text_lower,
    )
    if age_match:
        try:
            val = int(age_match.group(1))
            if 5 <= val <= 25:
                info.student_age = val
        except (ValueError, TypeError):
            pass

    # 2. Previous Languages Extraction & Negation Detection
    KNOWN_LANGUAGES = ["scratch", "python", "java", "javascript", "c++", "c#", "roblox", "lua", "html", "css", "arduino"]
    for lang in KNOWN_LANGUAGES:
        # Check if preceded by negative indicators like "never", "not", "no"
        neg_pattern = rf"\b(?:never|not|no|hasn't|has not)\s+(?:used|done|learned|knows|coded in)?\s*{re.escape(lang)}\b"
        pos_pattern = rf"\b(?:knows|has used|used|familiar with|coded in|did|done|plays|built in)?\s*{re.escape(lang)}\b"
        
        has_neg = bool(re.search(neg_pattern, text_lower))
        has_mention = bool(re.search(rf"\b{re.escape(lang)}\b", text_lower))
        
        if has_mention and not has_neg:
            # Check context: if they want to LEARN it, it's not a previous language
            learn_pattern = rf"\b(?:wants to learn|want to learn|learn|interested in|study)\s+{re.escape(lang)}\b"
            if re.search(learn_pattern, text_lower):
                info.programming_language = lang.capitalize() if lang != "javascript" else "JavaScript"
            else:
                formatted = lang.capitalize() if lang != "javascript" else "JavaScript"
                if formatted == "C++":
                    formatted = "C++"
                if formatted not in info.previous_languages:
                    info.previous_languages.append(formatted)

    # 3. Programming language focus (target goal)
    if not info.programming_language:
        for lang in ["python", "java", "javascript", "c++", "html", "react"]:
            if re.search(rf"\b(?:learn|study|teach|class in|course in|help with)\s+{re.escape(lang)}\b", text_lower):
                info.programming_language = lang.capitalize() if lang != "javascript" else "JavaScript"
            elif re.search(rf"\b(?:already knows|knows)\s+{re.escape(lang)}\b", text_lower):
                info.programming_language = lang.capitalize() if lang != "javascript" else "JavaScript"

    # 4. Experience Level
    # Intermediate / Advanced signals checked first if explicit
    if re.search(r"\b(already knows|pretty well|intermediate|advanced|experienced|taken classes|building apps)\b", text_lower):
        if re.search(r"\b(advanced|expert)\b", text_lower):
            info.experience_level = "advanced"
        else:
            info.experience_level = "intermediate"
    # Beginner signals
    elif (
        re.search(r"\b(only scratch|beginner|fresh|new to|starting (?:fresh|out)|no (?:coding|programming|prior)|never (?:programmed|coded|done))\b", text_lower)
        or re.search(r"\bnever\s+(?:used|done|learned|knows|coded in)?\s*(?:python|programming|coding|java)\b", text_lower)
        or ("scratch" in text_lower and not re.search(r"\b(?:python|java|javascript|c\+\+|react)\b", " ".join(info.previous_languages).lower()))
    ):
        info.experience_level = "beginner"

    # 5. Project Goal & Request Type
    # Assignment Help
    if re.search(r"\b(assignment|homework|ap computer science|ap cs|school project|due)\b", text_lower):
        info.request_type = "assignment_help"
        if "ap computer science" in text_lower or "ap cs" in text_lower:
            info.subject = "AP Computer Science"
    # Project Help
    elif re.search(r"\b(build.*website|build.*app|build.*chatbot|make.*game|project help|personal project|travel website|wants help building)\b", text_lower):
        info.request_type = "project_help"
    # Course inquiry
    elif re.search(r"\b(course|class|classes|curriculum|program|lessons|long[ -]term|wants?\s+to\s+learn|learn\s+(?:python|ai|coding|programming|java|react))\b", text_lower):
        info.request_type = "long_term_course"

    # Specific goal text extraction
    goal_match = re.search(
        r"\b(?:wants to|want to|looking to|trying to|needs help|wants help|need help|hoping to)\s+(?:with\s+)?([a-zA-Z0-9\s,\-–—]+?)(?:\.|$|, and)",
        text,
        re.IGNORECASE,
    )
    if goal_match:
        extracted_goal = goal_match.group(1).strip()
        if len(extracted_goal) > 3 and not re.search(r"\b(know|ask|see)\b", extracted_goal.lower()):
            info.project_goal = extracted_goal

    return info


def extract_information(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Extracts new structured information from conversation context.
    Merges newly discovered facts into state, preserving previously established facts.
    """
    messages = state.get("messages", [])
    if not messages:
        return {}

    # Extract from latest user message
    last_user_message = ""
    for m in reversed(messages):
        if isinstance(m, dict) and m.get("role") == "user":
            last_user_message = m.get("content", "")
            break
        elif isinstance(m, str):
            last_user_message = m
            break

    if not last_user_message:
        return {}

    extracted = _extract_from_text(last_user_message)
    updates: Dict[str, Any] = {}

    # Update state fields if newly extracted (or override on correction)
    if extracted.student_age is not None:
        updates["student_age"] = extracted.student_age

    if extracted.experience_level is not None:
        updates["experience_level"] = extracted.experience_level

    if extracted.previous_languages:
        existing_langs = state.get("previous_languages") or []
        combined = list(dict.fromkeys(existing_langs + extracted.previous_languages))
        updates["previous_languages"] = combined

    if extracted.request_type is not None:
        updates["request_type"] = extracted.request_type

    if extracted.project_goal is not None:
        updates["project_goal"] = extracted.project_goal

    if extracted.programming_language is not None:
        updates["programming_language"] = extracted.programming_language

    if extracted.subject is not None:
        updates["subject"] = extracted.subject

    if extracted.preferred_class_type is not None:
        updates["preferred_class_type"] = extracted.preferred_class_type

    if extracted.duration_preference is not None:
        updates["duration_preference"] = extracted.duration_preference

    return updates
