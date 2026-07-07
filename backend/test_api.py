from fastapi.testclient import TestClient
from app.main import app
import uuid
import json
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.infrastructure.database.models import User, RoleEnum
from app.core.security import get_current_user
from app.core.settings import get_settings

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def test_order():
    async with AsyncSessionLocal() as session:
        # Find a patient
        query = select(User).where(User.role == "PATIENT")
        result = await session.execute(query)
        patient = result.scalars().first()
        
        if not patient:
            print("No patient found!")
            return
            
        print(f"Using patient {patient.id}")
        
        # Override dependency
        app.dependency_overrides[get_current_user] = lambda: patient
        
        client = TestClient(app)
        response = client.post(f"/api/v1/clinical/patients/{patient.id}/medication-orders", json={
            "medication_ids": ["med-123"]
        })
        print("STATUS:", response.status_code)
        print("BODY:", response.text)

asyncio.run(test_order())
