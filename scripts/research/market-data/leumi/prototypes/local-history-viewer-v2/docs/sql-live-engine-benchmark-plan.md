# Browser SQL LIVE Engine — Performance and Benchmark Strategy

This is the Phase M planning artifact for Local History Viewer V2.

It defines representative datasets, benchmark environments, workload classes, metrics and decision gates for the Browser SQL target.

It does not implement the benchmark harness.

Durable decision: ../../../../../../../docs/project/decisions/D-034.md

## 1. Purpose

The benchmark answers one question:

> Does the selected Browser SQL architecture have enough correctness, latency, memory, storage and stability headroom for continuous live ingest plus repeated user SQL?

Performance tuning is evidence-driven. The benchmark is not a contest against localhost/native alternatives; those are outside the active architecture boundary.

## 2. Correctness is the first gate

No timing result is accepted if the run violates:

- complete-cycle atomicity;
- latest/current coherence;
- query committed-state isolation;
- no-overlap scheduler behavior;
- idempotent ingest recovery;
- raw/null/zero/missing preservation;
- database reopen correctness.

A fast incorrect run fails.

## 3. Workload parameters

Benchmark workload is parameterized rather than hardcoding the observed universe.

Canonical parameters:

~~~text
U = universe size
C = collection interval ms
Q = analytical query interval ms
T = simulated/live session duration ms
P = representative raw Security payload profile
~~~

Derived volume:

~~~text
cycles(T) = ceil(T / C)
snapshots(T) = U * cycles(T)
snapshotsPerHour = U * ceil(3_600_000 / C)
~~~

The currently observed ~561 securities and ~5s cadence are a useful representative profile only. Every run records its actual U/C/Q/T.

## 4. Synthetic data fidelity

Use deterministic sanitized synthetic data.

The generator should preserve performance-relevant characteristics:

- realistic count of fields;
- raw JSON shape compatible with preserved Security records;
- representative string/number/null distribution;
- bid/ask/last/deals promoted columns;
- dynamic universe IDs;
- changing values across cycles;
- temporal history sufficient for all core horizons;
- configurable raw JSON payload size.

At least two payload profiles:

~~~text
representative
large-payload stress
~~~

No private Leumi/session/account data belongs in benchmark fixtures.

## 5. Dataset tiers

### Tier 0 — functional smoke

Small U and a few cycles. Used only to validate the harness; not performance evidence.

### Tier 1 — horizon warm-up

Enough cycles to exceed the maximum 600-second core horizon at the configured cadence.

Purpose: measure temporal-link enrichment after all horizon columns become active.

### Tier 2 — one-hour-like

~~~text
rows = U * ceil(3_600_000 / C)
~~~

Purpose: normal interactive benchmark and repeated-query profile.

### Tier 3 — 1M rows

Engine/storage comparison point independent of a particular universe/cadence.

### Tier 4 — 2M rows

Large-history checkpoint for memory/query/storage trends.

### Tier 5 — representative full session

Use the currently intended/observed U, configured C and a recorded representative trading-session duration T.

Do not embed a fixed trading-day duration into schema or correctness logic.

### Tier 6 — 2x session stress

At least twice the representative session row volume.

Purpose: prove safety margin for memory/storage/query degradation and expose nonlinear behavior.

## 6. Benchmark environment

Every decision-grade run records:

- repository commit SHA;
- exact @duckdb/duckdb-wasm artifact/version;
- embedded DuckDB core version when observable;
- selected mvp/eh bundle;
- Chrome/Chromium version;
- OS/version;
- CPU model/logical cores when available;
- RAM/device-memory observation when available;
- benchmark U/C/Q/T;
- payload profile;
- database starting row count/size;
- cold vs warm run.

Primary production decision environment:

~~~text
Windows + Chrome/Chromium on representative user hardware
~~~

Linux GitHub-hosted Chromium may be used for repeatable regression/trend evidence but does not replace the target Windows decision run.

## 7. Repetition and warm-up

Decision-grade timing is not based on one lucky run.

Rules:

- exclude explicit engine/harness warm-up samples from steady-state percentiles;
- targeted/medium benchmarks: at least 5 independent repetitions where practical;
- heavy full-session/2x-session benchmarks: at least 3 independent runs for a final architectural claim;
- a single run may be exploratory only;
- record sample count with every percentile.

Use deterministic seeds so regressions can be reproduced.

## 8. Metrics

Report at least median, p95 and max where sample count is meaningful.

### Startup/recovery

- Worker creation;
- Wasm instantiate;
- database open;
- schema/readiness;
- populated reopen;
- time to SQL Authority READY.

### Ingest pipeline

- JS normalization;
- Arrow/equivalent batch construction;
- staging/import;
- snapshot insert;
- temporal enrichment;
- latest/current synchronization;
- transaction COMMIT;
- CHECKPOINT;
- full handoff-to-durable-ack latency.

### Query pipeline

- queue wait;
- SQL execution;
- Arrow streaming;
- full row-count consumption;
- Viewer preview materialization;
- end-to-end scheduled-result latency;
- result row count/bytes.

### Scheduler/mixed load

- scheduled-for vs started lateness;
- query coalesced tick count;
- cycle durable-ack delay;
- authority busy ratio;
- number/duration of ingest waits behind query;
- number/duration of query waits behind ingest;
- cadence drift/backlog trend.

### Memory

- JS heap observations where reliably available;
- Wasm/ArrayBuffer observations where available;
- browser process/renderer memory where the harness can obtain it;
- peak and post-GC/steady-state trends;
- OOM/crash events.

Memory APIs differ by environment; unavailable metrics are reported as unavailable, never fabricated.

### Storage

- OPFS database bytes when measurable;
- browser storage estimate usage/quota;
- bytes per snapshot;
- bytes per cycle;
- growth slope;
- CHECKPOINT/WAL effects where observable;
- reopen time as DB grows.

## 9. Isolated ingest workload

Feed complete validated cycles directly to the SQL Authority without provider-network timing.

Measure the entire durable path:

~~~text
handoff received
→ normalize/bulk relation
→ transaction + enrichment
→ COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

Run at Tier 1, Tier 2, 1M, 2M and full-session states.

This isolates SQL/storage cost from Leumi network latency.

## 10. CHECKPOINT workload

Measure COMMIT and CHECKPOINT separately as well as together.

Required comparisons:

- empty/small database;
- warmed horizon history;
- 1M+ rows;
- full-session database;
- representative vs large raw payload.

Purpose: verify the Phase I per-cycle CHECKPOINT policy is affordable rather than assuming it is.

If it is not affordable, the result triggers an explicit durability-design review; implementation must not silently weaken checkpoint policy.

## 11. SQL query suite

Required query classes:

### Q1 — current filter

Current universe + representative WHERE predicates.

### Q2 — current ranking

ORDER BY / LIMIT on promoted short-horizon metrics.

### Q3 — temporal link

Join current snapshots through a core prev_H_snapshot_id.

### Q4 — grouped recent analysis

GROUP BY + aggregate over recent/history data.

### Q5 — HAVING

Grouped result filtered through HAVING.

### Q6 — window/cross-security ranking

Window function over current/coherent security set.

### Q7 — raw future-field access

Read one preserved JSON field not promoted into a typed column.

### Q8 — larger historical scan

Representative bounded history query intended to expose degradation with DB size.

### Q9 — zero-row success

Valid query returning 0 rows.

### Q10 — large result stream

Enough rows to exercise streaming/counting + bounded Viewer preview without rewriting SQL.

Queries use synthetic product-shaped conditions, not a frozen trading formula.

## 12. Mixed LIVE workload

This is the primary architecture benchmark.

Run simultaneously:

~~~text
cycle generation at configured C
+ atomic ingest/enrichment/CHECKPOINT
+ active SQL at configured Q
+ result streaming/preview
+ Viewer state consumption
~~~

Use the actual single-authority priority rules.

Normal profile must not artificially pause ingestion while measuring queries or vice versa.

## 13. Normal vs stress profile

### Normal profile

Represents intended live operation.

Pass expectation:

- zero correctness violations;
- zero query-overlap violations;
- zero unbounded queue growth;
- zero coalesced analytical ticks for the designated normal query suite;
- no storage/memory/runtime errors;
- live loop retains required cadence headroom.

### Stress profile

Deliberately increases query cost, result size, payload size, row volume or cadence pressure.

Coalescing/delay may occur, but:

- correctness remains intact;
- ingest priority remains intact;
- pending query work stays bounded;
- no crash/corruption;
- degradation is observable.

Stress behavior is not evidence that the normal profile is fast enough.

## 14. Cadence-relative headroom gates

Absolute millisecond targets are secondary. Primary gates are relative to configured cadence.

Definitions:

~~~text
ingestServiceMs = validated handoff → durable acknowledgement
queryServiceMs  = query start → complete result accounting
ingestBudget    = C
queryBudget     = Q
~~~

For the designated normal profile:

### Isolated service headroom

~~~text
p95 ingestServiceMs <= 25% of C
p95 queryServiceMs  <= 25% of Q
~~~

This targets roughly 4x isolated service headroom.

### Mixed-load headroom

~~~text
p95 ingest end-to-end wait+service <= 50% of C
p95 query start-lateness+service   <= 50% of Q
~~~

This retains at least ~2x cadence headroom under representative contention.

### Scheduler gate

For the normal query suite:

~~~text
coalesced ticks = 0
overlapping queries = 0
~~~

Intentional overrun/stress scenarios are evaluated separately.

If these ratios prove unnecessarily strict or insufficient after real measurements, changing them requires a documented benchmark decision with evidence, not an ad-hoc optimization excuse.

## 15. Long-run stability gates

Representative full-session run must:

- complete without browser/Worker crash;
- complete without OOM;
- complete without DB/storage error;
- preserve all cycle/query correctness checks;
- show no sustained positive backlog trend;
- show no unexplained monotonic memory growth after warm-up;
- maintain query/ingest latency without uncontrolled degradation.

The 2x-session stress run is the memory/storage safety-margin gate.

Passing only a short 1M-row benchmark is insufficient for cutover.

## 16. Storage gate

Before cutover, a representative full-session and 2x-session synthetic dataset must fit in the observed target-browser origin quota without QuotaExceededError.

Record:

~~~text
bytes/snapshot
bytes/session
observed quota estimate
projected sessions before chosen warning/retention threshold
~~~

Phase M does not select automatic retention or a fixed quota-warning percentage.

## 17. Memory gate

Do not derive confidence from the theoretical Wasm 4GB ceiling alone.

Cutover evidence requires:

- full-session completion on target Windows/Chrome hardware;
- 2x-session stress completion or an evidence-backed equivalent capacity run;
- no monotonic leak trend;
- no browser OOM/renderer termination.

Memory optimizations are justified by measured evidence from these runs.

## 18. Reopen/recovery benchmark

At selected data tiers measure:

~~~text
close/refresh runtime
→ recreate Worker
→ open OPFS DB
→ WAL/recovery/schema readiness
→ restore scheduler/query state
→ READY
~~~

Reopen duration is reported and trended.

No hard startup millisecond gate is frozen yet because there is no product SLA for startup; correctness and absence of pathological growth are mandatory.

## 19. Hidden/background behavior

Measure a focused hidden/background-tab scenario because browser throttling is an explicit unknown.

Classify outcome:

~~~text
Verified acceptable
Degraded but observable
Unsupported for continuous recording
~~~

Do not silently treat visible-tab benchmark numbers as proof of hidden-tab behavior.

## 20. Benchmark harness architecture

Future harness should be deterministic and browser-realistic:

~~~text
offline seeded synthetic dataset generator
→ real generated Market Flow runtime
→ real DuckDB-Wasm Worker/Wasm
→ real OPFS
→ Chromium benchmark controller
→ machine-readable result artifact
~~~

Provider network calls are excluded from core engine timing.

A separate live-provider/endurance checkpoint may include real provider timing after the live compatibility gate.

## 21. Benchmark result artifact

Each run should emit a machine-readable artifact containing:

~~~text
environment + versions
dataset parameters
payload profile/seed
query suite/version
raw sample counts
median/p95/max metrics
memory/storage observations
correctness counters
coalesced/overlap counters
pass/fail gate results
notes / unavailable metrics
~~~

A short Markdown summary may be generated from the artifact; the machine-readable result is the evidence source.

## 22. Run classes

~~~text
Fast CI
Browser functional CI
targeted benchmark
heavy benchmark
full-session / 2x-session benchmark
long-running soak
live authenticated verification
~~~

Heavy benchmarks do not run on every commit.

Suggested trigger model:

- targeted benchmark: manual / relevant performance-sensitive change;
- heavy/full-session: implementation checkpoint, engine/schema change or pre-cutover gate;
- long soak: pre-cutover/release-quality checkpoint;
- live provider: only where mocks cannot prove behavior.

## 23. Optimization rule

Do not optimize from intuition.

Optimization order:

~~~text
benchmark
→ identify dominant measured cost
→ make smallest change
→ rerun same workload
→ verify correctness + improvement
~~~

Examples of later evidence-driven levers may include Arrow batch shape, promoted columns, query shape, checkpoint strategy or physical schema, but none are changed merely because they sound faster.

## 24. Evidence labels

Every material conclusion is classified:

~~~text
Verified = measured in the stated environment/workload
Inferred = supported by related evidence but not directly measured
Unknown  = not yet established
~~~

Never present Linux CI timing as verified Windows production timing.

## 25. Phase M completion result

The Browser SQL target now has an actionable benchmark contract:

~~~text
parameterized representative data
+ 1M/2M/full-session/2x-session tiers
+ isolated ingest/CHECKPOINT/query workloads
+ mixed LIVE workload
+ memory/storage/reopen/hidden-tab observations
+ cadence-relative headroom gates
+ deterministic machine-readable evidence
~~~