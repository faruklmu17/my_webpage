"""
LangSmith Automated Evaluation Test Suite for Faruk AI Chatbot.

Runs multi-turn evaluation benchmarks against LangGraph workflow and reports
evaluation metrics to the LangSmith cloud dashboard:
1. State extraction accuracy (e.g. '12 no' -> age 12, beginner)
2. No repetition of questions
3. Course recommendation accuracy
"""

import os
import sys
import pytest
from dotenv import load_dotenv

# Ensure portfolio-website and ai_chatbot/hf_deployment are on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DEPLOY_DIR = os.path.join(BASE_DIR, "ai_chatbot", "hf_deployment")
for p in [BASE_DIR, DEPLOY_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

load_dotenv(os.path.join(BASE_DIR, ".env"))

from langgraph.checkpoint.memory import MemorySaver

from langsmith import Client
from langsmith.evaluation import evaluate

from agent.api import handle_chat_request
from agent.graph import create_graph
from tests.agent.evals.dataset import sync_eval_dataset, DATASET_NAME
from tests.agent.evals.evaluators import (
    evaluate_state_extraction,
    evaluate_no_repetition,
    evaluate_recommendation_accuracy,
)


def agent_target(inputs: dict) -> dict:
    """
    Evaluation target: invokes the LangGraph workflow across the multi-turn
    messages provided in the dataset example.
    """
    conv_id = inputs.get("conversation_id") or "eval_session"
    messages = inputs.get("messages") or []

    # Use an isolated checkpointer for each evaluation run
    isolated_graph = create_graph(checkpointer=MemorySaver())
    last_result = {}

    for m in messages:
        if m.get("role") == "user":
            content = m.get("content", "")
            last_result = handle_chat_request(
                message=content,
                conversation_id=conv_id,
                graph_instance=isolated_graph,
            )

    return last_result


class TestLangSmithEvaluationSuite:

    @pytest.fixture(scope="session")
    def langsmith_client(self):
        """Initializes and verifies the LangSmith client."""
        api_key = (os.getenv("LANGSMITH_API_KEY") or os.getenv("LANGCHAIN_API_KEY") or "").strip()
        if not api_key or "your_actual_key" in api_key:
            pytest.skip("LANGSMITH_API_KEY not configured in .env")
        return Client(api_key=api_key)

    def test_run_langsmith_benchmark_experiment(self, langsmith_client):
        """
        Syncs benchmark dataset to LangSmith and runs the evaluation experiment,
        publishing live metrics and traces to the LangSmith dashboard.
        """
        # 1. Sync dataset to LangSmith
        dataset = sync_eval_dataset(langsmith_client)
        assert dataset is not None
        assert dataset.name == DATASET_NAME

        # 2. Run LangSmith evaluation
        results = evaluate(
            agent_target,
            data=DATASET_NAME,
            evaluators=[
                evaluate_state_extraction,
                evaluate_no_repetition,
                evaluate_recommendation_accuracy,
            ],
            experiment_prefix="faruk-bot-eval",
            max_concurrency=1,
            client=langsmith_client,
        )

        assert results is not None
        print(f"\n[LangSmith] View experiment results at: {results}")

        # 3. Verify that all evaluated metrics achieved 1.0 across the dataset
        failures = []
        for row in results:
            conv_id = (row["example"].inputs or {}).get("conversation_id", "unknown")
            eval_list = (row.get("evaluation_results") or {}).get("results", [])
            for res in eval_list:
                if res.score is not None and res.score < 1.0:
                    failures.append(f"{conv_id} [{res.key}]: score={res.score} ({res.comment})")

        assert not failures, "LangSmith benchmark failures:\n" + "\n".join(failures)
