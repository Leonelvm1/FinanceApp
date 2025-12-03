"""
app/api/DTO/dtos.py

Pydantic DTOs (Data Transfer Objects) for FinanceApp backend.

Guiding principles:
 - Keep request models (petition) and response models clearly separated.
 - Do NOT expose sensitive fields like password in response DTOs.
 - Use Config.from_attributes=True so Pydantic can read SQLAlchemy model attributes.

NOTE:
 - User creation POST expects plain-text password from client (the server MUST hash it before storing).
 - All response DTOs should reflect the fields returned by endpoints.
"""
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

# =========================
# Category DTOs
# =========================
class CategoryDTOPetition(BaseModel):
    """Request body when creating/updating a category."""
    name: str

    class Config:
        from_attributes = True


class CategoryDTOResponse(BaseModel):
    """Response representation for a category sent to clients."""
    id: int
    name: str
    is_global: Optional[bool] = False

    class Config:
        from_attributes = True


# =========================
# Expense DTOs
# =========================
class ExpenseDTOPetition(BaseModel):
    """Request body for creating/updating an expense."""
    description: str
    category_id: int
    amount: float
    date: date

    class Config:
        from_attributes = True


class ExpenseDTOResponse(BaseModel):
    """Expense object returned to clients (includes resolved category_name)."""
    id: int
    description: str
    amount: float
    date: date
    category_id: int
    category_name: Optional[str]

    class Config:
        from_attributes = True


# =========================
# Income DTOs
# =========================
class IncomeDTOPetition(BaseModel):
    """Request body for creating/updating an income."""
    description: str
    amount: float
    date: date
    category_id: int

    class Config:
        from_attributes = True


class IncomeDTOResponse(BaseModel):
    """Income object returned to clients (includes resolved category_name)."""
    id: int
    description: str
    amount: float
    date: date
    category_id: int
    category_name: Optional[str]

    class Config:
        from_attributes = True


# =========================
# User DTOs
# =========================
class UserDTOPetition(BaseModel):
    """
    Request body for user creation (signup).
    The client sends a plain-text password here; the server hashes it before storing.
    """
    full_name: str
    birth_date: date
    location: str
    savings_goal: float
    password: str

    class Config:
        from_attributes = True


class UserDTOResponse(BaseModel):
    """
    Response model for /users/me and signup return value.
    IMPORTANT: This model DOES NOT include the password.
    """
    id: int
    full_name: str
    birth_date: date
    location: str
    savings_goal: float

    expenses: List[ExpenseDTOResponse] = []
    incomes: List[IncomeDTOResponse] = []
    categories: List[CategoryDTOResponse] = []

    total_expenses: float
    total_incomes: float
    balance: float
    savings_progress: float

    # Optional metadata that you may add to the DB (documented here for clarity)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True


# =========================
# Auth DTOs
# =========================
class LoginDTO(BaseModel):
    """
    Optional JSON login DTO for clients that prefer JSON.
    The current API uses OAuth2PasswordRequestForm (form-encoded) in /login.
    """
    username: str
    password: str


class TokenDTO(BaseModel):
    """Return structure for backward-compatibility (server returns token in body and cookie)."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Utility DTO used when decoding JWT token payloads."""
    username: Optional[str] = None
