# app/api/routes/endpoints.py
"""
FinanceApp API endpoints (cookie-only authentication).

Summary of behavior:
 - /signup: creates user, hashes password, clones global categories to the new user, returns user data.
 - /login: expects form-encoded fields (username, password), validates credentials, sets HttpOnly cookie 'access_token'
           and returns the token in the response body for backward compatibility.
 - /logout: clears the 'access_token' cookie.
 - Protected endpoints use get_current_user() which resolves current user from HttpOnly cookie.
 - /categories: if cookie present returns user categories + global categories; if no cookie returns only global categories.

Security notes:
 - Ensure SECRET_KEY, ALGORITHM and cookie behavior are set via environment variables.
 - In production set COOKIE_SECURE=True and serve over HTTPS.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, date, timezone
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

# ----- Config from environment with sensible dev defaults -----
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() in ("1", "true", "yes")

routes = APIRouter()

# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility: create a JWT token (subject 'sub' will be the user's full_name)
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependency: resolve current user from HttpOnly cookie named 'access_token'
def get_current_user(access_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    """
    - Reads JWT from cookie (access_token).
    - Decodes token and finds user by username (full_name).
    - Raises 401 if missing/invalid/expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication credentials (cookie)",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.full_name == username).first()
    if user is None:
        raise credentials_exception
    return user

# -------------------------
# Helpers to map ORM models -> response dicts (keeps endpoints clean)
# -------------------------
def _to_utc_dt(v):
    """Convert date or datetime to UTC-aware datetime."""
    if v is None:
        return None
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    if isinstance(v, date):
        return datetime(v.year, v.month, v.day, tzinfo=timezone.utc)
    return v


def expense_to_response(exp: Expense):
    return {
        "id": exp.id,
        "description": exp.description,
        "amount": exp.amount,
        "date": exp.date.date() if isinstance(exp.date, datetime) else exp.date,
        "category_id": exp.category_id,
        "category_name": exp.category.name if exp.category else None,
    }

def income_to_response(inc: Income):
    return {
        "id": inc.id,
        "description": inc.description,
        "amount": inc.amount,
        "date": inc.date.date() if isinstance(inc.date, datetime) else inc.date,
        "category_id": inc.category_id,
        "category_name": inc.category.name if inc.category else None,
    }

def category_to_response(cat: Category):
    return {
        "id": cat.id,
        "name": cat.name,
        "is_global": bool(cat.is_global),
    }

# Clone default (global) categories for a newly created user
def clone_default_categories_for_user(db: Session, user_id: int):
    """
    Finds categories where user_id is NULL AND is_global is True, clones them to the new user.
    Each cloned category is set to is_global=False and assigned to user_id.
    """
    default_categories = db.query(Category).filter(Category.user_id == None, Category.is_global == True).all()
    for cat in default_categories:
        new_cat = Category(
            name=cat.name,
            description=cat.description,
            value=0.0,
            date=datetime.now(timezone.utc),
            user_id=user_id,
            is_global=False
        )
        db.add(new_cat)
    db.commit()

# ------------------------
# Auth Endpoints
# ------------------------
@routes.post("/signup", response_model=UserDTOResponse)
def signup(user: UserDTOPetition, db: Session = Depends(get_db)):
    """
    Create a new user.

    Flow:
     - Check if user already exists (by full_name).
     - Hash the provided password using hash_password().
     - Create DB user record and commit.
     - Clone default/global categories for this new user.
     - Return the full user representation via read_users_me().
    """
    existing = db.query(User).filter(User.full_name == user.full_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    db_user = User(
        full_name=user.full_name,
        birth_date=_to_utc_dt(user.birth_date),
        location=user.location,
        savings_goal=user.savings_goal,
        password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    clone_default_categories_for_user(db, int(db_user.id))

    # Return full user info (includes aggregates and relations)
    return read_users_me(current_user=db_user, db=db)

@routes.post("/login", response_model=TokenDTO)
def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint.

    - Accepts form-encoded fields ('username' and 'password') via OAuth2PasswordRequestForm.
    - Verifies password using verify_password().
    - Generates a JWT and sets it as HttpOnly cookie 'access_token'.
    - Returns token in JSON body for backward compatibility (clients should prefer cookie).
    """
    username = form_data.username
    password = form_data.password

    user = db.query(User).filter(User.full_name == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.full_name},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Determine effective cookie security for dev vs production.
    # If COOKIE_SECURE is True but the incoming request is HTTP (common in local dev),
    # avoid setting Secure flag so browsers accept the cookie on localhost.
    is_request_https = False
    # Try common headers / request.url.scheme
    try:
        scheme = request.url.scheme
        if scheme and scheme.lower() == 'https':
            is_request_https = True
    except Exception:
        is_request_https = False

    effective_secure = COOKIE_SECURE and is_request_https
    cookie_samesite = 'none' if effective_secure else 'lax'

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=effective_secure,
        samesite=cookie_samesite,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path='/'
    )

    # Return token for backward compatibility
    return {"access_token": access_token, "token_type": "bearer"}

@routes.post("/logout")
def logout(response: Response):
    """Logout endpoint: delete cookie and return success message."""
    response.delete_cookie("access_token")
    return {"message": "logged out"}

@routes.get("/users/me", response_model=UserDTOResponse)
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Return the authenticated user's full view:
      - personal fields (full_name, location, etc.)
      - related incomes, expenses, categories (list of objects)
      - computed aggregates (total_expenses, total_incomes, balance, savings_progress)
    """
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

# ------------------------
# Expenses CRUD
# ------------------------
@routes.post("/expenses", response_model=ExpenseDTOResponse)
def create_expense(expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Create an expense for the current user.
    Validates that the category exists (server-side).
    """
    cat = db.query(Category).filter(Category.id == expense.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    db_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        date=_to_utc_dt(expense.date),
        category_id=expense.category_id,
        user_id=current_user.id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return expense_to_response(db_expense)

@routes.get("/expenses", response_model=List[ExpenseDTOResponse])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Return authenticated user's expenses.

    Optional query params: `start_date` and `end_date` (ISO date strings, e.g. 2023-01-01).
    The server will parse and apply inclusive date range filtering. Dates are treated as local date values
    for comparisons against the stored `Date` column. For future migration to timezone-aware datetimes,
    this function centralizes parsing and normalization.
    """
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    def _parse_to_date(s: Optional[str]):
        if not s:
            return None
        try:
            # Accept either YYYY-MM-DD or full ISO datetime; convert to date
            from datetime import datetime
            if "T" in s:
                return datetime.fromisoformat(s).date()
            return datetime.fromisoformat(s).date() if "-" in s else None
        except Exception:
            return None

    sd = _parse_to_date(start_date)
    ed = _parse_to_date(end_date)

    if sd:
        query = query.filter(Expense.date >= sd)
    if ed:
        query = query.filter(Expense.date <= ed)

    results = query.all()
    return [expense_to_response(r) for r in results]

@routes.put("/expenses/{expense_id}", response_model=ExpenseDTOResponse)
def update_expense(expense_id: int, expense: ExpenseDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update an expense (ownership enforced)."""
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
    """Delete an expense (ownership enforced)."""
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"detail": "Expense deleted"}

# ------------------------
# Incomes CRUD
# ------------------------
@routes.post("/incomes", response_model=IncomeDTOResponse)
def create_income(income: IncomeDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == income.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")
    db_income = Income(
        description=income.description,
        amount=income.amount,
        date=_to_utc_dt(income.date),
        category_id=income.category_id,
        user_id=current_user.id
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return income_to_response(db_income)

@routes.get("/incomes", response_model=List[IncomeDTOResponse])
def get_incomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Return authenticated user's incomes with optional date range filtering.
    See `get_expenses` for parsing rules.
    """
    query = db.query(Income).filter(Income.user_id == current_user.id)

    def _parse_to_date(s: Optional[str]):
        if not s:
            return None
        try:
            from datetime import datetime
            if "T" in s:
                return datetime.fromisoformat(s).date()
            return datetime.fromisoformat(s).date() if "-" in s else None
        except Exception:
            return None

    sd = _parse_to_date(start_date)
    ed = _parse_to_date(end_date)

    if sd:
        query = query.filter(Income.date >= sd)
    if ed:
        query = query.filter(Income.date <= ed)

    results = query.all()
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

# ------------------------
# Categories CRUD
# ------------------------
@routes.post("/categories", response_model=CategoryDTOResponse)
def create_category(category: CategoryDTOPetition, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a user category (is_global=False)."""
    db_category = Category(**category.dict(), user_id=current_user.id, is_global=False)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return category_to_response(db_category)

@routes.get("/categories", response_model=List[CategoryDTOResponse])
def get_categories(access_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    """
    Return categories according to authentication:
      - If cookie present and valid -> return (user categories) + (global categories)
      - If cookie absent/invalid -> return only global categories
    """
    user = None
    if access_token:
        try:
            payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
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
    """Update a category (only owner can update)."""
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return category_to_response(db_category)

@routes.delete("/categories/{category_id}")
def delete_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a category (only owner can delete)."""
    db_category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted"}
