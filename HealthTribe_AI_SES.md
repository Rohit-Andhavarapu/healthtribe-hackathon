# HealthTribe AI — Software Engineering Specification (SES)

**Version:** 1.0
**Document Type:** Software Engineering Specification
**Prepared for:** HealthTribe AI Engineering Team (Hackathon → Startup Build)
**Status:** Ready for Sprint Planning

---

## 1. Executive Summary

HealthTribe AI is an **Agentic AI Healthcare Operating System** — not a chatbot, not an AI doctor, and not a booking app. It is an orchestration layer that sits across the entire patient journey (before, during, and after a hospital visit) and coordinates a team of specialized AI agents that automate the administrative, informational, and continuity-of-care work that today falls on patients, caregivers, and front-desk staff.

The core insight driving this SES: existing healthcare apps (Practo, Apollo, government health portals, Hospital Management Systems) are **transactional** — they book a slot, store a PDF, or digitize a queue. HealthTribe is **continuous** — it remembers, prepares, follows up, and connects every event in a patient's healthcare life into a single longitudinal Medical Timeline, with AI agents actively working in the background on the patient's behalf.

This document translates the product vision into an implementation-ready specification: information architecture, screen-level UX, a 14-agent AI system with defined contracts (inputs/outputs/tools/memory/guardrails), workflow orchestration logic, a Mock ABHA abstraction layer, data model, API surface, security posture, and a phased hackathon-to-production build plan. No features from the original specification have been removed or redesigned — every section below expands the original scope into buildable detail.

---

## 2. Product Vision

**HealthTribe AI is the operating system for a patient's healthcare life.**

Where a hospital's app manages *a visit*, HealthTribe manages *the patient* — across hospitals, across specialties, across years. It does this through:

- **Agent orchestration, not a single monolithic bot.** Specialized agents each own one job (triage, prescription parsing, diet planning, follow-up) and hand off to each other under a Coordinator, mirroring how a real care team works.
- **Human-in-the-loop by design.** Agents prepare, summarize, draft, and recommend. Only licensed doctors diagnose, prescribe, and make clinical decisions. This is the non-negotiable safety boundary of the entire product.
- **Continuity as the differentiator.** Every lab report, prescription, scan, and consultation becomes a structured, connected node on a single Medical Timeline — turning fragmented paper/PDF healthcare history into a queryable, trend-aware record.
- **Family-aware, not just patient-aware.** Healthcare is rarely managed by one person alone. Family Mode and Caregiver Mode are first-class citizens, not settings-page afterthoughts.

**Product boundary statement (must be visible to engineering, design, and legal):** HealthTribe AI does not diagnose, does not prescribe, and does not replace a licensed medical professional. Every AI output that could be construed as clinical guidance is labeled as a **draft for physician review** or **informational, not diagnostic**.

---

## 3. Problem Statement

Patients experience healthcare as a series of disconnected, high-friction events:

1. **Before a visit:** They don't know which doctor/specialty to book, what documents to bring, whether their insurance/benefits cover it, or how to get to the right department once at a large hospital.
2. **During a visit:** Doctors re-ask history the patient already gave elsewhere. Consultations are short; patients forget what was said. Prescriptions are handwritten or given verbally.
3. **After a visit:** Patients don't reliably follow prescriptions, don't know when to get a follow-up lab test, lose paper reports, and have no way to see how a metric (e.g., HbA1c, creatinine) is trending across years and across hospitals.
4. **Across the system:** There is no single place where a patient's full medical history lives in structured, searchable form — it is scattered across WhatsApp PDFs, physical folders, and siloed hospital portals.

Caregivers (parents managing a child's health, children managing elderly parents) face this problem multiplied across several people simultaneously, with no shared visibility.

HealthTribe AI's thesis: **most of this friction is a workflow/orchestration problem, solvable by AI agents working continuously in the background — not a problem that requires replacing doctors.**

---

## 4. Competitive Analysis

| Dimension | **Practo** | **Apollo (24\|7)** | **Govt. Health Apps (ABHA/ABDM apps)** | **Hospital Management Systems (HMS)** | **HealthTribe AI** |
|---|---|---|---|---|---|
| Core model | Doctor discovery + booking marketplace | Hospital-chain super-app (pharmacy, diagnostics, consults) | Health ID + record-linking utility | Back-office system for one hospital | Cross-hospital AI orchestration layer for the patient |
| Continuity of care | Session-based; no persistent timeline | Persistent only within Apollo's own network | Stores links to records, doesn't interpret them | Persistent but siloed to one hospital's patients | Persistent, cross-hospital, AI-interpreted timeline |
| AI involvement | Basic symptom checker (Q&A style) | Chat-based triage within their ecosystem | None (infrastructure layer only) | None (operational software) | Multi-agent system across the entire journey |
| Family/caregiver support | Minimal (profile switching) | Minimal | Not designed for this | Not designed for this | First-class Family Mode + Caregiver Agent |
| Business model dependency | Ad-like doctor listings, lead gen | Hospital network lock-in (drives to Apollo facilities) | Government infrastructure, not patient-facing UX | Sold to hospitals, not patients | Patient-owned continuity layer, hospital-agnostic |
| Pre-visit preparation | None | Limited (basic reminders) | None | None | Visit Preparation Agent generates a pre-visit brief |
| Post-visit follow-through | None | Pharmacy/lab cross-sell only | None | None | Follow-up Agent + Recovery Workflow |

**Positioning statement:** Practo and Apollo optimize *discovery and transaction* within their own network; HMS optimizes *hospital operations*; government apps optimize *interoperability infrastructure*. None of them optimize for **the patient's continuity of care across the entire ecosystem, orchestrated by AI**. That is HealthTribe's white space.

---

## 5. Personas

### 5.1 Patient (primary persona)
- Wants fast answers, minimal typing, and to not repeat their medical history at every visit.
- Trust is fragile — any hint of "AI is diagnosing me" damages adoption. Framing must always be assistive.
- Mobile-first, often low patience for multi-step forms.

### 5.2 Doctor
- Time-constrained (5–10 min per consult in Indian OPD settings). Wants a pre-digested patient summary, not raw chat logs.
- Needs a fast digital prescription flow that's faster than handwriting, or they won't adopt it.
- Distrustful of AI overreach — needs clear "this is a draft, you decide" framing everywhere.

### 5.3 Caregiver
- Frequently managing 2–4 dependents (children, elderly parents) simultaneously.
- Needs a consolidated view across all dependents, not per-person app switching.
- Anxiety-driven usage pattern — design must reduce panic, not add cognitive load.

### 5.4 Admin (hospital-side / platform-side)
- Needs visibility into agent performance, escalations, and content moderation (e.g., flagged AI outputs).
- Manages doctor onboarding, department mapping, and benefits/insurance rule configuration.

---

## 6. Complete User Journey

### 6.1 Before Hospital
1. Patient opens app → lands on Home with AI chat as the hero.
2. Patient describes symptoms conversationally → **Smart Triage Agent** suggests likely specialty + urgency level (not a diagnosis).
3. **Hospital Navigation Agent** recommends hospitals/departments based on triage output, location, and past visit history.
4. **Healthcare Benefits Agent** checks insurance/benefit eligibility for the suggested visit type.
5. Patient books appointment (in-app booking flow, calendar + slot picker).
6. **Visit Preparation Agent** generates a pre-visit brief: what to bring, relevant history to mention, questions to ask the doctor.
7. Notification sent with the brief 24h and 1h before the appointment.

### 6.2 During Consultation
1. Doctor opens Doctor Portal → sees **Doctor Summary Agent**'s pre-consult brief (patient history, current complaint, relevant timeline entries).
2. Optional: **Voice Documentation Agent** transcribes and structures the consultation (with explicit consent capture at session start).
3. Doctor issues a **Digital Prescription** via structured entry, assisted by **Digital Prescription Agent** (autocomplete, dosage/interaction sanity checks — flags only, never blocks).
4. Consultation ends; summary and prescription push to patient's timeline in real time.

### 6.3 After Consultation
1. **Medical Timeline Agent** ingests the new prescription/summary as structured timeline events.
2. **Lab Test Agent** schedules/reminds any ordered labs, and later ingests results into the timeline as trend data.
3. **Diet Plan Agent** generates a plan if relevant to the diagnosis/prescription (e.g., diabetes, hypertension).
4. **Follow-up Agent** schedules check-ins (medication adherence nudges, follow-up appointment reminders).
5. **Caregiver Agent** surfaces a digest to linked caregivers if the patient is a dependent or has opted into Family Mode sharing.

---

## 7. Information Architecture

Following Swiggy's separation-of-experiences model — distinct apps/surfaces, not one mega-screen.

```
HealthTribe AI
├── Patient App
│   ├── Home (AI Chat = hero section, not a tab)
│   ├── Appointments
│   ├── Medical Timeline
│   ├── Lab Tests
│   ├── Prescriptions
│   ├── Diet Plans
│   ├── Benefits
│   ├── Family Vault (Family Mode entry point)
│   └── Profile / Mock ABHA
│
├── Doctor Portal  (fully separate login + UI shell)
│   ├── Today's Queue
│   ├── Patient Summary View
│   ├── Digital Prescription Composer
│   ├── Voice Documentation
│   └── Doctor Profile / Availability
│
├── Admin Portal
│   ├── Doctor & Department Management
│   ├── Agent Monitoring & Escalations
│   ├── Benefits Rule Configuration
│   └── Audit Log Viewer
│
└── Family Mode (surface within Patient App, not a separate app)
    ├── Dependent Switcher
    ├── Shared Timeline View (permissioned)
    └── Caregiver Digest
```

**Navigation principle:** Patient App uses a bottom tab bar with a maximum of 5 destinations (Home, Timeline, Appointments, Vault, Profile). Everything else (Lab Tests, Diet Plans, Benefits) is reachable via cards on Home and via the Timeline, not via additional tabs — this preserves the "minimal UI, separated experiences" philosophy instead of tab-bar overload.

---

## 8. Complete UI/UX Specification

Design language: minimal, whitespace-heavy, "modern medical" — soft neutrals with a single confident accent color, generous 24–32px section padding, card-based content, no dense tables on mobile. Every screen below follows: **Purpose → Components → Navigation → States → Accessibility.**

### 8.1 Home Screen
- **Purpose:** Single entry point; AI chat is the hero, not a hidden feature.
- **Components:** Large chat input pinned near the top ("What's going on today?"), quick-action chips (Book Appointment, View Timeline, Order Lab Test), a horizontally scrollable "Continue where you left off" card row (e.g., pending prescription, upcoming appointment), a Family Mode dependent-switcher pill in the header.
- **Navigation:** Bottom tab bar (Home / Timeline / Appointments / Vault / Profile). No separate "Chat" tab — chat lives on Home permanently.
- **Animations:** Chat input has a subtle pulsing focus state to invite typing; response streaming uses token-by-token reveal, not spinner-then-dump.
- **Loading States:** Skeleton cards for the "continue" row; chat shows a 3-dot typing indicator while the Coordinator Agent is routing.
- **Error States:** If agent orchestration times out, show "Still thinking — this is taking longer than usual" with a manual retry, never a raw error.
- **Accessibility:** Chat input supports voice-to-text; all quick-action chips have ≥44px tap targets and text labels (not icon-only).

### 8.2 AI Chat (Hero Component, not a page)
- **Purpose:** Primary interface for triage, questions, and routing into every other feature.
- **Components:** Message bubbles (user right-aligned, agent left-aligned with a small agent-identity tag e.g. "Triage"), inline action cards rendered *within* the chat (e.g., an appointment-slot picker card, a "View full report" card) rather than forcing navigation away.
- **States:** Typing indicator, "agent handoff" micro-label (e.g., "Connecting you to Benefits Agent…") so the user understands multi-agent behavior instead of perceiving it as inconsistency.
- **Accessibility:** Full screen-reader labeling of inline action cards; text size respects system settings.

### 8.3 Appointments
- **Purpose:** Book, view, reschedule, cancel.
- **Components:** Segmented control (Upcoming / Past), appointment cards with hospital, doctor, time, and a "Prep Brief Ready" badge linking to the Visit Preparation Agent's output.
- **Loading/Error:** Skeleton list on load; if booking fails, inline retry within the same card (no full-page error).

### 8.4 Medical Timeline (flagship — see Section 12 for engine detail)
- **Purpose:** Chronological, filterable view of every medical event.
- **Components:** Vertical timeline with event-type icons (prescription, lab result, scan, consultation note, discharge summary), a trend-chart toggle for numeric lab values, filter chips by category and by hospital.
- **Navigation:** Tapping any event opens a detail sheet (bottom sheet, not full navigation) to preserve timeline scroll position.
- **Empty State:** For new users, an illustrated empty state prompting "Upload your first report" with a scan/upload CTA.
- **Accessibility:** Trend charts include a text-table alternative view for screen readers.

### 8.5 Lab Tests
- **Purpose:** Book tests, view results, see trends.
- **Components:** "Book a test" card row, results list with abnormal-value flags (visual, non-alarming color use — amber not red, to avoid panic-inducing UI), trend sparkline per test type.

### 8.6 Diet Plans
- **Purpose:** Present AI-generated, doctor-context-aware diet guidance.
- **Components:** Weekly plan card, "why this plan" explainer linking back to the relevant diagnosis/prescription, swap-meal action.
- **Guardrail note in UI:** Persistent small-print: "Generated based on your records. Always confirm with your doctor before changing your diet."

### 8.7 Healthcare Benefits
- **Purpose:** Show eligible insurance/benefit coverage for a condition or visit.
- **Components:** Eligibility card list, "Explain this benefit" chat shortcut, document checklist for claims.

### 8.8 Family Vault
- **Purpose:** Manage dependents and shared access.
- **Components:** Dependent cards (photo, name, relation), "Add dependent" flow, per-dependent permission toggles (view-only vs. full caregiver access).

### 8.9 Doctor Portal — Today's Queue
- **Purpose:** Doctor's operational home screen, entirely separate UI shell/login from Patient App.
- **Components:** Queue list sorted by appointment time, each row showing patient name, complaint summary tag, and a "Summary Ready" indicator from the Doctor Summary Agent.
- **Design distinction:** Denser, table-oriented UI (doctors want scannability over whitespace) — intentionally diverges from the patient app's minimal card style, matching real clinical workflow needs.

### 8.10 Doctor Portal — Patient Summary View
- **Purpose:** Pre-consult brief.
- **Components:** Structured summary (chief complaint, relevant history, active medications, relevant timeline excerpts), all clearly labeled "AI-generated draft — verify before use."

### 8.11 Doctor Portal — Digital Prescription Composer
- **Purpose:** Fast structured prescription entry.
- **Components:** Drug autocomplete with dosage templates, interaction/allergy flag banner (non-blocking, dismissible with acknowledgment logged for audit), one-tap "send to patient timeline."

### 8.12 Admin Portal
- **Purpose:** Operational oversight.
- **Components:** Agent health dashboard (latency, failure rate per agent), escalation queue (flagged AI outputs needing human review), doctor/department CRUD, benefits rule editor, audit log search.

---

## 9. Complete Feature Specification

### 9.1 Appointment Booking
Multi-step flow collapsed into a single scrollable card: specialty/doctor selection (pre-filled from Triage Agent if arriving from chat) → slot picker (calendar + time grid) → confirmation. Idempotent booking writes (client generates a booking `idempotency_key` to prevent double-booking on retry). Cancellation triggers a Coordinator event so Follow-up Agent doesn't send stale reminders.

### 9.2 AI Chat
Not a single model call — every message is routed through the **Coordinator Agent**, which classifies intent and either responds directly (FAQ-style) or hands off to a specialist agent, returning both a text response and optional structured "inline action cards" (see 8.2). Full conversation state persists per-patient for context continuity across sessions.

### 9.3 Digital Prescription
Structured object (drug, dosage, frequency, duration, instructions) rather than free text — this is what enables Timeline and Diet Plan agents to consume it programmatically. Doctor-authored only; AI drafts are possible but require explicit doctor confirmation before the record is finalized (never auto-published).

### 9.4 Medical Timeline
See Section 12 — flagship feature, detailed separately.

### 9.5 Lab Tests
Booking integrates with the same slot-picker component as Appointment Booking (component reuse). Results ingestion supports both structured lab-partner API feed (future) and OCR/parse of uploaded PDF reports (hackathon MVP), normalized into a common `LabResult` schema (test name, value, unit, reference range, date, source hospital).

### 9.6 Diet Plans
Generated by the Diet Plan Agent using: active diagnoses, recent lab trends (e.g., HbA1c, lipid panel), known allergies, and dietary preference/restrictions set by the patient. Re-generated on new relevant timeline events (e.g., a new lab result triggers a re-check, not necessarily a full re-plan).

### 9.7 Healthcare Benefits
Rule-based eligibility engine (admin-configured) combined with an LLM explanation layer that translates policy language into plain-language eligibility answers. Source rules are structured data, not free text, so the LLM explains rather than infers eligibility.

### 9.8 Family Vault
Dependent accounts are sub-profiles under a primary account holder, with explicit per-dependent, per-data-category consent (e.g., a caregiver may see appointments but not full lab detail unless granted). Minors and elderly dependents follow different default permission templates.

### 9.9 Caregiver Mode
A view mode, not a separate app, activated by switching the dependent-selector on Home. Caregiver Agent generates a digest (daily/weekly, configurable) summarizing medication adherence, upcoming appointments, and any flagged concerns across all linked dependents in one place.

### 9.10 Mock ABHA
See Section 13 — full detail on the abstraction layer.

### 9.11 Follow-up
Rule + agent hybrid: deterministic reminders (take medication, appointment in 2 days) are scheduled jobs; adaptive follow-up (has the patient's reported symptom pattern changed? should we nudge a re-visit?) is handled by the Follow-up Agent reasoning over timeline deltas.

### 9.12 Notifications
Channels: push (primary), SMS (fallback for low-connectivity users), in-app notification center. Categorized: Appointment, Medication, Lab, Timeline Update, Family/Caregiver Digest — each independently toggleable in settings to avoid notification fatigue, which is a known churn driver in healthcare apps.

---

## 10. Agentic AI Architecture

All agents share a common contract shape for engineering consistency: **Purpose, Inputs, Outputs, Tools, Memory, Failure Handling, Guardrails.** Every agent is a stateless function over persisted memory (no agent holds state in-process between invocations) so any agent can be scaled, retried, or replaced independently.

### 10.1 Coordinator Agent
- **Purpose:** Central router and orchestrator; the "front door" for all chat interactions and the conductor for multi-agent workflows.
- **Inputs:** Raw user message, patient context (profile, active workflow state), conversation history.
- **Outputs:** Direct response, OR a delegation event to one or more specialist agents, plus the final composed response to the user.
- **Tools:** Intent classifier, agent registry/router, workflow-state store.
- **Memory:** Short-term conversation window (session) + long-term reference to patient's profile summary.
- **Failure Handling:** If a delegated agent fails/times out, Coordinator returns a graceful partial response ("I can help with X, but I'm having trouble with Y right now") rather than a hard failure.
- **Guardrails:** Never allowed to output a diagnosis or prescription itself; must always attribute clinical-adjacent content to "AI-assisted, doctor-reviewed" framing.

### 10.2 Patient Intake Agent
- **Purpose:** Structures a new patient's initial profile and history from conversational input.
- **Inputs:** Onboarding chat responses, uploaded documents (if any).
- **Outputs:** Structured `PatientProfile` (demographics, known conditions, allergies, current medications).
- **Tools:** Form-extraction/NLU, document OCR pipeline hook.
- **Memory:** Writes to long-term patient profile store (source of truth for all other agents).
- **Failure Handling:** Partial intake is saved incrementally; never blocks app usage waiting for 100% profile completion.
- **Guardrails:** Explicit consent screen before storing sensitive fields (allergies, conditions); no inference of undisclosed conditions.

### 10.3 Smart Triage Agent
- **Purpose:** Suggests likely specialty and urgency band from symptom description — **not a diagnosis.**
- **Inputs:** Symptom description (chat), patient history context.
- **Outputs:** `{ suggestedSpecialty, urgencyBand: [routine|priority|emergency], rationale }`.
- **Tools:** Symptom-to-specialty mapping model, emergency-keyword safety classifier.
- **Memory:** Reads patient history for context (e.g., known chronic conditions raise urgency weighting).
- **Failure Handling:** On low confidence, defaults to presenting multiple specialty options rather than guessing.
- **Guardrails:** Emergency-keyword detection (chest pain, breathing difficulty, stroke signs, etc.) immediately short-circuits to an emergency-services CTA, bypassing normal booking flow entirely.

### 10.4 Hospital Navigation Agent
- **Purpose:** Recommends hospital/department and helps navigate a facility once there.
- **Inputs:** Triage output, patient location, hospital directory data.
- **Outputs:** Ranked hospital/department list; in-facility directions text (department-to-department, MVP: static hospital maps).
- **Tools:** Hospital directory service, geolocation.
- **Memory:** Patient's preferred/past hospitals for ranking bias.
- **Failure Handling:** Falls back to distance-only ranking if benefits/preference data unavailable.
- **Guardrails:** Never recommends a specific hospital for commercial/sponsored reasons — ranking logic must be transparent and auditable by Admin.

### 10.5 Healthcare Benefits Agent
- **Purpose:** Checks and explains insurance/benefit eligibility.
- **Inputs:** Patient's benefits profile, proposed visit/procedure type.
- **Outputs:** Eligibility summary, required documents checklist.
- **Tools:** Rules engine (admin-configured benefit rules), explanation LLM layer.
- **Memory:** Patient's linked insurance/benefit plan data.
- **Failure Handling:** If rules engine has no matching rule, explicitly says "coverage unclear — contact your provider" rather than guessing.
- **Guardrails:** Never state a coverage determination as final/guaranteed; always frame as an estimate pending provider confirmation.

### 10.6 Visit Preparation Agent
- **Purpose:** Generates the pre-visit brief.
- **Inputs:** Appointment details, relevant timeline history, triage context.
- **Outputs:** Brief: documents to bring, history points to mention, suggested questions.
- **Tools:** Timeline query service.
- **Memory:** Reads (does not write) timeline + appointment data.
- **Failure Handling:** Degrades to a generic checklist if personalized generation fails.
- **Guardrails:** Suggested questions must be neutral/informational, never leading toward a specific diagnosis assumption.

### 10.7 Doctor Summary Agent
- **Purpose:** Produces the doctor-facing pre-consult brief.
- **Inputs:** Full relevant patient timeline, current complaint, chat triage history.
- **Outputs:** Structured clinical-style summary for doctor review (chief complaint, history, active meds, relevant trends).
- **Tools:** Timeline query + summarization model.
- **Memory:** Reads patient timeline; no independent memory of its own.
- **Failure Handling:** If summarization confidence is low, surfaces raw relevant timeline entries instead of a synthesized narrative.
- **Guardrails:** Always labeled "AI-generated — verify against patient" in the Doctor Portal UI; never omits allergy/critical-flag data even if summary is truncated for length.

### 10.8 Voice Documentation Agent
- **Purpose:** Transcribes and structures consultation audio (opt-in).
- **Inputs:** Consultation audio stream, explicit consent flag.
- **Outputs:** Structured consultation notes (chief complaint, exam notes, plan).
- **Tools:** Speech-to-text, medical-entity extraction.
- **Memory:** None persisted beyond the structured note output; raw audio retention policy defined by Admin/legal config.
- **Failure Handling:** If transcription confidence is low on a segment, flags it for doctor manual review rather than guessing content.
- **Guardrails:** Recording cannot start without both doctor and patient consent confirmation captured in-session; hard stop if consent is withdrawn mid-session.

### 10.9 Digital Prescription Agent
- **Purpose:** Assists (not replaces) doctor prescription entry.
- **Inputs:** Doctor's entered drug/dosage, patient allergy and current-medication data.
- **Outputs:** Autocomplete suggestions, non-blocking interaction/allergy warning flags.
- **Tools:** Drug database, interaction-check rules engine.
- **Memory:** Reads patient medication/allergy history.
- **Failure Handling:** If interaction-check service is unavailable, prescription flow still proceeds with a visible "interaction check unavailable" notice — never silently skips the check.
- **Guardrails:** Cannot auto-finalize a prescription; doctor confirmation is mandatory for every prescribed item.

### 10.10 Lab Test Agent
- **Purpose:** Manages lab test booking, reminders, and result ingestion.
- **Inputs:** Doctor-ordered tests or patient self-booking request, uploaded/parsed result documents.
- **Outputs:** Booking confirmations, structured `LabResult` records, trend deltas.
- **Tools:** Lab partner booking API (mocked in MVP), OCR/document-parsing pipeline.
- **Memory:** Writes structured results to Timeline store.
- **Failure Handling:** Low-confidence OCR extraction is flagged for patient/doctor confirmation before being written as a trusted trend point.
- **Guardrails:** Abnormal-value flags use neutral, non-alarming language; never states a clinical conclusion from a single result.

### 10.11 Diet Plan Agent
- **Purpose:** Generates diagnosis/lab-aware diet guidance.
- **Inputs:** Active diagnoses, relevant lab trends, allergies, dietary preferences.
- **Outputs:** Structured weekly plan with rationale.
- **Tools:** Nutrition knowledge base, meal-generation model.
- **Memory:** Reads patient profile + timeline; writes plan versions for history.
- **Failure Handling:** Falls back to general wellness guidance if condition-specific data is insufficient.
- **Guardrails:** Persistent "confirm with your doctor" disclaimer; never recommends drastic caloric/dietary restriction without a corresponding clinical flag from a doctor-authored record.

### 10.12 Medical Timeline Agent
- **Purpose:** The ingestion/normalization engine for the flagship Timeline feature (full detail in Section 12).
- **Inputs:** Prescriptions, lab results, scans, consultation summaries, discharge summaries — from any source agent.
- **Outputs:** Normalized `TimelineEvent` records, trend aggregations.
- **Tools:** Document parsing pipeline, event-normalization schema mapper.
- **Memory:** Owns the Timeline data store (source of truth).
- **Failure Handling:** Unparseable documents are stored as raw attachments with a "needs manual review" status rather than dropped.
- **Guardrails:** Immutable event history — corrections create new versioned entries rather than overwriting, preserving audit integrity.

### 10.13 Follow-up Agent
- **Purpose:** Schedules and adapts post-visit follow-through.
- **Inputs:** Prescription duration/instructions, timeline deltas, appointment history.
- **Outputs:** Reminder schedule, adaptive re-visit suggestions.
- **Tools:** Scheduling/job service, timeline-delta analyzer.
- **Memory:** Reads timeline; writes reminder schedule state.
- **Failure Handling:** Missed/unacknowledged reminders escalate in channel (push → SMS) rather than silently repeating the same push.
- **Guardrails:** Re-visit suggestions are framed as suggestions with rationale, never urgency-manipulative language.

### 10.14 Caregiver Agent
- **Purpose:** Produces caregiver digests across linked dependents.
- **Inputs:** Timeline/appointment/medication data for all dependents the caregiver has permission to view.
- **Outputs:** Digest summary (daily/weekly), flagged-concern callouts.
- **Tools:** Timeline query service, permission/consent checker.
- **Memory:** Reads only within the explicit consent boundary set in Family Vault.
- **Failure Handling:** If a dependent's consent scope is ambiguous, defaults to the most restrictive interpretation (fail closed, not open).
- **Guardrails:** Hard permission check on every read — no agent-level bypass of Family Vault consent settings, ever.

---

## 11. AI Workflows

Grouping the 14 agents into orchestrated workflows the Coordinator manages end-to-end:

### 11.1 Patient Care Workflow
`Coordinator → Patient Intake Agent → Smart Triage Agent → Hospital Navigation Agent → Healthcare Benefits Agent → Visit Preparation Agent`
Triggered by: new symptom chat or "book appointment" intent. Coordinator holds workflow state (`intake → triage → navigation → benefits-check → prep`) and can resume mid-workflow if the user leaves and returns.

### 11.2 Doctor Workflow
`Coordinator (Doctor Portal context) → Doctor Summary Agent → Voice Documentation Agent (optional) → Digital Prescription Agent`
Triggered by: doctor opening a queued appointment. This workflow runs on the Doctor Portal's own orchestration context, isolated from the Patient App's Coordinator session for security separation.

### 11.3 Timeline Workflow
`Any source agent (Prescription/Lab/Voice Documentation) → Medical Timeline Agent → Diet Plan Agent (conditional trigger)`
Event-driven, not user-triggered: any new structured medical event automatically flows into the Timeline Agent, which may conditionally re-trigger the Diet Plan Agent if the event affects an active dietary-relevant condition.

### 11.4 Recovery Workflow
`Medical Timeline Agent → Follow-up Agent → Lab Test Agent (if follow-up labs required)`
Post-consultation, runs on a scheduled basis (daily job) evaluating each active patient's recent timeline deltas against expected recovery/follow-up patterns.

### 11.5 Family Workflow
`Family Vault (consent state) → Caregiver Agent → Coordinator (digest delivery)`
Runs on a configurable cadence per caregiver; strictly reads through the consent layer, never bypassing it, before Coordinator delivers the digest via notification.

**Orchestration principle:** The Coordinator Agent is the only agent allowed to initiate cross-workflow handoffs (e.g., Patient Care Workflow completing an appointment triggers eventual entry into the Timeline Workflow). Individual specialist agents never call each other directly — this keeps the system debuggable and prevents circular/hidden dependencies, a critical requirement for the Admin Portal's Agent Monitoring dashboard to be meaningful.

---

## 12. Medical Timeline (Flagship Feature — Deep Detail)

The Medical Timeline is the structural core of HealthTribe's differentiation. Every other agent either writes to it or reads from it. It must be engineered as a **normalized event store**, not a document repository.

### 12.1 How reports are parsed
1. Upload/ingest (patient upload, doctor push, or lab-partner feed) lands in a raw intake queue.
2. Document classification step determines type: prescription, lab report, scan report, discharge summary.
3. Type-specific extraction pipeline runs:
   - **Prescriptions:** structured-field extraction (drug, dose, frequency, duration) via the Digital Prescription Agent's schema, or OCR + NLU extraction for scanned/handwritten uploads.
   - **Lab reports:** table/value extraction — test name, value, unit, reference range, date — normalized against a master test-name dictionary (so "HbA1c" and "Hemoglobin A1c" resolve to the same trend series).
   - **Scans:** metadata extraction (scan type, body area, date, radiologist notes text) — image itself stored as an attachment, not parsed for clinical content in MVP.
4. Extraction confidence score attached to every field; anything below threshold is flagged `needs_review` and surfaced to the patient/doctor for confirmation before being trusted in trend calculations.

### 12.2 How prescriptions become events
Every doctor-finalized prescription is written as one `TimelineEvent` of type `prescription`, containing an array of structured drug entries. This event automatically:
- Creates linked `medication_active` state entries used by the Follow-up Agent for adherence reminders.
- Triggers the Diet Plan Agent conditional check if the prescribed condition is diet-relevant (e.g., diabetes, hypertension, renal conditions).
- Is immutable once finalized — any doctor correction creates a new versioned event linked to the original (`supersedes` relationship), never a silent overwrite, preserving a full audit trail.

### 12.3 How lab reports become trends
Each normalized lab value is stored as a `LabDataPoint` tied to a `test_type_id` (from the master dictionary). The Timeline aggregates all points for a given `test_type_id` per patient into a **trend series**, rendered as a sparkline/chart in the Timeline UI. Reference-range breaches are flagged at the data-point level (not inferred narratively) so trend display stays factual and non-alarming.

### 12.4 How scans become timeline entries
Scans are stored as `TimelineEvent` type `scan`, with metadata (type, date, body area) as the primary structured content and the associated report/image as an attachment. Scans link to the ordering consultation event (if applicable) via a `relatedEventId`, so the Timeline UI can show "Ordered during: [consultation date]" context.

### 12.5 How doctors consume summaries
The Doctor Summary Agent queries the Timeline for the most clinically relevant subset (recent events + anything tagged `chronic`/`ongoing`) rather than the full history, to respect the 5–10 minute consult window. Doctors can expand to "full history" on demand, which renders the raw chronological Timeline view inside the Doctor Portal.

### 12.6 How patients consume history
Patient-facing Timeline defaults to a simplified, plain-language rendering (e.g., "Blood sugar check — slightly high" rather than raw lab codes), with a "view full details" expand per event for patients who want the raw structured data. Filter chips (by category, by hospital, by date range) let patients narrow the view; a search bar supports free-text search across event notes and drug names.

### 12.7 Data model backbone
```
TimelineEvent
 ├─ id, patientId, type [prescription|lab|scan|consultation_note|discharge_summary]
 ├─ eventDate, sourceHospitalId, sourceDoctorId (nullable)
 ├─ structuredPayload (type-specific schema)
 ├─ confidenceScore, reviewStatus [confirmed|needs_review]
 ├─ supersedesEventId (nullable, for corrections)
 └─ attachments[] (raw files)

LabDataPoint
 ├─ id, patientId, testTypeId, value, unit, referenceRangeLow/High
 ├─ eventId (FK to TimelineEvent), recordedDate
```

---

## 13. Mock ABHA (Simulated Health-ID Layer)

We are **not** integrating the real Ayushman Bharat Health Account (ABHA) APIs for the hackathon build. Instead, we build a **Mock ABHA Service** that mirrors the real architecture's shape so a future swap to official APIs is a configuration change, not a rewrite.

### 13.1 What it mirrors
The real ABDM (Ayushman Bharat Digital Mission) architecture is built around a Health ID that links a patient's records across a federated network of health facilities via consent-based data exchange. Our mock reproduces the **interface contract**, not the federation network itself:

- **Medical History** — mocked as an aggregation endpoint over our own Timeline store, shaped like an external federated response.
- **Lab Reports** — mocked as a `GET /mock-abha/patient/{id}/lab-reports` returning the same shape a real ABDM Health Information Provider (HIP) response would use.
- **Prescriptions** — same pattern, sourced internally.
- **Scans** — same pattern.
- **Allergies** — sourced from Patient Intake Agent data, exposed in the mock ABHA shape.
- **Healthcare Benefits** — sourced from the Healthcare Benefits Agent's rules engine, exposed in mock shape.
- **Discharge Summaries** — sourced from Timeline discharge-summary events.

### 13.2 Why this abstraction matters
By building an internal `AbhaAdapter` interface with a single implementation (`MockAbhaAdapter`) that all agents/services call through — rather than agents querying our own database directly — the **only** change required to plug in real ABDM APIs later is writing a `RealAbhaAdapter` implementing the same interface. No agent logic, no UI, and no data model changes are required. This is a standard adapter/port pattern and is the single most important architectural decision for future-proofing regulatory integration.

```
Agents / Services
       │
       ▼
  AbhaAdapter (interface)
       │
   ┌───┴────┐
   │        │
MockAbhaAdapter   RealAbhaAdapter (future)
   │                    │
Internal DB      Official ABDM Gateway
```

### 13.3 Consent simulation
Even in mock form, we simulate the ABDM consent-artifact model: every mock ABHA data request generates a `ConsentRecord` (purpose, requester, scope, expiry) before data is returned — training the system's data flow and the Admin audit log to already behave like the regulated real-world model, so consent UX doesn't need to be redesigned later.

---

## 14. Security

### 14.1 Role-Based Access Control (RBAC)
Roles: `patient`, `caregiver`, `doctor`, `admin`. Each role maps to a scoped permission set enforced at the API gateway layer (not just hidden in UI). Doctor Portal and Admin Portal use entirely separate auth contexts/tokens from the Patient App, per the product's "separate login and UI" requirement — this is also a security boundary, not just a UX one.

### 14.2 Consent
Every cross-boundary data read (caregiver viewing a dependent, doctor viewing timeline history, mock ABHA data requests) generates an explicit `ConsentRecord`. Consent defaults to the most restrictive scope and requires explicit action to broaden — never opt-out, always opt-in.

### 14.3 Encryption
- **In transit:** TLS 1.2+ everywhere, no exceptions, including internal service-to-service calls.
- **At rest:** Field-level encryption for sensitive PII/PHI fields (allergies, conditions, prescriptions, uploaded documents) in addition to standard database-at-rest encryption.

### 14.4 Audit Logs
Every read/write to a `TimelineEvent`, every prescription finalization, every consent grant/revocation, and every Admin Portal action is written to an append-only audit log with actor, action, timestamp, and target resource — queryable in the Admin Portal's Audit Log Viewer.

### 14.5 HIPAA-Inspired Architecture (not a compliance claim)
Although operating in India (where DPDP Act 2023 is the relevant framework, not HIPAA), we adopt HIPAA-style engineering discipline as a quality bar: minimum-necessary access, audit trails, breach-notification-ready logging, and a documented data-flow map — because it is a globally recognized rigor standard for hackathon/demo credibility, while our actual compliance target is India's DPDP Act and future ABDM data-sharing requirements.

### 14.6 Medical Record Protection
Timeline events are immutable/versioned (see 12.2) specifically to prevent tampering with medical history — a correction always creates a new version, never a destructive overwrite, which also supports legal defensibility for doctor-authored records.

### 14.7 File Upload Validation
All uploads (lab reports, scans, prescriptions) pass: file-type allowlist check, size limit, malware/virus scan, and are stored in isolated object storage (not directly in the app database) with signed, time-limited access URLs — never permanently public URLs.

### 14.8 PII Protection
PII fields are never included in analytics/logging pipelines by default (structured logging redacts known PII field names at the logging middleware level, not left to per-developer discipline). Any AI agent prompt sent to an LLM provider is scrubbed of directly identifying fields (name, contact info) where the agent's task doesn't require them — e.g., Diet Plan Agent needs conditions/labs, not the patient's name.

---

## 15. Database Design

### 15.1 High-level ER structure

**Core identity & access**
- `User` (id, role, authProviderRef, createdAt)
- `PatientProfile` (id, userId FK, demographics, allergies[], chronicConditions[])
- `Dependent` (id, primaryUserId FK, patientProfileId FK, relation)
- `ConsentRecord` (id, granterId, requesterId, scope, purpose, expiry, status)

**Care delivery**
- `Doctor` (id, userId FK, specialty, hospitalId FK, licenseRef)
- `Hospital` (id, name, departments[], location)
- `Appointment` (id, patientId FK, doctorId FK, hospitalId FK, slotTime, status)

**Medical record (Timeline domain — see Section 12.7)**
- `TimelineEvent` (id, patientId FK, type, eventDate, sourceHospitalId, structuredPayload JSON, confidenceScore, reviewStatus, supersedesEventId)
- `LabDataPoint` (id, patientId FK, testTypeId FK, eventId FK, value, unit, referenceRangeLow/High, recordedDate)
- `TestTypeDictionary` (id, canonicalName, aliases[], unit, defaultReferenceRange)

**Agentic layer**
- `AgentRun` (id, agentName, patientId FK nullable, input JSON, output JSON, status, latencyMs, createdAt) — powers Admin Portal's Agent Monitoring dashboard.
- `WorkflowState` (id, workflowType, patientId FK, currentStep, contextJSON, updatedAt) — powers Coordinator's resumable multi-agent workflows (Section 11).

**Family & benefits**
- `FamilyLink` (id, caregiverUserId FK, dependentId FK, permissionScope JSON)
- `BenefitPlan` (id, patientId FK, provider, ruleSetId FK)
- `BenefitRuleSet` (id, name, rulesJSON) — admin-configured, consumed by Healthcare Benefits Agent.

### 15.2 Relationships
- `PatientProfile 1—N TimelineEvent`, `TimelineEvent 1—N LabDataPoint` (a lab report event can contain multiple test values).
- `TimelineEvent.supersedesEventId` is a self-referential FK enabling the immutable-versioning pattern.
- `Dependent N—N caregiver User` via `FamilyLink`, carrying the permission scope that the Caregiver Agent enforces at read time.
- `Appointment` links `PatientProfile`, `Doctor`, and `Hospital`, and optionally a `WorkflowState` for the Patient Care Workflow that produced it.

### 15.3 Indexes
- `TimelineEvent`: composite index on `(patientId, eventDate DESC)` for the primary Timeline scroll query; index on `(patientId, type)` for filtered views.
- `LabDataPoint`: composite index on `(patientId, testTypeId, recordedDate)` for trend-series queries.
- `AgentRun`: index on `(agentName, createdAt DESC)` for Admin monitoring dashboards.
- `ConsentRecord`: index on `(requesterId, status, expiry)` for fast consent-validity checks on every cross-boundary read.

### 15.4 Search
Full-text search index (e.g., Postgres `tsvector` or an external search service) over `TimelineEvent.structuredPayload` text fields and drug names, scoped always by `patientId` — search must never cross patient boundaries, enforced at the query layer, not just the UI filter.

### 15.5 Timeline Storage Strategy
Structured fields (dates, types, drug names, lab values) live in relational tables for fast filtered/trend queries. Large unstructured content (raw OCR text, attachment blobs) lives in object storage referenced by ID — keeping the relational Timeline query path fast regardless of attachment volume.

---

## 16. API Overview

High-level REST-style surface (agent-facing endpoints are internal service calls, not public API):

```
Auth
 POST /auth/login (role-aware: patient | doctor | admin)
 POST /auth/refresh

Patient App
 GET  /patients/{id}/profile
 GET  /patients/{id}/timeline?type=&from=&to=
 GET  /timeline-events/{id}
 POST /appointments
 GET  /appointments?patientId=
 POST /lab-tests/bookings
 GET  /lab-tests/results?patientId=
 GET  /diet-plans/current?patientId=
 GET  /benefits/eligibility?patientId=&visitType=

Chat / Agents (Coordinator entry point)
 POST /chat/message           → routes through Coordinator Agent
 GET  /chat/history?patientId=

Doctor Portal
 GET  /doctor/queue?doctorId=&date=
 GET  /doctor/patients/{id}/summary   → Doctor Summary Agent output
 POST /doctor/prescriptions
 POST /doctor/voice-sessions/start
 POST /doctor/voice-sessions/{id}/stop

Family
 POST /family/dependents
 GET  /family/digest?caregiverId=
 PATCH /family/links/{id}/permissions

Mock ABHA
 GET  /mock-abha/patient/{id}/medical-history
 GET  /mock-abha/patient/{id}/lab-reports
 GET  /mock-abha/patient/{id}/prescriptions
 GET  /mock-abha/patient/{id}/benefits

Admin
 GET  /admin/agents/runs?agentName=&status=
 GET  /admin/audit-logs?actor=&action=&from=
 CRUD /admin/doctors, /admin/hospitals, /admin/benefit-rulesets
```

**Convention:** all list endpoints support cursor-based pagination; all write endpoints accept an idempotency key header for safe retries (critical for booking/prescription flows on unreliable mobile networks).

---

## 17. Deployment Architecture

```
                        ┌──────────────────────┐
                        │   Client Apps         │
                        │  Patient App (mobile/web)
                        │  Doctor Portal (web)   │
                        │  Admin Portal (web)    │
                        └──────────┬────────────┘
                                   │ HTTPS
                        ┌──────────▼────────────┐
                        │     API Gateway        │
                        │ (auth, RBAC, rate-limit)│
                        └──────────┬────────────┘
                ┌──────────────────┼──────────────────────┐
                │                  │                       │
     ┌──────────▼─────────┐ ┌──────▼───────────┐  ┌────────▼─────────┐
     │ Core App Services   │ │ Agent Orchestration│  │ Mock ABHA Service │
     │ (appointments, users,│ │ Layer (Coordinator +│  │ (AbhaAdapter impl) │
     │  timeline CRUD, etc.)│ │ 14 specialist agents)│  └────────┬─────────┘
     └──────────┬──────────┘ └──────┬───────────┘           │
                │                   │  calls LLM provider(s)  │
     ┌──────────▼──────────┐ ┌──────▼───────────┐            │
     │ Primary Relational DB│ │ Vector/Context Store│          │
     │ (Postgres)            │ │ (for RAG over timeline)│      │
     └──────────┬──────────┘ └──────────────────┘            │
                │                                              │
     ┌──────────▼──────────┐                        ┌──────────▼─────────┐
     │ Object Storage        │                        │ Job Scheduler       │
     │ (reports, scans, docs) │                        │ (reminders, Recovery │
     └───────────────────────┘                        │  Workflow cron jobs) │
                                                        └────────────────────┘
```

- **API Gateway** is the single enforcement point for RBAC and the Doctor/Admin/Patient auth-context separation described in Section 14.1.
- **Agent Orchestration Layer** is deployed as its own service tier so agent scaling (LLM call concurrency) is independent from core CRUD service scaling.
- **Mock ABHA Service** is deployed as an isolated service specifically so it can later be swapped for a real ABDM gateway integration without touching core services (Section 13.2).
- **Job Scheduler** drives the Recovery Workflow's daily evaluation batch and all reminder/notification cadences.
- Environments: `dev → staging → prod`, with the Mock ABHA Service always active in dev/staging and gated behind a feature flag in prod once real ABDM integration begins.

---

## 18. Hackathon MVP

### 18.1 Must Build (Demo-Critical)
- Patient App: Home with AI Chat hero, Appointments (booking + list), Medical Timeline (view + upload/parse for prescriptions and lab reports), basic Family Vault (add dependent + view-only switch).
- Doctor Portal: separate login, Today's Queue, Patient Summary View, Digital Prescription Composer (structured entry, no voice yet).
- Agents (functioning, even if simplified): Coordinator, Patient Intake, Smart Triage, Doctor Summary, Digital Prescription, Medical Timeline Agent.
- Mock ABHA Service with the four core endpoints (medical history, lab reports, prescriptions, benefits) backed by internal data.
- Core security: RBAC at gateway level, basic audit logging, encrypted storage for uploads.

### 18.2 Should Build (Strong Demo Polish, Time-Permitting)
- Hospital Navigation Agent, Healthcare Benefits Agent, Visit Preparation Agent.
- Diet Plan Agent with basic condition-aware plan generation.
- Follow-up Agent with simple scheduled reminders (no adaptive re-visit logic yet).
- Admin Portal: Agent Monitoring dashboard (read-only) + Audit Log Viewer.
- Lab trend charts (sparkline view) in the Timeline.

### 18.3 Future Roadmap (Post-Hackathon)
- Voice Documentation Agent with real-time consultation transcription.
- Caregiver Agent with full digest generation and adaptive concern-flagging.
- Real ABDM/ABHA integration via the `RealAbhaAdapter` (swap-in, per Section 13.2).
- Adaptive Follow-up Agent logic analyzing timeline deltas for re-visit suggestions.
- Multi-hospital lab-partner API integrations replacing OCR-only result ingestion.
- Full HIPAA/DPDP-grade compliance audit and penetration testing.
- Native mobile apps (if hackathon build is web-first) and offline-first support for low-connectivity regions.

---

## Appendix: Non-Negotiable Design Principles (for engineering onboarding)

1. **AI drafts, doctors decide.** Every clinical-adjacent AI output is labeled and requires human confirmation before becoming a source-of-truth record.
2. **Consent is fail-closed.** Ambiguous permission scope always resolves to the most restrictive interpretation.
3. **Immutable medical history.** Corrections version forward; nothing is silently overwritten.
4. **Adapter pattern for regulated integrations.** Mock ABHA today, real ABDM tomorrow, zero agent-logic changes required.
5. **Separated experiences, not one mega-app.** Patient App, Doctor Portal, and Admin Portal are UI-, auth-, and workflow-isolated, mirroring the Swiggy multi-app philosophy specified in the product vision.

*End of Software Engineering Specification.*
