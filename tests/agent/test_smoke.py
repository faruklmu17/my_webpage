"""
STEP 2 — LangGraph Smoke Test

Validates that LangGraph imports, compiles a minimal StateGraph,
and executes a predictable round trip:
START -> smoke_node -> END
"""

from typing import TypedDict
import pytest
from langgraph.graph import StateGraph, START, END


class SmokeState(TypedDict, total=False):
    test_value: str
    test_result: str


def smoke_node(state: SmokeState) -> dict:
    return {"test_result": "passed"}


def build_smoke_graph():
    builder = StateGraph(SmokeState)
    builder.add_node("smoke_node", smoke_node)
    builder.add_edge(START, "smoke_node")
    builder.add_edge("smoke_node", END)
    return builder.compile()


def test_langgraph_smoke_execution():
    """Validates minimal graph compilation and execution."""
    graph = build_smoke_graph()
    initial_state: SmokeState = {"test_value": "hello"}
    final_state = graph.invoke(initial_state)

    assert final_state["test_value"] == "hello"
    assert final_state["test_result"] == "passed"
