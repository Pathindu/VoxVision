from fastapi import APIRouter
from app.api.routes import root, image, cash, googleTTS

api_router = APIRouter()
api_router.include_router(root.router, tags=["Root"])
api_router.include_router(image.router, tags=["Image Analysis"])
api_router.include_router(cash.router, tags=["Cash Analysis"])
api_router.include_router(googleTTS.router, tags=["Google TTS"])
