import os

modules = ["appointments", "doctors", "benefits", "family", "labs", "profile", "hospitals"]

base_dir = os.path.join(os.path.dirname(__file__), "..", "app", "modules")

schemas_template = """from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any

class {Name}Base(BaseModel):
    pass

class {Name}Response({Name}Base):
    id: str
    
    model_config = ConfigDict(from_attributes=True)
"""

router_template = """from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import {Model}, User
from app.core.security import get_current_user
from app.modules.{module}.schemas import {Name}Response

router = APIRouter()

@router.get("/", response_model=List[{Name}Response])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Depending on the module, we might want to filter by user.id
    # For hospitals/doctors, maybe return all.
    query = select({Model})
    
    # Simple logic for scoping
    if "{Model}" not in ["Hospital", "Doctor"]:
        query = query.where({Model}.patient_id == user.id)
        
    result = await db.execute(query)
    return result.scalars().all()
"""

model_mapping = {
    "appointments": "Appointment",
    "doctors": "Doctor",
    "benefits": "Benefit",
    "family": "FamilyMember",
    "labs": "LabReport",
    "profile": "PatientProfile",
    "hospitals": "Hospital"
}

for mod in modules:
    mod_path = os.path.join(base_dir, mod)
    os.makedirs(mod_path, exist_ok=True)
    
    with open(os.path.join(mod_path, "__init__.py"), "w") as f:
        pass
        
    model_name = model_mapping[mod]
    
    with open(os.path.join(mod_path, "schemas.py"), "w") as f:
        f.write(schemas_template.format(Name=model_name))
        
    with open(os.path.join(mod_path, "router.py"), "w") as f:
        f.write(router_template.format(module=mod, Name=model_name, Model=model_name))

print("Scaffolding completed.")
