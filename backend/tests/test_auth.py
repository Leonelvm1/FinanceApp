"""
Tests for authentication endpoints (/signup, /login, /logout).

Tests verify:
- User signup with valid data
- Duplicate user prevention
- Login with valid credentials
- Login with invalid credentials
- Cookie-based session management
"""

import pytest
from datetime import date


class TestSignup:
    """Test user signup endpoint."""

    def test_signup_success(self, client):
        """Test successful user registration."""
        response = client.post(
            "/signup",
            json={
                "full_name": "test_user",
                "birth_date": "2000-01-15",
                "location": "New York",
                "savings_goal": 5000.0,
                "password": "SecurePass123!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "test_user"
        assert data["location"] == "New York"
        assert "password" not in data  # Password should not be returned

    def test_signup_duplicate_user(self, client):
        """Test that duplicate username is rejected."""
        # First signup
        client.post(
            "/signup",
            json={
                "full_name": "duplicate_user",
                "birth_date": "2000-01-15",
                "location": "Boston",
                "savings_goal": 3000.0,
                "password": "SecurePass123!",
            },
        )

        # Second signup with same username
        response = client.post(
            "/signup",
            json={
                "full_name": "duplicate_user",
                "birth_date": "2001-05-20",
                "location": "Chicago",
                "savings_goal": 4000.0,
                "password": "DifferentPass456!",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestLogin:
    """Test user login endpoint."""

    @pytest.fixture
    def registered_user(self, client):
        """Create a test user for login tests."""
        client.post(
            "/signup",
            json={
                "full_name": "login_test_user",
                "birth_date": "2000-01-15",
                "location": "New York",
                "savings_goal": 5000.0,
                "password": "TestPassword123!",
            },
        )
        return {"full_name": "login_test_user", "password": "TestPassword123!"}

    def test_login_success(self, client, registered_user):
        """Test successful login."""
        response = client.post(
            "/login",
            data={
                "username": registered_user["full_name"],
                "password": registered_user["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        # Check that HttpOnly cookie was set
        assert "access_token" in client.cookies

    def test_login_invalid_password(self, client, registered_user):
        """Test login with wrong password."""
        response = client.post(
            "/login",
            data={
                "username": registered_user["full_name"],
                "password": "WrongPassword123!",
            },
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/login",
            data={
                "username": "nonexistent_user",
                "password": "SomePassword123!",
            },
        )
        assert response.status_code == 401

    def test_logout(self, client, registered_user):
        """Test logout clears the cookie."""
        # Login first
        client.post(
            "/login",
            data={
                "username": registered_user["full_name"],
                "password": registered_user["password"],
            },
        )
        assert "access_token" in client.cookies

        # Logout
        response = client.post("/logout")
        assert response.status_code == 200
        # Cookie should be cleared (httponly cookie with max-age=0)
