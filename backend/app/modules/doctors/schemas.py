from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional

class DoctorBase(BaseModel):
    name: str
    specialty: str
    hospital_id: UUID
    license_ref: str
    image_url: Optional[str] = None
    rating: float = 0.0
    experience: Optional[str] = None
    languages: Optional[str] = None
    consultation_fee: Optional[str] = None
    availability: Optional[str] = None

class DoctorResponse(DoctorBase):
    id: UUID
    hospital_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DoctorAvailabilityResponse(BaseModel):
    isoDate: str
    display: str
    weekday: str
    month: str
    year: int
    time: str
