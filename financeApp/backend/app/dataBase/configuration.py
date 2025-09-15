import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database connection data (load from env or default values)
username = os.getenv("DB_USER", "root")
userPassword = os.getenv("DB_PASS", "")
server = os.getenv("DB_HOST", "localhost")
connectionPort = os.getenv("DB_PORT", "3306")
dataBaseName = os.getenv("DB_NAME", "financeDB")

# Full DB connection string
dataBaseConnection = f"mysql+pymysql://{username}:{userPassword}@{server}:{connectionPort}/{dataBaseName}"

# Create the engine with pre-ping to avoid stale connections
engine = create_engine(dataBaseConnection, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
