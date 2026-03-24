from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from routes.dataset_routes import router as dataset_router
from routes.auth_routes import router as auth_router   # 🔥 NEW

# Create FastAPI app
app = FastAPI(
    title="DataPilot API",
    description="Smart Data Analytics Backend with DSA + Authentication",
    version="1.1.0"
)

# -------------------------------
# CORS Configuration (IMPORTANT)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Include Routes
# -------------------------------
app.include_router(dataset_router, prefix="", tags=["Dataset"])
app.include_router(auth_router, prefix="", tags=["Authentication"])  # 🔥 NEW

# -------------------------------
# Root Endpoint
# -------------------------------
@app.get("/")
def home():
    return {
        "message": "🚀 DataPilot Backend Running",
        "features": [
            "Dataset Analysis",
            "Charts & Insights",
            "PDF Reports",
            "User Authentication"
        ],
        "status": "success"
    }

# -------------------------------
# Health Check Endpoint
# -------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "DataPilot Backend",
        "version": "1.1.0"
    }
    #mongodb+srv://goudsathwik55_db_user:uFwMdwCL8wXnPC5b@datapilot.bfqbusj.mongodb.net/?appName=Datapilot
    #mongodb+srv://goudsathwik55_db_user:uFwMdwCL8wXnPC5b@datapilot.bfqbusj.mongodb.net/