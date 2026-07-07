# HealthTribe AI — Screen Specifications

**Version:** 2.0
**Companion Document:** HealthTribe AI — Design System & Component Library v2.0 (all components, tokens, and shadcn/Lucide mappings referenced below are defined there)
**Format key per screen:** Purpose · Layout · Component Hierarchy · Navigation · Animations/Micro-interactions · States (Empty/Loading/Error/Success) · Accessibility · User Flow · Edge Cases · Responsive Behavior · Design Rationale

> Flagship screens (Home, AI Chat, Medical Timeline, Timeline Event Detail, Doctor Patient Summary, Admin AI Monitoring) get full wireframe-level detail. All other screens use the same 11-part format at a more compact depth — every field is still answered, just without a repeated wireframe diagram where the layout is a straightforward list/card pattern already established.

---

## PART A — PATIENT APP

### A.1 Onboarding

- **Purpose:** Get a new patient from install to a usable profile in under 90 seconds, with zero blocking data requirements.
- **Layout:** Full-screen, single-column, 4-step horizontal `Progress` indicator at top: Welcome → Basic Info → Health Snapshot (optional) → Consent.
- **Components:** `Progress`, `Input`, `Select` (state/city), multi-select `Chip` group (chronic conditions — optional), `Button` (primary, "Continue"; ghost, "Skip for now" on optional steps), consent `Checkbox` + link to plain-language consent explainer sheet.
- **Hierarchy:** Illustration → headline (`type.display`) → form → primary CTA fixed at bottom.
- **Navigation:** Linear, back button available every step; completing → Home.
- **Animations:** `motion.page` slide between steps; progress bar fills with `motion.base`.
- **Micro-interactions:** Chip select bounces subtly (`motion.fast` scale 1→1.05→1).
- **Accessibility:** Each step announced via `aria-live` region ("Step 2 of 4: Basic Info"); voice input available on all text fields.
- **User Flow:** Install → Welcome → phone/email → OTP (Clerk) → Basic Info → optional Health Snapshot → Consent → Home.
- **Edge Cases:** User abandons mid-flow — profile saved incrementally (per SES §10.2 Patient Intake Agent partial-save behavior), resumes where left off on next open.
- **Empty/Loading/Error/Success:** Loading = skeleton form fields during OTP verify; Error = inline field-level (§4.3 Design System); Success = confetto-free simple checkmark transition into Home.
- **Responsive:** Tablet/desktop centers the flow in a 480px card on a `color.primary.50` background.
- **Rationale:** Optional steps are truly skippable (design principle: never block on data collection) — Patient Intake Agent structures whatever is given, incrementally, per TDD §2.

### A.2 Login / A.3 Signup

- **Purpose:** Fast, low-friction auth via Clerk-hosted flow embedded in-app (not a redirect that breaks the native feel).
- **Layout:** Centered logo, single primary input (phone/email), OTP or password, social login buttons (`Button variant="outline"` with provider icon).
- **Components:** `Input`, `Button`, Clerk `<SignIn/>`/`<SignUp/>` themed to design tokens (§Design System 2.1).
- **Navigation:** Signup → Onboarding; Login → Home (or role-appropriate portal per TDD §9 role redirect).
- **States:** Loading = button internal spinner replacing label text (only spinner exception in the system — sub-2s, inline, not full screen); Error = toast + inline field error.
- **Accessibility:** Autofill-compatible fields, visible focus rings.
- **Edge Cases:** Wrong role attempting patient login (e.g., a doctor account) → redirected to Doctor Portal automatically, not an error.
- **Responsive:** Identical structure at all breakpoints, card width caps at 400px.
- **Rationale:** Auth is infrastructure, not brand expression — kept maximally simple per Design Principle #1.

---

### A.4 Patient Home ⭐ (Flagship)

**Purpose:** The single screen a patient opens most; must answer "what do I need to know/do right now" in one glance, with AI available but not dominant.

**Wireframe (mobile, 375px reference):**
```
┌─────────────────────────────┐
│ ≡  Good morning, Asha   🔔  │  Top App Bar
├─────────────────────────────┤
│ ╭───────────────────────╮   │
│ │ ✨ Ask HealthTribe     │   │  AI Hero Card
│ │ "How can I help today?"│   │  (elevation.ai, accent border)
│ │ [ chip ][ chip ][chip] │   │
│ ╰───────────────────────╯   │
├─────────────────────────────┤
│  Upcoming Appointment        │  section header (h2)
│  ╭───────────────────────╮   │
│  │ Dr. Rao · Cardiology   │   │  AppointmentCard
│  │ Tomorrow, 10:30 AM     │   │
│  ╰───────────────────────╯   │
├─────────────────────────────┤
│  Today's Reminders           │
│  ╭───────────────────────╮   │
│  │ 💊 Metformin — 8 PM     │   │  ReminderCard(s)
│  ╰───────────────────────╯   │
├─────────────────────────────┤
│  Recent Timeline              │
│  [ Lab card ][ Rx card ]  →  │  horizontal scroll preview
├─────────────────────────────┤
│  Quick Actions                │
│  [Book][Labs][Family][Benefits]│
└─────────────────────────────┘
   Home  Doctors  Timeline  Family  Profile      Bottom Nav
```

- **Component Hierarchy:** `TopAppBar` → `AIHeroCard` → `SectionHeader` + `AppointmentCard` (if any upcoming, else compact empty prompt) → `SectionHeader` + `ReminderCard[]` (if any due today) → `SectionHeader` + horizontal-scroll `TimelineEventCard[]` preview (last 3) → `QuickActionGrid` (4 icons: Book, Labs, Family, Benefits) → `BottomNav`.
- **Navigation:** AI Hero tap → expands in-place into full `AI Chat` screen (not a route change feel — a shared-element transition); every card is tap-through to its detail screen; "Recent Timeline" → full Medical Timeline.
- **Animations:** Cards fade+slide in on load, staggered 40ms each (`motion.base`); AI Hero has a very subtle idle breathing glow (`elevation.ai` opacity 0.8↔1, 3s loop, disabled under `prefers-reduced-motion`).
- **Micro-interactions:** Reminder card "Done" tap → checkmark morph + card slides out (`motion.fast`) rather than just disappearing, so the action feels registered.
- **Accessibility:** Screen reader order matches visual order top-to-bottom; AI Hero card has `aria-label="Ask HealthTribe AI, opens chat"` distinct from its visual placeholder text.
- **User Flow:** Open app → glance at AI hero + upcoming card → either tap AI hero to ask something, or tap a specific card to act.
- **Edge Cases:** No upcoming appointment → hero-adjacent card becomes a soft prompt ("No appointments booked — need to see a doctor?") not a blank gap; no reminders today → section hidden entirely (never shows an empty section header).
- **Empty State:** New user with no data yet — Home shows only AI Hero + Quick Actions + a single onboarding-completion nudge card.
- **Loading State:** Skeleton cards matching each section's card shape, AI Hero renders immediately (never blocked on other data).
- **Error State:** Individual section fails independently (e.g., Timeline preview fails to load) — that section shows a small inline retry, rest of Home unaffected (no full-screen error for a partial failure).
- **Success State:** N/A (persistent dashboard, not a transactional flow).
- **Responsive:** Tablet — AI Hero full-width, remaining sections in 2-column grid. Desktop — left rail nav replaces bottom nav, content in 2-column max-width 960px layout, AI Hero pinned as a right-side persistent panel rather than top-of-scroll.
- **Design Rationale:** Vertical order literally encodes the product hierarchy from TDD §2 — AI assist, then active care (appointment/reminders), then history (timeline), then everything else — "AI → Care → Timeline" is not just a tagline, it's the layout algorithm.

---

### A.5 AI Chat ⭐ (Flagship)

**Purpose:** Full conversational surface for anything the Coordinator Agent can route — symptom triage, booking help, benefits questions, general Q&A — always legible as "AI-assisted," never as an oracle.

**Wireframe:**
```
┌─────────────────────────────┐
│ ← HealthTribe AI             │
├─────────────────────────────┤
│ ℹ AI-assisted, not a diagnosis│  ChatDisclaimerBanner (persistent)
├─────────────────────────────┤
│                    You: I've │
│                    had a...  │  ChatMessageBubble (user, right)
│                               │
│ HealthTribe: That sounds like│  ChatMessageBubble (assistant, left)
│ it could be worth a visit... │
│ ╭───────────────────────╮    │
│ │ Dr. Rao available today│    │  ChatActionCard (inline)
│ │ [Book]                 │    │
│ ╰───────────────────────╯    │
├─────────────────────────────┤
│ [chip][chip][chip]  (scroll) │  suggested prompts (empty convo only)
│ 🎤  Type a message...    ➤   │  input bar
└─────────────────────────────┘
```

- **Component Hierarchy:** `TopAppBar` (back + title) → `ChatDisclaimerBanner` (persistent, not dismissible on first-ever use; collapsible to icon-only after acknowledged) → scrollable `ChatMessageBubble[]` stream, with embedded `ChatActionCard`s where the Coordinator delegates to a bookable/actionable result → `ChatSuggestedPromptChip[]` row (only shown when conversation is empty or just resumed) → input bar (`Input` + `Mic` icon + send `ArrowUp` icon).
- **Navigation:** Back returns to Home (or wherever chat was entered from — chat can be entered contextually, e.g., "Ask AI about this lab result" from a Timeline event); tapping a `ChatActionCard` navigates to the relevant detail screen while preserving the chat thread in background state.
- **Animations:** New assistant messages token-stream in via `motion.stream`; user messages appear instantly (no artificial delay); `ChatStreamingIndicator` (three-dot pulse) shows only during the gap before first token, per TDD §11 SSE streaming.
- **Micro-interactions:** Long-press a message → copy/report options; mic icon pulses while actively listening.
- **Accessibility:** Each message is a distinct `role="log"` region item, screen-reader announces new assistant messages as they complete (not per-token, to avoid announcement spam); voice input is a first-class equal-weight entry method to typing, not a secondary affordance.
- **User Flow:** Enter chat (from Home hero or contextually) → send message/voice → see streaming response, possibly with an action card → act on it or continue conversing.
- **Edge Cases:** Emergency-keyword detection (Smart Triage's deterministic layer, TDD §2) short-circuits immediately to a full-width `ChatEmergencyCard` (`color.error` themed, phone icon, local emergency number) that visually interrupts the normal bubble flow — this is the one place the calm palette is deliberately broken, because urgency must read as urgency.
- **Loading:** `ChatStreamingIndicator` only; never a full-screen loader for chat.
- **Error:** If an agent call fails, assistant bubble shows a graceful partial message per TDD §13 Coordinator failure handling ("I can help with X, but having trouble with Y right now") — never a raw error bubble.
- **Success:** N/A — ongoing surface, not transactional.
- **Responsive:** Desktop — chat occupies a persistent right-side panel (max 420px) alongside whatever Patient App content is on the left, rather than taking over the full viewport, so AI truly stays a companion, not a takeover, consistent with Design Principle #3.
- **Design Rationale:** The action cards (not raw text describing an appointment) are what keep AI feeling like an assistant handing off to the real product surfaces, rather than trying to *be* the product.

---

### A.6 Doctors

- **Purpose:** Discover and filter doctors/hospitals for booking (Practo-inspired).
- **Layout:** Sticky `TimelineSearchBar`-style search + `FilterChip` row (specialty, availability-today, distance) above a scrollable `DoctorCard`/`HospitalCard` list.
- **Components:** `Search`, `Chip` filters, `DoctorCard`, `HospitalCard`, `Tabs` (Doctors / Hospitals).
- **Navigation:** Card tap → Doctor Details or Hospital Details.
- **Animations:** List re-filters with a `motion.fast` crossfade, not a jarring reflow.
- **Accessibility:** Filter chips are a `role="group"` with `aria-pressed` state per chip.
- **User Flow:** Search/filter → compare cards → tap into details → book.
- **Edge Cases:** No results for filter combination → empty state suggests loosening filters, not a dead end.
- **Empty/Loading/Error:** Skeleton `DoctorCard`s while loading; empty-state illustration + "Try adjusting filters"; error = inline retry banner above the (cached, if any) list.
- **Responsive:** Tablet/desktop — 2–3 column card grid instead of single column list.
- **Rationale:** Filters live above the fold and persist across scroll — Practo's core lesson that filter-then-browse beats browse-then-filter for this task.

### A.7 Doctor Details

- **Purpose:** Enough info to decide + book, nothing more.
- **Layout:** Header (photo, name, specialty, rating) → About → Availability calendar strip → Reviews (collapsed) → sticky bottom `Button` "Book Appointment".
- **Components:** Avatar, `Badge` (rating), horizontal date-strip picker, `Button`.
- **Navigation:** Book → Appointment booking sheet (`BottomSheet`).
- **States:** Loading skeleton mirrors final layout exactly; error = retry banner; empty reviews = "No reviews yet" text only, no illustration (low-stakes empty state).
- **Accessibility:** Date strip fully keyboard-navigable (arrow keys), each date announces day+availability count.
- **Responsive:** Desktop — 2-column (info left, sticky booking panel right) instead of sticky-bottom button.
- **Rationale:** Booking CTA is sticky because it's the one primary action (Design Principle #1) and shouldn't require scrolling back up.

### A.8 Hospital Details
Same structural pattern as A.7 (header → about → departments list → doctors-at-this-hospital list) — departments shown as `Chip` row, doctor list reuses `DoctorCard`. No unique states beyond A.7's.

### A.9 Appointments

- **Purpose:** Manage all bookings across time.
- **Layout:** `Tabs` (Upcoming / Past / Cancelled) → `AppointmentCard` list, each showing estimated wait time for same-day upcoming items.
- **Components:** `Tabs`, `AppointmentCard`, swipe-to-reveal Reschedule/Cancel actions (with tap equivalent via card's own menu, per accessibility §7 no-gesture-only rule).
- **Navigation:** Card tap → Appointment Details.
- **Empty:** Per-tab empty state ("No upcoming appointments" + Book CTA).
- **Edge Cases:** Same-day appointment shows live estimated-wait badge (polled, not push, every 60s) — degrades to static scheduled time if the live estimate service is unavailable, never shows a stale number without a "last updated" caption.
- **Responsive:** Desktop — table-like dense list acceptable here (higher information density is appropriate for a management screen), still card-based per Design Principle #2 but tighter padding.

### A.10 Appointment Details

- **Purpose:** Full context for one booking + actions.
- **Layout:** Doctor/hospital summary card → date/time/location → "Prepare for your visit" card (Visit Preparation Service output, TDD §2) → Reschedule/Cancel buttons.
- **Components:** `AppointmentCard` (expanded variant), `Button` (secondary Reschedule, destructive Cancel via `AlertDialog` confirmation).
- **Edge Cases:** Cancel within a provider's cancellation window shows a warning inline before the confirm dialog, not after.
- **Accessibility:** Cancel confirmation is a true modal focus-trap, not a toast-based undo (irreversible-feeling actions get a real confirm step).

---

### A.11 Medical Timeline ⭐ — see dedicated **Part C — Medical Timeline Deep Dive** below for full detail (Timeline Cards, Navigation, Filtering, Search, Expandable Events, Doctor vs. Patient View, Visual Hierarchy).

### A.12 Timeline Event Detail ⭐ — see Part C.

---

### A.13 Lab Tests

- **Purpose:** Track recommended, booked, and completed tests in one place.
- **Layout:** `Tabs` (Recommended / Booked / Completed) → cards; Recommended tab surfaces doctor-ordered tests with a one-tap "Book now" (delegates to Lab Test Service).
- **Components:** `LabReportCard`, `Button`, file-upload affordance (`Paperclip` icon) for self-uploaded reports.
- **Edge Cases:** Uploaded report enters `needs_review` (OCR Pipeline, TDD §14) — card shows an explicit "Processing — we'll notify you" state, not a false-confident instant result.
- **States:** Upload progress = determinate `Progress`; processing = indeterminate but time-boxed skeleton with reassuring copy, never silent.

### A.14 Lab Reports

- **Purpose:** Detail view of one report — values, trend, reference range.
- **Layout:** Header (test name, date, source) → per-value rows with `type.data` mono figures + inline trend sparkline + range indicator bar → raw-attachment link (progressive disclosure).
- **Components:** `LabTrendChart` (§Design System 4.12), `StatusBadge` (in-range/out-of-range).
- **Accessibility:** Every value row's visual bar has an equivalent text readout ("142 mg/dL, above reference range of 70–100") — chart is never the sole information channel.

### A.15 Prescriptions

- **Purpose:** Active + past medication list, adherence-friendly.
- **Layout:** "Active now" section (grouped by prescribing visit) → "Past" collapsed list.
- **Components:** `PrescriptionCard`, `Badge` (active/completed), inline "Set reminder" toggle per drug.
- **Edge Cases:** Drug interaction flag (from Prescription Service rules engine, TDD §2) surfaces as a `warning`-badge note directly on the relevant drug row, sourced from the doctor-visible flag at prescribing time — patient sees the same flag doctor saw, not a re-run.

### A.16 Reports
Aggregation view across scans/discharge summaries not covered by A.14 — same card/list pattern as A.13, filterable by hospital/date.

### A.17 Benefits

- **Purpose:** Understand and act on eligible healthcare schemes.
- **Layout:** `BenefitCard` list (one per scheme) → tap-through to a linear "step card" detail (eligibility → required documents → participating hospitals → apply/contact CTA).
- **Components:** `BenefitCard`, numbered step-card stack.
- **Edge Cases:** "Coverage unclear" state (Healthcare Benefits Service rules-engine miss, TDD §2) renders as an honest `warning` badge with a "Contact your provider" CTA — never a confident-looking wrong answer.

### A.18 Family Vault

- **Purpose:** Manage dependents' care from one account (Netflix-style profile switcher).
- **Layout:** Horizontal avatar row (profile switcher) at top → selected member's mini-Home (their upcoming appointment, reminders, timeline preview) below, reusing Home's section components scoped to that dependent.
- **Components:** `FamilyMemberCard` (in switcher, compact avatar form), then reused Home sections.
- **Navigation:** Switching avatar re-scopes the entire screen's data (not a navigation, an in-place context switch, `motion.fast` crossfade).
- **Accessibility:** Avatar switcher is a `radiogroup`, current selection announced.
- **Edge Cases:** Consent-restricted dependent (partial access) shows only permitted sections, others show a locked-state card explaining what's restricted rather than silently omitting them (transparency over silent restriction).

### A.19 Caregiver View

- **Purpose:** Digest-style rollup across all dependents for a caregiver (Caregiver Agent output area, distinct from Family Vault's per-member deep-dive).
- **Layout:** Digest card per dependent (daily/weekly cadence per SES §11.5) with flagged-concern callouts surfaced first.
- **Components:** Digest `Card` variant, `Badge` (flagged items).
- **Edge Cases:** Ambiguous consent scope → dependent excluded from digest entirely with a neutral "limited visibility" note (fail-closed, per TDD §10.5 Caregiver Agent guardrail).

### A.20 Notifications
Reverse-chronological list, grouped by day, `Badge` category dot (appointment/reminder/timeline/system), tap-through to source screen. Mark-all-read affordance. Empty state: "You're all caught up."

### A.21 Settings
Standard `List` pattern: Language, Accessibility (large text / high contrast toggles, surfaced prominently, not buried), Privacy & Consent (link to full consent management, mirrors A.22-adjacent), Notification preferences (per-category channel toggles, feeds Notification Service), Logout.

### A.22 Profile
Personal details form (reuses A.1 field components), linked Mock ABHA status card (TDD §17) showing simulated Health-ID linkage state, Manage Family shortcut to A.18.

---

## PART B — DOCTOR PORTAL

*Desktop-primary surface (per Design System §9.4); layouts below describe the desktop-optimized default, with mobile-condensed fallback noted only where it meaningfully differs.*

### B.1 Dashboard / Today's Queue

- **Purpose:** A doctor's single working view for the day — who's waiting, who's in progress, what needs attention.
- **Layout:** `SideNav` (240px) → main content: summary stat row (Today's Patients / Emergency Cases / Completed) as compact `Card`s → `Tabs` (Waiting / In-progress / Completed) → patient queue list, each row a compact patient card (name, age/sex, chief complaint, wait time, urgency `Badge` if Smart Triage flagged priority/emergency).
- **Component Hierarchy:** `SideNav` → `StatRow` → `Tabs` → `QueueRow[]` (click → opens Patient Summary as a right-side `Drawer`, queue list stays visible on the left — split-view, not full navigation, so context is never lost).
- **Navigation:** Queue row click → Patient Summary drawer; drawer close returns focus to the same queue row (position preserved).
- **Animations:** Queue re-sorts (e.g., wait time ticking) via `motion.fast` row reflow, never a jarring re-render.
- **Micro-interactions:** Urgency badge on an emergency-flagged patient has a single slow pulse (not continuous — one pulse on first render, then static) to draw initial attention without being distracting over a full shift.
- **Accessibility:** Queue is a `table` semantically (even though styled as cards) so screen-reader users get row/column navigation; urgency conveyed via badge text, not color alone.
- **User Flow:** Open portal → scan queue → click next patient → review summary drawer → proceed to consultation screens (Voice Documentation / Prescription).
- **Edge Cases:** Emergency-flagged patient auto-sorts to top of Waiting regardless of check-in time, with a clear "Priority" reason shown (never silently reordered).
- **Empty/Loading/Error/Success:** Empty = "No patients waiting" calm state (not an error); loading = skeleton rows; error = queue fails to refresh → last-known state shown with a "last updated Xm ago, retry" banner, never a blank screen for a live clinical tool.
- **Responsive:** Tablet condenses to single-column queue with drawer becoming a full-screen push instead of split-view; not optimized for mobile (per Design System §9.4).
- **Design Rationale:** Split-view (queue + drawer) exists because a doctor's actual task is comparison/triage across patients, not a linear one-at-a-time flow — losing the queue behind a full navigation would break that.

### B.2 Patient Summary ⭐ (Flagship)

- **Purpose:** Everything a doctor needs in the 5–10 minute consult window — the Doctor Summary Agent's primary UI surface (TDD §16.6).
- **Layout:** Drawer/panel, top-anchored: patient identity strip (name, age, allergies as a permanent red `Badge` row — never truncated, never behind an expand) → AI-generated summary card (chief complaint, history, active meds, relevant trends), clearly labeled `"AI-generated — verify against patient"` (TDD §11.1 Safety Gateway requirement, surfaced visually here) → "View full history" expand → action buttons (Start Voice Documentation, New Prescription).
- **Components:** `StatusBadge` (allergy, always visible, `color.error`), summary `Card` with `info`-toned "AI-generated" label, `Collapsible` full-timeline expand, `Button` row.
- **Animations:** Summary card content fades in as it streams from the agent (`motion.stream`, same token as patient chat) — doctor sees it forming, not a blank-then-pop.
- **Accessibility:** Allergy strip has `aria-live="assertive"` on drawer open — the single most safety-critical piece of information is announced immediately, ahead of everything else.
- **User Flow:** Queue row click → drawer opens → allergy strip + summary scannable in seconds → expand full history only if needed → proceed to Voice Documentation or Prescription.
- **Edge Cases:** Low summarization confidence → agent falls back to raw relevant timeline entries instead of a synthesized narrative (TDD §16.6) — UI shows a plain list under an honest "Showing recent records — summary unavailable" label rather than a degraded-looking AI narrative.
- **Loading/Error:** Summary section skeleton-loads independently of the (always-instant) allergy strip, which never waits on the agent call.
- **Responsive:** Full-screen push panel on tablet, unchanged panel width on desktop.
- **Design Rationale:** Allergy/critical data is architecturally separated from the AI-generated section specifically so it can never be a casualty of a truncated or low-confidence summary — a structural guarantee, not a formatting hope.

### B.3 Medical Timeline (Doctor View)
Reuses the Part C Timeline component set with the doctor-oriented default: chronological raw view (not the patient's plain-language simplification) with clinical filters (chronic/ongoing tag first), opened from Patient Summary's "View full history" or directly from `SideNav`.

### B.4 Voice Documentation

- **Purpose:** Opt-in consultation recording → structured note (Should-Build tier per TDD Architecture Review §5.2).
- **Layout:** Large record `Button` (center, `color.error` when live-recording, matching universal recording-red convention deliberately breaking the calm palette for clarity) → live waveform → running transcript preview → "End & Review" action.
- **Components:** Custom `RecordButton` (extends icon `Button`), waveform visualization, `Textarea` (editable transcript before save).
- **Edge Cases:** Consent not confirmed (both doctor + patient) → record button disabled with an inline reason, cannot be bypassed (TDD §2 guardrail); low-confidence transcript segments highlighted inline for manual doctor edit before save, never silently accepted.
- **Accessibility:** Recording state changes announced (`aria-live`); full keyboard operability (space to start/stop) for doctors who prefer not to use mouse mid-consult.

### B.5 Prescription Composer

- **Purpose:** Fast, safe prescription entry — assisted, never auto-finalized (TDD §2 Prescription Service).
- **Layout:** Drug search/autocomplete row → added-drugs list (dose, frequency, duration fields inline per row) → interaction/allergy warning banner (`warning`/`error` `Badge`, non-blocking but unmissable) → "Finalize Prescription" primary button (always requires explicit doctor tap, never auto-submits).
- **Components:** `Command`-based drug search, editable row list, `StatusBadge` warnings, `Button`.
- **Edge Cases:** Interaction-check service unavailable → visible "interaction check unavailable" notice persists on screen, prescription flow still proceeds but the doctor is never left thinking a check silently passed (TDD §2 failure-handling rule).
- **Accessibility:** Warning banner is `role="alert"`, cannot be dismissed without being read (no swipe-to-dismiss on safety warnings).

### B.6 Lab Requests
Doctor-side test-ordering screen: searchable test catalog → selected-tests list → patient context note field → submit (feeds Lab Test Service). Mirrors A.13's card pattern but write-oriented.

### B.7 Analytics
Doctor's own practice view: consult volume, average consult time, follow-up completion rate — `BarChart`/`LineChart` widgets in a 2-column desktop grid, read-only, no PHI beyond what the doctor already has access to.

---

## PART C — MEDICAL TIMELINE DEEP DIVE ⭐ (Flagship Feature)

*This is the single most-detailed section in this specification, per the flagship-feature brief. Backing engineering detail: TDD v2.0 §16.*

### C.1 Timeline Cards

Every event on the timeline is a `TimelineEventCard` (Design System §4.14), visually differentiated **only** by a leading type icon and a thin left-edge color bar (never full-card color-coding — that would fight the calm palette principle at scale, since a year of events would become a rainbow). Card anatomy, top to bottom:
1. **Header row:** type icon + event title (e.g., "Prescription — Dr. Rao") + date (`type.data`, right-aligned).
2. **Summary line:** one plain-language sentence (patient view) or clinical shorthand (doctor view) — never both at once, view-mode dependent (C.6).
3. **Status row:** `StatusBadge` — `confirmed` (silent, no badge shown — absence of a badge *is* the confirmed state, keeping high-confidence cards visually quiet) or `needs_review` (always shown, `warning` badge, tap surfaces what needs confirming).
4. **Expand affordance:** chevron, `Collapsible` reveal of full structured detail (C.5).

### C.2 Timeline Navigation

- Primary navigation is **chronological reverse-scroll** (newest first) with sticky `TimelineYearDivider` headers that condense on fast scroll (a scrubber-like year jump appears on long-press of the scrollbar edge, desktop and mobile both — this is the one deliberate gesture-based affordance, but it has a full keyboard/tap equivalent: a "Jump to year" `Select` accessible from the filter bar).
- Secondary navigation: deep-linking from anywhere else in the app (a lab report, a prescription, an AI chat action card) always lands directly on the relevant event, pre-scrolled and briefly highlighted (`motion.base` background flash, once, non-repeating).

### C.3 Filtering

`TimelineFilterBar` (sticky, below the screen's top app bar): category chips (Consultations, Prescriptions, Labs, Scans, Diet Plans, Follow-ups — multi-select), a hospital/source filter (`Select`, single), and a date-range filter (opens a compact calendar-range `Sheet`). Filters combine with AND logic; active filter count shown as a small numeral on the filter icon when the bar is scrolled out of view.

### C.4 Search

Free-text search (`TimelineSearchBar`) matches event titles, drug names, and note text — expands from the filter bar on tap into a full search state (results replace the normal chronological list, with matched terms highlighted inline). Debounced 250ms; empty query shows recent searches, not a blank state.

### C.5 Expandable Events (Timeline Event Detail Screen)

Tapping a card's expand chevron on a short list expands in-place; tapping the card itself (or "View full details") navigates to a dedicated **Timeline Event Detail** screen as a `BottomSheet` (mobile) / `Dialog` (desktop):

```
┌─────────────────────────────┐
│ Prescription · Mar 3, 2026    ✕│
├─────────────────────────────┤
│  Dr. Rao · City Hospital       │
│  ─────────────────────────    │
│  Metformin 500mg — 2x daily    │
│  Lisinopril 10mg — 1x daily    │
│  ─────────────────────────    │
│  ⚠ Needs review: dosage field  │  (only if applicable)
│  ─────────────────────────    │
│  Version history (1 correction)│  → tap for supersedes chain
│  Attachments: original.pdf     │
└─────────────────────────────┘
```
- **Component Hierarchy:** Header (type + date + close) → source (doctor/hospital) → structured payload rendered by a **type-specific detail template** (prescription drug table, lab value+trend, scan metadata+image, discharge summary text) → `needs_review` explanation if applicable → version-history link (renders the `supersedesEventId` chain, TDD §16.3) → attachments list.
- **Animations:** Sheet enters via `motion.sheet`; switching between "current" and a prior version in the history chain crossfades the payload region only (header/chrome stays static) so the correction relationship is visually legible.
- **Accessibility:** Version history is announced as "showing corrected version, 1 of 2" — never silently swaps content without orientation.
- **Edge Cases:** Low-confidence field within an otherwise-confirmed event highlights only that field with a `warning` outline + inline "confirm this value" micro-action, rather than flagging the whole event.

### C.6 Doctor View vs. Patient View

| Aspect | Patient View | Doctor View |
|---|---|---|
| Summary line | Plain language ("Blood sugar check — slightly high") | Clinical shorthand ("HbA1c 7.2%, ref 4.0–5.6") |
| Default filter | All categories, personal relevance order | Chronic/ongoing-tagged first (TDD §16.6 consult-window logic) |
| Lab values | Sparkline + one-line takeaway | Full value/unit/reference-range table + sparkline |
| Entry point | Bottom nav "Timeline" tab | Patient Summary "View full history" or SideNav |
| Edit capability | None (read-only, request-correction flow only) | Can annotate/flag; cannot silently edit (versioning applies to doctors too) |

Both views render from the identical `TimelineEvent` data — the difference is purely a presentation-layer template selection (patient vs. clinical formatter), never a different data fetch, so there is exactly one source of truth rendered two ways.

### C.7 Visual Hierarchy

Order of visual weight, heaviest to lightest: (1) `needs_review`/critical badges — the only saturated color allowed to appear unprompted in the list, (2) event type icon + title, (3) date, (4) summary line, (5) everything else (source, attachments) revealed only on expand. This ordering is a direct implementation of Design Principle #4 (progressive disclosure) applied to the flagship feature specifically — the list view is intentionally *less* informative than the data actually available, by design.

---

## PART D — ADMIN PORTAL

*Desktop-only surface (Design System §9.4). All screens share a common `SideNav` + top stat-row + content-region pattern; details below focus on what's distinct per screen.*

### D.1 Dashboard
Platform-wide stat cards (active patients, doctors, appointments today, AI agent call volume) + a system-health traffic-light strip (links to D.10). Widgets in a 3-column desktop grid.

### D.2 Hospitals / D.3 Doctors / D.4 Patients / D.5 Users
Each a `DataTable` (Design System §4.13) with search + role/status filters, row click → detail `Drawer`. Bulk actions (deactivate, export) available via row-select checkboxes — the one place in the product where multi-select + bulk action is appropriate (an admin, not a patient/doctor, workflow).

### D.6 Feature Flags
List of all flags (per TDD §20.2: the 6 agents individually, `RealAbhaAdapter` cutover, Should-Build items) as `Switch` rows grouped by category, each with an environment scope selector (`Select`: dev/staging/prod) — changes require a confirmation step (`AlertDialog`) since a flag flip can disable a live agent.

### D.7 AI Monitoring ⭐ (Flagship)

- **Purpose:** The direct UI surface for the single-orchestrator architectural rule (TDD §2, §19) — every agent call is visible here because the Coordinator is the only orchestration entry point.
- **Layout:** Filter row (agent type, date range, patient — anonymized ID only) → stat cards (calls/day, avg latency, cost/day, Safety Gateway trip rate) → `DataTable` of individual `AGENT_RUN` records → row click opens a `Drawer` with full run detail: input (redacted per PII rules), output, latency, cost, and **every Safety Gateway check result** for that run (TDD §11.1 `SAFETY_GATEWAY_LOG`).
- **Components:** `LineChart` (calls-over-time), `DataTable`, `StatusBadge` (gateway check pass/block/patch, per TDD §11.1's three outcomes).
- **Micro-interactions:** A blocked/patched Safety Gateway result row is visually distinct (`warning`/`error` left-bar, matching Timeline's convention from C.1) so an admin scanning the table catches safety events without opening every row.
- **Accessibility:** Table fully keyboard-navigable; chart data always has a `DataTable` equivalent view toggle (chart is never the only way to read the numbers).
- **Edge Cases:** No PII ever rendered in this screen even to admins — patient identity shown only as a stable pseudonymous ID, consistent with structured-logging PII redaction (TDD §11.2).
- **Design Rationale:** This screen exists specifically because TDD §2's orchestration rule ("Coordinator is the only cross-workflow initiator") is only worth having if it produces one legible dashboard — this is that dashboard.

### D.8 Audit Logs
Append-only `DataTable` of every PHI read/write (TDD §11.2), filterable by actor/action/entity — no delete/edit affordance anywhere in this screen, by design (it's an audit log).

### D.9 Prompt Versions
List of prompt versions per agent, diff view between versions (`Textarea`-based side-by-side), promotion status (shadow → staging → prod, per TDD §22 shadow-evaluation environment) shown as a `Badge` per version — ties directly to the nightly-eval and shadow-eval process in the TDD's Testing Strategy.

### D.10 System Health
Traffic-light grid: web service, worker queues (per-queue depth, surfacing the Event Bus revisit trigger from TDD §15.1 directly — a queue-depth widget crossing the documented threshold turns amber automatically), database, external providers (Gemini, STT, push/SMS) — sourced from the Grafana/Prometheus stack (TDD §19), embedded or deep-linked.

---

## Responsive Behavior — Full Summary

| Screen group | Mobile (0–639px) | Tablet (640–1023px) | Desktop (1024px+) |
|---|---|---|---|
| Patient onboarding/auth | Full-screen single column | Centered 480px card | Centered 400px card |
| Patient Home/Timeline/Doctors/etc. | Single column, bottom nav, bottom sheets | Single/2-col hybrid, bottom nav retained | 2-col with left rail nav, modals replace sheets, AI Chat becomes persistent right panel |
| Doctor Portal | Condensed, functional fallback | Icon-rail side nav, single-column queue | Full side nav, split-view (queue + drawer) |
| Admin Portal | Not supported — "Please use a larger screen" notice | Side nav + single content column | Full side nav + multi-column dashboard grid |

---

*End of Screen Specifications v2.0. See companion document, HealthTribe AI — Design System & Component Library v2.0, for every token, component, and shadcn/Lucide/Tailwind mapping referenced above.*
