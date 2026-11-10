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

# ---------------------------------------------------------------------------
# Hard / messy examples: informal phrasing that simple rules are likely to miss.
# These are where the LLM structured parser is expected to add value.
# Labels only assert fields that are unambiguous from the text.
# ---------------------------------------------------------------------------
_ASK_BACKGROUND = "Sure. How old is the student, and have they done any programming before?"
_REPEAT_BACKGROUND = ["how old is the student", "done any programming before"]
_REPEAT_AGE = ["how old is the student", "how old is your"]


def _two_turn(conv_id: str, opener: str, answer: str, outputs: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "inputs": {
            "conversation_id": conv_id,
            "messages": [
                {"role": "user", "content": opener},
                {"role": "assistant", "content": _ASK_BACKGROUND},
                {"role": "user", "content": answer},
            ],
            "last_user_message": answer,
        },
        "outputs": outputs,
    }


def _one_turn(conv_id: str, message: str, outputs: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "inputs": {
            "conversation_id": conv_id,
            "messages": [{"role": "user", "content": message}],
            "last_user_message": message,
        },
        "outputs": outputs,
    }


HARD_EXAMPLES: List[Dict[str, Any]] = [
    # --- Age written in words / informal forms ---
    _two_turn("hard_age_words", "Looking for a coding class",
              "she's eleven and hasn't really tried coding",
              {"expected_age": 11, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_age_turning", "need a class for my boy",
              "he just turned ten, total newbie",
              {"expected_age": 10, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_age_almost", "Do you teach teenagers?",
              "almost 15. never written a line of code",
              {"expected_age": 15, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_age_yo", "classes for my nephew?",
              "13 y/o, zero experience",
              {"expected_age": 13, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_age_spelled_teen", "my kid wants to learn programming",
              "fourteen. nope, nothing yet",
              {"expected_age": 14, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),

    # --- Prior languages mentioned casually ---
    _two_turn("hard_roblox", "looking for lessons",
              "12, he messed around with roblox studio a bit",
              {"expected_age": 12, "expected_previous_languages": ["Lua"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_khan_js", "coding tutor?",
              "she's 15 and did some JS on Khan Academy",
              {"expected_age": 15, "expected_previous_languages": ["JavaScript"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_code_org_blocks", "I want to sign up my daughter",
              "9, only code.org block stuff at school",
              {"expected_age": 9, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_minecraft_python", "Python classes?",
              "11 years, did a minecraft python camp last summer",
              {"expected_age": 11, "expected_previous_languages": ["Python"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_html_css", "web dev lessons for my son",
              "16, he knows a little html and css",
              {"expected_age": 16, "expected_previous_languages": ["HTML", "CSS"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),

    # --- Experienced students ---
    _two_turn("hard_advanced_teen", "My son is looking for something challenging",
              "17, he's been coding python for 3 years and built a discord bot",
              {"expected_age": 17, "expected_previous_languages": ["Python"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_java_cpp", "advanced class?",
              "16. knows java and some c++ from robotics club",
              {"expected_age": 16, "expected_previous_languages": ["Java", "C++"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),

    # --- Negations / hedged answers ---
    _two_turn("hard_not_really", "coding lessons please",
              "10, not really",
              {"expected_age": 10, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_never_tried", "I'm interested in classes",
              "my son is 12 and has never tried anything like this",
              {"expected_age": 12, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),

    # --- Corrections and multiple numbers ---
    _two_turn("hard_correction_oops", "class for my 10 year old",
              "oops sorry, she's 11 actually. no coding yet",
              {"expected_age": 11, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_AGE}),
    _two_turn("hard_two_numbers", "looking for coding class",
              "he's 13, did 2 weeks of scratch",
              {"expected_age": 13, "expected_previous_languages": ["Scratch"],
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _two_turn("hard_sibling_noise", "class for my younger one",
              "the younger one is 9, her brother is 15. she has never coded",
              {"expected_age": 9, "expected_experience": "beginner",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),

    # --- All info in a single opening message ---
    _one_turn("hard_single_msg_beginner",
              "hi! my 10yo daughter wants to learn to code, she's a complete beginner",
              {"expected_age": 10, "expected_experience": "beginner",
               "expected_course_id": "ai_python_kids",
               "expected_course_name": "AI & Python for Kids",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _one_turn("hard_single_msg_arduino",
              "my 14 year old loves building things, any robotics or arduino classes? he's never coded",
              {"expected_age": 14, "expected_experience": "beginner",
               "expected_course_id": "robotics_hardware_arduino",
               "forbidden_in_reply": _REPEAT_BACKGROUND}),
    _one_turn("hard_single_msg_ap",
              "junior in high school taking AP CSA this year, she's struggling with java",
              {"expected_course_id": "ap_computer_science_java",
               "expected_previous_languages": ["Java"]}),
]

ALL_EXAMPLES: List[Dict[str, Any]] = BENCHMARK_EXAMPLES + HARD_EXAMPLES


def sync_eval_dataset(client: Client) -> Any:
    """
    Creates or updates the benchmark dataset in LangSmith.
    Uploads any examples (keyed by conversation_id) not already present,
    so new examples added to this file are synced on the next run.
    Returns the dataset record.
    """
    if client.has_dataset(dataset_name=DATASET_NAME):
        ds = client.read_dataset(dataset_name=DATASET_NAME)
    else:
        ds = client.create_dataset(
            dataset_name=DATASET_NAME,
            description="Benchmark dataset testing state extraction, repetition protection, and course recommendations",
        )

    existing_ids = {
        (ex.inputs or {}).get("conversation_id")
        for ex in client.list_examples(dataset_id=ds.id)
    }
    new_examples = [
        ex for ex in ALL_EXAMPLES
        if ex["inputs"]["conversation_id"] not in existing_ids
    ]
    if new_examples:
        client.create_examples(
            inputs=[ex["inputs"] for ex in new_examples],
            outputs=[ex["outputs"] for ex in new_examples],
            dataset_id=ds.id,
        )

    return ds

