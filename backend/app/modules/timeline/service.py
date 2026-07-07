import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.modules.timeline.schemas import TimelineEventCreate
from app.modules.timeline.models import TimelineEvent
from app.modules.timeline.repository import TimelineRepository
from app.modules.timeline.builder import TimelineBuilder

class TimelineService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = TimelineRepository(session)
        
    async def create_event(self, event_data: TimelineEventCreate) -> TimelineEvent:
        event = await self.repository.create(event_data)
        await self.session.commit()
        await self.session.refresh(event)
        return event
        
    async def correct_event(self, event_id: uuid.UUID, correction_data: TimelineEventCreate) -> TimelineEvent:
        original = await self.repository.get_by_id(event_id)
        if not original:
            raise HTTPException(status_code=404, detail="Original event not found")
            
        if original.status == "archived":
            raise HTTPException(status_code=400, detail="Cannot correct an archived event")
            
        # Builder enforces business logic for corrections
        new_event_data = TimelineBuilder.build_correction(original, correction_data)
        
        # Update original event status to 'corrected'
        original.status = "corrected"
        self.session.add(original)
        
        # Create new event
        new_event = await self.repository.create(new_event_data)
        
        await self.session.commit()
        await self.session.refresh(new_event)
        return new_event
        
    async def archive_event(self, event_id: uuid.UUID) -> Optional[TimelineEvent]:
        event = await self.repository.archive(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
            
        await self.session.commit()
        return event
