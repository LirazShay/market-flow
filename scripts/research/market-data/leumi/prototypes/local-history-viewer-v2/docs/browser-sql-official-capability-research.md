# Browser SQL — Official Capability Research

Research date: 2026-09-25

This is the Phase D evidence artifact for the Browser SQL migration.

It records what current official DuckDB / DuckDB-Wasm sources support, what can only be inferred, and what remains Unknown until later Chromium or authenticated-Leumi verification.

Live progress belongs only in ../STATUS.json.

Classification:

~~~text
Verified
Inferred
Unknown
~~~

## Primary sources

- https://duckdb.org/docs/current/clients/wasm/overview
- https://duckdb.org/docs/current/clients/wasm/instantiation
- https://duckdb.org/docs/current/clients/wasm/deploying_duckdb_wasm
- https://duckdb.org/docs/current/clients/wasm/data_ingestion
- https://duckdb.org/docs/current/clients/wasm/query
- https://duckdb.org/docs/current/clients/wasm/troubleshoot
- https://duckdb.org/docs/current/clients/wasm/extensions
- https://github.com/duckdb/duckdb-wasm
- https://duckdb.org/2026/09/18/opfs-wasm
- https://duckdb.org/docs/current/sql/statements/transactions
- https://duckdb.org/docs/current/sql/statements/select
- https://duckdb.org/docs/current/sql/functions/window_functions
- https://duckdb.org/docs/current/data/json/overview
- https://duckdb.org/docs/current/dev/profiling
- https://www.npmjs.com/package/@duckdb/duckdb-wasm

## In-browser SQL

Verified:

- DuckDB-Wasm runs DuckDB inside the browser through WebAssembly.
- The documented asynchronous model uses a Web Worker, AsyncDuckDB, connections and SQL queries.
- SQL execution itself does not require a server round trip.

Conclusion:

Browser-only real SQL is feasible at the capability level. This does not yet prove Market Flow scale, persistence reliability or Leumi-site integration.

## SQL language

Verified:

- SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY and LIMIT.
- Window functions and ranking.
- The official DuckDB-Wasm repository currently states that its source is based on DuckDB v1.5.4.

Conclusion:

The core analytical SQL language required by Market Flow is not currently a blocker.

## Worker model and threading

Verified:

- Async DuckDB-Wasm normally runs the engine in a Web Worker.
- Current bundle families include mvp, eh and coi.
- Normal mvp/eh execution is single-threaded.
- coi enables parallel query execution but requires cross-origin isolation and SharedArrayBuffer.
- DuckDB documentation describes Wasm multithreading as experimental.

The documented headers for coi are:

~~~text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
~~~

Unknown:

- Whether the authenticated Leumi page satisfies these requirements.

Planning guardrail:

~~~text
design for single-thread first
coi threading = optional future optimization only
~~~

## Runtime loading

Verified:

- Deployment needs the main JS library, JS Worker, Wasm module and optional extension Wasm files.
- Official docs support bundled/static/CDN-oriented deployment patterns.
- The CDN example wraps the Worker through a Blob because Worker origin rules apply.

Unknown:

- Actual Leumi CSP for Blob workers, importScripts, modules, Wasm and external extension endpoints.

Conclusion:

The existing self-contained Bookmarklet delivery model cannot be assumed to remain viable.

## OPFS persistence

Verified capability:

- Current DuckDB-Wasm docs support opening a persistent database with an opfs:// path.
- Reopening the same path later is documented to restore persisted tables.
- OPFS synchronous access handles are Worker-only; AsyncDuckDB already runs in a Worker.
- DuckDB uses WAL/checkpoint behavior for persistence.
- Current guidance recommends CHECKPOINT after writes that must survive browser/tab loss.
- Official instantiation docs warn that an OPFS file can be held by only one handle at a time.

Current-version warning:

The official DuckDB OPFS article dated 2026-09-18 reports an OPFS persistence regression in the npm latest package at the time.

It identifies:

~~~text
latest affected: 1.33.1-dev57.0
known-good pin:   1.32.0
next with fix:    1.33.1-dev64.0 or later
~~~

The current npm package page also reports latest = 1.33.1-dev57.0 and next = 1.33.1-dev64.0.

Classification:

~~~text
OPFS database capability        = Verified
reopen concept                  = Verified
checkpoint durability model     = Verified
floating npm latest suitability = Not Verified
exact implementation version    = Unknown until pinned and tested
~~~

Planning guardrail:

Do not use a floating latest dependency for persistence-critical implementation. Pin an exact tested package version and require reopen/durability tests before OPFS becomes authoritative.

## Transactions and committed visibility

Verified:

- DuckDB documents ACID transactions.
- Changes in a transaction are not visible to other transactions before commit.
- Rollback discards the transaction.
- DuckDB-Wasm documentation states that queries on one connection run sequentially.

Unknown for the intended Browser-Wasm topology:

- simultaneous read/write connections over one OPFS database;
- multiple AsyncDuckDB instances on one OPFS file;
- cross-tab writer/reader locking;
- exact concurrent ingest + scheduled-query behavior;
- exact interaction between OPFS handle ownership and multiple owners.

Conclusion:

Do not import native DuckDB concurrency assumptions into the Browser architecture.

## Result delivery

Verified:

- query() materializes the full result as Arrow.
- send() streams Arrow record batches lazily.
- Arrow rows can be converted to JavaScript/JSON objects.

Conclusion:

Small live candidate sets are straightforward. Larger diagnostic results can be streamed when necessary.

## Ingestion

Verified:

- insertArrowTable;
- insertArrowFromIPCStream;
- CSV ingestion;
- JSON ingestion;
- normal SQL INSERT;
- registered files, buffers and URLs.

DuckDB-Wasm documentation describes Arrow as its native data protocol.

Current documentation warns that the JavaScript apache-arrow major version must match the DuckDB-Wasm dependency; it currently identifies major version 17.

Inferred:

Arrow-based bulk cycle ingestion is a strong candidate for reducing per-row JavaScript-to-Wasm overhead.

This is not yet an architecture decision.

## JSON / raw provider preservation

Verified:

- DuckDB has a JSON logical type and extraction functions.
- DuckDB-Wasm supports JSON ingestion and Wasm extensions.

Constraint:

Extension loading can involve browser fetches and is subject to CORS/CSP/network policy.

Conclusion:

Raw JSON is plausible, but Phase F must avoid an unnecessary network-dependent runtime requirement if a simpler representation preserves the same evidence.

## Memory and resource limits

Verified:

- Official DuckDB-Wasm docs state WebAssembly memory is limited to 4 GB.
- Browsers may impose stricter effective limits.
- Large materialized results can run out of memory.
- Streaming results is recommended where appropriate.

Conclusion:

Browser SQL must benchmark query working-set memory, result materialization, long-running behavior and multi-million-row history. Native-process memory assumptions are invalid.

## Remote access / CORS

Verified:

- Remote reads made by DuckDB-Wasm are browser requests and are subject to CORS.
- Extension downloads are browser/network-policy dependent.

Conclusion:

Core Market Flow history should not depend on remote analytical files at query time.

## Query interruption / cancellation

Unknown for the current public Wasm API evidence.

DuckDB core/native clients expose query interruption, but the current DuckDB-Wasm documentation reviewed in this phase does not establish an equivalent public Wasm cancellation API.

A search of the current official duckdb-wasm repository did not establish a public interrupt surface.

Therefore:

~~~text
native interrupt capability
!=
verified Browser-Wasm cancellation capability
~~~

Planning guardrail:

Do not make hard query cancellation a required implementation mechanism until the Wasm API is verified directly.

## EXPLAIN and profiling

Verified at DuckDB SQL level:

- EXPLAIN;
- EXPLAIN ANALYZE;
- profiling settings/pragmas.

Inferred for Wasm:

These SQL features are expected in the matching DuckDB engine build, but this phase did not independently prove every profiling surface in the future pinned Wasm package.

Conclusion:

Plan to use EXPLAIN ANALYZE for benchmark/debug work, then verify it in the pinned browser build.

## Version discipline

Current official surfaces have separate version layers:

- DuckDB core version;
- @duckdb/duckdb-wasm package version.

Evidence on 2026-09-25:

~~~text
@duckdb/duckdb-wasm latest = 1.33.1-dev57.0
@duckdb/duckdb-wasm next   = 1.33.1-dev64.0
official repository source currently based on DuckDB v1.5.4
~~~

Conclusion:

Future implementation must pin an exact Wasm package version and record the embedded DuckDB core version instead of using an ambiguous latest/stable label.

## Capability matrix

| Market Flow need | Classification | Result |
|---|---|---|
| real SQL in browser | Verified | supported |
| SELECT/JOIN/GROUP BY/HAVING/ORDER/LIMIT | Verified | supported |
| window/ranking functions | Verified | supported |
| user-changeable SQL text | Verified capability | supported |
| Web Worker execution | Verified | standard AsyncDuckDB model |
| persistent browser DB | Verified capability | opfs:// documented |
| reopen | Verified capability | documented, version regression exists |
| floating latest persistence | Not Verified | official regression warning |
| ACID transactions | Verified at DuckDB SQL layer | available primitive |
| exact Market Flow atomic topology | Unknown | architecture + browser test needed |
| single-thread execution | Verified | normal baseline |
| multi-thread execution | Verified capability / experimental | requires coi |
| Leumi cross-origin isolation | Unknown | live/browser check later |
| Arrow bulk ingestion | Verified | supported |
| JSON support | Verified capability | supported; delivery implications remain |
| streamed results | Verified | send() |
| Wasm 4 GB ceiling | Verified | browser may be stricter |
| hard query cancellation | Unknown | do not depend on it yet |
| EXPLAIN/EXPLAIN ANALYZE | Verified in DuckDB, Inferred in selected Wasm build | verify after pin |
| cross-tab/multi-instance OPFS concurrency | Unknown | do not assume |
| Leumi CSP compatibility | Unknown | later authenticated-browser verification |
| multi-million-row performance | Unknown | benchmark phase |
| trading-session long-run stability | Unknown | benchmark/live phase |

## Guardrails carried into Phase E

1. Design for the single-threaded Wasm path first.
2. Treat coi threading as optional only.
3. Prefer one clear authoritative DB owner unless stronger evidence justifies more concurrency.
4. Pin an exact DuckDB-Wasm version.
5. Require CHECKPOINT plus reopen/durability regression coverage before authority cutover.
6. Do not assume cross-tab or multi-instance OPFS safety.
7. Do not depend on query cancellation until verified.
8. Benchmark memory/result materialization as well as SQL duration.

## Phase D completion boundary

~~~text
Browser SQL feasibility at capability level = Verified
DuckDB-Wasm leading-candidate viability      = supported by current evidence
OPFS persistence capability                  = Verified
selected-version OPFS suitability            = later verification required
single-thread baseline                       = Verified
threaded optimization                        = conditional/experimental
Market Flow workload performance             = Unknown until benchmark
Leumi runtime compatibility                  = Unknown until later live/browser verification
~~~

No implementation spike was created in this phase.


## Analytical SQL security controls

Verified in current official DuckDB documentation:

- database open configuration exposes READ_ONLY / READ_WRITE access modes;
- enable_external_access=false disables external file/network-style data access paths such as COPY and read_csv/read_parquet/read_json from external sources;
- extension autoinstall/autoload can be disabled;
- community extensions can be disabled;
- configuration can be locked after trusted setup.

Important Market Flow consequence:

~~~text
the authoritative database must remain READ_WRITE for ingest
→ database-level READ_ONLY mode alone cannot protect user analytical SQL
→ use application-level parsed statement classification
  + DuckDB hardening controls
~~~

Unknown until pinned-package verification:

- exact parser/statement-type inspection mechanism exposed to the Browser-Wasm application;
- exact supported security-setting ordering in the selected DuckDB-Wasm package;
- hard query interruption/cancellation.

## 2026-09-25 version-surface reconciliation

A later same-day verification found inconsistent official version surfaces:

~~~text
DuckDB-Wasm documentation: stable client = 1.5.5
npm @duckdb/duckdb-wasm: latest = 1.33.1-dev57.0; next = 1.33.1-dev64.0
official OPFS article: dev57 has a persistence regression
~~~

Do not reconcile these labels by assumption.

Planning rule:

~~~text
pin exact implementation artifact
→ record embedded DuckDB core version
→ run real Chromium OPFS write/CHECKPOINT/reopen tests
→ only then permit authority cutover
~~~

Official sources:
- https://duckdb.org/docs/current/clients/wasm/overview
- https://www.npmjs.com/package/@duckdb/duckdb-wasm
- https://duckdb.org/2026/09/18/opfs-wasm