from database.db import users_collection
from passlib.context import CryptContext

# Use a hashing scheme that does not depend on the system bcrypt backend.
# This avoids native-module issues on some Windows setups.
pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd.verify(password, hashed)


def create_user(name: str, email: str, password: str) -> bool:
    email = email.strip().lower()
    name = name.strip()
    password = password.strip()

    if not name or not email or not password:
        return False

    if users_collection.find_one({"email": email}):
        return False

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password)
    })

    return True


def login_user(email: str, password: str):
    email = email.strip().lower()
    password = password.strip()

    user = users_collection.find_one({"email": email})
    if not user:
        return None

    if not verify_password(password, user.get("password", "")):
        return None

    # Remove password before returning
    safe_user = {"name": user.get("name"), "email": user.get("email")}
    return safe_user