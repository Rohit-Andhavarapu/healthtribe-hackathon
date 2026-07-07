"""
Sprint 5 Phase 1 - Enhanced Seed Script
Creates realistic demo data with ABHA-linked patients and synchronized appointments
"""
import asyncio
import os
import sys
import random
import uuid
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.infrastructure.database.session import engine
from app.infrastructure.database.models import (
    User, RoleEnum, PatientProfile, Hospital, Doctor, 
    Appointment, Benefit, FamilyMember, LabReport,
    Consultation, Medication, MedicationOrder, OrderStatus, LabOrder,
    ABHAIdentity, ImportSession, ImportedHealthRecord, ConsentRecord
)
from app.modules.timeline.models import TimelineEvent
from app.modules.timeline.factory import TimelineEventFactory
from faker import Faker

fake = Faker('en_IN')

async def truncate_tables(session):
    print("Truncating tables...")
    await session.execute(text("""
        TRUNCATE TABLE 
            medication_orders, consultations, lab_orders, medications, 
            timeline_attachments, timeline_events, lab_reports, family_members, 
            benefits, appointments, imported_health_records, import_sessions, 
            consent_records, abha_identities, patient_profiles, doctors, hospitals, users 
        RESTART IDENTITY CASCADE;
    """))
    await session.commit()

async def seed():
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        await truncate_tables(session)
        
        print("Seeding Hospitals...")
        hospitals_data = [
            ("Apollo Hospitals", "Jubilee Hills, Hyderabad"),
            ("Care Hospitals", "Banjara Hills, Hyderabad"),
            ("KIMS Hospitals", "Secunderabad, Hyderabad"),
            ("Yashoda Hospitals", "Somajiguda, Hyderabad"),
            ("MaxCure Hospitals", "Madhapur, Hyderabad"),
            ("Rainbow Children's Hospital", "Banjara Hills, Hyderabad")
        ]
        hospitals = [Hospital(name=name, location=loc) for name, loc in hospitals_data]
        session.add_all(hospitals)
        await session.flush()

        print("Seeding Doctors...")
        doctor_users = [User(clerk_user_id=f"DOCTOR_{i}", role=RoleEnum.DOCTOR) for i in range(1, 13)]
        session.add_all(doctor_users)
        await session.flush()
        
        specialties = ["Cardiologist", "General Physician", "Dermatologist", "Neurologist", "Pediatrician", "Orthopedic"]
        images = [
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=256&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=256&auto=format&fit=crop",
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
                rating=round(random.uniform(4.2, 5.0), 1), 
                experience=f"{random.randint(5, 20)}+ Years", 
                languages="English, Telugu, Hindi",
                consultation_fee=f"₹{random.choice([800, 1000, 1200, 1500])}", 
                availability="Mon, Wed, Fri"
            )
            doctors.append(doc)
        session.add_all(doctors)
        await session.flush()

        print("Seeding Patients with Rich Profiles...")
        
        # Create special demo patients with ABHA
        patient_profiles_data = [
            {
                "clerk_id": "DEMO_RAHUL",
                "name": "Rahul Sharma",
                "age": 34,
                "gender": "Male",
                "blood_group": "O+",
                "has_abha": True,
                "abha_number": "98-7654-3210-1234",
                "abha_address": "rahul.sharma@abdm",
                "hospital_import": "Apollo Hospitals",
                "chronic_conditions": ["Type 2 Diabetes"],
                "allergies": ["Penicillin"]
            },
            {
                "clerk_id": "DEMO_RIYA",
                "name": "Riya Patel",
                "age": 28,
                "gender": "Female",
                "blood_group": "A+",
                "has_abha": False,
                "chronic_conditions": [],
                "allergies": ["Peanuts", "Dust"]
            },
            {
                "clerk_id": "DEMO_SNEHA",
                "name": "Sneha Reddy",
                "age": 45,
                "gender": "Female",
                "blood_group": "B+",
                "has_abha": True,
                "abha_number": "12-3456-7890-5678",
                "abha_address": "sneha.reddy@abdm",
                "hospital_import": "MaxCure Hospitals",
                "chronic_conditions": ["Hypertension", "Asthma"],
                "allergies": []
            },
            {
                "clerk_id": "DEMO_AMIT",
                "name": "Amit Kumar",
                "age": 52,
                "gender": "Male",
                "blood_group": "AB+",
                "has_abha": True,
                "abha_number": "45-6789-0123-9012",
                "abha_address": "amit.kumar@abdm",
                "hospital_import": "Care Hospitals",
                "chronic_conditions": ["High Cholesterol"],
                "allergies": []
            }
        ]
        
        # Add random patients
        for i in range(5, 21):
            has_abha = random.choice([True, False, False])  # 33% chance
            abha_num = f"{fake.random_int(10,99)}-{fake.random_int(1000,9999)}-{fake.random_int(1000,9999)}-{fake.random_int(1000,9999)}" if has_abha else None
            abha_addr = f"{fake.user_name()}@abdm" if has_abha else None
            
            patient_profiles_data.append({
                "clerk_id": f"PATIENT_{i}",
                "name": fake.name(),
                "age": random.randint(18, 70),
                "gender": random.choice(["Male", "Female"]),
                "blood_group": random.choice(["O+", "A+", "B+", "AB+", "O-"]),
                "has_abha": has_abha,
                "abha_number": abha_num,
                "abha_address": abha_addr,
                "hospital_import": random.choice([h.name for h in hospitals]) if has_abha and random.choice([True, False]) else None,
                "chronic_conditions": random.choices(["Type 2 Diabetes", "Hypertension", "Asthma"], k=random.randint(0, 1)),
                "allergies": random.choices(["Penicillin", "Peanuts", "Dust"], k=random.randint(0, 2))
            })
        
        patient_users = []
        profiles = []
        abha_identities = []
        consent_records = []
        import_sessions = []
        imported_records = []
        timeline_events = []
        
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        
        for p_data in patient_profiles_data:
            # Create user
            p_user = User(clerk_user_id=p_data["clerk_id"], role=RoleEnum.PATIENT)
            patient_users.append(p_user)
            session.add(p_user)
            await session.flush()
            
            # Create profile
            profile = PatientProfile(
                user_id=p_user.id,
                demographics={
                    "name": p_data["name"],
                    "blood_group": p_data["blood_group"],
                    "age": p_data["age"],
                    "gender": p_data["gender"],
                    "status": "Healthy"
                },
                allergies=p_data["allergies"],
                chronic_conditions=p_data["chronic_conditions"]
            )
            profiles.append(profile)
            session.add(profile)
            await session.flush()
            
            # Create ABHA identity if applicable
            if p_data["has_abha"] and p_data.get("abha_number"):
                # Ensure abha_address is set
                abha_address = p_data.get("abha_address") or f"patient{p_user.id}@abdm"
                
                abha = ABHAIdentity(
                    id=uuid.uuid4(),
                    patient_id=str(p_user.id),
                    abha_number=p_data["abha_number"],
                    abha_address=abha_address,
                    verification_status="VERIFIED",
                    verification_method="OTP_MOCK",
                    linked_at=now_iso,
                    is_primary=True
                )
                abha_identities.append(abha)
                session.add(abha)
                await session.flush()
                
                # Create ABHA linked timeline event
                abha_event_create = TimelineEventFactory.create_abha_linked(
                    patient_id=p_user.id,
                    abha_number=p_data["abha_number"],
                    abha_address=abha_address,
                    identity_id=abha.id
                )
                abha_event = TimelineEvent(
                    id=uuid.uuid4(),
                    patient_id=p_user.id,
                    occurred_at=abha_event_create.occurred_at,
                    type=abha_event_create.type,
                    status=abha_event_create.status,
                    source=abha_event_create.source,
                    tags=abha_event_create.tags,
                    structured_payload=abha_event_create.structured_payload,
                    metadata_col=abha_event_create.metadata_col
                )
                timeline_events.append(abha_event)
                session.add(abha_event)
                
                # Import records if hospital specified
                if p_data.get("hospital_import"):
                    hospital = next((h for h in hospitals if h.name == p_data["hospital_import"]), None)
                    if hospital:
                        # Create consent
                        consent = ConsentRecord(
                            id=uuid.uuid4(),
                            patient_id=str(p_user.id),
                            hospital_id=str(hospital.id),
                            status="ACTIVE",
                            granted_at=now_iso
                        )
                        consent_records.append(consent)
                        session.add(consent)
                        await session.flush()
                        
                        # Create import session
                        import_session = ImportSession(
                            id=uuid.uuid4(),
                            patient_id=str(p_user.id),
                            hospital_id=str(hospital.id),
                            date=now_iso,
                            imported_count=0,
                            consent_used_id=consent.id
                        )
                        import_sessions.append(import_session)
                        session.add(import_session)
                        await session.flush()
                        
                        # Generate mock imported records
                        record_templates = [
                            {"type": "Prescription", "payload": {"drug": "Metformin 500mg", "dosage": "Twice daily", "duration": "3 months", "hospital": hospital.name}},
                            {"type": "LabReport", "payload": {"test": "HbA1c", "result": "6.5%", "reference": "< 7%", "status": "Normal", "hospital": hospital.name}},
                            {"type": "Consultation", "payload": {"diagnosis": "Routine Checkup", "doctor": "Dr. External", "notes": "All vitals normal", "hospital": hospital.name}},
                        ]
                        
                        for t in record_templates:
                            rec = ImportedHealthRecord(
                                id=uuid.uuid4(),
                                patient_id=str(p_user.id),
                                hospital_id=str(hospital.id),
                                import_session_id=import_session.id,
                                record_type=t["type"],
                                event_date=now_iso,
                                payload=t["payload"]
                            )
                            imported_records.append(rec)
                            session.add(rec)
                            
                            # Create timeline event for imported record
                            imported_event_create = TimelineEventFactory.create_imported_record(
                                patient_id=p_user.id,
                                hospital_id=uuid.UUID(str(hospital.id)),
                                hospital_name=hospital.name,
                                record_type=t["type"],
                                event_date=now_iso,
                                payload=t["payload"],
                                import_session_id=import_session.id,
                                imported_record_id=rec.id
                            )
                            imported_event = TimelineEvent(
                                id=uuid.uuid4(),
                                patient_id=p_user.id,
                                occurred_at=imported_event_create.occurred_at,
                                type=imported_event_create.type,
                                status=imported_event_create.status,
                                source=imported_event_create.source,
                                tags=imported_event_create.tags,
                                structured_payload=imported_event_create.structured_payload,
                                metadata_col=imported_event_create.metadata_col
                            )
                            timeline_events.append(imported_event)
                            session.add(imported_event)
                        
                        import_session.imported_count = len(record_templates)
                        
                        # Generate AI summary
                        ai_event_create = TimelineEventFactory.create_ai_summary(
                            patient_id=p_user.id,
                            import_session_id=import_session.id,
                            summary_text=f"Imported {len(record_templates)} health records from {hospital.name}. All values within normal ranges.",
                            insights=[
                                f"✓ {len(record_templates)} records imported successfully",
                                f"✓ Source: {hospital.name}",
                                "✓ All lab values within reference ranges"
                            ]
                        )
                        ai_event = TimelineEvent(
                            id=uuid.uuid4(),
                            patient_id=p_user.id,
                            occurred_at=ai_event_create.occurred_at,
                            type=ai_event_create.type,
                            status=ai_event_create.status,
                            source=ai_event_create.source,
                            tags=ai_event_create.tags,
                            structured_payload=ai_event_create.structured_payload,
                            metadata_col=ai_event_create.metadata_col
                        )
                        timeline_events.append(ai_event)
                        session.add(ai_event)
                        await session.flush()  # Flush to ensure event exists
                        import_session.ai_summary_event_id = ai_event.id

        await session.flush()

        print("Seeding Appointments (synchronized across patient & doctor portals)...")
        appointments = []
        for patient in patient_users:
            # Give each patient 2-5 appointments
            num_appointments = random.randint(2, 5)
            for _ in range(num_appointments):
                doctor = random.choice(doctors)
                days_offset = random.randint(-60, 30)
                apt_date = now + timedelta(days=days_offset)
                
                if days_offset < -7:
                    status = "COMPLETED"
                elif days_offset < 0:
                    status = random.choice(["COMPLETED", "CANCELLED"])
                elif days_offset == 0:
                    status = "IN_PROGRESS"
                else:
                    status = "Upcoming"
                
                apt = Appointment(
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    date=apt_date.isoformat(),
                    time=f"{random.randint(9, 17)}:00",
                    status=status,
                    type=random.choice(["In-Person", "Video", "In-Person"])
                )
                appointments.append(apt)
                
                # Create timeline event for appointment
                if status in ["Upcoming", "IN_PROGRESS"]:
                    apt_event = TimelineEvent(
                        id=uuid.uuid4(),
                        patient_id=patient.id,
                        doctor_id=doctor.id,
                        occurred_at=apt_date,
                        type="appointment_booked",
                        status="confirmed",
                        source="HealthTribe",
                        tags=["appointment"],
                        structured_payload={
                            "appointment_id": "pending",
                            "doctor_name": doctor.name,
                            "date": apt_date.isoformat(),
                            "time": apt.time
                        },
                        metadata_col={"badge": "HealthTribe"}
                    )
                    timeline_events.append(apt_event)
                    session.add(apt_event)
        
        session.add_all(appointments)
        await session.flush()

        print("Seeding additional Timeline Events...")
        for patient in patient_users:
            for _ in range(random.randint(3, 8)):
                event_type = random.choice(["CONSULTATION", "PRESCRIPTION", "LAB_RESULT"])
                days_ago = random.randint(1, 180)
                doc = random.choice(doctors)
                
                if event_type == "CONSULTATION":
                    payload = {"title": "General Consultation", "doctor_name": doc.name}
                elif event_type == "PRESCRIPTION":
                    payload = {"title": "Medication Prescribed", "medications": [f"{fake.word()} 250mg"]}
                else:
                    payload = {"title": "Lab Test", "result": "Normal"}
                
                te = TimelineEvent(
                    id=uuid.uuid4(),
                    patient_id=patient.id,
                    doctor_id=doc.id,
                    occurred_at=now - timedelta(days=days_ago),
                    type=event_type,
                    status="completed",
                    source="HealthTribe",
                    tags=[],
                    structured_payload=payload
                )
                timeline_events.append(te)
                session.add(te)
        
        await session.commit()
        
        print(f"""
Phase 1 Database Seeded Successfully!

Summary:
   - {len(hospitals)} Hospitals
   - {len(doctors)} Doctors
   - {len(patient_users)} Patients
   - {len(abha_identities)} ABHA-linked Patients
   - {len(import_sessions)} Import Sessions
   - {len(imported_records)} Imported Health Records
   - {len(appointments)} Appointments (synchronized)
   - {len(timeline_events)} Timeline Events

Featured Patients:
   - Rahul Sharma (DEMO_RAHUL) - ABHA Verified, Apollo Records, Upcoming Appointments
   - Riya Patel (DEMO_RIYA) - No ABHA (encourage linking)
   - Sneha Reddy (DEMO_SNEHA) - ABHA Verified, MaxCure Import, Cardiology History
   - Amit Kumar (DEMO_AMIT) - ABHA Verified, Care Hospital Records

Everything is now synchronized across:
   Patient Home Dashboard
   Patient Appointments Page
   Patient Timeline
   Doctor Queue
   Doctor Patient Details
   AI Assistant Context
        """)

if __name__ == "__main__":
    asyncio.run(seed())
