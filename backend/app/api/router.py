from fastapi import APIRouter
from app.api.routes import root, image, cash, googleTTS, auth, tags, store

api_router = APIRouter()

# ── Existing routes (preserved) ───────────────────────────────────────────
api_router.include_router(root.router, tags=["Root"])
api_router.include_router(image.router, tags=["Image Analysis"])
api_router.include_router(cash.router, tags=["Cash Analysis"])
api_router.include_router(googleTTS.router, tags=["Google TTS"])

# ── New VoxVision routes ──────────────────────────────────────────────────
api_router.include_router(auth.router)          # /auth/register  /auth/login  /auth/me
api_router.include_router(tags.router)          # /tags/create    /tags/{id}
api_router.include_router(store.router)         # /orders/create  /donations/create  /payments/webhook
