import asyncio
import os
import sys
import random
from datetime import datetime, timedelta, timezone

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.infrastructure.database.session import engine
from app.infrastructure.database.models import (
    User, RoleEnum, PatientProfile, Hospital, Doctor, 
    Appointment, Benefit, FamilyMember, LabReport,
    Consultation, Medication, MedicationOrder, OrderStatus, LabOrder
)
from app.modules.timeline.models import TimelineEvent
from faker import Faker

fake = Faker('en_IN')

async def truncate_tables(session):
    print("Truncating tables...")
    await session.execute(text("TRUNCATE TABLE medication_orders, consultations, lab_orders, medications, timeline_attachments, timeline_events, lab_reports, family_members, benefits, appointments, patient_profiles, doctors, hospitals, users RESTART IDENTITY CASCADE;"))
    await session.commit()

async def seed():
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        await truncate_tables(session)
        
        print("Seeding Hospitals (5+)...")
        hospitals_data = [
            ("Apollo Hospitals", "Jubilee Hills, Hyderabad"),
            ("Care Hospitals", "Banjara Hills, Hyderabad"),
            ("KIMS Hospitals", "Secunderabad, Hyderabad"),
            ("Yashoda Hospitals", "Somajiguda, Hyderabad"),
            ("Max Cure Hospitals", "Madhapur, Hyderabad"),
            ("Rainbow Children's Hospital", "Banjara Hills, Hyderabad")
        ]
        hospitals = [Hospital(name=name, location=loc) for name, loc in hospitals_data]
        session.add_all(hospitals)
        await session.flush()

        print("Seeding Doctors (12+)...")
        doctor_users = [User(clerk_user_id=f"DOCTOR_{i}", role=RoleEnum.DOCTOR) for i in range(1, 15)]
        session.add_all(doctor_users)
        await session.flush()
        
        specialties = ["Cardiologist", "General Physician", "Dermatologist", "Neurologist", "Pediatrician", "Orthopedic", "Psychiatrist", "Dentist", "ENT Specialist", "Oncologist"]
        images = [
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=256&auto=format&fit=crop"
        ]
        doctors = []
        for i, doc_user in enumerate(doctor_users):
            doc = Doctor(
                user_id=doc_user.id, 
                hospital_id=random.choice(hospitals).id,
                name=f"Dr. {fake.first_name()} {fake.last_name()}", 
                specialty=random.choice(specialties), 
                license_ref=f"TSMC-{fake.random_int(1000, 9999)}",
                image_url=random.choice(images),
                rating=round(random.uniform(4.0, 5.0), 1), 
                experience=f"{random.randint(5, 25)}+ Years", 
                languages="English, Telugu, Hindi",
                consultation_fee=f"₹{random.choice([800, 1000, 1200, 1500, 2000])}", 
                availability="Mon, Wed, Fri"
            )
            doctors.append(doc)
        session.add_all(doctors)
        await session.flush()

        print("Seeding Patients (20+)...")
        # Ensure the hardcoded DEMO_UNCLAIMED exists
        patient_users = [User(clerk_user_id="DEMO_UNCLAIMED", role=RoleEnum.PATIENT)]
        patient_users.extend([User(clerk_user_id=f"PATIENT_{i}", role=RoleEnum.PATIENT) for i in range(1, 25)])
        session.add_all(patient_users)
        await session.flush()
        
        profiles = []
        for p_user in patient_users:
            if p_user.clerk_user_id == "DEMO_UNCLAIMED":
                name = "Ravi Kumar"
            else:
                name = fake.name()
                
            profile = PatientProfile(
                user_id=p_user.id,
                demographics={"name": name, "blood_group": random.choice(["O+", "A+", "B+", "AB+", "O-"]), "age": random.randint(18, 70), "status": "Healthy"},
                allergies=random.choices(["Penicillin", "Peanuts", "Dust", "Pollen"], k=random.randint(0, 2)),
                chronic_conditions=random.choices(["Type 2 Diabetes", "Hypertension", "Asthma"], k=random.randint(0, 1))
            )
            profiles.append(profile)
        session.add_all(profiles)
        await session.flush()

        print("Seeding Appointments (50+)...")
        now = datetime.now(timezone.utc)
        appointments = []
        for _ in range(60):
            patient = random.choice(patient_users)
            doctor = random.choice(doctors)
            # -60 to +30 days
            days_offset = random.randint(-60, 30)
            apt_date = now + timedelta(days=days_offset)
            if days_offset < 0:
                status = "Completed"
            elif days_offset == 0:
                status = random.choice(["Completed", "Upcoming"])
            else:
                status = "Upcoming"
                
            apt = Appointment(
                patient_id=patient.id, doctor_id=doctor.id,
                date=apt_date.isoformat(),
                status=status, type=random.choice(["In-Person", "Video"])
            )
            appointments.append(apt)
        session.add_all(appointments)
        await session.flush()

        print("Seeding Timeline Events (200+)...")
        timeline_events = []
        # Generate some events per patient
        for patient in patient_users:
            for _ in range(random.randint(5, 15)):
                event_type = random.choice(["CONSULTATION", "PRESCRIPTION", "LAB_RESULT", "VACCINATION", "IMAGING"])
                days_ago = random.randint(1, 365)
                doc = random.choice(doctors)
                
                if event_type == "CONSULTATION":
                    payload = {
                        "title": f"{doc.specialty} Consultation",
                        "notes": fake.text(max_nb_chars=100),
                        "doctor_name": doc.name, 
                        "hospital_name": "Apollo Hospitals"
                    }
                elif event_type == "PRESCRIPTION":
                    payload = {
                        "title": "Medication Prescribed",
                        "medications": [f"{fake.word()} {random.randint(100, 500)}mg"],
                        "doctor_name": doc.name
                    }
                elif event_type == "LAB_RESULT":
                    payload = {
                        "title": "Blood Test Result",
                        "lab_name": "Apollo Diagnostics",
                        "result": "Normal"
                    }
                else:
                    payload = {"title": "General Event"}
                    
                te = TimelineEvent(
                    patient_id=patient.id, doctor_id=doc.id,
                    occurred_at=now - timedelta(days=days_ago), type=event_type, status="completed",
                    source=random.choice(["App", "Manual", "Lab"]), tags=[],
                    structured_payload=payload
                )
                timeline_events.append(te)
        session.add_all(timeline_events)
        
        print("Seeding Benefits...")
        benefits = [
            Benefit(
                patient_id=patient_users[0].id, type="Insurance", provider="Star Health Premium",
                policy_number="SHP-2983-00", status="Active",
                details={"coverage": 500000, "utilized": 45200, "plan": "Family Floater Plan", "renewal_date": "2025-03-31"}
            )
        ]
        session.add_all(benefits)

        print("Seeding Family Members...")
        family_members = [
            FamilyMember(
                patient_id=patient_users[0].id, name="Rajesh Sharma", relation_type="Father",
                age=58, access_level="Full Access"
            ),
            FamilyMember(
                patient_id=patient_users[0].id, name="Sunita Sharma", relation_type="Mother",
                age=54, access_level="Full Access"
            ),
        ]
        session.add_all(family_members)
        
        print("Seeding Lab Reports...")
        lab_reports = []
        for patient in patient_users:
            for _ in range(random.randint(0, 3)):
                lr = LabReport(
                    patient_id=patient.id, title=random.choice(["Complete Blood Count (CBC)", "HbA1c", "Lipid Profile", "Thyroid Function Test"]),
                    date=(now - timedelta(days=random.randint(1, 100))).isoformat(),
                    status=random.choice(["Final", "Pending"]),
                    results={"param1": "Normal", "param2": "Slightly elevated"} if random.random() > 0.5 else None
                )
                lab_reports.append(lr)
        session.add_all(lab_reports)
        await session.flush()
        
        print("Seeding Consultations, Medications & LabOrders...")
        consultations = []
        medications = []
        lab_orders = []
        orders = []
        
        completed_apts = [a for a in appointments if a.status == "Completed"]
        for apt in completed_apts:
            if random.random() > 0.3:
                c = Consultation(
                    appointment_id=apt.id,
                    patient_id=apt.patient_id,
                    doctor_id=apt.doctor_id,
                    vitals={"bp": f"{random.randint(110, 130)}/{random.randint(70, 85)}"},
                    diagnosis=fake.word(),
                    notes=fake.sentence()
                )
                consultations.append(c)
        session.add_all(consultations)
        await session.flush()
        
        for c in consultations:
            if random.random() > 0.5:
                m = Medication(
                    patient_id=c.patient_id, doctor_id=c.doctor_id,
                    appointment_id=c.appointment_id, name=f"{fake.word().capitalize()} {random.choice([100, 250, 500])}mg",
                    dosage=f"{random.choice([100, 250, 500])}mg", frequency="Daily", duration="7 days",
                    status="ACTIVE"
                )
                medications.append(m)
        session.add_all(medications)
        await session.flush()

        for m in medications:
            mo = MedicationOrder(
                patient_id=m.patient_id, doctor_id=m.doctor_id,
                appointment_id=m.appointment_id, consultation_id=None,
                status=OrderStatus.PLACED, medication_ids=[str(m.id)]
            )
            orders.append(mo)
        session.add_all(orders)
        
        await session.commit()
        print(f"Database seeded successfully! Created: {len(hospitals)} hospitals, {len(doctors)} doctors, {len(patient_users)} patients, {len(appointments)} appointments, {len(timeline_events)} timeline events, {len(lab_reports)} lab reports.")

if __name__ == "__main__":
    asyncio.run(seed())
