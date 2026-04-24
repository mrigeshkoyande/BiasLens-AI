# BiasLens AI 🔍

> **AI-powered fairness auditing platform** — detect, explain, and fix bias in datasets and machine learning models.

## 🚀 Quick Start

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

---

## 🗂 Project Structure

```
BiasLens-AI/
├── frontend/          # Next.js 14 + Tailwind CSS
│   ├── src/app/       # Pages: Dashboard, Upload, Reports, Settings
│   ├── src/components # UI + Feature components
│   └── src/lib/       # Types, mock data, API client
│
└── backend/           # FastAPI Python
    └── app/
        ├── routers/   # upload, analyze, explain, simulate, fix, chat, report
        ├── models/    # Pydantic schemas
        └── main.py    # App entry point
```

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env` in the `backend/` folder:

```env
GEMINI_API_KEY=your_key_here    # For AI chat assistant
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
```

> Without a Gemini API key, the chat assistant uses a smart rule-based fallback.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload CSV dataset |
| `POST` | `/api/analyze` | Run bias analysis |
| `POST` | `/api/explain` | Generate feature importance |
| `POST` | `/api/simulate` | Simulate at-scale impact |
| `POST` | `/api/fix` | Apply mitigation strategy |
| `POST` | `/api/chat` | AI chat assistant |
| `POST` | `/api/report/generate` | Generate PDF report |
| `GET`  | `/api/report/{id}/download` | Download PDF |
| `GET`  | `/health` | Health check |

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS v3, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.13, Uvicorn |
| ML | scikit-learn, pandas, numpy |
| AI Chat | Google Gemini 1.5 Flash |
| PDF | ReportLab |
| Database | Supabase (PostgreSQL) |

---

## 📊 Features

1. **Upload System** — CSV drag-and-drop or API connect, auto column type detection
2. **Bias Detection Dashboard** — Demographic Parity, Equal Opportunity, Disparate Impact, Fairness Score 0–100
3. **Bias Explanation** — Human-readable narratives + feature importance charts
4. **Real-World Simulation** — Scale impact to 100K applicants, cost estimation
5. **Auto-Fix Suggestions** — 4 mitigation strategies with before/after comparison
6. **Report Generator** — Professional PDF with metrics, risks, and recommendations
7. **AI Assistant** — Chat panel powered by Gemini (rule-based fallback included)

---

## 🚢 Deployment

**Frontend → Vercel**
```bash
cd frontend && vercel deploy
```

**Backend → Docker**
```bash
cd backend
docker build -t biaslens-api .
docker run -p 8000:8000 --env-file .env biaslens-api
```
