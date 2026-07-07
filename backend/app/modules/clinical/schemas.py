from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from typing import Optional

class MedicationResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None
    status: str
    
    model_config = ConfigDict(from_attributes=True)

class LabOrderResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    test_name: str
    priority: str
    notes: Optional[str] = None
    status: str
    
    model_config = ConfigDict(from_attributes=True)

class MedicationOrderResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    appointment_id: Optional[UUID] = None
    consultation_id: Optional[UUID] = None
    status: str
    medication_ids: List[str]
    
    model_config = ConfigDict(from_attributes=True)

class CreateMedicationOrderRequest(BaseModel):
    medication_ids: List[str]
    appointment_id: Optional[str] = None
    consultation_id: Optional[str] = None
