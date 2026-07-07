import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import User
from app.core.security import get_current_user
from app.modules.abha.schemas import ABHALinkRequest, ABHAIdentityResponse, ImportRecordsRequest, ImportSessionResponse
from app.modules.abha.service import ABHAService

router = APIRouter()

class OTPGenerateResponse(BaseModel):
    otp: str
    message: str

class OTPVerifyRequest(BaseModel):
    otp: str
    abha_number: str
    abha_address: str

# ─── OTP Flow ────────────────────────────────────────────────────────────────

@router.post("/generate-otp", response_model=OTPGenerateResponse)
async def generate_otp(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a mock OTP for ABHA verification. Returns the OTP visibly for demo."""
    service = ABHAService(db)
    otp = service.generate_otp(str(user.id))
    return OTPGenerateResponse(
        otp=otp,
        message=f"OTP generated for demo. Use this OTP to verify your ABHA identity."
    )

@router.post("/verify-otp", response_model=ABHAIdentityResponse)
async def verify_otp_and_link(
    request: OTPVerifyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify OTP and link ABHA. Returns linked identity on success."""
    service = ABHAService(db)
    if not service.verify_otp(str(user.id), request.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
    
    link_req = ABHALinkRequest(
        abha_number=request.abha_number,
        abha_address=request.abha_address
    )
    identity = await service.link_abha(str(user.id), link_req)
    return identity

# ─── Direct Link (for programmatic use / testing) ────────────────────────────

@router.post("/link/{patient_id}", response_model=ABHAIdentityResponse)
async def link_abha(
    patient_id: str,
    request: ABHALinkRequest,
    db: AsyncSession = Depends(get_db)
):
    service = ABHAService(db)
    identity = await service.link_abha(patient_id, request)
    return identity

@router.get("/identity/me", response_model=Optional[ABHAIdentityResponse])
async def get_my_abha_identity(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's ABHA identity."""
    service = ABHAService(db)
    identity = await service.get_abha_identity(str(user.id))
    return identity  # Returns null if not linked (frontend handles this)

@router.get("/identity/{patient_id}", response_model=Optional[ABHAIdentityResponse])
async def get_abha_identity(
    patient_id: str,
    db: AsyncSession = Depends(get_db)
):
    service = ABHAService(db)
    identity = await service.get_abha_identity(patient_id)
    if not identity:
        raise HTTPException(status_code=404, detail="No linked ABHA identity found")
    return identity

# ─── Import Records ──────────────────────────────────────────────────────────

@router.post("/import/me", response_model=ImportSessionResponse)
async def import_records_for_me(
    request: ImportRecordsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Import records for the current authenticated user."""
    service = ABHAService(db)
    session = await service.import_records(str(user.id), request.hospital_id, request.consent_record_id)
    return session

@router.post("/import/{patient_id}", response_model=ImportSessionResponse)
async def import_records(
    patient_id: str,
    request: ImportRecordsRequest,
    db: AsyncSession = Depends(get_db)
):
    service = ABHAService(db)
    session = await service.import_records(patient_id, request.hospital_id, request.consent_record_id)
    return session
