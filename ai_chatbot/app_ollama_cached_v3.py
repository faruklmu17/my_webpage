import gradio as gr
import requests
import json
import re
import os
from difflib import SequenceMatcher
from typing import Dict, Optional

# Ollama HTTP API endpoint
API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "faruk-bot"

class ChatbotCache:
    def __init__(self, config_file="cache_config.json"):
        self.config_file = config_file
        self.config = self._load_config()
        self.cache = self.config.get("cache_responses", {})
        self.similarity_threshold = self.config.get("settings", {}).get("similarity_threshold", 0.6)
        self.cache_enabled = self.config.get("settings", {}).get("cache_enabled", True)
        self.cache_indicator = self.config.get("settings", {}).get("cache_indicator", "⚡")
    
    def _load_config(self) -> Dict:
        """Load configuration from JSON file"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), self.config_file)
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Fallback simple cache if file missing
            return {
                "cache_responses": {
                    "who is faruk": "Faruk Hasan is a Senior QA Automation Engineer and STEM educator.",
                    "contact": "You can reach Faruk at faruqmul@gmail.com."
                }, 
                "settings": {}
            }
        except json.JSONDecodeError:
            return {"cache_responses": {}, "settings": {}}
    
    def _normalize_text(self, text: str) -> str:
        return re.sub(r'[^\w\s]', '', text.lower().strip())
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        return SequenceMatcher(None, text1, text2).ratio()
    
    def _contains_keywords(self, message: str, keywords: str) -> bool:
        message_words = set(message.split())
        keyword_words = set(keywords.split())
        return bool(message_words.intersection(keyword_words))
    
    def find_cached_response(self, user_message: str) -> Optional[str]:
        if not self.cache_enabled:
            return None

        normalized_message = self._normalize_text(user_message)

        # 1. Exact match
        for key, response in self.cache.items():
            if self._normalize_text(key) == normalized_message:
                return response

        # 2. Key contained in message
        best_exact_match = None
        best_exact_length = 0
        for key, response in self.cache.items():
            norm_key = self._normalize_text(key)
            if norm_key in normalized_message:
                if len(norm_key) > best_exact_length:
                    best_exact_length = len(norm_key)
                    best_exact_match = response
        if best_exact_match:
            return best_exact_match

        # 3. Fuzzy match
        for key, response in self.cache.items():
            similarity = self._calculate_similarity(normalized_message, self._normalize_text(key))
            if similarity >= self.similarity_threshold:
                return response
        
        return None

def load_faruk_profile():
    try:
        path = os.path.join(os.path.dirname(__file__), "faruk_context.md")
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error loading profile: {e}")
        return ""

def is_faruk_intent(text):
    """Check if the user is asking about Faruk or his work."""
    keywords = [
        "faruk", "hasan", "he", "his", "him", # direct references
        "tutor", "teach", "course", "class", "student", "outschool", "udemy", # teaching
        "qa", "sdet", "automation", "test", "playwright", "selenium", "python", # tech stack
        "job", "work", "career", "experience", "resume", "cv", # professional
        "contact", "email", "reach", # contact
        "github", "youtube", "linkedin" # social
    ]
    norm_text = text.lower()
    return any(k in norm_text for k in keywords)

def chat_with_ollama_conditional(history, user_message):
    if history is None:
        history = []
    
    cache = ChatbotCache()
    
    # 1. Check Cache
    cached_response = cache.find_cached_response(user_message)
    if cached_response:
        history.append((user_message, f"{cache.cache_indicator} {cached_response}"))
        return history, ""

    # 2. Check Intent
    faruk_intent = is_faruk_intent(user_message)
    
    # 3. Prepare Prompt
    system_content = ""
    slow_response_warning = ""

    if faruk_intent:
        profile_text = load_faruk_profile()
        system_content = (
            "You are Faruk Hasan's personal AI assistant. "
            "Use the following profile to answer questions about him:\n\n"
            f"{profile_text}\n\n"
            "Stay relevant to Faruk's life and work. Answer concisely."
        )
    else:
        # Generic Mode
        system_content = (
            "You are a helpful AI assistant. "
            "The user is asking a general question unrelated to Faruk Hasan's specific profile. "
            "Answer politely and concisely."
        )
        slow_response_warning = "\n\n(🐢 *Note: Response generated by the local AI model. Please wait a moment for 'model wake up'...*)"

    messages = [{"role": "system", "content": system_content}]
    
    # Rebuild history
    for user_msg, bot_msg in history:
        # Clean previous bot messages
        clean_bot = re.sub(r'^[⚡🐢]\s*', '', bot_msg).replace("(Note: Response generated by the local AI model. Please wait a moment for 'model wake up'...*)", "").strip()
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": clean_bot})
    
    messages.append({"role": "user", "content": user_message})

    # 4. Call LLM
    try:
        response = requests.post(
            API_URL,
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
            },
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        bot_reply = data.get("message", {}).get("content", "").strip()
        
        if not bot_reply:
            bot_reply = "I'm having trouble responding. Please try again."

        # Append warning if generic
        if slow_response_warning:
            bot_reply += slow_response_warning

    except Exception as e:
        bot_reply = f"Error: {e}"

    history.append((user_message, bot_reply))
    return history, ""

# Build Gradio UI
with gr.Blocks(title="Faruk's Smart Assistant") as demo:
    gr.Markdown(
        """
        ## 🤖 Faruk's Smart Assistant
        
        *   **Specific Questions:** Ask about Faruk, his courses, or QA work for instant answers.
        *   **General Chat:** Ask anything else (Python help, general AI), but note it might take a moment to wake up the model.
        """
    )
    
    chatbot = gr.Chatbot(height=450, show_copy_button=True)
    msg = gr.Textbox(
        label="Your message",
        placeholder="Type here or click a chip below...",
        lines=1
    )
    
    with gr.Row():
        btn_who = gr.Button("👋 Who is Faruk?", size="sm")
        btn_tutor = gr.Button("🎓 Tutoring", size="sm")
        btn_contact = gr.Button("📧 Contact", size="sm")
        btn_python = gr.Button("🐍 Python Help", size="sm") # Generic example
    
    # Event wiring
    btn_who.click(lambda: "Who is Faruk?", outputs=msg)
    btn_tutor.click(lambda: "What tutoring services does Faruk offer?", outputs=msg)
    btn_contact.click(lambda: "How can I contact Faruk?", outputs=msg)
    btn_python.click(lambda: "Explain Python lists briefly.", outputs=msg) 

    msg.submit(
        fn=chat_with_ollama_conditional,
        inputs=[chatbot, msg],
        outputs=[chatbot, msg],
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, share=True)
