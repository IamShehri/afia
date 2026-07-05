// Package sqlite owns the operations database: connections, migrations, repositories,
// leases, and transaction handling. It persists non-PHI operational state only and is
// independent from workspace migrations.
// TODO: Operations database and migrations (Engineering Program Section 7.3).
package sqlite
