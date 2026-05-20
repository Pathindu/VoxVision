import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the backend/ root, regardless of where uvicorn is run from
_env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings:
    # ── App ──────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "VoxVision API"
    APP_ORIGINS: str = os.getenv("APP_ORIGINS", "")

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://voxvision:voxvision@localhost:5432/voxvision"
    )

    # ── JWT ───────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-CHANGE-ME-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # ── PayHere ──────────────────────────────────────────────────────────
    PAYHERE_MERCHANT_ID: str     = os.getenv("PAYHERE_MERCHANT_ID", "")
    PAYHERE_MERCHANT_SECRET: str = os.getenv("PAYHERE_MERCHANT_SECRET", "")

    # ── Google / Gemini ───────────────────────────────────────────────────
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str          = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite")


settings = Settings()
