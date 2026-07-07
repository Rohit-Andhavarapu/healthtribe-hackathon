import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.infrastructure.database.models import Appointment, Doctor
from app.core.settings import get_settings
from app.modules.appointments.service import AppointmentService
from app.modules.appointments.schemas import MedicationCreate, LabOrderCreate

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with AsyncSessionLocal() as session:
        query = select(Appointment).where(Appointment.status != "COMPLETED")
        result = await session.execute(query)
        appt = result.scalars().first()
        
        if not appt:
            print("No incomplete appointments found!")
            return
            
        print(f"Completing appointment {appt.id}")
        
        service = AppointmentService(session)
        meds = [MedicationCreate(name="Test Med", dosage="10mg", frequency="1x day", duration="7 days", instructions="take with water")]
        labs = [LabOrderCreate(test_name="Test Lab", priority="ROUTINE", notes="")]
        
        try:
            res = await service.complete_consultation(
                appointment_id=str(appt.id),
                notes="Completed via script",
                medications=meds,
                lab_orders=labs
            )
            print("Successfully completed!")
        except Exception as e:
            print("Failed:", str(e))
            import traceback
            traceback.print_exc()

asyncio.run(test())
