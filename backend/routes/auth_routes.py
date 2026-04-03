from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr

from services.auth_service import create_user, login_user, get_user_profile, get_dataset_analysis


router = APIRouter()


class SignupRequest(BaseModel):
    name: constr(strip_whitespace=True, min_length=1)
    email: EmailStr
    password: constr(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=6)


class AuthResponse(BaseModel):
    message: str
    user: Optional[dict]


@router.post("/signup", response_model=AuthResponse)
def signup(data: SignupRequest):
    try:
        success = create_user(data.name, data.email, data.password)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Signup failed due to server error: {str(exc)}")

    if not success:
        raise HTTPException(status_code=400, detail="User already exists")

    return {
        "message": "Signup successful",
        "user": {
            "name": data.name,
            "email": data.email
        }
    }


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest):
    try:
        user = login_user(data.email, data.password)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Login failed due to server error: {str(exc)}")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }


@router.get("/profile/{email}")
def get_profile(email: str):
    """Get user profile with analysis history"""
    try:
        profile = get_user_profile(email)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(exc)}")
    
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "message": "Profile retrieved successfully",
        "profile": profile
    }


@router.get("/analysis/{email}/{dataset_filename}")
def get_analysis(email: str, dataset_filename: str):
    """Get detailed analysis results for a specific dataset"""
    try:
        analysis = get_dataset_analysis(email, dataset_filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analysis: {str(exc)}")
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Dataset analysis not found")
    
    return {
        "message": "Analysis retrieved successfully",
        "analysis": analysis
    }
