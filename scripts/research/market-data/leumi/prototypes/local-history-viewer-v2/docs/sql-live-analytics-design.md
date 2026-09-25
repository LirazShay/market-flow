# SQL-First LIVE Analytics — Design Direction

This document captures the current V2 architectural direction after the product requirement was clarified.

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

Changing the analytical logic should normally mean changing SQL, not modifying collector or application code.

This makes a real SQL execution engine a product requirement rather than a developer convenience.

## Consequence for IndexedDB

IndexedDB may still be useful as inherited prototype storage, migration input, temporary buffer or fallback evidence source.

It is no longer the target primary analytical engine because IndexedDB itself does not execute SQL and the product should not require translating arbitrary SQL-like logic into custom JavaScript query code.

The previous IndexedDB-primary investigation is preserved under docs/history/superseded-indexeddb-primary-evaluation/.

## Preserved V1 strengths

The following remain valuable regardless of SQL engine choice:

- authenticated provider collection stays in the browser;
- dynamic universe, no hardcoded security count;
- canonical SecurityId = String(PaperId or Key);
- full raw MapHeat and Security records are preserved;
- complete-cycle validation;
- no silent partial/corrupt cycle acceptance;
- null != 0 != "" != undefined;
- provider semantics are not guessed;
- V1 remains frozen.

## Target conceptual flow

~~~text
Authenticated browser tab
→ collect complete provider cycle
→ validate requested/received/unique/missing/unexpected
→ send/insert one coherent cycle
→ SQL-capable database commits it
→ scheduler runs current user SQL every X seconds
→ result rows + timing/error metadata
→ UI / later decision layer
~~~

SQL failure must not corrupt or stop ingestion.

## Serious architecture candidates

### Browser-only

~~~text
Collector
→ DuckDB-Wasm
→ OPFS persistent database
→ browser SQL scheduler
~~~

Advantages to prove:

- no local server installation;
- data remains in browser-local environment;
- real SQL;
- simple deployment boundary.

Risks to measure:

- Wasm memory/browser limits;
- persistence/OPFS maturity;
- same-origin/runtime integration;
- long-running stability;
- query concurrency with continuous inserts.

### Local native engine

~~~text
Collector
→ localhost ingest API
→ native DuckDB
→ persistent local .duckdb file
→ local SQL scheduler
~~~

Advantages to prove:

- native engine performance;
- ordinary local file persistence;
- fewer browser memory limits;
- easier long-running process/control;
- stronger future extensibility.

Costs to measure:

- installation/startup process;
- localhost protocol;
- extra process lifecycle;
- security boundary;
- packaging/updates.

## Why DuckDB is the primary engine family to evaluate

The target workload is analytical:

- append/repeated ingest of snapshots;
- scans over recent history;
- joins;
- GROUP BY/HAVING;
- sorting/ranking;
- windowed analysis;
- repeated ad-hoc SQL.

DuckDB is therefore the primary candidate family.

SQLite remains a possible comparison/control when indexed point/range access or operational simplicity warrants it, but it is not automatically co-equal for this analytical workload.

## SQL scheduler contract direction

The future scheduler should own:

- active SQL text;
- query identity/version;
- interval;
- execution start/end;
- duration;
- result row count;
- success/error state;
- latest successful result.

The scheduler must define what happens when query runtime exceeds the interval. The default design should avoid uncontrolled overlapping executions.

## SQL and schema evolution

The system should favor stable raw data plus SQL views/queries during exploration.

A likely evolution pattern is:

~~~text
new analytical idea
→ write/change SQL
→ observe results and cost
→ if a repeated expensive computation is proven valuable
→ consider persisted/generated/materialized optimization
~~~

Do not precompute every possible comparison in advance.

## Security boundary

The repository is public and the local analytical engine does not need Leumi credentials.

For a localhost design:

~~~text
browser owns authenticated provider session
localhost receives sanitized market-data payload only
~~~

Never move cookies/session tokens/authorization headers into repository files or local API payloads unless an explicit future requirement proves it necessary.

## Decision rule

The next architecture decision is no longer "Can IndexedDB do analytics?"

It is:

> Which SQL-capable execution architecture gives us the simplest reliable way to ingest continuous market snapshots and execute arbitrary user-defined SQL every X seconds with sufficient headroom?
