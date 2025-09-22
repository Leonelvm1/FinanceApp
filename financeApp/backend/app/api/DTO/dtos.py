from pydantic import BaseModel
from datetime import date
from typing import List, Optional

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
        from_attributes = True  # v2 de Pydantic reemplaza orm_mode

class UserDTOResponse(BaseModel):
    id: int
    full_name: str
    birth_date: date
    location: str
    savings_goal: float

    expenses: List['ExpenseDTOResponse'] = []
    incomes: List['IncomeDTOResponse'] = []
    categories: List['CategoryDTOResponse'] = []

    total_expenses: float
    total_incomes: float
    balance: float
    savings_progress: float

    class Config:
        from_attributes = True

# =========================
# Expense DTOs
# =========================
class ExpenseDTOPetition(BaseModel):
    description: str
    category: str
    amount: float
    date: date

    class Config:
        from_attributes = True

class ExpenseDTOResponse(BaseModel):
    id: int
    description: str
    category: str
    amount: float
    date: date
    user_id: int

    class Config:
        from_attributes = True

# =========================
# Income DTOs
# =========================
class IncomeDTOPetition(BaseModel):
    description: str
    amount: float
    date: date

    class Config:
        from_attributes = True

class IncomeDTOResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    user_id: int

    class Config:
        from_attributes = True

# =========================
# Category DTOs
# =========================
class CategoryDTOPetition(BaseModel):
    name: str
    description: Optional[str] = None
    value: float
    date: date

    class Config:
        from_attributes = True

class CategoryDTOResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    value: float
    date: date
    user_id: int

    class Config:
        from_attributes = True

# =========================
# Auth DTOs
# =========================
class LoginDTO(BaseModel):
    username: str  # full_name o email
    password: str

class TokenDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
