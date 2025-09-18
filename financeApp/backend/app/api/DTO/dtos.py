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
        orm_mode = True


class UserDTOResponse(BaseModel):
    id: int
    full_name: str
    birth_date: date
    location: str
    savings_goal: float
    expenses: List['ExpenseDTOResponse'] = []
    incomes: List['IncomeDTOResponse'] = []
    categories: List['CategoryDTOResponse'] = []

    class Config:
        orm_mode = True


# =========================
# Expense DTOs
# =========================
class ExpenseDTOPetition(BaseModel):
    description: str
    category: str
    amount: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


class ExpenseDTOResponse(BaseModel):
    id: int
    description: str
    category: str
    amount: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


# =========================
# Category DTOs
# =========================
class CategoryDTOPetition(BaseModel):
    name: str
    description: str
    value: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


class CategoryDTOResponse(BaseModel):
    id: int
    name: str
    description: str
    value: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


# =========================
# Income DTOs
# =========================
class IncomeDTOPetition(BaseModel):
    description: str
    amount: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


class IncomeDTOResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    user_id: int

    class Config:
        orm_mode = True


# =========================
# Auth DTOs (Login & Token)
# =========================
class LoginDTO(BaseModel):
    username: str   # in our case this will be full_name or email
    password: str


class TokenDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
