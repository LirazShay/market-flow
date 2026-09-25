# SQL-First LIVE Analytics — Design Direction

This document captures the durable V2 design direction before detailed Browser SQL architecture is finalized.

It contains no operational progress. STATUS.json owns live status.

## Core requirement

Market Flow must support:

~~~text
user-defined SQL
+
configurable repeat interval X seconds
+
continuous fresh market data
→ SQL result set
~~~

Changing analytical logic should normally mean changing SQL, not modifying collector/application code.

## Fixed architecture boundary

Browser-only SQL is a current architecture constraint, not merely a preference.

~~~text
Authenticated Leumi browser
→ Collector
→ Browser SQL engine
→ persistent browser SQL database
→ scheduled SQL
→ results
~~~

Durable decision:

~~~text
docs/project/decisions/D-025.md
~~~

A local/native server is outside the active planning scope. Reopening that process boundary later requires a new architecture decision.

## Engine status

Leading candidate:

~~~text
DuckDB-Wasm
+
browser persistence
~~~

It is not yet an implementation commitment.

The planning research phase must verify current official documentation for release/API, persistence/OPFS, SQL features, transactions/concurrency, Worker requirements, cancellation, JSON/Arrow/bulk ingest, memory/runtime limits, loading/package constraints and reopen/recovery.

Another browser SQL engine may be considered only if evidence shows a material advantage.

## Consequence for IndexedDB

IndexedDB remains the implemented V2 baseline and may temporarily coexist during migration.

It is no longer the target analytical query engine.

The prior IndexedDB-primary evaluation is preserved under:

~~~text
docs/history/superseded-indexeddb-primary-evaluation/
~~~

The target architecture must eventually have one unambiguous market-history source of truth.

## Preserved behavior from V1/V2

Strong reuse candidates:

- authenticated browser collection;
- dynamic universe;
- no hardcoded universe size;
- canonical `String(PaperId or Key)`;
- full raw MapHeat and Security preservation;
- complete membership validation;
- complete-cycle handoff;
- atomic successful-cycle visibility;
- null/zero/empty/missing distinction;
- unknown provider semantics are not guessed;
- one Recorder owner;
- generated delivery from repository source;
- behavioral unit + Chromium test discipline.

These are contracts, not a requirement to preserve IndexedDB/BroadcastChannel/Bookmarklet implementation choices.

## Target conceptual flow

~~~text
authenticated browser
→ collect complete cycle
→ validate
→ enrich where justified
→ commit coherent cycle to Browser SQL
→ scheduler executes active SQL every configured interval
→ results + execution metadata/error
→ Viewer / SQL console / later decision layer
~~~

SQL sees only committed coherent data.

Query failure must not stop ingestion or corrupt persistence.

## Compute once, query many

For cheap, repeated, high-value facts:

~~~text
compute once
→ store once
→ query many
~~~

Core candidates include LAST change, Deals delta after provider semantics are Verified, and MID.

Do not precompute every arbitrary cross-time combination.

## Core horizons

~~~text
10s
20s
30s
60s
90s
120s
300s
600s
~~~

Missing historical context remains NULL.

Natural collection jitter does not require exact millisecond equality.

## SQL scheduler direction

The future scheduler must distinguish active SQL, query identity/version, interval, execution start/end, duration, row count, current execution status/error and latest successful result.

No uncontrolled overlapping executions.

Collector cadence and SQL cadence remain separate concepts.

User analytical SQL should be isolated from schema/admin mutation unless a future explicit requirement changes that rule.

## Selected runtime topology

Phase E selected one dedicated SQL Authority Worker owning DuckDB-Wasm + the persistent OPFS database, successful-cycle writes, active SQL scheduling and query execution. Viewer windows are read-only clients through the runtime bridge and do not open independent authoritative DB handles.

Durable decision: `../../../../../../../docs/project/decisions/D-026.md`.

Detailed schema, transaction statements, scheduler policy, persistence lifecycle and Viewer transport remain later planning work.

## Physical design still open

Not yet decided:

- physical SQL schema;
- SnapshotId representation;
- temporal relationship representation;
- raw JSON vs typed columns;
- current/latest representation;
- result delivery;
- BroadcastChannel role;
- runtime packaging;
- persistence authority details;
- migration of existing IndexedDB history;
- retention/export;
- cancellation/result-size policy.
