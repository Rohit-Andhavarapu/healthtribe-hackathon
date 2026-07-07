from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db
from app.modules.auth.schemas import UserCreate, UserResponse
from app.modules.auth.service import AuthService
from app.core.settings import get_settings

router = APIRouter()
settings = get_settings()

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)

@router.post("/webhook", response_model=UserResponse)
async def clerk_webhook(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    payload = await request.json()
    
    if payload.get("type") == "user.created":
        data = payload.get("data", {})
        clerk_user_id = data.get("id")
        role = data.get("public_metadata", {}).get("role", "PATIENT")
        
        user_in = UserCreate(clerk_user_id=clerk_user_id, role=role)
        return await auth_service.create_user(user_in)
    
    return {"message": "Webhook received"}

from app.core.security import get_current_user as get_current_user_dependency
from app.infrastructure.database.models import User, RoleEnum
from pydantic import BaseModel

class RoleSwitchRequest(BaseModel):
    role: str

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user: User = Depends(get_current_user_dependency)
):
    return user

@router.post("/switch-role", response_model=UserResponse)
async def switch_role(
    request: RoleSwitchRequest,
    user: User = Depends(get_current_user_dependency),
    db: AsyncSession = Depends(get_db)
):
    """DEV ONLY endpoint to switch roles for testing."""
    if request.role.upper() == "DOCTOR":
        user.role = RoleEnum.DOCTOR
    else:
        user.role = RoleEnum.PATIENT
        
    await db.commit()
    await db.refresh(user)
    
    # In a real app we'd need to provision the Doctor profile or Patient profile if they don't exist,
    # but the seed script provides enough for demo purposes. If they switch to Doctor they won't have a specific `Doctor` row mapped to their user ID unless they are DOCTOR_1.
    # To fix this, if they become DOCTOR, let's map them to the first doctor in DB if they don't have one.
    from sqlalchemy.future import select
    from app.infrastructure.database.models import Doctor
    
    if user.role == RoleEnum.DOCTOR:
        existing_doc = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        if not existing_doc.scalar_one_or_none():
            # Claim the first seeded doctor
            first_doc_query = await db.execute(select(Doctor))
            first_doc = first_doc_query.scalars().first()
            if first_doc:
                # Steal the doctor profile
                first_doc.user_id = user.id
                await db.commit()

    return user
