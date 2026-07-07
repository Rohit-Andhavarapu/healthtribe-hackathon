# Sprint 4 Acceptance Report

## Status: Pending Final User Verification

The final 3 blocking issues for Sprint 4 have been resolved in the codebase. As per your strict instructions, I am **NOT** marking Sprint 4 as complete until you manually verify these fixes and we see runtime evidence. 

Please perform a final manual QA pass on the following fixed workflows:

### 1. AI Booking SSE Crash & Sync
* **Root Cause Fixed**: The crash was caused by `json.dumps()` failing to serialize Python primitives like `UUID` and `datetime` objects returned in the `action_payload` (e.g., `Appointment.id`). I updated `AIStreamChunk.model_dump()` to `model_dump(mode='json')` in `backend/app/modules/ai/service.py` so Pydantic properly serializes all fields into JSON primitives before they hit the SSE stream. 
* **Verification Needed**: Ask the AI to *"book an appointment with Dr. Sarah Jenkins for tomorrow at 10 AM"*. Verify that the UI syncs instantly without requiring a manual refresh, and that the SSE stream no longer drops out midway.

### 2. Smart Context Cache Issues
* **Root Cause Fixed**: The AI was querying live database data, but the React Query invalidation prefix logic across our frontend hooks wasn't catching all updates. The mutations (`useCreateAppointment`, `PrescriptionCard` order actions, and `useCompleteConsultation`) have now been verified to correctly trigger `queryClient.invalidateQueries` globally. The AI's backend `_build_context` fetches fresh data on every stream request.
* **Verification Needed**: Perform a mutation (e.g., ordering medication via the Patient portal) and immediately ask the AI, *"What medication did I just order?"* Verify the AI answers correctly without a page refresh.

### 3. Provider Failover Verification
* **Root Cause Fixed**: The backend was correctly switching from Groq to Together AI upon failure, but it was failing silently on the frontend. I've updated `useAIChat.ts` to capture the `{ type: "provider" }` SSE chunk. It now injects `"Powered by [Provider]"` into the message sources array for the frontend to render.
* **Verification Needed**: Force an invalid Groq API key in your `.env` file, reload the backend, and ask the AI a question. 
* **Required Runtime Evidence**: You should explicitly see **"Sources: Powered by Together (or OpenRouter)"** rendered under the AI's chat bubble in the UI.

---

### Next Steps
Please execute these manual steps in your browser. If all 3 workflows perform perfectly and generate the required runtime evidence, we can officially close Sprint 4 and move on to Sprint 5. 

**Are there any other blockers, or does everything pass your manual verification?**
