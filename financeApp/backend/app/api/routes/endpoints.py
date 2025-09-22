from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta, datetime, date
from jose import JWTError, jwt
from typing import List
import os
from dotenv import load_dotenv

from app.dataBase.configuration import SessionLocal
from app.api.models.tablesSQL import User, Expense, Income, Category
from app.api.DTO.dtos import (
    UserDTOPetition, UserDTOResponse, TokenDTO,
    ExpenseDTOPetition, ExpenseDTOResponse,
    IncomeDTOPetition, IncomeDTOResponse,
    CategoryDTOPetition, CategoryDTOResponse
)
from app.utils.security import hash_password, verify_password

# =========================
# Environment
# =========================
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# =========================
# Router & OAuth2
# =========================
routes = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# =========================
# Database dependency
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# Auth Utilities
# =========================
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.full_name == username).first()
    if user is None:
        raise credentials_exception
    return user

# =========================
# Auth Endpoints
# =========================
@routes.post("/signup", response_model=UserDTOResponse)
def signup(user: UserDTOPetition, db: Session = Depends(get_db)):
    db_user = User(
        full_name=user.full_name,
        birth_date=user.birth_date,
        location=user.location,
        savings_goal=user.savings_goal,
        password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@routes.post("/login", response_model=TokenDTO)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.full_name == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.full_name},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@routes.get("/users/me", response_model=UserDTOResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# =========================
# Expenses CRUD
# =========================
@routes.post("/expenses", response_model=ExpenseDTOResponse)
def create_expense(expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = Expense(**expense.dict(), user_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@routes.get("/expenses", response_model=List[ExpenseDTOResponse])
def get_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Expense).filter(Expense.user_id == current_user.id).all()

@routes.put("/expenses/{expense_id}", response_model=ExpenseDTOResponse)
def update_expense(expense_id: int, expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for key, value in expense.dict().items():
        setattr(db_expense, key, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@routes.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"detail": "Expense deleted"}

# =========================
# Incomes CRUD
# =========================
@routes.post("/incomes", response_model=IncomeDTOResponse)
def create_income(income: IncomeDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_income = Income(**income.dict(), user_id=current_user.id)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@routes.get("/incomes", response_model=List[IncomeDTOResponse])
def get_incomes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Income).filter(Income.user_id == current_user.id).all()

@routes.put("/incomes/{income_id}", response_model=IncomeDTOResponse)
def update_income(income_id: int, income: IncomeDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    for key, value in income.dict().items():
        setattr(db_income, key, value)
    db.commit()
    db.refresh(db_income)
    return db_income

@routes.delete("/incomes/{income_id}")
def delete_income(income_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(db_income)
    db.commit()
    return {"detail": "Income deleted"}

# =========================
# Categories CRUD
# =========================
@routes.post("/categories", response_model=CategoryDTOResponse)
def create_category(category: CategoryDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_category = Category(**category.dict(), user_id=current_user.id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@routes.get("/categories", response_model=List[CategoryDTOResponse])
def get_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.user_id == current_user.id).all()

@routes.put("/categories/{category_id}", response_model=CategoryDTOResponse)
def update_category(category_id: int, category: CategoryDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

@routes.delete("/categories/{category_id}")
def delete_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted"}
