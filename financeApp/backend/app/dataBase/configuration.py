import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database connection data
username = os.getenv("DB_USER", "root")
userPassword = os.getenv("DB_PASS", "")
server = os.getenv("DB_HOST", "localhost")
connectionPort = os.getenv("DB_PORT", "3306")
dataBaseName = os.getenv("DB_NAME", "financeDB")

# Full DB connection string
dataBaseConnection = f"mysql+pymysql://{username}:{userPassword}@{server}:{connectionPort}/{dataBaseName}"

# Create engine with pre-ping
engine = create_engine(dataBaseConnection, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
