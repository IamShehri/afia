// Command afia-operations is the single AFIA Go executable.
// It owns operational work only and never opens a project database or persists
// document content.
// TODO(S04-T05): Bootstrap config, observability, and the authenticated gRPC server.
package main

func main() {
	// TODO(S04-T05): wire config -> persistence -> jobs -> transport/grpc; serve.
}
