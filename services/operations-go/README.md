# services/operations-go

One Go module, one executable: `afia-operations`. It owns **operational work only** and
never opens a project database or persists document content. It receives operational
metadata, model manifests, download destinations, runtime configuration, and job
identifiers — never a workspace key, path, document text, or PHI.

## Package responsibilities (Engineering Program Sections 4 & 14)

| Package | Responsibility | May persist |
| --- | --- | --- |
| `internal/domain` | job/download/model/runtime/schedule state and invariants | nothing directly |
| `internal/application` | service operations and ports | nothing directly |
| `internal/transport/grpc` | authenticated, versioned Rust-facing API | request metadata only |
| `internal/persistence/sqlite` | operations database and migrations | non-PHI operational state |
| `internal/jobs` | durable queue, leases, attempts, cancellation, progress | job state/checkpoints |
| `internal/downloads` | resumable bounded downloads, digest streaming | URLs, byte counts, temp paths |
| `internal/models` | manifest validation, quarantine, activation, rollback | pack/install metadata |
| `internal/runtime` | managed Python process lifecycle and readiness | runtime version/state |
| `internal/scheduler` | delayed/retry/maintenance jobs | schedules |
| `internal/security` | local channel auth and secret handling | no plaintext secret |
| `internal/platform` | macOS paths, process, socket, disk helpers | nothing directly |
| `internal/observability` | structured content-free logs/metrics | bounded diagnostics |
| `internal/config` | validated process configuration | no project content |

## Concurrency rules

One dispatcher owns state transitions; worker pools bounded by job kind; downloads use a
dedicated bounded pool; model activation serialized per pack; Python start/stop serialized;
cancellation cooperative with a deadline; payloads prohibit document text and PHI; every
state transition is persisted before an event is reported to Rust.

<!-- TODO(S08-S10): Implement jobs, downloads, model lifecycle, and runtime supervision. -->
