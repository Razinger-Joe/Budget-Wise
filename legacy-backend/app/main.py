from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging

@asynccontextmanager
async lifespan(app: FastAPI):
    # Startup logic
    setup_logging(settings.LOG_LEVEL)
    yield
    # Shutdown logic

def create_app() -> FastAPI:
    app = FastAPI(
        title="Legacy Finance API",
        description="Production-grade async Python backend for the Legacy personal finance system",
        version="1.0.0",
        lifespan=lifespan
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # Register routers
    from app.api.v1.router import api_v1_router
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    return app

app = create_app()
