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
    password: str  # plaintext → se encripta antes de guardar

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
    amount: float
    date: date
    user_id: int
    category_id: int  # foreign key

    class Config:
        orm_mode = True


class ExpenseDTOResponse(BaseModel):
    id: int
    description: str
    amount: float
    date: date
    user_id: int
    category_id: int
    category_name: Optional[str] = None  # lo llenamos en la query

    class Config:
        orm_mode = True


# =========================
# Category DTOs
# =========================
class CategoryDTOPetition(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: Optional[int] = None  # None si es global
    is_global: bool = False

    class Config:
        orm_mode = True


class CategoryDTOResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_global: bool
    user_id: Optional[int] = None

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
# Balance DTO
# =========================
class BalanceDTOResponse(BaseModel):
    user_id: int
    total_income: float
    total_expense: float
    balance: float
