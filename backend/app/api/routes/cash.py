from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini import gemini_service

router = APIRouter()

prompt = "What is the value of this banknote?"
system_instruction = """Act as a precise currency identification assistant for the blind. Your sole purpose is to identify the denomination and currency of banknotes in the provided image.
    Strict Output Rules:
    Immediate Value: Start the response directly with the value and currency (e.g., 'One Thousand Sri Lankan Rupees' or 'Twenty US Dollars').
    No Markdown: Do not use symbols like 'Rs.', '$', or '**'. Use full words that a TTS engine can pronounce clearly.
    Multiple Notes: If there are multiple notes, list them as a simple count (e.g., 'One five-hundred rupee note and two one-hundred rupee notes').
    Clarity Check: If the image is too blurry, dark, or the note is folded so the value isn't visible, say: 'The note is not clearly visible. Please flatten the bill and try again.'
    Counterfeit/Validity Warning: If the note looks suspicious or is clearly play money, add a polite warning: 'Warning: This does not appear to be a standard banknote.'
    Language: If the note is a Sri Lankan Rupee, provide the output in both English and Sinhala if requested, but keep it brief."""


@router.post("/cash-to-text/")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_data = await image.read()
        mime_type = image.content_type or "image/png"
        text_result = gemini_service.process_image(image_data, prompt, system_instruction, 0.1, mime_type)
        return {"result": text_result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
