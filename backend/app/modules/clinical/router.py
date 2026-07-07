from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.infrastructure.database.session import get_db
from app.core.security import get_current_user
from app.infrastructure.database.models import User, Medication, LabOrder, Appointment, Doctor, MedicationOrder, OrderStatus
from .schemas import MedicationResponse, LabOrderResponse, MedicationOrderResponse, CreateMedicationOrderRequest
from app.modules.timeline.service import TimelineService
from app.modules.timeline.schemas import TimelineEventCreate
from datetime import datetime, timezone

router = APIRouter(tags=["clinical"])

@router.get("/patients/{patient_id}/medications", response_model=List[MedicationResponse])
async def get_patient_medications(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Only doctors or the patient themselves should access this
    if user.role.value != "DOCTOR" and str(user.id) != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(Medication).where(Medication.patient_id == uuid.UUID(patient_id))
    result = await db.execute(query)
    meds = result.scalars().all()
    return meds

@router.get("/patients/{patient_id}/medication-orders", response_model=List[MedicationOrderResponse])
async def get_patient_medication_orders(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR" and str(user.id) != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(MedicationOrder).where(MedicationOrder.patient_id == uuid.UUID(patient_id))
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.post("/patients/{patient_id}/medication-orders", response_model=MedicationOrderResponse)
async def create_patient_medication_order(
    patient_id: str,
    request: CreateMedicationOrderRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "PATIENT" and str(user.id) != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = MedicationOrder(
        patient_id=uuid.UUID(patient_id),
        status=OrderStatus.PLACED,
        medication_ids=request.medication_ids
    )
    
    if request.appointment_id and str(request.appointment_id).strip():
        order.appointment_id = uuid.UUID(str(request.appointment_id).strip())
    if request.consultation_id and str(request.consultation_id).strip():
        order.consultation_id = uuid.UUID(str(request.consultation_id).strip())
        
    db.add(order)
    await db.flush()
    
    # Generate timeline event
    now = datetime.now(timezone.utc)
    timeline_service = TimelineService(db)
    
    event_data = TimelineEventCreate(
        patient_id=uuid.UUID(patient_id),
        occurred_at=now,
        type="PHARMACY_ORDER",
        status="active",
        source="System",
        tags=["Pharmacy", "Order", "Medication"],
        structured_payload={
            "title": "Pharmacy Order Placed",
            "order_id": str(order.id),
            "medication_count": len(request.medication_ids)
        }
    )
    await timeline_service.create_event(event_data)
    
    await db.commit()
    await db.refresh(order)
    return order

@router.get("/patients/{patient_id}/lab-orders", response_model=List[LabOrderResponse])
async def get_patient_lab_orders(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR" and str(user.id) != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(LabOrder).where(LabOrder.patient_id == uuid.UUID(patient_id))
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.get("/analytics")
async def get_clinical_analytics(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    doc_query = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
    doctor = doc_query.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    today = datetime.now(timezone.utc).date()
    
    # Get all appointments for this doctor
    appts_query = await db.execute(select(Appointment).where(Appointment.doctor_id == doctor.id))
    appts = appts_query.scalars().all()
    
    today_appts = [a for a in appts if datetime.strptime(a.date, "%Y-%m-%d").date() == today]
    
    completed_today = len([a for a in today_appts if a.status == "COMPLETED"])
    total_today = len(today_appts)
    patients_seen_today = len(set([a.patient_id for a in today_appts if a.status == "COMPLETED"]))
    
    return {
        "today_total_appointments": total_today,
        "today_completed_appointments": completed_today,
        "today_patients_seen": patients_seen_today,
        "average_duration_mins": 15 # Mock average for now
    }
