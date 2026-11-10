#!/usr/bin/env python3
"""
CLI Runner for LangSmith Evaluation Benchmark.

Usage:
    cd portfolio-website
    python tests/agent/run_langsmith_eval.py
"""

import os
import sys
from dotenv import load_dotenv

# Ensure root paths are in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DEPLOY_DIR = os.path.join(BASE_DIR, "ai_chatbot", "hf_deployment")

for p in [BASE_DIR, DEPLOY_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

load_dotenv(os.path.join(BASE_DIR, ".env"))

from langsmith import Client
from langsmith.evaluation import evaluate
from langgraph.checkpoint.memory import MemorySaver

from agent.api import handle_chat_request
from agent.graph import create_graph
from tests.agent.evals.dataset import sync_eval_dataset, DATASET_NAME
from tests.agent.evals.evaluators import (
    evaluate_state_extraction,
    evaluate_no_repetition,
    evaluate_recommendation_accuracy,
)


def agent_target(inputs: dict) -> dict:
    conv_id = inputs.get("conversation_id") or "eval_session"
    messages = inputs.get("messages") or []

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


def main():
    print("=" * 60)
    print("🚀 Running Faruk AI Chatbot Evaluation on LangSmith")
    print("=" * 60)

    api_key = (os.getenv("LANGSMITH_API_KEY") or os.getenv("LANGCHAIN_API_KEY") or "").strip()
    client = Client(api_key=api_key or None)
    print("✓ Connected to LangSmith")

    print(f"✓ Syncing dataset '{DATASET_NAME}'...")
    dataset = sync_eval_dataset(client)
    print(f"✓ Dataset ready (ID: {dataset.id})")

    print("\n⏳ Running evaluation across all benchmark scenarios...")
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
        client=client,
    )

    print("\n" + "=" * 60)
    print("🎉 LangSmith Evaluation Completed!")
    print(f"📊 View Experiment in Dashboard:\nhttps://smith.langchain.com/o/e893d53d-4d25-41e9-9171-809c14c5bd27/datasets/{dataset.id}")
    print("=" * 60)


if __name__ == "__main__":
    main()

