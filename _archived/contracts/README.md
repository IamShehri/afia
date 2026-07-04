# contracts/

The single source of cross-language contracts. All contracts are versioned, generated
from `contracts/source`, carry a request/correlation ID, and return stable error
envelopes. Generated output drift fails CI.

## Layout (Engineering Program Sections 2 & 8)

- `source/` — authoritative schemas:
  - `common/` — request, response, error metadata.
  - `tauri/` — Tauri command and event contracts.
  - `operations/` — Rust–Go gRPC contracts.
  - `ai-runtime/` — Rust–Python HTTP contracts.
  - `plugins/` — internal plugin contracts (v1: validate only).
  - `models/` — capability-pack manifest and model descriptors.
- `generated/` — generated output per language: `rust/`, `typescript/`, `go/`, `python/`.
- `compatibility/` — semantic-version compatibility expectations.
- `fixtures/` — shared cross-language serialization fixtures.

<!-- TODO(S04-T01/S04-T02): Define common metadata + error schemas; configure deterministic generation for four languages. -->
