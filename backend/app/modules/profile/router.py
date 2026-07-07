from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models import (
    PatientProfile, User, EmergencyContact, MedicalInformation, 
    NotificationPreferences, Feedback
)
from app.core.security import get_current_user
from app.modules.profile.schemas import (
    PatientProfileResponse, PatientProfileUpdate,
    EmergencyContactCreate, EmergencyContactUpdate, EmergencyContactResponse,
    MedicalInformationUpdate, MedicalInformationResponse,
    NotificationPreferencesUpdate, NotificationPreferencesResponse,
    FeedbackCreate, FeedbackResponse
)
import uuid

router = APIRouter(tags=["profile"])

@router.get("/", response_model=List[PatientProfileResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(PatientProfile)
    if user.role.value == "PATIENT":
        query = query.where(PatientProfile.user_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{user_id}", response_model=PatientProfileResponse)
async def get_by_user_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        parsed_user_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")
        
    query = select(PatientProfile).where(PatientProfile.user_id == parsed_user_id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = PatientProfile(
            id=uuid.uuid4(),
            user_id=parsed_user_id,
            demographics={},
            allergies=[],
            chronic_conditions=[]
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
    return profile

@router.put("/{user_id}", response_model=PatientProfileResponse)
async def update_profile(
    user_id: str,
    update_data: PatientProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role.value == "PATIENT" and str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
        
    try:
        parsed_user_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")
        
    query = select(PatientProfile).where(PatientProfile.user_id == parsed_user_id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = PatientProfile(
            id=uuid.uuid4(),
            user_id=parsed_user_id,
            demographics=update_data.demographics or {},
            allergies=update_data.allergies or [],
            chronic_conditions=update_data.chronic_conditions or []
        )
        db.add(profile)
    else:
        if update_data.demographics is not None:
            profile.demographics = update_data.demographics
        if update_data.allergies is not None:
            profile.allergies = update_data.allergies
        if update_data.chronic_conditions is not None:
            profile.chronic_conditions = update_data.chronic_conditions
        
    await db.commit()
    await db.refresh(profile)
    return profile


# ========== Emergency Contacts ==========

@router.get("/emergency-contacts", response_model=List[EmergencyContactResponse])
async def get_emergency_contacts(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(EmergencyContact).where(EmergencyContact.patient_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/emergency-contacts", response_model=EmergencyContactResponse)
async def create_emergency_contact(
    data: EmergencyContactCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Check if already have 5 contacts
    count_query = select(EmergencyContact).where(EmergencyContact.patient_id == user.id)
    result = await db.execute(count_query)
    existing_contacts = result.scalars().all()
    
    if len(existing_contacts) >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 emergency contacts allowed")
    
    # If this is primary, unset other primaries
    if data.is_primary:
        for contact in existing_contacts:
            contact.is_primary = False
    
    contact = EmergencyContact(
        id=uuid.uuid4(),
        patient_id=user.id,
        name=data.name,
        relation_type=data.relationship,
        phone_number=data.phone_number,
        is_primary=data.is_primary
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact

@router.put("/emergency-contacts/{contact_id}", response_model=EmergencyContactResponse)
async def update_emergency_contact(
    contact_id: str,
    data: EmergencyContactUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        parsed_id = uuid.UUID(contact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contact_id format")
    
    query = select(EmergencyContact).where(
        EmergencyContact.id == parsed_id,
        EmergencyContact.patient_id == user.id
    )
    result = await db.execute(query)
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # If setting as primary, unset others
    if data.is_primary:
        other_contacts_query = select(EmergencyContact).where(
            EmergencyContact.patient_id == user.id,
            EmergencyContact.id != parsed_id
        )
        others_result = await db.execute(other_contacts_query)
        for other_contact in others_result.scalars():
            other_contact.is_primary = False
    
    if data.name is not None:
        contact.name = data.name
    if data.relationship is not None:
        contact.relation_type = data.relationship
    if data.phone_number is not None:
        contact.phone_number = data.phone_number
    if data.is_primary is not None:
        contact.is_primary = data.is_primary
    
    await db.commit()
    await db.refresh(contact)
    return contact

@router.delete("/emergency-contacts/{contact_id}")
async def delete_emergency_contact(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        parsed_id = uuid.UUID(contact_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contact_id format")
    
    query = select(EmergencyContact).where(
        EmergencyContact.id == parsed_id,
        EmergencyContact.patient_id == user.id
    )
    result = await db.execute(query)
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    await db.delete(contact)
    await db.commit()
    return {"success": True}


# ========== Medical Information ==========

@router.get("/medical-info", response_model=MedicalInformationResponse)
async def get_medical_information(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(MedicalInformation).where(MedicalInformation.patient_id == user.id)
    result = await db.execute(query)
    info = result.scalar_one_or_none()
    
    if not info:
        # Create default
        info = MedicalInformation(
            id=uuid.uuid4(),
            patient_id=user.id,
            conditions=[],
            allergies=[],
            chronic_diseases=[],
            past_surgeries=[],
            medical_notes=None
        )
        db.add(info)
        await db.commit()
        await db.refresh(info)
    
    return info

@router.put("/medical-info", response_model=MedicalInformationResponse)
async def update_medical_information(
    data: MedicalInformationUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(MedicalInformation).where(MedicalInformation.patient_id == user.id)
    result = await db.execute(query)
    info = result.scalar_one_or_none()
    
    if not info:
        info = MedicalInformation(
            id=uuid.uuid4(),
            patient_id=user.id,
            conditions=data.conditions or [],
            allergies=data.allergies or [],
            chronic_diseases=data.chronic_diseases or [],
            past_surgeries=data.past_surgeries or [],
            medical_notes=data.medical_notes
        )
        db.add(info)
    else:
        if data.conditions is not None:
            info.conditions = data.conditions
        if data.allergies is not None:
            info.allergies = data.allergies
        if data.chronic_diseases is not None:
            info.chronic_diseases = data.chronic_diseases
        if data.past_surgeries is not None:
            info.past_surgeries = data.past_surgeries
        if data.medical_notes is not None:
            info.medical_notes = data.medical_notes
    
    await db.commit()
    await db.refresh(info)
    return info


# ========== Notification Preferences ==========

@router.get("/notification-preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(NotificationPreferences).where(NotificationPreferences.patient_id == user.id)
    result = await db.execute(query)
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        # Create defaults (all enabled)
        prefs = NotificationPreferences(
            id=uuid.uuid4(),
            patient_id=user.id,
            appointment_reminders=True,
            medication_reminders=True,
            lab_report_notifications=True,
            order_updates=True,
            emergency_alerts=True,
            email_notifications=True,
            push_notifications=True,
            sms_notifications=False
        )
        db.add(prefs)
        await db.commit()
        await db.refresh(prefs)
    
    return prefs

@router.put("/notification-preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    data: NotificationPreferencesUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(NotificationPreferences).where(NotificationPreferences.patient_id == user.id)
    result = await db.execute(query)
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        prefs = NotificationPreferences(
            id=uuid.uuid4(),
            patient_id=user.id,
            appointment_reminders=data.appointment_reminders if data.appointment_reminders is not None else True,
            medication_reminders=data.medication_reminders if data.medication_reminders is not None else True,
            lab_report_notifications=data.lab_report_notifications if data.lab_report_notifications is not None else True,
            order_updates=data.order_updates if data.order_updates is not None else True,
            emergency_alerts=data.emergency_alerts if data.emergency_alerts is not None else True,
            email_notifications=data.email_notifications if data.email_notifications is not None else True,
            push_notifications=data.push_notifications if data.push_notifications is not None else True,
            sms_notifications=data.sms_notifications if data.sms_notifications is not None else False
        )
        db.add(prefs)
    else:
        if data.appointment_reminders is not None:
            prefs.appointment_reminders = data.appointment_reminders
        if data.medication_reminders is not None:
            prefs.medication_reminders = data.medication_reminders
        if data.lab_report_notifications is not None:
            prefs.lab_report_notifications = data.lab_report_notifications
        if data.order_updates is not None:
            prefs.order_updates = data.order_updates
        if data.emergency_alerts is not None:
            prefs.emergency_alerts = data.emergency_alerts
        if data.email_notifications is not None:
            prefs.email_notifications = data.email_notifications
        if data.push_notifications is not None:
            prefs.push_notifications = data.push_notifications
        if data.sms_notifications is not None:
            prefs.sms_notifications = data.sms_notifications
    
    await db.commit()
    await db.refresh(prefs)
    return prefs


# ========== Feedback ==========

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    feedback = Feedback(
        id=uuid.uuid4(),
        user_id=user.id,
        type=data.type,
        subject=data.subject,
        description=data.description,
        status="SUBMITTED"
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback
