# SQL LIVE Engine — Benchmark Plan

The benchmark compares SQL-capable candidates under one common workload.

## Candidates

Primary:

1. DuckDB-Wasm + OPFS in browser.
2. Native DuckDB behind localhost.

Optional control:

3. SQLite only where it answers a concrete design question.

## Dataset tiers

Use sanitized deterministic synthetic data.

Tiers:

- smoke/correctness;
- approximately one-hour-like history;
- 1M+ rows;
- 2M+ rows;
- full-trading-day-like multi-million rows when practical.

Universe size and cadence are configuration, never hardcoded invariants.

## Required SQL workloads

### Q1 — Current universe

Return one latest row per security and apply representative WHERE filters.

### Q2 — Ranking

ORDER BY one or several recent metrics with LIMIT.

### Q3 — Recent history join

Join current/latest rows to historical rows for selected time relationships.

### Q4 — Time-window aggregation

GROUP BY SecurityId over a recent period with aggregates.

### Q5 — HAVING

Filter securities by historical aggregate conditions.

### Q6 — Window functions

Use LAG/LEAD/ROW_NUMBER or similar SQL window logic where it naturally expresses temporal analysis.

### Q7 — Cross-security ranking

Rank the current universe relative to other securities.

### Q8 — Arbitrary query change

Swap the active SQL text without restarting/rebuilding the collector.

### Q9 — Scheduled execution

Execute the active SQL every configured interval while data is unchanged.

### Q10 — Mixed live load

Continuous cycle ingest + commit + scheduled SQL.

## Ingest workloads

Measure:

- one full representative cycle insert;
- atomic commit;
- repeated cycles;
- database growth;
- startup/reopen/recovery.

## Metrics

Where meaningful:

- median;
- p95;
- max;
- write/commit duration;
- SQL execution duration;
- result materialization duration;
- end-to-end scheduled-query latency;
- memory observation;
- file/storage size;
- restart/reopen duration.

Correctness is asserted before performance.

## Scheduler evidence

Verify:

- configurable X seconds;
- no accidental uncontrolled overlap;
- query failure does not stop ingest;
- later successful executions recover normally;
- result metadata identifies query version and execution time.

## Decision output

The comparison must end with a table of Verified / Inferred / Unknown findings and select the minimum sufficient architecture, not the most elaborate one.
