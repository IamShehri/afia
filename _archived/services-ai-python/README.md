# services/ai-python

The managed Python runtime. Packaged, pinned, isolated, and replaceable. It is **AI
execution only** and never owns application state. It is not installed through a user
machine's Python.

## Packages (Engineering Program Section 15)

| Package | Responsibility |
| --- | --- |
| `app` | FastAPI/Uvicorn lifecycle, dependency wiring, shutdown |
| `api` | versioned endpoints, request limits, error mapping |
| `auth` | per-launch bearer validation and browser-origin rejection |
| `capabilities` | capability registry and normalized dispatch |
| `adapters/openmed` | exact pinned OpenMed calls and model loading |
| `execution` | bounded execution registry, cancellation, resource timing |
| `schemas` | generated Python contracts and validation |
| `health` | process, adapter, active-model readiness |

## Runtime rules

Loopback-only traffic; every endpoint requires the per-launch secret; request bodies are
size-limited before execution; no document text, PHI, output, or secret is written to
disk; logs contain identifiers/stages/timing/safe error codes only; models load only from
Go-verified installation paths; one execution at a time unless a pack passes the
concurrency gate; cancellation clears ephemeral content; a known-answer self-test is
mandatory after activation.

<!-- TODO(S04-T06): Authenticated loopback health endpoint and contract round-trip. -->
