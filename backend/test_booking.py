import asyncio
from app.infrastructure.database.session import AsyncSessionLocal
from app.modules.appointments.service import AppointmentService
from app.infrastructure.database.models import Doctor, User
from sqlalchemy.future import select

async def test():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.role == 'PATIENT'))
        patient = res.scalars().first()
        res = await db.execute(select(Doctor))
        doctor = res.scalars().first()
        service = AppointmentService(db)
        appt = await service.create_appointment(
            patient_id=str(patient.id), 
            doctor_id=doctor.id, 
            date='2026-06-01', 
            time='02:00 PM', 
            notes='Knee pain'
        )
        await db.commit()
        print(f'Created Appt ID: {appt.id} Date: {appt.date} Time: {appt.time} Notes: {appt.notes}')

asyncio.run(test())
