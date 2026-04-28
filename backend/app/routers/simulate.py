"""
Simulation router — Monte Carlo scale-up simulation of bias impact.
"""
from fastapi import APIRouter, Depends
from app.models.schemas import SimulationRequest, SimulationResponse, AffectedGroup
from app.auth import get_current_user
from app.routers.analyze import get_analysis_data

router = APIRouter()
COST_PER_REJECTION = 100.0  # $ estimated litigation/HR cost per unfair rejection


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_impact(
    req: SimulationRequest,
    user: dict = Depends(get_current_user)
):
    data = get_analysis_data(req.analysis_id, user["uid"])
    metrics = data["metrics"]
    df = data["df"]
    primary_sens = data["sensitive_cols"][0]

    n = req.num_applicants
    dp = float(metrics.demographic_parity)

    unfair_rejections = int(n * dp * 0.5)
    cost = round(unfair_rejections * COST_PER_REJECTION, 2)

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

        for gm in sorted_gm[1:-1]:
            minor_ratio = gm.count / total_rows if total_rows > 0 else 0.1
            minor_affected = int(n * minor_ratio * (privileged.selection_rate - gm.selection_rate) * 0.5)
            minor_pct = round(minor_affected / unfair_rejections * 100, 1) if unfair_rejections > 0 else 0
            if minor_affected > 0:
                affected_groups.append(AffectedGroup(group=str(gm.group), affected=minor_affected, percentage=minor_pct))

    # Plain language impact
    disadvantaged_group = affected_groups[0].group if affected_groups else "the disadvantaged group"
    affected_count = affected_groups[0].affected if affected_groups else unfair_rejections
    impact_statement = f"If this system is used for {n:,} applicants, approximately {affected_count:,} people from '{disadvantaged_group}' may be potentially disadvantaged by the observed disparity."

    return SimulationResponse(
        total_applicants=n,
        unfair_rejections=unfair_rejections,
        cost_of_bias=cost,
        affected_groups=affected_groups,
        plain_language_impact=impact_statement
    )
