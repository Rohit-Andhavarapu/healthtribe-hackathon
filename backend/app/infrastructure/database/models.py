import enum
import uuid
from typing import Optional, List
import datetime
from sqlalchemy import String, ForeignKey, Text, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text

from app.infrastructure.database.base import Base, TimestampMixin

class RoleEnum(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    role: Mapped[RoleEnum] = mapped_column(nullable=False)
    
    patient_profile: Mapped[Optional["PatientProfile"]] = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile: Mapped[Optional["Doctor"]] = relationship("Doctor", back_populates="user", uselist=False)

class PatientProfile(Base, TimestampMixin):
    __tablename__ = "patient_profiles"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    demographics: Mapped[dict] = mapped_column(JSONB, nullable=True)
    allergies: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    chronic_conditions: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="patient_profile")

class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    
    doctors: Mapped[List["Doctor"]] = relationship("Doctor", back_populates="hospital")

class Doctor(Base, TimestampMixin):
    __tablename__ = "doctors"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    hospital_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String, nullable=False, server_default="Unknown")
    specialty: Mapped[str] = mapped_column(String, nullable=False)
    license_ref: Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    rating: Mapped[float] = mapped_column(server_default="0.0", nullable=False)
    experience: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    languages: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    consultation_fee: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    user: Mapped["User"] = relationship("User", back_populates="doctor_profile")
    hospital: Mapped["Hospital"] = relationship("Hospital", back_populates="doctors")
    appointments: Mapped[List["Appointment"]] = relationship("Appointment", back_populates="doctor")

class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    
    date: Mapped[str] = mapped_column(String, nullable=False) # Store ISO formatted string for simplicity or DateTime
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g. "10:00 AM"
    status: Mapped[str] = mapped_column(String, nullable=False) # e.g., 'Upcoming', 'Completed', 'Cancelled'
    type: Mapped[str] = mapped_column(String, nullable=False) # e.g., 'Video', 'In-Person'
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meet_link: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    patient: Mapped["User"] = relationship("User")
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")
    consultation: Mapped[Optional["Consultation"]] = relationship("Consultation", back_populates="appointment")

class Benefit(Base, TimestampMixin):
    __tablename__ = "benefits"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    type: Mapped[str] = mapped_column(String, nullable=False) # 'Insurance', 'Scheme'
    provider: Mapped[str] = mapped_column(String, nullable=False)
    policy_number: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    details: Mapped[dict] = mapped_column(JSONB, nullable=True)
    
    patient: Mapped["User"] = relationship("User")

class FamilyMember(Base, TimestampMixin):
    __tablename__ = "family_members"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    relation_type: Mapped[str] = mapped_column("relationship", String, nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    access_level: Mapped[str] = mapped_column(String, nullable=False) # e.g., 'Full Access', 'Emergency Only'
    
    patient: Mapped["User"] = relationship("User")

class LabReport(Base, TimestampMixin):
    __tablename__ = "lab_reports"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    results: Mapped[dict] = mapped_column(JSONB, nullable=True)
    
    patient: Mapped["User"] = relationship("User")

class AIConversation(Base, TimestampMixin):
    __tablename__ = "ai_conversations"
    
    id: Mapped[str] = mapped_column(String, primary_key=True) # UUID passed from frontend
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False, server_default="New Chat")
    role: Mapped[Optional[str]] = mapped_column(String, nullable=True) # 'PATIENT' or 'DOCTOR'
    context_payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True) # To store appointment_id, patient_id, etc.
    
    user: Mapped["User"] = relationship("User")
    messages: Mapped[List["AIMessage"]] = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")

class AIMessage(Base, TimestampMixin):
    __tablename__ = "ai_messages"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(String, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False) # 'user' or 'model'
    content: Mapped[str] = mapped_column(String, nullable=False)
    sources: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=True)
    actions: Mapped[list] = mapped_column(JSONB, nullable=True) # List of actions
    is_error: Mapped[bool] = mapped_column(server_default="false", nullable=False)
    
    conversation: Mapped["AIConversation"] = relationship("AIConversation", back_populates="messages")

class Medication(Base, TimestampMixin):
    __tablename__ = "medications"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    dosage: Mapped[str] = mapped_column(String, nullable=False)
    frequency: Mapped[str] = mapped_column(String, nullable=False)
    duration: Mapped[str] = mapped_column(String, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="ACTIVE") # ACTIVE, COMPLETED, DISCONTINUED
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped[Optional["Doctor"]] = relationship("Doctor")
    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment")

class LabOrder(Base, TimestampMixin):
    __tablename__ = "lab_orders"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    test_name: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[str] = mapped_column(String, nullable=False, server_default="ROUTINE") # ROUTINE, URGENT, STAT
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="PENDING") # PENDING, COMPLETED, CANCELLED
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped[Optional["Doctor"]] = relationship("Doctor")
    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment")

class Consultation(Base, TimestampMixin):
    __tablename__ = "consultations"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, unique=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    
    vitals: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    diagnosis: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    differential_diagnosis: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    appointment: Mapped["Appointment"] = relationship("Appointment", back_populates="consultation")
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped["Doctor"] = relationship("Doctor")

class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    DISPATCHED = "DISPATCHED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class MedicationOrder(Base, TimestampMixin):
    __tablename__ = "medication_orders"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    consultation_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="SET NULL"), nullable=True)
    
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), nullable=False, default=OrderStatus.PLACED)
    medication_ids: Mapped[list] = mapped_column(JSONB, nullable=False, default=list) # List of Medication UUIDs
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped[Optional["Doctor"]] = relationship("Doctor")
    appointment: Mapped[Optional["Appointment"]] = relationship("Appointment")
    consultation: Mapped[Optional["Consultation"]] = relationship("Consultation")


class ConsentRequest(Base, TimestampMixin):
    __tablename__ = "consent_requests"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    
    hospital_name: Mapped[str] = mapped_column(String, nullable=False)
    purpose: Mapped[str] = mapped_column(String, nullable=False)
    requested_data: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="PENDING") # PENDING, APPROVED, REJECTED, REVOKED, EXPIRED
    expiry: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped[Optional["Doctor"]] = relationship("Doctor")


class ABHAIdentity(Base, TimestampMixin):
    __tablename__ = "abha_identities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    abha_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    abha_address: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    verification_status: Mapped[str] = mapped_column(String, nullable=False, server_default="PENDING")
    verification_method: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    linked_at: Mapped[Optional[str]] = mapped_column(String, nullable=True) # ISO Date
    is_primary: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])

class ConsentRecord(Base, TimestampMixin):
    __tablename__ = "consent_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hospital_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="PENDING") # PENDING, ACTIVE, REVOKED, EXPIRED
    granted_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    expires_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    hospital: Mapped["Hospital"] = relationship("Hospital", foreign_keys=[hospital_id])

class ImportSession(Base, TimestampMixin):
    __tablename__ = "import_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hospital_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    
    date: Mapped[str] = mapped_column(String, nullable=False)
    imported_count: Mapped[int] = mapped_column(nullable=False, server_default="0")
    consent_used_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("consent_records.id", ondelete="SET NULL"), nullable=True)
    ai_summary_event_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("timeline_events.id", ondelete="SET NULL"), nullable=True)
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    hospital: Mapped["Hospital"] = relationship("Hospital", foreign_keys=[hospital_id])
    consent_used: Mapped[Optional["ConsentRecord"]] = relationship("ConsentRecord")

class ImportedHealthRecord(Base, TimestampMixin):
    __tablename__ = "imported_health_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hospital_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    import_session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("import_sessions.id", ondelete="CASCADE"), nullable=False)
    
    record_type: Mapped[str] = mapped_column(String, nullable=False) # e.g., 'Prescription', 'LabReport', 'Consultation'
    event_date: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    hospital: Mapped["Hospital"] = relationship("Hospital", foreign_keys=[hospital_id])
    import_session: Mapped["ImportSession"] = relationship("ImportSession")


class EmergencyContact(Base, TimestampMixin):
    __tablename__ = "emergency_contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    relation_type: Mapped[str] = mapped_column("relationship", String, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=False)
    is_primary: Mapped[bool] = mapped_column(server_default="false", nullable=False)
    
    patient: Mapped["User"] = relationship("User")


class MedicalInformation(Base, TimestampMixin):
    __tablename__ = "medical_information"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    conditions: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    allergies: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    chronic_diseases: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    past_surgeries: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    medical_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    patient: Mapped["User"] = relationship("User")


class NotificationPreferences(Base, TimestampMixin):
    __tablename__ = "notification_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    appointment_reminders: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    medication_reminders: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    lab_report_notifications: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    order_updates: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    emergency_alerts: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    email_notifications: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    push_notifications: Mapped[bool] = mapped_column(server_default="true", nullable=False)
    sms_notifications: Mapped[bool] = mapped_column(server_default="false", nullable=False)
    
    patient: Mapped["User"] = relationship("User")


class Feedback(Base, TimestampMixin):
    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    type: Mapped[str] = mapped_column(String, nullable=False) # 'BUG', 'FEEDBACK', 'FEATURE_REQUEST'
    subject: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, server_default="SUBMITTED") # SUBMITTED, REVIEWED, RESOLVED
    
    user: Mapped["User"] = relationship("User")
