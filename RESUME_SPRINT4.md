# RESUME SPRINT 4 PROMPT

To resume the exact state of this project in a new chat session, copy and paste the following prompt:

```text
Hello! We are resuming work on the HealthTribe project, an Agentic Healthcare Operating System. We are currently at the tail-end of Sprint 4. 

CRITICAL INSTRUCTIONS BEFORE YOU BEGIN:
1. DO NOT reimplement completed work. Do not restart Sprint 4 from scratch.
2. Inspect the repository first. 
3. Inspect the git diff to understand the latest uncommitted bug fixes (specifically `appointments/service.py` and `PrescriptionCard.tsx`).
4. Read the handoff documents in the root of the repository in this exact order:
   - SPRINT4_HANDOFF.md
   - KNOWN_BUGS.md
   - SPRINT4_QA_CHECKLIST.md
   - MISSED_FEATURES.md
   - NEXT_SESSION.md
5. Continue ONLY from the remaining tasks listed in NEXT_SESSION.md and KNOWN_BUGS.md.
6. Your primary goal is to finish Sprint 4 by performing a complete Production Browser QA using the checklist.
7. Only after Sprint 4 is verified to be genuinely production-ready, you may begin Sprint 5 (ABHA Integration).

ARCHITECTURAL CONSTRAINTS TO KEEP IN MIND:
- Backend authentication (user.role from the verified token) is ALWAYS the source of truth for permissions.
- `client_role` is ONLY a UI context hint, never a permission grant.
- Booking Overlay and AI Booking must strictly share one scheduling service.
- Timeline is the application's absolute source of truth for medical history.
- Smart Context must automatically synchronize (via React Query invalidation) after every mutation.
- Doctor and Patient AI logic/tools must be completely isolated.
- Medication Orders are integrated into the consultation workflow, not a standalone feature.
- Browser QA is absolutely mandatory before marking any sprint complete. Build passing is not enough.
- Seed data must be expansive to support live demonstrations.
- Sprint 5 will focus primarily on ABHA integration after Sprint 4 stabilization.

Please acknowledge these instructions and outline your first step to resume the QA process.
```
