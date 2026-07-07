import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.infrastructure.database.models import User, MedicationOrder, OrderStatus, Doctor, PatientProfile
import uuid

async def main():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@localhost:5432/healthtribe")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get a patient
        result = await session.execute(select(User).where(User.role == "PATIENT"))
        patient = result.scalars().first()
        
        # Test creating medication order
        order = MedicationOrder(
            patient_id=patient.id,
            status=OrderStatus.PLACED,
            medication_ids=["Test-med-1"]
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)
        print("Order created:", order.id, order.status)

asyncio.run(main())
