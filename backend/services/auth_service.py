from database.db import users_collection
from passlib.context import CryptContext

# Use a hashing scheme that does not depend on the system bcrypt backend.
# This avoids native-module issues on some Windows setups.
pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password):
    return pwd.hash(password)

def verify_password(password, hashed):
    return pwd.verify(password, hashed)


def create_user(name, email, password):

    if users_collection.find_one({"email": email}):
        return False

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password)
    })

    return True


def login_user(email, password):

    user = users_collection.find_one({"email": email})

    if not user:
        return None

    if not verify_password(password, user["password"]):
        return None

    return user