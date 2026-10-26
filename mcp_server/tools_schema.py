"""
Groq & OpenAI-compatible Tool Schemas and Dispatcher for Read-Only MCP Tools.
"""

from typing import Dict, Any, List
from mcp_server.parsers import (
    parse_tutoring_pricing,
    parse_tutoring_courses,
    parse_portfolio_projects,
    parse_credentials,
    search_site_content,
)

# Standard OpenAI / Groq Tool Calling Definitions
GROQ_TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "get_tutoring_details",
            "description": (
                "Call this tool when the user asks about tutoring rates, hourly pricing, session bundles, "
                "discounts (sibling discounts), or STEM/coding course offerings (Python, Web Dev, AI, Arduino, QA Automation)."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "course_topic": {
                        "type": ["string", "null"],
                        "description": "Optional topic filter e.g. 'python', 'web', 'ai', 'robotics', 'qa'",
                    },
                    "target_age": {
                        "type": ["integer", "null"],
                        "description": "Optional student age e.g. 10, 14",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_portfolio_projects",
            "description": (
                "Call this tool when the user asks to see Faruk's portfolio projects, open source tools, "
                "GitHub repositories, or live web application demos."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": ["string", "null"],
                        "description": "Optional project category e.g. 'automation', 'ai', 'web', 'games'",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_booking_and_contact_info",
            "description": (
                "Call this tool when the user asks how to book a session, schedule a free consultation, "
                "or contact Faruk directly."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_faruk_credentials",
            "description": (
                "Call this tool when the user asks to verify Faruk's academic degrees (UK B.Eng, USA M.S.), "
                "certifications, university education, or professional SDET QA work history."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_website_content",
            "description": (
                "Call this tool to perform a full-text search across website pages for specific keywords or niche topics."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search keyword or phrase",
                    },
                },
                "required": ["query"],
            },
        },
    },
]


def execute_tool_call(tool_name: str, arguments: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Executes a tool call locally against the read-only parsers.
    Returns structured, compact JSON with zero mutations.
    """
    arguments = arguments or {}

    if tool_name == "get_tutoring_details":
        pricing = parse_tutoring_pricing()
        topic = arguments.get("course_topic")
        courses = parse_tutoring_courses(topic_filter=topic)
        return {
            "pricing": pricing,
            "courses_found": courses[:3],
            "total_courses_available": len(courses),
        }

    elif tool_name == "get_portfolio_projects":
        category = arguments.get("category")
        projects = parse_portfolio_projects(category_filter=category)
        return {
            "projects": projects[:4],
            "total_found": len(projects),
        }

    elif tool_name == "get_booking_and_contact_info":
        return {
            "booking_url": "https://faruk-hasan.com/tutoring/tutoring.html#book",
            "free_consultation": "Free 20-minute consultation ($0)",
            "booking_instructions": "Visit the official booking link to select a time slot or request consultation.",
        }

    elif tool_name == "get_faruk_credentials":
        return parse_credentials()

    elif tool_name == "search_website_content":
        query = arguments.get("query", "")
        results = search_site_content(query=query)
        return {
            "query": query,
            "results": results,
        }

    else:
        return {"error": f"Unknown tool: '{tool_name}'"}
