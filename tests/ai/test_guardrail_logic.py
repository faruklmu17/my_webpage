"""
Deterministic Guardrail Validation Tests

Verifies:
1. Toxic, profane, and abusive language is intercepted locally (even with Faruk keywords).
2. Off-topic queries (math trivia, general geography, poem requests) are intercepted locally.
3. Casual slang greetings ("yo", "sup", "what's up") and on-topic queries pass through safely.
"""

import re
import pytest

ABUSE_PATTERN = r"\b(fuck|shit|bitch|asshole|bastard|dick|pussy|cunt|slut|whore|nigger|faggot|retard|idiot|stupid|dumbass|kill\s+yourself|hate\s+you)\b"
GREETING_PATTERN = r"^(hi|hello|hey|yo|sup|what's\s*up|whats\s*up|what's\s*good|whats\s*good|good\s+(morning|afternoon|evening)|howdy|greetings|hola)\b"

FARUK_KEYWORDS = {
    "faruk", "hasan", "tutoring", "course", "courses", "class", "classes",
    "teach", "teaching", "python", "book", "booking", "session", "contact",
    "email", "hire", "mentor", "mentoring", "portfolio", "projects",
    "resume", "cv", "experience", "education", "degree", "university",
    "college", "skills", "automation", "playwright", "selenium", "pytest",
    "work", "job", "career", "background", "who are you", "who is",
}


def evaluate_guardrails(user_message: str, context: str = "") -> str:
    """Simulates the production pre-LLM filter pipeline."""
    # 1. Toxicity check
    if re.search(ABUSE_PATTERN, user_message.lower()):
        return "BLOCKED_TOXICITY"

    # 2. Scope check
    is_greeting = bool(re.search(GREETING_PATTERN, user_message.lower().strip()))
    msg_words = set(re.findall(r"\b\w+\b", user_message.lower()))
    has_domain_keyword = bool(msg_words.intersection(FARUK_KEYWORDS))

    if not context and not is_greeting and not has_domain_keyword:
        return "BLOCKED_OFF_TOPIC"

    return "PASS_TO_LLM"


@pytest.mark.parametrize(
    "abusive_query",
    [
        "you are an idiot",
        "fuck you",
        "Faruk is stupid",
        "this bot is a dumbass piece of shit",
        "kill yourself",
        "Faruk is an asshole",
    ],
)
def test_toxic_queries_blocked_immediately(abusive_query):
    result = evaluate_guardrails(abusive_query, context="Faruk Hasan is an engineer")
    assert result == "BLOCKED_TOXICITY", (
        f"Query '{abusive_query}' must be blocked as toxic before reaching LLM."
    )


@pytest.mark.parametrize(
    "off_topic_query",
    [
        "what is 2 + 2",
        "calculate 15 * 84",
        "what is the capital city of France?",
        "write me a poem about cute cats",
        "how do I make sourdough bread?",
        "who was the first president of the United States?",
    ],
)
def test_off_topic_queries_intercepted_without_tokens(off_topic_query):
    result = evaluate_guardrails(off_topic_query, context="")
    assert result == "BLOCKED_OFF_TOPIC", (
        f"Query '{off_topic_query}' should be intercepted locally without calling the LLM."
    )


@pytest.mark.parametrize(
    "casual_slang_greeting",
    [
        "yo",
        "yo!",
        "sup",
        "what's up",
        "whats good",
        "hey there",
        "hello",
    ],
)
def test_casual_slang_greetings_allowed(casual_slang_greeting):
    result = evaluate_guardrails(casual_slang_greeting, context="")
    assert result == "PASS_TO_LLM", (
        f"Casual greeting '{casual_slang_greeting}' must be allowed through."
    )


@pytest.mark.parametrize(
    "on_topic_query",
    [
        "Where did Faruk get his degree?",
        "How can I book a tutoring session?",
        "What Python courses are offered?",
        "Tell me about Faruk's automation background",
    ],
)
def test_on_topic_queries_allowed_to_pass(on_topic_query):
    result = evaluate_guardrails(on_topic_query, context="Faruk Hasan is an engineer")
    assert result == "PASS_TO_LLM", (
        f"Query '{on_topic_query}' is valid and must pass through."
    )
