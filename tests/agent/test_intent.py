"""
STEP 4 — Intent Constants & Normalization Unit Tests

Tests:
- Centralized intent constants exist and match expected values
- normalize_intent safely handles valid values
- normalize_intent safely normalizes case and whitespace
- normalize_intent safely maps invalid / arbitrary strings to UNKNOWN
- normalize_intent handles None, empty string, and non-string inputs
"""

import sys
import os
import pytest

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.intents import (
    Intent,
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    TECHNICAL_QUESTION,
    SCHEDULING,
    PRICING,
    GENERAL_QUESTION,
    UNKNOWN,
    MVP_INTENTS,
    normalize_intent,
)


class TestIntentConstantsAndNormalization:
    """Validates centralization, enum membership, and normalization rules."""

    def test_intent_constants_defined(self):
        """Ensure all 8 core intents exist and are non-empty strings."""
        expected_intents = [
            CLASS_INQUIRY,
            PROJECT_HELP,
            ASSIGNMENT_HELP,
            TECHNICAL_QUESTION,
            SCHEDULING,
            PRICING,
            GENERAL_QUESTION,
            UNKNOWN,
        ]
        for intent in expected_intents:
            assert isinstance(intent, str)
            assert len(intent) > 0
            assert intent in Intent.__members__

    def test_mvp_intents_contain_core_workflows(self):
        """Ensure MVP set contains the 5 required first-version intents."""
        assert CLASS_INQUIRY in MVP_INTENTS
        assert PROJECT_HELP in MVP_INTENTS
        assert ASSIGNMENT_HELP in MVP_INTENTS
        assert GENERAL_QUESTION in MVP_INTENTS
        assert UNKNOWN in MVP_INTENTS

    @pytest.mark.parametrize(
        "raw_input,expected_intent",
        [
            ("CLASS_INQUIRY", "CLASS_INQUIRY"),
            ("class_inquiry", "CLASS_INQUIRY"),
            ("class inquiry", "CLASS_INQUIRY"),
            ("  project_help  ", "PROJECT_HELP"),
            ("assignment help", "ASSIGNMENT_HELP"),
            ("general_question", "GENERAL_QUESTION"),
            ("UNKNOWN", "UNKNOWN"),
        ],
    )
    def test_valid_intent_normalization(self, raw_input, expected_intent):
        """Ensure valid strings with varying cases and spaces normalize correctly."""
        assert normalize_intent(raw_input) == expected_intent

    @pytest.mark.parametrize(
        "invalid_input",
        [
            "INVALID_VALUE",
            "random_hallucinated_intent",
            "12345",
            "",
            "   ",
            None,
            123,
            ["not", "a", "string"],
            {"dict": "val"},
        ],
    )
    def test_invalid_intent_rejected_to_unknown(self, invalid_input):
        """Required Test: Verify invalid intent values are rejected or safely normalized to UNKNOWN."""
        assert normalize_intent(invalid_input) == UNKNOWN
