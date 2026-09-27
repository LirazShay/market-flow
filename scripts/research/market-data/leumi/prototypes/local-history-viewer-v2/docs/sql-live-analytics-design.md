# SQL-First LIVE Analytics — Current V2 Design Direction

## Role

This document describes the durable SQL-first analytical direction for Local History Viewer V2 after the post-KISS re-baseline.

It contains no live progress. `../STATUS.json` owns operational current/next state.

Product authority:
`../../../../../../../docs/product/live-sql-query-execution.md`

Product/provider boundary:
`../../../../../../../docs/project/decisions/D-043.md`

Implementation baseline:
`../../../../../../../docs/project/decisions/D-044.md`

## Core requirement

Market Flow supports:

~~~text
continuous committed market history
+
user-defined SQL
+
user-selected repeat interval
→ repeated read-only SQL results
~~~

Changing analytical logic should normally mean changing SQL rather than changing collector code.

The exact trading formula/query is intentionally not fixed by V2.

## Architecture boundary

~~~text
authenticated Leumi page
→ preserved V1 collection + exact complete-cycle validation
→ one Runtime Controller / SQL Authority Worker
→ pinned DuckDB-Wasm + persistent OPFS
→ coherent committed raw/current/history state
→ Dynamic SQL Scanner
~~~

Current Universe and Security Detail/History remain separate first-class surfaces. The Scanner is additive.

Viewer clients never become independent DuckDB/OPFS owners.

## Data strategy

Initial SQL storage preserves sufficiently rich raw facts so later SQL can answer questions that were not anticipated when the data was collected.

Required principles:

- dynamic universe; no hardcoded universe size;
- canonical `String(PaperId or Key)`;
- full raw MapHeat preservation;
- full raw Security preservation;
- `null != 0 != "" != missing`;
- unknown provider semantics are not guessed;
- validated complete cycles become visible atomically.

No fixed horizon matrix, predecessor-link matrix, persisted derived-metric set or separate latest structure is mandatory merely because an earlier plan proposed one.

## Analytical optimization

Use the simplest sequence:

~~~text
predeclare representative useful query corpus
→ run it correctly on representative day-sized history
→ measure the same corpus in the browser runtime
→ sufficient? stop
→ insufficient? add one smallest targeted optimization
→ remeasure the affected query
~~~

Representative queries may exercise short-horizon/history predicates, cross-security comparisons, filters, GROUP BY/HAVING, ordering/ranking and window functions where useful.

They demonstrate analytical capability; they do not define a final trading formula.

Typed promotions, indexes, predecessor references or persisted derived metrics are optional implementation choices only when a concrete query/correctness/ergonomics/performance reason justifies them.

## Scanner activation

Initial Scanner state is deliberately small:

~~~text
draft SQL + draft interval
→ explicit Activate
→ validate candidate
→ if invalid: keep previous active config
→ if valid: replace and persist one active SQL + interval
~~~

Editing draft state does not execute SQL.

No immutable query-version history, collaborative editor protocol or optimistic-concurrency subsystem is required.

If multiple Viewer activations race, the single runtime processes them deterministically; the last successfully processed activation is active.

## Read-only safety

User SQL is untrusted analytical input.

The Scanner allows one result-producing read-only statement and must prove its safety boundary on the exact pinned DuckDB-Wasm build.

Use:

- parser/engine-backed statement classification;
- the smallest available DuckDB hardening controls;
- a representative allowed/blocked regression corpus.

Regex-only classification is insufficient.

Block mutation, DDL, transaction control, admin/configuration changes, external access, extension loading and multi-statement execution from the user-SQL path.

Trusted application schema/admin SQL remains a separate application-controlled path.

## Execution policy

Initial scheduling is intentionally simple:

~~~text
successful Activate
→ run promptly
→ repeat opportunities every configured interval
→ if one Scanner execution is still running: do not start another
→ no burst replay of missed opportunities
~~~

At most one Scanner execution runs at a time.

If query A is still running when B becomes active, A may finish but its result remains attributable to A. Only minimal in-memory config/execution identity is needed for this.

Scanner SQL or interval changes never change collector/provider cadence.

Hard cancellation/preemption is not a baseline requirement.

## Restart

~~~text
runtime restart
→ SQL authority ready
→ load last successfully activated config
→ discard interrupted/old in-memory execution state
→ execute active SQL fresh
~~~

There is no requirement to reconstruct old execution objects, old result tables, scheduler anchors or cancellation state.

## Result boundary

C08 owns Scanner execution/safety/state. C09 owns user-facing result rendering/integration.

Core result semantics remain:

- zero rows is success;
- query error is explicit;
- result belongs to the config that produced it;
- query failure cannot corrupt market authority or turn a provider cycle into success;
- the Viewer does not add hidden filter/rank/sort/LIMIT semantics.

Streaming/chunking is conditional only if representative result-size evidence proves simple materialization unsafe or unusable.

## Resource evidence

The simple one-query-at-a-time design is measured before advanced resource machinery is added.

C11 later combines:

~~~text
normal collection + SQL persistence
+ Current/Detail reads
+ representative repeating Scanner query
~~~

Only measured problems may trigger targeted resource hardening such as a separate analytics connection, cancellation or streaming.

## Explicit non-goals for initial V2

Do not prebuild:

- fixed analytical horizons;
- mandatory persisted metrics;
- immutable query history;
- anchored scheduler machinery;
- collaboration/OCC;
- generic benchmark platform;
- mandatory streaming;
- advanced cancellation/preemption;
- generic migration/backfill for analytical enrichments;
- a final trading formula.

## Execution ownership

Current executable ownership:

~~~text
C07 / #79
→ representative real analytical SQL + measurement + optional O1 trigger

C08 / #80
→ simple safe Scanner core

C09 / #81
→ Scanner UI/results/integration

C11 / #83
→ representative mixed daily workload
~~~

Dependency rationale:
`browser-sql-compact-execution-dag.md`

Live progress remains only in `../STATUS.json`.
