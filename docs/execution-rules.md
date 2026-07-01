# AFIA Execution Rules (Hard Constraints)

This file defines the ONLY allowed behavior for AI-assisted code changes in this repository.

Any violation of these rules is considered a broken build, even if the code compiles.

---

## 1. Core Principle

This system is **module-isolated + projection-based + registry-composed**.

No feature is allowed to bypass these layers.

---

## 2. Architecture Overview

- `lib/clinical-event.ts`
  → Shared type ONLY (no logic, no imports)

- `lib/clinical-registry.ts`
  → Module registration (`registerClinicalModule`, `getRegistry`)
  → NO domain logic

- `lib/<module>.ts` (notes, labs, medications, patients)
  → Owns domain logic
  → Owns `toClinicalEvent()`
  → Owns `listClinicalEventsForPatient()`
  → Self-registers via `registerClinicalModule()` at module load

- `lib/clinical-modules.ts`
  → Side-effect imports only (loads registered modules)
  → Add one `import "./<module>"` per new clinical module

- `lib/clinical-timeline.ts`
  → ONLY composition layer
  → Reads `getRegistry()`, merges events, sorts by timestamp
  → NO hardcoded module imports
  → NO domain logic

- `app/(app)/patients/[patientId]/timeline/page.tsx`
  → PURE RENDERER ONLY
  → Must NOT import any clinical module

Data flow: `UI → composer → registry → modules → events`

---

## 3. Hard Rules (NON-NEGOTIABLE)

### RULE A — Timeline Isolation
Timeline page must NOT import:
- notes
- patients (clinical events)
- labs
- medications
- clinical-registry

Only allowed import:
- `lib/clinical-timeline`

---

### RULE B — Single Composer Rule
Only `lib/clinical-timeline.ts` may:
- call `getRegistry()`
- merge ClinicalEvent[] from registry sources
- sort ClinicalEvent[] by timestamp

`lib/clinical-modules.ts` may import clinical modules for registration side effects only.

Any other file doing composition is invalid.

---

### RULE C — Patients Isolation
`lib/patients.ts`:
- MUST NOT import notes, labs, medications
- MAY import ClinicalEvent type only

---

### RULE D — No Duplicate Composition Logic
Forbidden anywhere except composer:
- `.sort((a, b) => new Date(...`
- `[...a, ...b]`
- `.concat(`
- multi-source merging logic

---

### RULE E — Registration Isolation
Only `lib/<module>.ts` domain files (notes, labs, medications, patients) may:
- call `registerClinicalModule()`

Forbidden:
- UI importing `registerClinicalModule`
- composer calling `registerClinicalModule`
- any non-module file registering clinical sources

---

## 4. Allowed Data Flow

UI never touches modules directly.

---

## 5. Mandatory Implementation Pattern

Each module MUST implement:

```ts
toClinicalEvent(entity): ClinicalEvent
listClinicalEventsForPatient(patientId): ClinicalEvent[]
```

Each module MUST self-register:

```ts
registerClinicalModule({
  module: "<name>",
  getEvents: listClinicalEventsForPatient,
});
```

Adding a new module requires:
1. Create `lib/<module>.ts` with the pattern above
2. Add `import "./<module>"` to `lib/clinical-modules.ts`
3. No changes to `composePatientTimeline` logic

---

## 6. Executor Prompt (Use this every time)

Full copy-paste template: [AGENTS.md](../AGENTS.md#executor-prompt-use-this-every-time)

```text
Follow the execution rules in this repository.

Primary authority:
- docs/execution-rules.md (highest priority)
- AGENTS.md (secondary reference)

<<< TASK START >>>

PUT YOUR TASK HERE

<<< TASK END >>>

Rules:
- Make minimal changes only
- Do not change architecture
- Do not add new features
- Do not create new files unless strictly required
- Ensure build + type-check + lint remain valid
- If anything is unclear, stop and explain instead of guessing

After completion:
- List modified files
- Explain what changed
- Provide verification steps (commands)
```
