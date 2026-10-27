"""
STEP 9 — Class Catalog Data Model

Authoritative, structured catalog of Faruk's classes, courses, and tutoring options.
Replaces prompt-based guesswork with structured, validateable course definitions.
"""

from typing import List, Dict, Any, Optional

ALLOWED_LEVELS = {"beginner", "intermediate", "advanced"}
ALLOWED_TYPES = {"course", "tutoring"}
ALLOWED_FORMATS = {"1-on-1", "group"}

CLASSES: List[Dict[str, Any]] = [
    {
        "id": "ai_python_kids",
        "name": "AI & Python for Kids",
        "min_age": 9,
        "max_age": 13,
        "level": ["beginner"],
        "topics": ["python", "ai", "chatbot", "scratch transition"],
        "format": ["group", "1-on-1"],
        "type": "course",
        "description": "Hands-on introduction to real Python syntax and AI chatbots designed for students transitioning from Scratch.",
    },
    {
        "id": "advanced_python_ai_web",
        "name": "Advanced Python & AI: Build AI Web Apps With React, API & Database",
        "min_age": 12,
        "max_age": 18,
        "level": ["intermediate", "advanced"],
        "topics": [
            "python",
            "ai",
            "react",
            "api",
            "database",
            "web development",
            "machine learning",
        ],
        "format": ["group", "1-on-1"],
        "type": "course",
        "description": "Full-stack AI web application development integrating live LLM APIs, databases, and deployment.",
    },
    {
        "id": "ap_computer_science_java",
        "name": "AP Computer Science A (Java) Prep & Tutoring",
        "min_age": 14,
        "max_age": 18,
        "level": ["beginner", "intermediate", "advanced"],
        "topics": [
            "java",
            "ap computer science",
            "ap cs",
            "object-oriented programming",
            "recursion",
            "data structures",
            "assignments",
        ],
        "format": ["1-on-1"],
        "type": "tutoring",
        "description": "Tailored 1-on-1 coaching for AP Computer Science A students covering coursework, labs, and exam prep.",
    },
    {
        "id": "robotics_hardware_arduino",
        "name": "Robotics, Arduino & Hardware Engineering",
        "min_age": 10,
        "max_age": 18,
        "level": ["beginner", "intermediate"],
        "topics": ["arduino", "robotics", "raspberry pi", "circuits", "hardware", "iot"],
        "format": ["1-on-1", "group"],
        "type": "course",
        "description": "Program microcontroller boards, build robotic components, and design smart IoT hardware.",
    },
    {
        "id": "qa_automation_sdet",
        "name": "Software Test Engineering (QA / SDET)",
        "min_age": 16,
        "max_age": 60,
        "level": ["intermediate", "advanced"],
        "topics": ["playwright", "selenium", "pytest", "python", "ci/cd", "automation", "testing"],
        "format": ["1-on-1"],
        "type": "course",
        "description": "Industry-level QA automation skills designed to prepare students for real-world software engineering careers.",
    },
    {
        "id": "private_project_tutoring",
        "name": "Private 1-on-1 Project Tutoring",
        "min_age": 9,
        "max_age": 18,
        "level": ["beginner", "intermediate", "advanced"],
        "topics": [
            "python",
            "java",
            "web development",
            "ai",
            "mobile apps",
            "projects",
            "assignments",
        ],
        "format": ["1-on-1"],
        "type": "tutoring",
        "description": "Dedicated 1-on-1 mentorship for students building custom software, games, chatbots, or school projects.",
    },
]


def get_all_classes() -> List[Dict[str, Any]]:
    """Returns the complete list of structured classes."""
    return list(CLASSES)


def get_class_by_id(class_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a class record by its unique ID."""
    for c in CLASSES:
        if c["id"] == class_id:
            return c
    return None
