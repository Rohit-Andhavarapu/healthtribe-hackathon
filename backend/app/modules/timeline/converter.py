import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.infrastructure.database.models import ImportedHealthRecord
from app.modules.timeline.factory import TimelineEventFactory
from app.modules.timeline.service import TimelineService
from app.modules.timeline.models import TimelineEvent

class TimelineConverter:
    """
    Converts ImportedHealthRecords into standard TimelineEvents using the TimelineEventFactory.
    """
    def __init__(self, session: AsyncSession):
        self.session = session
        self.timeline_service = TimelineService(session)

    async def convert_imported_record(self, record: ImportedHealthRecord, hospital_name: str) -> TimelineEvent:
        """
        Takes a single ImportedHealthRecord and converts it to a TimelineEvent.
        """
        event_create = TimelineEventFactory.create_imported_record(
            patient_id=uuid.UUID(str(record.patient_id)),
            hospital_id=uuid.UUID(str(record.hospital_id)),
            hospital_name=hospital_name,
            record_type=record.record_type,
            event_date=record.event_date,
            payload=record.payload,
            import_session_id=uuid.UUID(str(record.import_session_id)),
            imported_record_id=record.id
        )
        
        # Save to timeline
        timeline_event = await self.timeline_service.create_event(event_create)
        
        # We could also link the timeline_event_id back to the ImportedHealthRecord here if we had the field.
        # But our DB model currently doesn't require storing timeline_event_id strictly if we can derive it.
        # Wait, the DB model actually might not have `timeline_event_id` in ImportedHealthRecord based on my earlier alembic diff.
        
        return timeline_event

    async def process_batch(self, records: List[ImportedHealthRecord], hospital_name: str) -> List[TimelineEvent]:
        events = []
        for record in records:
            event = await self.convert_imported_record(record, hospital_name)
            events.append(event)
            
        return events
