from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any

class LabReportBase(BaseModel):
    title: str
    date: str
    status: str
    results: Optional[Dict[str, Any]] = None

class LabReportCreate(LabReportBase):
    patient_id: UUID

class LabReportUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = None
    results: Optional[Dict[str, Any]] = None

class LabReportResponse(LabReportBase):
    id: UUID
    patient_id: UUID
    model_config = ConfigDict(from_attributes=True)
