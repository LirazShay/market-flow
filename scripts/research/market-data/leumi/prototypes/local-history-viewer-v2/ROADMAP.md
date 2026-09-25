# Local History Viewer V2 — Roadmap

This file owns V2 plan, scope and order only. Live progress belongs only in STATUS.json.

V2 starts from the frozen V1 collector/storage baseline, but the analytical direction is now SQL-first.

## Product requirement that governs this roadmap

The live analytical layer must allow a user-defined SQL query to be changed independently of application code and executed automatically every configured X seconds against the latest persisted market data.

The query may use SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, window/history logic and cross-security comparisons as supported by the selected SQL engine.

A valid execution may return zero rows.

IndexedDB is no longer being evaluated as the primary analytical query engine. The prior IndexedDB-primary evaluation plan is preserved under docs/history/ as superseded research.

## Architecture boundary that remains valuable

The authenticated browser remains the collection boundary unless later evidence requires otherwise:

~~~text
Authenticated Leumi browser
→ validated complete cycle
→ SQL-capable storage/analytical engine
→ scheduled user-defined SQL
→ result set
→ UI / downstream logic
~~~

The selected SQL engine and process boundary are not yet frozen.

## Stage 01 — SQL workload contract

Define the observable contract:

- arbitrary user-owned SQL text;
- configurable execution interval X seconds;
- query changes do not require collector/runtime code changes;
- query runs against coherent committed data only;
- zero rows is valid;
- query error is isolated from ingestion;
- query duration, row count and error are observable;
- ingestion continues even when a query fails;
- SQL execution never receives browser authentication secrets unnecessarily.

Deliverable: V2 SQL execution contract and acceptance scenarios.

## Stage 02 — SQL engine/process candidates

Evaluate the smallest serious candidates:

### Candidate A — Browser-only DuckDB-Wasm + OPFS

~~~text
Authenticated browser collector
→ DuckDB-Wasm
→ persistent OPFS database
→ scheduled SQL in browser
~~~

### Candidate B — Browser collector + localhost native DuckDB

~~~text
Authenticated browser collector
→ localhost ingest API
→ native DuckDB file
→ local SQL scheduler
~~~

### Candidate C — SQLite only if evidence justifies it

SQLite may be included as a control/reference candidate for transactional/indexed SQL, but the target workload is analytical and should not force equal investment in every engine.

Deliverable: shortlist with concrete tradeoffs and benchmark plan.

## Stage 03 — SQL schema design

Design a relational/analytical schema that preserves:

- canonical SecurityId = String(PaperId or Key);
- complete raw provider data;
- cycle/session identity and timestamps;
- stable snapshot identity;
- null != 0 != "" != undefined;
- complete-cycle integrity;
- efficient current/latest access;
- efficient historical time-window access;
- future derived columns without losing raw fields.

Decide whether current rows are represented by a table, view or SQL query.

Deliverable: benchmarkable SQL schema candidates.

## Stage 04 — Ingest protocol and atomicity

Define:

- browser-to-engine payload;
- complete-cycle validation boundary;
- one coherent cycle commit;
- failure behavior;
- idempotency/retry semantics where needed;
- whether enrichment happens before insert, in SQL, or through generated/materialized structures.

For localhost candidates, credentials/cookies/session tokens must remain in the browser.

Deliverable: ingest contract.

## Stage 05 — Scheduled SQL runner design

Define the runtime that:

~~~text
load active SQL
→ every X seconds
→ execute on latest committed DB state
→ record timing/result/error
→ publish result set
~~~

Requirements:

- no overlapping uncontrolled executions;
- configurable interval;
- deterministic behavior when previous query exceeds interval;
- query timeout/cancellation strategy if supported/needed;
- latest successful result remains distinguishable from query failure;
- query text/version is observable.

Deliverable: scheduler contract.

## Stage 06 — Synthetic SQL benchmark harness

Build sanitized deterministic market data at realistic scale.

Measure:

- insert/commit throughput;
- simple current-universe SELECT;
- JOIN against recent history;
- GROUP BY/HAVING;
- window functions where useful;
- ORDER BY/LIMIT ranking;
- repeated scheduled execution;
- mixed ingest + query;
- database growth.

Deliverable: reusable SQL benchmark harness.

## Stage 07 — Browser DuckDB-Wasm prototype

Build the smallest browser-only spike proving:

- SQL execution;
- persistence/reopen behavior;
- continuous inserts;
- scheduled queries;
- realistic result retrieval;
- OPFS constraints;
- memory/stability characteristics.

Deliverable: measured browser-only evidence.

## Stage 08 — Local native DuckDB prototype

Build the smallest localhost spike proving:

- browser POST of validated complete cycles;
- native persistent DuckDB;
- scheduled arbitrary SQL;
- result retrieval;
- process restart/recovery;
- Windows local operation.

Deliverable: measured localhost evidence.

## Stage 09 — Comparative benchmark

Compare candidates using the same workloads and datasets.

At minimum measure:

- write/commit median and p95;
- SQL execution median and p95;
- mixed workload;
- full-day-like history scale when practical;
- memory/storage observations;
- startup/recovery;
- complexity and failure modes.

Deliverable: evidence table.

## Stage 10 — Architecture decision

Select the minimum sufficient SQL architecture.

The decision must distinguish:

- Verified;
- Inferred;
- Unknown.

It must explicitly state why the selected solution is preferred for the requirement "change SQL freely and run every X seconds."

Deliverable: durable architecture decision.

## Stage 11 — Normative V2 specs

Update/add V2 specs for:

- SQL storage;
- ingest;
- scheduler/query execution;
- failure/recovery;
- result delivery;
- security boundary.

Deliverable: implementation-ready contracts.

## Stage 12 — Incremental implementation

Implement tests-first in natural vertical slices, preserving the frozen V1 reference and reusing only proven components that fit the selected architecture.

## Non-goals

This roadmap does not define the final trading formula, thresholds, buy/sell execution or a fixed SQL query. The SQL itself is intentionally user-changeable.
