from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

# Import routes
from routes.dataset_routes import router as dataset_router
from routes.auth_routes import router as auth_router   # 🔥 NEW

# Create FastAPI app
app = FastAPI(
    title="DataPilot API",
    description="Smart Data Analytics Backend with DSA + Authentication",
    version="1.2.0"
)

# ========================================
# MIDDLEWARE STACK (Order matters!)
# ========================================

# 1. GZIP Compression (MUST BE FIRST)
# Compresses responses > 500 bytes
app.add_middleware(
    GZipMiddleware,
    minimum_size=500,  # Only compress responses > 500 bytes
    compresslevel=9    # Maximum compression (1-9 scale)
)

# 2. CORS Configuration (IMPORTANT)
# Explicit CORS origin list to support Render backend + Vercel frontend
# do not use wildcard origin with credentials enabled
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://data-pilot-green.vercel.app",
    "https://datapilot-frontend.onrender.com",
    "https://datapilot-0b2k.onrender.com"  # Render backend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
            "User Authentication",
            "Optimized for Large Datasets"
        ],
        "status": "success"
    }

# ========================================
# Health Check Endpoint
# ========================================
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "DataPilot Backend",
        "version": "1.2.0"
    }
    #mongodb+srv://goudsathwik55_db_user:uFwMdwCL8wXnPC5b@datapilot.bfqbusj.mongodb.net/?appName=Datapilot
    #mongodb+srv://goudsathwik55_db_user:uFwMdwCL8wXnPC5b@datapilot.bfqbusj.mongodb.net/