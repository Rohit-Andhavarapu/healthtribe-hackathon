import uuid
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.timeline.models import TimelineEvent
from app.modules.timeline.schemas import TimelineEventCreate

class TimelineRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_by_id(self, event_id: uuid.UUID) -> Optional[TimelineEvent]:
        stmt = select(TimelineEvent).options(selectinload(TimelineEvent.attachments)).where(TimelineEvent.id == event_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
        
    async def create(self, event_data: TimelineEventCreate) -> TimelineEvent:
        db_event = TimelineEvent(**event_data.model_dump(by_alias=True, exclude_none=True))
        self.session.add(db_event)
        await self.session.flush()
        return db_event
        
    async def archive(self, event_id: uuid.UUID) -> Optional[TimelineEvent]:
        stmt = update(TimelineEvent).where(TimelineEvent.id == event_id).values(status="archived").returning(TimelineEvent)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
