// Shared Timeline types used across the timeline feature

export interface TimelineEvent {
  id: string;
  patient_id: string;
  doctor_id?: string | null;
  occurred_at: string;
  type: string;
  status: string;
  source?: string | null;
  confidence?: number | null;
  tags?: string[];
  structured_payload?: Record<string, unknown>;
  metadata_col?: Record<string, unknown>;
  supersedes_event_id?: string | null;
  created_at?: string;
  updated_at?: string;
  attachments?: Array<{
    id: string;
    file_name: string;
    mime_type: string;
    url: string;
    file_size: number;
    uploaded_at: string;
  }>;
}

export interface TimelineFilters {
  searchQuery: string;
  selectedType: string | null;
  selectedStatus: string | null;
}
