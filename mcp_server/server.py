"""
FastMCP Read-Only Server for faruk-hasan.com

Exposes tools via the Model Context Protocol (MCP) standard for AI agents,
IDE assistants, and the website chatbot.
"""

from typing import Optional, Dict, Any, List
from fastmcp import FastMCP
from mcp_server.tools_schema import execute_tool_call

mcp = FastMCP("faruk-portfolio", description="Read-only authoritative tools for faruk-hasan.com")


@mcp.tool()
def get_tutoring_details(course_topic: Optional[str] = None, target_age: Optional[int] = None) -> Dict[str, Any]:
    """
    Fetch up-to-date tutoring rates, packages, discounts, and course offerings.
    """
    args = {}
    if course_topic:
        args["course_topic"] = course_topic
    if target_age:
        args["target_age"] = target_age
    return execute_tool_call("get_tutoring_details", args)


@mcp.tool()
def get_portfolio_projects(category: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch active portfolio projects, tech stacks, live demo links, and GitHub repositories.
    """
    args = {}
    if category:
        args["category"] = category
    return execute_tool_call("get_portfolio_projects", args)


@mcp.tool()
def get_booking_and_contact_info() -> Dict[str, Any]:
    """
    Get official consultation and booking links.
    """
    return execute_tool_call("get_booking_and_contact_info")


@mcp.tool()
def get_faruk_credentials() -> Dict[str, Any]:
    """
    Get verified academic degrees, education history, and SDET experience.
    """
    return execute_tool_call("get_faruk_credentials")


@mcp.tool()
def search_website_content(query: str) -> Dict[str, Any]:
    """
    Full-text search across website pages.
    """
    return execute_tool_call("search_website_content", {"query": query})


if __name__ == "__main__":
    # Runs the MCP server with stdio transport by default
    mcp.run()
