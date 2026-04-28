"""
AI Chat router — Gemini-powered fairness assistant with rule-based fallback.
"""
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.schemas import ChatRequest, ChatResponse
from app.config import GEMINI_API_KEY

router = APIRouter()

SYSTEM_PROMPT = """You are BiasLens AI Assistant — an expert in algorithmic fairness and ethical AI.
Explain metrics clearly, suggest fixes, keep responses under 200 words."""


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    user: dict = Depends(get_current_user)
):
    if not GEMINI_API_KEY:
        return ChatResponse(response=_rule_based_response(req.message), model="rule-based-fallback")
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)
        response = model.generate_content(req.message)
        return ChatResponse(response=response.text, model="gemini-1.5-flash")
    except Exception:
        return ChatResponse(response=_rule_based_response(req.message), model="fallback")


def _rule_based_response(message: str) -> str:
    msg = message.lower()
    if "demographic parity" in msg:
        return "**Demographic Parity** requires equal positive prediction rates across all groups. A gap >10% signals significant bias. Fix with data reweighting or fairness constraints."
    if "disparate impact" in msg:
        return "**Disparate Impact Ratio** = minority rate ÷ majority rate. The legal 80% rule: below 0.80 = adverse impact. Your score indicates potential legal liability."
    if "equal opportunity" in msg:
        return "**Equal Opportunity** ensures equally qualified people from all groups have equal positive outcome chances. Fix with threshold adjustment."
    if any(w in msg for w in ["fix", "mitigate", "reduce"]):
        return "Top fixes: 1) **Reweighting** (+28pts, easiest) 2) **Equalized Odds** (+35pts, best) 3) **Remove proxy features** like ZIP code. Start with reweighting — non-invasive and reversible."
    if "shap" in msg:
        return "**SHAP values** explain each feature's contribution to predictions. High absolute SHAP on sensitive attributes = bias drivers."
    return "Ask me about: demographic parity, disparate impact, equal opportunity, SHAP values, or how to fix bias in your dataset."
