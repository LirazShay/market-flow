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

## Architecture preference: browser first

The default target is a browser-resident SQL architecture.

~~~text
Authenticated browser collector
→ DuckDB-Wasm
→ persistent browser database
→ browser SQL scheduler
→ results
~~~

The design should remain entirely browser-local if it can satisfy the required SQL capability, persistence, throughput, latency, recovery and long-running stability.

A localhost/native process is not a co-equal implementation track. It is a fallback that is opened only after a concrete browser limitation is demonstrated.

This preference is deliberate:

~~~text
simpler deployment
+
fewer moving parts
+
existing authenticated browser boundary
→ try browser first
~~~

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
→ insert one coherent cycle into browser SQL storage
→ SQL-capable database commits it
→ scheduler runs current user SQL every X seconds
→ result rows + timing/error metadata
→ UI / later decision layer
~~~

SQL failure must not corrupt or stop ingestion.

## Primary candidate — Browser DuckDB-Wasm

The first candidate to design, prototype and benchmark is:

~~~text
Collector
→ DuckDB-Wasm
→ persistent browser storage
→ browser SQL scheduler
~~~

It must prove:

- required SQL syntax/features;
- persistent reopen semantics;
- continuous ingest;
- repeated queries;
- mixed ingest/query behavior;
- acceptable memory/resource behavior;
- long-running stability;
- recoverable failure behavior.

Do not assume failure from general browser/Wasm limitations. Measure the actual Market Flow workload.

## Conditional fallback — Local native DuckDB

Only if the browser path fails a required gate:

~~~text
Collector
→ localhost ingest API
→ native DuckDB
→ persistent local .duckdb file
→ local SQL scheduler
~~~

The fallback must solve a specific evidenced browser problem.

Do not introduce localhost merely for theoretical scalability or future flexibility.

If fallback is required, preserve the browser authentication boundary:

~~~text
browser owns authenticated provider session
localhost receives market-data payload only
~~~

## Why DuckDB is the primary SQL family

The target workload is analytical:

- append/repeated ingest of snapshots;
- scans over recent history;
- joins;
- GROUP BY/HAVING;
- sorting/ranking;
- windowed analysis;
- repeated ad-hoc SQL.

DuckDB is therefore the primary family to explore.

SQLite may be used only when a concrete design or benchmark question makes it useful.

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

The scheduler must define what happens when query runtime exceeds the interval. The baseline design should avoid uncontrolled overlapping executions.

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

## Browser-first fallback gate

Move to localhost/native only after documenting a required browser failure in one or more of:

- SQL capability;
- persistence/reopen;
- ingest throughput;
- query latency;
- mixed workload;
- memory/resources;
- stability;
- runtime/concurrency behavior;
- another concrete requirement.

For each failure record:

~~~text
workload/capability
→ measured or reproducible failure
→ attempted simple browser mitigation
→ why mitigation is insufficient
→ minimum fallback requirement
~~~

## Security boundary

The repository is public.

Never place cookies, session tokens, authorization headers, credentials, account numbers or private session data in repository artifacts or analytical payloads.

## Decision rule

The immediate question is:

> Can browser-resident DuckDB-Wasm provide the real SQL, persistence and repeated LIVE query execution Market Flow needs with sufficient correctness and headroom?

Only if the answer is demonstrated to be no do we ask:

> What is the smallest localhost/native fallback that fixes the proven limitation?
