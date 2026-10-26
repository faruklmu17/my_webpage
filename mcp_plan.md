# Read-Only Website MCP Server & Chatbot Integration Plan

## Objective
Build a lightweight, **Read-Only Model Context Protocol (MCP) Server** for `faruk-hasan.com`. This server enables the Faruk AI Assistant to dynamically query live, authoritative website data (tutoring courses, pricing, bundles, project catalog, booking links, and blog posts) instead of relying solely on static markdown snapshots. We will also build an automated **DeepEval Tool-Calling Evaluation Suite** to verify that the agent selects tools accurately, passes valid arguments, and produces grounded answers.

---

## 1. Architectural Overview & Token Economics

```text
┌────────────────────────────────────────────────────────┐
│                   Website Visitor                       │
└───────────────────────────┬────────────────────────────┘
                            │ User Message
                            ▼
┌────────────────────────────────────────────────────────┐
│         Faruk Chatbot (ai_chatbot/app.py)              │
│  - Pre-LLM Guardrails (Scope, Toxicity, PII)           │
│  - Groq LLM (openai/gpt-oss-20b with Tool Calling)     │
└─────────────┬───────────────────────────▲──────────────┘
              │ 1. Tool Call Query        │ 3. Tool Result
              ▼                           │
┌─────────────────────────────────────────┴──────────────┐
│        Read-Only Website MCP Server (Python)           │
│  - Exposes FastMCP / Python MCP SDK Tools              │
│  - Read-Only parsers for HTML / site assets            │
└─────────────┬──────────────────────────────────────────┘
              │ 2. Read live data (zero mutations)
              ▼
┌────────────────────────────────────────────────────────┐
│               Authoritative Site Pages                 │
│  - tutoring/tutoring.html (Pricing, bundles, courses)   │
│  - index.html (Bio, credentials, experience)           │
│  - Projects, quizzes, and contact links                │
└────────────────────────────────────────────────────────┘
```

### Why This Saves Tokens:
- **Current RAG Setup**: Slices 1,200-character chunks from `faruk_context.md` and dumps them into the system prompt on *every* call (~500–800 input tokens).
- **With MCP Tools**: The system prompt stays lean (~120 tokens). For general questions (*"Where did Faruk study?"*), 0 tools are called. For pricing inquiries, the tool returns a compact ~30-token JSON payload (`{"rate": "$75/hr", "bundle": "$675"}`) instead of a 300-word paragraph.
- **Estimated Savings**: **~50–65% reduction in average input tokens per turn**.

---

## 2. Read-Only MCP Tools Specification

The MCP server will expose the following 5 dedicated, read-only tools:

### Tool 1: `get_tutoring_details`
- **Description**: *"Call this tool when the user asks about tutoring rates, hourly pricing, bundles, sibling discounts, or course offerings (Python, Web Dev, AI, Robotics, QA Automation)."*
- **Parameters**:
  - `course_topic` *(optional, string)*: Filter by topic (`"python"`, `"web_dev"`, `"ai"`, `"robotics"`, `"qa"`).
  - `target_age` *(optional, integer)*: Student age (e.g., `10`, `14`).
- **Data Source**: Parsed directly from `tutoring/tutoring.html`.

### Tool 2: `get_portfolio_projects`
- **Description**: *"Call this tool when the user asks to see Faruk's projects, GitHub repositories, live software demos, or automation frameworks."*
- **Parameters**:
  - `category` *(optional, string)*: `"automation"`, `"ai"`, `"web"`, `"games"`.
- **Data Source**: Parsed from `index.html` project sections and project metadata.

### Tool 3: `get_booking_and_contact_info`
- **Description**: *"Call this tool when the user asks how to schedule a tutoring session, book a mentoring consultation, or contact Faruk."*
- **Parameters**: None.
- **Data Source**: Official booking anchor tags (`https://faruk-hasan.com/tutoring/tutoring.html#book`).

### Tool 4: `search_website_content`
- **Description**: *"Call this tool to search across site pages for specific or niche topics not covered by dedicated tools."*
- **Parameters**:
  - `query` *(required, string)*: Search keywords.
- **Data Source**: Site HTML indexer (cached text index).

### Tool 5: `get_faruk_credentials`
- **Description**: *"Call this tool when the user asks to verify Faruk's academic degrees, certifications, or professional QA work history."*
- **Parameters**: None.
- **Data Source**: `index.html` verified academic credentials (B.Eng UK, M.S. USA).

---

## 3. DeepEval Tool-Calling Evaluation Suite

Using DeepEval, we will evaluate whether the agent interacts with tools correctly:

### Dimensions Evaluated:
1. **Tool Selection Accuracy**:
   - When asked *"How much is a 10-session tutoring package?"*, does the bot invoke `get_tutoring_details`?
   - When asked *"Show me your Playwright automation projects"*, does it invoke `get_portfolio_projects`?
2. **Argument Correctness**:
   - Are parameters passed with the correct schema and types?
3. **Negative Tool Control (Over-tooling Prevention)**:
   - When asked *"Hi there!"* or *"Where were you born?"*, does the model **avoid** invoking MCP tools?
4. **Output Grounding & Synthesis (GEval)**:
   - Does the final user response accurately reflect the tool's returned data without hallucinating extra discounts or dates?

---

## 4. Implementation Phases & Checklist

### Phase 1: Build the Read-Only MCP Server Core
- [ ] Create `mcp_server/` package in Python.
- [ ] Implement HTML parsing utilities for `tutoring.html` and `index.html` (caching parsed data with TTL).
- [ ] Define FastMCP tool definitions with strict Pydantic schemas.
- [ ] Add standalone unit tests verifying each MCP tool returns accurate, structured JSON.

### Phase 2: Integrate Tool Calling into Chatbot Backend
- [ ] Update `ai_chatbot/hf_deployment/app.py`:
  - Pass MCP tool definitions to Groq chat completions (`tools` parameter).
  - If Groq returns `tool_calls`, execute the corresponding MCP tool function and feed results back into the conversation turn.
  - Retain existing pre-LLM guardrails (scope fast-exit, toxicity filter, PII interceptor) so non-relevant or sensitive queries never trigger tool calls.

### Phase 3: Build DeepEval Tool Call Evaluation Suite
- [ ] Create `tests/ai/test_tool_calling_evaluation.py`.
- [ ] Define test cases covering:
  - Tutoring queries ➔ `get_tutoring_details`
  - Project queries ➔ `get_portfolio_projects`
  - Booking queries ➔ `get_booking_and_contact_info`
  - General chit-chat ➔ No tool calls (negative control)
- [ ] Run automated evaluations and verify pass rates.

### Phase 4: Local Verification & Deployment Readiness
- [ ] Test the full interactive loop locally in Gradio.
- [ ] Verify zero regression across existing 62 evaluation tests.
- [ ] Package server for production deployment.
