"""
Upload router — handles CSV file upload, parsing, and column detection.
"""
import uuid
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from app.models.schemas import DatasetUploadResponse, ColumnInfo

router = APIRouter()

# In-memory dataset store (replace with Supabase Storage in production)
_datasets: dict = {}

SENSITIVE_KEYWORDS = {"gender", "sex", "race", "ethnicity", "religion", "age",
                      "zipcode", "zip", "nationality", "disability", "marital"}
TARGET_KEYWORDS = {"selected", "approved", "hired", "outcome", "label",
                   "target", "result", "decision", "accepted"}


def _detect_col_type(col: str) -> tuple[bool, bool]:
    lower = col.lower()
    is_sensitive = any(k in lower for k in SENSITIVE_KEYWORDS)
    is_target = any(k in lower for k in TARGET_KEYWORDS)
    return is_sensitive, is_target


@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {e}")

    if df.empty:
        raise HTTPException(status_code=422, detail="The uploaded CSV file is empty.")

    dataset_id = str(uuid.uuid4())
    _datasets[dataset_id] = df

    columns = []
    for col in df.columns:
        is_sensitive, is_target = _detect_col_type(col)
        columns.append(ColumnInfo(
            name=col,
            dtype=str(df[col].dtype),
            is_sensitive=is_sensitive,
            is_target=is_target,
            unique_values=int(df[col].nunique()),
            null_count=int(df[col].isna().sum()),
        ))

    preview = df.head(8).fillna("").to_dict(orient="records")

    return DatasetUploadResponse(
        dataset_id=dataset_id,
        filename=file.filename,
        row_count=len(df),
        column_count=len(df.columns),
        columns=columns,
        preview=preview,
    )


@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    if dataset_id not in _datasets:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    df = _datasets[dataset_id]
    return {"dataset_id": dataset_id, "row_count": len(df), "columns": list(df.columns)}


def get_dataset_df(dataset_id: str) -> pd.DataFrame:
    """Shared utility — retrieve a stored DataFrame by ID."""
    if dataset_id not in _datasets:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return _datasets[dataset_id]
