# AFIA

> Skeleton only. No implementation. This repository is being scaffolded from the
> **AFIA v1 Engineering Program** (governing standard: *AFIA Master Product & Engineering Blueprint v1.0*).
> Implement the standard. Do not redesign it.

AFIA is a macOS Apple Silicon desktop application. Rust is the authoritative
application, workspace, document, search, storage, security, plugin-interface, and
RAG-orchestration layer. A bounded Go operations service owns jobs, downloads, model
lifecycle, scheduling, and Python supervision. A managed Python runtime performs AI
execution only.

## Monorepo layout

| Path | Ownership |
| --- | --- |
| `apps/desktop/ui` | React / TypeScript / Tailwind / shadcn/ui frontend |
| `apps/desktop/src-tauri` | Tauri v2 desktop shell (composition root, no domain rules) |
| `crates/` | Rust modular monolith (domain, application, adapters) |
| `services/operations-go` | Bounded Go operations service |
| `services/ai-python` | Managed Python AI runtime |
| `contracts/` | Cross-language contract source and generated output |
| `docs/` | Product, architecture, ADRs, security, quality, runbooks, releases |
| `tests/` | Fixtures, contract, integration, e2e, performance, security suites |
| `packaging/` | macOS packaging, model packs, Python bundle |
| `tools/` | Repository tooling (contract generation, etc.) |
| `.github/` | CI workflows |

## Repository rules (enforced)

- One source of cross-language contracts: schemas live under `contracts/source`; generated drift fails CI.
- No business logic in adapters (Tauri, gRPC, HTTP, SQLite, UI translate and delegate).
- No raw workspace access outside Rust.
- No unpinned runtime dependency.
- No content fixture without provenance.
- No release without archived evidence under `docs/releases`.
- No broad shared utility package.

## Status

<!-- TODO(S03-T01): Maintain the program control files and task ledger under docs/product. -->
Scaffolding in progress. See `docs/product/v1-engineering-program.md` and `docs/product/v1-task-ledger.md`.
