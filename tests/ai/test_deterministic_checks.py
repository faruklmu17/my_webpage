"""
STEP 5 — Deterministic Chatbot Evaluation Harness

Runs the approved fixture set against the real Groq-backed chatbot.
Evaluates deterministic checks and cleanly classifies failure modes:
- AUTHENTICATION_FAILURE
- GROQ/API_FAILURE
- APPLICATION_FAILURE
- PARSING_FAILURE
- ASSERTION_FAILURE
"""

import json
import os
import time
import pytest
from gradio_client import Client
from gradio_client.exceptions import AppError

CHATBOT_URL = "https://hasanfaruk25-faruk-assistant.hf.space/gradio/"
ENDPOINT_NAME = "/chat_fn"
FIXTURES_PATH = os.path.join(os.path.dirname(__file__), "fixtures.json")


def load_fixtures():
    with open(FIXTURES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("fixtures", [])


class ChatbotInvocationError(Exception):
    def __init__(self, failure_type: str, detail: str):
        super().__init__(f"[{failure_type}] {detail}")
        self.failure_type = failure_type
        self.detail = detail


def call_real_chatbot(client: Client, prompt: str):
    """
    Calls the real live chatbot and isolates failure causes.
    Returns: (assistant_text: str, duration_sec: float)
    Raises: ChatbotInvocationError categorized by failure mode.
    """
    start_time = time.time()
    try:
        raw_result = client.predict(
            user_message=prompt,
            history=[],
            api_name=ENDPOINT_NAME,
        )
    except AppError as e:
        msg = str(e).lower()
        if "401" in msg or "403" in msg or "unauthorized" in msg:
            raise ChatbotInvocationError("AUTHENTICATION_FAILURE", str(e))
        elif "rate limit" in msg or "429" in msg or "503" in msg or "502" in msg:
            raise ChatbotInvocationError("GROQ/API_FAILURE", str(e))
        else:
            raise ChatbotInvocationError("APPLICATION_FAILURE", str(e))
    except Exception as e:
        msg = str(e).lower()
        if "timeout" in msg or "connection" in msg:
            raise ChatbotInvocationError("GROQ/API_FAILURE", f"Network/Timeout: {e}")
        else:
            raise ChatbotInvocationError("APPLICATION_FAILURE", str(e))

    duration = time.time() - start_time

    # Parsing verification
    if not isinstance(raw_result, (tuple, list)) or len(raw_result) != 2:
        raise ChatbotInvocationError(
            "PARSING_FAILURE",
            f"Expected 2-element tuple/list from Gradio endpoint, got: {type(raw_result)}",
        )

    _, history = raw_result
    if not isinstance(history, list) or len(history) < 2:
        raise ChatbotInvocationError(
            "PARSING_FAILURE",
            f"History list must contain at least 2 entries, got: {history}",
        )

    assistant_msg = history[-1]
    if not isinstance(assistant_msg, dict) or assistant_msg.get("role") != "assistant":
        raise ChatbotInvocationError(
            "PARSING_FAILURE",
            f"Last message in history is not an assistant dictionary: {assistant_msg}",
        )

    content = assistant_msg.get("content")
    if not isinstance(content, str):
        raise ChatbotInvocationError(
            "PARSING_FAILURE",
            f"Assistant content must be a string, got: {type(content)}",
        )

    # Application error check
    if content.startswith("Error:"):
        raise ChatbotInvocationError("APPLICATION_FAILURE", f"App returned error message: {content}")
    if "Sorry, I can't connect right now!" in content:
        raise ChatbotInvocationError("GROQ/API_FAILURE", f"App reported upstream failure: {content}")

    return content.strip(), duration


class TestDeterministicChecks:
    """Deterministic validation across all approved fixtures."""

    @classmethod
    def setup_class(cls):
        cls.client = Client(CHATBOT_URL)

    @pytest.mark.parametrize(
        "fixture",
        load_fixtures(),
        ids=lambda f: f["id"],
    )
    def test_fixture_deterministic_checks(self, fixture):
        prompt = fixture["input"]
        fixture_id = fixture["id"]
        category = fixture.get("category", "")

        content, duration = call_real_chatbot(self.client, prompt)

        print(f"\n[FIXTURE {fixture_id}] ({category})")
        print(f"Prompt: {prompt}")
        print(f"Duration: {duration:.2f}s")
        print(f"Response: {content}")

        # Deterministic Assertion 1: Non-empty response
        assert len(content) > 0, f"[ASSERTION_FAILURE] Response for {fixture_id} is empty."

        # Deterministic Assertion 2: No raw provider error strings
        forbidden_substrings = ["RateLimitError", "InternalServerError", "AuthenticationError", "404 Not Found"]
        for sub in forbidden_substrings:
            assert sub not in content, f"[ASSERTION_FAILURE] Raw provider error '{sub}' detected in response."

        # Category-specific deterministic checks
        if fixture_id == "basic-002":
            # Constraint check from system prompt: MUST provide the booking link
            expected_link = "https://faruk-hasan.com/tutoring/tutoring.html#book"
            assert expected_link in content, (
                f"[ASSERTION_FAILURE] Fixture {fixture_id} required booking link '{expected_link}' "
                f"in response. Got: {content}"
            )

        if fixture_id == "basic-003":
            # Groundedness refusal check: Martian chocolate cookies is outside context
            # System prompt states: If the context does not contain the answer, say "I don't know"
            content_lower = content.lower()
            assert any(
                phrase in content_lower
                for phrase in ["don't know", "do not know", "cannot answer", "no information", "not mentioned"]
            ), f"[ASSERTION_FAILURE] Fixture {fixture_id} should express unknown/refusal. Got: {content}"
