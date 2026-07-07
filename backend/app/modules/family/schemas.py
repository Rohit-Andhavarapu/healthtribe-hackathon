from uuid import UUID
from pydantic import BaseModel, ConfigDict

class FamilyMemberBase(BaseModel):
    name: str
    relation_type: str
    age: int
    access_level: str

class FamilyMemberResponse(FamilyMemberBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: str | None = None
    relation_type: str | None = None
    age: int | None = None
    access_level: str | None = None
