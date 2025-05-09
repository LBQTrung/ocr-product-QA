from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
from app.services.extractor import extract_image_info, translate_info
from app.core.config import settings
import os
import uuid
from datetime import datetime


router = APIRouter()

@router.post("/extractor/extract", response_model=dict)
async def extract_info(info_type: str, file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if info_type == "":
        raise HTTPException(status_code=400, detail="Info type is required")
    
    extracted_info = extract_image_info(file, info_type)
    return {"status": "success", "data": extracted_info}


@router.post("/extractor/translate", response_model=dict)
async def translate_extracted_info(info: Dict[str, Any], language: str = "Vietnamese"):
    try:
        translated_info = translate_info(info, language)
        return {"status": "success", "data": translated_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# upload image
@router.post("/extractor/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image = file.file.read()

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{timestamp}_{unique_id}{file_extension}"
    
    # Save file to static/uploads directory
    upload_path = os.path.join("static", "uploads", filename)
    with open(upload_path, "wb") as f:
        f.write(image)
    
    # Generate static URL for the file
    static_url = f"{settings.HOST}:{settings.PORT}/static/uploads/{filename}"
    return {"status": "success", "data": static_url}

