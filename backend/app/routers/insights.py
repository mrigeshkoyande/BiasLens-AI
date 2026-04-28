"""
Insights router — uses Gemini to generate dynamic "Key Observations" based on analysis metrics.
"""
from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
import json
from app.models.schemas import InsightsRequest, InsightsResponse, InsightObservation
from app.routers.analyze import get_analysis_data
from app.config import GEMINI_API_KEY

router = APIRouter()

SYSTEM_PROMPT = """You are BiasLens AI Insights Engine.
Generate 3 professional, data-driven "Key Observations" and a short "Executive Summary" (under 40 words) for a fairness audit report.
Format your response as a JSON object with:
"observations": [{"num": "01", "title": "...", "desc": "..."}],
"executive_summary": "..."
Keep descriptions concise.
Ensure observations are based strictly on the provided metrics and features."""


@router.post("/insights", response_model=InsightsResponse)
async def generate_insights(
    req: InsightsRequest,
    user: dict = Depends(get_current_user)
):
    data = get_analysis_data(req.analysis_id, user["uid"])
    metrics = data["metrics"]
    sensitive_cols = data["sensitive_cols"]
    
    # Context for Gemini
    context = {
        "fairness_score": metrics.fairness_score,
        "demographic_parity": metrics.demographic_parity,
        "disparate_impact": metrics.disparate_impact,
        "equal_opportunity": metrics.equal_opportunity,
        "sensitive_attributes": sensitive_cols,
        "risk_level": metrics.risk_level.value
    }

    prompt = f"Analysis Context: {json.dumps(context)}\n\nGenerate observations and summary."

    if not GEMINI_API_KEY:
        fallback_obs, fallback_sum = _get_fallback_insights(metrics, sensitive_cols)
        return InsightsResponse(
            analysis_id=req.analysis_id,
            observations=fallback_obs,
            executive_summary=fallback_sum
        )

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)
        response = model.generate_content(prompt)
        
        # Clean response if it contains markdown code blocks
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        res_data = json.loads(text)
        observations = [InsightObservation(**obj) for obj in res_data.get("observations", [])]
        summary = res_data.get("executive_summary", "Fairness audit complete.")
        return InsightsResponse(analysis_id=req.analysis_id, observations=observations, executive_summary=summary)
    except Exception as e:
        print(f"Gemini Insights Error: {e}")
        fallback_obs, fallback_sum = _get_fallback_insights(metrics, sensitive_cols)
        return InsightsResponse(
            analysis_id=req.analysis_id,
            observations=fallback_obs,
            executive_summary=fallback_sum
        )


def _get_fallback_insights(metrics, sensitive_cols) -> tuple:
    primary = sensitive_cols[0] if sensitive_cols else "protected attributes"
    obs = [
        InsightObservation(
            num="01",
            title=f"Disparity in {primary.title()}",
            desc=f"Demographic parity gap of {metrics.demographic_parity:.2f} detected. Model outcomes vary significantly across groups."
        ),
        InsightObservation(
            num="02",
            title="Legal Compliance Risk",
            desc=f"Disparate impact ratio of {metrics.disparate_impact:.2f} is {'below' if metrics.disparate_impact < 0.8 else 'near'} the 80% legal threshold."
        ),
        InsightObservation(
            num="03",
            title="Mitigation Recommended",
            desc=f"The current risk level is {metrics.risk_level.value.upper()}. Applying data reweighting or threshold adjustment is advised."
        )
    ]
    summary = f"The model exhibits {metrics.risk_level.value} fairness risk with a score of {metrics.fairness_score}/100. Disparities in {primary} suggest indirect bias drivers that require systematic mitigation before deployment."
    return obs, summary
