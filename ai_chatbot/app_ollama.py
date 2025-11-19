import gradio as gr
import requests

# Ollama HTTP API endpoint
API_URL = "http://localhost:11434/api/chat"

# Name of your custom model created with `ollama create`
MODEL_NAME = "faruk-bot"  # change this if you named it differently


def chat_with_ollama(history, user_message):
    """
    Gradio callback that sends the conversation to Ollama
    and returns the updated history.
    """
    # history can be None on first run
    if history is None:
        history = []

    # Strong system prompt to control style + avoid fake contact info
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
    # history is a list of (user, assistant) tuples
    for user_msg, bot_msg in history:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": bot_msg})

    # Add the latest user message
    messages.append({"role": "user", "content": user_message})

    # Call Ollama chat API (non-streaming for simplicity)
    try:
        response = requests.post(
            API_URL,
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
            },
            timeout=120,  # seconds
        )

        response.raise_for_status()
        data = response.json()

        bot_reply = data.get("message", {}).get("content", "").strip()
        if not bot_reply:
            bot_reply = "I'm having trouble generating a response right now. Please try again."

    except Exception as e:
        bot_reply = f"Sorry, I ran into an error talking to the model: {e}"

    # Append to history for Gradio
    history.append((user_message, bot_reply))
    return history, ""  # clear input box


# Build a simple Gradio UI
with gr.Blocks() as demo:
    gr.Markdown(
        """
        ## 🤖 Faruk’s Personal AI Assistant

        Ask me about Faruk's QA career, his teaching, tutoring options, or general questions
        about Python, web development, testing, or AI. I’ll keep answers short and focused.
        """
    )

    chatbot = gr.Chatbot(height=400)
    msg = gr.Textbox(
        label="Your message",
        placeholder="Ask me anything about Faruk, his work, or tech topics...",
    )

    msg.submit(
        fn=chat_with_ollama,
        inputs=[chatbot, msg],
        outputs=[chatbot, msg],
    )

# Expose on all interfaces, port 7860 (so your iframe / Gradio share can load it)
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True  # ✅ enables the https://xxxx.gradio.live link
    )
