import gradio as gr
import requests
import json
import re
from difflib import SequenceMatcher
from typing import Dict, List, Tuple, Optional

# Ollama HTTP API endpoint
API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "faruk-bot"

class ChatbotCache:
    def __init__(self):
        self.cache = self._load_cache()
        self.similarity_threshold = 0.6  # Adjust this to control matching sensitivity
    
    def _load_cache(self) -> Dict[str, str]:
        """Load predefined Q&A pairs for common questions"""
        return {
            # About Faruk - Basic Info
            "who is faruk": "Faruk Hasan is a Senior Software QA Engineer at Digital.ai with 5+ years of experience in automation testing, CI/CD, and cloud infrastructure. He's also an educator who teaches coding and AI courses.",
            
            "what does faruk do": "Faruk works as a Senior Software QA Engineer specializing in Playwright automation testing. He also teaches Python, AI, and web development courses on Udemy and provides tutoring services.",
            
            "faruk experience": "Faruk has 5+ years of QA engineering experience, currently working at Digital.ai since 2022. He previously worked at M.M.Hayes Co and specializes in Playwright, Python, and test automation frameworks.",
            
            # Contact Information
            "contact faruk": "You can contact Faruk at faruqmul@gmail.com. He's also available on LinkedIn at linkedin.com/in/md-faruk-hasan/",
            
            "faruk email": "Faruk's email address is faruqmul@gmail.com",
            
            # Tutoring & Teaching
            "tutoring": "Faruk offers personalized tutoring in Python, web development, AI/ML, and test automation. He has taught 2000+ students with a 4.82/5 rating. Contact him at faruqmul@gmail.com for tutoring inquiries.",
            
            "courses": "Faruk has created courses on Udemy including 'Python Fundamentals: Fun and Practical Projects for Beginners' and 'AI & Machine Learning for Beginners'. Both are highly rated by students.",
            
            "python course": "Faruk's Python Fundamentals course on Udemy focuses on practical projects for beginners. Students love its hands-on approach and clear explanations.",
            
            # Technical Skills
            "playwright": "Faruk is an expert in Playwright automation testing with Python and TypeScript. He's built advanced frameworks with CI/CD integration and has created browser extensions for test result visualization.",
            
            "automation testing": "Faruk specializes in automation testing using Playwright, Selenium, and custom frameworks. He's reduced regression cycle times by 50% and improved test coverage significantly.",
            
            "python": "Faruk is proficient in Python for test automation, web development, and AI/ML projects. He teaches Python fundamentals and has built several automation frameworks.",
            
            # AI & Technology
            "ai ml": "Faruk has experience with AI and machine learning, including creating personalized chatbots using Ollama and Hugging Face. He teaches AI/ML concepts to beginners.",
            
            "github": "You can find Faruk's projects on GitHub at github.com/faruklmu17, including his Playwright frameworks and automation tools.",
            
            # General Responses
            "hello": "Hello! I'm Faruk's AI assistant. I can help you learn about his QA career, tutoring services, courses, or answer questions about Python, testing, and AI.",
            
            "help": "I can help you with information about Faruk's background, his tutoring services, technical courses, or answer questions about Python, automation testing, AI, and web development."
        }
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for better matching"""
        return re.sub(r'[^\w\s]', '', text.lower().strip())
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def find_cached_response(self, user_message: str) -> Optional[str]:
        """Find a cached response for the user message"""
        normalized_message = self._normalize_text(user_message)
        
        # Direct keyword matching first
        for key, response in self.cache.items():
            if key in normalized_message or any(word in normalized_message for word in key.split()):
                return response
        
        # Fuzzy matching for similar questions
        best_match = None
        best_score = 0
        
        for key, response in self.cache.items():
            similarity = self._calculate_similarity(normalized_message, self._normalize_text(key))
            if similarity > best_score and similarity >= self.similarity_threshold:
                best_score = similarity
                best_match = response
        
        return best_match

def chat_with_ollama_cached(history, user_message):
    """Enhanced chat function with caching support"""
    if history is None:
        history = []
    
    # Initialize cache
    cache = ChatbotCache()
    
    # Try to find cached response first
    cached_response = cache.find_cached_response(user_message)
    
    if cached_response:
        # Return cached response instantly
        history.append((user_message, f"⚡ {cached_response}"))
        return history, ""
    
    # If no cached response, use LLM (original logic)
    messages = [
        {
            "role": "system",
            "content": (
                "You are Faruk Hasan's personal website assistant, embedded on his portfolio "
                "and tutoring pages. You know about his life, education, QA career, and "
                "tutoring experience from the documents used to configure this model.\n\n"

                "STYLE RULES:\n"
                "- Answer concisely in 2–4 sentences by default.\n"
                "- Do NOT write long essays unless the user clearly asks for a detailed explanation.\n"
                "- Only mention Faruk's biography or life story when the user asks about it directly "
                "or when it is clearly relevant to their question.\n"
                "- If the user asks about coding, QA, Playwright, automation, teaching, AI, or "
                "investing, focus on giving a clear, practical answer.\n\n"

                "CRITICAL SAFETY & ACCURACY RULES (DO NOT BREAK THESE):\n"
                "1) Never invent or guess email addresses, phone numbers, or URLs.\n"
                "2) The ONLY email address you are allowed to give as Faruk's contact is: "
                "'faruqmul@gmail.com'.\n"
                "3) If the user asks for an Outschool email or any other platform-specific email, "
                "explain that Faruk communicates via the Outschool messaging system and via "
                "'faruqmul@gmail.com', and that you do not have any other official email.\n"
                "4) If you are not sure about a specific detail (like an ID, URL, schedule, or "
                "contact info), say you are not certain instead of guessing.\n"
                "5) Do NOT fabricate organizations, awards, or credentials that were not in his profile.\n\n"

                "GENERAL BEHAVIOR:\n"
                "- Be friendly, professional, and helpful.\n"
                "- If a student or parent seems confused, respond supportively and clarify.\n"
                "- If the user asks something unrelated to Faruk, you may still answer, but keep it "
                "short and helpful.\n"
            ),
        }
    ]
    
    # Rebuild conversation history for Ollama
    for user_msg, bot_msg in history:
        # Remove the ⚡ prefix from cached responses when sending to LLM
        clean_bot_msg = bot_msg.replace("⚡ ", "") if bot_msg.startswith("⚡ ") else bot_msg
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": clean_bot_msg})
    
    messages.append({"role": "user", "content": user_message})
    
    # Call Ollama chat API
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
            
    except Exception as e:
        bot_reply = f"Sorry, I ran into an error talking to the model: {e}"
    
    history.append((user_message, bot_reply))
    return history, ""


# Build Gradio UI with cache info
with gr.Blocks() as demo:
    gr.Markdown(
        """
        ## 🤖 Faruk's Personal AI Assistant (Version: 2.0 - Cached)

        Ask me about Faruk's QA career, his teaching, tutoring options, or general questions
        about Python, web development, testing, or AI.

        ⚡ **Fast responses** for common questions using smart caching!
        """
    )

    chatbot = gr.Chatbot(height=400)
    msg = gr.Textbox(
        label="Your message",
        placeholder="Ask me anything about Faruk, his work, or tech topics...",
    )

    # Add some example buttons for common questions
    with gr.Row():
        gr.Examples(
            examples=[
                "Who is Faruk?",
                "What tutoring services does Faruk offer?",
                "Tell me about Faruk's Python course",
                "How can I contact Faruk?",
                "What is Faruk's experience with Playwright?"
            ],
            inputs=msg,
        )

    msg.submit(
        fn=chat_with_ollama_cached,
        inputs=[chatbot, msg],
        outputs=[chatbot, msg],
    )

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )
