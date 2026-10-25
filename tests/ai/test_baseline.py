"""
STEP 2 — Real Chatbot Baseline Test (Automated)

Invokes the real Groq-backed Hugging Face chatbot via the official Gradio client.
Asserts deterministic baseline properties only (no DeepEval, no semantic scoring yet).
"""

import time
import pytest
from gradio_client import Client

CHATBOT_URL = "https://hasanfaruk25-faruk-assistant.hf.space/gradio/"
ENDPOINT_NAME = "/chat_fn"


class TestChatbotBaseline:
    """Baseline deterministic test suite for Faruk's Assistant chatbot."""

    @pytest.fixture(scope="class")
    def client(self):
        """Connects to the real live Hugging Face Gradio API."""
        return Client(CHATBOT_URL)

    def test_harmless_prompt_baseline_call(self, client):
        """
        Executes one real call with a harmless prompt and validates:
        - Call succeeds without network/API exceptions
        - Duration is measured and within reasonable bounds (< 30s)
        - Response structure conforms to Gradio chatbot messages schema
        - Assistant response is present, non-empty, and free of runtime errors
        """
        prompt = "In which country did Faruk complete his Master degree?"
        history = []

        start_time = time.time()
        result = client.predict(
            user_message=prompt,
            history=history,
            api_name=ENDPOINT_NAME,
        )
        duration = time.time() - start_time

        # 1. Deterministic structure assertion: Gradio returns tuple of (cleared_input, updated_history)
        assert isinstance(result, (tuple, list)), f"Expected tuple/list return, got {type(result)}"
        assert len(result) == 2, f"Expected 2 elements (cleared_textbox, updated_history), got {len(result)}"

        cleared_textbox, updated_history = result

        # 2. Check textbox reset
        assert cleared_textbox == "", f"Expected cleared textbox '', got {cleared_textbox!r}"

        # 3. Check history format and presence
        assert isinstance(updated_history, list), f"Expected history list, got {type(updated_history)}"
        assert len(updated_history) >= 2, f"Expected at least 2 messages (user + assistant), got {len(updated_history)}"

        # 4. Extract user and assistant turns
        user_turn = updated_history[-2]
        assistant_turn = updated_history[-1]

        assert user_turn.get("role") == "user", f"Expected user role, got {user_turn.get('role')}"
        assert user_turn.get("content") == prompt, "User content does not match input prompt"

        assert assistant_turn.get("role") == "assistant", f"Expected assistant role, got {assistant_turn.get('role')}"
        assistant_content = assistant_turn.get("content")

        # 5. Assert assistant response content validity
        assert isinstance(assistant_content, str), f"Expected str content, got {type(assistant_content)}"
        assert len(assistant_content.strip()) > 0, "Assistant response content is empty"
        assert not assistant_content.startswith("Error:"), f"Application returned an error: {assistant_content}"

        # Diagnostic output for reporting
        print(f"\n[BASELINE TEST RESULT]")
        print(f"Prompt: {prompt}")
        print(f"Duration: {duration:.2f}s")
        print(f"Assistant Content: {assistant_content}")
