// Package jobs provides the durable queue: dispatcher, bounded workers, attempt policy,
// and progress/event sink. One dispatcher owns state transitions; every transition is
// persisted before an event is reported to Rust. Payloads prohibit document text and PHI.
// TODO(S08): Implement queue, leases, attempts, cancellation, progress.
package jobs
