from passlib.context import CryptContext

# Create a password context using Passlib
# We specify bcrypt as the hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Takes a plain text password and returns the bcrypt hash.
    Use this when creating or updating a user password.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain text password matches the hashed password stored in the database.
    Returns True if they match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
