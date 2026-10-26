"""
STEP 14 — End-to-End LangGraph Workflow Tests

Validates Scenarios 1–6 from LANGGRAPH_PLAYBOOK.md against the compiled StateGraph.
"""

import pytest
from agent.graph import graph
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
)


class TestCompleteLangGraphE2E:
    """Step 14 End-to-End Scenarios."""

    def test_scenario_1_beginner_class_inquiry_incomplete(self):
        """
        Scenario 1:
        User: "My 11 year old wants to learn Python and AI."
        Expected:
        - intent = CLASS_INQUIRY
        - student_age = 11
        - project_goal / programming_language has Python/AI
        - experience_level is missing
        - asks follow-up question
        - does NOT recommend prematurely
        """
        initial_state = {
            "messages": [{"role": "user", "content": "My 11 year old wants to learn Python and AI."}]
        }
        final_state = graph.invoke(initial_state)

        assert final_state.get("intent") == CLASS_INQUIRY
        assert final_state.get("student_age") == 11
        assert "experience_level" in (final_state.get("missing_fields") or [])
        assert final_state.get("recommended_class") is None

        # Verify a follow-up question was generated and asks about experience
        response = final_state.get("response", "")
        assert response != ""
        assert "?" in response
        assert "experience" in response.lower() or "programming before" in response.lower() or "scratch" in response.lower()

    def test_scenario_2_user_provides_experience_completes_intake(self):
        """
        Scenario 2:
        Turn 1: "My 11 year old wants to learn Python and AI."
        Turn 2: "Only Scratch."
        Expected:
        - retains age = 11
        - retains Python / AI goal
        - records Scratch
        - infers beginner
        - recommends "AI & Python for Kids"
        """
        # Turn 1
        state_t1 = graph.invoke({
            "messages": [{"role": "user", "content": "My 11 year old wants to learn Python and AI."}]
        })
        assert state_t1.get("student_age") == 11

        # Turn 2: User answers follow-up
        turn_2_messages = [
            {"role": "user", "content": "My 11 year old wants to learn Python and AI."},
            {"role": "assistant", "content": state_t1["response"]},
            {"role": "user", "content": "Only Scratch."},
        ]
        state_t1["messages"] = turn_2_messages

        state_t2 = graph.invoke(state_t1)

        assert state_t2.get("student_age") == 11
        assert "Scratch" in (state_t2.get("previous_languages") or [])
        assert state_t2.get("experience_level") == "beginner"
        assert state_t2.get("recommended_class") == "AI & Python for Kids"
        assert "AI & Python for Kids" in state_t2.get("response", "")

    def test_scenario_3_existing_project_recommendation(self):
        """
        Scenario 3:
        User: "My 15 year old already knows Python and wants help building an AI chatbot website."
        Expected:
        - age = 15
        - experience >= intermediate
        - recommends advanced web/AI course or private project tutoring
        - does NOT recommend beginner kids class
        """
        initial_state = {
            "messages": [
                {
                    "role": "user",
                    "content": "My 15 year old already knows Python and wants help building an AI chatbot website.",
                }
            ]
        }
        final_state = graph.invoke(initial_state)

        assert final_state.get("student_age") == 15
        assert final_state.get("experience_level") in ["intermediate", "advanced"]
        assert final_state.get("recommended_class") is not None
        assert final_state.get("recommended_class_id") != "ai_python_kids"
        assert final_state.get("recommended_class_id") in [
            "advanced_python_ai_web",
            "private_project_tutoring",
        ]
        assert final_state.get("recommended_class") in final_state.get("response", "")

    def test_scenario_4_assignment_help_recommendation(self):
        """
        Scenario 4:
        User: "My son needs help with an AP Computer Science Java assignment."
        Expected:
        - intent = ASSIGNMENT_HELP
        - subject contains AP Computer Science or Java
        - recommends AP Computer Science prep or private tutoring
        """
        initial_state = {
            "messages": [
                {
                    "role": "user",
                    "content": "My son needs help with an AP Computer Science Java assignment.",
                }
            ]
        }
        final_state = graph.invoke(initial_state)

        assert final_state.get("intent") == ASSIGNMENT_HELP
        assert final_state.get("recommended_class_id") == "ap_computer_science_java"
        assert "AP Computer Science" in final_state.get("response", "")

    def test_scenario_5_general_question_response(self):
        """
        Scenario 5:
        User: "What is the difference between Python and Java?"
        Expected:
        - intent = GENERAL_QUESTION
        - answers normally via general_response
        - does NOT recommend a class prematurely
        """
        initial_state = {
            "messages": [
                {
                    "role": "user",
                    "content": "What is the difference between Python and Java?",
                }
            ]
        }
        final_state = graph.invoke(initial_state)

        assert final_state.get("intent") == GENERAL_QUESTION
        assert final_state.get("recommended_class") is None
        assert "Faruk" in final_state.get("response", "")

    def test_scenario_6_multi_turn_information_persistence(self):
        """
        Scenario 6:
        Multi-turn cumulative intake across 3 steps:
        Turn 1: "My daughter is 13."
        Turn 2: "She wants to learn AI and Python."
        Turn 3: "She has used Scratch."
        Expected:
        - student_age = 13
        - previous_languages = ["Scratch"]
        - experience_level = "beginner"
        - recommended_class = "AI & Python for Kids"
        """
        # Turn 1
        s1 = graph.invoke({
            "messages": [{"role": "user", "content": "My daughter is 13."}]
        })
        assert s1.get("student_age") == 13

        # Turn 2
        s1["messages"] = [
            {"role": "user", "content": "My daughter is 13."},
            {"role": "assistant", "content": s1.get("response", "")},
            {"role": "user", "content": "She wants to learn AI and Python."},
        ]
        s2 = graph.invoke(s1)
        assert s2.get("student_age") == 13
        assert s2.get("programming_language") == "Python" or "ai" in (s2.get("project_goal") or "").lower()

        # Turn 3
        s2["messages"] = s1["messages"] + [
            {"role": "assistant", "content": s2.get("response", "")},
            {"role": "user", "content": "She has used Scratch."},
        ]
        s3 = graph.invoke(s2)
        assert s3.get("student_age") == 13
        assert "Scratch" in (s3.get("previous_languages") or [])
        assert s3.get("experience_level") == "beginner"
        assert s3.get("recommended_class") == "AI & Python for Kids"
        assert "AI & Python for Kids" in s3.get("response", "")
