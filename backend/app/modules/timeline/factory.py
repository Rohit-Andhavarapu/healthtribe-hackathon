import uuid
import datetime
from typing import Optional, Dict, Any, List

from app.modules.timeline.schemas import TimelineEventCreate

class TimelineEventFactory:
    """
    Centralized factory for generating standardized Timeline events.
    This acts as the Event Bus publisher interface.
    """

    @staticmethod
    def create_appointment_booked(
        patient_id: uuid.UUID, 
        doctor_id: uuid.UUID,
        appointment_id: uuid.UUID,
        date: str,
        time: Optional[str]
    ) -> TimelineEventCreate:
        return TimelineEventCreate(
            patient_id=patient_id,
            doctor_id=doctor_id,
            occurred_at=datetime.datetime.now(datetime.timezone.utc),
            type="appointment_booked",
            status="confirmed",
            source="HealthTribe",
            tags=["appointment"],
            structured_payload={
                "appointment_id": str(appointment_id),
                "date": date,
                "time": time
            },
            metadata_col={"badge": "HealthTribe"}
        )

    @staticmethod
    def create_consent_status_changed(
        patient_id: uuid.UUID,
        hospital_id: uuid.UUID,
        status: str, # 'ACTIVE', 'REVOKED', 'EXPIRED'
        consent_record_id: uuid.UUID
    ) -> TimelineEventCreate:
        return TimelineEventCreate(
            patient_id=patient_id,
            doctor_id=None,
            occurred_at=datetime.datetime.now(datetime.timezone.utc),
            type="consent_status_changed",
            status=status.lower(),
            source="HealthTribe",
            tags=["consent", "privacy"],
            structured_payload={
                "hospital_id": str(hospital_id),
                "consent_record_id": str(consent_record_id),
                "status": status
            },
            metadata_col={"badge": "HealthTribe"}
        )

    @staticmethod
    def create_imported_record(
        patient_id: uuid.UUID,
        hospital_id: uuid.UUID,
        hospital_name: str,
        record_type: str,
        event_date: str,
        payload: dict,
        import_session_id: uuid.UUID,
        imported_record_id: uuid.UUID
    ) -> TimelineEventCreate:
        # Convert date to datetime if possible, otherwise use now
        try:
            occurred_at = datetime.datetime.fromisoformat(event_date.replace("Z", "+00:00"))
        except ValueError:
            occurred_at = datetime.datetime.now(datetime.timezone.utc)
            
        return TimelineEventCreate(
            patient_id=patient_id,
            doctor_id=None,
            occurred_at=occurred_at,
            type=f"imported_{record_type.lower()}",
            status="imported",
            source=f"{hospital_name}",
            tags=["imported", record_type.lower(), "abha"],
            structured_payload={
                "import_session_id": str(import_session_id),
                "imported_record_id": str(imported_record_id),
                "original_payload": payload
            },
            metadata_col={"badge": "ABHA Import"}
        )

    @staticmethod
    def create_ai_summary(
        patient_id: uuid.UUID,
        import_session_id: Optional[uuid.UUID],
        summary_text: str,
        insights: List[str]
    ) -> TimelineEventCreate:
        return TimelineEventCreate(
            patient_id=patient_id,
            doctor_id=None,
            occurred_at=datetime.datetime.now(datetime.timezone.utc),
            type="ai_summary",
            status="generated",
            source="AI Generated",
            tags=["ai", "summary", "insights"],
            structured_payload={
                "import_session_id": str(import_session_id) if import_session_id else None,
                "summary": summary_text,
                "insights": insights
            },
            metadata_col={"badge": "AI Generated"}
        )

    @staticmethod
    def create_abha_linked(
        patient_id: uuid.UUID,
        abha_number: str,
        abha_address: str,
        identity_id: uuid.UUID
    ) -> TimelineEventCreate:
        return TimelineEventCreate(
            patient_id=patient_id,
            doctor_id=None,
            occurred_at=datetime.datetime.now(datetime.timezone.utc),
            type="abha_linked",
            status="verified",
            source="ABDM / NHA",
            tags=["abha", "identity", "verified"],
            structured_payload={
                "abha_number": abha_number,
                "abha_address": abha_address,
                "identity_id": str(identity_id),
            },
            metadata_col={"badge": "ABHA Linked"}
        )
