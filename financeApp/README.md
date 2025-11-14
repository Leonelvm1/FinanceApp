# FinanceApp — Demo Personal Finance Tracker

**FinanceApp** is a small demo project built as a junior full-stack showcase:

- **Frontend:** React (Vite) + React Router + Axios + Framer Motion + Bootstrap
- **Backend:** FastAPI (Python) + SQLAlchemy
- **Database (development):** Microsoft SQL Server (SSMS) via pyodbc
- **Auth:** Cookie-based authentication (HttpOnly cookie storing a JWT)
- **Password hashing:** bcrypt via passlib

This repository is a demonstration of a typical full-stack flow:

- Sign up → server hashes password → server clones global categories for the user → login → server 
  sets HttpOnly cookie → frontend loads `/users/me` to render the Dashboard.
- Dashboard shows totals, recent incomes/expenses, and allows CRUD for incomes, expenses and categories.

---

## Why this project

- Clean, practical example of frontend-backend integration for junior developers.
- Demonstrates cookie-based auth, secure password handling, DB modeling and simple UX patterns (forms, modals, filters).
- Ready to deploy to common static hosting (Netlify) for frontend and to a simple cloud VPS or serverless deployment for backend.

---

## Quick start (development)

> Ensure you have Python (3.10+ recommended), Node 18+, and SQL Server (or Docker image) available.

### Backend (FastAPI)

1. Create a Python virtual environment and install backend deps:

````bash
cd backend
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell
pip install -r requirements.txt  # ensure requirements.txt includes fastapi, sqlalchemy, python-dotenv, passlib, jose, pyodbc, etc.


2. Configure environment variables. Create .env in backend/ (example below in "Environment" section).

3. Run the backend:
uvicorn main:app --reload --factory --port 8000
# or if not using factory: uvicorn app.main:app --reload --port 8000
Visit http://localhost:8000/docs to see OpenAPI (Swagger) docs.



### Frontend (React + Vite)

1. Install deps and run:
cd frontend
npm install
npm run dev

2. Open http://localhost:5173 (Vite dev server). Ensure VITE_API_URL env var points to http://localhost:8000 or use a Vite proxy for same-origin.


# backend/.env.example
SECRET_KEY=replace-with-a-strong-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
COOKIE_SECURE=False

DB_USER=dev_user
DB_PASS=FinanceDB
DB_HOST=172.22.96.1
DB_PORT=1433
DB_NAME=FinanceDB
ODBC_DRIVER=ODBC Driver 18 for SQL Server

FRONTEND_ORIGINS=http://localhost:5173


# frontend/.env
VITE_API_URL=http://localhost:8000



///////////////////////////////

API reference
Authentication (cookie-first)

POST /signup — create account
Request JSON:

{ "full_name": "Alice", "birth_date": "1990-01-01", "location":"City", "savings_goal":1000, "password":"MyP@ssw0rd!" }


Response: user DTO (without password).

POST /login — form-encoded (OAuth2PasswordRequestForm)
Required headers: Content-Type: application/x-www-form-urlencoded
Body example: username=Alice&password=MyP@ssw0rd!
On success: server sets an HttpOnly cookie access_token. Response body also contains access_token (legacy).

POST /logout — clears cookie.

GET /users/me — returns user dashboard object (requires cookie).

Resources

GET/POST/PUT/DELETE /expenses

GET/POST/PUT/DELETE /incomes

GET/POST/PUT/DELETE /categories

All protected endpoints require the cookie set by /login. For requests initiated by the browser, ensure withCredentials: true is used (frontend is already configured this way).

Database & Migrations

Dev uses SQLAlchemy Base.metadata.create_all() for convenience.

For versioned schema changes use Alembic:

pip install alembic

alembic init alembic

Configure alembic/env.py to read dataBaseConnection from app.dataBase.configuration.

alembic revision --autogenerate -m "message"

alembic upgrade head

If you change column types (e.g., password length, add created_at, is_active) generate and review migrations before applying.

## Project structure

Below is a quick visual of the repository layout so reviewers can understand the app layers at a glance.

### 1) File tree (developer-friendly)
Use this when you want a quick, copy-paste snapshot. To regenerate locally run:
```bash
# from repo root (Linux / macOS / WSL / Git Bash)
tree -I "node_modules|__pycache__|venv|dist|build" -L 4

├── README.md
├── backend
│   ├── alembic
│   │   ├── README
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions
│   │       ├── c8c492b3bcbc_initial_schema_regenerated_after_fixing_.py
│   │       └── c8c492b3bcbc_initial_schema_regenerated_after_fixing_.py.bak
│   ├── alembic.ini
│   ├── app
│   │   ├── api
│   │   │   ├── DTO
│   │   │   ├── models
│   │   │   └── routes
│   │   ├── dataBase
│   │   │   └── configuration.py
│   │   ├── seed
│   │   │   └── seed_categories.py
│   │   └── utils
│   │       └── security.py
│   ├── main.py
│   ├── requirements.txt
│   └── test_conn.py
└── frontend
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public
    │   └── vite.svg
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── assets
    │   │   ├── logoFinanceApp.png
    │   │   └── react.svg
    │   ├── components
    │   │   ├── CategoryForm.jsx
    │   │   ├── CategoryList.jsx
    │   │   ├── ExpenseForm.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── IncomeForm.jsx
    │   │   ├── Layout.jsx
    │   │   └── Navbar.jsx
    │   ├── context
    │   │   ├── AuthContext.jsx
    │   │   └── CategoryContext.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── Categories.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── Home.jsx
    │   │   ├── Incomes.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── services
    │   │   └── api.js
    │   └── utils
    │       └── validatePassword.js
    └── vite.config.js
````
