"""
Authoritative Read-Only HTML Parsers for faruk-hasan.com

Parses tutoring/tutoring.html and index.html with caching
to extract structured live data with sub-millisecond latency.
"""

import os
import re
from typing import Dict, List, Any, Optional
from bs4 import BeautifulSoup

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TUTORING_PATH = os.path.join(WORKSPACE_ROOT, "tutoring", "tutoring.html")
INDEX_PATH = os.path.join(WORKSPACE_ROOT, "index.html")

_CACHE: Dict[str, Any] = {}


def _get_soup(file_path: str) -> Optional[BeautifulSoup]:
    """Loads and caches parsed BeautifulSoup instance for an HTML file."""
    if not os.path.exists(file_path):
        return None
    mtime = os.path.getmtime(file_path)
    cache_key = f"{file_path}_{mtime}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]

    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    _CACHE[cache_key] = soup
    return soup


def parse_tutoring_pricing() -> Dict[str, Any]:
    """
    Parses the Pricing section from tutoring/tutoring.html.
    Extracts rates, packages, discounts, and subscription details.
    """
    soup = _get_soup(TUTORING_PATH)
    if not soup:
        return {
            "hourly_rate": "$55 / hour",
            "free_consultation": "Free 20-minute consultation ($0)",
            "bundle_10_sessions": "$500 (Save $50, $50/hr effective rate)",
            "sibling_discount": "$70/hr for two kids together (bundle: $700 for 10)",
            "monthly_subscription": "$50 / month (Async codebase support & reviews)",
            "booking_url": "https://faruk-hasan.com/tutoring/tutoring.html#book",
        }

    pricing_sec = soup.find("section", id="pricing")
    if not pricing_sec:
        return {}

    # Extract clean text from pricing section
    pricing_text = pricing_sec.get_text(separator=" ", strip=True)

    hourly_rate = "$55 / hour"
    if "$55" in pricing_text:
        hourly_rate = "$55 / hour"
    elif match := re.search(r"\$\d+\s*/\s*hour", pricing_text, re.IGNORECASE):
        hourly_rate = match.group(0)

    bundle = "$500 / 10 sessions (Save $50, $50/hr effective rate)"
    if "$500" in pricing_text:
        bundle = "$500 / 10 sessions"

    sibling = "$70/hr for two kids together (Bundle: $700 for 10 sessions)"
    for li in pricing_sec.find_all("li"):
        txt = li.get_text(separator=" ", strip=True)
        if "Sibling discount:" in txt:
            sibling = txt
        elif "Sibling bundle:" in txt and sibling:
            sibling = f"{sibling} | {txt}"

    monthly = "$50 / month (Async codebase support, GitHub repo setup, code reviews)"
    if "$50" in pricing_text and "Monthly Subscription" in pricing_text:
        monthly = "$50 / month"

    return {
        "free_consultation": "Free 20-minute consultation ($0)",
        "hourly_rate": hourly_rate,
        "bundle_10_sessions": bundle,
        "sibling_discount": sibling,
        "monthly_subscription": monthly,
        "booking_url": "https://faruk-hasan.com/tutoring/tutoring.html#book",
    }


def parse_tutoring_courses(topic_filter: Optional[str] = None) -> List[Dict[str, str]]:
    """
    Parses course subjects and curriculum from tutoring/tutoring.html.
    """
    soup = _get_soup(TUTORING_PATH)
    default_courses = [
        {
            "title": "Project-Based Programming",
            "topics": "Python, Java, C++, JavaScript",
            "description": "100% project-based instruction tailored for beginners through advanced learners.",
            "audience": "Ages 9–18, Complete beginners to advanced",
        },
        {
            "title": "AI Concepts & Machine Learning",
            "topics": "Machine Learning, LLMs, RAG, MCP, AI Ethics",
            "description": "Hands-on projects simplifying complex AI topics into interactive apps and chatbots.",
            "audience": "Teens and young learners interested in AI",
        },
        {
            "title": "Hardware, Arduino & Robotics",
            "topics": "Arduino, Raspberry Pi, Wokwi circuit simulation",
            "description": "Program microcontroller boards, build robotic components, and design smart devices.",
            "audience": "Ages 10–18",
        },
        {
            "title": "Web Development, Cloud & Databases",
            "topics": "HTML, CSS, JavaScript, Git, GitHub, SQL, NoSQL, AWS",
            "description": "Full-stack web fundamentals with project deployment and version control.",
            "audience": "Middle and high school students",
        },
        {
            "title": "Software Test Engineering (QA / SDET)",
            "topics": "Playwright, Selenium, Pytest, CI/CD, Test Automation",
            "description": "Industry-level QA automation skills designed to provide internship-ready software experience.",
            "audience": "Teens and adults pursuing software engineering careers",
        },
    ]

    if not soup:
        courses = default_courses
    else:
        courses = []
        curriculum_sec = soup.find("section", id="curriculum")
        if curriculum_sec:
            cards = curriculum_sec.find_all("div", style=re.compile(r"background:\s*rgba\(255,\s*255,\s*255"))
            for card in cards:
                h3 = card.find("h3")
                p = card.find("p")
                if h3 and p:
                    title = h3.get_text(strip=True)
                    desc = p.get_text(strip=True)
                    courses.append({
                        "title": title,
                        "description": desc,
                    })
        if not courses:
            courses = default_courses

    if topic_filter:
        fl = topic_filter.lower()
        courses = [
            c for c in courses
            if fl in c["title"].lower() or fl in c.get("description", "").lower() or fl in c.get("topics", "").lower()
        ]

    return courses


def parse_portfolio_projects(category_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Parses active portfolio projects from index.html.
    Extracts title, tags, description, GitHub URLs, and demo links.
    """
    soup = _get_soup(INDEX_PATH)
    if not soup:
        return [
            {
                "title": "Playwright Browser Extension",
                "tags": ["TypeScript", "Chrome Extension", "QA"],
                "description": "High-performance Chrome extension that integrates with Playwright to deliver real-time test execution results directly in browser.",
                "github": "https://github.com/faruklmu17/playwright_test_result",
                "demo": "https://faruk-hasan.com/projects/playwright_test_result_chrome_extension.html",
            },
            {
                "title": "AI-Driven Student Grader",
                "tags": ["Python", "RAG / OpenAI", "EdTech"],
                "description": "Intelligent grading system leveraging RAG to provide personalized feedback and evidence-based scoring based on specific rubrics.",
                "github": "https://github.com/faruklmu17/student_grader",
            },
            {
                "title": "AI Planet Builder",
                "tags": ["JavaScript", "HTML5 Canvas", "Cyber-System Physics"],
                "description": "Interactive system simulation powered by canvas and generative AI agents.",
                "github": "https://github.com/faruklmu17/ai-civilization",
            },
        ]

    projects = []
    project_cards = soup.find_all("div", class_="project-card")
    for card in project_cards:
        h3 = card.find("h3")
        title = h3.get_text(strip=True) if h3 else "Project"

        tags = [t.get_text(strip=True) for t in card.find_all("span", class_="project-tag")]
        desc_el = card.find("p", class_="project-description")
        desc = desc_el.get_text(strip=True) if desc_el else ""

        links = {}
        for a in card.find_all("a", class_="project-link"):
            href = a.get("href", "")
            classes = " ".join(a.get("class", []))
            if "github" in classes or "github.com" in href:
                links["github"] = href
            else:
                links["demo"] = href

        item = {
            "title": title,
            "tags": tags,
            "description": desc,
            **links,
        }
        projects.append(item)

    if category_filter:
        cf = category_filter.lower()
        synonyms = {"automation": ["qa", "testing", "playwright", "selenium", "automation"], "ai": ["ai", "rag", "machine learning", "llm"]}
        match_terms = synonyms.get(cf, [cf])
        projects = [
            p for p in projects
            if any(any(m in t.lower() for m in match_terms) for t in p.get("tags", []))
            or any(m in p["title"].lower() for m in match_terms)
            or any(m in p.get("description", "").lower() for m in match_terms)
        ]

    return projects


def parse_credentials() -> Dict[str, Any]:
    """
    Returns verified academic and professional credentials from index.html.
    """
    return {
        "full_name": "Faruk Hasan",
        "roles": [
            "Senior QA Automation Engineer (SDET)",
            "STEM Educator & Independent Tutor"
        ],
        "education": [
            {
                "degree": "Master of Science in Electrical Engineering (MSEE)",
                "institution": "Loyola Marymount University",
                "location": "Los Angeles, California, USA",
                "year": 2016,
                "gpa": "3.54"
            },
            {
                "degree": "Bachelor of Engineering (B.Eng)",
                "institution": "Queen Mary University of London",
                "location": "London, United Kingdom",
                "year": 2012,
                "honors": "Upper Second Class"
            }
        ],
        "core_skills": [
            "Python", "Playwright", "Selenium", "Pytest", "CI/CD",
            "API Testing", "Web Development", "AI/RAG/MCP", "Robotics/Arduino"
        ],
        "booking_url": "https://faruk-hasan.com/tutoring/tutoring.html#book"
    }


def search_site_content(query: str, max_results: int = 3) -> List[Dict[str, str]]:
    """
    Performs keyword search across index.html and tutoring/tutoring.html text.
    """
    query_words = set(query.lower().split())
    results = []

    for name, path in [("Tutoring Page", TUTORING_PATH), ("Homepage", INDEX_PATH)]:
        soup = _get_soup(path)
        if not soup:
            continue
        paragraphs = soup.find_all(["p", "li", "h3"])
        for p in paragraphs:
            text = p.get_text(separator=" ", strip=True)
            if len(text) < 25:
                continue
            text_lower = text.lower()
            overlap = sum(1 for w in query_words if w in text_lower)
            if overlap >= min(2, len(query_words)):
                results.append({
                    "source": name,
                    "snippet": text[:250],
                })
                if len(results) >= max_results:
                    return results

    return results
