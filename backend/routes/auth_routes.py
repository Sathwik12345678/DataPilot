from fastapi import APIRouter, HTTPException
from services.auth_service import create_user, login_user

router = APIRouter()

@router.post("/signup")
def signup(data: dict):
    try:
        success = create_user(
            data["name"],
            data["email"],
            data["password"],
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Signup failed due to server error")

    if not success:
        raise HTTPException(status_code=400, detail="User exists")

    return {"message": "Signup successful"}


@router.post("/login")
def login(data: dict):
    try:
        user = login_user(data["email"], data["password"])
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed due to server error")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login success",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }