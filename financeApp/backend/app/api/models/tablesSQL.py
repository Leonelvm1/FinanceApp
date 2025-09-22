from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.dataBase.configuration import Base
from datetime import date

# =========================
# User Table
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    birth_date = Column(Date, nullable=False)
    location = Column(String(100), nullable=False)
    savings_goal = Column(Float, nullable=False)
    password = Column(String(255), nullable=False)

    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")

    # Computed properties
    @property
    def total_expenses(self) -> float:
        return sum(exp.amount for exp in self.expenses) if self.expenses else 0.0

    @property
    def total_incomes(self) -> float:
        return sum(inc.amount for inc in self.incomes) if self.incomes else 0.0

    @property
    def balance(self) -> float:
        return self.total_incomes - self.total_expenses

    @property
    def savings_progress(self) -> float:
        if self.savings_goal > 0:
            return round((self.balance / self.savings_goal) * 100, 2)
        return 0.0

# =========================
# Expense Table
# =========================
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="expenses")

# =========================
# Income Table
# =========================
class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="incomes")

# =========================
# Category Table
# =========================
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    value = Column(Float, default=0.0)
    date = Column(Date, default=date.today, nullable=False)  # <-- Corregido
    is_global = Column(Boolean, default=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="categories")
