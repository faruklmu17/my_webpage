"""
Tests for STEP 18 — Logging, Debugging, and Developer Explainability
"""

import pytest
from agent.graph import graph
from agent.logging import (
    get_session_trace,
    clear_session_traces,
    explain_recommendation,
)


class TestAgentObservability:
    """Step 18: Logging & route reconstruction tests."""

    def setup_method(self):
        clear_session_traces()

    def test_reconstruct_graph_route_from_logs(self):
        """
        Runs an end-to-end conversation and verifies the exact sequence of graph nodes
        can be reconstructed from logs.
        """
        conv_id = "test_conv_route_reconstruction"
        state = {
            "conversation_id": conv_id,
            "messages": [
                {"role": "user", "content": "My 11 year old wants to learn Python and AI. Has only used Scratch."}
            ],
        }
        final_state = graph.invoke(state)

        trace = get_session_trace(conv_id)
        assert len(trace) > 0

        # Extract executed node route in order
        executed_nodes = [event["node_name"] for event in trace]

        # Expected route:
        # extract_information -> classify_intent -> check_missing_information -> recommend_class -> generate_response
        assert "extract_information" in executed_nodes
        assert "classify_intent" in executed_nodes
        assert "check_missing_information" in executed_nodes
        assert "recommend_class" in executed_nodes
        assert "generate_response" in executed_nodes

        # Verify correct ordering of nodes
        idx_extract = executed_nodes.index("extract_information")
        idx_classify = executed_nodes.index("classify_intent")
        idx_missing = executed_nodes.index("check_missing_information")
        idx_rec = executed_nodes.index("recommend_class")
        idx_resp = executed_nodes.index("generate_response")

        assert idx_extract < idx_classify < idx_missing < idx_rec < idx_resp

    def test_developer_safe_event_fields(self):
        """
        Verifies every logged event includes the required developer-safe fields:
        - conversation_id
        - node_name
        - execution_time_ms
        - detected_intent
        """
        conv_id = "test_conv_event_fields"
        state = {
            "conversation_id": conv_id,
            "messages": [
                {"role": "user", "content": "What is Python?"}
            ],
        }
        graph.invoke(state)

        trace = get_session_trace(conv_id)
        assert len(trace) >= 3

        for event in trace:
            assert event["conversation_id"] == conv_id
            assert "node_name" in event
            assert "execution_time_ms" in event
            assert event["execution_time_ms"] >= 0.0
            assert "detected_intent" in event

    def test_developer_explainability_why_recommended(self):
        """
        Acceptance Gate: A developer must be able to answer:
        "Why did the chatbot recommend this class?"
        without reading hidden model reasoning.
        """
        conv_id = "test_conv_explainability"
        state = {
            "conversation_id": conv_id,
            "messages": [
                {
                    "role": "user",
                    "content": "My 15 year old already knows Python and wants help building an AI chatbot website.",
                }
            ],
        }
        final_state = graph.invoke(state)

        explanation = explain_recommendation(conv_id)
        assert explanation is not None
        assert explanation["conversation_id"] == conv_id
        assert explanation["recommended_class_id"] in [
            "advanced_python_ai_web",
            "private_project_tutoring",
        ]
        assert explanation["recommendation_reason"] is not None
        assert len(explanation["recommendation_reason"]) > 10

        # Facts used in the decision are transparently inspectable
        facts = explanation["facts_used"]
        assert facts["student_age"] == 15
        assert facts["experience_level"] in ["intermediate", "advanced"]
        assert "AI" in facts["project_goal"] or "chatbot" in facts["project_goal"] or "website" in facts["project_goal"]

    def test_logs_not_exposed_in_user_response(self):
        """
        Guarantees developer logs and timing metrics do not leak into the user-facing message.
        """
        conv_id = "test_conv_leak_guard"
        state = {
            "conversation_id": conv_id,
            "messages": [{"role": "user", "content": "My son is 12."}],
        }
        final_state = graph.invoke(state)

        user_text = final_state.get("response", "")
        assert "execution_time" not in user_text
        assert "ms" not in user_text
        assert "node_name" not in user_text
        assert "trace" not in user_text
        assert conv_id not in user_text
