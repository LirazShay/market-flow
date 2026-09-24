# IndexedDB Live Analytics — Benchmark Plan

This document defines the durable benchmark design for the V2 IndexedDB evaluation.

It contains no live benchmark results. Current results and progress belong in ../STATUS.json or archived evidence documents when a benchmark unit closes.

## 1. Benchmark goals

Measure separately:

- write throughput;
- transaction commit latency;
- current-universe read/filter/rank latency;
- targeted historical read latency;
- aggregation latency;
- temporal-reference resolution cost;
- arbitrary historical-reference lookup cost;
- mixed ingest/query behavior;
- scale behavior as history grows;
- browser memory/storage observations.

## 2. Synthetic data

Use sanitized deterministic synthetic data only.

The generator must support configurable universe size, cycle count, cadence/jitter, raw-record payload width, price/deal evolution, session/cycle timestamps, optional precomputed metrics and optional temporal references.

A representative default may be near the current real-world order of magnitude, but no fixed universe size becomes a system invariant.

## 3. Scale tiers

### Fast correctness/perf-smoke tier

Used to validate harness correctness and catch catastrophic regressions. It is not production-scale performance evidence.

### One-hour-like tier

Representative order of magnitude:

~~~text
~400k snapshots
~~~

for a roughly 561-security, roughly 5-second cadence scenario.

### Million-row tiers

At minimum when practical:

~~~text
1M+
2M+
full-trading-day-like multi-million scale
~~~

### Heavy local tier

Optional larger/multi-day experiments run outside normal CI.

## 4. Required workloads

### W1 — Read all latest

Read the current row set for the whole universe.

### W2 — Filter latest

Use representative precomputed fields such as DealsDelta120s and LastChange30s/60s. Thresholds are benchmark inputs, not trading rules.

### W3 — Sort/rank current rows

Sort all latest rows or survivors by one or more precomputed fields.

### W4 — Read recent history for one security

Use the intended index/range path for a one-hour-like time window.

### W5 — Read recent history for survivor sets

Measure survivor counts:

~~~text
5
10
20
50
~~~

### W6 — Count a persisted historical condition

Example: count LastChange120sPct >= X over a one-hour window.

### W7 — Arbitrary temporal-reference comparisons

Fetch referenced full rows and compare fields not precomputed as permanent metrics.

### W8 — Current-cycle ingest

Measure pure enrichment, IndexedDB write scheduling and transaction completion for one representative full-universe cycle.

### W9 — Mixed cycle + live query

~~~text
ingest
→ commit
→ latest filter/rank
→ targeted history aggregation
~~~

### W10 — Repeated mixed workload

Repeat around the representative collection cadence while the database continues to grow.

### W11 — Recovery/bootstrap

Measure bounded bootstrap needed to rebuild any in-memory recent-history helper after refresh.

### W12 — IndexedDB access primitives

Where material, compare get, getAll, openCursor, IDBKeyRange and compound-index queries in real query paths.

## 5. Temporal-reference benchmark variants

At minimum compare:

1. direct IndexedDB historical lookup;
2. bounded rebuildable recent-history working set.

Only add more variants if evidence exposes a concrete need.

Measure resolution latency per cycle, bootstrap time, memory observations, cadence-jitter correctness and missing-history behavior.

## 6. Metrics

For repeated measurements report when meaningful:

~~~text
median
p95
max
sample count
dataset size
universe size
cycle count
browser/runtime identity
~~~

Record component timings:

~~~text
write/enrichment time
transaction completion time
read time
filter time
aggregation time
total live-query latency
~~~

Storage size and memory may be approximate if browser APIs do not expose stable precision. Avoid pseudo-precision.

## 7. Measurement method

Use browser-native monotonic timing such as performance.now.

Rules:

- separate fixture/database setup from measured query execution;
- warm up code paths where JIT/cache effects matter;
- exclude console formatting from timed sections;
- use deterministic query inputs;
- repeat enough times for median/p95 to be meaningful;
- preserve compact raw samples or machine-readable summaries when useful;
- avoid sleeps as a measurement mechanism;
- record browser/environment identity for evidence reports.

## 8. Correctness before speed

Every performance workload must assert correct observable results.

Examples:

- returned SecurityIds are correct;
- time ranges exclude out-of-window rows;
- missing history remains null;
- references resolve to the intended security;
- counts match fixture expectations;
- atomic failure leaves the previous consistent state.

A fast wrong query is not a successful benchmark.

## 9. CI strategy

Fast CI gets deterministic unit/guard tests and lightweight harness correctness checks.

Browser CI gets IndexedDB semantics and moderate-size targeted experiments when runtime remains reasonable.

Million-row/full-day-like performance runs should be explicit/manual or otherwise isolated from normal fast feedback unless later evidence shows they are cheap enough.

Stage closure still follows the workstream testing policy.

## 10. Performance interpretation

The representative collection cadence is a comparison point, not yet a frozen SLA.

Preferred central live operations should show substantial headroom.

Interpretation aids:

- low tens of milliseconds: strong headroom;
- low hundreds: potentially acceptable depending on mixed load;
- near-second latency: investigate before accepting;
- multi-second central live path: likely incompatible without redesign.

Always report actual measurements and environment.

## 11. Storage-growth interpretation

Total row count alone is not a failure condition.

The key question is whether indexed targeted access remains stable enough as unrelated history accumulates.

For each scale tier compare one-security range-read latency, survivor-set range-read latency, latest read latency and mixed-workload latency.

## 12. Decision evidence package

Before the architecture decision stage, evidence should support a table like:

| Capability | Scale | Median | p95 | Max | Classification |
|---|---:|---:|---:|---:|---|
| latest read | current universe | ... | ... | ... | Verified |
| latest filter/rank | current universe | ... | ... | ... | Verified |
| one-security 1h history | ... rows | ... | ... | ... | Verified |
| 20-security 1h history | ... rows | ... | ... | ... | Verified |
| enriched cycle commit | ... rows | ... | ... | ... | Verified |
| mixed workload | ... total history | ... | ... | ... | Verified |

Unknowns remain explicit rather than being filled with extrapolated precision.
