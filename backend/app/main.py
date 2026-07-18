from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, analytics, auth, donors, hospitals, requests, users, locations
from app.config import get_settings
from app.database.session import Base, engine
from app.models import entities  # noqa: F401 - registers SQLAlchemy models
from app.services.scheduler import start_scheduler
from app.utils.rate_limit import InMemoryRateLimitMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
    scheduler = start_scheduler()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-powered blood donor, hospital, and emergency request network.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(InMemoryRateLimitMiddleware, max_requests=180, window_seconds=60)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(donors.router, prefix=settings.api_prefix)
app.include_router(requests.router, prefix=settings.api_prefix)
app.include_router(hospitals.router, prefix=settings.api_prefix)
app.include_router(locations.router, prefix=settings.api_prefix)
app.include_router(ai.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {"name": settings.app_name, "status": "online", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
