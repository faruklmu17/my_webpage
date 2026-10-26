"""
STEP 21 Tests — API Integration Verification

Verifies:
1. API request succeeds via FastAPI TestClient
2. Graph response returns correctly
3. Conversation ID is respected
4. State persists across sequential requests in the same conversation
5. Sessions remain strictly isolated across different conversation IDs
6. Errors return safe fallback messages without exposing stack traces
7. Frontend payload schema compatibility (both 'reply' and 'response' available)
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from agent.api import create_app, handle_chat_request, SAFE_FALLBACK_MESSAGE
from agent.graph import create_graph
from langgraph.checkpoint.memory import MemorySaver


@pytest.fixture
def test_client():
    app = create_app()
    return TestClient(app)


def test_api_request_succeeds(test_client):
    """Verifies that the /api/chat POST endpoint returns 200 and a valid schema."""
    response = test_client.post(
        "/api/chat",
        json={"message": "What courses does Faruk teach?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "response" in data
    assert "conversation_id" in data
    assert data["conversation_id"].startswith("session_")
    assert len(data["reply"]) > 0


def test_conversation_id_is_respected(test_client):
    """Verifies that an explicitly provided conversation_id is preserved and returned."""
    custom_conv_id = "test-session-42"
    response = test_client.post(
        "/api/chat",
        json={
            "message": "I'm looking for a class for my son.",
            "conversation_id": custom_conv_id,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == custom_conv_id
    assert data["intent"] == "CLASS_INQUIRY"


def test_state_persists_across_multi_turn_requests(test_client):
    """Verifies multi-turn state persistence across sequential API requests."""
    conv_id = "multi-turn-session-101"

    # Turn 1: Class inquiry without age/experience
    resp1 = test_client.post(
        "/api/chat",
        json={
            "message": "I am looking for a class for my daughter.",
            "conversation_id": conv_id,
        },
    )
    assert resp1.status_code == 200
    d1 = resp1.json()
    assert d1["intent"] == "CLASS_INQUIRY"
    assert "student_age" in d1["missing_fields"]
    assert d1["state"]["student_age"] is None

    # Turn 2: Provide age and prior experience
    resp2 = test_client.post(
        "/api/chat",
        json={
            "message": "She is 14 and has done Scratch.",
            "conversation_id": conv_id,
        },
    )
    assert resp2.status_code == 200
    d2 = resp2.json()
    # State from Turn 1 (CLASS_INQUIRY) must persist, plus new age 14 and Scratch extracted
    assert d2["intent"] == "CLASS_INQUIRY"
    assert d2["state"]["student_age"] == 14
    assert "Scratch" in d2["state"]["previous_languages"]


def test_session_isolation_across_conversation_ids(test_client):
    """Verifies that different conversation IDs maintain independent, unpolluted state."""
    conv_a = "session-alice"
    conv_b = "session-bob"

    # User A: 13-year-old beginner in Scratch
    test_client.post(
        "/api/chat",
        json={
            "message": "My son is 13 and knows Scratch. Looking for a class.",
            "conversation_id": conv_a,
        },
    )

    # User B: 17-year-old intermediate in Python
    resp_b = test_client.post(
        "/api/chat",
        json={
            "message": "I am 17 and know Python. Looking for a class.",
            "conversation_id": conv_b,
        },
    )
    d_b = resp_b.json()
    assert d_b["state"]["student_age"] == 17
    assert "Python" in d_b["state"]["previous_languages"]
    assert "Scratch" not in d_b["state"]["previous_languages"]

    # Verify User A state was not modified by User B
    resp_a2 = test_client.post(
        "/api/chat",
        json={
            "message": "What do you recommend?",
            "conversation_id": conv_a,
        },
    )
    d_a2 = resp_a2.json()
    assert d_a2["state"]["student_age"] == 13
    assert "Scratch" in d_a2["state"]["previous_languages"]


def test_errors_return_safe_fallback_messages(test_client):
    """Verifies that graph exceptions or system crashes degrade gracefully with safe messages."""
    mock_failing_graph = MagicMock()
    mock_failing_graph.invoke.side_effect = RuntimeError("Internal connection timeout")

    result = handle_chat_request(
        message="Hello Faruk!",
        conversation_id="fail-session-1",
        graph_instance=mock_failing_graph,
    )

    assert result["reply"] == SAFE_FALLBACK_MESSAGE
    assert result["response"] == SAFE_FALLBACK_MESSAGE
    assert result["conversation_id"] == "fail-session-1"
    # Never expose the internal RuntimeError message
    assert "RuntimeError" not in result["reply"]
    assert "timeout" not in result["reply"]


def test_empty_message_handling(test_client):
    """Verifies graceful handling of empty or whitespace messages."""
    response = test_client.post(
        "/api/chat",
        json={"message": "   "},
    )
    assert response.status_code == 200
    data = response.json()
    assert "Please let me know what questions you have" in data["reply"]


def test_frontend_compatibility_both_reply_and_response_fields(test_client):
    """Verifies response payload contains identical 'reply' and 'response' fields for frontend convenience."""
    response = test_client.post(
        "/api/chat",
        json={"message": "What is Faruk's experience with Python?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == data["response"]
    assert isinstance(data["reply"], str)
    assert isinstance(data["state"], dict)
