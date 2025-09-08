from fastapi import FastAPI
from app.dataBase.configuration import engine, Base
from app.api.models.tablesSQL import Base
from app.api.routes.endpoints import rutes

from starlette.responses import RedirectResponse

from starlette.middleware.cors import CORSMiddleware

# Create the database tables
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

#ativate API

@app.get("/")
def main():
    return RedirectResponse(url="/docs")

app.include_router(rutes)

