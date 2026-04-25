from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.gemini import gemini_service

router = APIRouter()

prompt = "Please read this document for me."
system_instruction = """Act as a high-fidelity document reader for visually impaired users. Your goal is to convert the provided image into a natural, spoken-word-friendly text format.
    Rules for processing:
    Logical Reading Order: Transcribe text in a natural human reading flow (top-to-bottom, left-to-right). Correctly identify and sequence multi-column layouts so the context isn't lost.
    Verbal Structure: Instead of using Markdown (like # or *), use descriptive labels. For example, say 'Heading:', 'Subheading:', or 'List item:' before the relevant text.
    Visual Descriptions: For any non-text elements (logos, photos, diagrams), provide a concise 'Alt-text' description in brackets, e.g., [Image Description: A blue university logo with a shield].
    Table Handling: Do not output raw grids. Describe tables row by row, for example: 'In the table, the first row shows Name: Pathindu, Role: Developer.'
    Clean Text Only: Avoid all special characters like asterisks, hashtags, or underscores that a Text-to-Speech (TTS) engine might literally read aloud.
    Multilingual Support: If the document contains Sinhala text, transcribe it accurately in Sinhala script. Do not translate to English."""


@router.post("/image-to-text/")
async def analyze_image(image: UploadFile = File(...)):
    try:
        image_data = await image.read()
        mime_type = image.content_type or "image/png"
        text_result = gemini_service.process_image(image_data, prompt, system_instruction, 0.3, mime_type)
        return {"result": text_result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
