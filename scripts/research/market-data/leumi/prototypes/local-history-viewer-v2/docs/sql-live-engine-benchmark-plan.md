# Browser SQL LIVE Engine — Benchmark Plan

This document defines benchmark requirements for the Browser SQL planning project.

It does not implement benchmarks or freeze final thresholds.

## Current architecture scope

Target: Browser SQL.

Leading candidate:

~~~text
DuckDB-Wasm + persistent browser storage
~~~

No localhost/native comparison belongs to the current planning scope.

If another browser SQL engine becomes a serious candidate during official research, use the same workload set for a focused comparison.

## Dataset tiers

Use sanitized deterministic synthetic data:

- small correctness;
- approximately one-hour-like history;
- 1M+ rows;
- 2M+ rows;
- full-trading-day-like multi-million rows when practical in Chromium.

Universe size and cadence are configuration, never invariants.

Current planning order of magnitude:

~~~text
~561 securities observed today
~5 second collection cadence
~404k snapshots/hour
multi-million snapshots/trading day
~~~

## Required SQL workloads

1. current-universe SELECT + representative WHERE;
2. ORDER BY / LIMIT ranking;
3. current/history temporal join;
4. recent-window GROUP BY;
5. HAVING;
6. useful window functions;
7. cross-security ranking;
8. arbitrary active-SQL replacement without code rebuild;
9. scheduled repeated execution;
10. intentional successful 0-row result;
11. intentional query error and isolation;
12. continuous ingest + commit + scheduled SQL;
13. reopen/recovery.

## Browser-specific dimensions

Plan measurement/observation for:

- WASM initialization;
- Worker startup;
- JS → Arrow/SQL/WASM conversion;
- bulk ingest;
- persistence/commit;
- SQL execution;
- result materialization;
- memory;
- GC effects where observable;
- DB/storage growth;
- reopen;
- refresh;
- hidden/background behavior;
- long-running stability;
- large result sets;
- concurrent UI/query/ingest.

## Metrics

Where meaningful:

- median;
- p95;
- max;
- sample count;
- dataset size;
- insert/enrichment duration;
- commit duration;
- query duration;
- result materialization;
- end-to-end scheduled-query latency;
- memory observations;
- DB/storage size;
- reopen time.

Correctness comes before timing interpretation.

## Performance interpretation

The LIVE path should have substantial headroom relative to cadence.

Tens of milliseconds to low hundreds are useful goals for central operations, not frozen contracts before benchmark evidence.

A query using most of a five-second interval is not comfortable headroom merely because it finishes before the next nominal tick.

## Run classes

The final plan must distinguish:

~~~text
Fast CI
Browser functional CI
targeted benchmark
heavy benchmark
long-running browser verification
live provider verification
~~~

Multi-million-row and long-running tests should not run on every commit by default.

## Decision output

Material conclusions use:

~~~text
Verified
Inferred
Unknown
~~~

The benchmark exists to show whether Browser SQL has adequate correctness/performance/stability headroom and where optimization is actually justified.
