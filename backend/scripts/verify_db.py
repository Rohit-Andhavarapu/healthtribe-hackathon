import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.infrastructure.database.session import engine

async def verify():
    async with engine.begin() as conn:
        print("--- DATABASE VERIFICATION REPORT ---")
        
        # 1. Verify tables exist
        tables = ["users", "patient_profiles", "hospitals", "doctors", "appointments", "benefits", "family_members", "lab_reports", "timeline_events"]
        
        for table in tables:
            result = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"Table '{table}' exists. Row count: {count}")
            
        # 2. Verify doctor records include image URLs
        print("\n--- DOCTOR RECORDS ---")
        docs = await conn.execute(text("SELECT d.specialty, d.image_url, u.role FROM doctors d JOIN users u ON d.user_id = u.id"))
        for doc in docs.fetchall():
            print(f"Specialty: {doc.specialty} | Image URL: {doc.image_url} | User Role: {doc.role}")

        # 3. Verify Patient Relationships
        print("\n--- PATIENT RELATIONSHIPS (DEMO_UNCLAIMED) ---")
        pat = await conn.execute(text("SELECT id FROM users WHERE clerk_user_id = 'DEMO_UNCLAIMED' LIMIT 1"))
        pat_id = pat.scalar()
        
        if pat_id:
            fam = await conn.execute(text(f"SELECT COUNT(*) FROM family_members WHERE patient_id = '{pat_id}'"))
            labs = await conn.execute(text(f"SELECT COUNT(*) FROM lab_reports WHERE patient_id = '{pat_id}'"))
            apps = await conn.execute(text(f"SELECT COUNT(*) FROM appointments WHERE patient_id = '{pat_id}'"))
            bens = await conn.execute(text(f"SELECT COUNT(*) FROM benefits WHERE patient_id = '{pat_id}'"))
            time = await conn.execute(text(f"SELECT COUNT(*) FROM timeline_events WHERE patient_id = '{pat_id}'"))
            prof = await conn.execute(text(f"SELECT COUNT(*) FROM patient_profiles WHERE user_id = '{pat_id}'"))
            
            print(f"Patient Profiles: {prof.scalar()}")
            print(f"Family Members: {fam.scalar()}")
            print(f"Lab Reports: {labs.scalar()}")
            print(f"Appointments: {apps.scalar()}")
            print(f"Benefits: {bens.scalar()}")
            print(f"Timeline Events: {time.scalar()}")
        else:
            print("DEMO_UNCLAIMED patient not found!")

if __name__ == "__main__":
    asyncio.run(verify())
