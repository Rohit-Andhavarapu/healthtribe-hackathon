import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from datetime import datetime, timezone
from app.infrastructure.database.models import Appointment, Doctor, User, Medication, LabOrder, Consultation, MedicationOrder
from app.modules.appointments.schemas import AppointmentCreate, MedicationCreate, LabOrderCreate
from app.modules.timeline.service import TimelineService
from app.modules.timeline.schemas import TimelineEventCreate

class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.timeline_service = TimelineService(db)

    async def get_patient_appointments(self, patient_id: str) -> List[Appointment]:
        query = select(Appointment).where(Appointment.patient_id == patient_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_all_appointments(self) -> List[Appointment]:
        query = select(Appointment)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_appointment(
        self, 
        patient_id: str, 
        doctor_id: uuid.UUID, 
        date: str, 
        time: str = "10:00 AM", 
        type: str = "In-Person", 
        notes: str = "Booked via HealthTribe"
    ) -> Appointment:
        # Double-booking check
        existing_query = select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.date == date,
            Appointment.time == time,
            Appointment.status != "Cancelled"
        )
        existing_result = await self.db.execute(existing_query)
        if existing_result.scalar_one_or_none():
            raise ValueError(f"Doctor is already booked at {date} {time}")

        import random
        import string
        
        meet_link = None
        if type and type.lower() == "video":
            chars = string.ascii_lowercase
            p1 = ''.join(random.choices(chars, k=3))
            p2 = ''.join(random.choices(chars, k=4))
            p3 = ''.join(random.choices(chars, k=3))
            meet_link = f"https://meet.google.com/{p1}-{p2}-{p3}"

        appt = Appointment(
            id=uuid.uuid4(),
            patient_id=patient_id,
            doctor_id=doctor_id,
            date=date,
            time=time,
            type=type,
            status="Scheduled",
            notes=notes,
            meet_link=meet_link
        )
        self.db.add(appt)
        
        # Get doctor name/hospital for payload (quick query)
        doctor_query = await self.db.execute(select(Doctor).options(joinedload(Doctor.hospital)).where(Doctor.id == doctor_id))
        doctor_obj = doctor_query.scalar_one_or_none()
        
        doc_name = doctor_obj.name if doctor_obj else "Unknown Doctor"
        hosp_name = doctor_obj.hospital.name if doctor_obj and doctor_obj.hospital else "Unknown Hospital"
        
        event_data = TimelineEventCreate(
            patient_id=uuid.UUID(patient_id) if isinstance(patient_id, str) else patient_id,
            doctor_id=doctor_obj.id if doctor_obj else None,
            occurred_at=datetime.now(timezone.utc),
            type="APPOINTMENT_SCHEDULED",
            status="scheduled",
            source="App",
            tags=["Appointment", type],
            structured_payload={
                "title": f"Appointment Scheduled with {doc_name}",
                "notes": f"Scheduled for {date} at {time}.",
                "doctor_name": doc_name,
                "hospital_name": hosp_name
            }
        )
        
        # TimelineService will commit the transaction and refresh the event
        # which will also commit the Appointment
        await self.timeline_service.create_event(event_data)
        
        await self.db.refresh(appt)
        return appt

    async def complete_consultation(
        self,
        appointment_id: str,
        notes: Optional[str] = None,
        medications: Optional[List[MedicationCreate]] = None,
        lab_orders: Optional[List[LabOrderCreate]] = None,
        doctor_user_id: Optional[str] = None
    ) -> Appointment:
        # Find appointment
        query = select(Appointment).where(Appointment.id == uuid.UUID(appointment_id))
        result = await self.db.execute(query)
        appt = result.scalar_one_or_none()
        
        if not appt:
            raise ValueError("Appointment not found")
            
        # Update status
        appt.status = "COMPLETED"
        if notes and not appt.notes:
            appt.notes = notes
        
        # We need the doctor object for timeline events
        doctor_query = await self.db.execute(select(Doctor).where(Doctor.id == appt.doctor_id))
        doctor_obj = doctor_query.scalar_one_or_none()
        
        doc_uuid = doctor_obj.id if doctor_obj else None
        
        # Create Consultation
        consultation = Consultation(
            appointment_id=appt.id,
            patient_id=appt.patient_id,
            doctor_id=appt.doctor_id,
            notes=notes
        )
        self.db.add(consultation)
        await self.db.flush() # Flush to get consultation.id
        
        # Add timeline events
        now = datetime.now(timezone.utc)
        
        if notes:
            event_data = TimelineEventCreate(
                patient_id=appt.patient_id,
                doctor_id=doc_uuid,
                occurred_at=now,
                type="CONSULTATION",
                status="completed",
                source="Doctor",
                tags=["Consultation", "Note"],
                structured_payload={
                    "title": "Consultation Notes",
                    "notes": notes
                }
            )
            await self.timeline_service.create_event(event_data)
            
        if medications:
            med_names = []
            med_ids = []
            for med in medications:
                new_med = Medication(
                    patient_id=appt.patient_id,
                    doctor_id=appt.doctor_id,
                    appointment_id=appt.id,
                    name=med.name,
                    dosage=med.dosage,
                    frequency=med.frequency,
                    duration=med.duration,
                    instructions=med.instructions,
                    status="ACTIVE"
                )
                self.db.add(new_med)
                await self.db.flush()
                
                med_names.append(f"{med.name} {med.dosage} ({med.frequency})")
                med_ids.append(str(new_med.id))
                
            event_data = TimelineEventCreate(
                patient_id=appt.patient_id,
                doctor_id=doc_uuid,
                occurred_at=now,
                type="PRESCRIPTION",
                status="active",
                source="Doctor",
                tags=["Prescription", "Medication"],
                structured_payload={
                    "title": "Prescription Issued",
                    "medications": med_names,
                    "medication_ids": med_ids,
                    "count": len(med_names),
                    "appointment_id": str(appt.id),
                    "consultation_id": str(consultation.id)
                }
            )
            await self.timeline_service.create_event(event_data)
            
        if lab_orders:
            test_names = []
            for order in lab_orders:
                new_order = LabOrder(
                    patient_id=appt.patient_id,
                    doctor_id=appt.doctor_id,
                    appointment_id=appt.id,
                    test_name=order.test_name,
                    priority=order.priority,
                    notes=order.notes,
                    status="PENDING"
                )
                self.db.add(new_order)
                test_names.append(order.test_name)
                
            event_data = TimelineEventCreate(
                patient_id=appt.patient_id,
                doctor_id=doc_uuid,
                occurred_at=now,
                type="LAB_RESULT", # Using LAB_RESULT as the base type for labs
                status="pending",
                source="Doctor",
                tags=["Lab", "Order"],
                structured_payload={
                    "title": "Lab Tests Ordered",
                    "tests": test_names,
                    "count": len(test_names)
                }
            )
            await self.timeline_service.create_event(event_data)
            
        await self.db.commit()
        await self.db.refresh(appt)
        return appt
