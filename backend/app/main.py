from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base
from app.data.seed_data import seed_database
from app.api.alerts import router as alerts_router
from app.api.investigation import router as investigation_router
from app.api.graph import router as graph_router
from app.api.transactions import router as transactions_router
from app.api.sar import router as sar_router
from app.api.metrics import router as metrics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed database
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent AML Investigation & Financial Risk Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(investigation_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(transactions_router, prefix=settings.API_V1_STR)
app.include_router(sar_router, prefix=settings.API_V1_STR)
app.include_router(metrics_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "FinGuard AI AML Intelligence Platform",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
