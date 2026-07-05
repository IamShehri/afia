// Package grpc is the authenticated, versioned Rust-facing API: server bootstrap,
// authentication interceptor, version/deadline/size enforcement, and DTO mapping.
// It persists request metadata only and never receives document text.
// TODO(S04-T05): Authenticated gRPC health server and job/model/runtime services.
package grpc
