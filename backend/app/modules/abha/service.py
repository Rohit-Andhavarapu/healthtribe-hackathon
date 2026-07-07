import uuid
import datetime
import random
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from app.infrastructure.database.models import ABHAIdentity, ImportSession, ImportedHealthRecord, Hospital
from app.modules.abha.schemas import ABHALinkRequest
from app.modules.timeline.converter import TimelineConverter
from app.modules.timeline.factory import TimelineEventFactory
from app.modules.timeline.service import TimelineService

# Mock OTP store: patient_id -> otp
_otp_store: dict[str, str] = {}

class ABHAService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.timeline_converter = TimelineConverter(db)
        self.timeline_service = TimelineService(db)

    async def get_abha_identity(self, patient_id: str) -> Optional[ABHAIdentity]:
        existing = await self.db.execute(select(ABHAIdentity).where(ABHAIdentity.patient_id == patient_id))
        return existing.scalar_one_or_none()

    def generate_otp(self, patient_id: str) -> str:
        """Generate a 6-digit mock OTP for a patient and store it."""
        otp = f"{random.randint(100000, 999999)}"
        _otp_store[patient_id] = otp
        return otp

    def verify_otp(self, patient_id: str, otp: str) -> bool:
        """Verify OTP — in mock mode, any code that matches stored OTP passes.
        Also accepts '000000' as a universal bypass for demo."""
        stored = _otp_store.get(patient_id)
        return otp == stored or otp == "000000"

    async def link_abha(self, patient_id: str, request: ABHALinkRequest) -> ABHAIdentity:
        # Check if already linked
        existing = await self.db.execute(select(ABHAIdentity).where(ABHAIdentity.patient_id == patient_id))
        identity = existing.scalar_one_or_none()
        
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        is_new = identity is None
        
        if identity:
            identity.abha_number = request.abha_number
            identity.abha_address = request.abha_address
            identity.verification_status = "VERIFIED"
            identity.verification_method = "OTP_MOCK"
            identity.linked_at = now_iso
        else:
            identity = ABHAIdentity(
                id=uuid.uuid4(),
                patient_id=patient_id,
                abha_number=request.abha_number,
                abha_address=request.abha_address,
                verification_status="VERIFIED",
                verification_method="OTP_MOCK",
                linked_at=now_iso,
                is_primary=True
            )
            self.db.add(identity)
            
        await self.db.commit()
        await self.db.refresh(identity)
        
        # Emit ABHA Linked Timeline Event (only on first link or re-link)
        try:
            ev = TimelineEventFactory.create_abha_linked(
                patient_id=uuid.UUID(patient_id),
                abha_number=request.abha_number,
                abha_address=request.abha_address,
                identity_id=identity.id
            )
            await self.timeline_service.create_event(ev)
        except Exception:
            pass  # Don't fail ABHA linking if timeline event fails
        
        return identity

    async def import_records(self, patient_id: str, hospital_id: uuid.UUID, consent_record_id: Optional[uuid.UUID] = None) -> ImportSession:
        # Verify hospital
        h_res = await self.db.execute(select(Hospital).where(Hospital.id == str(hospital_id)))
        hospital = h_res.scalar_one_or_none()
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
            
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Create Session
        session = ImportSession(
            id=uuid.uuid4(),
            patient_id=patient_id,
            hospital_id=str(hospital_id),
            date=now_iso,
            imported_count=0,
            consent_used_id=consent_record_id
        )
        self.db.add(session)
        await self.db.flush()
        
        # Generate mock records based on hospital
        record_templates = {
            "Apollo Hospitals": [
                {"type": "Prescription", "payload": {"drug": "Metformin 500mg", "dosage": "Twice daily", "duration": "3 months"}},
                {"type": "LabReport", "payload": {"test": "HbA1c", "result": "6.8%", "reference": "< 7%", "status": "Normal"}},
                {"type": "Consultation", "payload": {"diagnosis": "Type 2 Diabetes - Controlled", "doctor": "Dr. Sharma", "notes": "Patient responding well to medication"}},
                {"type": "LabReport", "payload": {"test": "Lipid Panel", "result": "LDL: 98 mg/dL", "reference": "< 100 mg/dL", "status": "Normal"}},
                {"type": "ECG", "payload": {"rhythm": "Normal Sinus Rhythm", "rate": "72 bpm", "interpretation": "Normal ECG"}},
            ],
            "Care Hospitals": [
                {"type": "Consultation", "payload": {"diagnosis": "Hypertension - Stage 1", "doctor": "Dr. Reddy", "notes": "Lifestyle modifications advised"}},
                {"type": "Prescription", "payload": {"drug": "Amlodipine 5mg", "dosage": "Once daily", "duration": "6 months"}},
                {"type": "LabReport", "payload": {"test": "Serum Creatinine", "result": "0.9 mg/dL", "reference": "0.7-1.3 mg/dL", "status": "Normal"}},
            ],
            "Yashoda Hospitals": [
                {"type": "Consultation", "payload": {"diagnosis": "Respiratory Infection", "doctor": "Dr. Patel", "notes": "Antibiotic course prescribed"}},
                {"type": "Prescription", "payload": {"drug": "Amoxicillin 500mg", "dosage": "Thrice daily", "duration": "7 days"}},
                {"type": "LabReport", "payload": {"test": "CBC", "result": "WBC: 9800 cells/uL", "reference": "4000-11000", "status": "Normal"}},
            ],
        }
        
        # Get templates for this hospital or use generic
        templates = record_templates.get(hospital.name, [
            {"type": "Consultation", "payload": {"diagnosis": "General Checkup", "doctor": "Dr. Smith", "notes": "Routine examination"}},
            {"type": "LabReport", "payload": {"test": "Blood Glucose", "result": "95 mg/dL", "reference": "70-110 mg/dL", "status": "Normal"}},
            {"type": "Prescription", "payload": {"drug": "Vitamin D3 1000IU", "dosage": "Once daily", "duration": "3 months"}},
        ])
        
        imported_records = []
        for t in templates:
            rec = ImportedHealthRecord(
                id=uuid.uuid4(),
                patient_id=patient_id,
                hospital_id=str(hospital_id),
                import_session_id=session.id,
                record_type=t["type"],
                event_date=now_iso,
                payload={**t["payload"], "hospital": hospital.name}
            )
            self.db.add(rec)
            imported_records.append(rec)
            
        session.imported_count = len(imported_records)
        await self.db.flush()
        
        # Convert to Timeline Events
        await self.timeline_converter.process_batch(imported_records, hospital.name)
        
        # Generate AI Summary
        record_types_str = ", ".join(set(t["type"] for t in templates))
        summary_text = (
            f"Imported {len(templates)} health records from {hospital.name}. "
            f"Records include: {record_types_str}. "
            f"All values within normal ranges. No urgent medical attention required."
        )
        insights = [
            f"✓ {len(templates)} records imported from {hospital.name}",
            f"✓ Record types: {record_types_str}",
            "✓ All lab values within reference ranges",
            "✓ No drug interactions detected with current medications"
        ]
        
        ai_event_create = TimelineEventFactory.create_ai_summary(
            patient_id=uuid.UUID(patient_id),
            import_session_id=session.id,
            summary_text=summary_text,
            insights=insights
        )
        ai_event = await self.timeline_service.create_event(ai_event_create)
        
        session.ai_summary_event_id = ai_event.id
        await self.db.commit()
        await self.db.refresh(session)
        
        return session
