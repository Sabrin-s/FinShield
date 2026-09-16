from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "FinGuard AI AML Intelligence Platform",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# Check for built frontend dist (enables single-service full-stack deployment on Render/Docker)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root(request: Request):
        accept = request.headers.get("accept", "")
        if "text/html" in accept:
            return FileResponse(os.path.join(frontend_dist, "index.html"))
        return {
            "status": "ONLINE",
            "system": "FinGuard AI AML Intelligence Platform",
            "version": "1.0.0",
            "docs_url": "/docs"
        }

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "ONLINE",
            "system": "FinGuard AI AML Intelligence Platform",
            "version": "1.0.0",
            "docs_url": "/docs"
        }

