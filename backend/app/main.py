from app.core.config import settings  # noqa

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base

# Import ALL models so SQLAlchemy knows about them before create_all
from app.db.models import User, Tag, Order, Donation  # noqa

from app.api.router import api_router


def create_app() -> FastAPI:
    # This creates all tables
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title=settings.PROJECT_NAME)

    origins = ["http://localhost:3000", "http://127.0.0.1:3000","http://localhost:3004","https://voxvision-frontend-pj16.onrender.com"]
    if settings.APP_ORIGINS:
        origins.append(settings.APP_ORIGINS)

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