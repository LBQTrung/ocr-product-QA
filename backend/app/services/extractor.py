from fastapi import UploadFile
from google import genai
from app.core.config import settings
from typing import Dict, Any
from app.models.extractor import IngredientsOutputFormat, OtherInfoOutputFormat
from google.genai.types import Part
import io
from PIL import Image
import os
import uuid
from datetime import datetime


EXTRACT_INGREDIENTS_PROMPT = """
You are a vision-language model tasked with reading the ingredient declaration on a product's packaging and outputting a JSON object with two parallel arrays: one for ingredient names and one for their amounts.

Instructions:
1. Identify each ingredient name as printed on the packaging.
2. Capture the corresponding amount (weight, volume, percentage, etc.) exactly as shown.
3. Amounts must be in the format of a number followed by a unit (e.g., 12%, 100g, 0.5L). Do not include parentheses, special characters, or textual descriptions (e.g., (12%) → 12%). If an ingredient has no amount listed, use an empty string for that entry in the amounts array.

4. Ignore any text that is not part of the ingredient list.
5. Determine the language used in the ingredient declaration and include it in the output under the field "language" (in English, e.g., "Vietnamese", "French", "Japanese").

Return ONLY a JSON object in the exact format below. Do not include any extra text, explanations, or notes.
Output format:
{
  "ingredients": ["Ingredient1", "Ingredient2", "..."],
  "amounts": ["Amount1", "Amount2", "..."],
  "language": "Language"
}

Example:
Input (image of packaging):
"Ingredients: Eau 85%, Glycérine 10%, Parfum"

Expected JSON output:
{
  "ingredients": ["Eau", "Glycérine", "Parfum"],
  "amounts": ["85%", "10%", ""],
  "language": "French"
}
"""

EXTRACT_OTHER_INFO_PROMPT = """
You are a vision-language model tasked with extracting key product information from packaging. Your goal is to output a JSON object containing specific details excluding the ingredient list.

Instructions:
1. Identify and extract the following product information if available on the packaging:
    - Product name (as shown on the label)
    - Brand name
    - Net content (e.g., 500g, 250ml, 1L)
    - Manufacturing date
    - Expiry date or best-before date
    - Country of origin
    - Manufacturer name
    - Instructions for use (short description)
    - Storage instructions
    - Any nutritional information or typical values (include only if clearly structured)
2. Omit the ingredient list entirely.
3. Dates must follow the format YYYY-MM-DD. If not clearly structured, return the date string as-is.
4. Units for content and nutritional values must be preserved exactly as written (e.g., kcal, g, mg).
5. If a field is not present or legible, use an empty string for that field.

Return ONLY a JSON object in the exact format below. Do not include any extra text, explanations, or notes.
Output format:
{
  "product_name": "",
  "brand": "",
  "net_content": "",
  "manufacturing_date": "",
  "expiry_date": "",
  "country_of_origin": "",
  "manufacturer": "",
  "usage_instructions": "",
  "storage_instructions": "",
  "nutritional_info": "",
}
"""

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def extract_image_info(file: UploadFile, info_type: str) -> Dict[str, Any]:
    # Read image data
    image = file.file.read()
    
    if info_type == "ingredients":
        prompt = EXTRACT_INGREDIENTS_PROMPT
        output_format = IngredientsOutputFormat

        
    elif info_type == "other_info":
        prompt = EXTRACT_OTHER_INFO_PROMPT
        output_format = OtherInfoOutputFormat

    try:
        # Create image part
        image_part = Part.from_bytes(data=image, mime_type="image/jpeg")
        
        # Generate content with both text and image
        response = client.models.generate_content(
            # model="gemini-2.5-flash-preview-04-17",
            model="gemini-2.0-flash",
            contents=[
                "Extract the informationfrom the image.",
                image_part,
            ],
            config={
                'response_mime_type': 'application/json',
                'response_schema': output_format,
                "temperature": 0,
                "system_instruction": prompt
            }
        )
        
        return response.parsed.__dict__
    
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise e

def translate_info(info: Dict[str, Any], language: str) -> Dict[str, Any]:
    # Use Gemini to translate the information
    prompt = f"""
You are a helpful translator.

Translate the following JSON dictionary into {language}.
Instructions:
- Translate ALL keys, values, and any nested objects or arrays into {language}.
- Do NOT modify the structure — only translate human-readable strings.
- Keys may contain spaces — do NOT change their format.
- Return a valid JSON object with only the translated dictionary (no extra text or explanation).
IMPORTANT: If a value is a dictionary or list, recursively translate all keys and strings inside it.

Example:
Input:
{{
  "greeting": "Hello",
  "details": {{
    "user name": "Alice",
    "hobbies": ["Reading", "Cooking"]
  }}
}}

Output (if target language is Vietnamese):
{{
  "lời chào": "Xin chào",
  "chi tiết": {{
    "tên người dùng": "Alice",
    "sở thích": ["Đọc sách", "Nấu ăn"]
  }}
}}

Now translate this:

"""
    print(prompt)
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            "Translate the following JSON dictionary into {language}."
            f"Input: {info}"
        ],
        config={
            'response_mime_type': 'application/json',
            "temperature": 0,
            "system_instruction": prompt
        }
    )
    print(response.text)
    return eval(response.text)