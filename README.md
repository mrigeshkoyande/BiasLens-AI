# BiasLens AI

<div align="center">
<img src="frontend/public/logo.png" alt="BiasLens AI Logo" width="120" />

**An Enterprise-Grade AI-Powered Fairness Auditing Platform**

Detect, explain, and systematically mitigate bias in machine learning models and datasets with advanced explainability and compliance-ready reporting.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Documentation](#documentation) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**BiasLens AI** is a production-ready, full-stack fairness auditing platform designed for data scientists, ML engineers, compliance officers, and organizations committed to responsible AI. The platform provides comprehensive tools to:

- **Detect** demographic disparities and algorithmic bias using industry-standard fairness metrics
- **Explain** the root causes of bias through advanced XAI techniques and interpretable visualizations
- **Simulate** real-world impact of identified biases at scale
- **Mitigate** bias through data-driven algorithmic and data-level interventions
- **Report** compliance-ready audit trails and professional recommendations

The platform combines a modern React-based frontend with sophisticated Python backend analytics to streamline bias detection workflows and support data governance initiatives.

---

## Key Features

### Core Analytics
- **Fairness Risk Engine** — Real-time computation of a weighted 0-100 `Risk Score` and severity levels (Low, Medium, High).
- **Explainable AI (XAI)** — SHAP-based feature importance and human-readable bias narratives for root-cause analysis.
- **Impact Simulation** — Mathematically project bias effects across scaled populations (e.g., "4,200 individuals unfairly disadvantaged").
- **Mitigation Workbench** — Side-by-side "Before vs. After" comparison with direct `Risk Reduction %` metrics.

### User Experience
- **Guided Demo Flow (Proctor Mode)** — Quick-load sample datasets (Loan Approval, Housing) for immediate bias auditing demonstrations.
- **Compliance Matrix** — Real-time mapping of fairness scores to international frameworks like the **EU AI Act** and **NIST AI RMF**.
- **Security & Multi-Tenancy** — Enterprise-grade **Firebase JWT Authentication** and strict user-id data isolation for secure multi-user auditing.
- **Professional Reporting** — Export functional, audit-ready PDF reports with functional Share/Print capabilities.

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | Next.js (App Router) | 14 |
| **Backend** | FastAPI, Uvicorn | 0.115+ |
| **Authentication** | Firebase Auth (JWT) | Latest |
| **Database** | SQLite (Production-ready schemas) | Latest |
| **AI Integration** | Google Gemini 1.5 Flash API | Latest |
| **ML & Data** | scikit-learn, AIF360, SHAP | Latest |

---

## Quick Start

### Prerequisites

- **Python 3.13+** with pip/venv
- **Node.js 18+** with npm
- **Docker** (optional, for containerized deployment)
- **Google Gemini API Key** (for AI chat features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/mrigeshkoyande/BiasLens-AI.git
cd BiasLens-AI
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Add your credentials to .env
# GEMINI_API_KEY=your_api_key_here
# FIREBASE_SERVICE_ACCOUNT_PATH=path/to/firebase-key.json

# Run database migrations
python migrate_db.py

# Start the development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API documentation will be available at `http://localhost:8000/docs` (Swagger UI).

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be accessible at `http://localhost:3000`.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  Dashboard │ Upload │ Analysis │ Simulation │ Reports       │
└───────────────┬────────────────────────────────────┬────────┘
                │ REST API + JWT Token               │
┌───────────────▼────────────────────────────────────▼────────┐
│                   API Layer (FastAPI)                       │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────────┐│
│ │ Auth     │ Analyze  │ Explain  │Simulate  │ Mitigate    ││
│ │ Middleware Router   │ Router   │ Router   │ Router      ││
│ └────┬─────┴────┬─────┴────┬─────┴────┬─────┴─────┬───────┘│
└──────┼──────────┼──────────┼──────────┼───────────┼────────┘
       │          │          │          │           │
┌──────▼──────────▼──────────▼──────────▼───────────▼────────┐
│               Service Layer & Persistence                  │
│ ┌─────────────────┬──────────────────┬────────────────────┐│
│ │ Bias Analysis   │ XAI & Reporting  │ Persistence        ││
│ │ (scikit-learn)  │ (SHAP)           │ (SQLite / SQLAlchemy)│
│ └─────────────────┴──────────────────┴────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
BiasLens-AI/
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── main.py                  # Application entry point
│   │   ├── config.py                # Configuration management
│   │   ├── models/
│   │   │   └── schemas.py           # Request/response schemas
│   │   ├── routers/                 # API endpoints
│   │   │   ├── upload.py            # Dataset upload handling
│   │   │   ├── analyze.py           # Bias analysis endpoints
│   │   │   ├── explain.py           # XAI endpoints
│   │   │   ├── simulate.py          # Impact simulation
│   │   │   ├── fix.py               # Mitigation strategies
│   │   │   ├── chat.py              # AI assistant
│   │   │   └── report.py            # PDF report generation
│   │   └── services/                # Business logic
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Container configuration
│
├── frontend/                         # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── upload/              # Upload interface
│   │   │   ├── reports/             # Reports page
│   │   │   └── settings/            # Settings page
│   │   ├── components/
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── upload/              # Upload components
│   │   │   ├── chat/                # Chat interface
│   │   │   ├── explanation/         # XAI visualization
│   │   │   ├── autofix/             # Mitigation UI
│   │   │   ├── simulation/          # Simulation controls
│   │   │   └── layout/              # Layout components
│   │   └── lib/
│   │       ├── types.ts             # TypeScript types
│   │       └── mockData.ts          # Mock data for development
│   ├── package.json                 # Node dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── tailwind.config.ts           # Tailwind CSS configuration
│
└── README.md                         # This file
```

---

## API Reference

### Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload and validate CSV dataset |

**Request:**
```json
{
  "file": "<csv_file>",
  "target_column": "outcome",
  "protected_attributes": ["gender", "ethnicity"]
}
```

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Compute fairness metrics |
| `POST` | `/api/explain` | Generate SHAP-based explanations |

### Simulation & Mitigation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/simulate` | Project bias impact at scale |
| `POST` | `/api/fix` | Evaluate mitigation strategies |

### Support Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | AI-assisted bias explanations |
| `POST` | `/api/report/generate` | Generate PDF audit report |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/docs` | Swagger API documentation |

---

## Project Structure

### Backend Organization

- **Models/Schemas**: Pydantic models for request/response validation
- **Routers**: API endpoint handlers organized by feature domain
- **Services**: Business logic layer for bias analysis, XAI, and reporting
- **Config**: Environment and application configuration management

### Frontend Organization

- **App Router**: Next.js page-based routing structure
- **Components**: Reusable React components organized by feature
- **Lib**: Utility functions, type definitions, and mock data
- **Styles**: Tailwind CSS configuration and global styles

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# API Configuration
ENVIRONMENT=development
DEBUG=true
PORT=8000
CORS_ORIGINS=["http://localhost:3000"]

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# Authentication
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-key.json

# Database
# Default is ./biaslens.db
DATABASE_URL=sqlite:///./biaslens.db
```

### Frontend Configuration

Environment variables should be prefixed with `NEXT_PUBLIC_` in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=BiasLens AI
```

---

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 .
black .

# Frontend linting
cd frontend
npm run lint
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linters and tests
4. Submit a pull request with clear description
5. Address review feedback

---

## Deployment

### Docker Deployment (Backend)

```bash
cd backend

# Build image
docker build -t biaslens-api:latest .

# Run container
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  biaslens-api:latest
```

### Cloud Deployment

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

**Backend (Google Cloud Run):**
```bash
cd backend
gcloud run deploy biaslens-api \
  --source . \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=your_key
```

### Production Checklist

- [ ] Set appropriate CORS origins
- [ ] Configure database for persistence
- [ ] Enable API authentication/authorization
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Use environment-specific secrets
- [ ] Enable HTTPS
- [ ] Set up automated backups

---

## Contributing

We welcome contributions from the community. To contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Provide clear commit messages

### Development Standards

- **Python**: PEP 8 compliance, type hints
- **TypeScript**: ESLint configuration, strict mode
- **Testing**: Minimum 80% code coverage
- **Documentation**: Clear docstrings and comments for complex logic

---

## License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

---

<div align="center">

**Built with commitment to Ethical AI and Responsible Machine Learning**

[⬆ back to top](#biaslens-ai)

</div>
