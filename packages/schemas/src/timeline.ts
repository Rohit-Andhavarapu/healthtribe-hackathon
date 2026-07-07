import { z } from "zod";

/**
 * 1. Timeline Event Types
 * Defines the comprehensive list of supported medical events in the timeline.
 */
export const TimelineEventTypeSchema = z.enum([
  "consultation",
  "prescription",
  "lab",
  "scan",
  "discharge_summary",
  "diet_plan",
  "vaccination",
  "procedure",
  "hospital_visit",
  "follow_up",
]);

/**
 * 2. Timeline Status
 * Defines the lifecycle state of a TimelineEvent.
 * - pending: Awaiting processing or confirmation.
 * - confirmed: Verified and final (immutable).
 * - needs_review: Flagged by AI due to low confidence; requires human validation.
 * - corrected: Superseded by a newer version (maintains audit trail).
 * - archived: Soft-deleted or hidden.
 */
export const TimelineEventStatusSchema = z.enum([
  "pending",
  "confirmed",
  "needs_review",
  "corrected",
  "archived"
]);

/**
 * 3. Timeline Source
 * Identifies the origin of the data to establish trust boundaries.
 */
export const TimelineSourceSchema = z.enum([
  "doctor",          // Directly entered by a medical professional
  "patient_upload",  // Manually entered or uploaded by patient
  "ai_extraction",   // Extracted by the Medical Timeline Agent from unstructured data
  "lab",             // Ingested directly from a lab integration
  "system",          // Generated automatically by HealthTribe AI rules
  "abha_import"      // Imported from the ABDM/ABHA network
]);

/**
 * 6. Timeline Attachments
 * Represents a physical or digital file associated with the event (e.g., PDF lab report, scan image).
 * Decouples binary storage (Supabase/S3) from the structured payload.
 */
export const TimelineAttachmentSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  mime_type: z.string(),
  url: z.string().url(),
  file_size: z.number().int().positive().describe("Size in bytes"),
  uploaded_at: z.string().datetime(),
});

// === Specific Payload Schemas ===

export const PrescriptionPayloadSchema = z.object({
  medications: z.array(
    z.object({
      name: z.string(),
      dose: z.string().optional(),
      frequency: z.string().optional(),
      duration: z.string().optional(),
    })
  ).default([]),
  notes: z.string().optional(),
});

export const LabPayloadSchema = z.object({
  lab_name: z.string().optional(),
  tests: z.array(
    z.object({
      test_name: z.string(),
      value: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
      reference_range: z.string().optional(),
      is_abnormal: z.boolean().optional(),
    })
  ).default([]),
});

export const ScanPayloadSchema = z.object({
  scan_type: z.string(),
  body_part: z.string().optional(),
  findings: z.string().optional(),
  impression: z.string().optional(),
});

export const ConsultationPayloadSchema = z.object({
  symptoms: z.array(z.string()).default([]),
  diagnosis: z.array(z.string()).default([]),
  advice: z.string().optional(),
});

export const DischargeSummaryPayloadSchema = z.object({
  admission_date: z.string().datetime().optional(),
  discharge_date: z.string().datetime().optional(),
  discharge_diagnosis: z.string().optional(),
  summary: z.string().optional(),
});

export const DietPlanPayloadSchema = z.object({
  meals: z.array(z.string()).default([]),
  notes: z.string().optional()
});

export const VaccinationPayloadSchema = z.object({
  vaccine_name: z.string(),
  dose_number: z.number().int().optional(),
  administered_by: z.string().optional()
});

export const ProcedurePayloadSchema = z.object({
  procedure_name: z.string(),
  body_part: z.string().optional(),
  complications: z.string().optional()
});

export const HospitalVisitPayloadSchema = z.object({
  hospital_name: z.string().optional(),
  department: z.string().optional(),
  reason_for_visit: z.string().optional()
});

export const FollowUpPayloadSchema = z.object({
  follow_up_reason: z.string().optional(),
  recommended_date: z.string().datetime().optional()
});

/**
 * 8. Payload Naming: "structured_payload"
 * Kept "structured_payload" because it explicitly communicates to developers 
 * that this is the AI-validated JSON shape, distinct from raw text notes or binary attachments.
 */
export const TimelineEventPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("consultation"), data: ConsultationPayloadSchema }),
  z.object({ type: z.literal("prescription"), data: PrescriptionPayloadSchema }),
  z.object({ type: z.literal("lab"), data: LabPayloadSchema }),
  z.object({ type: z.literal("scan"), data: ScanPayloadSchema }),
  z.object({ type: z.literal("discharge_summary"), data: DischargeSummaryPayloadSchema }),
  z.object({ type: z.literal("diet_plan"), data: DietPlanPayloadSchema }),
  z.object({ type: z.literal("vaccination"), data: VaccinationPayloadSchema }),
  z.object({ type: z.literal("procedure"), data: ProcedurePayloadSchema }),
  z.object({ type: z.literal("hospital_visit"), data: HospitalVisitPayloadSchema }),
  z.object({ type: z.literal("follow_up"), data: FollowUpPayloadSchema }),
]);

/**
 * The Core TimelineEvent Domain Model.
 * Represents a single node in the patient's immutable medical timeline.
 */
export const TimelineEventSchema = z.object({
  id: z.string().uuid().describe("Primary identifier for the event"),
  patient_id: z.string().uuid().describe("The patient this event belongs to"),
  doctor_id: z.string().uuid().optional().nullable().describe("The doctor responsible, if applicable"),
  
  /**
   * 9. Event Timestamp: "occurred_at"
   * Renamed from "event_date" to "occurred_at" as it better represents the clinical domain 
   * (the moment the event happened in real life, not when it was recorded).
   */
  occurred_at: z.string().datetime().describe("When the medical event actually occurred clinically"),
  
  type: TimelineEventTypeSchema.describe("Categorizes the medical event"),
  status: TimelineEventStatusSchema.describe("Current validation/lifecycle status"),
  source: TimelineSourceSchema.describe("Origin of the event data"),
  
  /**
   * 4. AI Confidence
   * AI-specific field for tracking extraction quality.
   */
  confidence: z.number().min(0).max(1).optional().describe("AI extraction confidence score (0.0 to 1.0). Null for human-entered data."),
  
  /**
   * 5. Timeline Tags
   * Used for fast filtering and categorization without querying the deep payload.
   */
  tags: z.array(z.string()).default([]).describe("Semantic tags (e.g. 'Diabetes', 'CBC')"),
  
  /**
   * 6. Timeline Attachments
   * Array of linked files (PDFs, images) decoupling binary storage from the schema.
   */
  attachments: z.array(TimelineAttachmentSchema).default([]).describe("Linked source documents/images"),
  
  structured_payload: TimelineEventPayloadSchema.describe("The strictly typed, event-specific data"),
  
  /**
   * 7. Metadata
   * Extension point for future attributes (e.g., UI preferences, external IDs) without schema migrations.
   */
  metadata: z.record(z.unknown()).optional().describe("Arbitrary key-value pairs for future non-business logic extensibility"),
  
  supersedes_event_id: z.string().uuid().optional().nullable().describe("Points to the older version if this event is a correction"),
  
  created_at: z.string().datetime().describe("When the record was written to the DB"),
  updated_at: z.string().datetime().describe("When the record was last modified (e.g. status change)"),
});

export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;
export type TimelineEventStatus = z.infer<typeof TimelineEventStatusSchema>;
export type TimelineSource = z.infer<typeof TimelineSourceSchema>;
export type TimelineAttachment = z.infer<typeof TimelineAttachmentSchema>;
export type TimelineEventPayload = z.infer<typeof TimelineEventPayloadSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
