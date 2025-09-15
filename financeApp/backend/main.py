from fastapi import FastAPI
from app.dataBase.configuration import engine, Base
import app.api.models.tablesSQL  # Import models so they register with Base
from app.api.routes.endpoints import rutes
from app.seed.seed_categories import seed_categories

from starlette.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware

# Create all tables in the database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Run seeding script at startup
@app.on_event("startup")
def on_startup():
    try:
        seed_categories()
    except Exception as e:
        print(f"[WARNING] Could not seed categories: {e}")

# Redirect root to Swagger UI
@app.get("/")
def main():
    return RedirectResponse(url="/docs")

# Attach API routes
app.include_router(rutes)
