import os

schemas = {
    "appointments": """from pydantic import BaseModel, ConfigDict
from typing import Optional

class AppointmentBase(BaseModel):
    date: str
    status: str
    type: str
    doctor_id: str
    patient_id: str

class AppointmentResponse(AppointmentBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "doctors": """from pydantic import BaseModel, ConfigDict

class DoctorBase(BaseModel):
    specialty: str
    hospital_id: str
    license_ref: str

class DoctorResponse(DoctorBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "hospitals": """from pydantic import BaseModel, ConfigDict

class HospitalBase(BaseModel):
    name: str
    location: str

class HospitalResponse(HospitalBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "benefits": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any

class BenefitBase(BaseModel):
    type: str
    provider: str
    policy_number: str
    status: str
    details: Optional[Dict[str, Any]] = None

class BenefitResponse(BenefitBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "family": """from pydantic import BaseModel, ConfigDict

class FamilyMemberBase(BaseModel):
    name: str
    relation_type: str
    age: int
    access_level: str

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "labs": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any

class LabReportBase(BaseModel):
    title: str
    date: str
    status: str
    results: Optional[Dict[str, Any]] = None

class LabReportResponse(LabReportBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
""",
    "profile": """from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List

class PatientProfileBase(BaseModel):
    demographics: Optional[Dict[str, Any]] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []

class PatientProfileResponse(PatientProfileBase):
    id: str
    user_id: str
    model_config = ConfigDict(from_attributes=True)
"""
}

base_dir = os.path.join(os.path.dirname(__file__), "..", "app", "modules")

for mod, content in schemas.items():
    with open(os.path.join(base_dir, mod, "schemas.py"), "w") as f:
        f.write(content)

print("Schemas updated.")
