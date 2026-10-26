"""
STEP 8 — Follow-Up Question Generator Unit Tests

Tests:
- Test A: Known student_age = 13, missing experience_level & request_type
  -> Must NOT ask age again.
- Test B: Known student_age = 14, experience_level = 'beginner', missing request_type
  -> Expected asking about structured course vs building a project.
- Test C: Output asks no more than 2 closely related questions (never a numbered questionnaire).
"""

import sys
import os
import pytest

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.state import AgentState
from agent.intents import CLASS_INQUIRY, PROJECT_HELP, ASSIGNMENT_HELP
from agent.nodes.followup_question import (
    generate_followup_question,
    build_followup_question_text,
)


class TestFollowUpQuestionNode:
    """Test suite for Step 8 generate_followup_question node."""

    def test_a_known_age_never_asked_again(self):
        """
        Test A:
        Known: student_age = 13
        Missing: experience_level, request_type
        Generated question must NOT ask age again.
        """
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 13,
            "missing_fields": ["experience_level", "request_type"],
        }
        question = build_followup_question_text(state)

        # Must not ask age
        assert "how old" not in question.lower()
        assert "what age" not in question.lower()
        assert "age of" not in question.lower()

        # Should ask about coding experience and reference the 13-year-old
        assert "13" in question
        assert "programming" in question.lower() or "coding" in question.lower()

    def test_b_known_age_and_experience_asks_course_vs_project(self):
        """
        Test B:
        Known: student_age = 14, experience_level = 'beginner'
        Missing: request_type
        Expected meaning:
        'Are they looking for a structured course, or do they already have a project they want help building?'
        """
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 14,
            "experience_level": "beginner",
            "missing_fields": ["request_type"],
        }
        question = build_followup_question_text(state)

        assert "how old" not in question.lower()
        assert "course" in question.lower()
        assert "project" in question.lower()

    def test_c_asks_no_more_than_two_closely_related_questions(self):
        """
        Test C: Ensure output asks no more than two closely related questions,
        and never uses a numbered questionnaire (e.g. '1. ... 2. ... 3. ...').
        """
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "missing_fields": ["student_age", "experience_level", "request_type", "project_goal"],
        }
        question = build_followup_question_text(state)

        # No numbered form list
        assert "1." not in question
        assert "2." not in question
        assert "3." not in question

        # At most 1 or 2 sentence questions (at most two question marks)
        num_question_marks = question.count("?")
        assert 1 <= num_question_marks <= 2

    def test_node_updates_messages_and_next_action(self):
        """Validates that generate_followup_question node sets next_action = 'wait_for_user'."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 12,
            "missing_fields": ["experience_level"],
            "messages": [{"role": "user", "content": "My son is 12."}],
        }
        res = generate_followup_question(state)

        assert res["next_action"] == "wait_for_user"
        msgs = res["messages"]
        assert len(msgs) == 2
        assert msgs[-1]["role"] == "assistant"
        assert "12" in msgs[-1]["content"]
