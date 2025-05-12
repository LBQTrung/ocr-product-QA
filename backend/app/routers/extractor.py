from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
from app.services.extractor import extract_image_info, translate_info
from app.core.config import settings
import os
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from app.models.extractor import TranslateRequest

router = APIRouter()

@router.post("/extractor/extract", response_model=dict)
async def extract_info(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = file.file.read()
        
        # Process both info types in parallel using ThreadPoolExecutor
        with ThreadPoolExecutor() as executor:
            # Submit both tasks
            ingredients_future = executor.submit(extract_image_info, image, "ingredients")
            other_info_future = executor.submit(extract_image_info, image, "other_info")
            
            # Get results
            ingredients_result = ingredients_future.result()
            other_info_result = other_info_future.result()
            
        # Combine results
        combined_result = {
            "Ingredients": ingredients_result["ingredients"],
            "Product name": other_info_result["product_name"],
            "Brand": other_info_result["brand"],
            "Net content": other_info_result["net_content"],
            "Manufacturing date": other_info_result["manufacturing_date"],
            "Expiry date": other_info_result["expiry_date"],
            "Country of origin": other_info_result["country_of_origin"],
            "Manufacturer": other_info_result["manufacturer"],
            "Usage instructions": other_info_result["usage_instructions"],
            "Storage instructions": other_info_result["storage_instructions"],
            "Nutritional info": other_info_result["nutritional_info"],
        }
        
        return {"status": "success", "data": combined_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extractor/translate")
async def translate_extracted_info(request: TranslateRequest):
    try:
        translated_info = translate_info(request.info, request.language)
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

