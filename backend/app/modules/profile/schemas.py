from pydantic import BaseModel
from typing import List, Optional
import uuid

# Existing schemas
class PatientProfileResponse(BaseModel):
    id: str
    user_id: str
    demographics: Optional[dict] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    
    model_config = {"from_attributes": True}

class PatientProfileUpdate(BaseModel):
    demographics: Optional[dict] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None


# Emergency Contact schemas
class EmergencyContactCreate(BaseModel):
    name: str
    relationship: str
    phone_number: str
    is_primary: bool = False

class EmergencyContactUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone_number: Optional[str] = None
    is_primary: Optional[bool] = None

class EmergencyContactResponse(BaseModel):
    id: str
    patient_id: str
    name: str
    relationship: str
    phone_number: str
    is_primary: bool
    
    model_config = {"from_attributes": True}


# Medical Information schemas
class MedicalInformationUpdate(BaseModel):
    conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    chronic_diseases: Optional[List[str]] = None
    past_surgeries: Optional[List[str]] = None
    medical_notes: Optional[str] = None

class MedicalInformationResponse(BaseModel):
    id: str
    patient_id: str
    conditions: List[str]
    allergies: List[str]
    chronic_diseases: List[str]
    past_surgeries: List[str]
    medical_notes: Optional[str]
    
    model_config = {"from_attributes": True}


# Notification Preferences schemas
class NotificationPreferencesUpdate(BaseModel):
    appointment_reminders: Optional[bool] = None
    medication_reminders: Optional[bool] = None
    lab_report_notifications: Optional[bool] = None
    order_updates: Optional[bool] = None
    emergency_alerts: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None

class NotificationPreferencesResponse(BaseModel):
    id: str
    patient_id: str
    appointment_reminders: bool
    medication_reminders: bool
    lab_report_notifications: bool
    order_updates: bool
    emergency_alerts: bool
    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool
    
    model_config = {"from_attributes": True}


# Feedback schemas
class FeedbackCreate(BaseModel):
    type: str  # 'BUG', 'FEEDBACK', 'FEATURE_REQUEST'
    subject: str
    description: str

class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    type: str
    subject: str
    description: str
    status: str
    created_at: str
    
    model_config = {"from_attributes": True}
