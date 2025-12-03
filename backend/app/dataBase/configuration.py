"""
Database configuration for SQLAlchemy (PostgreSQL / Neon).

This module sets up:

 - DATABASE_URL: read from environment variables.
 - engine: SQLAlchemy engine bound to a PostgreSQL database.
 - SessionLocal: session factory for dependency injection.
 - Base: declarative base class for ORM models.

Design goals:
 - Use a single PostgreSQL (Neon) database for:
     * Local development
     * Render backend deployment
 - Avoid SQL Server / ODBC drivers completely.
 - Keep the configuration environment-driven and easy to deploy.

Primary mode:
 - DATABASE_URL is expected to be defined in the environment.
   Example (Neon):
   postgresql://USERNAME:PASSWORD@HOST/neondb?sslmode=require

Fallback mode (optional):
 - If DATABASE_URL is not defined, the app will try to build a local
   PostgreSQL URL using DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env in local development.
# In production (Render), environment variables are injected by the platform.
load_dotenv()

# --- Primary mode: use DATABASE_URL directly (Neon or any PostgreSQL instance) ---

DATABASE_URL = os.getenv("DATABASE_URL")

# --- Optional fallback: local PostgreSQL configuration (not required if you always use Neon) ---

if not DATABASE_URL:
    DB_USER = os.getenv("DB_USER", "dev_user")
    DB_PASS = os.getenv("DB_PASS", "FinanceDB")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "financeapp")

    # Standard PostgreSQL connection URI
    DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:{DB_PASS}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

# --- SQLAlchemy core objects ---

# Create SQLAlchemy engine
# pool_pre_ping=True helps avoid stale connections in serverless/cloud environments.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base for ORM models
Base = declarative_base()
