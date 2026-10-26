"""
Tests for STEP 16 — State Correction Handling

Verifies that users can correct previously provided information across all key fields:
- age
- experience level
- programming language
- project goal
- request type / format
and that downstream graph recommendations update accordingly.
"""

import pytest
from agent.nodes.extract_information import extract_information, _extract_from_text
from agent.graph import graph


class TestStateCorrections:
    """Step 16: Unit tests for state correction handling."""

    def test_correction_age_scalar_override(self):
        """
        Playbook: "Actually, she is 14, not 13." -> student_age == 14 (not [13, 14]).
        """
        state = {
            "student_age": 13,
            "messages": [
                {"role": "user", "content": "My daughter is 13."},
                {"role": "assistant", "content": "How can I help her?"},
                {"role": "user", "content": "Actually, she is 14, not 13."},
            ],
        }
        updates = extract_information(state)
        assert updates.get("student_age") == 14
        assert not isinstance(updates.get("student_age"), list)

    def test_correction_age_negation_order(self):
        """
        "Not 13, he is actually 14." -> student_age == 14.
        """
        state = {
            "student_age": 13,
            "messages": [{"role": "user", "content": "Not 13, he is actually 14."}],
        }
        updates = extract_information(state)
        assert updates.get("student_age") == 14

    def test_correction_experience_level_playbook_example(self):
        """
        Playbook: "I said beginner, but he actually knows Python pretty well."
        """
        state = {
            "experience_level": "beginner",
            "messages": [
                {"role": "user", "content": "I said beginner, but he actually knows Python pretty well."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("experience_level") == "intermediate"

    def test_correction_experience_level_advanced(self):
        """
        "Actually, she is advanced, not beginner." -> advanced.
        """
        state = {
            "experience_level": "beginner",
            "messages": [
                {"role": "user", "content": "Actually, she is advanced, not beginner."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("experience_level") == "advanced"

    def test_correction_programming_language(self):
        """
        "Actually, he wants to learn Java, not Python." -> Java.
        """
        state = {
            "programming_language": "Python",
            "messages": [
                {"role": "user", "content": "Actually, he wants to learn Java, not Python."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("programming_language") == "Java"

    def test_correction_programming_language_switch_to(self):
        """
        "Change that to C++." -> C++.
        """
        state = {
            "programming_language": "Python",
            "messages": [
                {"role": "user", "content": "Change that to C++."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("programming_language") == "C++"

    def test_correction_project_goal(self):
        """
        "Actually, instead of a website, he wants to build a game." -> "build a game".
        """
        state = {
            "project_goal": "build a travel website",
            "messages": [
                {"role": "user", "content": "Actually, instead of a website, he wants to build a game."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("project_goal") is not None
        assert "game" in updates.get("project_goal").lower()

    def test_correction_request_type_and_format(self):
        """
        "Actually, we want private 1-on-1 tutoring, not a group class." -> 1-on-1.
        """
        state = {
            "request_type": "long_term_course",
            "preferred_class_type": "group",
            "messages": [
                {"role": "user", "content": "Actually, we want private 1-on-1 tutoring, not a group class."}
            ],
        }
        updates = extract_information(state)
        assert updates.get("preferred_class_type") == "1-on-1"
        assert updates.get("request_type") == "project_help"

    def test_correction_request_type_to_assignment(self):
        """
        "Actually, can we switch to assignment help?" -> assignment_help.
        """
        state = {
            "request_type": "long_term_course",
            "messages": [
                {"role": "user", "content": "Actually, can we switch to assignment help?"}
            ],
        }
        updates = extract_information(state)
        assert updates.get("request_type") == "assignment_help"

    def test_graph_e2e_state_correction_updates_recommendation(self):
        """
        End-to-end:
        Turn 1: Parent states 10-year-old beginner looking to learn Python -> recommended "AI & Python for Kids".
        Turn 2: Parent corrects: "Actually, she is 15, not 10, and already knows Python."
        Graph should update age to 15, experience to intermediate, and recommend "Advanced Python & AI"
        instead of keeping the stale kids class.
        """
        # Turn 1
        s1 = graph.invoke({
            "messages": [{"role": "user", "content": "My 10 year old is a beginner and wants to learn Python."}]
        })
        assert s1.get("student_age") == 10
        assert s1.get("recommended_class_id") == "ai_python_kids"

        # Turn 2: User provides correction
        turn_2_messages = s1["messages"] + [
            {"role": "user", "content": "Actually, she is 15, not 10, and already knows Python."}
        ]
        s1["messages"] = turn_2_messages
        s2 = graph.invoke(s1)

        # Verified corrected state facts
        assert s2.get("student_age") == 15
        assert s2.get("experience_level") in ["intermediate", "advanced"]
        # Verified updated recommendation
        assert s2.get("recommended_class_id") == "advanced_python_ai_web"
        assert "Advanced Python & AI" in s2.get("response", "")
