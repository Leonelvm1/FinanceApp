# app/main.py
"""
FastAPI app entrypoint.

Notes:
- Reads FRONTEND_ORIGINS env var (comma-separated) for CORS; falls back to reasonable defaults for dev.
- allow_credentials=True is required so browser will send cookies (withCredentials).
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

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS origins
raw_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allow_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,  # IMPORTANT: allow cookies to be sent
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seeding on startup
@app.on_event("startup")
def on_startup():
    try:
        seed_categories()
    except Exception as e:
        print(f"[WARNING] Could not seed categories: {e}")

@app.get("/")
def main():
    return RedirectResponse(url="/docs")

# Include router (no prefix so endpoints stay as /login, /users/me etc)
app.include_router(routes)
