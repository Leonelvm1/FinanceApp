from fastapi import FastAPI
from app.dataBase.configuration import engine, Base
from app.api.routes.endpoints import routes
from app.seed.seed_categories import seed_categories
from starlette.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

# Inicializar FastAPI
app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seeding al inicio
@app.on_event("startup")
def on_startup():
    try:
        seed_categories()
    except Exception as e:
        print(f"[WARNING] Could not seed categories: {e}")

# Redirigir root a Swagger UI
@app.get("/")
def main():
    return RedirectResponse(url="/docs")

# Incluir rutas
app.include_router(routes)
