"""
Bias analysis router — computes AIF360 fairness metrics on an uploaded dataset.
"""
import uuid
from fastapi import APIRouter, HTTPException, Depends
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sqlalchemy.orm import Session

from app.models.schemas import (
    AnalysisRequest, AnalysisResponse, FairnessMetrics,
    GroupMetric, RiskLevel
)
from app.auth import get_current_user
from app.routers.upload import get_dataset_df
from app.database import get_db
from app.models.db_models import Analysis

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


def _calculate_risk_score(dp: float, di: float, eo: float) -> float:
    """
    Larger gap = higher risk.
    Higher risk_score (0-100) means higher unfairness risk.
    """
    # di is between 0 and 1 (ideal is 1.0). 
    di_risk = max(0, 1.0 - di) 
    
    # Weights: 40% Demographic Parity, 30% Disparate Impact, 30% Equal Opportunity
    score = (dp * 0.4) + (di_risk * 0.3) + (eo * 0.3)
    return round(min(score * 100, 100), 1)


def _get_risk_level(risk_score: float) -> RiskLevel:
    if risk_score <= 30: return RiskLevel.low
    if risk_score <= 65: return RiskLevel.medium
    return RiskLevel.high


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dataset(
    req: AnalysisRequest, 
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    df = get_dataset_df(req.dataset_id, user["uid"])
    # ... validation and model logic ...
    feature_cols = [c for c in df.columns if c != req.target_column]
    X = df[feature_cols].copy()
    y = (df[req.target_column] == req.positive_label).astype(int)

    for col in X.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
    X = X.fillna(X.median(numeric_only=True))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X_train, y_train)
    accuracy = float(model.score(X_test, y_test))

    df_pred = df.copy()
    df_pred["_pred"] = model.predict(X)

    primary_sens = req.sensitive_columns[0]
    dp = _compute_demographic_parity(df_pred, "_pred", primary_sens)
    di = _compute_disparate_impact(df_pred, "_pred", primary_sens)
    eo = _compute_equal_opportunity(df_pred, "_pred", req.target_column, primary_sens, req.positive_label)
    ao = float(np.mean([dp, eo]))
    
    # New Risk Scoring
    risk_score = _calculate_risk_score(dp, di, eo)
    risk_level = _get_risk_level(risk_score)
    fairness_score = 100 - risk_score

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
        fairness_score=fairness_score,
        risk_score=risk_score,
        risk_level=risk_level,
        group_metrics=group_metrics,
    )

    analysis_id = str(uuid.uuid4())
    
    # Save to database
    db_analysis = Analysis(
        id=analysis_id,
        user_id=user["uid"],
        dataset_id=req.dataset_id,
        metrics=metrics.dict(),
        risk_score=risk_score,
        risk_level=risk_level.value,
        model_accuracy=accuracy,
        feature_importance=[]
    )
    db.add(db_analysis)
    db.commit()

    _analyses[analysis_id] = {
        "user_id": user["uid"],
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
        risk_score=risk_score,
        risk_level=risk_level,
        model_accuracy=round(accuracy, 4),
    )


@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user)
):
    if analysis_id not in _analyses:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    
    a = _analyses[analysis_id]
    if a["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
        
    return {"analysis_id": analysis_id, "metrics": a["metrics"]}


def get_analysis_data(analysis_id: str, user_id: str, db: Session = None) -> dict:
    """Shared utility — retrieve stored analysis data by ID and verify ownership.
    Falls back to database if not in memory.
    """
    if analysis_id in _analyses:
        data = _analyses[analysis_id]
        if data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        return data
    
    # Fallback to DB
    if db:
        db_analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if db_analysis:
            if db_analysis.user_id != user_id:
                raise HTTPException(status_code=403, detail="Access denied.")
            
            # Reconstruct FairnessMetrics from DB JSON
            from app.models.schemas import FairnessMetrics
            return {
                "user_id": db_analysis.user_id,
                "dataset_id": db_analysis.dataset_id,
                "metrics": FairnessMetrics(**db_analysis.metrics),
                "model_accuracy": db_analysis.model_accuracy,
                "created_at": db_analysis.created_at
            }
            
    raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
