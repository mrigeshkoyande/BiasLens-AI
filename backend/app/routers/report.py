"""
Report router — generates a downloadable PDF audit report using ReportLab.
"""
import uuid
import io
import os
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 Table, TableStyle, HRFlowable)
from app.models.schemas import ReportRequest, ReportResponse
from app.routers.analyze import get_analysis_data

router = APIRouter()
_reports: dict = {}

BRAND_BLUE = colors.HexColor("#00d4ff")
BRAND_PURPLE = colors.HexColor("#7c3aed")
DARK_BG = colors.HexColor("#0f0f1a")
RISK_RED = colors.HexColor("#ef4444")
RISK_GREEN = colors.HexColor("#10b981")
RISK_AMBER = colors.HexColor("#f59e0b")


def _risk_color(risk: str):
    return {"high": RISK_RED, "medium": RISK_AMBER, "low": RISK_GREEN}.get(risk, RISK_AMBER)


def _build_pdf(analysis_id: str, title: str) -> bytes:
    data = get_analysis_data(analysis_id)
    metrics = data["metrics"]
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle("title", fontSize=22, fontName="Helvetica-Bold",
                                  textColor=BRAND_BLUE, spaceAfter=4)
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
                           ParagraphStyle("sub", fontSize=9, textColor=colors.grey, spaceAfter=8)))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_BLUE, spaceAfter=16))

    # Executive Summary
    story.append(Paragraph("Executive Summary", ParagraphStyle("h1", fontSize=14, fontName="Helvetica-Bold", spaceAfter=6)))
    risk = metrics.risk_level.value
    rc = _risk_color(risk)
    summary_text = (f"The fairness audit yielded a score of <b>{metrics.fairness_score}/100</b> "
                    f"with a risk level of <b>{risk.upper()} RISK</b>. "
                    f"Immediate mitigation is {'recommended' if risk != 'low' else 'not required'}.")
    story.append(Paragraph(summary_text, styles["Normal"]))
    story.append(Spacer(1, 12))

    # Metrics Table
    story.append(Paragraph("Fairness Metrics", ParagraphStyle("h1", fontSize=14, fontName="Helvetica-Bold", spaceAfter=6)))
    table_data = [
        ["Metric", "Value", "Threshold", "Status"],
        ["Demographic Parity Gap", f"{metrics.demographic_parity:.4f}", "≤ 0.10", "⚠ FAIL" if metrics.demographic_parity > 0.10 else "✓ PASS"],
        ["Equal Opportunity Diff.", f"{metrics.equal_opportunity:.4f}", "≤ 0.10", "⚠ FAIL" if metrics.equal_opportunity > 0.10 else "✓ PASS"],
        ["Disparate Impact Ratio", f"{metrics.disparate_impact:.4f}", "≥ 0.80", "⚠ FAIL" if metrics.disparate_impact < 0.80 else "✓ PASS"],
        ["Average Odds Diff.", f"{metrics.average_odds:.4f}", "≤ 0.10", "⚠ FAIL" if metrics.average_odds > 0.10 else "✓ PASS"],
        ["Overall Fairness Score", f"{metrics.fairness_score}/100", "≥ 70", f"{'✓ PASS' if metrics.fairness_score >= 70 else '⚠ FAIL'}"],
    ]
    t = Table(table_data, colWidths=[5.5*cm, 3*cm, 3*cm, 3*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f9fa"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # Recommendations
    story.append(Paragraph("Recommendations", ParagraphStyle("h1", fontSize=14, fontName="Helvetica-Bold", spaceAfter=6)))
    recs = [
        "1. Apply <b>data reweighting</b> to balance demographic group representation during training.",
        "2. Remove or anonymize sensitive proxy attributes (e.g., ZIP code, age).",
        "3. Apply <b>equalized odds post-processing</b> for the highest fairness improvement.",
        "4. Conduct ongoing monitoring with quarterly fairness audits.",
        "5. Document mitigation steps for regulatory compliance (EU AI Act, EEOC guidelines).",
    ]
    for rec in recs:
        story.append(Paragraph(rec, ParagraphStyle("rec", fontSize=10, spaceAfter=4, leftIndent=8)))
    story.append(Spacer(1, 12))

    # Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    story.append(Paragraph("Generated by BiasLens AI — Fairness Auditing Platform | biaslens.ai",
                           ParagraphStyle("footer", fontSize=8, textColor=colors.grey, alignment=1)))

    doc.build(story)
    return buf.getvalue()


@router.post("/report/generate", response_model=ReportResponse)
async def generate_report(req: ReportRequest):
    report_id = str(uuid.uuid4())
    _reports[report_id] = {"analysis_id": req.analysis_id, "title": req.title}
    return ReportResponse(
        report_id=report_id,
        title=req.title or "Fairness Audit Report",
        download_url=f"/api/report/{report_id}/download",
    )


@router.get("/report/{report_id}/download")
async def download_report(report_id: str):
    if report_id not in _reports:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found.")
    r = _reports[report_id]
    pdf_bytes = _build_pdf(r["analysis_id"], r["title"])
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="biaslens_report_{report_id[:8]}.pdf"'},
    )
