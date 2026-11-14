---
title: Faruk Assistant
emoji: 🤖
colorFrom: yellow
colorTo: red
sdk: docker
pinned: false
app_port: 7860
---

# 🤖 Faruk AI Assistant

Faruk AI Assistant is an AI-powered portfolio, tutoring, and Slack assistant deployed on **Hugging Face Spaces** using **FastAPI**, **Gradio**, **LangGraph**, **LangSmith**, and the **Groq API**.

- **Public Chat UI:** `/gradio`
- **Website:** `https://faruk-hasan.com/`

---

## Architecture & Request Routing

Incoming messages from Gradio (`chat_fn`) or Slack (`respond_to_slack`) flow through four stages in `app.py`:

1. **Pre-LLM Guardrails:** Blocks abusive content and warns against sharing sensitive PII (e.g., card numbers, SSNs, passwords).
2. **Smart Cache Lookup (`cache_config.json`):** Returns instant responses for common deterministic questions.
3. **LangGraph `StateGraph` Workflow (`agent/graph.py`):** Handles multi-turn `CLASS_INQUIRY`, `PROJECT_HELP`, and `ASSIGNMENT_HELP` conversations with persistent state:
   - `extract_information` → `classify_intent` → `route_intent`
   - `check_missing_information` → `route_missing_information`
   - `generate_followup_question` (when details like age/experience are missing) or `recommend_class` → `generate_response`
4. **Groq RAG Fallback:** Uses `faruk_context.md` and `llama-3.1-8b-instant` via the Groq API for general questions.

---

## API Endpoints

- `GET /` — Health check / landing message
- `GET /gradio` — Mounted Gradio web chat interface
- `POST /api/chat` & `POST /chat` — FastAPI endpoints exposed by `agent/api.py` for invoking the compiled LangGraph workflow
- `GET / POST /slack/events` — Slack Events API webhook (`url_verification`, `app_mention`, and direct `message` events)

---

## Tech Stack

- **Workflow Orchestration:** LangGraph (`langgraph`)
- **Observability & Evaluation:** LangSmith (`langsmith>=0.10.15`)
- **Backend & UI:** FastAPI, Uvicorn, Gradio (`gradio==5.42.0`), Pydantic
- **LLM & Embeddings:** Groq API (`llama-3.1-8b-instant`), `sentence-transformers`, `scikit-learn`
- **Deployment:** Docker on Hugging Face Spaces (port `7860`)

---

## Environment Variables

Configure these secrets in Hugging Face Spaces (or `.env` locally):

- `GROQ_API_KEY` — Groq API key
- `SLACK_BOT_TOKEN` — Slack bot OAuth token
- `LANGSMITH_API_KEY` (or `LANGCHAIN_API_KEY`) — LangSmith API key for tracing and running evaluations

---

## LangSmith Evaluations

From `portfolio-website/`, run the multi-turn benchmark suite against the `faruk-assistant-eval-dataset` dataset on LangSmith (evaluates state extraction, repetition prevention, and course recommendation accuracy):

```bash
python tests/agent/run_langsmith_eval.py
# or:
pytest tests/agent/test_langsmith_evals.py
```
