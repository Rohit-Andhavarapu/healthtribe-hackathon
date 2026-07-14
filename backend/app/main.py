from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import get_settings
from app.infrastructure.database.session import engine
from app.modules.auth.router import router as auth_router
from app.modules.timeline.router import router as timeline_router
from app.modules.appointments.router import router as appointments_router
from app.modules.doctors.router import router as doctors_router
from app.modules.hospitals.router import router as hospitals_router
from app.modules.benefits.router import router as benefits_router
from app.modules.family.router import router as family_router
from app.modules.labs.router import router as labs_router
from app.modules.profile.router import router as profile_router
from app.modules.ai.router import router as ai_router
from app.modules.clinical.router import router as clinical_router
from app.modules.abha.router import router as abha_router
from app.modules.consent.router import router as consent_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # TEMPORARY production seeding: only seed an empty database on first boot.
    async with engine.connect() as connection:
        result = await connection.exec_driver_sql("SELECT COUNT(*) FROM hospitals")
        hospital_count = result.scalar_one()

    if hospital_count == 0:
        from scripts.seed_db_phase1 import seed as seed_phase1

        await seed_phase1()

    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="HealthTribe AI API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration - Allow all origins in production
# Railway/Render reverse proxies handle CORS validation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": app.version}


@app.get("/ready", tags=["Health"])
async def readiness_check():
    return {"status": "ready"}


@app.get("/live", tags=["Health"])
async def liveness_check():
    return {"status": "alive"}


# Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(timeline_router, prefix="/api/v1/timeline", tags=["Timeline"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(doctors_router, prefix="/api/v1/doctors", tags=["Doctors"])
app.include_router(hospitals_router, prefix="/api/v1/hospitals", tags=["Hospitals"])
app.include_router(benefits_router, prefix="/api/v1/benefits", tags=["Benefits"])
app.include_router(family_router, prefix="/api/v1/family", tags=["Family"])
app.include_router(labs_router, prefix="/api/v1/labs", tags=["Labs"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["Profile"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI Assistant"])
app.include_router(clinical_router, prefix="/api/v1/clinical", tags=["Clinical"])
app.include_router(abha_router, prefix="/api/v1/abha", tags=["ABHA"])
app.include_router(consent_router, prefix="/api/v1/consent", tags=["Consent"])