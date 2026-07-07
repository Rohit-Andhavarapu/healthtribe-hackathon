import uuid
from typing import List, Optional, Any
from pydantic import BaseModel

class ABHAIdentityBase(BaseModel):
    abha_number: str
    abha_address: str

class ABHALinkRequest(ABHAIdentityBase):
    pass

class ABHAIdentityResponse(ABHAIdentityBase):
    id: uuid.UUID
    patient_id: uuid.UUID
    verification_status: str
    verification_method: Optional[str] = None
    linked_at: Optional[str] = None
    is_primary: bool

    class Config:
        from_attributes = True

class ImportRecordsRequest(BaseModel):
    hospital_id: uuid.UUID
    consent_record_id: Optional[uuid.UUID] = None

class ImportSessionResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    date: str
    imported_count: int
    
    class Config:
        from_attributes = True
