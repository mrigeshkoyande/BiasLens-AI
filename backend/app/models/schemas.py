from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum


class RiskLevel(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class FixStrategy(str, Enum):
    reweight = "reweight"
    remove_sensitive = "remove_sensitive"
    fairness_constraint = "fairness_constraint"
    threshold_adjust = "threshold_adjust"


# ── Upload ────────────────────────────────────────────────────────────────────

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    is_sensitive: bool
    is_target: bool
    unique_values: int
    null_count: int


class UrlUploadRequest(BaseModel):
    url: str


class DatasetUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    column_count: int
    columns: List[ColumnInfo]
    preview: List[Dict[str, Any]]


# ── Analysis ──────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    dataset_id: str
    target_column: str
    sensitive_columns: List[str]
    positive_label: Optional[Any] = 1


class GroupMetric(BaseModel):
    group: str
    selection_rate: float
    count: int


class FairnessMetrics(BaseModel):
    demographic_parity: float
    equal_opportunity: float
    disparate_impact: float
    average_odds: float
    fairness_score: float
    risk_score: float
    risk_level: RiskLevel
    group_metrics: List[GroupMetric]


class AnalysisResponse(BaseModel):
    analysis_id: str
    dataset_id: str
    metrics: FairnessMetrics
    risk_score: float
    risk_level: RiskLevel
    model_accuracy: float


# ── Explanation ───────────────────────────────────────────────────────────────

class ExplanationRequest(BaseModel):
    analysis_id: str


class BiasExplanation(BaseModel):
    text: str
    severity: str  # critical | warning | info
    feature: str
    magnitude: float
    direction: str  # positive | negative


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    shap_value: float
    direction: str  # increases_bias | decreases_bias | neutral


class SampleScrutinyResponse(BaseModel):
    analysis_id: str
    row_data: Dict[str, Any]
    decision_score: float
    top_contributors: List[Dict[str, Any]]
    recommendation: str


class ExplanationResponse(BaseModel):
    analysis_id: str
    explanations: List[BiasExplanation]
    feature_importance: List[FeatureImportanceItem]


# ── Simulation ────────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    analysis_id: str
    num_applicants: int


class AffectedGroup(BaseModel):
    group: str
    affected: int
    percentage: float


class SimulationResponse(BaseModel):
    total_applicants: int
    unfair_rejections: int
    cost_of_bias: float
    affected_groups: List[AffectedGroup]
    plain_language_impact: str


# ── Auto-Fix ──────────────────────────────────────────────────────────────────

class FixRequest(BaseModel):
    analysis_id: str
    strategy: FixStrategy


class FixResponse(BaseModel):
    strategy: str
    before_score: float
    after_score: float
    before_risk_score: float
    after_risk_score: float
    improvement: float  # Percentage
    before_metrics: Dict[str, float]
    after_metrics: Dict[str, float]
    description: str


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    analysis_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    model: str


# ── Report ────────────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    analysis_id: str
    title: Optional[str] = "Fairness Audit Report"


class ReportItem(BaseModel):
    id: str
    dataset_name: str
    fairness_score: float
    risk_level: RiskLevel
    created_at: str


class ReportResponse(BaseModel):
    report_id: str
    title: str
    download_url: str

class InsightObservation(BaseModel):
    num: str
    title: str
    desc: str


class InsightsRequest(BaseModel):
    analysis_id: str


class InsightsResponse(BaseModel):
    analysis_id: str
    observations: List[InsightObservation]
    executive_summary: str
