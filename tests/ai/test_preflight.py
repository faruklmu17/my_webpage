"""
STEP 4 — DeepEval Safety Preflight and Verification

Validates:
- DEEPEVAL_TELEMETRY_OPT_OUT=1
- DEEPEVAL_DISABLE_DOTENV=1
- CONFIDENT_API_KEY is absent
- deepeval can be imported and initialized with synthetic data only
"""

import os
import pytest
import deepeval
from deepeval.test_case import LLMTestCase


def test_guardrails_preflight():
    """Ensure cloud keys are absent and privacy environment variables are set."""
    assert os.getenv("CONFIDENT_API_KEY") is None, "CONFIDENT_API_KEY must not be present"
    assert os.getenv("DEEPEVAL_TELEMETRY_OPT_OUT") == "1", "DEEPEVAL_TELEMETRY_OPT_OUT must be 1"
    assert os.getenv("DEEPEVAL_DISABLE_DOTENV") == "1", "DEEPEVAL_DISABLE_DOTENV must be 1"


def test_deepeval_import_and_synthetic_test_case():
    """Verify DeepEval version and local synthetic LLMTestCase initialization."""
    assert hasattr(deepeval, "__version__"), "DeepEval must expose __version__"
    assert deepeval.__version__.startswith("4."), f"Unexpected DeepEval version: {deepeval.__version__}"

    # Verify synthetic LLMTestCase construction without external network calls
    test_case = LLMTestCase(
        input="SYNTHETIC / TEST-ONLY question",
        actual_output="SYNTHETIC / TEST-ONLY answer",
    )
    assert test_case.input == "SYNTHETIC / TEST-ONLY question"
    assert test_case.actual_output == "SYNTHETIC / TEST-ONLY answer"
