import inspect
import json
import logging
from typing import Dict, Any, Callable, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from datetime import datetime
import uuid

from app.infrastructure.database.models import User, Doctor, Appointment, LabReport, PatientProfile
from app.modules.timeline.query_service import TimelineQueryService

logger = logging.getLogger(__name__)

# --- APPLICATION SERVICES & REPOSITORIES ---
# Following the architecture: Tool -> Service -> Database

class AIToolServices:
    """Application services that encapsulate database logic for AI tools."""
    def __init__(self, db: AsyncSession, user: User, client_role: str = "PATIENT", context_payload: Dict[str, Any] = None):
        self.db = db
        self.user = user
        self.client_role = client_role
        self.context_payload = context_payload

    async def _get_target_patient_id(self) -> uuid.UUID:
        if self.client_role == "DOCTOR":
            if self.context_payload and "patient_id" in self.context_payload:
                return uuid.UUID(self.context_payload["patient_id"])
            raise ValueError("Doctor must be in a consultation context to fetch patient data.")
        return self.user.id

    async def find_doctor(self, specialty: str = None, hospital: str = None) -> List[Dict[str, Any]]:
        query = select(Doctor).options(joinedload(Doctor.hospital))
        
        result = await self.db.execute(query)
        doctors = result.scalars().all()
        
        filtered = []
        for doc in doctors:
            if specialty and specialty.lower() not in doc.specialty.lower():
                continue
            if hospital and doc.hospital and hospital.lower() not in doc.hospital.name.lower():
                continue
                
            filtered.append({
                "id": str(doc.id),
                "name": doc.name,
                "specialty": doc.specialty,
                "hospital": doc.hospital.name if doc.hospital else "Unknown Hospital",
                "availability": doc.availability
            })
        return filtered

    async def book_appointment(self, doctor_name_or_id: str, date: str, time: str, notes: str = "Booked via AI Assistant", type: str = "In-Person") -> Dict[str, Any]:
        # Try finding by exact UUID first
        try:
            doc_uuid = uuid.UUID(doctor_name_or_id)
            query = select(Doctor).where(Doctor.id == doc_uuid)
            result = await self.db.execute(query)
            doctors = result.scalars().all()
        except ValueError:
            # Not a UUID, search by name using robust matching
            result = await self.db.execute(select(Doctor))
            all_doctors = result.scalars().all()
            
            import re
            def clean_name(n: str) -> str:
                n = n.lower()
                n = re.sub(r'^dr\.?\s+', '', n)
                return re.sub(r'\s+', ' ', n).strip()
                
            clean_input = clean_name(doctor_name_or_id)
            doctors = []
            
            for doc in all_doctors:
                c_name = clean_name(doc.name)
                if len(clean_input) >= 3 and (clean_input in c_name or c_name in clean_input):
                    doctors.append(doc)
        
        if not doctors:
            return {"error": f"No doctor found matching '{doctor_name_or_id}'."}
            
        if len(doctors) > 1:
            matches = [f"ID: {d.id} | Name: {d.name} | Specialty: {d.specialty}" for d in doctors]
            return {
                "error": "Multiple doctors found matching that name. Please ask the user to clarify which one.",
                "matches": matches
            }
            
        doctor = doctors[0]
            
        from app.modules.appointments.service import AppointmentService
        from app.modules.doctors.service import DoctorService
        
        appt_service = AppointmentService(self.db)
        doc_service = DoctorService(self.db)
        
        # Verify the date/time is actually available
        availability = await doc_service.get_doctor_availability(str(doctor.id))
        
        slot_found = False
        for day in availability:
            if day["isoDate"] == date and day["time"] == time:
                slot_found = True
                break
                
        if not slot_found:
            return {"error": f"The time slot {time} on {date} is not available. Please ask the user to choose another time or use fetch_doctor_availability."}
        
        appt = await appt_service.create_appointment(
            patient_id=self.user.id,
            doctor_id=doctor.id,
            date=date,
            time=time,
            type=type,
            notes=notes
        )
        
        return {
            "success": True,
            "appointment_id": str(appt.id),
            "doctor": doctor.name,
            "date": date,
            "time": time,
            "_action": "invalidate_cache",
            "_keys": ["appointments", "timeline", "smartContext"]
        }

    async def fetch_doctor_availability(self, doctor_name_or_id: str) -> List[Dict[str, Any]]:
        try:
            doc_uuid = uuid.UUID(doctor_name_or_id)
            query = select(Doctor).where(Doctor.id == doc_uuid)
            result = await self.db.execute(query)
            doctors = result.scalars().all()
        except ValueError:
            result = await self.db.execute(select(Doctor))
            all_doctors = result.scalars().all()
            
            import re
            def clean_name(n: str) -> str:
                n = n.lower()
                n = re.sub(r'^dr\.?\s+', '', n)
                return re.sub(r'\s+', ' ', n).strip()
                
            clean_input = clean_name(doctor_name_or_id)
            doctors = []
            
            for doc in all_doctors:
                c_name = clean_name(doc.name)
                if len(clean_input) >= 3 and (clean_input in c_name or c_name in clean_input):
                    doctors.append(doc)
                    
        if not doctors:
            return [{"error": f"No doctor found matching '{doctor_name_or_id}'."}]
            
        doctor = doctors[0]
        
        from app.modules.doctors.service import DoctorService
        service = DoctorService(self.db)
        return await service.get_doctor_availability(str(doctor.id))

    async def fetch_lab_reports(self) -> List[Dict[str, Any]]:
        patient_id = await self._get_target_patient_id()
        result = await self.db.execute(select(LabReport).where(LabReport.patient_id == patient_id))
        labs = result.scalars().all()
        return [{"id": str(l.id), "title": l.title, "date": l.date, "status": l.status} for l in labs]
        
    async def fetch_medications(self) -> List[Dict[str, Any]]:
        patient_id = await self._get_target_patient_id()
        from app.infrastructure.database.models import Medication
        result = await self.db.execute(select(Medication).where(Medication.patient_id == patient_id))
        meds = result.scalars().all()
        return [{"name": m.name, "dosage": m.dosage, "frequency": m.frequency} for m in meds]

    async def fetch_timeline_events(self) -> List[Dict[str, Any]]:
        patient_id = await self._get_target_patient_id()
        service = TimelineQueryService(self.db)
        events = await service.get_timeline(patient_id=patient_id, limit=10)
        return [{
            "date": e.occurred_at.strftime('%Y-%m-%d'),
            "type": e.type,
            "title": e.structured_payload.get('title', 'Event')
        } for e in events]
        
    async def fetch_upcoming_appointments(self) -> List[Dict[str, Any]]:
        if self.user.role.value == "DOCTOR":
            query = select(Appointment).join(Doctor).where(Doctor.user_id == self.user.id).where(Appointment.status == "Scheduled")
        else:
            query = select(Appointment).where(Appointment.patient_id == self.user.id).where(Appointment.status == "Scheduled")
            
        result = await self.db.execute(query)
        appts = result.scalars().all()
        return [{"id": str(a.id), "date": a.date, "type": a.type, "status": a.status} for a in appts]

    async def navigate(self, target: str) -> Dict[str, str]:
        return {"action": "navigate", "target": target}

    async def check_medication_order_status(self) -> List[Dict[str, Any]]:
        patient_id = await self._get_target_patient_id()
        from app.infrastructure.database.models import MedicationOrder, Medication
        
        query = select(MedicationOrder).where(MedicationOrder.patient_id == patient_id)
        result = await self.db.execute(query)
        orders = result.scalars().all()
        
        formatted = []
        for order in orders:
            meds = []
            if order.medication_ids:
                meds_query = select(Medication).where(Medication.id.in_([uuid.UUID(m) for m in order.medication_ids]))
                meds_res = await self.db.execute(meds_query)
                meds_list = meds_res.scalars().all()
                meds = [{"name": m.name, "dosage": m.dosage} for m in meds_list]
                
            formatted.append({
                "id": str(order.id),
                "status": order.status,
                "medications": meds
            })
            
        return formatted

    async def save_soap_note(self, subjective: str, objective: str, assessment: str, plan: str) -> Dict[str, Any]:
        if self.client_role != "DOCTOR":
            return {"error": "Only doctors can save SOAP notes."}
            
        if not self.context_payload or not self.context_payload.get("appointment_id"):
            return {"error": "No active consultation found in context. Please open a patient's consultation first."}
            
        appt_id = self.context_payload["appointment_id"]
        from app.infrastructure.database.models import Consultation
        from app.modules.appointments.schemas import ConsultationUpdate
        
        # We need to update the consultation associated with this appointment.
        query = select(Consultation).where(Consultation.appointment_id == uuid.UUID(appt_id))
        result = await self.db.execute(query)
        consultation = result.scalar_one_or_none()
        
        if not consultation:
            return {"error": "Consultation record not found for this appointment."}
            
        consultation.subjective = subjective
        consultation.objective = objective
        consultation.assessment = assessment
        consultation.plan = plan
        
        await self.db.commit()
        return {
            "success": True, 
            "message": "SOAP note saved successfully.",
            "_action": "invalidate_cache",
            "_keys": ["consultation", appt_id]
        }



# --- TOOL REGISTRY ---

class ToolRegistry:
    """Registry that maps Gemini function calls to application services."""
    def __init__(self, services: AIToolServices):
        self.services = services
        self._tools = {}
        self._register_default_tools()
        
    def _register_default_tools(self):
        self.register("find_doctor", self.services.find_doctor)
        self.register("book_appointment", self.services.book_appointment)
        self.register("fetch_lab_reports", self.services.fetch_lab_reports)
        self.register("fetch_medications", self.services.fetch_medications)
        self.register("fetch_timeline_events", self.services.fetch_timeline_events)
        self.register("fetch_upcoming_appointments", self.services.fetch_upcoming_appointments)
        self.register("navigate", self.services.navigate)
        self.register("check_medication_order_status", self.services.check_medication_order_status)
        self.register("save_soap_note", self.services.save_soap_note)
        
    def register(self, name: str, func: Callable):
        self._tools[name] = func
        
    async def execute(self, name: str, kwargs: Dict[str, Any]) -> Any:
        if name not in self._tools:
            return {"error": f"Tool '{name}' not found."}
        
        try:
            func = self._tools[name]
            if inspect.iscoroutinefunction(func):
                return await func(**kwargs)
            else:
                return func(**kwargs)
        except Exception as e:
            logger.error(f"Error executing tool {name}: {str(e)}")
            return {"error": str(e)}

# --- OPENAI TOOL DEFINITIONS ---

def get_openai_tools() -> List[Dict[str, Any]]:
    """Returns tool declarations matching the OpenAI tool JSON schema."""
    return [
        {
            "type": "function",
            "function": {
                "name": "check_medication_order_status",
                "description": "Checks the status of the patient's medication orders (e.g. pending, filled, delivered).",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "find_doctor",
                "description": "Find available doctors based on specialty or hospital.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "specialty": {"type": ["string", "null"], "description": "Medical specialty"},
                        "hospital": {"type": ["string", "null"], "description": "Hospital name"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "book_appointment",
                "description": "Book an appointment with a doctor. Require doctor_name_or_id, date, and time.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "doctor_name_or_id": {"type": "string", "description": "Name or UUID of the doctor (e.g. Dr Anand Reddy)"},
                        "date": {"type": "string", "description": "Date of appointment YYYY-MM-DD"},
                        "time": {"type": "string", "description": "Time of appointment (e.g. 10:30 AM). Ask the user if not specified."},
                        "notes": {"type": "string", "description": "Optional notes for the doctor"},
                        "type": {"type": "string", "description": "Appointment type: 'In-Person' or 'Video Consultation'", "enum": ["In-Person", "Video Consultation"]}
                    },
                    "required": ["doctor_name_or_id", "date", "time", "type"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_doctor_availability",
                "description": "Fetch the available appointment slots for a specific doctor for the next 7 days.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "doctor_name_or_id": {"type": "string", "description": "Name or UUID of the doctor (e.g. Dr Anand Reddy)"}
                    },
                    "required": ["doctor_name_or_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_lab_reports",
                "description": "Fetch the user's latest lab reports.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_medications",
                "description": "Fetch the user's current medications.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_timeline_events",
                "description": "Fetch the user's medical timeline events.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "fetch_upcoming_appointments",
                "description": "Fetch the user's upcoming scheduled appointments.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "navigate",
                "description": "Navigate the user to a specific page in the app.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "target": {"type": "string", "description": "Page to navigate to (e.g. /doctors, /labs, /appointments, /timeline, /profile)"}
                    },
                    "required": ["target"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "save_soap_note",
                "description": "Save a drafted SOAP note directly to the active consultation.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "subjective": {"type": "string"},
                        "objective": {"type": "string"},
                        "assessment": {"type": "string"},
                        "plan": {"type": "string"}
                    },
                    "required": ["subjective", "objective", "assessment", "plan"]
                }
            }
        }
    ]
