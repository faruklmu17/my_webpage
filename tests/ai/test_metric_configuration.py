"""
STEP 7 — Metric Configuration Verification

Verifies:
- Single GEval metric named "Chatbot Response Quality"
- Evaluation parameters restricted strictly to INPUT and ACTUAL_OUTPUT
- Evaluation steps match the 5 human-approved rubric dimensions
- No hidden context, internet assumptions, or multiple overlapping metrics
"""

from typing import Optional
from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from deepeval.models.base_model import DeepEvalBaseLLM
from tests.ai.metrics import create_chatbot_quality_metric, EVALUATION_STEPS


class DummyEvaluatorModel(DeepEvalBaseLLM):
    """Synthetic evaluator model used for metric configuration tests prior to Step 8."""

    def __init__(self, model: Optional[str] = "synthetic-judge-v1"):
        self.name = model
        super().__init__(model=model)

    def load_model(self):
        return self

    def generate(self, *args, **kwargs) -> str:
        return '{"score": 10, "reason": "SYNTHETIC / TEST-ONLY validation"}'

    async def a_generate(self, *args, **kwargs) -> str:
        return '{"score": 10, "reason": "SYNTHETIC / TEST-ONLY validation"}'

    def get_model_name(self, *args, **kwargs) -> str:
        return self.name


def test_single_geval_metric_configuration():
    dummy_model = DummyEvaluatorModel()
    metric = create_chatbot_quality_metric(model=dummy_model)

    # 1. Type and name verification
    assert isinstance(metric, GEval), "Must instantiate DeepEval GEval"
    assert metric.name == "Chatbot Response Quality"

    # 2. Evaluation parameters check: only actual user input and chatbot actual output
    assert SingleTurnParams.INPUT in metric.evaluation_params
    assert SingleTurnParams.ACTUAL_OUTPUT in metric.evaluation_params
    assert len(metric.evaluation_params) == 2, (
        f"Evaluation parameters must contain only INPUT and ACTUAL_OUTPUT, got: {metric.evaluation_params}"
    )

    # 3. Rubric step alignment
    assert len(EVALUATION_STEPS) == 5, "Must contain exactly the 5 approved rubric dimensions"
    assert any("factual correctness" in step.lower() for step in EVALUATION_STEPS)
    assert any("persona" in step.lower() for step in EVALUATION_STEPS)
    assert any("https://faruk-hasan.com/tutoring/tutoring.html#book" in step for step in EVALUATION_STEPS)
    assert any("relevance" in step.lower() for step in EVALUATION_STEPS)
    assert any("conciseness" in step.lower() for step in EVALUATION_STEPS)

    # 4. Confirm provisional threshold is documented (not locked yet)
    assert metric.threshold == 0.5
