"""
STEP 24 — Final MVP Acceptance Test

Verifies the exact multi-turn MVP acceptance conversation mandated by LANGGRAPH_PLAYBOOK.md:

Turn 1:
User: I'm looking for a class for my son.
Agent: Sure. How old is he, and has he done any programming before?

Turn 2:
User: He's 13 and has used Scratch.
Agent: Great. Is he mainly looking for a structured course, or does he already have something specific he wants to build?

Turn 3:
User: He wants a longer-term class where he can learn Python and AI and eventually build apps.
Agent: Based on that, [correct Faruk class recommendation + concise reason].

Required internal final state:
{
    "intent": "CLASS_INQUIRY",
    "student_age": 13,
    "experience_level": "beginner",
    "previous_languages": ["Scratch"],
    "request_type": "long_term_course",
    "project_goal": "learn Python and AI and eventually build apps",
    "missing_fields": [],
    "recommended_class": "...",
    "recommendation_reason": "..."
}
"""

import pytest
from langgraph.checkpoint.memory import MemorySaver

from agent.graph import create_graph


def test_final_mvp_acceptance_conversation():
    """
    Executes the exact 3-turn MVP conversation from Section 24 of LANGGRAPH_PLAYBOOK.md.
    Asserts both conversational outputs and final state structure.
    """
    checkpointer = MemorySaver()
    app = create_graph(checkpointer=checkpointer)
    config = {"configurable": {"thread_id": "mvp-final-acceptance-thread"}}

    # Turn 1
    t1_input = {"messages": [{"role": "user", "content": "I'm looking for a class for my son."}]}
    t1_state = app.invoke(t1_input, config=config)

    assert t1_state["intent"] == "CLASS_INQUIRY"
    assert "student_age" in t1_state["missing_fields"]
    assert "experience_level" in t1_state["missing_fields"]
    assert "How old is he" in t1_state["response"]
    assert "done any programming before" in t1_state["response"]
    assert t1_state.get("recommended_class") is None

    # Turn 2
    t2_input = {"messages": [{"role": "user", "content": "He's 13 and has used Scratch."}]}
    t2_state = app.invoke(t2_input, config=config)

    assert t2_state["student_age"] == 13
    assert t2_state["experience_level"] == "beginner"
    assert "Scratch" in t2_state["previous_languages"]
    assert "request_type" in t2_state["missing_fields"]
    assert "structured course" in t2_state["response"]
    assert "something specific he wants to build" in t2_state["response"]
    assert t2_state.get("recommended_class") is None

    # Turn 3
    t3_input = {
        "messages": [
            {
                "role": "user",
                "content": "He wants a longer-term class where he can learn Python and AI and eventually build apps.",
            }
        ]
    }
    t3_state = app.invoke(t3_input, config=config)

    # 1. Assert required internal final state
    assert t3_state["intent"] == "CLASS_INQUIRY"
    assert t3_state["student_age"] == 13
    assert t3_state["experience_level"] == "beginner"
    assert t3_state["previous_languages"] == ["Scratch"]
    assert t3_state["request_type"] == "long_term_course"
    assert t3_state["project_goal"] == "learn Python and AI and eventually build apps"
    assert t3_state["missing_fields"] == []
    assert t3_state["recommended_class"] == "AI & Python for Kids"
    assert t3_state["recommended_class_id"] == "ai_python_kids"
    assert "13-year-olds" in t3_state["recommendation_reason"]
    assert "transition smoothly into text programming" in t3_state["recommendation_reason"]

    # 2. Assert agent response
    resp = t3_state["response"]
    assert "AI & Python for Kids" in resp
    assert "13-year-olds" in resp or "transition smoothly" in resp
