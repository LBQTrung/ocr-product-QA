
# Ingredient Extraction from Product Packaging

This project provides tools to extract ingredient information from product packaging images using two different AI models: Gemini and Qwen. The system can identify ingredients and their corresponding amounts from product packaging images.

## Features

- Extract ingredients and their amounts from product packaging images
- Support for multiple languages
- Uses two different AI models:
  - Google's Gemini 2.0 Flash
  - Qwen 2.5 VL 32B
- Returns structured JSON output with ingredients and amounts

## Requirements

- Python 3.8+
- Required packages:
  ```
  google-generativeai
  openai
  python-dotenv
  pydantic
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

## Usage

### Using Gemini Model

```python
from gemini import extract_ingredients

# Path to your product image
image_path = "path/to/your/image.jpg"

# Extract ingredients
result = extract_ingredients(image_path)
print(result)
```

### Using Qwen Model

```python
from qwen import extract_ingredients

# Path to your product image
image_path = "path/to/your/image.jpg"

# Extract ingredients
result = extract_ingredients(image_path)
print(result)
```

## Output Format

The system returns a JSON object with the following structure:

```json
{
  "ingredients": ["Ingredient1", "Ingredient2", "..."],
  "amounts": ["Amount1", "Amount2", "..."],
  "language": "Detected Language"
}
```

## How It Works

1. The system takes an image of product packaging as input
2. The image is encoded to base64 format
3. The encoded image is sent to either Gemini or Qwen AI model
4. The AI model analyzes the image and extracts:
   - Ingredient names
   - Corresponding amounts
   - Language of the text
5. Results are returned in a structured JSON format

## Notes

- Make sure your images are clear and well-lit for better results
- The system works best with product packaging that has clearly visible ingredient lists
- Both models support multiple languages, but accuracy may vary depending on the language and image quality

## License

[Add your license information here]