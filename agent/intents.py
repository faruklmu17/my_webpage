"""
STEP 4 — Intent Constants & Enumeration

Centralizes all supported conversational intents in one single source of truth.
Provides safe normalization to prevent unexpected / hallucinated intent strings.
"""

from enum import Enum
from typing import Optional, Set


class Intent(str, Enum):
    """Supported user conversational intents."""
    CLASS_INQUIRY = "CLASS_INQUIRY"
    PROJECT_HELP = "PROJECT_HELP"
    ASSIGNMENT_HELP = "ASSIGNMENT_HELP"
    TECHNICAL_QUESTION = "TECHNICAL_QUESTION"
    SCHEDULING = "SCHEDULING"
    PRICING = "PRICING"
    GENERAL_QUESTION = "GENERAL_QUESTION"
    UNKNOWN = "UNKNOWN"


# String constants for fast, clean access across graph nodes
CLASS_INQUIRY = Intent.CLASS_INQUIRY.value
PROJECT_HELP = Intent.PROJECT_HELP.value
ASSIGNMENT_HELP = Intent.ASSIGNMENT_HELP.value
TECHNICAL_QUESTION = Intent.TECHNICAL_QUESTION.value
SCHEDULING = Intent.SCHEDULING.value
PRICING = Intent.PRICING.value
GENERAL_QUESTION = Intent.GENERAL_QUESTION.value
UNKNOWN = Intent.UNKNOWN.value

# Core MVP intents supported by the first workflow version
MVP_INTENTS: Set[str] = {
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
}


def normalize_intent(value: Optional[str]) -> str:
    """
    Safely normalizes any raw or model-generated intent string.
    Rejects or maps invalid, empty, or unknown values to UNKNOWN.
    """
    if not value or not isinstance(value, str):
        return UNKNOWN
    
    cleaned = value.strip().upper().replace(" ", "_")
    try:
        return Intent(cleaned).value
    except ValueError:
        return UNKNOWN
