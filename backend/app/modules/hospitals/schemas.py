from uuid import UUID
from pydantic import BaseModel, ConfigDict

class HospitalBase(BaseModel):
    name: str
    location: str

class HospitalResponse(HospitalBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
