from openai import OpenAI
import os
import dotenv
import base64
import time
from pydantic import BaseModel

dotenv.load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

class OutputFormat(BaseModel):
    ingredients: list[str]
    amounts: list[str]


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    

def get_platform_message():
    return """
    You are a vision-language model tasked with reading the ingredient declaration on a product's packaging and outputting a JSON object with two parallel arrays: one for ingredient names and one for their amounts.

    Instructions:
    1. Identify each ingredient name as printed on the packaging.
    2. Ensure the ingredient name does not include any amount or numerical value.
    3. Capture the corresponding amount (weight, volume, percentage, etc.) exactly as shown.
    4. If an ingredient has no amount listed, use an empty string for that entry in the amounts array.
    5. Ignore any text that is not part of the ingredient list.

    Return ONLY a JSON object in the exact format below. Do not include any extra text, explanations, or notes.
    Output format:
    {
    "ingredients": ["Ingredient1", "Ingredient2", "..."],
    "amounts": ["Amount1", "Amount2", "..."],
    }

    Example:
    Input (image of packaging):
    "Ingredients: Eau 85%, Glycérine 10%, Parfum"

    Expected JSON output:
    {
    "ingredients": ["Eau", "Glycérine", "Parfum"],
    "amounts": ["85%", "10%", ""]
    }
"""

def get_user_message():
    return "Extract the ingredients from the image."

def extract_ingredients(image_path: str) -> OutputFormat:
    base64_image = encode_image(image_path)
    completion = client.beta.chat.completions.parse(
        model="qwen/qwen2.5-vl-32b-instruct:free",
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": get_platform_message()
            },
            {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": get_user_message()
                    },
                    {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                    }
                ]
            }
        ],
        response_format=OutputFormat
    )
    return completion.choices[0].message.content


def main():
    start_time = time.time()
    image_path = "images/3.jpg"
    ingredients = extract_ingredients(image_path)
    print(ingredients)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")


if __name__ == "__main__":
    main()
