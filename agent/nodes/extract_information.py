"""
STEP 5 & 16 — Information Extraction & State Correction Node

Extracts structured facts from the user's latest conversation messages
into a strongly typed ExtractedInfo model, updating AgentState.
Preserves existing state values unless explicitly corrected or updated.

Step 16 enhancements:
- Explicit corrections override older values (age, experience, language, goal, request type).
- Negation guards prevent negated old values (e.g. "not 13", "not a beginner", "not Python")
  from being erroneously captured as target values.
- Cache invalidation: clears stale recommendations and responses when core facts are corrected.
"""

import re
from typing import Optional, List, Dict, Any, Tuple
from pydantic import BaseModel, Field

from agent.state import AgentState

KNOWN_LANGUAGES = [
    "scratch",
    "python",
    "java",
    "javascript",
    "c++",
    "c#",
    "roblox",
    "lua",
    "html",
    "css",
    "arduino",
    "react",
]


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


def _format_lang(l: str) -> str:
    """Standardizes programming language naming."""
    lower = l.lower().strip()
    if lower == "javascript":
        return "JavaScript"
    if lower == "c++":
        return "C++"
    if lower == "c#":
        return "C#"
    return lower.capitalize()


def _extract_age(text_lower: str) -> Optional[int]:
    """
    Extracts age with support for explicit corrections and negation guards.
    Handles:
    - "14, not 13" -> 14
    - "not 13, she is 14" -> 14
    - "said 11 by mistake, she turned 12" -> 12
    - "actually 14" -> 14
    - standard "is 12" / "13 years old" -> 12 / 13
    """
    # 1. Pattern: "14, not 13" or "14 instead of 13"
    corr_a = re.search(
        r"\b([6-9]|1\d|2[0-5])\s*(?:,\s*|\s+)(?:not|instead of)\s*([6-9]|1\d|2[0-5])\b",
        text_lower,
    )
    if corr_a:
        return int(corr_a.group(1))

    # 2. Pattern: "not 13, she is 14" or "not 13 but 14"
    corr_b = re.search(
        r"\b(?:not|instead of)\s*([6-9]|1\d|2[0-5])\b.*?\b(?:is|actually|meant|but)?\s*([6-9]|1\d|2[0-5])\b",
        text_lower,
    )
    if corr_b:
        return int(corr_b.group(2))

    # 3. Pattern: "said 11 by mistake, she turned 12"
    corr_c = re.search(
        r"\b(?:said|thought)\s+([6-9]|1\d|2[0-5])\s+(?:by mistake|by accident).*?([6-9]|1\d|2[0-5])\b",
        text_lower,
    )
    if corr_c:
        return int(corr_c.group(2))

    # 4. Pattern: "actually 14" or "meant 14"
    corr_d = re.search(
        r"\b(?:actually|meant|correction:?)\s*(?:is|'s|he's|she's)?\s*([6-9]|1\d|2[0-5])\b",
        text_lower,
    )
    if corr_d:
        return int(corr_d.group(1))

    # 5. Standard age extraction with negation filter
    matches = re.finditer(
        r"\b(?:is|turned|age(?:d)?|daughter|son|kid|student)?\s*([6-9]|1\d|2[0-5])\s*(?:years?\s*old|yo|-year-old|\b)",
        text_lower,
    )
    for m in matches:
        start_idx = m.start()
        prefix = text_lower[max(0, start_idx - 15):start_idx]
        if not re.search(r"\b(?:not|instead of|wasn't|isn't)\s*$", prefix):
            try:
                val = int(m.group(1))
                if 5 <= val <= 25:
                    return val
            except (ValueError, TypeError):
                continue

    return None


def _extract_experience_level(text_lower: str) -> Optional[str]:
    """
    Extracts experience level with explicit correction support.
    Handles:
    - "advanced, not beginner" -> advanced
    - "not beginner, he is advanced" -> advanced
    - "I said beginner, but he actually knows Python pretty well." -> intermediate
    """
    # 1. Direct comparison: "intermediate, not beginner"
    comp_match = re.search(
        r"\b(beginner|intermediate|advanced)\s*(?:,\s*|\s+)(?:not|instead of)\s*(beginner|intermediate|advanced)\b",
        text_lower,
    )
    if comp_match:
        return comp_match.group(1)

    # 2. "not beginner, but intermediate"
    not_comp = re.search(
        r"\b(?:not|isn't)\s+(?:a\s+)?(beginner|intermediate|advanced)\b.*?\b(?:is|actually|but|meant)\s+(?:a\s+)?(beginner|intermediate|advanced)\b",
        text_lower,
    )
    if not_comp:
        return not_comp.group(2)

    # 3. Explicit correction phrasing
    if re.search(r"\b(?:actually|meant|correction:?)\b", text_lower):
        if re.search(r"\b(?:advanced|expert)\b", text_lower):
            return "advanced"
        if re.search(r"\b(?:pretty well|intermediate|knows (?:python|java|coding) (?:well|already))\b", text_lower):
            return "intermediate"
        if re.search(r"\b(?:beginner|novice|starting out|scratch only)\b", text_lower):
            return "beginner"

    # 4. Standard Intermediate / Advanced (ensuring not preceded by "not")
    adv_match = re.search(r"\b(?:not|isn't)\s+(?:intermediate|advanced|expert)\b", text_lower)
    if not adv_match:
        if re.search(r"\b(already knows|pretty well|intermediate|advanced|experienced|taken classes|building apps)\b", text_lower):
            if re.search(r"\b(advanced|expert)\b", text_lower):
                return "advanced"
            return "intermediate"

    # 5. Standard Beginner (ensuring not preceded by "not")
    beg_match = re.search(r"\b(?:not|isn't)\s+(?:a\s+)?beginner\b", text_lower)
    if not beg_match:
        if (
            re.search(r"\b(only scratch|beginner|fresh|new to|starting (?:fresh|out)|no (?:coding|programming|prior)|never (?:programmed|coded|done))\b", text_lower)
            or re.search(r"\bnever\s+(?:used|done|learned|knows|coded in)?\s*(?:python|programming|coding|java)\b", text_lower)
        ):
            return "beginner"

    return None


def _extract_programming_language(text_lower: str) -> Optional[str]:
    """
    Extracts target programming language with correction support.
    Handles:
    - "Java, not Python" -> Java
    - "Instead of Python, we want Java" -> Java
    - "Change that to C++" -> C++
    - "I meant JavaScript instead of Java" -> JavaScript
    """
    # 1. Direct language correction: "Java, not Python"
    for l1 in KNOWN_LANGUAGES:
        for l2 in KNOWN_LANGUAGES:
            if l1 == l2:
                continue
            if re.search(rf"\b{re.escape(l1)}\s*(?:,\s*|\s+)(?:not|instead of)\s*{re.escape(l2)}\b", text_lower):
                return _format_lang(l1)
            if re.search(rf"\b(?:not|instead of)\s*{re.escape(l2)}\b.*?\b(?:wants?|learn|study|switch to|change to|actually)?\s*{re.escape(l1)}\b", text_lower):
                return _format_lang(l1)

    # 2. "change to C++" / "switch to Java" / "meant JavaScript"
    change_m = re.search(r"\b(?:change\s+(?:that\s+)?to|switch\s+to|meant)\s+([a-zA-Z\+#]+?)(?:[\s\.,!?;]|$)", text_lower)
    if change_m and change_m.group(1).strip() in KNOWN_LANGUAGES:
        return _format_lang(change_m.group(1).strip())

    # 3. Standard target language without negation
    for lang in ["python", "java", "javascript", "c++", "html", "react"]:
        neg = re.search(rf"\b(?:not|never|no|instead of)\s+{re.escape(lang)}\b", text_lower)
        if not neg and re.search(rf"\b{re.escape(lang)}\b", text_lower):
            return _format_lang(lang)

    return None


def _extract_project_goal(text: str) -> Optional[str]:
    """
    Extracts project goal with correction support.
    Handles:
    - "Instead of a website, he wants to build a game" -> "build a game"
    - "Change the goal to building a mobile app" -> "building a mobile app"
    - "His goal is actually to prepare for USACO" -> "prepare for USACO"
    """
    # 1. Correction pattern: "instead of a website, he wants to build a game"
    corr_m = re.search(
        r"\binstead of\s+[^,]+,\s*(?:he|she|we|they|the student)?\s*(?:wants? to|wants? help|wants?)?\s*([a-zA-Z0-9\s,\-–—]+?)(?:\.|$|, and)",
        text,
        re.IGNORECASE,
    )
    if corr_m:
        return corr_m.group(1).strip()

    # 2. "change the goal to X" / "goal is actually X"
    change_m = re.search(
        r"\b(?:change\s+(?:the\s+)?goal\s+(?:to|is)|goal\s+is\s+actually\s+(?:to)?|correction:?\s*(?:he|she|they)?\s*(?:wants? to)?)\s+([a-zA-Z0-9\s,\-–—]+?)(?:\.|$|, and)",
        text,
        re.IGNORECASE,
    )
    if change_m:
        return change_m.group(1).strip()

    # 3. Direct project phrase: "personal project building a mobile app" or "project building an app"
    proj_m = re.search(
        r"\b(?:personal\s+project|project)\s+(?:of\s+)?([a-zA-Z0-9\s,\-–—]+?)(?:\.|$|, and|\s+and\s+want|\s+and\s+need)",
        text,
        re.IGNORECASE,
    )
    if proj_m:
        extracted = proj_m.group(1).strip()
        if len(extracted) > 3 and not re.search(r"\b(know|ask|see)\b", extracted.lower()):
            return extracted

    # 4. Standard goal pattern
    goal_match = re.search(
        r"\b(?:wants to|want to|looking to|trying to|needs help|wants help|need help|hoping to)\s+(?:with\s+)?([a-zA-Z0-9\s,\-–—]+?)(?:\.|$|, and)",
        text,
        re.IGNORECASE,
    )
    if goal_match:
        extracted = goal_match.group(1).strip()
        if len(extracted) > 3 and not re.search(r"\b(know|ask|see)\b", extracted.lower()):
            return extracted

    return None


def _extract_request_type(text_lower: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extracts request_type and preferred_class_type with correction support.
    Handles:
    - "1-on-1 tutoring, not a group class" -> ("project_help", "1-on-1")
    - "structured course instead of tutoring" -> ("long_term_course", "group")
    - "switch to assignment help" -> ("assignment_help", None)
    """
    # 1. Explicit format correction
    if re.search(r"\b(?:1-on-1|private tutoring|tutoring)\b.*?\b(?:not|instead of)\s*(?:a\s+)?(?:group|course|class)\b", text_lower):
        return ("project_help", "1-on-1")

    if re.search(r"\b(?:group|structured course|course)\b.*?\b(?:not|instead of)\s*(?:tutoring|private)\b", text_lower):
        return ("long_term_course", "group")

    if re.search(r"\b(?:switch to|actually|change to)\s+(?:an?\s+)?(?:assignment help|homework)\b", text_lower):
        return ("assignment_help", None)

    # 2. Standard detection
    req_type = None
    pref_format = None

    if re.search(r"\b(assignment|homework|ap computer science|ap cs|school project|due)\b", text_lower):
        req_type = "assignment_help"
    elif re.search(r"\b(build.*website|build.*app|build.*chatbot|make.*game|project help|personal project|travel website|wants help building|fix a bug|tutoring sessions?|private tutoring)\b", text_lower):
        req_type = "project_help"
    elif re.search(r"\b(course|class|classes|curriculum|program|lessons|long[ -]term|wants?\s+to\s+learn|learn\s+(?:python|ai|coding|programming|java|react))\b", text_lower):
        req_type = "long_term_course"

    if re.search(r"\b(1-on-1|one on one|private|individual)\b", text_lower):
        pref_format = "1-on-1"
        if not req_type:
            req_type = "project_help"
    elif re.search(r"\b(group|cohort|class of students)\b", text_lower):
        pref_format = "group"

    return req_type, pref_format


def _extract_from_text(text: str) -> ExtractedInfo:
    """
    Extracts facts deterministically from natural language text.
    Ensures zero hallucination on generic inquiries and handles corrections cleanly.
    """
    text_lower = text.lower().strip()
    info = ExtractedInfo()

    # 1. Age extraction with corrections
    info.student_age = _extract_age(text_lower)

    # 2. Target language extraction with corrections
    info.programming_language = _extract_programming_language(text_lower)

    # 3. Previous languages extraction
    for lang in KNOWN_LANGUAGES:
        neg_pattern = rf"\b(?:never|not|no|hasn't|has not)\s+(?:used|done|learned|knows|coded in)?\s*{re.escape(lang)}\b"
        has_neg = bool(re.search(neg_pattern, text_lower))
        has_mention = bool(re.search(rf"\b{re.escape(lang)}\b", text_lower))

        if has_mention and not has_neg:
            learn_pattern = rf"\b(?:wants to learn|want to learn|learn|interested in|study)\s+{re.escape(lang)}\b"
            if re.search(learn_pattern, text_lower):
                if not info.programming_language:
                    info.programming_language = _format_lang(lang)
            else:
                formatted = _format_lang(lang)
                if formatted not in info.previous_languages:
                    info.previous_languages.append(formatted)

    # 4. Experience level extraction with corrections
    info.experience_level = _extract_experience_level(text_lower)
    if not info.experience_level and "scratch" in text_lower:
        if not re.search(r"\b(?:python|java|javascript|c\+\+|react)\b", " ".join(info.previous_languages).lower()):
            info.experience_level = "beginner"

    # 5. Request type and format
    req_type, pref_format = _extract_request_type(text_lower)
    info.request_type = req_type
    info.preferred_class_type = pref_format

    if "ap computer science" in text_lower or "ap cs" in text_lower:
        info.subject = "AP Computer Science"

    # 6. Specific project goal with corrections
    info.project_goal = _extract_project_goal(text)

    return info


def extract_information(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Extracts new structured information from conversation context.
    Merges newly discovered facts into state, preserving previously established facts
    and cleanly applying user corrections over old values.
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

    # Detect if any core state facts are being corrected/modified
    fact_changed = False

    if extracted.student_age is not None:
        if extracted.student_age != state.get("student_age"):
            fact_changed = True
        updates["student_age"] = extracted.student_age

    if extracted.experience_level is not None:
        if extracted.experience_level != state.get("experience_level"):
            fact_changed = True
        updates["experience_level"] = extracted.experience_level

    if extracted.previous_languages:
        existing_langs = state.get("previous_languages") or []
        combined = list(dict.fromkeys(existing_langs + extracted.previous_languages))
        # If user explicitly stated they never used or did not use a language, remove it
        cleaned_langs = []
        for l in combined:
            if re.search(rf"\b(?:not|never|no)\s+{re.escape(l.lower())}\b", last_user_message.lower()):
                fact_changed = True
                continue
            cleaned_langs.append(l)
        updates["previous_languages"] = cleaned_langs

    if extracted.request_type is not None:
        if extracted.request_type != state.get("request_type"):
            fact_changed = True
        updates["request_type"] = extracted.request_type

    if extracted.project_goal is not None:
        if extracted.project_goal != state.get("project_goal"):
            fact_changed = True
        updates["project_goal"] = extracted.project_goal

    if extracted.programming_language is not None:
        if extracted.programming_language != state.get("programming_language"):
            fact_changed = True
        updates["programming_language"] = extracted.programming_language

    if extracted.subject is not None:
        if extracted.subject != state.get("subject"):
            fact_changed = True
        updates["subject"] = extracted.subject

    if extracted.preferred_class_type is not None:
        updates["preferred_class_type"] = extracted.preferred_class_type

    if extracted.duration_preference is not None:
        updates["duration_preference"] = extracted.duration_preference

    # If a prior recommendation existed and a core fact changed,
    # invalidate the stale recommendation & response cache so the workflow recalculates
    if fact_changed and state.get("recommended_class"):
        updates["recommended_class"] = None
        updates["recommended_class_id"] = None
        updates["recommendation_reason"] = None
        updates["response"] = None

    return updates
