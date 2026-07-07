from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import Appointment, User
from app.core.security import get_current_user
from app.modules.appointments.schemas import AppointmentResponse, AppointmentCreate, ConsultationCompletion
from app.modules.appointments.service import AppointmentService
import uuid

router = APIRouter()

@router.get("/", response_model=List[AppointmentResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = AppointmentService(db)
    
    if user.role.value == "DOCTOR":
        # Get doctor's profile to find their appointments
        from app.infrastructure.database.models import Doctor
        result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        doctor = result.scalar_one_or_none()
        if doctor:
            # Join PatientProfile to get the patient name
            from app.infrastructure.database.models import PatientProfile
            query = (
                select(Appointment, PatientProfile)
                .outerjoin(PatientProfile, PatientProfile.user_id == Appointment.patient_id)
                .where(Appointment.doctor_id == doctor.id)
            )
            result = await db.execute(query)
            appointments_with_profiles = result.all()
            
            response = []
            for appt, profile in appointments_with_profiles:
                appt_dict = {
                    "id": appt.id,
                    "date": appt.date,
                    "time": appt.time,
                    "status": appt.status,
                    "type": appt.type,
                    "notes": appt.notes,
                    "doctor_id": appt.doctor_id,
                    "patient_id": appt.patient_id,
                    "patient_name": profile.demographics.get("name") if profile and profile.demographics else "Unknown Patient"
                }
                response.append(AppointmentResponse(**appt_dict))
            return response
        return []
        
    return await service.get_patient_appointments(user.id)

@router.post("/", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    appt_in: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Verify doctor exists
    from app.infrastructure.database.models import Doctor
    result = await db.execute(select(Doctor).where(Doctor.id == appt_in.doctor_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    service = AppointmentService(db)
    appt = await service.create_appointment(
        patient_id=user.id,
        doctor_id=doctor.id,
        date=appt_in.date,
        time=appt_in.time,
        type=appt_in.type,
        notes=appt_in.notes or "Booked via HealthTribe"
    )
    return appt

@router.post("/{appointment_id}/complete", response_model=AppointmentResponse)
async def complete_consultation(
    appointment_id: str,
    completion_data: ConsultationCompletion,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can complete consultations")
        
    service = AppointmentService(db)
    try:
        appt = await service.complete_consultation(
            appointment_id=appointment_id,
            notes=completion_data.notes,
            medications=completion_data.medications,
            lab_orders=completion_data.lab_orders,
            doctor_user_id=str(user.id)
        )
        return appt
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{appointment_id}/consultation")
async def get_consultation(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from app.infrastructure.database.models import Consultation, MedicationOrder, Medication, LabOrder
    from sqlalchemy.orm import joinedload
    
    query = (
        select(Consultation)
        .where(Consultation.appointment_id == uuid.UUID(appointment_id))
    )
    result = await db.execute(query)
    consultation = result.scalar_one_or_none()
    
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    # Get medication order
    med_order_query = select(MedicationOrder).where(MedicationOrder.consultation_id == consultation.id)
    med_order_res = await db.execute(med_order_query)
    med_order = med_order_res.scalar_one_or_none()
    
    # Get medications
    meds = []
    if med_order and med_order.medication_ids:
        meds_query = select(Medication).where(Medication.id.in_([uuid.UUID(m) for m in med_order.medication_ids]))
        meds_res = await db.execute(meds_query)
        meds = meds_res.scalars().all()
        
    # Get lab orders
    labs_query = select(LabOrder).where(LabOrder.appointment_id == uuid.UUID(appointment_id))
    labs_res = await db.execute(labs_query)
    labs = labs_res.scalars().all()
    
    return {
        "id": consultation.id,
        "appointment_id": consultation.appointment_id,
        "notes": consultation.notes,
        "vitals": consultation.vitals,
        "diagnosis": consultation.diagnosis,
        "medications": [
            {
                "id": m.id,
                "name": m.name,
                "dosage": m.dosage,
                "frequency": m.frequency,
                "duration": m.duration,
                "instructions": m.instructions
            } for m in meds
        ],
        "lab_orders": [
            {
                "id": l.id,
                "test_name": l.test_name,
                "priority": l.priority,
                "notes": l.notes,
                "status": l.status
            } for l in labs
        ]
    }
