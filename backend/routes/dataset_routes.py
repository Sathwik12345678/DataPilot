from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import os

from services.analysis_service import analyze_dataset
from services.dsa_service import top_k_values
from utils.pdf_generator import generate_pdf

router = APIRouter()

# ===============================
# 📊 HELPER: READ FILE (CSV / EXCEL)
# ===============================
def read_file(file: UploadFile):

    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(file.file)

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(file.file)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

    except Exception:
        raise HTTPException(status_code=400, detail="Error reading file")

    return df


# ===============================
# 📊 UPLOAD + ANALYZE DATASET
# ===============================
@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):

    df = read_file(file)

    # Clean column names
    df.columns = df.columns.str.strip()

    # Basic Info
    rows = len(df)
    columns = list(df.columns)

    # Column Types
    column_types = {
        col: str(df[col].dtype) for col in df.columns
    }

    # Missing Values
    missing_values = {
        col: int(df[col].isnull().sum()) for col in df.columns
    }

    # Stats (numeric only)
    stats = analyze_dataset(df)

    # Top-K values using Heap (DSA)
    top_values = {}

    numeric_columns = df.select_dtypes(include=np.number).columns

    for col in numeric_columns:
        values = df[col].dropna().tolist()

        if len(values) > 0:
            top_values[col] = top_k_values(values, 3)
        else:
            top_values[col] = []

    return {
        "filename": file.filename,
        "rows": rows,
        "columns": columns,
        "column_types": column_types,
        "missing_values": missing_values,
        "statistics": stats,
        "top_values": top_values
    }


# ===============================
# 📄 PDF REPORT DOWNLOAD (WITH CHART IMAGE)
# ===============================
@router.post("/download-report")
async def download_report(
    file: UploadFile = File(...),
    chart_image: str = Form(None)   # 🔥 receive chart image from frontend
):

    df = read_file(file)

    # Clean columns
    df.columns = df.columns.str.strip()

    # Basic Info
    rows = len(df)
    columns = list(df.columns)

    # Stats
    stats = analyze_dataset(df)

    # Generate PDF with chart image
    pdf_path = generate_pdf({
        "rows": rows,
        "columns": columns,
        "statistics": stats,
        "chart_image": chart_image   # 🔥 pass to PDF
    })

    # Ensure PDF exists
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="PDF generation failed")

    # Return downloadable file
    return FileResponse(
        path=pdf_path,
        filename="DataPilot_Report.pdf",
        media_type="application/pdf"
    )