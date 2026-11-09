"""
LangSmith Custom Evaluators for Faruk AI Chatbot.

Evaluates:
- State extraction accuracy (age, experience, languages, intent)
- Repetition check (ensures bot does not re-ask known or already asked questions)
- Course recommendation correctness (matching student profile to course catalog)
"""

from typing import Dict, Any


def evaluate_state_extraction(run, example) -> Dict[str, Any]:
    """
    Evaluator: Checks whether structured facts (age, experience, languages)
    were correctly extracted into the LangGraph state.
    """
    outputs = run.outputs or {}
    state = outputs.get("state") or {}
    expected = example.outputs or {}

    checks_passed = 0
    total_checks = 0
    details = []

    # Check age
    if "expected_age" in expected:
        total_checks += 1
        actual_age = state.get("student_age")
        if actual_age == expected["expected_age"]:
            checks_passed += 1
        else:
            details.append(f"Age mismatch: expected {expected['expected_age']}, got {actual_age}")

    # Check experience level
    if "expected_experience" in expected:
        total_checks += 1
        actual_exp = state.get("experience_level")
        if actual_exp == expected["expected_experience"]:
            checks_passed += 1
        else:
            details.append(f"Experience mismatch: expected {expected['expected_experience']}, got {actual_exp}")

    # Check previous languages
    if "expected_previous_languages" in expected:
        total_checks += 1
        actual_langs = [l.lower() for l in (state.get("previous_languages") or [])]
        expected_langs = [l.lower() for l in expected["expected_previous_languages"]]
        if all(l in actual_langs for l in expected_langs):
            checks_passed += 1
        else:
            details.append(f"Languages mismatch: expected {expected['expected_previous_languages']}, got {actual_langs}")

    # Check intent
    if "expected_intent" in expected:
        total_checks += 1
        actual_intent = state.get("intent") or outputs.get("intent")
        if actual_intent == expected["expected_intent"]:
            checks_passed += 1
        else:
            details.append(f"Intent mismatch: expected {expected['expected_intent']}, got {actual_intent}")

    score = 1.0 if (total_checks > 0 and checks_passed == total_checks) else (0.0 if total_checks > 0 else 1.0)
    comment = "All state fields matched" if score == 1.0 else "; ".join(details)

    return {
        "key": "state_extraction_accuracy",
        "score": score,
        "comment": comment,
    }


def evaluate_no_repetition(run, example) -> Dict[str, Any]:
    """
    Evaluator: Asserts that the bot does not ask for information that the
    user already provided in the current or previous turn.
    """
    outputs = run.outputs or {}
    reply = (outputs.get("reply") or outputs.get("response") or "").lower()
    expected = example.outputs or {}

    forbidden_phrases = expected.get("forbidden_in_reply") or []
    for phrase in forbidden_phrases:
        if phrase.lower() in reply:
            return {
                "key": "no_question_repetition",
                "score": 0.0,
                "comment": f"Repetitive phrase detected in reply: '{phrase}'",
            }

    return {
        "key": "no_question_repetition",
        "score": 1.0,
        "comment": "No repetition detected; response advanced conversational state",
    }


def evaluate_recommendation_accuracy(run, example) -> Dict[str, Any]:
    """
    Evaluator: Checks whether the recommended course matches the authoritative catalog.
    Only applies to examples that have an expected course output.
    """
    expected = example.outputs or {}
    expected_course_id = expected.get("expected_course_id")
    expected_course_name = expected.get("expected_course_name")

    if not expected_course_id and not expected_course_name:
        # Not a recommendation turn; N/A
        return {
            "key": "recommendation_accuracy",
            "score": 1.0,
            "comment": "N/A (Intake turn)",
        }

    outputs = run.outputs or {}
    state = outputs.get("state") or {}
    actual_class = state.get("recommended_class") or outputs.get("recommended_class")
    reply = outputs.get("reply") or outputs.get("response") or ""

    is_match = False
    if expected_course_name and expected_course_name.lower() in str(actual_class).lower():
        is_match = True
    elif expected_course_name and expected_course_name.lower() in reply.lower():
        is_match = True
    elif expected_course_id and expected_course_id.lower() in str(actual_class).lower():
        is_match = True

    return {
        "key": "recommendation_accuracy",
        "score": 1.0 if is_match else 0.0,
        "comment": f"Recommended: {actual_class}" if is_match else f"Expected {expected_course_name or expected_course_id}, got {actual_class}",
    }
