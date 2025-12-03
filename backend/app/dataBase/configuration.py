# configuration.py
"""
Database configuration for SQLAlchemy.

Configuration reads connection parameters from environment variables with
sensible defaults for local development.

This file constructs:
 - dataBaseConnection (SQLAlchemy connection URL)
 - engine (SQLAlchemy engine)
 - SessionLocal (session factory)
 - Base (declarative base for models)
"""
import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read env vars (set these in .env or your environment)
username = os.getenv("DB_USER", "dev_user")
userPassword = os.getenv("DB_PASS", "FinanceDB")
server = os.getenv("DB_HOST", "172.22.96.1")        # IP or hostname of SQL Server in dev
connectionPort = os.getenv("DB_PORT", "1433")
dataBaseName = os.getenv("DB_NAME", "FinanceDB")

# ODBC Driver name (ensure driver is installed on your machine)
odbc_driver = os.getenv("ODBC_DRIVER", "ODBC Driver 18 for SQL Server")

# URL-encode driver and password
driver_quoted = urllib.parse.quote_plus(odbc_driver)

# SQLAlchemy connection string for SQL Server via pyodbc
# Format: mssql+pyodbc://user:password@server,port/dbname?driver=ODBC+Driver+18+for+SQL+Server
dataBaseConnection = (
    f"mssql+pyodbc://{username}:{urllib.parse.quote_plus(userPassword)}"
    f"@{server},{connectionPort}/{dataBaseName}?driver={driver_quoted}&TrustServerCertificate=yes"
)

# Create engine (pool_pre_ping avoids stale connections)
engine = create_engine(dataBaseConnection, pool_pre_ping=True, fast_executemany=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for model classes
Base = declarative_base()
