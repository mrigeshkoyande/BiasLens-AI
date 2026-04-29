from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import upload, analyze, explain, simulate, fix, chat, report, insights
from app.database import engine
from app.models import db_models

print("Creating database tables...")
db_models.Base.metadata.create_all(bind=engine)
print("Database tables created.")

app = FastAPI(
    title="BiasLens AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router,   prefix="/api")
app.include_router(analyze.router,  prefix="/api")
app.include_router(explain.router,  prefix="/api")
app.include_router(simulate.router, prefix="/api")
app.include_router(fix.router,      prefix="/api")
app.include_router(chat.router,     prefix="/api")
app.include_router(report.router,   prefix="/api")
app.include_router(insights.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

