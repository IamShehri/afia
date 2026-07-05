# services/

Constrained local services that support the Rust authority.

- `operations-go/` — one bounded Go operations service (jobs, downloads, model lifecycle,
  scheduling, Python supervision). Never opens a project database or persists document content.
- `ai-python/` — one managed Python runtime for AI execution only. Never owns application state.

Neither service receives a workspace key or a path that grants project access.
