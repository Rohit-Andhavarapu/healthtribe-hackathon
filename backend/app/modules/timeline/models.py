import datetime
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import String, ForeignKey, Float, Index, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import text

from app.infrastructure.database.base import Base, TimestampMixin

class TimelineEvent(Base, TimestampMixin):
    __tablename__ = "timeline_events"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True)
    
    occurred_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), server_default="{}", nullable=False)
    
    structured_payload: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    metadata_col: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    
    supersedes_event_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("timeline_events.id"), nullable=True)
    
    attachments: Mapped[List["TimelineAttachment"]] = relationship("TimelineAttachment", back_populates="event", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_timeline_events_patient_occurred_at", "patient_id", "occurred_at", postgresql_ops={"occurred_at": "DESC"}),
    )

class TimelineAttachment(Base, TimestampMixin):
    __tablename__ = "timeline_attachments"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("timeline_events.id", ondelete="CASCADE"), index=True, nullable=False)
    
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    uploaded_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    event: Mapped["TimelineEvent"] = relationship("TimelineEvent", back_populates="attachments")
