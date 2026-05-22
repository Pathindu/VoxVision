import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/ root – works whether uvicorn is run from backend/ or project root
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_env_path, override=False)   # override=False: real env vars win (Render/Railway)


class Settings:
    # ── App ───────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "VoxVision API"
    APP_ORIGINS: str  = os.getenv("APP_ORIGINS", "")   # extra CORS origins (comma-separated OK)

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://voxvision:voxvision@localhost:5432/voxvision",
    )

    # ── JWT ───────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-CHANGE-ME-in-production")
    ALGORITHM: str  = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # ── PayHere ───────────────────────────────────────────────────────────
    PAYHERE_MERCHANT_ID: str     = os.getenv("PAYHERE_MERCHANT_ID", "")
    PAYHERE_MERCHANT_SECRET: str = os.getenv("PAYHERE_MERCHANT_SECRET", "")

    # ── Google Gemini ─────────────────────────────────────────────────────
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str          = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")

    # ── Google Cloud TTS ──────────────────────────────────────────────────
    # On Render/Railway set GOOGLE_CREDENTIALS_JSON to the raw JSON string.
    # Locally just point GOOGLE_APPLICATION_CREDENTIALS at the key file.
    GOOGLE_CREDENTIALS_JSON: str | None = os.getenv("GOOGLE_CREDENTIALS_JSON")


settings = Settings()

# ── Write the Google credentials JSON to a temp file when running on a server
# (where you can't upload a file but CAN set an env var with the JSON content)
import json, tempfile
if settings.GOOGLE_CREDENTIALS_JSON and not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    try:
        _creds = json.loads(settings.GOOGLE_CREDENTIALS_JSON)
        _tmp   = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        json.dump(_creds, _tmp)
        _tmp.close()
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = _tmp.name
        print(f"[config] Wrote Google credentials to {_tmp.name}")
    except Exception as _e:
        print(f"[config] WARNING: Could not parse GOOGLE_CREDENTIALS_JSON: {_e}")
