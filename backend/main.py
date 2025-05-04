from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, extractor, messages
from app.core.config import settings
from app.core.database import connect_to_mongo
import uvicorn

app = FastAPI(title="Chatbot API")


connect_to_mongo()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(extractor.router, prefix="/api", tags=["extractor"])
app.include_router(messages.router, prefix="/api", tags=["messages"])

@app.get("/")
def root():
    return {"message": "Welcome to Chatbot API"}

if __name__ == "__main__":
    
    print("\n🚀 Starting FastAPI server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
