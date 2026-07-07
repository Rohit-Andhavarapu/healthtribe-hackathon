from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import Benefit, User
from app.core.security import get_current_user
from app.modules.benefits.schemas import BenefitResponse

router = APIRouter()

@router.get("/", response_model=List[BenefitResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Depending on the module, we might want to filter by user.id
    # For hospitals/doctors, maybe return all.
    query = select(Benefit)
    
    # Simple logic for scoping
    if "Benefit" not in ["Hospital", "Doctor"]:
        query = query.where(Benefit.patient_id == user.id)
        
    result = await db.execute(query)
    return result.scalars().all()
