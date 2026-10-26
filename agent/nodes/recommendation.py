"""
STEP 10 — Recommendation Engine Node

Scores and matches students with the most appropriate Faruk course or tutoring offering.
Uses a two-stage evaluation:
1. Deterministic scoring based on age fit, skill level, request type, and topic keywords.
2. Contextual explanation generation tailoring the recommendation reason to student goals.
"""

from typing import Dict, Any, List, Optional
from agent.state import AgentState
from agent.data.classes import CLASSES, get_class_by_id


def score_class_for_state(course: Dict[str, Any], state: AgentState) -> float:
    """
    Calculates a deterministic fitness score between a course catalog record and AgentState.
    """
    score = 0.0
    age = state.get("student_age")
    exp = state.get("experience_level")
    req_type = state.get("request_type")
    goal = (state.get("project_goal") or "").lower()
    subject = (state.get("subject") or "").lower()
    lang = (state.get("programming_language") or "").lower()
    pref_format = state.get("preferred_class_type")

    # 1. Assignment Help Intent Matching
    if req_type == "assignment_help" or "homework" in goal:
        if "ap computer science" in subject or "java" in lang or "java" in goal:
            if course["id"] == "ap_computer_science_java":
                score += 60.0
        elif course["id"] == "private_project_tutoring":
            score += 45.0

    # 2. Project Help Intent Matching
    if req_type == "project_help":
        if course["id"] == "private_project_tutoring":
            score += 45.0
        # If user explicitly mentions personal project, existing project, or finishing their app
        if any(w in goal for w in ["personal", "finish", "existing", "help building", "my project", "my website", "my app"]):
            if course["id"] == "private_project_tutoring":
                score += 25.0
        elif course["id"] == "advanced_python_ai_web" and exp in ["intermediate", "advanced"]:
            score += 20.0

    # 3. Long-term Course Intent Matching
    if req_type == "long_term_course" and course.get("type") == "course":
        score += 25.0

    # 4. Age Fit Scoring
    if age is not None:
        min_age = course["min_age"]
        max_age = course["max_age"]
        if min_age <= age <= max_age:
            score += 30.0
        elif age < min_age:
            # Harsh penalty for being too young for the class
            score -= 40.0
        elif age > max_age:
            score -= 15.0

    # 5. Experience Level Matching
    if exp:
        course_levels = course.get("level", [])
        if exp == "beginner":
            if "beginner" in course_levels:
                score += 25.0
            if course["id"] == "advanced_python_ai_web":
                score -= 35.0  # Beginner should not be placed in advanced web/API course
        elif exp in ["intermediate", "advanced"]:
            if "intermediate" in course_levels or "advanced" in course_levels:
                score += 25.0
            if course["id"] == "ai_python_kids":
                score -= 25.0  # Intermediate student should not repeat beginner kids course

    # 6. Specific Topic & Technology Keyword Matches
    course_topics = course.get("topics", [])
    search_context = f"{goal} {subject} {lang}".lower()

    if "java" in search_context and "java" in course_topics:
        score += 30.0
    if "web" in search_context or "react" in search_context or "api" in search_context:
        if course["id"] == "advanced_python_ai_web":
            score += 35.0
    if "arduino" in search_context or "robot" in search_context or "hardware" in search_context:
        if course["id"] == "robotics_hardware_arduino":
            score += 50.0
    if "qa" in search_context or "automation" in search_context or "selenium" in search_context or "playwright" in search_context:
        if course["id"] == "qa_automation_sdet":
            score += 50.0
    if "ai" in search_context or "chatbot" in search_context:
        if "ai" in course_topics:
            score += 15.0
    if "python" in search_context and "python" in course_topics:
        score += 10.0

    # 7. Format Preference
    if pref_format == "1-on-1":
        if "1-on-1" in course.get("format", []):
            score += 15.0
        if course["id"] == "private_project_tutoring":
            score += 15.0

    return score


def generate_recommendation_reason(course: Dict[str, Any], state: AgentState) -> str:
    """
    Builds a grounded, personalized explanation for why this class was chosen.
    """
    age = state.get("student_age")
    exp = state.get("experience_level")
    goal = state.get("project_goal")
    cid = course["id"]

    if cid == "ai_python_kids":
        if age:
            return f"Designed specifically for {age}-year-olds to transition smoothly into text programming and build fun AI chatbots without getting overwhelmed by syntax."
        return "Ideal for young learners transitioning from Scratch to real Python syntax through interactive AI projects."

    elif cid == "advanced_python_ai_web":
        if goal:
            return f"Since the student already has foundational coding skills and wants to {goal}, this course dives straight into real APIs, databases, and React web apps instead of repeating beginner basics."
        return "Perfect for intermediate students ready to build full-stack web applications and integrate real LLM APIs."

    elif cid == "ap_computer_science_java":
        return "Offers targeted 1-on-1 coaching covering AP Computer Science Java coursework, object-oriented concepts, and assignment problem-solving."

    elif cid == "robotics_hardware_arduino":
        return "Hands-on engineering curriculum teaching circuit design, microcontrollers, and IoT programming with Arduino."

    elif cid == "qa_automation_sdet":
        return "Industry-aligned software test automation training covering Python, Playwright, Pytest, and CI/CD pipelines for career readiness."

    elif cid == "private_project_tutoring":
        if goal:
            return f"Provides flexible 1-on-1 mentorship focused directly on helping the student {goal} with custom codebase support."
        return "Offers dedicated 1-on-1 guidance tailored to custom student projects and individual learning pacing."

    return f"A strong match based on the student's age ({age}) and stated goals."


def recommend_class(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph Node: Evaluates all catalog courses against state facts,
    selects top recommendation, and stores recommendation outputs.
    """
    scored = [(score_class_for_state(c, state), c) for c in CLASSES]
    scored.sort(key=lambda x: x[0], reverse=True)

    top_score, top_course = scored[0]
    reason = generate_recommendation_reason(top_course, state)

    return {
        "recommended_class": top_course["name"],
        "recommended_class_id": top_course["id"],
        "recommendation_reason": reason,
        "next_action": "generate_response",
    }
