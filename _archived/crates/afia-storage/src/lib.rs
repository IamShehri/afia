//! afia-storage — SQLCipher connections, migrations, repositories, object storage.
//!
//! TODO: Implement modules (Section 13): global DB, workspace DB, connection policy,
//! migrations, repositories, object staging/promotion/read/garbage collection,
//! transaction unit, integrity check, test database support.
//!   - sqlcipher                TODO(S05-T02): bundled SQLCipher + connection options.
//!   - migrations               TODO(S05-T01/S05-T03): V001 global + workspace ledgers.
//!   - objects                  TODO(S06-T02): encrypted staging + atomic promotion.
//!   - global/recent_projects   TODO(S06-T04): field-encrypted recent projects.
//!
//! Skeleton only — no implementation. The object API exposes no plaintext path.
