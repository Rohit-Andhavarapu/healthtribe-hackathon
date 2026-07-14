from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.models import User
from app.modules.auth.schemas import UserCreate
from fastapi import HTTPException, status

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_clerk_id(self, clerk_user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
        return result.scalars().first()
        
    async def get_demo_user(self) -> User | None:
        result = await self.db.execute(select(User).where(User.clerk_user_id == "DEMO_UNCLAIMED"))
        return result.scalars().first()

    async def get_or_create_user(self, clerk_user_id: str, role: str = "PATIENT") -> User:
        # First, try to get the existing user
        existing_user = await self.get_user_by_clerk_id(clerk_user_id)
        if existing_user:
            return existing_user
            
        # Try to claim the seeded demo user
        demo_user = await self.get_demo_user()
        if demo_user:
            from app.infrastructure.database.models import RoleEnum
            
            demo_user.clerk_user_id = clerk_user_id
            demo_user.role = RoleEnum(role) if isinstance(role, str) else role  # Update role from JWT
            await self.db.commit()
            await self.db.refresh(demo_user)
            return demo_user
            
        # Fallback: create a new user (and profile)
        from app.infrastructure.database.models import RoleEnum
        
        db_user = User(
            clerk_user_id=clerk_user_id,
            role=RoleEnum(role) if isinstance(role, str) else role
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        
        # We'd ideally create a PatientProfile here too, but for this sprint demo_user is expected to exist.
        return db_user

    async def create_user(self, user_in: UserCreate) -> User:
        existing_user = await self.get_user_by_clerk_id(user_in.clerk_user_id)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
        
        db_user = User(
            clerk_user_id=user_in.clerk_user_id,
            role=user_in.role
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
