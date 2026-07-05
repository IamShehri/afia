//! afia-security — key hierarchy, encryption primitives, authentication, audit chain.
//!
//! TODO: Implement modules (Section 13): key types, OS keychain port/adapter,
//! DEK/KEK envelopes, recovery KDF, object authenticated encryption, local-service
//! authentication, audit MAC chain, redaction, secret-safe logging types.
//!   - local_auth      TODO(S04-T04): per-launch local-service credential + redaction.
//!   - keychain        TODO(S05-T04): macOS keychain adapter.
//!   - envelope, keys  TODO(S05-T05): DEK generation, subkeys, device wrapping.
//!   - recovery        TODO(S05-T06): optional recovery-passphrase envelope (Argon2id).
//!   - audit           TODO(S07-T01): workspace audit MAC chain.
//!
//! Skeleton only — no implementation. No key bytes or secrets may enter logs.
