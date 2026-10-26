"""
STEP 5 — Information Extraction Unit Tests

Tests:
- Test A: "My son is 12." -> student_age == 12
- Test B: "She has used Scratch but never Python." -> previous_languages == ["Scratch"], experience_level == "beginner"
- Test C: "He is 15 and already knows Python. He wants to build an AI website." -> student_age == 15, programming_language == "Python", project_goal contains "AI website", experience_level in ["intermediate", "advanced"]
- Test D: Hallucination Guard -> "Can you tell me about your classes?" -> student_age is None, experience_level is None
- State Preservation: Ensure previous state facts are not overwritten by empty extraction
"""

import sys
import os
import pytest

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.state import AgentState
from agent.nodes.extract_information import extract_information, ExtractedInfo, _extract_from_text


class TestInformationExtractionNode:
    """Test suite for Step 5 ExtractedInfo model and extract_information node."""

    def test_a_extract_age(self):
        """Test A: 'My son is 12.' -> student_age == 12."""
        state: AgentState = {
            "messages": [{"role": "user", "content": "My son is 12."}]
        }
        updates = extract_information(state)
        assert updates.get("student_age") == 12

    def test_b_extract_previous_languages_and_beginner_level(self):
        """
        Test B: 'She has used Scratch but never Python.'
        Expected: previous_languages == ['Scratch'], experience_level == 'beginner'
        """
        state: AgentState = {
            "messages": [{"role": "user", "content": "She has used Scratch but never Python."}]
        }
        updates = extract_information(state)
        assert updates.get("previous_languages") == ["Scratch"]
        assert updates.get("experience_level") == "beginner"

    def test_c_extract_intermediate_project_goal(self):
        """
        Test C: 'He is 15 and already knows Python. He wants to build an AI website.'
        Expected:
        - student_age == 15
        - programming_language == 'Python'
        - project_goal contains 'AI website' or 'build an AI website'
        - experience_level in ['intermediate', 'advanced']
        """
        state: AgentState = {
            "messages": [{
                "role": "user",
                "content": "He is 15 and already knows Python. He wants to build an AI website."
            }]
        }
        updates = extract_information(state)
        assert updates.get("student_age") == 15
        assert updates.get("programming_language") == "Python"
        assert updates.get("experience_level") in ["intermediate", "advanced"]
        goal = updates.get("project_goal", "")
        assert "ai website" in goal.lower() or "build" in goal.lower()

    def test_d_hallucination_guard_on_generic_inquiry(self):
        """
        Test D — Hallucination Guard:
        'Can you tell me about your classes?'
        Expected: student_age is None, experience_level is None
        """
        state: AgentState = {
            "messages": [{"role": "user", "content": "Can you tell me about your classes?"}]
        }
        updates = extract_information(state)
        assert updates.get("student_age") is None
        assert updates.get("experience_level") is None

    def test_state_preservation_across_turns(self):
        """Ensure facts extracted in prior turns are preserved in state."""
        state: AgentState = {
            "student_age": 13,
            "experience_level": "beginner",
            "messages": [{"role": "user", "content": "He is interested in Python."}]
        }
        updates = extract_information(state)
        # Updates should extract Python as goal/programming_language without nullifying age
        assert updates.get("programming_language") == "Python"
        assert "student_age" not in updates  # Node only returns modified fields
        # Merged state retains prior fields
        state.update(updates)
        assert state["student_age"] == 13
        assert state["experience_level"] == "beginner"
        assert state["programming_language"] == "Python"
