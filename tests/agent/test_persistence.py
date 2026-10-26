"""
Tests for STEP 15 — Conversation Persistence and Session Isolation
"""

import pytest
from langgraph.checkpoint.memory import MemorySaver
from agent.graph import create_graph


class TestConversationPersistence:
    """Step 15: State persistence and session isolation tests."""

    def test_a_conversation_persistence_across_turns(self):
        """
        Test A:
        Turn 1: "My son is 12."
        Turn 2: "He has used Scratch."
        Verify turn 2 state still has: student_age == 12.
        """
        memory = MemorySaver()
        app = create_graph(checkpointer=memory)

        thread_cfg = {"configurable": {"thread_id": "session_test_a"}}

        # Turn 1
        s1 = app.invoke(
            {"messages": [{"role": "user", "content": "My son is 12."}]},
            config=thread_cfg,
        )
        assert s1.get("student_age") == 12

        # Turn 2 (only providing the latest utterance)
        s2 = app.invoke(
            {"messages": [{"role": "user", "content": "He has used Scratch."}]},
            config=thread_cfg,
        )
        # Prior state must be preserved
        assert s2.get("student_age") == 12
        assert "Scratch" in (s2.get("previous_languages") or [])
        assert s2.get("experience_level") == "beginner"

    def test_b_state_isolation_between_sessions(self):
        """
        Test B:
        Start a separate conversation.
        Ensure state from conversation A does not leak into conversation B.
        """
        memory = MemorySaver()
        app = create_graph(checkpointer=memory)

        cfg_a = {"configurable": {"thread_id": "session_student_a"}}
        cfg_b = {"configurable": {"thread_id": "session_student_b"}}

        # Session A: 12-year-old beginner
        app.invoke(
            {"messages": [{"role": "user", "content": "My son is 12 and wants to learn Python."}]},
            config=cfg_a,
        )

        # Session B: Independent inquiry
        sb = app.invoke(
            {"messages": [{"role": "user", "content": "Can you tell me about your classes?"}]},
            config=cfg_b,
        )

        # Verify Session B did NOT inherit Session A facts
        assert sb.get("student_age") is None
        assert sb.get("programming_language") is None
        assert sb.get("recommended_class") is None

    def test_concurrent_sessions_track_distinct_profiles(self):
        """
        Verify two ongoing multi-turn sessions track completely separate profiles simultaneously.
        """
        memory = MemorySaver()
        app = create_graph(checkpointer=memory)

        cfg_kids = {"configurable": {"thread_id": "session_kids"}}
        cfg_teen = {"configurable": {"thread_id": "session_teen"}}

        # Kids Turn 1
        app.invoke(
            {"messages": [{"role": "user", "content": "My daughter is 10."}]},
            config=cfg_kids,
        )
        # Teen Turn 1
        app.invoke(
            {"messages": [{"role": "user", "content": "My son is 16 and wants AP CS help."}]},
            config=cfg_teen,
        )

        # Kids Turn 2
        sk2 = app.invoke(
            {"messages": [{"role": "user", "content": "She knows Scratch and wants to learn Python."}]},
            config=cfg_kids,
        )
        # Teen Turn 2
        st2 = app.invoke(
            {"messages": [{"role": "user", "content": "He has a Java homework assignment due Friday."}]},
            config=cfg_teen,
        )

        # Verify Kids state
        assert sk2.get("student_age") == 10
        assert sk2.get("recommended_class_id") == "ai_python_kids"

        # Verify Teen state
        assert st2.get("student_age") == 16
        assert st2.get("recommended_class_id") == "ap_computer_science_java"
