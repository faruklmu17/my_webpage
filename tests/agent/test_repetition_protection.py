"""
Tests for STEP 17 — Repetition Protection

Verifies that the agent never:
- Asks for fields already known in state (e.g. age, experience).
- Asks for fields indirectly answered in previous user messages.
- Verbatim repeats the same question back-to-back.
"""

import pytest
from agent.nodes.followup_question import build_followup_question_text, generate_followup_question
from agent.graph import graph


class TestRepetitionProtection:
    """Step 17: Repetition protection tests."""

    def test_playbook_required_scenario(self):
        """
        Playbook Required Test:
        User: "My son is 12 and has used Scratch."
        The agent must NOT ask:
        "How old is your son?" or "Has he done any programming?"
        """
        initial_state = {
            "messages": [{"role": "user", "content": "My son is 12 and has used Scratch."}]
        }
        final_state = graph.invoke(initial_state)

        response = final_state.get("response", "").lower()
        # Must NOT ask age
        assert "how old" not in response
        assert "what age" not in response
        # Must NOT ask if they have programmed
        assert "done any programming" not in response
        assert "programmed before" not in response

    def test_known_age_never_reasked(self):
        """
        If student_age is already known, the generator must never ask for age.
        """
        state = {
            "student_age": 14,
            "missing_fields": ["student_age", "experience_level"],
            "intent": "CLASS_INQUIRY",
        }
        question = build_followup_question_text(state).lower()
        assert "how old" not in question
        assert "14-year-old" in question or "experience" in question

    def test_known_experience_never_reasked(self):
        """
        If experience_level or previous_languages is present, never ask programming experience.
        """
        state = {
            "student_age": 13,
            "experience_level": "beginner",
            "previous_languages": ["Scratch"],
            "missing_fields": ["experience_level", "request_type"],
            "intent": "CLASS_INQUIRY",
        }
        question = build_followup_question_text(state).lower()
        assert "done any programming" not in question
        assert "first time" not in question
        assert "structured course" in question or "project" in question

    def test_verbatim_repeat_prevention(self):
        """
        If the primary question was already asked, provide an alternative phrasing.
        """
        state = {
            "student_age": 13,
            "experience_level": "beginner",
            "missing_fields": ["request_type"],
            "intent": "CLASS_INQUIRY",
            "last_question_asked": "Are they looking for a structured course, or do they already have a project they want help building?",
            "questions_asked": [
                "Are they looking for a structured course, or do they already have a project they want help building?"
            ],
        }
        question = build_followup_question_text(state)
        # Must NOT repeat the exact same string
        assert question != state["last_question_asked"]
        assert "structured" in question or "tutoring" in question or "lessons" in question

    def test_questions_asked_history_tracked(self):
        """
        Verifies generate_followup_question appends questions to questions_asked list.
        """
        state = {
            "missing_fields": ["student_age", "experience_level"],
            "intent": "CLASS_INQUIRY",
            "questions_asked": ["Previous question?"],
        }
        res = generate_followup_question(state)
        assert len(res["questions_asked"]) == 2
        assert res["questions_asked"][0] == "Previous question?"
        assert res["response"] == res["questions_asked"][1]
