import gradio as gr
import requests
import json
import re
import os
from difflib import SequenceMatcher
from typing import Dict, Optional

# Ollama HTTP API endpoint
API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3.2"  # Changed to generic base model for dynamic context

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
            print(f"Config file {self.config_file} not found. Using default cache.")
            return {"cache_responses": {}, "settings": {}}
        except json.JSONDecodeError:
            print(f"Error parsing {self.config_file}. Using default cache.")
            return {"cache_responses": {}, "settings": {}}
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for better matching"""
        return re.sub(r'[^\w\s]', '', text.lower().strip())
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def _contains_keywords(self, message: str, keywords: str) -> bool:
        """Check if message contains any of the keywords"""
        message_words = set(message.split())
        keyword_words = set(keywords.split())
        return bool(message_words.intersection(keyword_words))
    
    def find_cached_response(self, user_message: str) -> Optional[str]:
        """Find a cached response for the user message"""
        if not self.cache_enabled:
            return None

        normalized_message = self._normalize_text(user_message)

        # Step 1: Exact phrase matching (highest priority)
        for key, response in self.cache.items():
            normalized_key = self._normalize_text(key)
            if normalized_key == normalized_message:
                return response

        # Step 2: Check if the cache key is completely contained in the message
        best_exact_match = None
        best_exact_length = 0

        for key, response in self.cache.items():
            normalized_key = self._normalize_text(key)
            if normalized_key in normalized_message:
                # Prefer longer, more specific matches
                if len(normalized_key) > best_exact_length:
                    best_exact_length = len(normalized_key)
                    best_exact_match = response

        if best_exact_match:
            return best_exact_match

        # Step 3: Keyword intersection matching
        for key, response in self.cache.items():
            if self._contains_keywords(normalized_message, self._normalize_text(key)):
                return response

        # Step 4: Fuzzy matching for similar questions (lowest priority)
        best_match = None
        best_score = 0

        for key, response in self.cache.items():
            similarity = self._calculate_similarity(normalized_message, self._normalize_text(key))
            if similarity > best_score and similarity >= self.similarity_threshold:
                best_score = similarity
                best_match = response

        return best_match
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        return {
            "total_cached_responses": len(self.cache),
            "cache_enabled": self.cache_enabled,
            "similarity_threshold": self.similarity_threshold
        }

# --- NEW LOGIC START ---

def load_faruk_profile():
    """Load Faruk's profile from external MD file."""
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

def chat_with_ollama_cached(history, user_message):
    """
    Enhanced chat function with caching AND conditional context injection.
    Replaces the old logic to fix over-conditioning.
    """
    if history is None:
        history = []
    
    cache = ChatbotCache()
    
    # 1. Try to find cached response first (Instant)
    cached_response = cache.find_cached_response(user_message)
    
    if cached_response:
        # Return cached response instantly with indicator
        response_with_indicator = f"{cache.cache_indicator} {cached_response}"
        history.append((user_message, response_with_indicator))
        return history, ""
    
    # 2. Determine Intent & Load Context
    faruk_intent = is_faruk_intent(user_message)
    
    system_content = ""
    slow_response_warning = ""

    if faruk_intent:
        profile_text = load_faruk_profile()
        system_content = (
            "You are Faruk Hasan's personal AI assistant. "
            "Use the following profile to answer questions about him:\n\n"
            f"{profile_text}\n\n"
            "STYLE RULES:\n"
            "- Answer concisely in 2-4 sentences.\n"
            "- Be friendly and professional.\n"
            "- Only use the profile info provided."
        )
    else:
        # Generic Mode - Free from Faruk's bio
        system_content = (
            "You are a helpful and friendly AI assistant. "
            "You are NOT Faruk Hasan. You are his assistant. "
            "If the user asks about their own name or identity (e.g. 'what is my name'), check the conversation history."
            "Do NOT randomly talk about Faruk Hasan unless the user explicitly asks about him. "
            "Answer the user's specific question directly."
        )
        # Add a small warning that non-cached responses might be slower on the free/cloud instance
        slow_response_warning = "\n\n(🐢 *Note: Response generated by the AI model. Please wait a moment...*)"

    # 3. Build Messages for Ollama
    messages = [{"role": "system", "content": system_content}]
    
    # 3. Clean and prepare usage context from history
    # We maintain memory (e.g. "I am John") but strip markers
    clean_history_messages = []
    
    # Keep last 10 turns for context
    recent_history = history[-10:] if history else []

    for user_msg, bot_msg in recent_history:
        # Clean icons/warnings from previous bot messages
        clean_bot_msg = re.sub(r'^[⚡🐢]\s*', '', bot_msg).replace("(Note: Response generated by the AI model. Please wait a moment...*)", "").strip()
        
        clean_history_messages.append({"role": "user", "content": user_msg})
        clean_history_messages.append({"role": "assistant", "content": clean_bot_msg})
    
    # Add current message
    clean_history_messages.append({"role": "user", "content": user_message})

    # Combine with system prompt
    messages = [{"role": "system", "content": system_content}] + clean_history_messages
    
    # 4. Call Ollama chat API
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
            bot_reply = "I'm having trouble generating a response right now. Please try again."
        
        # Append warning if it was a generic generation
        if slow_response_warning:
            bot_reply += slow_response_warning
            
    except Exception as e:
        bot_reply = f"Sorry, I ran into an error talking to the model: {e}"
    
    history.append((user_message, bot_reply))
    return history, ""

# --- UI REDESIGN (KEPT ORIGINAL) ---

custom_css = """
/* Main Background - Warm Sunrise Gradient */
.gradio-container {
    background: linear-gradient(135deg, #FFF5E1 0%, #FFD1A9 50%, #FF9E68 100%) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    padding: 0 !important; /* Remove main container padding */
    gap: 0 !important;
}

/* Remove default Gradio spacing on blocks */
.gradio-container > .main, .gradio-container > .main > .wrap {
    gap: 0 !important;
}

/* Header & Typography */
.header-container {
    text-align: center;
    padding: 5px 0 2px 0; /* Minimal padding */
    margin: 0 !important;
}
/* Ensure the HTML block itself has no margin */
.prose {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
}
.gradio-container .prose {
    margin: 0 !important;
}

.avatar-group {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2px; /* Minimal margin */
}
.avatar {
    width: 28px; /* Compact */
    height: 28px;
    border-radius: 50%;
    border: 2px solid white;
    margin: 0 -4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    background: #FFD1A9;
    object-fit: cover;
}
.avatar.main {
    width: 36px; /* Compact */
    height: 36px;
    z-index: 10;
    margin: 0 -4px;
    border: 2px solid white;
}
.main-title {
    font-size: 16px; 
    font-weight: 800;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.1; 
    letter-spacing: -0.3px;
}
.subtitle {
    font-size: 13px; 
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.2px;
    opacity: 0.7;
}

/* Chatbot Area */
#chatbot {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    height: 280px !important; /* Adjusted for compact view */
    margin-top: 0px !important; 
    margin-bottom: 5px !important;
    padding-top: 0 !important;
    overflow-y: auto;
}
/* Remove gaps between gradio rows */
.row {
    margin: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
}

/* Fix Input Interactivity */
#msg-input {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    flex-grow: 1;
}
#msg-input textarea {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    font-size: 16px !important;
    padding: 8px !important;
    min-height: 40px !important;
}
/* Hide the label container but keep the input interactive */
#msg-input .label-wrap { display: none !important; }
#msg-input .form { border: none !important; background: transparent !important; }


/* Send Button */
#send-btn {
    background: #FF6B00 !important;
    color: white !important;
    border: none !important;
    border-radius: 50% !important;
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    font-size: 20px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(255, 107, 0, 0.3) !important;
    transition: transform 0.2s ease;
}
#send-btn:hover {
    transform: scale(1.05);
}

/* Chips / Suggestions */
.chips-row {
    margin-bottom: 5px !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 2px 10px !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
}
.chip-btn {
    font-size: 12px !important;
    padding: 6px 14px !important;
    border-radius: 20px !important;
    background: rgba(255, 255, 255, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.6) !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
    color: #333 !important;
    transition: all 0.2s ease !important;
    white-space: nowrap !important;
}
.chip-btn:hover {
    background: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
"""

header_html = """
<div class="header-container">
    <div class="avatar-group">
        <img src="https://ui-avatars.com/api/?name=Assistant&background=FF9E68&color=fff&rounded=true" class="avatar" />
        <img src="https://ui-avatars.com/api/?name=Faruk&background=1a1a1a&color=fff&rounded=true&font-size=0.5" class="avatar main" />
        <img src="https://ui-avatars.com/api/?name=AI&background=FFD1A9&color=fff&rounded=true" class="avatar" />
    </div>
    <div class="main-title">Hello, Guest.</div>
    <div class="subtitle">We're here to help.</div>
</div>
"""

# Build Gradio UI with redesigned layout
with gr.Blocks(css=custom_css, title="Faruk's AI Assistant", theme=gr.themes.Base()) as demo:
    
    gr.HTML(header_html)
    
    chatbot = gr.Chatbot(
        value=[(None, "Hi there! 👋 I'm Faruk's AI Assistant.\n\nI can answer questions about his **resume**, **classes**, **projects**, or **consulting**. Pick a topic below or just ask!")],
        elem_id="chatbot",
        show_label=False,
        show_share_button=False,
        show_copy_button=True,
        bubble_full_width=False,
        avatar_images=(None, "https://ui-avatars.com/api/?name=F&background=000&color=fff"), # User: None, Bot: "F"
        render=False
    )
    
    # Render chatbot BEFORE input
    chatbot.render()

    # Custom Input Row
    with gr.Row(elem_classes="input-container"):
        msg = gr.Textbox(
            elem_id="msg-input",
            show_label=False,
            placeholder="Hi, how can I help?",
            scale=10,
            container=True, # Restored container for stability
            lines=1,
            autofocus=True
        )
        submit_btn = gr.Button(value="↑", elem_id="send-btn", scale=1, size="sm")
    
    # Chips / Suggestions (Moved to bottom)
    with gr.Row(elem_classes="chips-row"):
        # Original
        btn_who = gr.Button("👋 Who is Faruk?", elem_classes="chip-btn", size="sm")
        btn_courses = gr.Button("📚 Courses Taught", elem_classes="chip-btn", size="sm")
        
        # New
        btn_skills = gr.Button("🛠️ Technical Skills", elem_classes="chip-btn", size="sm")
        btn_education = gr.Button("🎓 Education", elem_classes="chip-btn", size="sm")
        btn_students = gr.Button("👥 Student Stats", elem_classes="chip-btn", size="sm")
        btn_udemy = gr.Button("📹 Udemy Course", elem_classes="chip-btn", size="sm")
        btn_career = gr.Button("💼 Career Journey", elem_classes="chip-btn", size="sm")
        
        # Original
        btn_contact = gr.Button("📧 Contact", elem_classes="chip-btn", size="sm")

    # Interactions
    msg.submit(
        fn=chat_with_ollama_cached,
        inputs=[chatbot, msg],
        outputs=[chatbot, msg],
    )
    submit_btn.click(
        fn=chat_with_ollama_cached,
        inputs=[chatbot, msg],
        outputs=[chatbot, msg],
    )

    # Chip Handlers (Populate input AND Submit)
    common_args = {
        "fn": chat_with_ollama_cached,
        "inputs": [chatbot, msg],
        "outputs": [chatbot, msg]
    }

    btn_who.click(lambda: "Who is Faruk?", outputs=msg).then(**common_args)
    btn_courses.click(lambda: "What courses do you teach?", outputs=msg).then(**common_args)
    
    # New Handlers
    btn_skills.click(lambda: "What are your technical skills?", outputs=msg).then(**common_args)
    btn_education.click(lambda: "What is your education?", outputs=msg).then(**common_args)
    btn_students.click(lambda: "How many students have you taught?", outputs=msg).then(**common_args)
    btn_udemy.click(lambda: "Do you have a Udemy course?", outputs=msg).then(**common_args)
    btn_career.click(lambda: "What is your career journey?", outputs=msg).then(**common_args)
    
    btn_contact.click(lambda: "How can I contact Faruk?", outputs=msg).then(**common_args)

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )
