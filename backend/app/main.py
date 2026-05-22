from app.core.config import settings  # noqa – must be first: loads .env + writes Google creds

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
from app.db.models import User, Tag, Order, Donation  # noqa – registers ORM classes
from app.api.router import api_router


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title=settings.PROJECT_NAME)

    # Build CORS origin list:
    # - always allow localhost dev ports
    # - add any origin(s) from APP_ORIGINS env var (comma-separated for multiple)
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3004",
    ]
    if settings.APP_ORIGINS:
        for o in settings.APP_ORIGINS.split(","):
            o = o.strip()
            if o and o not in origins:
                origins.append(o)

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
