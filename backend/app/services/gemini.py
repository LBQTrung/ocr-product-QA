import google.generativeai as genai
from app.core.config import settings
from typing import List, Dict

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def generate_chat_name(message: str) -> str:
    prompt = f"Generate a short, descriptive name (max 5 words) for a chat that starts with this message: '{message}'"
    response = model.generate_content(prompt)
    return response.text.strip()

def generate_response(message: str, chat_history: List[Dict]) -> str:
    # Format chat history
    history_text = "\n".join([
        f"{msg['sender']}: {msg['text']}"
        for msg in chat_history[-5:]  # Only use last 5 messages for context
    ])
    
    prompt = f"""Previous conversation:
{history_text}

User: {message}

Assistant:"""
    
    response = model.generate_content(prompt)
    return response.text.strip() 