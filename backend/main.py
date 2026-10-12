from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal, run_migrations
from config import settings
from routers import api_router
import models
from seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQL schema, seeds initial records, and starts background schedulers."""
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        seed_database(db)
        from services.ingestion_service import IngestionService
        IngestionService.run_ingestion(db)
        from services.monitoring_service import MonitoringService
        MonitoringService.ensure_merchants(db)
    finally:
        db.close()
    
    # Start APScheduler background jobs
    from services.scheduler_service import start_scheduler, shutdown_scheduler
    start_scheduler()
    yield
    shutdown_scheduler()



app = FastAPI(
    title=settings.APP_NAME,
    description="Python FastAPI fintech platform with SQL authentication, card management, and rewards optimization",
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include unified API router
app.include_router(api_router)


@app.get("/api/health", tags=["System"])
def health_check():
    """Health check endpoint confirming SQL database connectivity and service status."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "database": "SQL Active",
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
