"""
Unit Tests for Read-Only MCP Server Parsers & Tool Dispatcher
"""

import time
import pytest
from mcp_server.parsers import (
    parse_tutoring_pricing,
    parse_tutoring_courses,
    parse_portfolio_projects,
    parse_credentials,
    search_site_content,
)
from mcp_server.tools_schema import GROQ_TOOLS, execute_tool_call


class TestMCPParsers:
    def test_parse_tutoring_pricing(self):
        pricing = parse_tutoring_pricing()
        assert isinstance(pricing, dict)
        assert "$55" in pricing["hourly_rate"]
        assert "$500" in pricing["bundle_10_sessions"]
        assert "Sibling" in pricing["sibling_discount"]
        assert "$50" in pricing["monthly_subscription"]
        assert "tutoring.html#book" in pricing["booking_url"]

    def test_parse_tutoring_courses_all(self):
        courses = parse_tutoring_courses()
        assert len(courses) >= 4
        titles = [c["title"] for c in courses]
        assert any("Programming" in t or "Python" in t for t in titles)
        assert any("AI" in t or "Machine Learning" in t for t in titles)

    def test_parse_tutoring_courses_filtered(self):
        py_courses = parse_tutoring_courses(topic_filter="python")
        assert len(py_courses) > 0
        for c in py_courses:
            text = (c["title"] + " " + c.get("description", "")).lower()
            assert "python" in text or "programming" in text

    def test_parse_portfolio_projects(self):
        projects = parse_portfolio_projects()
        assert len(projects) >= 2
        titles = [p["title"] for p in projects]
        assert any("Playwright" in t for t in titles)
        assert any("Student Grader" in t for t in titles)
        # Verify GitHub URLs are present
        assert any("github.com" in p.get("github", "") for p in projects)

    def test_parse_credentials(self):
        creds = parse_credentials()
        assert creds["full_name"] == "Faruk Hasan"
        degrees = [e["degree"] for e in creds["education"]]
        assert any("Master" in d and "Loyola Marymount" in e["institution"] for d, e in zip(degrees, creds["education"]))
        assert any("Bachelor" in d and "Queen Mary" in e["institution"] for d, e in zip(degrees, creds["education"]))

    def test_search_site_content(self):
        results = search_site_content("Playwright testing")
        assert isinstance(results, list)
        assert len(results) > 0
        assert any("playwright" in r["snippet"].lower() for r in results)


class TestMCPToolsSchemaAndDispatcher:
    def test_groq_tools_schema_structure(self):
        assert len(GROQ_TOOLS) == 5
        names = [t["function"]["name"] for t in GROQ_TOOLS]
        assert "get_tutoring_details" in names
        assert "get_portfolio_projects" in names
        assert "get_booking_and_contact_info" in names
        assert "get_faruk_credentials" in names
        assert "search_website_content" in names

    def test_execute_tool_call_tutoring(self):
        t0 = time.time()
        res = execute_tool_call("get_tutoring_details", {"course_topic": "python"})
        dur = time.time() - t0

        assert "pricing" in res
        assert "$55" in res["pricing"]["hourly_rate"]
        assert dur < 0.1, f"Parser execution too slow: {dur:.4f}s"

    def test_execute_tool_call_projects(self):
        res = execute_tool_call("get_portfolio_projects", {"category": "automation"})
        assert "projects" in res
        assert len(res["projects"]) > 0

    def test_execute_tool_call_booking(self):
        res = execute_tool_call("get_booking_and_contact_info")
        assert "https://faruk-hasan.com/tutoring/tutoring.html#book" in res["booking_url"]

    def test_execute_tool_call_credentials(self):
        res = execute_tool_call("get_faruk_credentials")
        assert res["full_name"] == "Faruk Hasan"

    def test_execute_tool_call_unknown(self):
        res = execute_tool_call("non_existent_tool")
        assert "error" in res
