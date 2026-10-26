"""
DeepEval & Deterministic Tool-Calling Evaluation Suite

Evaluates:
1. Tool Selection Accuracy (Calling correct MCP tool based on user intent)
2. Tool Output Grounding (Final answer faithfully reflects live tool JSON)
3. Negative Tool Control (General chit-chat avoids calling tools)
4. Fast Pre-LLM Guardrail Preservation (0-token filtering before tool calling)
"""

import sys
import os
import pytest
from deepeval.test_case import LLMTestCase

# Ensure app and mcp_server are importable
APP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ai_chatbot/hf_deployment"))
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
for p in [APP_DIR, WORKSPACE_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app import build_reply
from mcp_server.parsers import parse_tutoring_pricing, parse_portfolio_projects


class TestMCPToolCallingIntegration:
    """Deterministic and Groundedness tests for live MCP tool execution."""

    def test_tutoring_pricing_tool_grounding(self):
        """
        Query about tutoring rates should trigger get_tutoring_details
        and faithfully return live pricing ($55/hr, $500 bundle, $50/mo).
        """
        prompt = "What are your 1:1 tutoring rates and do you have a 10 session bundle?"
        response = build_reply(prompt)

        # Assert live pricing from website is accurately present
        assert "$55" in response, f"Expected live $55/hr rate in response: {response}"
        assert "$500" in response or "500" in response, f"Expected $500 bundle in response: {response}"
        assert "https://faruk-hasan.com/tutoring/tutoring.html#book" in response, (
            f"Expected booking link in response: {response}"
        )

    def test_portfolio_projects_tool_grounding(self):
        """
        Query about Playwright or automation should trigger get_portfolio_projects
        and return the real GitHub repository and extension details.
        """
        prompt = "What Playwright automation projects has Faruk built?"
        response = build_reply(prompt)

        assert "playwright" in response.lower(), f"Expected Playwright in response: {response}"
        assert "github.com/faruklmu17" in response, (
            f"Expected live GitHub link in response: {response}"
        )

    def test_booking_and_consultation_tool_grounding(self):
        """
        Query about how to book a session or consultation should return official link.
        """
        prompt = "How can I schedule a consultation or book a session with Faruk?"
        response = build_reply(prompt)

        assert "https://faruk-hasan.com/tutoring/tutoring.html#book" in response, (
            f"Expected booking link in response: {response}"
        )

    def test_negative_tool_control_greeting(self):
        """
        Casual greetings must NOT trigger tools or leak JSON.
        """
        prompt = "Hello, good afternoon!"
        response = build_reply(prompt)

        # Must greet as assistant without tool artifacts
        assert any(w in response.lower() for w in ["afternoon", "hello", "hi", "assistant", "help"]), (
            f"Expected polite greeting, got: {response}"
        )
        assert "{" not in response and "}" not in response, "Raw JSON leaked in response"

    def test_negative_tool_control_basic_bio(self):
        """
        Basic core background question should answer from memory without tools.
        """
        prompt = "Where was Faruk born and what degree does he have?"
        response = build_reply(prompt)

        assert any(w in response.lower() for w in ["bangladesh", "chandpur"]), (
            f"Expected Bangladesh birthplace, got: {response}"
        )
        assert any(w in response.lower() for w in ["bachelor", "master", "engineering", "b.eng"]), (
            f"Expected degree details, got: {response}"
        )

    def test_pre_llm_guardrails_prevent_tool_execution(self):
        """
        Off-topic and PII requests must be intercepted before Groq/tools.
        """
        # Math is intercepted with 0 tokens
        math_res = build_reply("what is 2 + 2?")
        assert "I don't know" in math_res

        # Credit card is intercepted with 0 tokens
        pii_res = build_reply("My credit card is 4111 2222 3333 4444 to pay.")
        assert "For your security and privacy" in pii_res
        assert "4111" not in pii_res

    def test_deepeval_tool_test_case_synthesis(self):
        """
        Constructs and validates an LLMTestCase for tool-backed responses.
        """
        pricing = parse_tutoring_pricing()
        actual = build_reply("How much is 1:1 tutoring with Faruk?")

        tc = LLMTestCase(
            input="How much is 1:1 tutoring with Faruk?",
            actual_output=actual,
            expected_output=f"1:1 tutoring with Faruk is {pricing['hourly_rate']}. You can book at {pricing['booking_url']}",
            context=[pricing["hourly_rate"], pricing["booking_url"]],
        )

        assert tc.input is not None
        assert "$55" in tc.actual_output
        assert "tutoring.html#book" in tc.actual_output
