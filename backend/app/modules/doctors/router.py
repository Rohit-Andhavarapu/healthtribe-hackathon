from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import Doctor, User
from app.core.security import get_current_user
from app.modules.doctors.schemas import DoctorResponse, DoctorAvailabilityResponse
from app.modules.doctors.service import DoctorService

router = APIRouter()

@router.get("/me", response_model=DoctorResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Not a doctor")
        
    query = select(Doctor).options(joinedload(Doctor.hospital)).where(Doctor.user_id == user.id)
    result = await db.execute(query)
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    return {
        "id": doc.id,
        "name": doc.name,
        "specialty": doc.specialty,
        "hospital_id": doc.hospital_id,
        "license_ref": doc.license_ref,
        "image_url": doc.image_url,
        "rating": doc.rating,
        "experience": doc.experience,
        "languages": doc.languages,
        "consultation_fee": doc.consultation_fee,
        "availability": doc.availability,
        "hospital_name": doc.hospital.name if doc.hospital else "Unknown Hospital"
    }

@router.get("/", response_model=List[DoctorResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(Doctor).options(joinedload(Doctor.hospital))
    
    result = await db.execute(query)
    doctors = result.scalars().all()
    
    response = []
    for doc in doctors:
        doc_dict = {
            "id": doc.id,
            "name": doc.name,
            "specialty": doc.specialty,
            "hospital_id": doc.hospital_id,
            "license_ref": doc.license_ref,
            "image_url": doc.image_url,
            "rating": doc.rating,
            "experience": doc.experience,
            "languages": doc.languages,
            "consultation_fee": doc.consultation_fee,
            "availability": doc.availability,
            "hospital_name": doc.hospital.name if doc.hospital else "Unknown Hospital"
        }
        response.append(doc_dict)
        
    return response

@router.get("/{doctor_id}/availability", response_model=List[DoctorAvailabilityResponse], operation_id="getDoctorAvailability")
async def get_doctor_availability(
    doctor_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = DoctorService(db)
    return await service.get_doctor_availability(doctor_id)
