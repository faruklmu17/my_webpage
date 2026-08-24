# import gradio as gr
# import requests
# import json
# import re
# import os
# import numpy as np
# from typing import Optional
# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# from fastapi import BackgroundTasks
# from fastapi.requests import Request
# from fastapi.responses import JSONResponse, PlainTextResponse

# # Force Rebuild: 2026-03-06 09:10
# print("=== STARTING APP ===")

# # =========================
# # Configuration
# # =========================
# GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
# SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "").strip()
# MODEL_NAME = "openai/gpt-oss-20b"
# print(f"GROQ_API_KEY={'SET' if GROQ_API_KEY else 'MISSING'}")

# # =========================
# # Cache & RAG
# # =========================
# class ChatbotCache:
#     def __init__(self, config_file="cache_config.json"):
#         try:
#             with open(config_file, "r", encoding="utf-8") as f:
#                 config = json.load(f)
#         except:
#             config = {}
#         self.cache = config.get("cache_responses", {})

#     def find(self, message: str) -> Optional[str]:
#         msg = re.sub(r"[^\w\s]", "", message.lower().strip())
#         for k, v in self.cache.items():
#             if re.sub(r"[^\w\s]", "", k.lower().strip()) == msg:
#                 return v
#         return None

# GLOBAL_CACHE = ChatbotCache()

# try:
#     with open("faruk_context.md", "r", encoding="utf-8") as f:
#         CONTENT = f.read()
#     CHUNKS = [CONTENT[i:i+800] for i in range(0, len(CONTENT), 600)]
#     MODEL = SentenceTransformer('all-MiniLM-L6-v2')
#     EMBEDDINGS = MODEL.encode(CHUNKS)
#     print("RAG loaded")
# except Exception as e:
#     CHUNKS, MODEL, EMBEDDINGS = [], None, []
#     print(f"RAG skipped: {e}")

# def get_context(query):
#     if not MODEL or not CHUNKS:
#         return ""
#     q_emb = MODEL.encode([query])
#     sims = cosine_similarity(q_emb, EMBEDDINGS)[0]
#     return CHUNKS[np.argmax(sims)] if np.max(sims) > 0.2 else ""

# def call_groq(messages):
#     r = requests.post(
#         "https://api.groq.com/openai/v1/chat/completions",
#         headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
#         json={"model": MODEL_NAME, "messages": messages, "temperature": 0.5},
#         timeout=30
#     )
#     print(f"[GROQ] status={r.status_code}")
#     return r.json()["choices"][0]["message"]["content"]

# # =========================
# # Chat function
# # =========================
# def chat_fn(user_message, history):
#     print(f"[CHAT] {user_message[:50]!r}")
#     cached = GLOBAL_CACHE.find(user_message)
#     if cached:
#         return "", history + [{"role": "user", "content": user_message},
#                                {"role": "assistant", "content": f"⚡ {cached}"}]
#     context = get_context(user_message)
#     system = f"You are Faruk's assistant. Context: {context}\nKeep it brief (2-3 sentences)."
#     msgs = [{"role": "system", "content": system}]
#     for h in history[-5:]:
#         if isinstance(h, dict):
#             msgs.append({"role": h["role"], "content": str(h["content"])})
#     msgs.append({"role": "user", "content": user_message})
#     try:
#         reply = call_groq(msgs)
#     except Exception as e:
#         reply = f"Error: {e}"
#         print(f"[GROQ ERROR] {e}")
#     return "", history + [{"role": "user", "content": user_message},
#                            {"role": "assistant", "content": reply}]

# # =========================
# # Gradio UI
# # =========================
# custom_css = """
# .gradio-container { background: linear-gradient(135deg, #FFF5E1 0%, #FFD1A9 50%, #FF9E68 100%) !important; }
# .chip-btn { border-radius: 20px !important; background: rgba(255,255,255,0.4) !important;
#             font-size: 13px !important; border: 1px solid rgba(0,0,0,0.1) !important; color: #333 !important; }
# .chip-btn:hover { background: rgba(255,255,255,0.8) !important; }
# """
# with gr.Blocks(css=custom_css, title="Faruk's Assistant") as demo:
#     gr.HTML("<div style='text-align:center;padding:20px'><h2 style='margin:0; color: #1A237E;'>Hello, I'm Faruk's Assistant</h2></div>")
#     chatbot = gr.Chatbot(type="messages", show_label=False)
#     with gr.Row():
#         msg = gr.Textbox(placeholder="Ask me anything...", show_label=False, scale=9)
#         btn = gr.Button("↑", scale=1, variant="primary")
#     with gr.Row():
#         btn1 = gr.Button("👋 Who is Faruk?",              elem_classes="chip-btn", size="sm")
#         btn2 = gr.Button("📚 Courses",                    elem_classes="chip-btn", size="sm")
#         btn3 = gr.Button("🛠️ Skills",                     elem_classes="chip-btn", size="sm")

#     msg.submit(chat_fn, [msg, chatbot], [msg, chatbot])
#     btn.click(chat_fn,  [msg, chatbot], [msg, chatbot])
#     btn1.click(lambda: "Who is Faruk?",                outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])
#     btn2.click(lambda: "What courses do you teach?",   outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])
#     btn3.click(lambda: "What are your technical skills?", outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])

# # =========================
# # Inject Slack routes into Gradio's internal FastAPI app
# # Must happen BEFORE demo.launch()
# # =========================
# @demo.app.post("/slack/events")
# async def slack_events(request: Request, background_tasks: BackgroundTasks):
#     try:
#         data = await request.json()
#         print(f"[SLACK] type={data.get('type')}")
#         if data.get("type") == "url_verification":
#             return PlainTextResponse(data.get("challenge"))
#         if data.get("type") == "event_callback":
#             event = data.get("event", {})
#             if event.get("type") == "message" and not event.get("bot_id") and not event.get("subtype"):
#                 background_tasks.add_task(respond_to_slack, event.get("text", ""), event.get("channel", ""))
#     except Exception as e:
#         print(f"[SLACK ERROR] {e}")
#     return JSONResponse({"ok": True})

# @demo.app.get("/slack/events")
# async def slack_events_get():
#     return PlainTextResponse("Slack endpoint active")

# def respond_to_slack(text: str, channel: str):
#     context = get_context(text)
#     system = f"You are Faruk's assistant. Context: {context}\nKeep it brief (2-3 sentences)."
#     try:
#         reply = call_groq([{"role": "system", "content": system}, {"role": "user", "content": text}])
#     except Exception as e:
#         reply = "Sorry, I can't connect right now!"
#         print(f"[SLACK GROQ ERROR] {e}")
#     if SLACK_BOT_TOKEN:
#         requests.post("https://slack.com/api/chat.postMessage",
#             headers={"Authorization": f"Bearer {SLACK_BOT_TOKEN}", "Content-Type": "application/json"},
#             json={"channel": channel, "text": reply}, timeout=10)

# # =========================
# # Launch — Gradio manages all startup/lifecycle correctly
# # =========================
# demo.launch(server_name="0.0.0.0", server_port=7860)

import os
import re
import json
import numpy as np
import requests
import gradio as gr
import fastapi
from typing import Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import BackgroundTasks, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from gradio import mount_gradio_app.    

print("=== STARTING APP ===")

# =========================
# Configuration
# =========================
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "").strip()
MODEL_NAME = "openai/gpt-oss-20b"

print(f"GROQ_API_KEY={'SET' if GROQ_API_KEY else 'MISSING'}")
print(f"SLACK_BOT_TOKEN={'SET' if SLACK_BOT_TOKEN else 'MISSING'}")
print(f"MODEL_NAME={MODEL_NAME}")

# =========================
# Cache
# =========================
class ChatbotCache:
    def __init__(self, config_file="cache_config.json"):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        except Exception:
            config = {}
        self.cache = config.get("cache_responses", {})

    def find(self, message: str) -> Optional[str]:
        msg = re.sub(r"[^\w\s]", "", message.lower().strip())
        for k, v in self.cache.items():
            if re.sub(r"[^\w\s]", "", k.lower().strip()) == msg:
                return v
        return None

GLOBAL_CACHE = ChatbotCache()

# =========================
# RAG
# =========================
try:
    with open("faruk_context.md", "r", encoding="utf-8") as f:
        CONTENT = f.read()
    CHUNKS = [CONTENT[i:i+1200] for i in range(0, len(CONTENT), 600)]
    MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    EMBEDDINGS = MODEL.encode(CHUNKS)
    print("RAG loaded")
except Exception as e:
    CHUNKS, MODEL, EMBEDDINGS = [], None, []
    print(f"RAG skipped: {e}")

def get_context(query: str) -> str:
    if MODEL is None or not CHUNKS:
        return ""
    q_emb = MODEL.encode([query])
    sims = cosine_similarity(q_emb, EMBEDDINGS)[0]
    return CHUNKS[np.argmax(sims)] if np.max(sims) > 0.2 else ""

# =========================
# Groq
# =========================
def call_groq(messages):
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL_NAME,
            "messages": messages,
            "temperature": 0.5,
        },
        timeout=30,
    )
    print(f"[GROQ] status={r.status_code}")
    print(f"[GROQ] body={r.text[:800]}")
    r.raise_for_status()
    data = r.json()
    return data["choices"][0]["message"]["content"]

def build_reply(user_message: str, history: list = None) -> str:
    cached = GLOBAL_CACHE.find(user_message)
    if cached:
        return f"⚡ {cached}"

    # Extract search query based on recent conversational turn for context retrieval
    search_query = user_message
    if history and len(history) > 0:
        last_user_msgs = [h["content"] for h in history if hasattr(h, 'get') and h.get("role") == "user"]
        if last_user_msgs:
            search_query = f"{last_user_msgs[-1]} {user_message}"

    context = get_context(search_query)
    system = (
        f"You are the AI Assistant for Faruk Hasan. You must clearly act as his assistant, NOT as Faruk. "
        f"The provided context is written from Faruk's perspective (using 'I' and 'my'), but you MUST translate it "
        f"to speak about him in the third person (using 'Faruk', 'he', 'his'). "
        f"FACTUAL ACCURACY IS PARAMOUNT: Faruk earned his Bachelor's in the UK and his Master's in the USA. Do not mix these up. "
        f"CRITICAL: If someone asks how to contact Faruk or book a session, you MUST provide this link: https://faruk-hasan.com/tutoring/tutoring.html#book "
        f"If the user just greets you, greet them back as his assistant and ask how you can help them learn about Faruk. "
        f"DO NOT invent or make up any life updates, feelings, tasks, or events. "
        f"Read the context carefully. If the context does not contain the answer to a question, say 'I don't know'. "
        f"Context: {context}\nCRITICAL: Keep your response extremely concise (MAX 1-2 SHORT SENTENCES)."
    )

    messages = [{"role": "system", "content": system}]
    if history:
        for h in history[-6:]: # Include the last 3 pairs of messages
            if isinstance(h, dict) and 'role' in h and 'content' in h:
                messages.append({"role": h["role"], "content": str(h["content"])})
            elif isinstance(h, tuple) or isinstance(h, list):  # Fallback for old Gradio versions
                messages.append({"role": "user", "content": str(h[0])})
                messages.append({"role": "assistant", "content": str(h[1])})

    messages.append({"role": "user", "content": user_message})

    return call_groq(messages)

# =========================
# Gradio chat
# =========================
def chat_fn(user_message, history):
    print(f"[CHAT] {user_message[:50]!r}")
    history = history or []
    try:
        reply = build_reply(user_message, history)
    except Exception as e:
        reply = f"Error: {e}"
        print(f"[CHAT ERROR] {e}")

    return "", history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": reply},
    ]

# =========================
# Slack reply
# =========================
SLACK_MEMORY = {}

def respond_to_slack(text: str, channel: str, thread_ts: str = None):
    try:
        cleaned_text = re.sub(r"<@[\w]+>\s*", "", text).strip()
        if not cleaned_text:
            cleaned_text = "Hello"
            
        history_key = f"{channel}_{thread_ts}"
        history = SLACK_MEMORY.get(history_key, [])
        
        reply = build_reply(cleaned_text, history)
        
        history.append({"role": "user", "content": cleaned_text})
        history.append({"role": "assistant", "content": reply})
        SLACK_MEMORY[history_key] = history[-6:]
        
    except Exception as e:
        reply = "Sorry, I can't connect right now!"
        print(f"[SLACK GROQ ERROR] {e}")

    if SLACK_BOT_TOKEN:
        payload = {"channel": channel, "text": reply}
        if thread_ts:
            payload["thread_ts"] = thread_ts
            
        r = requests.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        print(f"[SLACK POST] status={r.status_code}")
        print(f"[SLACK POST] body={r.text[:500]}")

# =========================
# UI
# =========================
custom_css = """
.gradio-container { background: linear-gradient(135deg, #FFF5E1 0%, #FFD1A9 50%, #FF9E68 100%) !important; }

/* The Glassmorphism Action Bar Wrapper */
#chat-wrapper { 
    display: flex !important;
    flex-direction: column !important;
    border: 1px solid rgba(26, 35, 126, 0.2);
    border-radius: 12px;
    overflow: hidden;
    background: white; /* Clean background for the whole unit */
    margin-bottom: 0px; /* Removed margin */
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.chatbot { 
    border: none !important; /* Remove internal border */
    flex-grow: 1 !important;
}

#chips-row {
    padding: 4px 0px;
    background: transparent !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    gap: 4px !important;
    justify-content: center !important;
    border-bottom: 1px solid rgba(0,0,0,0.05) !important;
    scrollbar-width: none;
}

#chips-row::-webkit-scrollbar { display: none; }

.chip-btn { 
    border-radius: 10px !important; 
    background: white !important;
    font-size: 10px !important; 
    border: 1px solid rgba(26, 35, 126, 0.1) !important; 
    color: #1A237E !important;
    padding: 2px 6px !important; 
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
    font-weight: 500 !important;
}

.chip-btn:hover { 
    background: #1A237E !important; 
    color: white !important;
}

/* Premium Send Button */
.send-btn {
    background: #1A237E !important;
    color: white !important;
    font-weight: bold !important;
    border-radius: 8px !important;
    font-size: 12px !important;
}

h2, h3 { color: #1A237E !important; font-weight: bold !important; }
"""

with gr.Blocks(css=custom_css, title="Faruk's Assistant") as demo:
    gr.HTML("<div style='text-align:center;padding:0px;line-height:1;'><h3 style='margin:0; font-size: 14px; color: #1A237E;'>Hello, I'm Faruk's Assistant</h3></div>")
    
    with gr.Column(elem_id="chat-wrapper"):
        with gr.Row(elem_id="chips-row"):
            btn1 = gr.Button("👋 Faruk", elem_classes="chip-btn", size="sm")
            btn2 = gr.Button("📚 Courses", elem_classes="chip-btn", size="sm")
            btn3 = gr.Button("🛠️ Skills", elem_classes="chip-btn", size="sm")
            btn4 = gr.Button("📞 Contact", elem_classes="chip-btn", size="sm")
        chatbot = gr.Chatbot(type="messages", show_label=False, height=180)

    with gr.Row():
        msg = gr.Textbox(placeholder="Ask me...", show_label=False, scale=8)
        btn = gr.Button("Send ↑", scale=2, variant="primary", elem_classes="send-btn")

    msg.submit(chat_fn, [msg, chatbot], [msg, chatbot])
    btn.click(chat_fn, [msg, chatbot], [msg, chatbot])

    btn1.click(lambda: "Who is Faruk?", outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])
    btn2.click(lambda: "What courses do you teach?", outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])
    btn3.click(lambda: "What are your technical skills?", outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])
    btn4.click(lambda: "How can I contact Faruk or book a session?", outputs=msg).then(chat_fn, [msg, chatbot], [msg, chatbot])

# # =========================
# # FastAPI + Slack
# # =========================
# api = fastapi.FastAPI()

# @api.get("/slack/events")
# async def slack_events_get():
#     return PlainTextResponse("Slack endpoint active")

# @api.post("/slack/events")
# async def slack_events(request: Request, background_tasks: BackgroundTasks):
#     try:
#         data = await request.json()
#         print(f"[SLACK] payload={data}")

#         if data.get("type") == "url_verification":
#             return PlainTextResponse(data.get("challenge", ""))

#         if data.get("type") == "event_callback":
#             event = data.get("event", {})
#             event_type = event.get("type")
#             text = event.get("text", "")
#             channel = event.get("channel", "")

#             print(f"[SLACK EVENT] type={event_type} channel={channel} text={text}")

#             if event.get("bot_id") or event.get("subtype"):
#                 return JSONResponse({"ok": True})

#             if event_type in ["app_mention", "message"] and text and channel:
#                 background_tasks.add_task(respond_to_slack, text, channel)

#     except Exception as e:
#         print(f"[SLACK ERROR] {e}")

#     return JSONResponse({"ok": True})

# app = mount_gradio_app(api, demo, path="/")

# =========================
# FastAPI + Slack
# =========================
api = fastapi.FastAPI()

@api.get("/")
async def home():
    return PlainTextResponse("App is running. Open /gradio for the chat UI.")

@api.get("/slack/events")
async def slack_events_get():
    return PlainTextResponse("Slack endpoint active")

@api.post("/slack/events")
async def slack_events(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        print(f"[SLACK] payload={data}")

        if data.get("type") == "url_verification":
            return PlainTextResponse(data.get("challenge", ""))

        if data.get("type") == "event_callback":
            event = data.get("event", {})
            event_type = event.get("type")
            text = event.get("text", "")
            channel = event.get("channel", "")
            thread_ts = event.get("thread_ts", event.get("ts"))

            print(f"[SLACK EVENT] type={event_type} channel={channel} thread_ts={thread_ts} text={text}")

            if event.get("bot_id") or event.get("subtype"):
                return JSONResponse({"ok": True})

            if (event_type == "app_mention" or (event_type == "message" and event.get("channel_type") == "im")) and text and channel:
                background_tasks.add_task(respond_to_slack, text, channel, thread_ts)

    except Exception as e:
        print(f"[SLACK ERROR] {e}")

    return JSONResponse({"ok": True})

app = mount_gradio_app(api, demo, path="/gradio")# redeploy
