from app.modules.timeline.schemas import TimelineEventCreate
from app.modules.timeline.models import TimelineEvent

class TimelineBuilder:
    @staticmethod
    def build_correction(original_event: TimelineEvent, correction_data: TimelineEventCreate) -> TimelineEventCreate:
        """
        Builds a new TimelineEventCreate object intended to correct an existing event.
        Enforces immutable versioning by setting the supersedes_event_id.
        """
        # Ensure we point to the original event
        correction_data.supersedes_event_id = original_event.id
        
        # A correction should retain the core identity but update the structured payload/status
        correction_data.patient_id = original_event.patient_id
        
        # Hardcode status as corrected on the OLD event (this happens in the Service later),
        # but the new event starts fresh (e.g. confirmed)
        
        return correction_data
