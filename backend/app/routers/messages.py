from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from bson import ObjectId
from datetime import datetime

from app.core.database import get_database
from app.services.gemini import generate_response

router = APIRouter()

@router.post("/messages/send", response_model=dict)
def send_message(chat_id: str, content: str, db=Depends(get_database)):
    # Get chat history
    chat = db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Add user message
    user_message = {
        "sender": "user",
        "text": content,
        "timestamp": datetime.utcnow()
    }
    
    # Generate bot response
    bot_response = generate_response(content, chat.get("messages", []))
    bot_message = {
        "sender": "bot",
        "text": bot_response,
        "timestamp": datetime.utcnow()
    }
    
    # Update chat with new messages
    db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {
            "$push": {
                "messages": {
                    "$each": [user_message, bot_message]
                }
            }
        }
    )
    
    return {
        "status": "success",
        "data": {
            "content": bot_response
        }
    }

@router.patch("/messages/resend", response_model=dict)
def resend_message(chat_id: str, content: str, db=Depends(get_database)):
    # Get chat history
    chat = db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Generate new bot response
    bot_response = generate_response(content, chat.get("messages", []))
    bot_message = {
        "sender": "bot",
        "text": bot_response,
        "timestamp": datetime.utcnow()
    }
    
    # Update chat with new bot message
    db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {
            "$push": {
                "messages": bot_message
            }
        }
    )
    
    return {
        "status": "success",
        "data": {
            "content": bot_response
        }
    } 