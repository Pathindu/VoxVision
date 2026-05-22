from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from app.services.google import GoogleService

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    lang_code: str


@router.post("/synthesize")
async def synthesize(request: TTSRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty.")

    try:
        service       = GoogleService()
        audio_content = service.synthesize_text(request.text, request.lang_code)
        return Response(content=audio_content, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
