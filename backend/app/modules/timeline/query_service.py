import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.timeline.models import TimelineEvent

class TimelineQueryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_timeline(
        self, 
        patient_id: uuid.UUID,
        type_filter: Optional[str] = None,
        tags_filter: Optional[List[str]] = None,
        limit: int = 50,
        cursor_date: Optional[datetime] = None,
        cursor_id: Optional[uuid.UUID] = None
    ) -> List[TimelineEvent]:
        stmt = select(TimelineEvent).where(
            TimelineEvent.patient_id == patient_id,
            TimelineEvent.status != "archived"
        ).options(selectinload(TimelineEvent.attachments))
        
        if type_filter:
            stmt = stmt.where(TimelineEvent.type == type_filter)
            
        if tags_filter:
            # GIN index optimized overlap search
            stmt = stmt.where(TimelineEvent.tags.overlap(tags_filter))
            
        if cursor_date and cursor_id:
            # Keyset pagination logic
            stmt = stmt.where(
                (TimelineEvent.occurred_at < cursor_date) | 
                ((TimelineEvent.occurred_at == cursor_date) & (TimelineEvent.id < cursor_id))
            )
            
        stmt = stmt.order_by(desc(TimelineEvent.occurred_at), desc(TimelineEvent.id)).limit(limit)
        
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
