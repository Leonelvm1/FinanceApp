from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.dataBase.configuration import Base

# User Table
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(50))
    birth_date = Column(Date)
    location = Column(String(100))
    savings_goal = Column(Float)
    password = Column(String(50))

    # Relationships with Expense, Income, and Category tables
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")


# Expense Table
class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(200))
    category = Column(String(50))
    amount = Column(Float)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship with User
    user = relationship("User", back_populates="expenses")


# Category Table
class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50))
    description = Column(String(200))
    value = Column(Float)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship with User
    user = relationship("User", back_populates="categories")


# Income Table
class Income(Base):
    __tablename__ = 'incomes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(50))
    amount = Column(Float)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship with User
    user = relationship("User", back_populates="incomes")
