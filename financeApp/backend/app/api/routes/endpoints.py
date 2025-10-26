# app/api/routes/endpoints.py
"""
Main API endpoints for the FinanceApp.

Changes made:
- Login now sets an HttpOnly cookie `access_token` as well as returning the token in the response
  (backwards-compatible).
- Added logout to clear the cookie.
- get_current_user accepts token from Authorization header (oauth2), or cookie named `access_token`.
- get_categories supports both authenticated and anonymous callers by attempting token extraction.

Make sure to set environment variables:
- SECRET_KEY
- ALGORITHM (optional, defaults to HS256)
- ACCESS_TOKEN_EXPIRE_MINUTES (optional)
- COOKIE_SECURE = "True" for production HTTPS; "False" for local dev (default).
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, date
from jose import JWTError, jwt
from typing import List, Optional
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

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() in ("1", "true", "yes")

routes = APIRouter()
# oauth2_scheme will attempt to find Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def _extract_token_from_request(request: Request, oauth_token: Optional[str] = None) -> Optional[str]:
    """
    Try to get a token from:
      1) oauth_token (provided by OAuth2PasswordBearer if Authorization header present)
      2) Authorization header (safer check, but oauth_token usually already covers it)
      3) Cookie 'access_token'
    Returns token string or None if not present.
    """
    # 1) token from dependency (Authorization header parsed by oauth2_scheme)
    if oauth_token:
        return oauth_token

    # 2) raw Authorization header (defensive)
    auth = request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()

    # 3) cookie
    cookie = request.cookies.get("access_token")
    if cookie:
        return cookie

    return None

def get_current_user(token: str = Depends(oauth2_scheme), request: Request = None, db: Session = Depends(get_db)):
    """
    Dependency that returns the current authenticated user or raises 401.
    It accepts token from Authorization header (Bearer) or cookie named 'access_token'.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if request is None:
        # FastAPI will normally supply request - ensure safe fallback
        raise credentials_exception

    token_to_use = _extract_token_from_request(request, token)
    if not token_to_use:
        raise credentials_exception

    try:
        payload = jwt.decode(token_to_use, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.full_name == username).first()
    if user is None:
        raise credentials_exception
    return user

# -------------------------
# Helpers to map models -> response dicts
# -------------------------
def expense_to_response(exp: Expense):
    return {
        "id": exp.id,
        "description": exp.description,
        "amount": exp.amount,
        "date": exp.date,
        "category_id": exp.category_id,
        "category_name": exp.category.name if exp.category else None,
    }

def income_to_response(inc: Income):
    return {
        "id": inc.id,
        "description": inc.description,
        "amount": inc.amount,
        "date": inc.date,
        "category_id": inc.category_id,
        "category_name": inc.category.name if inc.category else None,
    }

def category_to_response(cat: Category):
    return {
        "id": cat.id,
        "name": cat.name,
        "is_global": bool(cat.is_global),
    }

# Clone default categories for new user
def clone_default_categories_for_user(db: Session, user_id: int):
    default_categories = db.query(Category).filter(Category.user_id == None, Category.is_global == True).all()
    for cat in default_categories:
        new_cat = Category(
            name=cat.name,
            description=cat.description,
            value=0.0,
            date=date.today(),
            user_id=user_id,
            is_global=False
        )
        db.add(new_cat)
    db.commit()

# =========================
# Auth Endpoints
# =========================
@routes.post("/signup", response_model=UserDTOResponse)
def signup(user: UserDTOPetition, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.full_name == user.full_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

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

    clone_default_categories_for_user(db, int(db_user.id))

    # Return full user info (similar to read_users_me)
    return read_users_me(current_user=db_user, db=db)

@routes.post("/login", response_model=TokenDTO)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint. Expects form data: username & password (OAuth2PasswordRequestForm).
    Sets an HttpOnly cookie 'access_token'. Also returns the token in response for backward compatibility.
    """
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

    # Set cookie: HttpOnly so JavaScript cannot access it. Use samesite=lax for CSRF balance.
    # Use secure=True in production (HTTPS). Control with COOKIE_SECURE env var.
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Return token as fallback for clients that still use Authorization header
    return {"access_token": access_token, "token_type": "bearer"}

@routes.post("/logout")
def logout(response: Response):
    """
    Logout endpoint: clear cookie and return success.
    """
    response.delete_cookie("access_token")
    return {"message": "logged out"}

@routes.get("/users/me", response_model=UserDTOResponse)
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == current_user.id).first()

    incomes = [income_to_response(i) for i in db_user.incomes]
    expenses = [expense_to_response(e) for e in db_user.expenses]
    categories = [category_to_response(c) for c in db_user.categories]

    return {
        "id": db_user.id,
        "full_name": db_user.full_name,
        "birth_date": db_user.birth_date,
        "location": db_user.location,
        "savings_goal": db_user.savings_goal,
        "expenses": expenses,
        "incomes": incomes,
        "categories": categories,
        "total_expenses": db_user.total_expenses,
        "total_incomes": db_user.total_incomes,
        "balance": db_user.balance,
        "savings_progress": db_user.savings_progress,
    }

# =========================
# Expenses CRUD
# =========================
@routes.post("/expenses", response_model=ExpenseDTOResponse)
def create_expense(expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == expense.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    db_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        date=expense.date,
        category_id=expense.category_id,
        user_id=current_user.id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return expense_to_response(db_expense)

@routes.get("/expenses", response_model=List[ExpenseDTOResponse])
def get_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    return [expense_to_response(r) for r in results]

@routes.put("/expenses/{expense_id}", response_model=ExpenseDTOResponse)
def update_expense(expense_id: int, expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    cat = db.query(Category).filter(Category.id == expense.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")

    db_expense.description = expense.description
    db_expense.amount = expense.amount
    db_expense.date = expense.date
    db_expense.category_id = expense.category_id
    db.commit()
    db.refresh(db_expense)
    return expense_to_response(db_expense)

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
    cat = db.query(Category).filter(Category.id == income.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    db_income = Income(
        description=income.description,
        amount=income.amount,
        date=income.date,
        category_id=income.category_id,
        user_id=current_user.id
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return income_to_response(db_income)

@routes.get("/incomes", response_model=List[IncomeDTOResponse])
def get_incomes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(Income).filter(Income.user_id == current_user.id).all()
    return [income_to_response(r) for r in results]

@routes.put("/incomes/{income_id}", response_model=IncomeDTOResponse)
def update_income(income_id: int, income: IncomeDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not db_income:
        raise HTTPException(status_code=404, detail="Income not found")
    cat = db.query(Category).filter(Category.id == income.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")

    db_income.description = income.description
    db_income.amount = income.amount
    db_income.date = income.date
    db_income.category_id = income.category_id
    db.commit()
    db.refresh(db_income)
    return income_to_response(db_income)

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
    db_category = Category(**category.dict(), user_id=current_user.id, is_global=False)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return category_to_response(db_category)

@routes.get("/categories", response_model=List[CategoryDTOResponse])
def get_categories(request: Request, db: Session = Depends(get_db)):
    """
    Return:
      - If Authorization Bearer token or cookie provided and valid -> categories for that user + global ones
      - If no valid token provided -> only global categories
    """
    user = None
    token = _extract_token_from_request(request, None)
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username:
                user = db.query(User).filter(User.full_name == username).first()
        except JWTError:
            user = None

    if user:
        cats = db.query(Category).filter((Category.user_id == user.id) | (Category.is_global == True)).all()
    else:
        cats = db.query(Category).filter(Category.is_global == True).all()

    return [category_to_response(c) for c in cats]


@routes.put("/categories/{category_id}", response_model=CategoryDTOResponse)
def update_category(category_id: int, category: CategoryDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return category_to_response(db_category)

@routes.delete("/categories/{category_id}")
def delete_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted"}
