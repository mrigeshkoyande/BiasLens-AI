<div align="center">
  
# 🔍 BiasLens AI

**An AI-powered fairness auditing platform to detect, explain, and mitigate bias in machine learning models and datasets.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Overview

**BiasLens AI** is a comprehensive, full-stack platform designed for data scientists, compliance officers, and ML engineers to audit datasets for fairness. It automatically analyzes datasets, detects demographic disparities, visualizes feature importance, simulates real-world impacts, and suggests data mitigation strategies. 

It comes with a **Glass-morphic dark mode UI** and a **FastAPI backend** optimized for rapid analytical workflows.

## ✨ Key Features

- 📤 **Intelligent Upload System** — Drag-and-drop CSV upload with automatic column type inference.
- 📊 **Bias Detection Dashboard** — Real-time calculation of Demographic Parity, Equal Opportunity, Disparate Impact, and an aggregated Fairness Score.
- 🧠 **Explainable AI (XAI)** — Human-readable narratives and SHAP-based feature importance charts to understand *why* bias exists.
- 📈 **Impact Simulation** — Scale up the bias mathematically to see the real-world impact across 100K+ applicants.
- 🛠 **Auto-Fix Suggestions** — View side-by-side comparisons of 4 mitigation strategies (Reweighing, Suppression, SMOTE, Thresholding).
- 🤖 **AI Assistant** — A floating Gemini-powered chat panel to answer fairness questions on the fly.
- 📄 **Compliance Reporting** — Generate professional PDF reports summarizing the audit.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, Recharts, Framer Motion, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic |
| **ML & Data** | scikit-learn, pandas, numpy |
| **AI Integration**| Google Gemini 1.5 Flash API |
| **Reporting** | ReportLab (PDF Generation) |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mrigeshkoyande/BiasLens-AI.git
cd BiasLens-AI
```

### 2. Start the Backend (FastAPI)
The backend handles the data crunching, API routing, and AI generation.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY for the AI Chat feature

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
> The API will be running at `http://localhost:8000`
> Swagger UI documentation is available at `http://localhost:8000/docs`

### 3. Start the Frontend (Next.js)
The frontend is a beautifully designed dashboard for interacting with the BiasLens core.

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```
> The web application will be accessible at `http://localhost:3000`

---

## 🔌 API Reference

BiasLens exposes a robust REST API for programmatic access:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload and parse CSV dataset |
| `POST` | `/api/analyze` | Run core bias metrics analysis |
| `POST` | `/api/explain` | Generate SHAP feature importance |
| `POST` | `/api/simulate` | Simulate at-scale societal impact |
| `POST` | `/api/fix` | Apply and compare mitigation strategies |
| `POST` | `/api/chat` | Send a prompt to the AI assistant |
| `POST` | `/api/report/generate` | Generate compliance PDF report |
| `GET`  | `/health` | API Health check |

---

## 🚢 Deployment

### Deploying the Frontend (Vercel)
The easiest way to deploy the frontend is via Vercel:
```bash
cd frontend
npx vercel deploy
```

### Deploying the Backend (Docker / Cloud Run)
A production-ready `Dockerfile` is included in the `backend/` directory.
```bash
cd backend
docker build -t biaslens-api .
docker run -p 8000:8000 --env-file .env biaslens-api
```

---

## 📝 License
This project is licensed under the [MIT License](LICENSE).

---
<div align="center">
  <i>Developed with ❤️ for Ethical AI</i>
</div>
