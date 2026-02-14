# app/main.py
"""
FastAPI application entrypoint.

Responsibilities:
 - Create DB tables if missing (Base.metadata.create_all)
 - Configure CORS with allow_credentials=True so browser cookies are forwarded
 - Seed global categories on startup (seed_categories)
 - Mount routes from app.api.routes.endpoints

Deployment notes:
 - In production, prefer creating DB schemas via Alembic migrations rather than create_all.
 - Set FRONTEND_ORIGINS to the frontend origin(s) and COOKIE_SECURE=True (use HTTPS).
"""
import os
from fastapi import FastAPI
from app.dataBase.configuration import engine, Base
from app.api.routes.endpoints import routes
from app.seed.seed_categories import seed_categories
from starlette.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Create DB tables if they don't exist (convenience for development)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Centralized exception handlers: return consistent JSON shape for errors
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.exceptions import RequestValidationError


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log error server-side and return generic message
    print(f"[ERROR] Unhandled exception: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Return 422 with readable details
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# Configure allowed CORS origins (comma separated list in FRONTEND_ORIGINS)
raw_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allow_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,  # REQUIRED: browser will only send cookies when this is True
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed on startup; keep it safe (wrap in try/except)
@app.on_event("startup")
def on_startup():
    try:
        seed_categories()
    except Exception as e:
        # Print a warning; do not crash startup for non-critical seed issues
        print(f"[WARNING] Could not seed categories: {e}")

# Simple redirect root to OpenAPI docs for convenience during dev
@app.get("/")
def main():
    return RedirectResponse(url="/docs")

# Mount router (no prefix used so endpoints remain /login, /users/me, etc.)
app.include_router(routes)
