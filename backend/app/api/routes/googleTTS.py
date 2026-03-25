from fastapi import APIRouter, Response
from app.services.google import google_service

router = APIRouter()

@router.post("/synthesize")
async def synthesize(request: dict):
    text = request.get("text")
    lang = request.get("lang_code")
    
    audio_content = google_service.synthesize_text(text, lang) 
    
    return Response(content=audio_content, media_type="audio/mpeg")