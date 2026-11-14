# Faruk Hasan — Portfolio Website & AI Assistant

Personal website (`https://faruk-hasan.com/`), tutoring portal, interactive projects, and the **Faruk AI Assistant** chatbot.

---

## Key Components

- **Static Portfolio & Tutoring Site:** Built with HTML, CSS, JavaScript, and Node.js tooling (career, courses, blog, interactive games/tools, and tutoring booking).
- **AI Chatbot (`agent/` & `ai_chatbot/hf_deployment/`):** Conversational assistant deployed on Hugging Face Spaces using **FastAPI**, **Gradio**, **LangGraph**, **Groq** (`llama-3.1-8b-instant`), and the **Slack Events API**.
- **Automated Testing & Evaluations (`tests/`):** End-to-end website tests with **Playwright** and multi-turn chatbot unit/E2E/evaluation suites with **pytest** and **LangSmith**.

---

## AI Chatbot Architecture (LangGraph + LangSmith)

The portfolio website embeds the **Faruk AI Assistant** (deployed on Hugging Face Spaces with **FastAPI**, **Gradio**, and **Slack Events API**). Incoming messages flow through four stages in `ai_chatbot/hf_deployment/app.py`:

1. **Pre-LLM Guardrails:** Blocks abusive inputs and warns against sharing sensitive PII (credit card numbers, SSNs, passwords).
2. **Smart Cache Lookup (`cache_config.json`):** Serves instant responses for common deterministic questions.
3. **LangGraph `StateGraph` Workflow (`agent/graph.py`):** Handles multi-turn `CLASS_INQUIRY`, `PROJECT_HELP`, and `ASSIGNMENT_HELP` conversations with persistent conversation state:
   ```text
   START → extract_information → classify_intent → route_intent
     ├── GENERAL_QUESTION → general_response → END
     ├── UNKNOWN          → clarification → END
     └── [CLASS_INQUIRY / PROJECT_HELP / ASSIGNMENT_HELP]
           → check_missing_information → route_missing_information
               ├── missing info  → generate_followup_question → END
               └── complete info → recommend_class → generate_response → END
   ```
4. **Groq RAG Fallback:** Answers general questions about Faruk's background, portfolio, and resources using `faruk_context.md` and `llama-3.1-8b-instant`.

### Chatbot Endpoints (`ai_chatbot/hf_deployment/app.py` & `agent/api.py`)

- `GET /` — Health check / landing message
- `GET /gradio` — Mounted Gradio web chat interface
- `POST /api/chat` & `POST /chat` — FastAPI endpoints invoking the compiled LangGraph workflow
- `GET / POST /slack/events` — Slack Events API webhook (`url_verification`, `app_mention`, and direct `message` events)

### LangSmith Evaluations (`tests/agent/`)

Benchmarks multi-turn state extraction, repetition prevention, and course recommendation accuracy against the `faruk-assistant-eval-dataset` dataset on LangSmith.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **AI / Agent Orchestration:** LangGraph, FastAPI, Gradio, Groq API, Sentence Transformers / Scikit-learn
- **Observability & Evals:** LangSmith (`langsmith>=0.10.15`), pytest
- **Browser Testing:** Playwright (`@playwright/test`)
- **Deployment:** GitHub Pages (website) & Docker on Hugging Face Spaces (AI assistant)

---

## Folder Structure

```text
portfolio-website/
├── agent/                          # LangGraph StateGraph, nodes, routing, state & FastAPI router
├── ai_chatbot/
│   └── hf_deployment/              # Hugging Face Spaces deployment (app.py, Dockerfile, requirements.txt)
├── tests/
│   └── agent/                      # LangGraph pytest suite & LangSmith evals (evals/, run_langsmith_eval.py)
├── e2e/                            # Playwright end-to-end website tests
├── index.html                      # Main portfolio page
├── tutoring/                       # Tutoring & course pages
├── package.json                    # Playwright & local serve scripts
└── LANGGRAPH_PLAYBOOK.md           # LangGraph implementation playbook
```

---

## Environment Variables

Create a `.env` file in `portfolio-website/` (or set secrets in Hugging Face Spaces) for the AI assistant and evaluations:

- `GROQ_API_KEY` — Groq API key for LLM inference
- `SLACK_BOT_TOKEN` — Slack bot token for `/slack/events`
- `LANGSMITH_API_KEY` (or `LANGCHAIN_API_KEY`) — Required for LangSmith tracing and running benchmark evaluations

---

## Running & Testing

### Serve the Website Locally
```bash
npm run serve
```

### Run Playwright Tests
```bash
npm test
```

### Run LangGraph Agent Tests
```bash
pytest tests/agent
```

### Run LangSmith Benchmark Evaluations
```bash
python tests/agent/run_langsmith_eval.py
# or via pytest:
pytest tests/agent/test_langsmith_evals.py
```
