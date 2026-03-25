import io
from google import genai
from google.genai import types
from PIL import Image
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
        
        self.model = settings.GEMINI_MODEL

    def process_image(self, image_bytes: bytes, prompt: str, system_instruction: str, temperature: float) -> str:
        if not self.client:
            raise ValueError("Gemini API Key is not configured.")
        
        try:
            img = Image.open(io.BytesIO(image_bytes))
            
            response = self.client.models.generate_content(
                model=self.model,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                    response_mime_type="text/plain"
                ),
                contents=[prompt, img]
            )
            return response.text
        except Exception as e:
            raise Exception(f"Failed to process image: {str(e)}")

gemini_service = GeminiService()
