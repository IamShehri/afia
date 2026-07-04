# crates/

Rust modular monolith for AFIA. Rust is the authority. Each crate uses `src/lib.rs`,
domain-focused modules, unit tests beside the behavior, and integration tests under its
own `tests/` directory when a public boundary is exercised.

## Members and dependency direction (Engineering Program Section 3)

| Crate | Responsibility | May depend on |
| --- | --- | --- |
| `afia-domain` | identifiers, entities, value objects, invariants, errors | foundational libs only |
| `afia-contracts` | generated transport DTOs, schema versions, validation | generated schema support |
| `afia-application` | use cases, ports, authorization, task orchestration | domain, contracts |
| `afia-security` | key hierarchy, encryption, authentication, audit chain | domain, application ports |
| `afia-storage` | SQLCipher, migrations, repositories, object storage | domain, application ports, security |
| `afia-workspace` | package lifecycle, locking, backup, restore, recovery | domain, application ports, security, storage |
| `afia-documents` | import inspection, parsing, canonical maps, content access | domain, application ports, security, storage |
| `afia-search` | indexing, health, query, ranking, rebuild | domain, application ports |
| `afia-ai` | capability registry, policy routing, Python client, provenance | domain, contracts, application ports, security |
| `afia-plugins` | internal plugin contracts, disabled host gate | domain, contracts, application ports |
| `afia-tauri` | validated commands, events, DTO/domain mapping | domain, contracts, application |

Cycles are prohibited. `afia-application` defines ports but never imports a concrete
adapter; the desktop composition root injects adapters.
