from fastapi import APIRouter, Response
from app.services.google import GoogleService

router = APIRouter()

@router.post("/synthesize")
async def synthesize(request: dict):
    text = request.get("text")
    lang = request.get("lang_code")

    service = GoogleService()
    audio_content = service.synthesize_text(text, lang) 
    
    return Response(content=audio_content, media_type="audio/mpeg")