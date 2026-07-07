from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any

class BenefitBase(BaseModel):
    type: str
    provider: str
    policy_number: str
    status: str
    details: Optional[Dict[str, Any]] = None

class BenefitResponse(BenefitBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
