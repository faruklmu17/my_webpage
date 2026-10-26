"""
STEP 6 — Intent Classification Node

Classifies user messages into supported intents:
- CLASS_INQUIRY
- PROJECT_HELP
- ASSIGNMENT_HELP
- GENERAL_QUESTION
- UNKNOWN

Enforces the confidence rule: confidence < 0.60 normalizes to UNKNOWN.
"""

import re
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from agent.state import AgentState
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
    normalize_intent,
)


class IntentResult(BaseModel):
    """Structured result of intent classification."""
    intent: str
    confidence: float = Field(ge=0.0, le=1.0)


def classify_text_intent(text: str) -> IntentResult:
    """
    Classifies a user query string into an IntentResult with confidence scoring.
    Enforces the threshold: confidence < 0.60 normalizes to UNKNOWN.
    """
    if not text or not text.strip():
        return IntentResult(intent=UNKNOWN, confidence=0.0)

    text_lower = text.lower().strip()
    words = set(re.findall(r"\b\w+\b", text_lower))

    # 1. Assignment Help Patterns (Homework, school labs, due dates, AP CS)
    ASSIGNMENT_PATTERNS = [
        r"\b(homework|assignment|due\s+(?:friday|tomorrow|soon|today)|school\s+lab|lab\s+due|ap\s+(?:computer\s+science|cs))\b",
        r"\bhelp\s+with\s+(?:my\s+)?(?:java|python|coding|cs)\s+(?:homework|assignment|lab)\b",
    ]
    for pattern in ASSIGNMENT_PATTERNS:
        if re.search(pattern, text_lower):
            return IntentResult(intent=ASSIGNMENT_HELP, confidence=0.92)

    # 2. Project Help Patterns (Building websites, chatbots, custom apps, APIs)
    PROJECT_PATTERNS = [
        r"\b(?:build|building|make|making|develop|developing|creating)\s+(?:a|an)?\s*(?:travel\s+website|chatbot|web\s+app|game|app\s+using|portfolio)\b",
        r"\b(?:help\s+building|help\s+with\s+my\s+project|personal\s+project|open\s+source\s+project)\b",
        r"\bworking\s+on\s+(?:a|my)\s+(?:website|chatbot|app|project)\b",
    ]
    for pattern in PROJECT_PATTERNS:
        if re.search(pattern, text_lower):
            return IntentResult(intent=PROJECT_HELP, confidence=0.90)

    # 3. Class Inquiry Patterns (Courses, age-based enrollment, curriculum, wanting to learn)
    CLASS_PATTERNS = [
        r"\b(?:which|what)\s+class\s+(?:would\s+be\s+good|is\s+best|do\s+you\s+recommend)\b",
        r"\b(?:looking\s+for|interested\s+in)\s+(?:a\s+)?(?:class|course|lessons|tutoring)\b",
        r"\b(?:my\s+)?\d{1,2}\s*(?:year\s*old|yo)?\s*(?:wants|looking)\s+to\s+learn\b",
        r"\b(?:classes|courses)\s+(?:do\s+you\s+offer|available|for\s+beginners)\b",
        r"\bwants?\s+to\s+learn\s+(?:python|coding|programming|ai|web\s+dev)\b",
    ]
    for pattern in CLASS_PATTERNS:
        if re.search(pattern, text_lower):
            return IntentResult(intent=CLASS_INQUIRY, confidence=0.88)

    # Secondary check for Class vs Project vs Assignment keywords
    if any(w in words for w in ["homework", "assignment"]):
        return IntentResult(intent=ASSIGNMENT_HELP, confidence=0.85)

    if any(w in words for w in ["class", "classes", "course", "courses", "curriculum"]):
        return IntentResult(intent=CLASS_INQUIRY, confidence=0.82)

    if any(w in words for w in ["project"]):
        return IntentResult(intent=PROJECT_HELP, confidence=0.80)

    # 4. General Question Patterns (Conceptual questions, Faruk bio, technical definitions)
    GENERAL_PATTERNS = [
        r"^(what|why|how|where|who)\s+(?:is|are|does|did|was)\b",
        r"\bdifference\s+between\b",
        r"\b(?:faruk|degree|university|background|education|credentials)\b",
        r"\bwhat\s+is\s+(?:python|java|playwright|selenium|ai|react)\b",
    ]
    for pattern in GENERAL_PATTERNS:
        if re.search(pattern, text_lower):
            return IntentResult(intent=GENERAL_QUESTION, confidence=0.85)

    # 5. Ambiguous or Unclear Requests
    # If short or vague, confidence is low (< 0.60), enforcing UNKNOWN
    AMBIGUOUS_WORDS = {"maybe", "not sure", "idk", "hello", "hi", "hey", "test", "ok", "cool", "thanks", "um", "uh"}
    if words.issubset(AMBIGUOUS_WORDS) or len(words) <= 2:
        return IntentResult(intent=UNKNOWN, confidence=0.40)

    # Fallback to general question with borderline confidence or UNKNOWN
    return IntentResult(intent=UNKNOWN, confidence=0.45)


def classify_intent(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Classifies the intent of the conversation based on the latest message.
    Updates state with 'intent' and 'intent_confidence'.
    """
    messages = state.get("messages", [])
    last_user_message = ""
    for m in reversed(messages):
        if isinstance(m, dict) and m.get("role") == "user":
            last_user_message = m.get("content", "")
            break
        elif isinstance(m, str):
            last_user_message = m
            break

    result = classify_text_intent(last_user_message)

    # Confidence rule: below 0.60 must route to UNKNOWN
    normalized = normalize_intent(result.intent) if result.confidence >= 0.60 else UNKNOWN

    return {
        "intent": normalized,
        "intent_confidence": result.confidence,
    }
