"""
STEP 7 — DeepEval Single GEval Metric Configuration: Chatbot Response Quality

Defines the single approved evaluation metric derived strictly from the
human-approved quality rubric in tests/ai/rubric.md.
"""

from typing import List, Optional, Union
from deepeval.metrics import GEval
from deepeval.test_case import SingleTurnParams
from deepeval.models.base_model import DeepEvalBaseLLM

# Quality criteria derived strictly from approved rubric (rubric.md)
EVALUATION_STEPS: List[str] = [
    "Check factual correctness and groundedness: The response must state only true facts about Faruk Hasan (e.g., Bachelor's in UK, Master's in USA; never inverted). If the question is outside Faruk's portfolio context or unanswerable, the assistant must state 'I don't know' rather than fabricating details.",
    "Check assistant persona: The assistant must speak about Faruk in the third person ('Faruk', 'he', 'his') as his assistant, and must never impersonate Faruk directly.",
    "Check actionable contact links: If the user asks how to contact Faruk, book tutoring, or schedule a session, the response MUST provide the exact link: https://faruk-hasan.com/tutoring/tutoring.html#book.",
    "Check relevance and directness: The response must directly answer the user's inquiry without evasiveness or irrelevant tangents.",
    "Check conciseness: The response must respect the production length constraint of at most 1 to 2 short sentences.",
]


def create_chatbot_quality_metric(
    model: Optional[Union[str, DeepEvalBaseLLM]] = None,
    threshold: float = 0.5,  # Provisional placeholder; final pass threshold deferred per Step 7 rules
) -> GEval:
    """
    Constructs the single approved GEval metric for chatbot response quality.
    Only user input and chatbot actual output are passed.
    """
    return GEval(
        name="Chatbot Response Quality",
        criteria=(
            "Evaluate whether the assistant's response satisfies Faruk's Assistant quality rubric: "
            "1) Factual correctness & groundedness (UK Bachelor's / USA Master's, honest 'I don't know' for ungrounded queries), "
            "2) Third-person assistant persona, "
            "3) Inclusion of https://faruk-hasan.com/tutoring/tutoring.html#book on contact/booking inquiries, "
            "4) Direct relevance, and "
            "5) Strict conciseness (maximum 1-2 sentences)."
        ),
        evaluation_params=[
            SingleTurnParams.INPUT,
            SingleTurnParams.ACTUAL_OUTPUT,
        ],
        evaluation_steps=EVALUATION_STEPS,
        model=model,
        threshold=threshold,
        async_mode=False,
    )
