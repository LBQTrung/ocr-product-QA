from google import genai
from google.genai.types import Part
from pydantic import BaseModel
import os
import dotenv
import base64
import time

dotenv.load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PROMPT = """
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


class OutputFormat(BaseModel):
    ingredients: list[str]
    amounts: list[str]
    language: str


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return image_file.read()


def extract_ingredients(image_path: str) -> OutputFormat:
    image = encode_image(image_path)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            "Extract the ingredients and amounts from the image.",
            Part.from_bytes(data=image, mime_type="image/jpeg")
        ],
        config={
            'response_mime_type': 'application/json',
            'response_schema': OutputFormat,
            "temperature": 0,
            "system_instruction": PROMPT
        }
    )

    return response.parsed.__dict__


def main():
    start_time = time.time()
    image_path = "images/1.jpg"
    ingredients = extract_ingredients(image_path)
    print(ingredients)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")

if __name__ == "__main__":
    main()