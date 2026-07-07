from fastapi import APIRouter, Depends, Query, HTTPException, Request
from typing import List, Optional
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db
from app.core.security import get_current_user
from app.infrastructure.database.models import User

from app.modules.timeline.schemas import TimelineEventResponse, TimelineEventCreate
from app.modules.timeline.service import TimelineService
from app.modules.timeline.query_service import TimelineQueryService
from app.modules.timeline.repository import TimelineRepository

import logging
logger = logging.getLogger(__name__)
router = APIRouter(tags=["Timeline"])

@router.get("", response_model=List[TimelineEventResponse])
async def list_timeline_events(
    request: Request,
    type: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    cursor_date: Optional[datetime] = None,
    cursor_id: Optional[uuid.UUID] = None,
    patient_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: "User" = Depends(get_current_user)
):
    logger.error(f"TIMELINE HEADERS: {request.headers}")
    query_service = TimelineQueryService(db)
    
    # If DOCTOR, they can pass patient_id. Otherwise, fallback to user.id
    target_patient_id = patient_id if user.role.value == "DOCTOR" and patient_id else user.id

    events = await query_service.get_timeline(
        patient_id=target_patient_id,
        type_filter=type,
        tags_filter=tags,
        limit=limit,
        cursor_date=cursor_date,
        cursor_id=cursor_id
    )
    return events

@router.get("/{event_id}", response_model=TimelineEventResponse)
async def get_timeline_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    repo = TimelineRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    return event

@router.post("", response_model=TimelineEventResponse, status_code=201)
async def create_timeline_event(
    event_data: TimelineEventCreate,
    db: AsyncSession = Depends(get_db)
):
    service = TimelineService(db)
    event = await service.create_event(event_data)
    return event

@router.post("/{event_id}/correct", response_model=TimelineEventResponse)
async def correct_timeline_event(
    event_id: uuid.UUID,
    correction_data: TimelineEventCreate,
    db: AsyncSession = Depends(get_db)
):
    service = TimelineService(db)
    event = await service.correct_event(event_id, correction_data)
    return event

@router.patch("/{event_id}/archive", response_model=TimelineEventResponse)
async def archive_timeline_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = TimelineService(db)
    event = await service.archive_event(event_id)
    return event
