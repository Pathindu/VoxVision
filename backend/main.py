# config must be the very first app import so .env is loaded before any DB code
from app.core.config import settings  # noqa: F401 – side-effect: loads .env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
from app.db import models  # noqa: F401 – registers all ORM classes with Base
from app.api.router import api_router


def create_app() -> FastAPI:
    # Auto-create all tables (no-op if they already exist)
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            "VoxVision API – NFC tag management, document/cash reading, "
            "e-commerce store, and PayHere payments."
        ),
        version="1.0.0",
    )

    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if settings.APP_ORIGINS:
        origins.extend([o.strip() for o in settings.APP_ORIGINS.split(",")])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    return app


app = create_app()
