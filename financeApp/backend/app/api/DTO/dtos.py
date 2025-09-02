from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

#User DTOs
class UserDTOPetition(BaseModel):
    name: string
    birthDate: string
    location: string
    savingsGoal: number
    password: string

    class Config:
        orm_mode = True

class UserDTOResponse(BaseModel):
    id: int
    name: string
    savingsGoal: number
    password: string
    expenses: List['ExpenseDTOResponse'] = []  # Related expenses
    incomes: List['IncomeDTOResponse'] = []    # Related incomes
    categories: List['CategoryDTOResponse'] = []  # Related categories
 
    class Config:
        orm_mode = True

#Expense DTOs
class ExpenseDTOPetition(BaseModel):
    description: str
    category: str
    amount: float
    date: date
    userId: int

    class Config:
        orm_mode = True

class ExpenseDTOResponse(BaseModel):
    id: int
    description: str
    category: str
    amount: float
    date: date
    userId: int

    class Config:
        orm_mode = True

#category DTOs
class CategoryDTOPetition(BaseModel):
    name: str
    description: str
    value: float
    date: date
    userId: int

    class Config:
        orm_mode = True

class CategoryDTOResponse(BaseModel):
    id: int
    name: str
    description: str
    value: float
    date: date
    userId: int

    class Config:
        orm_mode = True

#Income DTOs
class IncomeDTOPetition(BaseModel):
    description: str
    value: float
    date: date
    userId: int

    class Config:
        orm_mode = True

class IncomeDTOResponse(BaseModel):
    id: int
    description: str
    value: float
    date: date
    userId: int

    class Config:
        orm_mode = True