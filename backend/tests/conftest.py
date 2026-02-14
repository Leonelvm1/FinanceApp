"""
Pytest configuration and fixtures for FinanceApp tests.

Key setup:
- Override DATABASE_URL to use file-backed SQLite for test isolation
- Create TestClient with FastAPI app
- Provide fixtures for clean database per test
- Set COOKIE_SECURE=False so cookies are accepted in HTTP localhost tests
"""

import os
import sys
import pytest
from pathlib import Path

# Add backend root to path so imports work correctly
# When pytest runs from backend/, we need to be able to import 'main'
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment variables BEFORE importing app
os.environ.setdefault("COOKIE_SECURE", "False")
os.environ["TEST_DATABASE_URL"] = "sqlite:///./test.db"

# Now safe to import FastAPI app and database
from main import app
from app.dataBase.configuration import SessionLocal, engine, Base
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create test database engine
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
if TEST_DATABASE_URL.startswith("sqlite"):
    # For SQLite, we need check_same_thread=False for TestClient (multiple threads)
    test_engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    test_engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override the get_db dependency to use test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def setup_test_database():
    """Create tables before each test, drop after."""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    yield
    # Drop all tables
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client():
    """Provide TestClient with test database dependency override."""
    from app.api.routes.endpoints import get_db
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
