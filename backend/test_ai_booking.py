import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.infrastructure.database.models import User, Doctor, RoleEnum
from app.core.settings import get_settings
from app.modules.ai.tools import AIToolServices
import uuid
import datetime

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with AsyncSessionLocal() as session:
        query = select(User).where(User.role == "PATIENT")
        result = await session.execute(query)
        patient = result.scalars().first()
        
        query = select(Doctor)
        result = await session.execute(query)
        doctor = result.scalars().first()
        
        if not patient or not doctor:
            print("Missing data")
            return
            
        print(f"Booking with doctor {doctor.name} ({doctor.id}) for patient {patient.id}")
        
        services = AIToolServices(session, patient)
        try:
            # Fake availability date
            next_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
            # Let's bypass availability check for test or just see if the tool crashes
            res = await services.book_appointment(
                doctor_name_or_id=str(doctor.id),
                date=next_date,
                time="10:00 AM"
            )
            print("Tool Response:", res)
        except Exception as e:
            print("Failed:", str(e))
            import traceback
            traceback.print_exc()

asyncio.run(test())
