"""
STEP 6 — Intent Classification Unit Tests

Tests at least 12 realistic conversational scenarios:
- 3 Class Inquiry
- 3 Project Help
- 3 Assignment Help
- 2 General Questions
- 1 Ambiguous Request (verifying confidence < 0.60 routes to UNKNOWN)
"""

import sys
import os
import pytest

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.state import AgentState
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
)
from agent.nodes.classify_intent import classify_intent, classify_text_intent, IntentResult


class TestIntentClassificationNode:
    """Test suite covering the 12 required intent classification scenarios."""

    # 1. Three Class Inquiry Tests
    @pytest.mark.parametrize(
        "query",
        [
            "My 13 year old wants to learn Python.",
            "Which class would be good for my son?",
            "What courses do you offer for beginners?",
        ],
    )
    def test_class_inquiry_intent(self, query):
        """Validates Class Inquiry intent detection with high confidence."""
        res = classify_text_intent(query)
        assert res.intent == CLASS_INQUIRY
        assert res.confidence >= 0.80

    # 2. Three Project Help Tests
    @pytest.mark.parametrize(
        "query",
        [
            "I want help building a travel website using an API.",
            "My daughter is making a chatbot and needs help.",
            "I have a personal project in Python that I need help finishing.",
        ],
    )
    def test_project_help_intent(self, query):
        """Validates Project Help intent detection with high confidence."""
        res = classify_text_intent(query)
        assert res.intent == PROJECT_HELP
        assert res.confidence >= 0.80

    # 3. Three Assignment Help Tests
    @pytest.mark.parametrize(
        "query",
        [
            "I need help with my Java homework.",
            "My son has an AP Computer Science assignment.",
            "I'm stuck on a coding lab due Friday.",
        ],
    )
    def test_assignment_help_intent(self, query):
        """Validates Assignment Help intent detection with high confidence."""
        res = classify_text_intent(query)
        assert res.intent == ASSIGNMENT_HELP
        assert res.confidence >= 0.80

    # 4. Two General Question Tests
    @pytest.mark.parametrize(
        "query",
        [
            "What is Python?",
            "Where did Faruk get his degree?",
        ],
    )
    def test_general_question_intent(self, query):
        """Validates General Question intent detection."""
        res = classify_text_intent(query)
        assert res.intent == GENERAL_QUESTION
        assert res.confidence >= 0.70

    # 5. Ambiguous Request Test (Confidence < 0.60 enforces UNKNOWN)
    @pytest.mark.parametrize(
        "query",
        [
            "maybe later idk",
            "not sure",
            "um hello",
        ],
    )
    def test_ambiguous_request_routes_to_unknown(self, query):
        """Validates low confidence (< 0.60) ambiguous requests route safely to UNKNOWN."""
        res = classify_text_intent(query)
        assert res.confidence < 0.60
        assert res.intent == UNKNOWN

    # 6. Graph Node Round Trip
    def test_classify_intent_node_updates_state(self):
        """Validates that classify_intent node sets 'intent' and 'intent_confidence' in state."""
        state: AgentState = {
            "messages": [{"role": "user", "content": "Which class would be good for my son?"}]
        }
        updates = classify_intent(state)
        assert updates["intent"] == CLASS_INQUIRY
        assert updates["intent_confidence"] >= 0.80
