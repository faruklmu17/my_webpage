"""
STEP 20 — Conversation Regression Suite (20 Scenarios)

Comprehensive regression test file covering 20 realistic conversation scenarios:
1. Parent asking for beginner Python
2. Parent asking for AI
3. Teen asking for project help
4. Java assignment
5. AP CSA
6. Web development
7. Mobile app project
8. Student who knows Scratch
9. Student who knows Python
10. Intermediate student
11. Vague inquiry
12. Changing age
13. Changing goal
14. Short-term tutoring
15. Long-term course
16. 1-on-1 preference
17. Unrelated technical question
18. Pricing question
19. Unclear message
20. Repeated message
"""

import pytest
from agent.graph import graph
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    PRICING,
    UNKNOWN,
)


class TestConversationRegressionSuite:
    """Step 20: 20-scenario regression test suite."""

    def test_scenario_01_parent_asking_for_beginner_python(self):
        """1. Parent asking for beginner Python."""
        state = {
            "messages": [
                {"role": "user", "content": "I am looking for a beginner Python course for my 11 year old son."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("intent") == CLASS_INQUIRY
        assert res.get("student_age") == 11
        assert res.get("experience_level") == "beginner"
        assert res.get("programming_language") == "Python"
        assert res.get("recommended_class_id") == "ai_python_kids"
        assert res.get("missing_fields") == []

    def test_scenario_02_parent_asking_for_ai(self):
        """2. Parent asking for AI (missing experience -> requires follow-up)."""
        state = {
            "messages": [
                {"role": "user", "content": "My 12 year old daughter wants to learn artificial intelligence."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("intent") == CLASS_INQUIRY
        assert res.get("student_age") == 12
        assert "experience_level" in (res.get("missing_fields") or [])
        assert res.get("recommended_class") is None
        assert res.get("next_action") == "wait_for_user"

    def test_scenario_03_teen_asking_for_project_help(self):
        """3. Teen asking for project help."""
        # Turn 1: Project goal stated, experience missing
        state_t1 = graph.invoke({
            "messages": [
                {
                    "role": "user",
                    "content": "I'm 16 and need help building a full-stack web application with React and an API.",
                }
            ]
        })
        assert state_t1.get("intent") == PROJECT_HELP
        assert state_t1.get("student_age") == 16
        assert "experience_level" in (state_t1.get("missing_fields") or [])
        assert state_t1.get("recommended_class") is None
        assert state_t1.get("next_action") == "wait_for_user"

        # Turn 2: User supplies intermediate experience
        state_t1["messages"].append({"role": "user", "content": "I have intermediate Python experience."})
        state_t2 = graph.invoke(state_t1)
        assert state_t2.get("recommended_class_id") in ["advanced_python_ai_web", "private_project_tutoring"]
        assert state_t2.get("missing_fields") == []

    def test_scenario_04_java_assignment(self):
        """4. Java assignment."""
        state = {
            "messages": [
                {"role": "user", "content": "I need help with my Java homework assignment on recursion due tomorrow."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("intent") == ASSIGNMENT_HELP
        assert res.get("programming_language") == "Java"
        assert res.get("recommended_class_id") == "ap_computer_science_java"
        assert res.get("missing_fields") == []

    def test_scenario_05_ap_csa(self):
        """5. AP CSA exam prep."""
        state = {
            "messages": [
                {"role": "user", "content": "My son is taking AP Computer Science A and needs prep for the exam."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("recommended_class_id") == "ap_computer_science_java"
        assert res.get("subject") == "AP Computer Science"

    def test_scenario_06_web_development(self):
        """6. Web development with database/React."""
        state = {
            "messages": [
                {
                    "role": "user",
                    "content": "My 15 year old already knows Python and wants to build web applications with React and database.",
                }
            ]
        }
        res = graph.invoke(state)
        assert res.get("student_age") == 15
        assert res.get("experience_level") in ["intermediate", "advanced"]
        assert res.get("recommended_class_id") == "advanced_python_ai_web"

    def test_scenario_07_mobile_app_project(self):
        """7. Mobile app project."""
        state = {
            "messages": [
                {"role": "user", "content": "I have a personal project building a mobile app and want 1-on-1 tutoring help."}
            ]
        }
        # Turn 1: Project goal and 1-on-1 stated; experience level missing
        s1 = graph.invoke({
            "messages": [
                {"role": "user", "content": "I have a personal project building a mobile app and want 1-on-1 tutoring help."}
            ]
        })
        assert s1.get("intent") == PROJECT_HELP
        assert s1.get("preferred_class_type") == "1-on-1"
        assert "experience_level" in (s1.get("missing_fields") or [])
        assert s1.get("recommended_class") is None

        # Turn 2: User provides intermediate experience
        s1["messages"].append({"role": "user", "content": "I am an intermediate developer."})
        s2 = graph.invoke(s1)
        assert s2.get("recommended_class_id") == "private_project_tutoring"

    def test_scenario_08_student_who_knows_scratch(self):
        """8. Student who knows Scratch."""
        state = {
            "messages": [
                {"role": "user", "content": "He is 10 and has only used Scratch before."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("student_age") == 10
        assert "Scratch" in (res.get("previous_languages") or [])
        assert res.get("experience_level") == "beginner"
        # Does not re-ask age or experience
        question = res.get("response", "").lower()
        assert "how old" not in question
        assert "done any programming" not in question

    def test_scenario_09_student_who_knows_python(self):
        """9. Student who knows Python."""
        state = {
            "messages": [
                {"role": "user", "content": "She is 14 and already knows Python, looking for an advanced course."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("student_age") == 14
        assert res.get("experience_level") in ["intermediate", "advanced"]
        assert res.get("recommended_class_id") == "advanced_python_ai_web"

    def test_scenario_10_intermediate_student(self):
        """10. Intermediate student."""
        state = {
            "messages": [
                {"role": "user", "content": "He is 13, has intermediate coding experience, and wants to learn AI."}
            ]
        }
        res = graph.invoke(state)
        assert res.get("student_age") == 13
        assert res.get("experience_level") == "intermediate"
        assert res.get("recommended_class_id") == "advanced_python_ai_web"

    def test_scenario_11_vague_inquiry(self):
        """11. Vague inquiry."""
        state = {
            "messages": [{"role": "user", "content": "Tell me about what you do."}]
        }
        res = graph.invoke(state)
        assert res.get("intent") == GENERAL_QUESTION
        assert res.get("recommended_class") is None
        assert "Faruk" in res.get("response", "")

    def test_scenario_12_changing_age(self):
        """12. Changing age (State correction)."""
        s1 = graph.invoke({
            "messages": [{"role": "user", "content": "My daughter is 10."}]
        })
        assert s1.get("student_age") == 10

        s1["messages"].append({"role": "user", "content": "Actually, she is 14, not 10."})
        s2 = graph.invoke(s1)
        assert s2.get("student_age") == 14

    def test_scenario_13_changing_goal(self):
        """13. Changing goal (State correction)."""
        s1 = graph.invoke({
            "messages": [{"role": "user", "content": "He wants to build a travel website."}]
        })
        assert "website" in (s1.get("project_goal") or "").lower()

        s1["messages"].append({"role": "user", "content": "Actually, instead of a website, he wants to build a game."})
        s2 = graph.invoke(s1)
        assert "game" in (s2.get("project_goal") or "").lower()

    def test_scenario_14_short_term_tutoring(self):
        """14. Short-term tutoring."""
        s1 = graph.invoke({
            "messages": [
                {"role": "user", "content": "I just need a couple of 1-on-1 tutoring sessions to fix a bug in my code."}
            ]
        })
        assert s1.get("preferred_class_type") == "1-on-1"
        assert s1.get("next_action") == "wait_for_user"

        s1["messages"].append({"role": "user", "content": "I'm 16 with intermediate experience building a Python web app."})
        s2 = graph.invoke(s1)
        assert s2.get("recommended_class_id") == "private_project_tutoring"

    def test_scenario_15_long_term_course(self):
        """15. Long-term course."""
        state = {
            "messages": [
                {
                    "role": "user",
                    "content": "We want a weekly structured course for the school year for an 11 year old beginner.",
                }
            ]
        }
        res = graph.invoke(state)
        assert res.get("request_type") == "long_term_course"
        assert res.get("student_age") == 11
        assert res.get("experience_level") == "beginner"
        assert res.get("recommended_class_id") == "ai_python_kids"

    def test_scenario_16_one_on_one_preference(self):
        """16. 1-on-1 preference."""
        s1 = graph.invoke({
            "messages": [
                {"role": "user", "content": "I want private 1-on-1 tutoring for Python."}
            ]
        })
        assert s1.get("preferred_class_type") == "1-on-1"
        assert s1.get("next_action") == "wait_for_user"

        s1["messages"].append({"role": "user", "content": "My daughter is 14 and is a beginner."})
        s2 = graph.invoke(s1)
        assert s2.get("recommended_class_id") == "private_project_tutoring"

    def test_scenario_17_unrelated_technical_question(self):
        """17. Unrelated technical question."""
        state = {
            "messages": [
                {"role": "user", "content": "What is the difference between a list and a tuple in Python?"}
            ]
        }
        res = graph.invoke(state)
        assert res.get("intent") == GENERAL_QUESTION
        assert res.get("recommended_class") is None
        assert res.get("response") != ""

    def test_scenario_18_pricing_question(self):
        """18. Pricing question."""
        state = {
            "messages": [
                {"role": "user", "content": "How much do your tutoring sessions cost?"}
            ]
        }
        res = graph.invoke(state)
        assert res.get("intent") == PRICING
        assert "rates" in res.get("response", "").lower() or "pricing" in res.get("response", "").lower()

    def test_scenario_19_unclear_message(self):
        """19. Unclear message."""
        state = {
            "messages": [{"role": "user", "content": "maybe later idk"}]
        }
        res = graph.invoke(state)
        assert res.get("intent") == UNKNOWN
        assert "find the right option" in res.get("response", "")

    def test_scenario_20_repeated_message(self):
        """20. Repeated message (Turn 1 and Turn 2 same message)."""
        s1 = graph.invoke({
            "messages": [{"role": "user", "content": "hello"}]
        })
        assert s1.get("intent") == UNKNOWN

        s1["messages"].append({"role": "user", "content": "hello"})
        s2 = graph.invoke(s1)
        assert s2.get("intent") == UNKNOWN
        assert s2.get("response") != ""
