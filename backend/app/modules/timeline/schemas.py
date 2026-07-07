from uuid import UUID
import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class TimelineAttachmentSchema(BaseModel):
    id: uuid.UUID
    file_name: str
    mime_type: str
    url: str
    file_size: int
    uploaded_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TimelineEventBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID] = None
    occurred_at: datetime
    type: str
    status: str
    source: str
    confidence: Optional[float] = None
    tags: List[str] = Field(default_factory=list)
    structured_payload: Dict[str, Any]
    metadata_col: Optional[Dict[str, Any]] = None
    supersedes_event_id: Optional[uuid.UUID] = None

class TimelineEventCreate(TimelineEventBase):
    pass

class TimelineEventResponse(TimelineEventBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    attachments: List[TimelineAttachmentSchema] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
