# Chatbot API

A FastAPI-based chatbot API that uses MongoDB for storage and Google's Gemini AI for natural language processing and image analysis.

## Features

- Chat management (create, read, update, delete)
- Message handling with AI responses
- Image information extraction
- Translation capabilities
- Automatic chat naming

## Prerequisites

- Python 3.8+
- MongoDB
- Google Gemini API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=chatbot_db
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### Chat Management
- `POST /api/chat` - Create a new chat
- `GET /api/chats` - Get all chats
- `GET /api/chats/{id}` - Get chat details
- `PATCH /api/chats/{id}/rename` - Rename a chat
- `DELETE /api/chats/{id}` - Delete a chat
- `PUT /api/chat/get-name` - Generate chat name

### Message Handling
- `POST /api/messages/send` - Send a message
- `PATCH /api/messages/resend` - Resend a message

### Image Processing
- `POST /api/extractor/extract` - Extract information from image
- `POST /api/extractor/translate` - Translate extracted information

## Database Schema

### Chat Collection
```json
{
  "_id": ObjectId,
  "userId": String,
  "createdAt": DateTime,
  "messages": [
    {
      "sender": String,
      "text": String,
      "timestamp": DateTime
    }
  ],
  "status": String
}
``` 