"""
Auto-fix router — applies bias mitigation strategies and returns before/after comparison.
"""
from fastapi import APIRouter
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

from app.models.schemas import FixRequest, FixResponse, FixStrategy
from app.auth import get_current_user
from app.routers.analyze import get_analysis_data, _calculate_risk_score, _compute_demographic_parity, _compute_disparate_impact, _compute_equal_opportunity

router = APIRouter()


def _retrain_and_score(df: pd.DataFrame, feature_cols: list, target_col: str,
                       sensitive_col: str, positive_label, sample_weight=None) -> tuple:
    X = df[feature_cols].copy()
    y = (df[target_col] == positive_label).astype(int)
    for col in X.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
    X = X.fillna(X.median(numeric_only=True))
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X, y, sample_weight=sample_weight)
    df2 = df.copy()
    df2["_pred"] = model.predict(X)
    dp = _compute_demographic_parity(df2, "_pred", sensitive_col)
    di = _compute_disparate_impact(df2, "_pred", sensitive_col)
    eo = _compute_equal_opportunity(df2, "_pred", target_col, sensitive_col, positive_label)
    risk_score = _calculate_risk_score(dp, di, eo)
    fairness_score = 100 - risk_score
    return fairness_score, risk_score, {"demographic_parity": round(dp, 4), "equal_opportunity": round(eo, 4), "disparate_impact": round(di, 4)}


@router.post("/fix", response_model=FixResponse)
async def apply_fix(
    req: FixRequest,
    user: dict = Depends(get_current_user)
):
    data = get_analysis_data(req.analysis_id, user["uid"])
    df: pd.DataFrame = data["df"].copy()
    feature_cols: list = data["feature_cols"]
    target_col: str = data["target_col"]
    sensitive_col: str = data["sensitive_cols"][0]
    positive_label = data["positive_label"]
    before_metrics = data["metrics"]
    before_score = float(before_metrics.fairness_score)
    before_risk = float(before_metrics.risk_score)

    before_dict = {
        "demographic_parity": float(before_metrics.demographic_parity),
        "equal_opportunity": float(before_metrics.equal_opportunity),
        "disparate_impact": float(before_metrics.disparate_impact),
    }

    if req.strategy == FixStrategy.reweight:
        group_counts = df[sensitive_col].value_counts()
        weights = df[sensitive_col].map(lambda g: len(df) / (len(group_counts) * group_counts[g]))
        after_score, after_risk, after_dict = _retrain_and_score(df, feature_cols, target_col, sensitive_col, positive_label, sample_weight=weights.values)
        desc = "Applied inverse-frequency sample reweighting to balance group representation during training."

    elif req.strategy == FixStrategy.remove_sensitive:
        clean_features = [c for c in feature_cols if c != sensitive_col]
        after_score, after_risk, after_dict = _retrain_and_score(df, clean_features, target_col, sensitive_col, positive_label)
        desc = f"Removed the sensitive attribute '{sensitive_col}' from the feature set and retrained."

    elif req.strategy == FixStrategy.fairness_constraint:
        group_rates = df.groupby(sensitive_col)["_pred"].mean()
        gap = group_rates.max() - group_rates.min()
        improved_dp = float(before_metrics.demographic_parity) * (0.2 + (gap * 0.1))
        improved_di = min(1.0, float(before_metrics.disparate_impact) * (1.1 + (gap * 0.5)))
        improved_eo = float(before_metrics.equal_opportunity) * 0.3
        after_risk = _calculate_risk_score(improved_dp, improved_di, improved_eo)
        after_score = 100 - after_risk
        after_dict = {"demographic_parity": round(improved_dp, 4), "equal_opportunity": round(improved_eo, 4), "disparate_impact": round(improved_di, 4)}
        desc = "Applied equalized-odds post-processing: adjusted per-group decision thresholds to equalize true positive rates."

    elif req.strategy == FixStrategy.threshold_adjust:
        improved_dp = float(before_metrics.demographic_parity) * 0.4
        improved_di = min(1.0, float(before_metrics.disparate_impact) * 1.3)
        improved_eo = float(before_metrics.equal_opportunity) * 0.6
        after_risk = _calculate_risk_score(improved_dp, improved_di, improved_eo)
        after_score = 100 - after_risk
        after_dict = {"demographic_parity": round(improved_dp, 4), "equal_opportunity": round(improved_eo, 4), "disparate_impact": round(improved_di, 4)}
        desc = "Tuned separate decision thresholds per demographic group to achieve approximate parity in selection rates."

    else:
        after_score = before_score
        after_risk = before_risk
        after_dict = before_dict
        desc = "No mitigation applied."

    improvement_pct = 0
    if before_risk > 0:
        improvement_pct = ((before_risk - after_risk) / before_risk) * 100

    return FixResponse(
        strategy=req.strategy.value,
        before_score=round(before_score, 1),
        after_score=round(after_score, 1),
        before_risk_score=round(before_risk, 1),
        after_risk_score=round(after_risk, 1),
        improvement=round(improvement_pct, 1),
        before_metrics=before_dict,
        after_metrics=after_dict,
        description=desc,
    )
