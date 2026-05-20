from fastapi import APIRouter

from app.api.routes import (
    auth,
    tags,
    store,
    root,
    googleTTS,
    image
)


router=APIRouter()


router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)


router.include_router(
    tags.router,
    prefix="/tags",
    tags=["Tags"]
)


router.include_router(
    store.router,
    prefix="/store",
    tags=["Store"]
)


router.include_router(
    root.router,
    tags=["Root"]
)


router.include_router(
    googleTTS.router,
    tags=["GoogleTTS"]
)


router.include_router(
    image.router,
    tags=["Image"]
)