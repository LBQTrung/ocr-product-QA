from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from app.models.chat import ChatCreate, ChatUpdate, ChatInDB
from app.core.database import get_database
from app.services.gemini import generate_chat_name

router = APIRouter()

@router.post("/chat", response_model=dict)
def create_chat(chat: ChatCreate, db=Depends(get_database)):
    chat_dict = chat.model_dump()
    chat_dict["userId"] = "user123"  # In a real app, this would come from authentication
    chat_dict["createdAt"] = datetime.now().replace(microsecond=0).isoformat()
    chat_dict["name"] = "New Chat" 

    if chat_dict.get("productInformation") == {}:
        raise HTTPException(status_code=400, detail="Product information is required")
    
 
    result = db.chats.insert_one(chat_dict)
    chat_dict["_id"] = str(result.inserted_id)
    
    return {"status": "success", "data": chat_dict}

@router.get("/chats", response_model=dict)
def get_chats(db=Depends(get_database)):
    chats = []
    for chat in db.chats.find():
        chat["_id"] = str(chat["_id"])
        chats.append(chat)
    
    return {"status": "success", "data": chats}

@router.get("/chats/{chat_id}", response_model=dict)
def get_chat(chat_id: str, db=Depends(get_database)):
    chat = db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat["_id"] = str(chat["_id"])
    return {"status": "success", "data": chat}

@router.patch("/chats/{chat_id}/rename", response_model=dict)
def rename_chat(chat_id: str, chat_update: ChatUpdate, db=Depends(get_database)):
    if not chat_update.chatName:
        raise HTTPException(status_code=400, detail="New chat name is required")
    
    result = db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"chatName": chat_update.chatName}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"status": "success", "message": "Chat renamed successfully"}

@router.delete("/chats/{chat_id}", response_model=dict)
def delete_chat(chat_id: str, db=Depends(get_database)):
    result = db.chats.delete_one({"_id": ObjectId(chat_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {"status": "success", "message": "Chat deleted successfully"}

@router.put("/chat/get-name", response_model=dict)
def get_chat_name(chat_id: str, db=Depends(get_database)):
    chat = db.chats.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get the first user message
    first_user_message = next(
        (msg["text"] for msg in chat["messages"] if msg["sender"] == "user"),
        None
    )
    
    if not first_user_message:
        raise HTTPException(status_code=400, detail="No user messages found")
    
    # Generate chat name using Gemini
    chat_name = generate_chat_name(first_user_message)
    
    # Update chat name
    db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"chatName": chat_name}}
    )
    
    return {"status": "success", "data": {"chatName": chat_name}} 