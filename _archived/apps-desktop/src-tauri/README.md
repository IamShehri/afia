# apps/desktop/src-tauri

Tauri v2 desktop shell. Composes concrete Rust adapters and starts the application.
Contains **no domain rules and no SQL**.

- `src/main.rs` — process entry point.
- `src/bootstrap.rs` — logging, panic handling, per-launch setup.
- `src/composition.rs` — dependency composition root (adapter injection only).
- `capabilities/` — Tauri capability manifests; deny generic shell/filesystem/network access.
- `icons/` — application icons.

<!-- TODO(S03-T05): Connect frontend build and verify release-mode launch/exit. -->
