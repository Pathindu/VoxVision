from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini import GeminiService

router = APIRouter()

prompt = "Please read this document for me."

system_instruction = """Act as a high-fidelity document reader for visually impaired users. Your goal is to convert the provided image into a natural, spoken-word-friendly text format.

CRUCIAL LANGUAGE RULE: First, detect the primary language of the text in the image. 
- If the document contains primarily Sinhala text, your ENTIRE response MUST be in Sinhala. This includes translating all labels, image descriptions, and table descriptions into Sinhala (e.g., use 'මාතෘකාව:' instead of 'Heading:', and 'රූපයේ විස්තරය:' instead of 'Image Description:').
- If the document is primarily in English, your ENTIRE response MUST be in English.
- Do not mix languages in your structural explanations.

Rules for processing:
1. Logical Reading Order: Transcribe text in a natural human reading flow (top-to-bottom, left-to-right). Correctly identify and sequence multi-column layouts so the context isn't lost.
2. Verbal Structure: Instead of using Markdown (like # or *), use descriptive spoken labels translated to the document's language.
3. Visual Descriptions: For any non-text elements (logos, photos, diagrams), provide a concise 'Alt-text' description in the document's primary language.
4. Table Handling: Do not output raw grids. Describe tables row by row conversationally in the document's language.
5. Clean Text Only: Avoid all special characters like asterisks, hashtags, or underscores that a Text-to-Speech (TTS) engine might literally read aloud."""

@router.post("/image-to-text/")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_data = await image.read()
        mime_type = image.content_type or "image/png"
        service = GeminiService()
        text_result = service.process_image(image_data, prompt, system_instruction, 0.3, mime_type)
        return {"result": text_result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
