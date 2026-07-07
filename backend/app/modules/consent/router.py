import uuid
import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import ConsentRecord
from app.modules.timeline.factory import TimelineEventFactory
from app.modules.timeline.service import TimelineService

router = APIRouter()

class ConsentRequest(BaseModel):
    patient_id: str
    hospital_id: str

class ConsentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    hospital_id: uuid.UUID
    status: str
    granted_at: Optional[str] = None
    expires_at: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.post("/request", response_model=ConsentResponse)
async def request_consent(req: ConsentRequest, db: AsyncSession = Depends(get_db)):
    """Grant consent for a hospital to share patient records. Idempotent — returns existing if already granted."""
    existing = await db.execute(
        select(ConsentRecord).where(
            ConsentRecord.patient_id == req.patient_id,
            ConsentRecord.hospital_id == req.hospital_id
        )
    )
    existing_record = existing.scalar_one_or_none()
    if existing_record:
        # Re-activate if not already active
        if existing_record.status != "ACTIVE":
            existing_record.status = "ACTIVE"
            existing_record.granted_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            await db.commit()
            await db.refresh(existing_record)
        return existing_record

    record = ConsentRecord(
        id=uuid.uuid4(),
        patient_id=req.patient_id,
        hospital_id=req.hospital_id,
        status="ACTIVE",
        granted_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    
    # Emit Timeline Event
    ts = TimelineService(db)
    ev = TimelineEventFactory.create_consent_status_changed(
        patient_id=uuid.UUID(str(record.patient_id)),
        hospital_id=uuid.UUID(str(record.hospital_id)),
        status="ACTIVE",
        consent_record_id=record.id
    )
    await ts.create_event(ev)
    
    return record


@router.get("/patient/{patient_id}", response_model=List[ConsentResponse])
async def get_patient_consents(patient_id: str, db: AsyncSession = Depends(get_db)):
    query = select(ConsentRecord).where(ConsentRecord.patient_id == patient_id)
    result = await db.execute(query)
    records = result.scalars().all()
    return records


@router.post("/{consent_id}/revoke", response_model=ConsentResponse)
async def revoke_consent(consent_id: str, db: AsyncSession = Depends(get_db)):
    query = select(ConsentRecord).where(ConsentRecord.id == consent_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Consent record not found")
        
    record.status = "REVOKED"
    await db.commit()
    await db.refresh(record)
    
    ts = TimelineService(db)
    ev = TimelineEventFactory.create_consent_status_changed(
        patient_id=uuid.UUID(str(record.patient_id)),
        hospital_id=uuid.UUID(str(record.hospital_id)),
        status="REVOKED",
        consent_record_id=record.id
    )
    await ts.create_event(ev)
    
    return record
