# HealthTribe AI — Architecture Review (CTO Assessment)
**Reviewing:** TDD v1.0 (companion: SES v1.0)
**Reviewer role:** CTO, pre-development architecture gate
**Scope:** Engineering only. Product vision, features, and personas are unchanged.

---

## How to read this review

TDD v1.0 is not a naive first draft — it already has real engineering thought behind it (layered backend, vertical-slice frontend, immutable timeline versioning, its own internal "CTO Review" appendix). The issues below are the ones that matter for a team about to spend 48 hackathon hours plus a post-hackathon scale-up building this, ranked by what actually threatens delivery or safety versus what's just future-proofing that can wait.

Severity key: **Critical** = will break the build, the timeline, or patient safety/privacy if unaddressed. **High** = will cause real pain within weeks. **Medium** = technical debt that should be fixed before the item it touches ships broadly. **Low** = worth doing, not urgent.

---

## 1. Unnecessary AI Usage / Agent Over-Proliferation

### Issue 1.1 — 14 "agents" is agent-washing, not agentic design
**Problem:** SES §10 defines 14 LangGraph agent nodes. Of these, at least 8 (Hospital Navigation, Healthcare Benefits, Visit Preparation, Digital Prescription, Lab Test, Follow-up, Caregiver, and arguably Voice Documentation) contain no branching reasoning an LLM is needed for — they're a ranking function, a rules-engine lookup, a checklist template, an interaction-table join, a booking API call, a cron-scheduled reminder, a permission-scoped query, and a speech-to-text call, respectively.
**Why it's a problem:** Every node modeled as a LangGraph agent inherits LLM latency (seconds, not milliseconds), LLM cost, non-determinism that has to be re-tested every prompt change, and a failure mode (hallucination) that a pure function literally cannot have. For healthcare-adjacent features like drug-interaction warnings or benefits eligibility, non-determinism is a liability, not a feature — you *want* the same input to always produce the same output, which is the opposite of what routing something through an LLM buys you.
**Severity:** Critical (drives cost, latency, hackathon feasibility, and safety simultaneously).
**Recommendation:** Collapse to 6 true AI agents where free-text understanding or generation is the actual job — Coordinator, Patient Intake, Smart Triage (hybrid), Doctor Summary, Medical Timeline (extraction + narrative), Diet Plan. Reimplement the other 8 as deterministic backend services that the Coordinator can still call as workflow steps. See TDD v2.0 §2.
**Expected Improvement:** Removes ~8 LLM round-trips from common-path latency, cuts LLM API spend by a large margin (rules-engine and templated-text paths are free besides infra cost), and converts 8 failure modes from "did the model hallucinate" to "did the function throw," which is trivially unit-testable.

### Issue 1.2 — "RAG" label applied to structured lookups
**Problem:** Doctor Summary and Visit Preparation are described as reading "the Timeline" via a "Timeline query service," which is structured relational/SQL data (events, lab points, typed fields) — yet the stack commits to pgvector and the document positions retrieval broadly as RAG.
**Why it's a problem:** Building embedding, chunking, and vector-index infrastructure for data that's already perfectly queryable by patient_id/date/type is wasted hackathon time and adds a second, harder-to-debug retrieval path (semantic drift, embedding-model versioning cliff, the doc's own Weakness #2) for no accuracy gain over a `WHERE patient_id = ... ORDER BY event_date` query with clinical filters.
**Severity:** High.
**Recommendation:** Reserve pgvector/RAG for the one place it earns its keep — semantic search across unstructured note/attachment text and the Diet Plan Agent's nutrition knowledge base. Everything clinically structured (labs, meds, events) is retrieved via typed SQL through the Timeline query service, not embeddings.
**Expected Improvement:** Removes an entire embedding pipeline from the hackathon critical path for the features that don't need it; the two agents that do real RAG (Diet Plan, and optionally Doctor Summary's free-text note search) get a purpose-built, well-tuned index instead of a shared, diluted one.

---

## 2. Event Architecture, LangGraph & Async Infrastructure

### Issue 2.1 — Three async subsystems (Event Bus, Celery, Scheduler) plus a second deployable service, on a 48-hour clock
**Problem:** v1.0 stands up a Redis Streams/Kafka-flavored Event Bus, Celery workers across four queues, Celery Beat, and a *separately deployed* LangGraph "Agent Orchestrator" service communicating over the network with the Core API — five moving infrastructure pieces before a single feature is built.
**Why it's a problem:** Every one of these is a place a hackathon team loses hours to misconfiguration (broker connection strings, queue routing, health checks for a second service, cross-service auth between Core API and Agent Orchestrator). None of it is wrong post-scale, but sequencing it as day-one infrastructure inverts the "walking skeleton first" principle the doc itself later recommends in §21.8.
**Severity:** Critical for the 48-hour constraint specifically.
**Recommendation:** Run LangGraph **in-process** inside the same FastAPI monolith for the hackathon (it's a Python library, not a service) and use Celery for anything actually long-running (OCR, LLM calls that must survive a request timeout). Use Redis Pub/Sub directly for the "notify other modules" need instead of a formal Event Bus abstraction; introduce the transactional-outbox/Streams pattern only when you have a second consumer that actually needs replay semantics.
**Severity:** High.
**Expected Improvement:** Two deployables (web app + worker) instead of four+, no cross-service auth to build, and the extraction path to a separate agent service later is still open because the module boundary (not the process boundary) is what's been designed correctly.

### Issue 2.2 — LangGraph checkpoint store has no retention policy
**Problem:** Already flagged in the source document's own review (Weakness #1) but not designed into any milestone.
**Why it's a problem:** Unbounded state-per-node-transition persistence is the kind of thing that's invisible for the first 10,000 rows and then shows up as a production incident.
**Severity:** Medium (not hackathon-blocking, but must not be forgotten post-launch).
**Recommendation:** Carry forward into v2.0 as an explicit, scheduled Milestone-9 task (archive-to-cold-storage job), not a footnote.
**Expected Improvement:** Prevents a known, well-understood failure mode from becoming a surprise.

---

## 3. Database & API Design

### Issue 3.1 — `structuredPayload` as untyped JSONB across 4+ event types
**Problem:** `TimelineEvent.structuredPayload` holds prescription, lab, scan, and discharge-summary shapes in one polymorphic JSONB column with no schema enforcement at the DB layer.
**Why it's a problem:** Pydantic validates on the way in through the API, but any direct DB write (a migration, a backfill script, a Celery task with a bug) can write a malformed payload that the API layer never sees, and there's no DB-level guarantee the `type` column and `structuredPayload` shape stay in sync.
**Severity:** Medium.
**Recommendation:** Add a Postgres `CHECK` constraint (or trigger) validating `structuredPayload` against the expected keys for `type`, and generate the four payload schemas from a single Pydantic discriminated union so frontend types, API schema, and DB constraint all derive from one source of truth.
**Expected Improvement:** Converts a class of silent-corruption bugs into loud, immediate write-time failures — important given TimelineEvent is immutable/versioned and a bad write becomes a permanent bad version.

### Issue 3.2 — No explicit API versioning or OpenAPI-first contract stated
**Problem:** The document describes endpoints narratively but never states a versioning scheme (`/v1/...`) or that the OpenAPI schema is the generation source for `packages/types` and `packages/api-client` — it's implied by "generated from OpenAPI schema" in §2.3 but never made a rule.
**Why it's a problem:** For a system built partly by AI coding agents working across many files, an unversioned, implicit contract is exactly where independently-generated frontend and backend code drifts without anyone noticing until runtime.
**Severity:** Medium.
**Recommendation:** Make OpenAPI-first explicit and mandatory: every router change regenerates `packages/types`, CI fails if generated types are stale relative to the schema.
**Expected Improvement:** Removes an entire class of "frontend and backend silently disagree" bugs that are especially likely when multiple agents/engineers work in parallel.

---

## 4. Security

### Issue 4.1 — Self-built JWT/refresh-token auth in a 48-hour healthcare build
**Problem:** §1.7 designs a full custom JWT issuance, rotation, and Redis-backed revocation flow to be built from scratch.
**Why it's a problem:** Auth is the single highest-consequence thing to get subtly wrong in a healthcare app (a token-scoping bug is a PHI leak), and it's also one of the least differentiated things to build yourselves under time pressure — every hour spent here is an hour not spent on the Timeline, which is the actual product.
**Severity:** High.
**Recommendation:** Use a managed auth provider (Clerk) for session issuance, MFA, and social/email login, and keep only the RBAC-role-to-permission mapping and consent-boundary logic (the actually-domain-specific part) as custom code in the Service Layer.
**Expected Improvement:** Removes the highest-risk, lowest-differentiation code from the critical path entirely; the team's security review time goes to the parts of the system that are actually unique to HealthTribe (consent checker, immutable versioning) instead of being split with generic token-rotation code.

### Issue 4.2 — No centralized AI Safety Gateway
**Problem:** Guardrails (§10.x in SES) are specified per-agent as prose ("never states a diagnosis," "never omits allergy data") rather than as a single enforced component every LLM call passes through.
**Why it's a problem:** Prose guardrails inside a prompt are a *request* to the model, not an enforcement mechanism — they degrade under prompt drift, model upgrades, and are impossible to unit test as a system property. There's also no stated defense against injected instructions arriving inside OCR'd document text or patient free-text that then reaches a downstream agent's prompt.
**Severity:** Critical (patient-safety and prompt-injection surface).
**Recommendation:** Introduce an explicit AI Safety Gateway all LLM input/output passes through: input-side PII/instruction sanitization on any OCR'd or user-supplied text before it enters a prompt, and output-side structural validation (a diagnosis-claim classifier, an allergy-omission check, a required-disclaimer check) before any agent output reaches a client. Make this a shared module, not per-agent prompt text.
**Expected Improvement:** Turns "the model was told not to X" into "the system structurally cannot ship X," which is the only guarantee worth making in a clinical-adjacent product, and gives the Admin Portal a single place to monitor guardrail trips.

---

## 5. Frontend & Hackathon Feasibility

### Issue 5.1 — Three separate Next.js apps from day one
**Problem:** Patient App, Doctor Portal, and Admin Portal are three separately deployed Next.js applications.
**Why it's a problem:** This is the right end-state for auth-boundary separation and independent release cadence, but it's three `package.json`s, three CI pipelines, and three Vercel projects to stand up before any feature exists — real overhead inside a 48-hour window, especially since the Admin Portal has no demo urgency.
**Severity:** Medium.
**Recommendation:** Ship one Next.js app with role-based route groups (`/patient`, `/doctor`, `/admin`) and middleware-enforced role gating for the hackathon; split into three deployables post-hackathon once the vertical-slice boundaries (already correctly drawn per feature) make the split mechanical rather than a rewrite — same argument the document already makes for the backend modular monolith, just not applied consistently to the frontend.
**Expected Improvement:** One deployment target, one dependency tree, one design-system import path, for a demo where the constituency that most needs the security separation (Admin) is also the constituency least likely to be shown live in the first 48 hours.

### Issue 5.2 — Voice Documentation Agent is a hackathon-scope risk disguised as a core feature
**Problem:** Real-time STT + medical-entity extraction + doctor-review UI is listed as agent #8 of 14 with no distinction from lower-risk agents.
**Why it's a problem:** Speech-to-text accuracy on clinical audio, consent-gated recording UX, and structured-note extraction is genuinely hard and is the kind of feature that eats a full day if it eats an hour of debugging.
**Severity:** Medium.
**Recommendation:** Explicitly tier it into "Should Build" (SES §18.2), not "Must Build," and implement it as a backend service wrapping a third-party STT API plus a templated note formatter rather than a full agent graph node — matches the reclassification pattern in Issue 1.1.
**Expected Improvement:** Protects the 48-hour demo's critical path (Timeline, Triage, Doctor Summary) from being put at risk by the highest-variance feature in the spec.

---

## Architecture Score

| Dimension | Score (/20) | Notes |
|---|---|---|
| Modularity & maintainability | 15 | Layered backend + vertical-slice frontend are genuinely good calls; agent-count inflation is the main deduction. |
| Scalability | 15 | Modular-monolith-first is correct; event/checkpoint growth concerns are real but well-understood and fixable. |
| Security & data protection | 13 | Consent/RBAC/immutable-versioning design is strong; self-built auth and missing AI Safety Gateway are real gaps. |
| AI usage discipline | 10 | Agent-per-feature default (14 agents) is the single biggest architectural miscalibration in the document. |
| Hackathon feasibility (48h) | 12 | Solid target architecture, but too much day-one infrastructure (5 async pieces, 3 apps, 2 services) for the clock. |

### **Overall Architecture Score: 65 / 100**

A well-intentioned, thoughtfully layered design that over-invests in agentic AI and day-one distributed infrastructure relative to what the 48-hour constraint and the actual reasoning complexity of each feature justify. The fixes are structural, not a rewrite of the product: reduce agent count to where free-text reasoning is genuinely needed, collapse the deployment topology for the hackathon window while preserving the module boundaries that make later extraction mechanical, and make guardrails a structural gateway instead of prompt text. TDD v2.0 (companion document) implements these changes.
