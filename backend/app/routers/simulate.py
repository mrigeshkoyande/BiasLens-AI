"""
Simulation router — Monte Carlo scale-up simulation of bias impact.
"""
from fastapi import APIRouter

from app.models.schemas import SimulationRequest, SimulationResponse, AffectedGroup
from app.routers.analyze import get_analysis_data

router = APIRouter()
COST_PER_REJECTION = 100.0  # $ estimated litigation/HR cost per unfair rejection


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_impact(req: SimulationRequest):
    data = get_analysis_data(req.analysis_id)
    metrics = data["metrics"]
    df = data["df"]
    primary_sens = data["sensitive_cols"][0]

    n = req.num_applicants
    dp = float(metrics.demographic_parity)

    # Scale unfair rejections proportionally to the disparity gap
    unfair_rejections = int(n * dp * 0.5)
    cost = round(unfair_rejections * COST_PER_REJECTION, 2)

    # Per-group breakdown
    total_rows = len(df)
    affected_groups = []
    group_metrics = metrics.group_metrics
    if len(group_metrics) >= 2:
        sorted_gm = sorted(group_metrics, key=lambda g: g.selection_rate)
        disadvantaged = sorted_gm[0]
        privileged = sorted_gm[-1]
        gap = privileged.selection_rate - disadvantaged.selection_rate
        ratio = disadvantaged.count / total_rows if total_rows > 0 else 0.5
        affected = int(n * ratio * gap)
        pct = round(affected / unfair_rejections * 100, 1) if unfair_rejections > 0 else 0
        affected_groups.append(AffectedGroup(group=str(disadvantaged.group), affected=affected, percentage=pct))

        # Add secondary groups from remaining metrics
        for gm in sorted_gm[1:-1]:
            minor_ratio = gm.count / total_rows if total_rows > 0 else 0.1
            minor_affected = int(n * minor_ratio * (privileged.selection_rate - gm.selection_rate) * 0.5)
            minor_pct = round(minor_affected / unfair_rejections * 100, 1) if unfair_rejections > 0 else 0
            if minor_affected > 0:
                affected_groups.append(AffectedGroup(group=str(gm.group), affected=minor_affected, percentage=minor_pct))

    return SimulationResponse(
        total_applicants=n,
        unfair_rejections=unfair_rejections,
        cost_of_bias=cost,
        affected_groups=affected_groups,
    )
