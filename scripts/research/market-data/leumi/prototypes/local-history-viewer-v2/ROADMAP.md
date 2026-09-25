# Local History Viewer V2 — Roadmap

This file owns V2 plan, scope and order only. Live progress belongs only in STATUS.json.

V2 starts from the frozen V1 collector/storage baseline, but the analytical direction is now SQL-first and **browser-first**.

## Product requirement that governs this roadmap

The live analytical layer must allow a user-defined SQL query to be changed independently of application code and executed automatically every configured X seconds against coherently committed market data.

The query may use SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, window/history logic and cross-security comparisons as supported by the selected SQL engine.

A valid execution may return zero rows.

IndexedDB is no longer being evaluated as the primary analytical query engine. The prior IndexedDB-primary evaluation plan is preserved under docs/history/ as superseded research.

## Browser-first architecture rule

The preferred path is:

~~~text
Authenticated Leumi browser
→ validated complete cycle
→ browser-resident SQL engine
→ persistent browser storage
→ scheduled user-defined SQL
→ result set
→ UI / downstream logic
~~~

The first implementation candidate is DuckDB-Wasm with persistent browser storage such as OPFS where supported by the chosen runtime design.

A localhost/native database is a **fallback path only**.

Do not build, benchmark or operationalize a localhost service in parallel merely as insurance.

Open the localhost/native fallback only when the browser-first path has a demonstrated blocking limitation in at least one required area:

- SQL capability;
- persistence/reopen correctness;
- ingest throughput;
- repeated-query latency;
- mixed ingest + query behavior;
- browser memory/resource limits;
- long-running stability;
- required concurrency/runtime behavior;
- another concrete product requirement that cannot be met safely in-browser.

The limitation must be evidenced, not assumed.

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

## Stage 02 — Browser SQL feasibility contract

Research and pin down the browser-only candidate:

~~~text
Authenticated browser collector
→ DuckDB-Wasm
→ persistent browser database
→ scheduled SQL in browser
~~~

Define exactly what must be proven before implementation:

- loading/initialization;
- persistence and reopen;
- SQL features required by Stage 01;
- write/transaction semantics;
- concurrent or serialized ingest/query behavior;
- browser memory/storage constraints;
- worker/runtime requirements if any;
- failure/recovery boundaries.

Deliverable: browser-first feasibility checklist and proof plan.

## Stage 03 — SQL schema design for browser DuckDB

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

Deliverable: benchmarkable browser-DuckDB schema.

## Stage 04 — Browser ingest and atomicity design

Define:

- validated cycle input;
- one coherent cycle commit;
- failure behavior;
- idempotency/retry semantics where needed;
- whether enrichment happens before insert, in SQL, or through generated/materialized structures;
- exact boundary between the inherited browser collector and DuckDB-Wasm.

Deliverable: browser ingest contract.

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

- no uncontrolled overlapping executions;
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

Deliverable: reusable browser SQL benchmark harness.

## Stage 07 — Browser DuckDB-Wasm prototype

Build the smallest browser-only spike proving:

- real SQL execution;
- persistence/reopen behavior;
- continuous inserts;
- scheduled queries;
- realistic result retrieval;
- browser persistence constraints;
- memory/stability characteristics;
- correct behavior under query errors.

Deliverable: measured browser-only evidence.

## Stage 08 — Browser scale and stability verification

Test the browser solution at representative and larger scales.

At minimum measure:

- write/commit median and p95;
- SQL execution median and p95;
- mixed workload;
- one-hour-like history;
- million-row scale where practical;
- full-trading-day-like scale where practical;
- memory/storage observations;
- restart/reopen;
- long-running repeated query behavior.

Deliverable: browser-first suitability evidence.

## Stage 09 — Browser-first decision gate

Classify the browser solution as:

~~~text
Verified sufficient
or
Blocked by demonstrated limitation
~~~

Use Verified / Inferred / Unknown for supporting claims.

If browser DuckDB-Wasm satisfies the required contract with adequate headroom, **do not build the localhost fallback**. Continue directly to normative specs and implementation.

If it fails a required gate, document:

- the exact failing workload/capability;
- measured magnitude;
- why simpler browser-side mitigation is insufficient;
- the minimum property the fallback must provide.

Deliverable: browser-first architecture decision.

## Conditional fallback track — only if Stage 09 blocks browser-first

### Fallback Stage F1 — Local native DuckDB design

~~~text
Authenticated browser collector
→ localhost ingest API
→ native DuckDB file
→ local SQL scheduler
~~~

Define only the minimum additional boundary needed to solve the proven browser limitation.

Browser credentials/cookies/session tokens remain in the browser.

### Fallback Stage F2 — Local native DuckDB prototype

Prove:

- browser POST of validated complete cycles;
- persistent native DuckDB;
- scheduled arbitrary SQL;
- result retrieval;
- process restart/recovery;
- Windows local operation;
- the specific capability that failed in-browser.

### Fallback Stage F3 — Focused comparison

Compare browser and localhost only on the workloads that matter to the blocking decision plus operational complexity.

Do not rerun an unnecessary technology contest.

Deliverable: evidence-backed fallback decision.

## Stage 10 — Normative V2 specs

After Stage 09, or after Fallback Stage F3 if fallback was required, update/add V2 specs for:

- SQL storage;
- ingest;
- scheduler/query execution;
- failure/recovery;
- result delivery;
- security boundary.

Deliverable: implementation-ready contracts.

## Stage 11 — Incremental implementation

Implement tests-first in natural vertical slices, preserving the frozen V1 reference and reusing only proven components that fit the selected architecture.

## Stage 12 — Integrated verification and live handoff

Verify:

- browser collection;
- coherent SQL persistence;
- scheduled arbitrary SQL;
- error isolation;
- recovery;
- performance headroom;
- live-provider integration where mocks cannot prove behavior.

Leave STATUS.json with the next product/implementation pointer.

## Non-goals

This roadmap does not define the final trading formula, thresholds, buy/sell execution or a fixed SQL query. The SQL itself is intentionally user-changeable.
