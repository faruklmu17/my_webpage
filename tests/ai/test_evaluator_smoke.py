"""
STEP 8 — Evaluator Smoke Test & Metadata Verification

Verifies:
- All required run metadata fields are recorded
- Evaluator configuration structure (temperature 0)
- Smoke test execution for evaluator harness
"""

from tests.ai.evaluator import build_run_metadata, GroqEvaluator


def test_run_metadata_fields():
    meta = build_run_metadata(
        evaluator_provider="Groq",
        evaluator_model="llama-3.3-70b-versatile",
        evaluator_temperature=0.0,
    )

    required_fields = [
        "timestamp_utc",
        "chatbot_application",
        "chatbot_deployment",
        "chatbot_underlying_provider",
        "evaluator_provider",
        "evaluator_model",
        "evaluator_temperature",
        "deepeval_version",
        "dataset_version",
        "rubric_version",
        "git_commit_timestamp",
    ]

    for field in required_fields:
        assert field in meta, f"Missing required run metadata field: {field}"
        assert meta[field] is not None, f"Field {field} must not be None"

    assert meta["evaluator_temperature"] == 0.0
    assert meta["deepeval_version"].startswith("4.")


def test_evaluator_adapter_interface():
    evaluator = GroqEvaluator(model="llama-3.3-70b-versatile", temperature=0.0)
    assert evaluator.get_model_name() == "llama-3.3-70b-versatile"
    assert evaluator.temperature == 0.0
