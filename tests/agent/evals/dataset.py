"""
LangSmith Benchmark Dataset for Faruk AI Chatbot.

Defines standard test cases for:
- State extraction accuracy (e.g. '12 no', corrections, multi-word answers)
- Repetition prevention (not re-asking answered questions)
- Course recommendation accuracy
"""

from typing import List, Dict, Any
from langsmith import Client

DATASET_NAME = "faruk-assistant-eval-dataset"

BENCHMARK_EXAMPLES: List[Dict[str, Any]] = [
    {
        "inputs": {
            "conversation_id": "eval_12_no",
            "messages": [
                {"role": "user", "content": "I am looking for a class for my son"},
                {"role": "assistant", "content": "Sure. How old is the student, and have they done any programming before?"},
                {"role": "user", "content": "12 no"},
            ],
            "last_user_message": "12 no",
        },
        "outputs": {
            "expected_age": 12,
            "expected_experience": "beginner",
            "forbidden_in_reply": ["done any programming before", "like scratch or blocks"],
            "expected_intent": "CLASS_INQUIRY",
        },
    },
    {
        "inputs": {
            "conversation_id": "eval_scratch_teen",
            "messages": [
                {"role": "user", "content": "Need coding lessons"},
                {"role": "assistant", "content": "Sure. How old is the student, and have they done any programming before?"},
                {"role": "user", "content": "14, we tried a bit of scratch last summer"},
            ],
            "last_user_message": "14, we tried a bit of scratch last summer",
        },
        "outputs": {
            "expected_age": 14,
            "expected_experience": "beginner",
            "expected_previous_languages": ["Scratch"],
            "expected_intent": "CLASS_INQUIRY",
        },
    },
    {
        "inputs": {
            "conversation_id": "eval_age_correction",
            "messages": [
                {"role": "user", "content": "Looking for classes for my 12 year old"},
                {"role": "assistant", "content": "Has your 12-year-old done any programming before?"},
                {"role": "user", "content": "actually he is 13, not 12, and he has never coded"},
            ],
            "last_user_message": "actually he is 13, not 12, and he has never coded",
        },
        "outputs": {
            "expected_age": 13,
            "expected_experience": "beginner",
            "expected_intent": "CLASS_INQUIRY",
        },
    },
    {
        "inputs": {
            "conversation_id": "eval_course_recommendation_kids",
            "messages": [
                {"role": "user", "content": "I want a structured course for my 12 year old who is completely new to coding"},
            ],
            "last_user_message": "I want a structured course for my 12 year old who is completely new to coding",
        },
        "outputs": {
            "expected_age": 12,
            "expected_experience": "beginner",
            "expected_course_id": "ai_python_kids",
            "expected_course_name": "AI & Python for Kids",
        },
    },
    {
        "inputs": {
            "conversation_id": "eval_ap_cs_java",
            "messages": [
                {"role": "user", "content": "My daughter needs tutoring for her AP Computer Science A course in Java"},
            ],
            "last_user_message": "My daughter needs tutoring for her AP Computer Science A course in Java",
        },
        "outputs": {
            "expected_intent": "ASSIGNMENT_HELP",
            "expected_course_id": "ap_computer_science_java",
        },
    },
]


def sync_eval_dataset(client: Client) -> Any:
    """
    Creates or updates the benchmark dataset in LangSmith.
    Returns the dataset record.
    """
    if client.has_dataset(dataset_name=DATASET_NAME):
        ds = client.read_dataset(dataset_name=DATASET_NAME)
    else:
        ds = client.create_dataset(
            dataset_name=DATASET_NAME,
            description="Benchmark dataset testing state extraction, repetition protection, and course recommendations",
        )
        # Populate initial benchmark examples
        client.create_examples(
            inputs=[ex["inputs"] for ex in BENCHMARK_EXAMPLES],
            outputs=[ex["outputs"] for ex in BENCHMARK_EXAMPLES],
            dataset_id=ds.id,
        )

    return ds

