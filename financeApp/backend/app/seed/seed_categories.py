"""
app/seed/seed_categories.py

Seed script for global (template) categories.

Behavior:
 - Ensures DB tables exist by calling Base.metadata.create_all(bind=engine) (convenience for dev).
 - Inserts a short list of default categories if they do not already exist by name.
 - Each seeded category is created with user_id=None and is_global=True so it acts as a template.
 - This script is safe to call multiple times (it checks existence by name).

Notes / Production considerations:
 - For production, prefer using Alembic migrations or a dedicated seeding mechanism rather than
   calling create_all at runtime.
 - If you change the schema (add columns), add an Alembic migration instead of relying on create_all.
"""

from app.dataBase.configuration import engine, SessionLocal, Base
from app.api.models.tablesSQL import Category
from datetime import date

# Default global categories used as templates for new users.
DEFAULT_CATEGORIES = [
    {"name": "Food", "description": "Meals, groceries, dining"},
    {"name": "Transport", "description": "Public transport, fuel, taxi"},
    {"name": "Housing", "description": "Rent, utilities, maintenance"},
    {"name": "Health", "description": "Medical expenses, pharmacy"},
    {"name": "Entertainment", "description": "Movies, subscriptions, events"},
    {"name": "Savings", "description": "Savings or investments"},
    {"name": "Others", "description": "Miscellaneous"},
]

def seed_categories():
    """
    Create DB tables (dev convenience) and seed default categories.

    - If a category with the same name already exists, it will be skipped.
    - This function can be called at app startup (current project calls it in app.main on startup).
    """
    # Ensure tables exist in dev (for production use Alembic).
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        for cat in DEFAULT_CATEGORIES:
            # Check by name to avoid duplicates when re-running the script.
            exists = session.query(Category).filter_by(name=cat["name"]).first()
            if not exists:
                session.add(Category(
                    name=cat["name"],
                    description=cat["description"],
                    # is_global indicates this is a shared template (user_id is None).
                    is_global=True if hasattr(Category, "is_global") else False,
                    user_id=None,
                    date=date.today()
                ))
        session.commit()
    finally:
        session.close()

# Allow running the script directly for local testing:
if __name__ == "__main__":
    seed_categories()
