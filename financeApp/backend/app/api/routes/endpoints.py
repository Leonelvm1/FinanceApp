from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.DTO.dtos import (
    UserDTOPetition, UserDTOResponse,
    ExpenseDTOPetition, ExpenseDTOResponse,
    CategoryDTOPetition, CategoryDTOResponse,
    IncomeDTOPetition, IncomeDTOResponse,
    BalanceDTOResponse
)
from app.api.models.tablesSQL import User, Expense, Category, Income
from app.dataBase.configuration import SessionLocal
from passlib.hash import bcrypt
from datetime import timedelta, datetime
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# =========================
# JWT Config
# =========================
SECRET_KEY = "your-secret-key"  # ⚠️ change this for production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

rutes = APIRouter()

# =========================
# DB connection
# =========================
def connectDB():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()

# =========================
# JWT Helper Functions
# =========================
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), database: Session = Depends(connectDB)):
    """Validates JWT token and retrieves current user"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = database.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# =========================
# User Endpoints
# =========================
@rutes.post("/users/", response_model=UserDTOResponse, summary="Create a new user")
def create_user(userData: UserDTOPetition, database: Session = Depends(connectDB)):
    """Registers a new user with hashed password"""
    try:
        hashed_password = bcrypt.hash(userData.password)
        user = User(
            full_name=userData.full_name,
            birth_date=userData.birth_date,
            location=userData.location,
            savings_goal=userData.savings_goal,
            password=hashed_password
        )
        database.add(user)
        database.commit()
        database.refresh(user)
        return user
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"User creation failed: {error}")

@rutes.get("/users/", response_model=List[UserDTOResponse], summary="Get all users")
def get_users(database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Returns all registered users (protected endpoint)"""
    try:
        return database.query(User).all()
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Failed to retrieve users: {error}")

# =========================
# Login Endpoint
# =========================
@rutes.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), database: Session = Depends(connectDB)):
    """Authenticates user and returns a JWT token"""
    user = database.query(User).filter(User.full_name == form_data.username).first()
    if not user or not bcrypt.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# =========================
# Expense Endpoints
# =========================
@rutes.post("/expenses/", response_model=ExpenseDTOResponse, summary="Create a new expense")
def create_expense(expenseData: ExpenseDTOPetition, database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Creates a new expense linked to a category and user"""
    try:
        category = database.query(Category).filter(Category.id == expenseData.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        expense = Expense(
            description=expenseData.description,
            amount=expenseData.amount,
            date=expenseData.date,
            user_id=current_user.id,
            category_id=expenseData.category_id
        )
        database.add(expense)
        database.commit()
        database.refresh(expense)

        return ExpenseDTOResponse(
            id=expense.id,
            description=expense.description,
            amount=expense.amount,
            date=expense.date,
            user_id=expense.user_id,
            category_id=expense.category_id,
            category_name=category.name
        )
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Expense creation failed: {error}")

@rutes.get("/expenses/", response_model=List[ExpenseDTOResponse], summary="Get all expenses")
def get_expenses(database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Returns all expenses for the authenticated user"""
    try:
        expenses = database.query(Expense).filter(Expense.user_id == current_user.id).all()
        response = []
        for exp in expenses:
            category = database.query(Category).filter(Category.id == exp.category_id).first()
            response.append(
                ExpenseDTOResponse(
                    id=exp.id,
                    description=exp.description,
                    amount=exp.amount,
                    date=exp.date,
                    user_id=exp.user_id,
                    category_id=exp.category_id,
                    category_name=category.name if category else None
                )
            )
        return response
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Failed to retrieve expenses: {error}")

# =========================
# Category Endpoints
# =========================
@rutes.post("/categories/", response_model=CategoryDTOResponse, summary="Create a new category")
def create_category(categoryData: CategoryDTOPetition, database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Creates a new custom category for the authenticated user"""
    try:
        category = Category(
            name=categoryData.name,
            description=categoryData.description,
            is_global=categoryData.is_global,
            user_id=current_user.id
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
    """Returns both global and user-specific categories"""
    try:
        return database.query(Category).all()
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Failed to retrieve categories: {error}")

# =========================
# Income Endpoints
# =========================
@rutes.post("/incomes/", response_model=IncomeDTOResponse, summary="Create a new income")
def create_income(incomeData: IncomeDTOPetition, database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Creates a new income for the authenticated user"""
    try:
        income = Income(
            description=incomeData.description,
            amount=incomeData.amount,
            date=incomeData.date,
            user_id=current_user.id
        )
        database.add(income)
        database.commit()
        database.refresh(income)
        return income
    except Exception as error:
        database.rollback()
        raise HTTPException(status_code=400, detail=f"Income creation failed: {error}")

@rutes.get("/incomes/", response_model=List[IncomeDTOResponse], summary="Get all incomes")
def get_incomes(database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Returns all incomes for the authenticated user"""
    try:
        return database.query(Income).filter(Income.user_id == current_user.id).all()
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Failed to retrieve incomes: {error}")

# =========================
# Balance Endpoint
# =========================
@rutes.get("/users/me/balance", response_model=BalanceDTOResponse, summary="Get current user balance")
def get_balance(database: Session = Depends(connectDB), current_user: User = Depends(get_current_user)):
    """Calculates balance for the authenticated user"""
    try:
        incomes = database.query(Income).filter(Income.user_id == current_user.id).all()
        expenses = database.query(Expense).filter(Expense.user_id == current_user.id).all()

        total_income = sum([i.amount for i in incomes])
        total_expense = sum([e.amount for e in expenses])
        balance = total_income - total_expense

        return BalanceDTOResponse(
            user_id=current_user.id,
            total_income=total_income,
            total_expense=total_expense,
            balance=balance
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=f"Failed to calculate balance: {error}")
