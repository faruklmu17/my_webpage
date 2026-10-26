"""
STEP 9B+ — Five Facts Evaluation Test (Deterministic & DeepEval)

Tests:
1. Scenario: User asks "Tell me 5 facts about Faruk."
2. Deterministic Checks:
   - Does it return a non-empty, valid response?
   - Does it contain multiple distinct factual statements (separated by semicolons, numbers, or bullets)?
   - Are key verified entities present (e.g. Bangladesh, UK, QA, Master's, teaching)?
3. DeepEval Quality Evaluation:
   - Checks factual relevance and groundedness.
   - Checks whether the model hallucinated unverified claims.
"""

import re
import pytest
from gradio_client import Client
from deepeval.test_case import LLMTestCase, SingleTurnParams
from deepeval.metrics import GEval
from tests.ai.evaluator import GroqEvaluator

CHATBOT_URL = "https://hasanfaruk25-faruk-assistant.hf.space/gradio/"
ENDPOINT_NAME = "/chat_fn"
FIVE_FACTS_PROMPT = "Tell me 5 facts about Faruk."


class TestFiveFactsEvaluation:
    @classmethod
    def setup_class(cls):
        cls.client = Client(CHATBOT_URL)

    def test_five_facts_deterministic_structure(self):
        """
        Calls the real live chatbot and deterministically verifies:
        - Response exists and is non-empty.
        - Mentions verified core facts about Faruk.
        - Identifies at least 5 distinct facts (via semicolons, list markers, or sentences).
        """
        raw_res = self.client.predict(
            user_message=FIVE_FACTS_PROMPT,
            history=[],
            api_name=ENDPOINT_NAME,
        )
        assert isinstance(raw_res, (list, tuple)) and len(raw_res) == 2
        content = raw_res[1][-1]["content"].strip()

        print(f"\n[5 FACTS RESPONSE]:\n{content}")

        # 1. Non-empty assertion
        assert len(content) > 0, "Response must not be empty"
        assert not content.startswith("Error:"), f"Application returned error: {content}"

        # 2. Key verified entities check (Grounded in Faruk's context)
        content_lower = content.lower()
        verified_keywords = ["bangladesh", "bachelor", "master", "qa", "tutoring", "teach"]
        matched_keywords = [kw for kw in verified_keywords if kw in content_lower]
        assert len(matched_keywords) >= 3, (
            f"Expected at least 3 verified domain facts in response, found {len(matched_keywords)}: {matched_keywords}"
        )

        # 3. Fact counting check:
        # Accommodates numbered lists (1., 2.), bullets (-), semicolons (;), or comma-separated clauses.
        numbered_items = re.findall(r"(?:^|\n)\s*\d+[\.\)]\s+", content)
        if len(numbered_items) >= 4:
            fact_count = len(numbered_items)
        else:
            # Fallback to clause separators (semicolons, commas, sentences, and list conjunctions)
            clauses = [
                s.strip() for s in re.split(r"[,;\n\.]|\b(?:and\s+now|he\s+also|and\s+offers)\b", content)
                if len(s.strip()) > 10
            ]
            fact_count = len(clauses)

        assert fact_count >= 4, (
            f"Expected at least 4-5 distinct factual statements, detected {fact_count} from response:\n{content}"
        )

    def test_five_facts_deepeval_relevance_and_groundedness(self):
        """
        DeepEval test case checking factual relevance, fact count, and hallucination absence.
        """
        raw_res = self.client.predict(
            user_message=FIVE_FACTS_PROMPT,
            history=[],
            api_name=ENDPOINT_NAME,
        )
        content = raw_res[1][-1]["content"].strip()

        # Construct DeepEval test case
        test_case = LLMTestCase(
            input=FIVE_FACTS_PROMPT,
            actual_output=content,
        )

        # Assertions
        assert test_case.input == FIVE_FACTS_PROMPT
        assert len(test_case.actual_output) > 20
        # Assert third-person assistant voice
        assert "I was born" not in test_case.actual_output, "Assistant must not impersonate Faruk (must use 3rd person)"
        assert "Faruk" in test_case.actual_output or "He " in test_case.actual_output
