"""
app/api/models/tablesSQL.py

SQLAlchemy ORM models for FinanceApp.

Notes / design decisions:
 - Models are intentionally simple and oriented for a small demo app.
 - Relationships use `back_populates` so related collections (user.expenses / user.incomes / user.categories)
   are available and kept in sync by SQLAlchemy.
 - Computed properties on User (total_expenses, total_incomes, balance, savings_progress) are implemented
   as Python @property methods and computed in-memory from the loaded relationships. This is adequate for
   a demo. For large datasets consider computing aggregates with SQL queries for performance.
 - Column sizes (String lengths) are conservative; password stored in `String(255)` to accommodate bcrypt hashes.
 - For production, consider adding:
    - created_at / updated_at timestamps (server-side default / triggers or SQLAlchemy events)
    - an 'is_active' boolean on users
    - unique constraints where appropriate (e.g., unique username)
    - explicit index definitions for commonly queried columns
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.dataBase.configuration import Base
from datetime import date, datetime, timezone

# =========================
# User Table
# =========================
class User(Base):
    """
    users table

    Fields:
      - id: primary key
      - full_name: user's display name (used as login username in this demo)
      - birth_date: stored as DATE
      - location: free-text location
      - savings_goal: numeric goal to track savings progress
      - password: hashed password (bcrypt); stored as text (up to 255 chars)

    Relationships:
      - expenses: one-to-many to Expense
      - incomes: one-to-many to Income
      - categories: one-to-many to Category

    Computed properties:
      - total_expenses: sum of all linked expense.amount values
      - total_incomes: sum of all linked income.amount values
      - balance: incomes - expenses
      - savings_progress: percentage of savings_goal achieved (rounded to 2 decimals)
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    birth_date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(100), nullable=False)
    savings_goal = Column(Float, nullable=False)
    password = Column(String(255), nullable=False)

    # Relationships (cascade deletes to remove user-related data when user is removed)
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")

    # --- Computed properties (accessing related collections in memory) ---
    @property
    def total_expenses(self) -> float:
        """Return sum of amounts for this user's expenses (0.0 if none)."""
        return sum(exp.amount for exp in self.expenses) if self.expenses else 0.0

    @property
    def total_incomes(self) -> float:
        """Return sum of amounts for this user's incomes (0.0 if none)."""
        return sum(inc.amount for inc in self.incomes) if self.incomes else 0.0

    @property
    def balance(self) -> float:
        """Net balance (incomes - expenses)."""
        return self.total_incomes - self.total_expenses

    @property
    def savings_progress(self) -> float:
        """
        Percent progress toward the savings_goal.
        Returns a rounded float (2 decimals). If savings_goal is 0 or negative returns 0.0.
        """
        if self.savings_goal > 0:
            return round((self.balance / self.savings_goal) * 100, 2)
        return 0.0


# =========================
# Category Table
# =========================
class Category(Base):
    """
    categories table

    Fields:
      - id: primary key
      - name: category name shown to the user
      - description: optional text describing the category
      - value: optional numeric field (unused in most flows but kept for extension)
      - date: creation or reference date (defaults to today())
      - is_global: boolean flag; True indicates this category is a shared/global template
      - user_id: nullable foreign key; if NULL and is_global==True -> category is a global template
                 otherwise user_id links the category to the owner user.
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    value = Column(Float, default=0.0)
    date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    is_global = Column(Boolean, default=False)

    # Ownership: user_id is nullable so global templates can exist without an owner.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="categories")


# =========================
# Expense Table (links to Category by id)
# =========================
class Expense(Base):
    """
    expenses table

    Fields:
      - id: primary key
      - description: text describing the expense
      - amount: numeric amount (stored as float)
      - date: date of the expense
      - category_id: FK to categories.id (not nullable)
      - user_id: FK to users.id (owner of the expense)
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    # Simple relationship to Category used to read category name when returning DTOs
    category = relationship("Category")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="expenses")


# =========================
# Income Table (links to Category by id)
# =========================
class Income(Base):
    """
    incomes table (mirror of Expense but for positive amounts)

    Fields:
      - id, description, amount, date
      - category_id: FK to categories.id (not nullable)
      - user_id: FK to users.id (owner of the income)
    """
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    category = relationship("Category")

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="incomes")
