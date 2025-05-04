from fastapi import UploadFile
import google.generativeai as genai
from app.core.config import settings
from typing import Dict, Any
import io
from PIL import Image

# Configure Gemini Vision
vision_model = genai.GenerativeModel('gemini-pro-vision')

def extract_image_info(file: UploadFile) -> Dict[str, Any]:
    # Read image file
    contents = file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Extract information using Gemini Vision
    prompt = """Analyze this product image and extract the following information:
    1. Main components/ingredients
    2. Product specifications
    3. Any warnings or important notes
    4. Usage instructions
    Format the response as a JSON object."""
    
    response = vision_model.generate_content([prompt, image])
    return response.text

def translate_info(info: Dict[str, Any]) -> Dict[str, Any]:
    # Use Gemini to translate the information
    prompt = f"""Translate the following product information to Vietnamese:
    {info}
    Keep the same JSON structure but translate the content."""
    
    response = genai.generate_content(prompt)
    return response.text 