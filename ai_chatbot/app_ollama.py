import gradio as gr
import requests

API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "faruk-bot"

def chat_with_ollama(history, user_message):
    messages = []

    # Build message history for Ollama
    for user, bot in history:
        messages.append({"role": "user", "content": user})
        messages.append({"role": "assistant", "content": bot})

    messages.append({"role": "user", "content": user_message})

    response = requests.post(
        API_URL,
        json={"model": MODEL_NAME, "messages": messages, "stream": False}
    ).json()

    bot_reply = response["message"]["content"]
    history.append((user_message, bot_reply))
    return history, ""

with gr.Blocks() as demo:
    gr.Markdown("## 🤖 Faruk’s Personal AI Assistant")
    chatbot = gr.Chatbot()
    msg = gr.Textbox(label="Your message", placeholder="Ask me anything...")
    
    msg.submit(chat_with_ollama, [chatbot, msg], [chatbot, msg])

demo.launch(server_name="0.0.0.0", server_port=7860)
