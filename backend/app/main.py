from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import upload, analyze, explain, simulate, fix, chat, report


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[START] BiasLens AI backend starting...")
    yield
    print("[STOP] BiasLens AI backend shutting down.")


app = FastAPI(
    title="BiasLens AI API",
    description="AI-powered fairness auditing platform — detect, explain, and fix bias in ML models.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://biaslens.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(upload.router,   prefix="/api", tags=["Upload"])
app.include_router(analyze.router,  prefix="/api", tags=["Analysis"])
app.include_router(explain.router,  prefix="/api", tags=["Explanation"])
app.include_router(simulate.router, prefix="/api", tags=["Simulation"])
app.include_router(fix.router,      prefix="/api", tags=["Auto-Fix"])
app.include_router(chat.router,     prefix="/api", tags=["AI Chat"])
app.include_router(report.router,   prefix="/api", tags=["Reports"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "BiasLens AI", "version": "1.0.0"}
