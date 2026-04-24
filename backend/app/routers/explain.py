"""
Explanation router — sklearn-based feature importance + human-readable bias narratives.
Uses permutation importance (no SHAP build dependency needed for Python 3.13).
"""
from fastapi import APIRouter
import numpy as np
from sklearn.inspection import permutation_importance

from app.models.schemas import (
    ExplanationRequest, ExplanationResponse,
    BiasExplanation, FeatureImportanceItem,
)
from app.routers.analyze import get_analysis_data

router = APIRouter()


def _direction(importance: float, is_sensitive: bool) -> str:
    if is_sensitive and importance > 0.05:
        return "increases_bias"
    if not is_sensitive and importance > 0.05:
        return "decreases_bias"
    return "neutral"


def _severity(magnitude: float) -> str:
    if magnitude > 0.20:
        return "critical"
    if magnitude > 0.08:
        return "warning"
    return "info"


def _narrative(feature: str, magnitude: float, is_sensitive: bool) -> str:
    pct = round(magnitude * 100, 1)
    if is_sensitive:
        return (
            f"The '{feature}' attribute is a top bias driver, contributing {pct}% "
            f"to prediction disparity. This sensitive attribute should be mitigated."
        )
    if magnitude > 0.15:
        return (
            f"'{feature}' is a strong predictor ({pct}% importance). "
            f"It may act as a proxy for sensitive attributes — investigate for indirect bias."
        )
    return (
        f"'{feature}' has minor influence ({pct}% importance) "
        f"and is unlikely to be a significant bias source."
    )


@router.post("/explain", response_model=ExplanationResponse)
async def explain_bias(req: ExplanationRequest):
    data = get_analysis_data(req.analysis_id)
    model = data["model"]
    X = data["X"]
    y = data["y"]
    sensitive_cols = data["sensitive_cols"]
    feature_names = list(X.columns)

    # Permutation importance — model-agnostic, no compilation needed
    result = permutation_importance(model, X, y, n_repeats=10, random_state=42, n_jobs=-1)
    raw_importance = result.importances_mean
    raw_importance = np.clip(raw_importance, 0, None)
    total = raw_importance.sum() if raw_importance.sum() > 0 else 1.0
    norm_importance = raw_importance / total

    # Build feature importance list
    importance_list = []
    for i, feat in enumerate(feature_names):
        is_sensitive = feat in sensitive_cols
        imp = float(norm_importance[i])
        importance_list.append(FeatureImportanceItem(
            feature=feat,
            importance=round(imp, 4),
            shap_value=round(float(raw_importance[i]), 4),
            direction=_direction(imp, is_sensitive),
        ))
    importance_list.sort(key=lambda x: x.importance, reverse=True)

    # Build human-readable explanations
    explanations: list[BiasExplanation] = []

    # Sensitive column explanations
    for col in sensitive_cols:
        if col not in feature_names:
            continue
        idx = feature_names.index(col)
        magnitude = float(norm_importance[idx])
        explanations.append(BiasExplanation(
            text=_narrative(col, magnitude, is_sensitive=True),
            severity=_severity(magnitude),
            feature=col,
            magnitude=round(magnitude, 4),
            direction="negative",
        ))

    # Top non-sensitive feature explanations
    for item in importance_list[:5]:
        if item.feature not in sensitive_cols and item.importance > 0.08:
            explanations.append(BiasExplanation(
                text=_narrative(item.feature, item.importance, is_sensitive=False),
                severity="info",
                feature=item.feature,
                magnitude=item.importance,
                direction="positive" if item.direction == "decreases_bias" else "negative",
            ))

    return ExplanationResponse(
        analysis_id=req.analysis_id,
        explanations=explanations,
        feature_importance=importance_list[:10],
    )
