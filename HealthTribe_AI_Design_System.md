# HealthTribe AI — Design System & Component Library

**Version:** 2.0
**Document Type:** Production Figma-equivalent Design System Specification
**Companion Document:** HealthTribe AI — Screen Specifications v2.0
**Audience:** UI designers, frontend engineers, AI coding tools (Antigravity)
**Design Philosophy:** Apple Health's clinical calm × Google Fit's data clarity × Practo's marketplace trust × Swiggy/Instamart's mobile-first warmth and speed

> HealthTribe AI is not a hospital management system wearing a nice coat of paint. It is a calm, spacious, trustworthy companion that happens to handle medical data. Every token and component below exists to protect two feelings: **"I always know what to do next"** and **"this app is looking out for me, not performing at me."** AI is a quiet assistant — present, never loud.

---

## 1. Design Principles

1. **One primary action per screen.** If a screen has two buttons that feel equally important, the hierarchy is wrong, not the layout.
2. **Card-first, not table-first.** Even data-dense doctor/admin views (§9, §10) use cards with generous internal spacing before falling back to tables — tables are a last resort for genuinely tabular data (audit logs, patient rosters).
3. **AI is a hero *section*, never a hero *product*.** The chat lives as the top module of Patient Home, not a nav tab. It never uses a "beep-boop robot" visual language — no glowing orbs, no sci-fi gradients. It looks like a calm note from a knowledgeable person.
4. **Progressive disclosure.** Default views show the plain-language, human-readable layer (SES §12.6); raw structured data (lab codes, full timeline JSON-equivalent) is always one deliberate tap away, never the default.
5. **Design for the whole family, literally.** A 68-year-old grandparent and their 24-year-old caregiver child use the same screens. Default type scale, contrast, and touch targets are tuned to the *older* end of that range — everyone benefits, no one is excluded.
6. **Calm color, not clinical white-out.** Warm neutrals instead of stark hospital white; color used sparingly and always semantically (a red badge always means the same thing everywhere in the product).

---

## 2. Design Tokens

### 2.1 Color Palette

HealthTribe deliberately avoids the two default healthcare-app clichés — sterile "hospital blue" and startup-generic Tailwind-default blue. The primary is a deep, slightly warm teal (clinical trust without cold sterility); the accent is a warm coral reserved almost entirely for the AI hero and human-touch moments, so it reads as *warmth*, not decoration.

#### Brand / Primary
| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.primary.900` | `#0A3F3B` | `#E8F5F3` | Headlines on light surfaces reversed in dark mode |
| `color.primary.700` | `#0E5C56` | `#3FA79A` | Primary buttons, active nav, links |
| `color.primary.500` | `#1B7A70` | `#5BC4B5` | Hover/pressed states, secondary emphasis |
| `color.primary.100` | `#E6F2F1` | `#123936` | Tinted backgrounds (selected chip, active tab underlay) |
| `color.primary.50` | `#F3F9F8` | `#0D2A27` | Subtle section backgrounds |

#### Accent (human warmth — AI hero, celebratory moments, empty-state illustration accents)
| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.accent.600` | `#E0623C` | `#F0855F` | AI hero border/glow, "new" indicators |
| `color.accent.100` | `#FBE7DF` | `#3A241C` | AI chat bubble background (assistant) |

#### Semantic
| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.success.600` | `#3F8F5F` | `#6FBF8E` | Confirmed booking, in-range lab value, delivered |
| `color.success.100` | `#E5F3EA` | `#173325` | Success surface tint |
| `color.warning.600` | `#C97F1E` | `#E0A24C` | needs_review flag, benefit "estimate pending" |
| `color.warning.100` | `#FBF0DE` | `#3A2C13` | Warning surface tint |
| `color.error.600` | `#B5402B` | `#E07A64` | Out-of-range critical value, emergency CTA, destructive action |
| `color.error.100` | `#F9E4DF` | `#3B1F19` | Error surface tint |
| `color.info.600` | `#3D7F97` | `#7FC1D6` | Informational banners, AI-generated content label |
| `color.info.100` | `#E4F1F5` | `#152B31` | Info surface tint |

#### Neutrals (warm-tinted stone, not pure slate — avoids clinical coldness)
| Token | Light | Dark |
|---|---|---|
| `color.neutral.0` (surface) | `#FFFFFF` | `#14100E` |
| `color.neutral.50` (app bg) | `#FAF8F6` | `#1B1613` |
| `color.neutral.100` (card/divider bg) | `#F1EDE9` | `#241E1A` |
| `color.neutral.200` (border) | `#E3DDD6` | `#332A24` |
| `color.neutral.400` (disabled text/icon) | `#9C9187` | `#8C8177` |
| `color.neutral.600` (secondary text) | `#6B6259` | `#B3A99E` |
| `color.neutral.900` (primary text) | `#211C18` | `#F5F1ED` |

**Color-blindness safeguard:** semantic states never rely on hue alone — every status badge pairs color with an icon and a text label (§4.7). Verified against Deuteranopia/Protanopia/Tritanopia simulation for the success/warning/error triad.

### 2.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display / Headings | **Plus Jakarta Sans** (600/700) | Rounded geometric sans — friendly, premium, distinct from generic UI sans; used H1–H3 and card titles only. |
| Body / UI | **Inter** (400/500/600) | High legibility at small sizes, best-in-class for elderly readability and dense data; used everywhere else. |
| Numeric / Timeline dates / Lab values | **IBM Plex Mono** (500) | Tabular figures for scannable lab trends and dates; used sparingly, never for prose. |

#### Type Scale (tokens)
| Token | Size / Line-height | Weight | Font | Usage |
|---|---|---|---|---|
| `type.display` | 34 / 42 | 700 | Jakarta | Onboarding hero only |
| `type.h1` | 28 / 36 | 700 | Jakarta | Screen titles |
| `type.h2` | 22 / 30 | 600 | Jakarta | Section headers |
| `type.h3` | 18 / 26 | 600 | Jakarta | Card titles |
| `type.body-lg` | 17 / 26 | 400 | Inter | Primary reading text (elderly-friendly default) |
| `type.body` | 15 / 22 | 400 | Inter | Standard UI text |
| `type.body-sm` | 13 / 18 | 400 | Inter | Secondary/meta text |
| `type.caption` | 12 / 16 | 500 | Inter | Timestamps, badges, form hints |
| `type.data` | 15 / 20 | 500 | Plex Mono | Lab values, dates, dosage figures |

Dynamic type: all `type.*` tokens scale with the OS/browser font-size setting up to 200% (WCAG 1.4.4) without layout breakage — verified in the Large Text accessibility pass (§7).

### 2.3 Spacing (8pt system)

`space.1`=4px · `space.2`=8px · `space.3`=12px · `space.4`=16px · `space.5`=20px · `space.6`=24px · `space.8`=32px · `space.10`=40px · `space.12`=48px · `space.16`=64px

Default card internal padding: `space.5` (20px) mobile, `space.6` (24px) tablet+. Default gap between stacked cards: `space.4` (16px).

### 2.4 Radius

`radius.sm`=8px (chips, badges, inputs) · `radius.md`=14px (buttons, small cards) · `radius.lg`=20px (standard cards, sheets) · `radius.xl`=28px (bottom sheet top corners, hero card) · `radius.full`=9999px (avatars, pills, FAB)

### 2.5 Elevation / Shadow

| Token | Values (light) | Usage |
|---|---|---|
| `elevation.0` | none, `border: 1px color.neutral.200` | Flat cards on neutral bg |
| `elevation.1` | `0 1px 2px rgba(33,28,24,0.04), 0 1px 3px rgba(33,28,24,0.06)` | Resting cards on white |
| `elevation.2` | `0 2px 8px rgba(33,28,24,0.08)` | Dropdowns, popovers |
| `elevation.3` | `0 8px 24px rgba(33,28,24,0.12)` | Modals, sheets, FAB |
| `elevation.ai` | `0 4px 20px rgba(224,98,60,0.16)` | AI hero card only — warm-tinted glow, not generic drop shadow |

Dark mode uses reduced-opacity borders instead of shadows (`border: 1px color.neutral.200(dark)`) since shadows read poorly on dark surfaces.

### 2.6 Motion / Animation

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion.instant` | 100ms | `ease-out` | Button press feedback |
| `motion.fast` | 180ms | `cubic-bezier(0.4,0,0.2,1)` | Chip select, toggle |
| `motion.base` | 240ms | `cubic-bezier(0.4,0,0.2,1)` | Card fade/slide-in, tab switch |
| `motion.sheet` | 320ms | `cubic-bezier(0.32,0.72,0,1)` | Bottom sheet enter/exit (spring-like decel) |
| `motion.page` | 280ms | `cubic-bezier(0.4,0,0.2,1)` | Route transitions |
| `motion.stream` | per-token, ~16ms | `linear` | AI chat token-by-token reveal |

Rules: nothing animates longer than 320ms. `prefers-reduced-motion: reduce` disables all slide/scale transitions app-wide, falling back to opacity-only 120ms crossfades. Motion is never used purely decoratively — every animation communicates a state change (Framer Motion scope per TDD §5.4).

### 2.7 Breakpoints

| Token | Width | Target |
|---|---|---|
| `bp.mobile` | 0–639px | Patient App primary target |
| `bp.tablet` | 640–1023px | Patient App (2-column), Doctor Portal (compact) |
| `bp.desktop` | 1024–1439px | Doctor Portal, Admin Portal primary target |
| `bp.wide` | 1440px+ | Admin Portal analytics, Doctor Portal multi-panel |

---

## 3. Grid System

- **Mobile:** 4-column grid, 16px margin, 8px gutter.
- **Tablet:** 8-column grid, 24px margin, 16px gutter.
- **Desktop:** 12-column grid, 32px margin, 24px gutter, content max-width 1280px (centered) for Patient-facing desktop web; Doctor/Admin Portals use full-width with a fixed 240px side nav + fluid content region.
- **Auto Layout mapping (Figma → Tailwind):** every card/section is `flex flex-col gap-{space}` (vertical auto layout) or `flex flex-row items-center gap-{space}` (horizontal) — no absolute positioning anywhere in the component library; this is what makes every component directly translatable to Tailwind flex utilities with zero ambiguity for AI coding tools.

---

## 4. Component Library

Every component below states: **shadcn/ui base**, **Lucide icon(s)**, **Tailwind conventions**, **states**, **a11y notes**. Naming follows `PascalCase` for components, matching TDD §5.4 frontend conventions exactly so design and code stay in lockstep.

### 4.1 Buttons — `Button`
| Variant | shadcn base | Height | Radius | Usage |
|---|---|---|---|---|
| Primary | `Button variant="default"` | 52px (mobile) / 44px (desktop) | `radius.md` | One per screen, main CTA |
| Secondary | `Button variant="outline"` | same | `radius.md` | Alternate action |
| Destructive | `Button variant="destructive"` | same | `radius.md` | Cancel appointment, remove family member |
| Ghost/Text | `Button variant="ghost"` | 40px | `radius.md` | Tertiary/low-emphasis action |
| Icon | `Button size="icon"` | 44×44px min | `radius.full` | Back, close, more — always 44px min hit target (§7) |

Tailwind: `bg-primary-700 hover:bg-primary-500 active:scale-[0.98] transition-transform` — the press scale is the only micro-interaction on buttons, using `motion.instant`.

### 4.2 Cards — base `Card` (shadcn `Card`), specialized variants below

All cards: `elevation.1` resting, `elevation.2` on hover (desktop only), `radius.lg`, `space.5` internal padding, max 2 actions (design principle #1).

| Card | Icon (Lucide) | Key fields | Status treatment |
|---|---|---|---|
| **AppointmentCard** | `CalendarClock` | Doctor name/photo, specialty, date/time, hospital, status | Status badge (§4.7): upcoming/completed/cancelled |
| **DoctorCard** | `Stethoscope` | Photo, name, specialty, rating, next availability | Availability dot (green=today, amber=this week) |
| **HospitalCard** | `Building2` | Name, distance, department list, rating | — |
| **LabReportCard** | `FlaskConical` | Test name, date, key value + trend arrow | In-range/out-of-range badge, `needs_review` badge if applicable |
| **PrescriptionCard** | `Pill` | Drug list (collapsed to count + expand), prescribing doctor, date | Active/completed badge |
| **ReminderCard** | `BellRing` | Medication/action, time, dependent (if family) | Snooze + Done inline actions (the max-2-actions rule) |
| **FamilyMemberCard** | `UserRound` | Avatar, name, relation, alert count | Alert dot if any `needs_review` items |
| **BenefitCard** | `ShieldCheck` | Scheme name, eligibility status, required docs count | Eligible/Pending/Not-eligible badge |
| **TimelineEventCard** | varies by type (§4.9) | See §4.9 | `confirmed`/`needs_review` badge |
| **AIHeroCard** | `Sparkles` (used once, small, never a mascot) | Greeting + input affordance | `elevation.ai`, `color.accent` border only |

### 4.3 Forms & Inputs — `Input`, `Textarea`, `Select`, `Form` (React Hook Form + Zod, per TDD §5.4)

- Floating-label pattern on all text inputs (label animates from placeholder position to top on focus/filled) — reduces vertical space vs. static labels while staying screen-reader-labeled at all times (`aria-label` always present, floating label is visual-only sugar).
- Height: 52px mobile / 44px desktop, `radius.md`, `elevation.0` with `color.neutral.200` border, `color.primary.700` border + `color.primary.100` glow ring on focus.
- Inline validation: error state shows on blur, not on keystroke (avoids punishing users mid-entry) — red border (`color.error.600`) + `AlertCircle` icon + text below field, `role="alert"`.
- Voice input affordance (`Mic` icon, trailing) available on any free-text field in the Patient App per accessibility goals (§7).

### 4.4 Search — `Command` (shadcn) for doctor/hospital/timeline search
`Search` icon leading, `X` icon trailing when populated, debounced 250ms, results in a card list below (not a dropdown overlay) on mobile; popover overlay on desktop.

### 4.5 Chips — `Badge variant="outline"` styled as pill, `radius.full`
Used for: filter selection (Timeline category filters, Doctors specialty filters — multi-select, `color.primary.100` bg when selected), AI suggested-prompt chips (single row, horizontal scroll, `color.accent.100` bg).

### 4.6 Tabs — `Tabs` (shadcn)
Used for: Appointments (Upcoming/Past/Cancelled), Doctor Portal Queue (Waiting/In-progress/Completed). Underline indicator animates position with `motion.fast`, never a full background pill (keeps it visually quiet).

### 4.7 Badges / Status Indicators — `Badge`
| Status | Color token | Icon | Text |
|---|---|---|---|
| Confirmed / Active | `success` | `CheckCircle2` | "Confirmed" |
| Needs Review | `warning` | `AlertTriangle` | "Needs review" |
| Critical / Emergency | `error` | `AlertOctagon` | "Urgent" |
| Informational / AI-generated | `info` | `Sparkles` | "AI-assisted — doctor reviewed" |
| Out of range (lab) | `error` | `TrendingUp`/`TrendingDown` | "Above range" / "Below range" |

Every badge always ships color + icon + text (§2.1 color-blind safeguard) — never color alone, never icon alone.

### 4.8 Navigation

- **Bottom Navigation** (`Tabs`-based, fixed, mobile Patient App only): 5 items max — Home, Doctors, Timeline (center, visually slightly emphasized as the flagship feature), Family, Profile. Icons: `Home`, `Stethoscope`, `Activity`, `Users`, `CircleUserRound`. Active state: filled icon + `color.primary.700` + label; inactive: outline icon + `color.neutral.600`, no label (reduces clutter) — active item always shows its label.
- **Side Navigation** (Doctor Portal & Admin Portal, desktop, 240px fixed): grouped sections with `Separator`, active item gets `color.primary.100` background pill, icon + label always visible (no icon-only collapse below `bp.desktop`).
- **Top App Bar:** 56px, page title (`type.h2`) + back button (mobile) or breadcrumb (desktop Doctor/Admin), trailing notification bell (`Bell`, with dot badge) and avatar menu.

### 4.9 Dialogs, Drawers, Bottom Sheets, Modals

| Component | shadcn base | Usage | Motion |
|---|---|---|---|
| Bottom Sheet | `Sheet side="bottom"` | Mobile primary pattern — timeline event detail, appointment actions, filters | `motion.sheet`, drag-to-dismiss |
| Modal/Dialog | `Dialog` | Desktop equivalent of bottom sheet; confirmation prompts (cancel appointment) | `motion.base` scale+fade |
| Side Drawer | `Sheet side="right"` | Doctor Portal patient summary panel, Admin detail panels | `motion.base` slide |
| Alert Dialog | `AlertDialog` | Destructive-action confirmation only (cancel, delete, withdraw consent) | `motion.base` |

### 4.10 Toast Notifications — `Sonner`/`Toast` (shadcn)
Bottom-center on mobile, bottom-right on desktop. Auto-dismiss 4s (success/info), persistent-until-dismissed for errors. Max one toast queue-visible at a time — stacking is a last resort, not a default.

### 4.11 Progress Indicators & Skeleton Loaders
- **Determinate:** `Progress` (shadcn) — used for onboarding steps, file upload.
- **Indeterminate:** never a bare spinner longer than 800ms; anything expected to take longer shows a **Skeleton** (shadcn `Skeleton`, shaped exactly like the content it replaces — card-shaped skeletons for card lists, line-shaped for text) — no generic full-screen spinners anywhere in the product (design principle: users always know something is happening and roughly what shape it'll take).

### 4.12 Charts — Recharts, styled to design tokens
`LineChart` for lab trend sparklines (`color.primary.700` line, `color.error.600` dot for out-of-range points, reference-range band shaded `color.neutral.100`), `BarChart` for Admin analytics. Never 3D, never unnecessary gridlines — axis lines only where a value needs to be read precisely (Admin/Doctor context), sparkline-only (no axes) in Patient-facing trend previews.

### 4.13 Tables — `Table` (shadcn), Admin/Doctor Portal only
Zebra-free (relies on `space.3` row padding + `color.neutral.200` row dividers, not background striping, for a calmer read), sticky header on scroll, row-hover `color.neutral.50`.

### 4.14 Timeline Components (flagship — see Screen Spec doc §Medical Timeline for full detail)
| Component | Icon by type | Notes |
|---|---|---|
| `TimelineEventCard` (consultation) | `Stethoscope` | |
| `TimelineEventCard` (prescription) | `Pill` | |
| `TimelineEventCard` (lab) | `FlaskConical` | shows trend arrow inline |
| `TimelineEventCard` (scan) | `ScanLine` | |
| `TimelineEventCard` (discharge summary) | `FileText` | |
| `TimelineYearDivider` | — | sticky section header, `type.h3`, `color.neutral.50` bg |
| `TimelineFilterBar` | `SlidersHorizontal` | horizontal chip row (§4.5) |
| `TimelineSearchBar` | `Search` | expands from filter bar on tap |

### 4.15 AI Chat Components
| Component | Notes |
|---|---|
| `AIHeroCard` | Home screen only — greeting + input, collapses to full chat on tap (§4.2) |
| `ChatMessageBubble` (user) | Right-aligned, `color.primary.700` bg, white text |
| `ChatMessageBubble` (assistant) | Left-aligned, `color.neutral.50` bg (not accent — accent reserved for the hero card border only, keeps in-conversation reading calm) |
| `ChatStreamingIndicator` | Three-dot pulse, `motion.stream` token reveal for actual text |
| `ChatActionCard` | Inline card embedded in a message (e.g., "Book with Dr. Rao?") — reuses `DoctorCard`/`AppointmentCard` compact variants, never a bespoke chat-only card |
| `ChatSuggestedPromptChip` | `Badge` variant, horizontal scroll row below input when conversation is empty |
| `ChatDisclaimerBanner` | `Info` icon, `color.info.100` bg, persistent above input: "AI-assisted, not a diagnosis. Emergency? Call [local emergency number]." |

---

## 5. Iconography

**Lucide Icons**, 24px default (20px in dense Admin tables, 28px in empty-state illustrations), `strokeWidth={1.75}` app-wide (slightly lighter than Lucide's 2px default — reads calmer, less clinical-chart-y). Icons are always paired with a text label except in the bottom nav's inactive state and icon-only buttons (which carry `aria-label`).

## 6. Illustration Style

Flat, warm-toned, geometric (not cartoon-mascot, not stock-photo-realistic) — used only in empty states and onboarding. Palette pulls from `color.primary` and `color.accent` tokens exclusively so illustrations never introduce off-system color. No medical-cross iconography clichés; illustrations depict the *outcome* (a calm person checking their phone) rather than hospital imagery.

---

## 7. Accessibility

| Concern | Implementation |
|---|---|
| **Elderly users** | Default `type.body-lg` (17px) as the base body size, not 15px; 52px touch targets on mobile primary actions; no gesture-only interactions (every swipe has a tappable equivalent). |
| **Color blindness** | Semantic color always paired with icon + text label (§4.7); palette verified for Deuteranopia/Protanopia/Tritanopia distinguishability. |
| **Large text** | All type tokens scale to 200% via relative units; layouts use flex-wrap, never fixed-height text containers, so nothing clips. |
| **WCAG AA** | Minimum 4.5:1 contrast for body text, 3:1 for large text/icons — every color pair in §2.1 pre-verified against its paired background. |
| **Screen readers** | Every interactive element has an accessible name; `TimelineEventCard` exposes a full sentence summary (`aria-label="Prescription from Dr. Rao, March 3, needs review"`) rather than relying on visual layout to convey meaning. |
| **Keyboard navigation** | Full tab order follows visual order; bottom sheets/modals trap focus and return it on close; skip-to-content link on desktop Doctor/Admin Portals. |
| **Voice navigation** | Voice input affordance on all free-text fields (§4.3); AI Chat accepts voice as a first-class input method, not a fallback. |

---

## 8. Component Naming Conventions

- **Figma layers / component names:** `Category/ComponentName/Variant` — e.g., `Cards/AppointmentCard/Upcoming`, `Buttons/Primary/Default`, matching the shadcn variant names exactly so a designer's Figma layer name and an engineer's Tailwind/shadcn variant prop are the same string.
- **React components:** `PascalCase`, matching TDD §5.4 — `AppointmentCard.tsx`, not `appointment-card.tsx`.
- **Tokens:** `dot.case` as shown throughout this document (`color.primary.700`), implemented as CSS variables (`--color-primary-700`) and a matching Tailwind `theme.extend` config — one source of truth, no hand-duplicated hex values in component code.

---

## 9. Implementation Guide

### 9.1 Component Inventory (Design → Code Mapping)

| Design Component | shadcn/ui base | Lucide Icon(s) | Tailwind pattern |
|---|---|---|---|
| Primary Button | `button` | — | `bg-primary-700 text-white rounded-md h-[52px] active:scale-[0.98]` |
| AppointmentCard | `card` | `CalendarClock` | `flex flex-col gap-3 p-5 rounded-lg shadow-elevation-1` |
| DoctorCard | `card` | `Stethoscope` | same pattern + `flex-row items-center gap-4` header |
| TimelineEventCard | `card` + `badge` | type-specific (§4.14) | `flex flex-col gap-2 p-5 rounded-lg`, collapsible via `Collapsible` |
| AIHeroCard | `card` (custom shadow) | `Sparkles` | `shadow-elevation-ai border border-accent-600/20 rounded-xl` |
| ChatMessageBubble | custom (extends `card`) | — | `max-w-[80%] rounded-2xl px-4 py-3` |
| BottomSheet | `sheet` (`side="bottom"`) | — | `rounded-t-xl` |
| StatusBadge | `badge` | per §4.7 table | `gap-1 rounded-full px-2 py-0.5` |
| FilterChip | `badge` (`variant="outline"`) | `SlidersHorizontal` | `rounded-full px-3 py-1.5` |
| SkeletonCard | `skeleton` | — | shaped to match target card's exact dimensions |
| BottomNav | `tabs` (custom fixed positioning) | Home/Stethoscope/Activity/Users/CircleUserRound | `fixed bottom-0 h-16 grid grid-cols-5` |
| SideNav | custom (`NavigationMenu` primitives) | per section | `w-60 flex flex-col gap-1 p-4` |
| LabTrendChart | `recharts LineChart` | `TrendingUp`/`TrendingDown` | wrapped in `card`, `h-32` sparkline / `h-64` full |
| DataTable | `table` | — | `w-full`, sticky `thead` |

### 9.2 Tailwind Conventions
- All design tokens (§2) live in `tailwind.config.ts` under `theme.extend.colors/spacing/borderRadius/boxShadow/fontFamily` — never inline hex/px values in components.
- Class order: layout → spacing → typography → color → state (`flex flex-col gap-4 p-5 text-body text-neutral-900 hover:bg-neutral-50`) for consistent diff-readability across an AI-agent-authored codebase.
- Responsive prefixes follow the breakpoints in §2.7 exactly (`sm:`=tablet, `lg:`=desktop, `xl:`=wide) — no ad hoc breakpoint values.

### 9.3 Motion Specifications
Implemented via Framer Motion per TDD §5.4 scope (chat token streaming, timeline sheet transitions only) — all other transitions (§2.6) are CSS transitions via Tailwind's `transition-*` utilities, reserving the Framer Motion dependency for the two interactions that actually need spring physics, keeping bundle size down for low-end mobile devices (a real target-user constraint per TDD §5.2).

### 9.4 Responsive Breakpoint Behavior Summary
| Surface | Mobile | Tablet | Desktop |
|---|---|---|---|
| Patient App | Single column, bottom nav, bottom sheets | Single column (max-width 640px, centered) or 2-col for Doctors/grid screens, bottom nav retained | 2-col with persistent left rail replacing bottom nav, modals replace sheets |
| Doctor Portal | Not primary target — condensed single column, functional but not optimized | Side nav collapses to icon rail | Full side nav + multi-panel (queue list + patient detail split view) |
| Admin Portal | Not supported (redirect to desktop notice) | Side nav + single content column | Full side nav + dashboard grid (up to 3-col widgets) |

---

*End of Design System & Component Library v2.0. Screen-by-screen specifications continue in the companion document, HealthTribe AI — Screen Specifications v2.0.*
