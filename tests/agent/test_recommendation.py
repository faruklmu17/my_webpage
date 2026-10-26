"""
STEP 10 — Recommendation Engine Unit Tests

Tests at least 10 recommendation scenarios:
1. Beginner child (age 10, Scratch) -> ai_python_kids
2. Intermediate teen (age 14, Python, AI web apps) -> advanced_python_ai_web
3. AI interest (age 11, learn AI) -> ai_python_kids
4. Python interest -> matching age course
5. Web development (React / APIs) -> advanced_python_ai_web
6. Existing project (personal travel website) -> private_project_tutoring
7. Assignment help (AP Computer Science Java homework) -> ap_computer_science_java
8. Unclear goal -> safe age-based fallback
9. Age edge cases (young child vs older teen QA)
10. 1-on-1 preference -> 1-on-1 matching
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
from agent.nodes.recommendation import recommend_class, score_class_for_state


class TestRecommendationEngine:
    """Test suite covering the 10 required recommendation scenarios."""

    def test_1_beginner_child(self):
        """Scenario 1: Beginner child (age 10, Scratch) -> ai_python_kids."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 10,
            "experience_level": "beginner",
            "previous_languages": ["Scratch"],
            "request_type": "long_term_course",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "ai_python_kids"
        assert res["next_action"] == "generate_response"
        assert len(res["recommendation_reason"]) > 10

    def test_2_intermediate_teen_ai_web(self):
        """Scenario 2: Intermediate teen (age 14, Python, AI web apps) -> advanced_python_ai_web."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 14,
            "experience_level": "intermediate",
            "request_type": "long_term_course",
            "project_goal": "build AI web applications",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "advanced_python_ai_web"

    def test_3_ai_interest_for_younger_learner(self):
        """Scenario 3: AI interest for 11yo -> ai_python_kids."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 11,
            "experience_level": "beginner",
            "project_goal": "learn AI and chatbots",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "ai_python_kids"

    def test_4_python_interest_foundations(self):
        """Scenario 4: Python interest for 12yo beginner -> ai_python_kids."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 12,
            "experience_level": "beginner",
            "programming_language": "Python",
            "request_type": "long_term_course",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "ai_python_kids"

    def test_5_web_development_react(self):
        """Scenario 5: Web development interest (age 15, React, APIs) -> advanced_python_ai_web."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 15,
            "experience_level": "intermediate",
            "project_goal": "build web development apps with React and database",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "advanced_python_ai_web"

    def test_6_existing_project_help(self):
        """Scenario 6: Existing project (age 15, personal travel website) -> private_project_tutoring."""
        state: AgentState = {
            "intent": PROJECT_HELP,
            "student_age": 15,
            "experience_level": "intermediate",
            "request_type": "project_help",
            "project_goal": "finish a personal travel website",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "private_project_tutoring"

    def test_7_assignment_help_ap_java(self):
        """Scenario 7: Assignment help (AP CS Java) -> ap_computer_science_java."""
        state: AgentState = {
            "intent": ASSIGNMENT_HELP,
            "student_age": 16,
            "request_type": "assignment_help",
            "subject": "AP Computer Science",
            "programming_language": "Java",
            "project_goal": "help with recursion homework",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "ap_computer_science_java"

    def test_8_unclear_goal_age_fallback(self):
        """Scenario 8: Unclear goal defaults safely to age-appropriate curriculum."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 11,
            "experience_level": "beginner",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "ai_python_kids"

    def test_9_age_edge_cases(self):
        """Scenario 9: Age edge cases (young 9yo vs 17yo QA interest)."""
        # 9yo child
        state_child: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 9,
            "experience_level": "beginner",
        }
        assert recommend_class(state_child)["recommended_class_id"] == "ai_python_kids"

        # 17yo older teen with QA automation interest
        state_teen: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 17,
            "project_goal": "software test automation with Playwright and Pytest",
        }
        assert recommend_class(state_teen)["recommended_class_id"] == "qa_automation_sdet"

    def test_10_one_on_one_preference(self):
        """Scenario 10: Explicit 1-on-1 preference favors private tutoring."""
        state: AgentState = {
            "intent": CLASS_INQUIRY,
            "student_age": 13,
            "experience_level": "intermediate",
            "preferred_class_type": "1-on-1",
            "request_type": "project_help",
        }
        res = recommend_class(state)
        assert res["recommended_class_id"] == "private_project_tutoring"
