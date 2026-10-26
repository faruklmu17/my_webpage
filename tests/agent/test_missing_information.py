"""
STEP 7 — Missing Information Checker Unit Tests

Tests:
- Test A: CLASS_INQUIRY with only student_age -> missing includes experience_level, request_type
- Test B: PROJECT_HELP with project_goal & experience_level -> missing_fields == []
- Test C: Known fields are never marked missing
- Test D: ASSIGNMENT_HELP checks subject or programming_language
- Test E: GENERAL_QUESTION & UNKNOWN require 0 missing fields
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
from agent.nodes.missing_information import (
    check_missing_information,
    get_required_fields_for_intent,
)


class TestMissingInformationNode:
    """Test suite for Step 7 check_missing_information node."""

    def test_a_class_inquiry_missing_fields(self):
        """
        Test A:
        State: {'intent': 'CLASS_INQUIRY', 'student_age': 12}
        Expected missing fields include: experience_level, request_type
        """
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 12,
        }
        res = check_missing_information(state)
        missing = res["missing_fields"]
        assert "experience_level" in missing
        assert "request_type" in missing
        assert "student_age" not in missing

    def test_b_project_help_complete_fields(self):
        """
        Test B:
        State: {'intent': 'PROJECT_HELP', 'project_goal': 'build an AI chatbot', 'experience_level': 'intermediate'}
        Expected: missing_fields == []
        """
        state: AgentState = {
            "intent": PROJECT_HELP,
            "project_goal": "build an AI chatbot",
            "experience_level": "intermediate",
        }
        res = check_missing_information(state)
        assert res["missing_fields"] == []

    def test_c_known_fields_never_marked_missing(self):
        """
        Test C: Ensure known fields are never marked missing.
        """
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 14,
            "experience_level": "beginner",
            "request_type": "long_term_course",
        }
        res = check_missing_information(state)
        assert res["missing_fields"] == []
        assert "student_age" not in res["missing_fields"]
        assert "experience_level" not in res["missing_fields"]
        assert "request_type" not in res["missing_fields"]

    def test_d_assignment_help_satisfied_by_subject_or_language(self):
        """ASSIGNMENT_HELP needs subject or programming_language."""
        # Case 1: Incomplete
        res1 = check_missing_information({"intent": ASSIGNMENT_HELP})
        assert "subject" in res1["missing_fields"]

        # Case 2: Subject provided
        res2 = check_missing_information({"intent": ASSIGNMENT_HELP, "subject": "AP Computer Science"})
        assert res2["missing_fields"] == []

        # Case 3: Programming language provided
        res3 = check_missing_information({"intent": ASSIGNMENT_HELP, "programming_language": "Java"})
        assert res3["missing_fields"] == []

    def test_e_general_and_unknown_require_no_intake_fields(self):
        """General questions and unknown intents require 0 intake fields."""
        res_gen = check_missing_information({"intent": GENERAL_QUESTION})
        assert res_gen["missing_fields"] == []

        res_unk = check_missing_information({"intent": UNKNOWN})
        assert res_unk["missing_fields"] == []
