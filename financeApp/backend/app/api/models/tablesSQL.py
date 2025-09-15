from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.dataBase.configuration import Base

# =========================
# User Table
# =========================
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(50), nullable=False)
    birth_date = Column(Date, nullable=False)
    location = Column(String(100))
    savings_goal = Column(Float, default=0.0)
    password = Column(String(255), nullable=False)  # hashed password
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")


# =========================
# Expense Table
# =========================
class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(200))
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)

    # Relationships
    user = relationship("User", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")


# =========================
# Category Table
# =========================
class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    description = Column(String(200))
    is_global = Column(Boolean, default=False)  # Global or personalized
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Null if global
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="categories")
    expenses = relationship("Expense", back_populates="category", cascade="all, delete-orphan")


# =========================
# Income Table
# =========================
class Income(Base):
    __tablename__ = 'incomes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(100))
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Relationships
    user = relationship("User", back_populates="incomes")
