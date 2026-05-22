from google import genai
from google.genai import types
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.client = None
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
        
        self.model = settings.GEMINI_MODEL

    def process_image(self, image_bytes: bytes, prompt: str, system_instruction: str, temperature: float, mime_type: str = "image/png") -> str:
        if not self.client:
            raise ValueError("Gemini API Key is not configured.")
        
        try:
            print(f"Attempting to contact Gemini using model: {self.model}...")
            
            file_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            )
            
            # Swapped order: Image first, prompt second (Best practice for Gemini)
            response = self.client.models.generate_content(
                model=self.model,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                    response_mime_type="text/plain"
                ),
                contents=[file_part, prompt] 
            )
            
            print("✅ Gemini successfully returned a response!")
            return response.text
            
        except Exception as e:
            # ─── BUG HUNTING UPGRADE ──────────────────────────────
            # This forces the terminal to show you exactly what Google is complaining about
            print("\n" + "🚨"*25)
            print("GEMINI API ERROR DETECTED")
            print(f"Exact Reason: {str(e)}")
            print("🚨"*25 + "\n")
            raise Exception(f"Gemini processing failed: {str(e)}")