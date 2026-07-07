from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.infrastructure.database.models import Appointment

class DoctorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_doctor_availability(self, doctor_id: str, days: int = 7) -> List[Dict[str, Any]]:
        # Calculate next `days` days starting from today
        today = date.today()
        base_slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"]
        
        availability = []
        
        for i in range(days):
            current_date = today + timedelta(days=i)
            iso_date = current_date.isoformat()
            
            # Query booked appointments for this doctor on this day
            query = select(Appointment).where(
                Appointment.doctor_id == doctor_id,
                Appointment.date == iso_date,
                Appointment.status != "Cancelled"
            )
            result = await self.db.execute(query)
            booked_appointments = result.scalars().all()
            booked_times = {appt.time for appt in booked_appointments}
            
            # Filter out booked slots
            available_times = [time for time in base_slots if time not in booked_times]
            
            # Formatting
            if i == 0:
                display = "Today"
            elif i == 1:
                display = "Tomorrow"
            else:
                display = current_date.strftime("%a, %b ") + str(current_date.day)
                
            for t in available_times:
                availability.append({
                    "isoDate": iso_date,
                    "display": display,
                    "weekday": current_date.strftime("%A"),
                    "month": current_date.strftime("%B"),
                    "year": current_date.year,
                    "time": t
                })
                
        return availability
