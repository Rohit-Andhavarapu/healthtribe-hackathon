import uuid
from pydantic import BaseModel
from app.infrastructure.database.models import RoleEnum
from uuid import UUID

class UserCreate(BaseModel):
    clerk_user_id: str
    role: RoleEnum

class UserResponse(BaseModel):
    id: UUID
    clerk_user_id: str
    role: RoleEnum

    class Config:
        from_attributes = True
