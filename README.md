# 🚀 DataPilot

**Smart Data Analytics Platform with Advanced Insights & Real-time Visualization**

DataPilot is a modern, full-stack data analytics application that enables users to upload, analyze, and visualize datasets with intelligent statistical analysis, interactive charts, and professional PDF report generation.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Performance Optimizations](#performance-optimizations)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

✅ **User Authentication**
- Secure signup and login with password hashing
- Session management with authentication tokens

✅ **Dataset Management**
- Upload CSV and Excel files (XLSX, XLS)
- Automatic data type optimization for large datasets
- Support for 10K+ row datasets with < 2 second processing

✅ **Advanced Data Analysis**
- Statistical analysis (mean, median, standard deviation, quartiles)
- Top-K values extraction using optimized algorithms
- Column-based analysis and filtering

✅ **Interactive Visualizations**
- Real-time charts powered by Recharts
- Multiple chart types (Bar, Line, Pie, Area)
- Smooth animations and transitions
- Dynamic column selection

✅ **PDF Report Generation**
- Export analysis results and charts as professional PDF
- Optimized image compression for file size reduction
- One-click download functionality

✅ **Performance Optimizations**
- GZIP compression (responsive size ~100KB compressed)
- Smart caching with 24-hour TTL
- Pagination for large datasets
- File hashing to prevent duplicate processing

✅ **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark/Light theme toggle
- Smooth animations with Framer Motion
- Professional dashboard interface

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **File Upload**: React Dropzone

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database**: MongoDB
- **Data Processing**: Pandas, NumPy
- **PDF Generation**: ReportLab
- **Authentication**: Passlib (password hashing)
- **Environment**: Python-dotenv
- **Compression**: GZip middleware

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **MongoDB** (local or cloud instance) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## 🔧 Installation & Setup

### Step 1: Clone or Extract the Project

```bash
# If using git
git clone <repository-url>
cd DataPilot

# Or extract the downloaded ZIP file
cd DataPilot
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Backend Environment

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# Or for local MongoDB:
# MONGO_URL=mongodb://localhost:27017/datapilot

# API Configuration
API_HOST=127.0.0.1
API_PORT=8000

# Security (change in production)
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
```

**Note**: Replace placeholders with your actual MongoDB credentials.

### Step 4: Frontend Setup

Open a new terminal in the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure API endpoint
# Edit frontend\src\api\api.js if needed to match your backend URL
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
# From backend directory (with virtual environment activated)
cd backend
python main.py

# Or using Uvicorn directly:
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

✅ Backend will be available at: `http://127.0.0.1:8000`

Check health: `http://127.0.0.1:8000/health`

### Start Frontend Development Server

```bash
# From frontend directory (new terminal)
cd frontend
npm run dev
```

✅ Frontend will be available at: `http://localhost:5173`

### Build for Production

```bash
# Frontend production build
cd frontend
npm run build

# Output: dist/ folder ready for deployment
```

---

## 📁 Project Structure

```
DataPilot/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (create this)
│   ├── database/
│   │   └── db.py              # MongoDB connection and models
│   ├── routes/
│   │   ├── auth_routes.py      # Authentication endpoints
│   │   └── dataset_routes.py   # Dataset upload & analysis endpoints
│   ├── services/
│   │   ├── auth_service.py     # User authentication logic
│   │   ├── analysis_service.py # Statistical analysis
│   │   ├── dsa_service.py      # Data structure algorithms
│   │   └── optimization_service.py # Caching, compression
│   └── utils/
│       └── pdf_generator.py    # PDF report generation
├── frontend/
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── index.html              # HTML entry point
│   └── src/
│       ├── main.jsx            # React app entry
│       ├── App.jsx             # Root component
│       ├── api/
│       │   └── api.js          # Axios API client
│       ├── pages/
│       │   ├── Landing.jsx     # Home page
│       │   ├── Login.jsx       # Login page
│       │   ├── Signup.jsx      # Registration page
│       │   └── Dashboard.jsx   # Main analytics dashboard
│       ├── components/
│       │   ├── Charts.jsx      # Visualization component
│       │   ├── DataUpload.jsx  # File upload component
│       │   ├── Navbar.jsx      # Navigation bar
│       │   └── [other components]
│       └── utils/
│           └── auth.js         # Authentication helpers
└── README.md                   # This file
```

---

## 📖 Usage Guide

### 1. **Create an Account**
   - Go to `http://localhost:5173`
   - Click "Sign Up"
   - Enter email and password
   - Click "Create Account"

### 2. **Login**
   - Use your credentials to login
   - You'll be redirected to the Dashboard

### 3. **Upload a Dataset**
   - Click "Upload Dataset" or drag-and-drop a file
   - Supported formats: CSV, XLSX, XLS
   - Maximum recommended size: 50MB

### 4. **Analyze Your Data**
   - Select a numeric column to analyze
   - View statistical insights (mean, median, std dev, etc.)
   - Browse top-K values in the dataset

### 5. **Visualize with Charts**
   - Switch between different chart types
   - Charts update in real-time as you select columns
   - Hover over data points for detailed information

### 6. **Generate PDF Report**
   - Click "Download as PDF"
   - Charts and analysis results will be compiled
   - Professional report will download to your computer

### 7. **Toggle Theme**
   - Use the theme toggle button to switch between Dark/Light mode
   - Preference is saved in your browser

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | User login |
| POST | `/upload-dataset` | Upload and analyze CSV/Excel file |
| GET | `/analyze/<dataset_id>` | Get analysis results |
| GET | `/top-k-values` | Get top-K values from column |
| POST | `/generate-pdf` | Generate PDF report |
| GET | `/health` | API health check |

---

## ⚡ Performance Optimizations

DataPilot includes several performance features:

- **GZIP Compression**: Reduces response size by ~80% (500KB → 100KB)
- **Smart Caching**: 24-hour cache TTL for analysis results
- **Pagination**: Efficiently handles datasets with 10K+ rows
- **File Hashing**: Prevents duplicate processing of same files
- **Image Compression**: Reduces PDF file size by 25%
- **Lazy Loading**: Charts and data load on-demand

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.9+

# Verify virtual environment is activated
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### MongoDB connection error
- Verify `MONGO_URL` in `.env` is correct
- Check if MongoDB server is running
- For MongoDB Atlas, ensure IP whitelist includes your IP
- Test connection: `python -c "from pymongo import MongoClient; print(MongoClient('<MONGO_URL>'))"` 

### Frontend API connection issues
- Verify backend is running on `http://127.0.0.1:8000`
- Check `frontend/src/api/api.js` has correct API base URL
- Check browser DevTools Console for CORS errors
- Ensure CORS is enabled in backend

### Port already in use
```bash
# Change backend port
uvicorn main:app --port 8001

# Change frontend port
npm run dev -- --port 5174
```

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Clear pip cache
pip cache purge

# Reinstall
pip install -r requirements.txt
npm install
```

---

## 📝 Environment Variables Reference

### Backend `.env`:
```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
API_HOST=127.0.0.1
API_PORT=8000
SECRET_KEY=your-secret-key
DEBUG=True
```

### Frontend Configuration:
Edit `frontend/src/api/api.js`:
```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

---

## 🚀 Deployment Tips

### For Production:
1. Set `DEBUG=False` in backend `.env`
2. Update `SECRET_KEY` to a strong random value
3. Update CORS origins in `backend/main.py` to your domain
4. Run `npm run build` in frontend for optimized build
5. Use a production server (Gunicorn, Nginx)
6. Set up HTTPS with SSL certificates
7. Use MongoDB Atlas or managed database service

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 💬 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Endpoints](#api-endpoints) documentation
3. Check browser console for error messages
4. Verify all prerequisites are installed correctly

---

## 🎯 Version

**Current Version**: 1.2.0

---

**Happy Analyzing! 📊✨**
