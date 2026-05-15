from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)
    
    # Define the specific origins allowed to talk to this backend
    origins = [
        "http://localhost:3000",          # Local frontend
        "http://127.0.0.1:3000",        # Local frontend alias
        # ADD YOUR TUNNEL URLS BELOW:
        settings.APP_ORIGINS
    ]

    # Allow CORS for the frontend
    app.add_middleware(
        CORSMiddleware,

        allow_origins=origins,  # Allows all origins, adjust in production
        # Allows all origins, adjust in production

        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

    app.include_router(api_router)
    return app

app = create_app()
