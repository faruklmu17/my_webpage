"""
Tests for STEP 11 (Workflow Router) & STEP 12 (Information-Complete Decision)
"""

import pytest
from agent.intents import (
    CLASS_INQUIRY,
    PROJECT_HELP,
    ASSIGNMENT_HELP,
    GENERAL_QUESTION,
    UNKNOWN,
)
from agent.routing import (
    route_intent,
    route_missing_information,
    NODE_CHECK_MISSING,
    NODE_GENERAL_RESPONSE,
    NODE_CLARIFICATION,
    NODE_FOLLOWUP_QUESTION,
    NODE_RECOMMEND_CLASS,
)


class TestWorkflowRouter:
    """Step 11: Intent routing tests."""

    def test_class_inquiry_routes_to_check_missing(self):
        state = {"intent": CLASS_INQUIRY, "intent_confidence": 0.95}
        assert route_intent(state) == NODE_CHECK_MISSING

    def test_project_help_routes_to_check_missing(self):
        state = {"intent": PROJECT_HELP, "intent_confidence": 0.88}
        assert route_intent(state) == NODE_CHECK_MISSING

    def test_assignment_help_routes_to_check_missing(self):
        state = {"intent": ASSIGNMENT_HELP, "intent_confidence": 0.91}
        assert route_intent(state) == NODE_CHECK_MISSING

    def test_general_question_routes_to_general_response(self):
        state = {"intent": GENERAL_QUESTION, "intent_confidence": 0.85}
        assert route_intent(state) == NODE_GENERAL_RESPONSE

    def test_unknown_routes_to_clarification(self):
        state = {"intent": UNKNOWN, "intent_confidence": 0.70}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_low_confidence_routes_to_clarification(self):
        # Even with CLASS_INQUIRY, confidence below 0.60 must route to clarification
        state = {"intent": CLASS_INQUIRY, "intent_confidence": 0.55}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_zero_confidence_routes_to_clarification(self):
        state = {"intent": CLASS_INQUIRY, "intent_confidence": 0.0}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_none_intent_fails_safely_to_clarification(self):
        state = {"intent": None}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_empty_string_intent_fails_safely_to_clarification(self):
        state = {"intent": ""}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_invalid_string_intent_fails_safely_to_clarification(self):
        state = {"intent": "INVALID_VALUE"}
        assert route_intent(state) == NODE_CLARIFICATION

    def test_lowercase_intent_normalizes_correctly(self):
        state = {"intent": "class_inquiry", "intent_confidence": 0.9}
        assert route_intent(state) == NODE_CHECK_MISSING

    def test_empty_state_fails_safely_to_clarification(self):
        state = {}
        assert route_intent(state) == NODE_CLARIFICATION


class TestInformationCompleteDecision:
    """Step 12: Missing information edge routing tests."""

    def test_incomplete_state_multiple_fields_routes_to_followup(self):
        state = {"missing_fields": ["experience_level", "request_type"]}
        assert route_missing_information(state) == NODE_FOLLOWUP_QUESTION

    def test_incomplete_state_single_field_routes_to_followup(self):
        state = {"missing_fields": ["subject"]}
        assert route_missing_information(state) == NODE_FOLLOWUP_QUESTION

    def test_complete_state_empty_list_routes_to_recommend_class(self):
        state = {"missing_fields": []}
        assert route_missing_information(state) == NODE_RECOMMEND_CLASS

    def test_complete_state_none_routes_to_recommend_class(self):
        state = {"missing_fields": None}
        assert route_missing_information(state) == NODE_RECOMMEND_CLASS

    def test_complete_state_missing_key_routes_to_recommend_class(self):
        state = {}
        assert route_missing_information(state) == NODE_RECOMMEND_CLASS
