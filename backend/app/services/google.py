import os
from google.cloud import texttospeech

class GoogleService:
    def __init__(self):
        # This automatically looks for the GOOGLE_APPLICATION_CREDENTIALS env variable
        self.client_tts = texttospeech.TextToSpeechClient()

    def synthesize_text(self, text, lang):
        try:
            input_text = texttospeech.SynthesisInput(text=text)
            
            # Select the specific Sinhala or Tamil voice
            voice = texttospeech.VoiceSelectionParams(
                language_code=lang,
                # name="si-LK-Standard-A" if lang == "si-LK" else  "en-US-Standard-A"
            )

            audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

            response = self.client_tts.synthesize_speech(
                input=input_text, voice=voice, audio_config=audio_config
            )
            return response.audio_content
        except Exception as e:
            print("Synthesizing text: ", text)
            print("Language: ", lang)
            print(f"Error synthesizing text: {str(e)}")
            return None

google_service = GoogleService()