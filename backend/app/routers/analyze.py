"""
Bias analysis router — computes AIF360 fairness metrics on an uploaded dataset.
"""
import uuid
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

from app.models.schemas import (
    AnalysisRequest, AnalysisResponse, FairnessMetrics,
    GroupMetric, RiskLevel
)
from app.routers.upload import get_dataset_df

router = APIRouter()
_analyses: dict = {}   # analysis_id → result dict


def _compute_demographic_parity(df: pd.DataFrame, pred_col: str, sensitive_col: str) -> float:
    rates = df.groupby(sensitive_col)[pred_col].mean()
    return float(rates.max() - rates.min())


def _compute_disparate_impact(df: pd.DataFrame, pred_col: str, sensitive_col: str) -> float:
    rates = df.groupby(sensitive_col)[pred_col].mean()
    if rates.max() == 0:
        return 1.0
    return float(rates.min() / rates.max())


def _compute_equal_opportunity(df: pd.DataFrame, pred_col: str, target_col: str,
                               sensitive_col: str, positive_label) -> float:
    positives = df[df[target_col] == positive_label]
    if positives.empty:
        return 0.0
    tpr = positives.groupby(sensitive_col)[pred_col].mean()
    return float(tpr.max() - tpr.min())


def _fairness_score(dp: float, di: float, eo: float) -> float:
    dp_score = max(0, 1 - dp) * 33
    di_score = min(di, 1.0) * 34
    eo_score = max(0, 1 - eo) * 33
    return round(dp_score + di_score + eo_score, 1)


def _risk_level(score: float) -> RiskLevel:
    if score >= 70:
        return RiskLevel.low
    if score >= 40:
        return RiskLevel.medium
    return RiskLevel.high


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dataset(req: AnalysisRequest):
    df = get_dataset_df(req.dataset_id)

    # Validate columns exist
    for col in req.sensitive_columns + [req.target_column]:
        if col not in df.columns:
            raise HTTPException(status_code=422, detail=f"Column '{col}' not found in dataset.")

    # Prepare features — encode categoricals
    feature_cols = [c for c in df.columns if c != req.target_column]
    X = df[feature_cols].copy()
    y = (df[req.target_column] == req.positive_label).astype(int)

    for col in X.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
    X = X.fillna(X.median(numeric_only=True))

    # Train simple logistic regression
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X_train, y_train)
    accuracy = float(model.score(X_test, y_test))

    df_pred = df.copy()
    df_pred["_pred"] = model.predict(X)

    # Compute metrics for first sensitive column
    primary_sens = req.sensitive_columns[0]
    dp = _compute_demographic_parity(df_pred, "_pred", primary_sens)
    di = _compute_disparate_impact(df_pred, "_pred", primary_sens)
    eo = _compute_equal_opportunity(df_pred, "_pred", req.target_column, primary_sens, req.positive_label)
    ao = float(np.mean([dp, eo]))  # simplified average odds proxy
    score = _fairness_score(dp, di, eo)

    # Per-group breakdown
    group_metrics = []
    for grp, grp_df in df_pred.groupby(primary_sens):
        group_metrics.append(GroupMetric(
            group=str(grp),
            selection_rate=float(grp_df["_pred"].mean()),
            count=len(grp_df),
        ))

    metrics = FairnessMetrics(
        demographic_parity=round(dp, 4),
        equal_opportunity=round(eo, 4),
        disparate_impact=round(di, 4),
        average_odds=round(ao, 4),
        fairness_score=score,
        risk_level=_risk_level(score),
        group_metrics=group_metrics,
    )

    analysis_id = str(uuid.uuid4())
    _analyses[analysis_id] = {
        "dataset_id": req.dataset_id,
        "metrics": metrics,
        "model": model,
        "df": df_pred,
        "sensitive_cols": req.sensitive_columns,
        "target_col": req.target_column,
        "positive_label": req.positive_label,
        "feature_cols": feature_cols,
        "X": X,
        "y": y,
    }

    return AnalysisResponse(
        analysis_id=analysis_id,
        dataset_id=req.dataset_id,
        metrics=metrics,
        model_accuracy=round(accuracy, 4),
    )


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    if analysis_id not in _analyses:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    a = _analyses[analysis_id]
    return {"analysis_id": analysis_id, "metrics": a["metrics"]}


def get_analysis_data(analysis_id: str) -> dict:
    if analysis_id not in _analyses:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return _analyses[analysis_id]
