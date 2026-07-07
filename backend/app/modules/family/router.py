from fastapi import APIRouter, Depends, HTTPException
from typing import List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import FamilyMember, User
from app.core.security import get_current_user
from app.modules.family.schemas import FamilyMemberResponse, FamilyMemberCreate, FamilyMemberUpdate

router = APIRouter(tags=["family"])

@router.get("/", response_model=List[FamilyMemberResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(FamilyMember).where(FamilyMember.patient_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=FamilyMemberResponse)
async def create_family_member(
    member: FamilyMemberCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_member = FamilyMember(
        id=uuid.uuid4(),
        patient_id=user.id,
        name=member.name,
        relation_type=member.relation_type,
        age=member.age,
        access_level=member.access_level
    )
    
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member

@router.put("/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: str,
    member: FamilyMemberUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(FamilyMember).where(FamilyMember.id == uuid.UUID(member_id), FamilyMember.patient_id == user.id)
    result = await db.execute(query)
    db_member = result.scalars().first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    if member.name is not None:
        db_member.name = member.name
    if member.relation_type is not None:
        db_member.relation_type = member.relation_type
    if member.age is not None:
        db_member.age = member.age
    if member.access_level is not None:
        db_member.access_level = member.access_level
        
    await db.commit()
    await db.refresh(db_member)
    return db_member

@router.delete("/{member_id}", status_code=204)
async def delete_family_member(
    member_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "PATIENT":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = select(FamilyMember).where(FamilyMember.id == uuid.UUID(member_id), FamilyMember.patient_id == user.id)
    result = await db.execute(query)
    db_member = result.scalars().first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    await db.delete(db_member)
    await db.commit()
    return None
