from database.db import users_collection
from passlib.context import CryptContext
from datetime import datetime

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
        "password": hash_password(password),
        "created_at": datetime.utcnow().isoformat(),
        "datasets_analyzed": [],
        "total_analyses": 0
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


def track_dataset_analysis(email: str, filename: str, rows: int, columns: int, analysis_results: dict = None) -> bool:
    """Track a dataset analysis for a user with optional detailed results"""
    email = email.strip().lower()
    
    user = users_collection.find_one({"email": email})
    if not user:
        return False
    
    # Initialize fields if they don't exist
    datasets = user.get("datasets_analyzed", [])
    if not isinstance(datasets, list):
        datasets = []
    
    # Add new dataset analysis with optional detailed results
    dataset_entry = {
        "filename": filename,
        "rows": rows,
        "columns": columns,
        "analyzed_at": datetime.utcnow().isoformat()
    }
    
    # Store analysis results if provided
    if analysis_results:
        dataset_entry["statistics"] = analysis_results.get("statistics", {})
        dataset_entry["column_types"] = analysis_results.get("column_types", {})
        dataset_entry["missing_values"] = analysis_results.get("missing_values", {})
        dataset_entry["top_values"] = analysis_results.get("top_values", {})
        dataset_entry["numeric_column_count"] = analysis_results.get("numeric_column_count", 0)
    
    datasets.append(dataset_entry)
    
    # Update user with new data
    total = user.get("total_analyses", 0)
    
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "datasets_analyzed": datasets,
                "total_analyses": total + 1,
                "last_analysis": datetime.utcnow().isoformat()
            }
        }
    )
    
    return True


def get_user_profile(email: str):
    """Get complete user profile with analysis history"""
    email = email.strip().lower()
    
    user = users_collection.find_one({"email": email})
    if not user:
        return None
    
    # Return safe user data
    return {
        "name": user.get("name"),
        "email": user.get("email"),
        "created_at": user.get("created_at"),
        "datasets_analyzed": user.get("datasets_analyzed", []),
        "total_analyses": user.get("total_analyses", 0),
        "last_analysis": user.get("last_analysis")
    }


def get_dataset_analysis(email: str, dataset_filename: str):
    """Get detailed analysis results for a specific dataset"""
    email = email.strip().lower()
    
    user = users_collection.find_one({"email": email})
    if not user:
        return None
    
    # Find the dataset
    datasets = user.get("datasets_analyzed", [])
    for dataset in datasets:
        if dataset.get("filename") == dataset_filename:
            return dataset
    
    return None