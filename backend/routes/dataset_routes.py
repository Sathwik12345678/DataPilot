from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Query
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import os
import io

from services.analysis_service import analyze_dataset
from services.dsa_service import top_k_values
from services.optimization_service import (
    get_file_hash, paginate_data, compress_statistics, 
    sample_large_dataset, filter_numeric_columns, CACHE_TTL, analysis_cache
)
from utils.pdf_generator import generate_pdf

router = APIRouter()

# ===============================
# 📊 HELPER: READ FILE (CSV / EXCEL)
# ===============================
def read_file(file: UploadFile):

    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            # Robust CSV parsing with delimiter sniffing
            file.file.seek(0)
            try:
                df = pd.read_csv(
                    file.file,
                    sep=None,
                    engine="python",
                    on_bad_lines="warn",
                    skip_blank_lines=True
                )
            except Exception as parse_err:
                file.file.seek(0)
                # Gentler fallback, allowing spaces and different delimiters
                df = pd.read_csv(
                    file.file,
                    engine="python",
                    sep="," if "," in file.filename else None,
                    usecols=lambda x: True,
                    on_bad_lines="skip"
                )

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            file.file.seek(0)
            df = pd.read_excel(file.file)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    return df


# ===============================
# 📊 UPLOAD + ANALYZE DATASET (OPTIMIZED)
# ===============================
@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    page: int = Query(1, ge=1, description="Page number for pagination")
):
    """
    Upload and analyze dataset with optimization features:
    - Automatic sampling for large datasets (>10K rows)
    - Pagination support
    - Result caching
    - Compressed response format
    """
    
    # Read file into memory once
    file_bytes = await file.read()
    file_hash = get_file_hash(file_bytes)
    
    # Check cache first
    if file_hash in analysis_cache:
        cached_result = analysis_cache[file_hash]["data"]
        # Apply pagination to cached results
        if "all_statistics" in cached_result:
            cached_result["statistics_paginated"] = paginate_data(
                list(cached_result["all_statistics"].items()),
                page=page,
                page_size=20
            )
        return cached_result
    
    # Parse file from bytes
    try:
        file_obj = io.BytesIO(file_bytes)

        if file.filename.lower().endswith(".csv"):
            file_obj.seek(0)
            try:
                df = pd.read_csv(
                    file_obj,
                    sep=None,
                    engine="python",
                    on_bad_lines="warn",
                    skip_blank_lines=True
                )
            except Exception as parse_err:
                file_obj.seek(0)
                df = pd.read_csv(
                    file_obj,
                    engine="python",
                    sep=",",
                    on_bad_lines="skip",
                    skip_blank_lines=True
                )

        elif file.filename.lower().endswith((".xlsx", ".xls")):
            file_obj.seek(0)
            df = pd.read_excel(file_obj)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Check if dataset is large and sample if needed
    original_rows = len(df)
    sampled_df, is_sampled, sample_pct = sample_large_dataset(df, max_rows=5000)  # More aggressive
    
    # Basic Info
    rows = len(sampled_df)
    columns = list(sampled_df.columns)
    
    # Column Types (only for existing columns)
    column_types = {
        col: str(sampled_df[col].dtype) for col in sampled_df.columns
    }
    
    # Missing Values (only for existing columns)
    missing_values = {
        col: int(sampled_df[col].isnull().sum()) for col in sampled_df.columns
    }
    
    # Filter to numeric columns only for performance
    numeric_df = filter_numeric_columns(sampled_df, max_columns=15)
    
    # Stats (numeric only) - now with compressed precision
    stats = compress_statistics(analyze_dataset(numeric_df))
    
    # Top-K values using Heap (DSA) - separated for pie chart
    top_values = {}
    numeric_columns = numeric_df.columns
    
    for col in numeric_columns:
        values = numeric_df[col].dropna().tolist()
        if len(values) > 0:
            top_values[col] = [round(v, 2) if isinstance(v, float) else v 
                              for v in top_k_values(values, 3)]
        else:
            top_values[col] = []
    
    # Generate pie chart data separately (for later display)
    pie_chart_data = []
    for col, values in top_values.items():
        for i, v in enumerate(values):
            pie_chart_data.append({
                "name": f"{col} (Top {i+1})",
                "value": v,
                "column": col
            })
    
    result = {
        "filename": file.filename,
        "rows": rows,
        "original_rows": original_rows,
        "is_sampled": is_sampled,
        "sample_percentage": sample_pct if is_sampled else 100.0,
        "columns": columns,
        "column_count": len(columns),
        "numeric_column_count": len(numeric_columns),
        "column_types": column_types,
        "missing_values": missing_values,
        "statistics": stats,
        "top_values": top_values,
        "pie_chart_data": pie_chart_data,  # Separate pie chart data for later rendering
        "all_statistics": stats,  # For pagination
        "cache_ttl": CACHE_TTL,
        "message": f"Dataset analyzed successfully. {f'Sampled {sample_pct}% for performance. ' if is_sampled else f'Analyzed {len(numeric_columns)} numeric columns. '}Showing {len(stats)} numeric features."
    }
    
    # Cache the result
    analysis_cache[file_hash] = {
        "data": result,
        "timestamp": __import__("time").time()
    }
    
    # Apply pagination to statistics
    result["statistics_paginated"] = paginate_data(
        list(stats.items()),
        page=page,
        page_size=20
    )
    
    return result


# ===============================
# 📄 OPTIMIZED PDF REPORT DOWNLOAD
# ===============================
@router.post("/download-report")
async def download_report(
    file: UploadFile = File(...),
    chart_image: str = Form(None)
):
    """
    Download PDF report with optimization:
    - Reuse uploaded file bytes
    - Compress chart image on backend
    """
    
    try:
        # Read file into memory once
        file_bytes = await file.read()
        file_obj = io.BytesIO(file_bytes)
        
        if file.filename.lower().endswith(".csv"):
            df = pd.read_csv(file_obj)
        elif file.filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_obj)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Clean columns
        df.columns = df.columns.str.strip()
        
        # Basic Info
        rows = len(df)
        columns = list(df.columns)
        
        # Stats
        stats = compress_statistics(analyze_dataset(df))
        
        # Generate PDF with chart image
        pdf_path = generate_pdf({
            "rows": rows,
            "columns": columns,
            "statistics": stats,
            "chart_image": chart_image
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
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")