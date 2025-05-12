from google import genai
from app.core.config import settings
from typing import List, Dict

# Configure Gemini
def generate_chat_name(user_message: str, bot_response: str, production_information: dict) -> str:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
        Generate a short, descriptive name (max 5 words) for a chat based on the following conversation and contextual information. 
        The name should reflect the main topic or purpose of the conversation. 
        Avoid generic titles if the user message is vague — instead, use the provided production information to determine intent. 
        Use the same language as the user and bot messages.
        Conversation:
        User: {user_message}
        Bot: {bot_response}

        Production Information:
        {production_information}
    """
    
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

def generate_response(message: str, history_messages: list, product_information: dict) -> str:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    SYSTEM_PROMPT = f"""
You are an AI assistant that answers user questions using both prior conversation and structured data extracted from a product's packaging image.

Here is the context extracted from the packaging:
{product_information}

This context may include:
- Product name, ingredients, usage instructions, benefits
- Nutritional information, warnings, dosage (if applicable)
- Manufacturer info, expiry date, certifications, etc.

Your responsibilities:
1. Leverage all available information from the extracted data to provide accurate, relevant, and helpful responses.
2. Use bold (**...**) for emphasis when needed.
3. Use lists for clarity:
- nordered lists for general items;
- Numbered lists for steps or procedures.
4. If ingredients or active substances are provided, you may apply general knowledge to assess:
- Safety (e.g. allergens, contraindications);
- Health benefits;
- Potential side effects.
5. Maintain a natural, conversational tone that aligns with the previous chat history.
6. If the user asks something unrelated to the packaging data, respond using general knowledge.
7. If the required information is missing or unclear, you should:
- Ask the user for clarification;
- Or gracefully mention the limitation.

**IMPORTANT**: Always respond in the same language as the user’s input (Vietnamese or English).
"""
    

    # Format chat history
    history_text = "\n".join([
        f"{msg['sender']}: {msg['text']}"
        for msg in history_messages[-5:]  # Only use last 5 messages for context
    ])
    
    user_prompt = f"""
Previous conversation:
{history_text}

User: {message}

Assistant:"""
    
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=[
            user_prompt,
        ],
        config={
            "temperature": 0.7,
            "system_instruction": SYSTEM_PROMPT
        }
    )
    return response.text.strip() 