# app/api/DTO/dtos.py
from pydantic import BaseModel
from datetime import date
from typing import List, Optional

# =========================
# Category DTOs
# =========================
class CategoryDTOPetition(BaseModel):
    name: str

    class Config:
        from_attributes = True

class CategoryDTOResponse(BaseModel):
    name: str  # ⬅ Only keep name, as discussed

    class Config:
        from_attributes = True

# =========================
# Expense DTOs
# =========================
class ExpenseDTOPetition(BaseModel):
    description: str
    category: str   # user will send category name
    amount: float
    date: date

    class Config:
        from_attributes = True

class ExpenseDTOResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    category: str   # just return category name

    class Config:
        from_attributes = True

# =========================
# Income DTOs
# =========================
class IncomeDTOPetition(BaseModel):
    description: str
    amount: float
    date: date
    category: str   # added category here too for consistency

    class Config:
        from_attributes = True

class IncomeDTOResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    category: str

    class Config:
        from_attributes = True

# =========================
# User DTOs
# =========================
class UserDTOPetition(BaseModel):
    full_name: str
    birth_date: date
    location: str
    savings_goal: float
    password: str

    class Config:
        from_attributes = True

class UserDTOResponse(BaseModel):
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

    class Config:
        from_attributes = True

# =========================
# Auth DTOs
# =========================
class LoginDTO(BaseModel):
    username: str
    password: str

class TokenDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
