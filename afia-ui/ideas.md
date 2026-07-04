# AFIA — Design System Spec

AFIA is an AI-native healthcare operating system. It must feel like "the Cursor of Healthcare": premium, intelligent, calm, trustworthy, incredibly fast, and beautifully engineered. Not a hospital ERP, not a Bootstrap dashboard, not a government portal. The application is a **workspace**, not a dashboard.

---

## Three Stylistic Approaches (considered)

**1. Graphite Atelier** — Warm near-black graphite surfaces with a single electric-blue signal color, glass inspector panels, and surgically precise typography. Feels like an engineering tool a senior clinician would love. *(p = 0.062)*

**2. Clinical Aurora** — Cooler slate base with subtle aurora gradients bleeding behind panels; more atmospheric, slightly more colorful. *(p = 0.041)*

**3. Paper & Ink Pro** — Light-mode-first, editorial, stone-paper surfaces with ink-black type; feels like a beautifully set medical journal. *(p = 0.028)*

**CHOSEN: Approach 1 — Graphite Atelier.** It maps most directly to the brief (deep warm graphite, restrained accent, typography over decoration, workspace-not-dashboard, AI-first calm). Everything below expands this approach and is the binding contract for the build.

---

## Design Movement
A fusion of **Functionalist Swiss/International Typographic Style** (rigorous grid, type hierarchy, restraint) with **modern "engineered software" minimalism** (Linear/Cursor/Arc/Raycast). Information is the hero; chrome recedes. Surfaces are matter-of-fact and warm rather than cold.

## Core Principles
1. **The interface disappears.** Chrome is quiet graphite; the user's content (patients, schedules, AI output) carries all the color and weight.
2. **Typography is the primary design tool.** Hierarchy comes from size, weight, and spacing — never from boxes, heavy borders, or color blocks.
3. **Calm density.** Professional information density with generous, consistent 8pt rhythm. Never cramped, never empty.
4. **Motion explains, never decorates.** Fast (120–280ms), custom easings, purposeful. Keyboard actions are instant.

## Color Philosophy
The base is a **warm graphite** (a hint of warmth toward brown/stone, never blue-cold, never OLED-black) so all-day work feels comfortable. Color is *signal*: a single electric-blue accent for primary/interactive and focus; status colors (emerald positive, amber warning, rose destructive, violet/indigo for AI) used sparingly and only to mean something. Whitespace and type dominate; color never does.

- Dark (primary): background `oklch(0.18 0.006 60)` warm graphite; raised surfaces a touch lighter warm slate; borders near-invisible white at ~8–10% alpha.
- Light: warm white `oklch(0.985 0.004 80)` (not pure white), stone surfaces, very soft shadows.
- Signature accent (AFIA Blue): `oklch(0.62 0.19 250)` electric blue. AI accent: indigo→violet `oklch(0.58 0.20 280)`.

## Layout Paradigm — Workspace, not Dashboard
Multi-pane IDE-style shell (avoids centered marketing grid entirely):
```
┌──────────────────────── Top Command Bar ────────────────────────┐
│ Primary Rail │ Secondary Sidebar │      Workspace      │ Inspector │
│ (icons)      │ (context nav)     │   (user content)    │ (slide-in)│
├──────────────────────────── Status Bar ──────────────────────────┤
```
- Primary rail: thin icon rail (Arc/Vivaldi feel) with workspace switcher, modules, AI, settings, favorites/pinned/recents.
- Secondary sidebar: context-dependent per module (filters, saved views, collections, navigation). Collapsible + resizable.
- Workspace: large, minimal, the focus.
- Inspector: right slide-over (properties, AI suggestions, timeline, metadata, history, notes, related).
- Status bar: thin, quiet — sync status, environment, shortcuts hint, AI status.

## Signature Elements
1. **The Signal Dot & Hairline.** A 1px hairline system + a small accent "signal dot" used to mark active/AI/live states. Borders are hairlines, never heavy.
2. **Glass Inspector.** The right inspector uses subtle backdrop blur + a single hairline edge, reading as a pane of frosted graphite glass floating over the workspace.
3. **Mono accents for data.** Monospaced numerals/IDs/timestamps (tabular) — gives the "engineered instrument" feel and aligns columns perfectly.

## Interaction Philosophy
Keyboard-first and power-user friendly. Everything searchable; ⌘K command palette is the spine of the app. Rich hover/focus/selection states, context menus, quick actions. Focus rings always visible (WCAG AA). The app should reward muscle memory.

## Animation
- Easings: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for enter/exit; `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for morph. Never `ease-in`.
- Durations: button press 120–160ms (`scale(0.97)` active), tooltips 140ms, dropdowns/menus 160–220ms (origin-aware), inspector slide 240ms, command palette instant fade ~120ms.
- Staggered list entrances 30–60ms/item. Only animate transform/opacity. Respect `prefers-reduced-motion`.

## Typography System
- **Display / Headings:** "Geist" (geometric, engineered) — used for page titles, module headers, big numbers.
- **Body / UI:** "Geist" / system stack at comfortable sizes; clear hierarchy, never oversized.
- **Mono (data, IDs, code, timestamps):** "Geist Mono" with tabular numerals.
- Hierarchy: page title 22–26px/600; section 15px/600; body 14px/450; meta/caption 12–13px/500 muted; tabular data 13px mono. Generous line-height (1.5 body), tight on display.

## Brand Essence
**AFIA** — the calm, intelligent operating system clinicians actually want to use. *For:* clinical teams and care operations. *Why different:* AI-native and engineered like premium developer tools rather than legacy healthcare software. Personality adjectives: **precise, calm, intelligent.**

## Brand Voice
Confident, quiet, human. Plain clinical-professional language; never salesy, never cute. Microcopy is helpful and specific.
- Example headline: "Everything about Mara, in one place."
- Example empty state: "No flags right now. AFIA is watching for anything that needs you."
- Banned: "Welcome to our website", "Get started today", generic filler.

## Wordmark & Logo
**Wordmark:** "afia" set in Geist, all-lowercase, tight tracking, with the dot of an "i"-like accent replaced by the **signal dot** in AFIA Blue. **Mark:** an abstract "a"/pulse glyph — a rounded square containing a subtle ECG/pulse stroke that doubles as an "a" — single-color, scalable, no text. Used in the top-left of the primary rail and as favicon.

## Signature Brand Color
**AFIA Blue** — `oklch(0.62 0.19 250)` — an ownable electric-but-calm blue used only for primary action, active state, focus, and the signal dot.

## Style Decisions
- Hairline borders only (`1px`, white/black at low alpha). No heavy dividers, no boxed cards everywhere.
- Tabular monospaced numerals for all IDs, vitals, dates, counts.
- Accent color is reserved for action/active/AI — never used as a background fill for large areas.
- Dark mode is the primary, default experience; light mode is a first-class toggle.
