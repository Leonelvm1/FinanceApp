from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.params import Depends
from app.api.DTO.dtos import (
    UserDTOPetition, UserDTOResponse,
    ExpenseDTOPetition, ExpenseDTOResponse,
    CategoryDTOPetition, CategoryDTOResponse,
    IncomeDTOPetition, IncomeDTOResponse
)

from app.api.models.tablesSQL import User, Expense, Category, Income
from app.dataBase.configuration import SessionLocal

rutes = APIRouter()

# =========================
# DB connection
# =========================
def connectDB():
    try:
        database = SessionLocal()
        yield database
    except Exception as error:
        database.rollback()
        raise error
    finally:
        database.close()

# =========================
# User Endpoints
# =========================
@rutes.post("/users/", response_model=UserDTOResponse, summary="Create a new user")
def safe_user(userData: UserDTOPetition, database: Session = Depends(connectDB)):
    try:
        user = User(
            full_name=userData.full_name,
            birth_date=userData.birth_date,
            location=userData.location,
            savings_goal=userData.savings_goal,
            password=userData.password
        )
        database.add(user)
        database.commit()
        database.refresh(user)
        return user
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"User creation failed: {error}")
    
@rutes.get("/users/", response_model=List[UserDTOResponse], summary="Get all users")
def get_users(database: Session = Depends(connectDB)):
    try:
        users = database.query(User).all()
        return users
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to retrieve users: {error}")

# =========================
# Expense Endpoints
# =========================
@rutes.post("/expenses/", response_model=ExpenseDTOResponse, summary="Create a new expense")
def safe_expense(expenseData: ExpenseDTOPetition, database: Session = Depends(connectDB)):
    try:
        expense = Expense(
            description=expenseData.description,
            category=expenseData.category,
            amount=expenseData.amount,
            date=expenseData.date,
            user_id=expenseData.user_id
        )
        database.add(expense)
        database.commit()
        database.refresh(expense)
        return expense
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Expense creation failed: {error}")
    
@rutes.get("/expenses/", response_model=List[ExpenseDTOResponse], summary="Get all expenses")
def get_expenses(database: Session = Depends(connectDB)):
    try:
        expenses = database.query(Expense).all()
        return expenses
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to retrieve expenses: {error}")

# =========================
# Category Endpoints
# =========================
@rutes.post("/categories/", response_model=CategoryDTOResponse, summary="Create a new category")
def safe_category(categoryData: CategoryDTOPetition, database: Session = Depends(connectDB)):
    try:
        category = Category(
            name=categoryData.name,
            description=categoryData.description,
            value=categoryData.value,
            date=categoryData.date,
            user_id=categoryData.user_id
        )
        database.add(category)
        database.commit()
        database.refresh(category)
        return category
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Category creation failed: {error}")

@rutes.get("/categories/", response_model=List[CategoryDTOResponse], summary="Get all categories")
def get_categories(database: Session = Depends(connectDB)):
    try:
        categories = database.query(Category).all()
        return categories
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to retrieve categories: {error}")

# =========================
# Income Endpoints
# =========================
@rutes.post("/incomes/", response_model=IncomeDTOResponse, summary="Create a new income")
def safe_income(incomeData: IncomeDTOPetition, database: Session = Depends(connectDB)):
    try:
        income = Income(
            description=incomeData.description,
            amount=incomeData.amount,
            date=incomeData.date,
            user_id=incomeData.user_id
        )
        database.add(income)
        database.commit()
        database.refresh(income)
        return income
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Income creation failed: {error}")

@rutes.get("/incomes/", response_model=List[IncomeDTOResponse], summary="Get all incomes")
def get_incomes(database: Session = Depends(connectDB)):
    try:
        incomes = database.query(Income).all()
        return incomes
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to retrieve incomes: {error}")
