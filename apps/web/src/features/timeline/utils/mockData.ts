import { TimelineEvent } from "@healthtribe/schemas";
import { v4 as uuidv4 } from "uuid";

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: uuidv4(),
    patient_id: uuidv4(),
    occurred_at: new Date().toISOString(),
    type: "prescription",
    status: "confirmed",
    source: "doctor",
    tags: ["Cardiology", "Follow-up"],
    attachments: [],
    structured_payload: {
      type: "prescription",
      data: {
        medications: [
          { name: "Metformin", dose: "500mg", frequency: "Twice daily" },
          { name: "Atorvastatin", dose: "20mg", frequency: "Once daily" }
        ],
        notes: "Continue diet and exercise"
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    patient_id: uuidv4(),
    occurred_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: "lab",
    status: "needs_review",
    source: "ai_extraction",
    confidence: 0.75,
    tags: ["Blood Work", "CBC"],
    attachments: [],
    structured_payload: {
      type: "lab",
      data: {
        lab_name: "City Path Labs",
        tests: [
          { test_name: "Hemoglobin", value: 13.5, unit: "g/dL", reference_range: "13.0-17.0" },
          { test_name: "Fasting Blood Sugar", value: 110, unit: "mg/dL", is_abnormal: true }
        ]
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
