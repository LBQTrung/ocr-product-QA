from google import genai
from app.core.config import settings
from typing import List, Dict

# Configure Gemini
client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_chat_name(message: str) -> str:
    prompt = f"Generate a short, descriptive name (max 5 words) for a chat that starts with this message: '{message}'"
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            prompt,
        ],
        config={
            "temperature": 0,
            "system_instruction": prompt
        }
    )
    return response.text.strip()

def generate_response(message: str, context: dict) -> str:

    packaging_context = context.get("product_information", {})
    
    SYSTEM_PROMPT = f"""
You are an AI assistant that answers user questions using both prior conversation and structured data extracted from a product's packaging image.

Here is the context extracted from the packaging:
{packaging_context}

This context may include:
- Product name, ingredients, usage instructions, benefits
- Nutritional information, warnings, dosage (if applicable)
- Manufacturer info, expiry date, certifications, etc.

Your job is to:
- Use this information to generate accurate, relevant, and helpful responses
- Maintain a natural, conversational tone based on the chat history
- If the user asks something unrelated to the context, answer appropriately using general knowledge
- If required information is missing or unclear in the packaging data, respond gracefully or ask for clarification

Always respond in the same language as the user’s input (Vietnamese or English).
"""
    

    # Format chat history
    chat_history = context.get("messages", [])
    history_text = "\n".join([
        f"{msg['sender']}: {msg['text']}"
        for msg in chat_history[-5:]  # Only use last 5 messages for context
    ])
    
    user_prompt = f"""
Previous conversation:
{history_text}

User: {message}

Assistant:"""
    
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            user_prompt,
        ],
        config={
            "temperature": 0.7,
            "system_instruction": SYSTEM_PROMPT
        }
    )
    return response.text.strip() 