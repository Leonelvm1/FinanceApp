# app/utils/security.py
"""
Password hashing utilities.

Uses passlib CryptContext with bcrypt as the scheme.
 - hash_password(plain) -> hashed string (store this in DB)
 - verify_password(plain, hashed) -> bool

Notes:
 - bcrypt hashes are safe to store in a VARCHAR(255) column.
 - Keep the CryptContext config here so you can adjust work factor centrally.
"""
from passlib.context import CryptContext

# Configure password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Return a bcrypt hash for the provided plain text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)
