# apps/desktop/ui

React / TypeScript / Tailwind / shadcn/ui frontend for the AFIA desktop app.

The frontend **renders state and collects intent**. It contains no security, storage,
provider, document-processing, or model-selection rules.

## Layers (Engineering Program Section 5)

- `src/app/` — app shell: providers, startup, router, error boundaries (no feature behavior).
- `src/features/` — feature modules (projects, library, viewer, models, ai-runs, entities, notes, search, tasks, settings, onboarding). Each calls the typed command client only.
- `src/components/` — design system: `ui/`, `layout/`, `feedback/` (no application state).
- `src/contracts/` — generated TypeScript types and validators (never handwritten duplicate DTOs).
- `src/hooks/`, `src/lib/`, `src/stores/` (Zustand UI state), `src/styles/`, `src/test/`.

## Rules

- Server-state via TanStack Query; Rust is authority and queries invalidate from events.
- No direct Tauri invocation outside a feature's client module.
- Tauri-safe memory router; route state holds opaque IDs, never paths or secrets.

<!-- TODO(S03-T04): Scaffold the static shell; no business logic. -->
