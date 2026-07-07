from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import LabReport, User
from app.core.security import get_current_user
from app.modules.labs.schemas import LabReportResponse, LabReportCreate, LabReportUpdate
import uuid
import datetime
from app.modules.timeline.service import TimelineService

router = APIRouter(tags=["labs"])

@router.get("/", response_model=List[LabReportResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(LabReport)
    if user.role.value == "PATIENT":
        query = query.where(LabReport.patient_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=LabReportResponse)
async def create_lab_report(
    report_in: LabReportCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can upload lab reports")
    
    new_report = LabReport(
        id=uuid.uuid4(),
        patient_id=report_in.patient_id,
        title=report_in.title,
        date=report_in.date,
        status=report_in.status,
        results=report_in.results or {}
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # Add to timeline
    timeline_service = TimelineService(db)
    await timeline_service.add_event(
        patient_id=report_in.patient_id,
        category="Lab Result",
        title=f"Lab Report: {report_in.title}",
        description=f"Status: {report_in.status}",
        date=report_in.date
    )
    
    return new_report

@router.put("/{report_id}", response_model=LabReportResponse)
async def update_lab_report(
    report_id: str,
    update_data: LabReportUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can update lab reports")
        
    query = select(LabReport).where(LabReport.id == uuid.UUID(report_id))
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
        
    if update_data.title is not None:
        report.title = update_data.title
    if update_data.status is not None:
        report.status = update_data.status
    if update_data.date is not None:
        report.date = update_data.date
    if update_data.results is not None:
        report.results = update_data.results
        
    await db.commit()
    await db.refresh(report)
    return report
