"""
STEP 14 — Complete LangGraph Workflow

Assembles the full conversational intake, classification, missing-information check,
recommendation engine, and response generation into a compiled LangGraph StateGraph.

Architecture:
START
  ↓
extract_information
  ↓
classify_intent
  ↓
route_intent
  ├── GENERAL_QUESTION → general_response → END
  ├── UNKNOWN → clarification → END
  └── [CLASS_INQUIRY / PROJECT_HELP / ASSIGNMENT_HELP]
        ↓
     check_missing_information
        ↓
     route_missing_information
       ├── NO (missing info) → generate_followup_question → END
       └── YES (complete info)
             ↓
        recommend_class
             ↓
        generate_response
             ↓
            END
"""

from typing import Optional, Any
from langgraph.graph import StateGraph, START, END

from agent.state import AgentState
from agent.nodes import (
    extract_information,
    classify_intent,
    check_missing_information,
    generate_followup_question,
    recommend_class,
    generate_response,
    general_response,
    clarification,
)
from agent.routing import (
    route_intent,
    route_missing_information,
    NODE_CHECK_MISSING,
    NODE_GENERAL_RESPONSE,
    NODE_CLARIFICATION,
    NODE_FOLLOWUP_QUESTION,
    NODE_RECOMMEND_CLASS,
)


from agent.logging import observe_node


def create_graph(checkpointer: Optional[Any] = None):
    """
    Constructs and compiles the complete LangGraph workflow graph.
    Optionally accepts a checkpointer (e.g. MemorySaver) for session persistence.
    """
    builder = StateGraph(AgentState)

    # 1. Register Nodes with Observability Logging
    builder.add_node("extract_information", observe_node("extract_information")(extract_information))
    builder.add_node("classify_intent", observe_node("classify_intent")(classify_intent))
    builder.add_node(NODE_CHECK_MISSING, observe_node(NODE_CHECK_MISSING)(check_missing_information))
    builder.add_node(NODE_GENERAL_RESPONSE, observe_node(NODE_GENERAL_RESPONSE)(general_response))
    builder.add_node(NODE_CLARIFICATION, observe_node(NODE_CLARIFICATION)(clarification))
    builder.add_node(NODE_FOLLOWUP_QUESTION, observe_node(NODE_FOLLOWUP_QUESTION)(generate_followup_question))
    builder.add_node(NODE_RECOMMEND_CLASS, observe_node(NODE_RECOMMEND_CLASS)(recommend_class))
    builder.add_node("generate_response", observe_node("generate_response")(generate_response))

    # 2. Sequential Edges
    builder.add_edge(START, "extract_information")
    builder.add_edge("extract_information", "classify_intent")

    # 3. Intent Conditional Edge
    builder.add_conditional_edges(
        "classify_intent",
        route_intent,
        {
            NODE_CHECK_MISSING: NODE_CHECK_MISSING,
            NODE_GENERAL_RESPONSE: NODE_GENERAL_RESPONSE,
            NODE_CLARIFICATION: NODE_CLARIFICATION,
        },
    )

    # 4. Missing Information Conditional Edge
    builder.add_conditional_edges(
        NODE_CHECK_MISSING,
        route_missing_information,
        {
            NODE_FOLLOWUP_QUESTION: NODE_FOLLOWUP_QUESTION,
            NODE_RECOMMEND_CLASS: NODE_RECOMMEND_CLASS,
        },
    )

    # 5. Recommendation -> Response Generation Edge
    builder.add_edge(NODE_RECOMMEND_CLASS, "generate_response")

    # 6. Terminal Edges to END
    builder.add_edge("generate_response", END)
    builder.add_edge(NODE_FOLLOWUP_QUESTION, END)
    builder.add_edge(NODE_GENERAL_RESPONSE, END)
    builder.add_edge(NODE_CLARIFICATION, END)

    if checkpointer is not None:
        return builder.compile(checkpointer=checkpointer)

    return builder.compile()


from langgraph.checkpoint.memory import MemorySaver

# Default compiled graph instance (stateless execution)
graph = create_graph()

# Default checkpointer and stateful graph for session persistence (Step 15)
default_checkpointer = MemorySaver()
persistent_graph = create_graph(checkpointer=default_checkpointer)
