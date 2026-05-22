from google.cloud import texttospeech


class GoogleService:
    def __init__(self):
        # Automatically uses GOOGLE_APPLICATION_CREDENTIALS env variable.
        # config.py writes this variable at startup when GOOGLE_CREDENTIALS_JSON is set (server).
        self.client_tts = texttospeech.TextToSpeechClient()

    def synthesize_text(self, text: str, lang: str) -> bytes:
        """Synthesize text to MP3 bytes. Raises on failure (do not silently return None)."""
        input_text  = texttospeech.SynthesisInput(text=text)
        voice       = texttospeech.VoiceSelectionParams(language_code=lang)
        audio_cfg   = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

        response = self.client_tts.synthesize_speech(
            input=input_text, voice=voice, audio_config=audio_cfg
        )
        return response.audio_content
