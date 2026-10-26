"""
STEP 3 — Agent State Model Unit Tests

Tests:
- Test A: State accepts basic typed inputs (e.g. student_age = 12)
- Test B: Structured fields survive a LangGraph node round trip
- Test C: Missing optional fields do not crash the graph
"""

import sys
import os
import pytest
from langgraph.graph import StateGraph, START, END

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.state import AgentState


def dummy_pass_through_node(state: AgentState) -> dict:
    """A minimal node that updates or passes through state."""
    # Example update: marks that node ran without mutating existing fields
    return {"next_action": "verified"}


def build_test_state_graph():
    """Builds a minimal StateGraph using AgentState."""
    builder = StateGraph(AgentState)
    builder.add_node("pass_through", dummy_pass_through_node)
    builder.add_edge(START, "pass_through")
    builder.add_edge("pass_through", END)
    return builder.compile()


class TestAgentStateModel:
    """Test suite for AgentState schema and LangGraph node compatibility."""

    def test_state_accepts_single_field(self):
        """Test A: Ensure state accepts single field (student_age: 12)."""
        state: AgentState = {"student_age": 12}
        assert state["student_age"] == 12

    def test_state_round_trip_through_graph(self):
        """Test B: Ensure structured values survive a graph node round trip."""
        graph = build_test_state_graph()
        input_state: AgentState = {
            "student_age": 14,
            "experience_level": "intermediate",
            "request_type": "long_term_course",
        }
        output_state = graph.invoke(input_state)

        assert output_state["student_age"] == 14
        assert output_state["experience_level"] == "intermediate"
        assert output_state["request_type"] == "long_term_course"
        assert output_state["next_action"] == "verified"

    def test_missing_optional_fields_do_not_crash_graph(self):
        """Test C: Ensure missing optional fields do not crash the graph."""
        graph = build_test_state_graph()
        # Pass an empty state dict
        empty_state: AgentState = {}
        output_state = graph.invoke(empty_state)

        assert output_state["next_action"] == "verified"
        assert "student_age" not in output_state or output_state.get("student_age") is None
        assert output_state.get("experience_level") is None
