from app.dataBase.configuration import engine, SessionLocal, Base
from app.api.models.tablesSQL import Category
from datetime import date

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
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        for cat in DEFAULT_CATEGORIES:
            exists = session.query(Category).filter_by(name=cat["name"]).first()
            if not exists:
                session.add(Category(
                    name=cat["name"],
                    description=cat["description"],
                    is_global=True if hasattr(Category, "is_global") else False,
                    user_id=None,
                    date=date.today()
                ))
        session.commit()
    finally:
        session.close()

if __name__ == "__main__":
    seed_categories()
