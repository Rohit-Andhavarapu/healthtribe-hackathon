from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class AppointmentBase(BaseModel):
    date: str
    time: Optional[str] = None
    status: str
    type: str
    notes: Optional[str] = None
    doctor_id: UUID
    patient_id: UUID
    patient_name: Optional[str] = None
    meet_link: Optional[str] = None

class AppointmentCreate(BaseModel):
    doctor_id: UUID
    date: str
    time: str = "10:00 AM"
    type: str = "In-Person"
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class LabOrderCreate(BaseModel):
    test_name: str
    priority: str = "ROUTINE"
    notes: Optional[str] = None

class ConsultationCompletion(BaseModel):
    notes: Optional[str] = None
    medications: Optional[List[MedicationCreate]] = None
    lab_orders: Optional[List[LabOrderCreate]] = None
