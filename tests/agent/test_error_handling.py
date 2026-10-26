"""
STEP 22 Tests — Error Handling and Safe Fallback Verification

Verifies all failure paths specified in LANGGRAPH_PLAYBOOK.md:
1. LLM timeout
2. Invalid structured output
3. Missing conversation ID
4. Graph exception
5. Recommendation engine failure
6. Persistence failure

Ensures:
- Fallback behavior preserves a usable chatbot
- Never exposes stack traces or raw exceptions to the user
- All major failures degrade gracefully
"""

import pytest
from unittest.mock import patch, MagicMock

from agent.api import handle_chat_request, SAFE_FALLBACK_MESSAGE
from agent.nodes.recommendation import recommend_class
from agent.nodes.extract_information import extract_information
from agent.graph import create_graph


class TestErrorHandlingSuite:

    def test_llm_timeout_handled_gracefully(self):
        """Mocks an LLM timeout / network freeze to verify graceful degradation."""
        mock_graph = MagicMock()
        mock_graph.invoke.side_effect = TimeoutError("Request to Groq API timed out after 10.0 seconds")

        result = handle_chat_request(
            message="What courses do you recommend?",
            conversation_id="timeout-sess",
            graph_instance=mock_graph,
        )

        assert result["reply"] == SAFE_FALLBACK_MESSAGE
        assert "TimeoutError" not in result["reply"]
        assert "timed out" not in result["reply"]
        assert result["conversation_id"] == "timeout-sess"

    def test_invalid_structured_output_handled_gracefully(self):
        """Verifies that corrupted extraction or malformed output does not crash node or state."""
        state = {
            "messages": [{"role": "user", "content": "I am 13 and want to learn Python."}],
        }

        # Simulate regex or parsing raising an unexpected ValueError
        with patch("agent.nodes.extract_information._extract_from_text", side_effect=ValueError("Corrupted regex token")):
            updates = extract_information(state)
            assert isinstance(updates, dict)
            assert updates == {}

    def test_missing_conversation_id_handled_gracefully(self):
        """Verifies missing, None, or whitespace conversation IDs are automatically safely generated."""
        for empty_val in [None, "", "   ", "\t\n"]:
            res = handle_chat_request(
                message="Tell me about your Python class",
                conversation_id=empty_val,
            )
            assert res["conversation_id"] is not None
            assert len(res["conversation_id"]) > 0
            assert res["conversation_id"].startswith("session_")
            assert res["reply"] != ""

    def test_graph_exception_handled_gracefully(self):
        """Verifies that an unhandled graph internal exception returns safe user fallback."""
        mock_graph = MagicMock()
        mock_graph.invoke.side_effect = RuntimeError("Fatal state machine loop error in node 'classify_intent'")

        result = handle_chat_request(
            message="I need help with my homework",
            conversation_id="graph-err-sess",
            graph_instance=mock_graph,
        )

        assert result["reply"] == SAFE_FALLBACK_MESSAGE
        assert "RuntimeError" not in result["reply"]
        assert "Fatal state machine loop" not in result["reply"]
        assert "classify_intent" not in result["reply"]

    def test_recommendation_engine_failure_handled_gracefully(self):
        """Verifies that an unexpected exception during recommendation ranking falls back safely."""
        corrupted_state = {
            "student_age": "corrupted_age_string",
            "intent": "CLASS_INQUIRY",
        }

        # Mock score_class_for_state raising an exception
        with patch("agent.nodes.recommendation.score_class_for_state", side_effect=TypeError("Unsupported comparison: str and int")):
            rec_result = recommend_class(corrupted_state)

            assert "recommended_class" in rec_result
            assert rec_result["recommended_class"] is not None
            assert len(rec_result["recommended_class"]) > 0
            assert "recommendation_reason" in rec_result
            assert rec_result["next_action"] == "generate_response"

    def test_persistence_failure_handled_gracefully(self):
        """Verifies that a storage / checkpointer write failure degrades gracefully without crashing."""
        mock_persistent_graph = MagicMock()
        mock_persistent_graph.invoke.side_effect = IOError("Database disk I/O error writing checkpoint")

        result = handle_chat_request(
            message="I'm interested in web development",
            conversation_id="io-fail-sess",
            graph_instance=mock_persistent_graph,
        )

        assert result["reply"] == SAFE_FALLBACK_MESSAGE
        assert "IOError" not in result["reply"]
        assert "Database disk I/O" not in result["reply"]
        assert result["conversation_id"] == "io-fail-sess"
