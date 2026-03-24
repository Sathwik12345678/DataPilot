"""
Performance Optimization Service
- Implements caching for analysis results
- Handles data chunking and pagination
- Provides compression utilities
"""
import hashlib
import time
from functools import wraps
from typing import Any, Dict, Optional

# In-memory cache with TTL (Time To Live)
analysis_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 3600  # 1 hour


def get_file_hash(file_bytes: bytes) -> str:
    """Generate hash for file content to use as cache key."""
    return hashlib.md5(file_bytes).hexdigest()


def cache_analysis(ttl: int = CACHE_TTL):
    """Decorator to cache analysis results based on file hash."""
    def decorator(func):
        @wraps(func)
        async def wrapper(file_hash: str, *args, **kwargs):
            # Check cache
            if file_hash in analysis_cache:
                cached_data = analysis_cache[file_hash]
                if time.time() - cached_data["timestamp"] < ttl:
                    return cached_data["data"]
            
            # Execute function
            result = await func(file_hash, *args, **kwargs)
            
            # Store in cache
            analysis_cache[file_hash] = {
                "data": result,
                "timestamp": time.time()
            }
            
            return result
        return wrapper
    return decorator


def paginate_data(data: list, page: int = 1, page_size: int = 100) -> Dict[str, Any]:
    """
    Paginate data results to reduce payload size.
    
    Args:
        data: List of items to paginate
        page: Page number (1-indexed)
        page_size: Items per page
    
    Returns:
        Dict with paginated data and metadata
    """
    total_items = len(data)
    total_pages = (total_items + page_size - 1) // page_size
    
    # Validate page
    if page < 1:
        page = 1
    if page > total_pages and total_pages > 0:
        page = total_pages
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    return {
        "data": data[start_idx:end_idx],
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


def compress_statistics(stats: Dict[str, Any], precision: int = 2) -> Dict[str, Any]:
    """
    Compress statistics by limiting decimal precision
    and removing redundant data.
    
    Args:
        stats: Statistics dictionary
        precision: Number of decimal places
    
    Returns:
        Compressed statistics
    """
    compressed = {}
    for col, values in stats.items():
        compressed[col] = {
            key: round(float(val), precision) if isinstance(val, (int, float)) else val
            for key, val in values.items()
        }
    return compressed


def sample_large_dataset(df, max_rows: int = 5000) -> tuple:
    """
    Aggressively sample large datasets for faster processing.
    Real-world optimization: prioritize speed over precision.
    
    Args:
        df: Pandas DataFrame
        max_rows: Maximum rows before sampling (default: 5000 for speed)
    
    Returns:
        Tuple of (sampled_df, is_sampled, sample_percentage)
    """
    total_rows = len(df)
    
    if total_rows <= max_rows:
        return df, False, 100.0
    
    sample_frac = max_rows / total_rows
    sampled_df = df.sample(frac=sample_frac, random_state=42)
    
    return sampled_df, True, round(sample_frac * 100, 2)


def chunk_dataframe(df, chunk_size: int = 10000):
    """
    Generator to process large dataframes in chunks.
    
    Args:
        df: Pandas DataFrame
        chunk_size: Rows per chunk
    
    Yields:
        DataFrame chunks
    """
    for i in range(0, len(df), chunk_size):
        yield df.iloc[i:i + chunk_size]


def filter_numeric_columns(df, max_columns: int = 15):
    """
    Filter to only numeric columns for analysis.
    Limits columns for extreme performance with very large datasets.
    
    Args:
        df: Pandas DataFrame
        max_columns: Maximum numeric columns to analyze
    
    Returns:
        Filtered dataframe with only numeric columns (limited)
    """
    numeric_df = df.select_dtypes(include=['number'])
    
    # If too many columns, prioritize by selecting diverse columns
    if len(numeric_df.columns) > max_columns:
        # Select first, middle, and last columns for diversity
        cols = list(numeric_df.columns)
        indices = []
        
        # Include first few columns
        indices.extend(range(min(5, len(cols))))
        
        # Include middle columns
        mid = len(cols) // 2
        indices.extend(range(max(5, mid - 2), min(mid + 3, len(cols))))
        
        # Include last few columns
        indices.extend(range(max(mid + 3, len(cols) - 5), len(cols)))
        
        # Remove duplicates and sort
        indices = sorted(set(indices))[:max_columns]
        numeric_df = numeric_df.iloc[:, indices]
    
    return numeric_df
