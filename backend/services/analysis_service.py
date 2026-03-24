import numpy as np

def analyze_dataset(df):

    stats = {}

    numeric_columns = df.select_dtypes(include=np.number).columns

    for col in numeric_columns:

        values = df[col].dropna().tolist()

        stats[col] = {
            "mean": float(np.mean(values)),
            "min": float(np.min(values)),
            "max": float(np.max(values))
        }

    return stats