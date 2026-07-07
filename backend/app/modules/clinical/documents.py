from datetime import datetime, timezone
import uuid
from typing import Dict, Any, List
from app.infrastructure.database.models import Consultation, MedicationOrder, Medication, LabOrder

class ClinicalDocumentGenerator:
    """
    Generates structured clinical documents suitable for ABHA/FHIR integration.
    """
    
    @staticmethod
    def generate_visit_summary(consultation: Consultation, medications: List[Medication] = None, lab_orders: List[LabOrder] = None) -> Dict[str, Any]:
        """Generates a structured visit summary document."""
        patient_info = consultation.patient.patient_profile if hasattr(consultation.patient, 'patient_profile') else None
        doctor = consultation.doctor
        
        doc = {
            "resourceType": "Composition",
            "id": str(uuid.uuid4()),
            "status": "final",
            "type": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "11488-4",
                        "display": "Consultation note"
                    }
                ]
            },
            "subject": {
                "reference": f"Patient/{consultation.patient_id}",
                "display": patient_info.demographics.get("name") if patient_info and patient_info.demographics else "Unknown"
            },
            "date": consultation.created_at.isoformat() if consultation.created_at else datetime.now(timezone.utc).isoformat(),
            "author": [
                {
                    "reference": f"Practitioner/{consultation.doctor_id}",
                    "display": doctor.name if doctor else "Unknown"
                }
            ],
            "title": "Clinical Consultation Summary",
            "section": []
        }
        
        # Clinical Notes Section
        if consultation.notes:
            doc["section"].append({
                "title": "Clinical Notes (SOAP)",
                "text": {
                    "status": "generated",
                    "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">{consultation.notes}</div>"
                }
            })
            
        # Diagnosis
        if consultation.diagnosis:
            doc["section"].append({
                "title": "Diagnosis",
                "text": {
                    "status": "generated",
                    "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">{consultation.diagnosis}</div>"
                }
            })
            
        # Vitals
        if consultation.vitals:
            doc["section"].append({
                "title": "Vitals",
                "entry": [consultation.vitals]
            })
            
        # Medications
        if medications:
            med_entries = []
            for m in medications:
                med_entries.append({
                    "medication": m.name,
                    "dosageInstruction": [
                        {
                            "text": f"{m.dosage}, {m.frequency} for {m.duration}. {m.instructions or ''}".strip()
                        }
                    ]
                })
            doc["section"].append({
                "title": "Medications",
                "entry": med_entries
            })
            
        # Lab Orders
        if lab_orders:
            lab_entries = []
            for l in lab_orders:
                lab_entries.append({
                    "test": l.test_name,
                    "priority": l.priority,
                    "notes": l.notes
                })
            doc["section"].append({
                "title": "Lab Investigations",
                "entry": lab_entries
            })
            
        return doc
    
    @staticmethod
    def generate_prescription(medication_order: MedicationOrder, medications: List[Medication]) -> Dict[str, Any]:
        """Generates a structured electronic prescription document."""
        return {
            "resourceType": "MedicationRequest",
            "id": str(medication_order.id),
            "status": medication_order.status.value.lower(),
            "intent": "order",
            "subject": {
                "reference": f"Patient/{medication_order.patient_id}"
            },
            "requester": {
                "reference": f"Practitioner/{medication_order.doctor_id}"
            },
            "authoredOn": medication_order.created_at.isoformat() if medication_order.created_at else datetime.now(timezone.utc).isoformat(),
            "contained": [
                {
                    "resourceType": "Medication",
                    "id": str(m.id),
                    "code": {
                        "text": m.name
                    }
                } for m in medications
            ]
        }
