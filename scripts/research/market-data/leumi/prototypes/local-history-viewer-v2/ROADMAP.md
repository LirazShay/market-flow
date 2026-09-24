# Local History Viewer V2 — Roadmap

This file owns V2 plan, scope and order only.

Live progress, current stage, verification state and the exact next pointer belong only in STATUS.json.

V2 starts from the frozen V1 implementation but evolves independently. V1 remains a read-only reference.

## Program principles

The V2 IndexedDB investigation follows these rules:

- evidence before architecture verdicts;
- reuse verified V1 behavior instead of rebuilding it without cause;
- preserve complete raw provider records;
- preserve complete-cycle validation and atomic successful-cycle persistence;
- keep IndexedDB as the browser-local source of truth unless evidence justifies changing that boundary;
- compute cheap, repeatedly useful facts once during ingest;
- use latest for elimination-first live filtering;
- read targeted indexed history only for survivors;
- benchmark before adding workers, caches, SQL engines or a localhost backend;
- distinguish runtime-performance limits from query/developer ergonomics;
- use sanitized synthetic benchmark data only.

The current product direction is owned by:

~~~text
docs/product/live-opportunity-discovery.md
~~~

The detailed IndexedDB evaluation design is owned by:

~~~text
docs/indexeddb-live-analytics-evaluation.md
docs/indexeddb-live-analytics-benchmark-plan.md
docs/indexeddb-live-analytics-decision-framework.md
~~~

## Bootstrap — independent V2 baseline

Scope:

- exact copy of the complete V1 workstream as the starting point;
- preserve V1 unchanged beside V2;
- isolate V2 IndexedDB, BroadcastChannel, Viewer window/marker and runtime artifact names;
- create V2-specific Fast CI and Browser CI;
- verify the inherited baseline after isolation.

## Scope definition — define the new V2 direction

Scope:

- capture the broader product direction;
- separate stable product requirements from technical hypotheses;
- identify inherited V1 contracts that remain valuable;
- define the IndexedDB evaluation question without prematurely selecting a replacement engine.

## IndexedDB Live Analytics Evaluation Program

The stages below define order and scope. They do not imply current completion state.

### Stage 01 — Baseline characterization

Establish the exact V2 starting point:

- current stores, keys and indexes;
- current successful-cycle transaction boundary;
- current history/latest read paths;
- existing storage-growth evidence;
- existing browser tests that protect persistence and recovery;
- reusable V1/V2 components;
- gaps relative to the new analytical requirements.

Deliverable: evidence-backed baseline inventory.

### Stage 02 — Provider semantics audit

Verify the provider fields needed for enrichment, especially LAST, BID1, ASK1, the cumulative deals-count candidate field, collection timestamps and timing semantics.

Classify each material claim as Verified, Inferred or Unknown.

Deliverable: explicit provider-field contract/evidence map.

### Stage 03 — Logical analytical snapshot model

Define the logical V2 row contract without yet freezing a physical schema:

- stable SnapshotId distinct from SecurityId;
- SecurityId;
- CycleId / SessionId;
- collected timestamp;
- complete raw provider record;
- core same-row derived values;
- eight temporal references;
- eight LAST-change metrics;
- eight deals-delta metrics;
- null semantics.

Deliverable: logical model and invariants.

### Stage 04 — Temporal reference semantics and resolution design

Define how the eight horizons resolve to immutable historical snapshot references:

~~~text
10s, 20s, 30s, 60s, 90s, 120s, 300s, 600s
~~~

Compare simple candidate algorithms and recovery/bootstrap behavior. Avoid a design requiring securityCount × horizonCount random IndexedDB searches per cycle unless benchmarks prove it acceptable.

Deliverable: reference-resolution contract and candidate algorithms.

### Stage 05 — Ingest enrichment contract

Define deterministic enrichment behavior for MID, temporal references, LastChange, DealsDelta, unavailable history, invalid/missing provider values and immutable historical context.

Deliverable: public/pure behavior contract suitable for tests-first implementation.

### Stage 06 — Physical schema and index alternatives

Compare the smallest plausible physical designs, including:

- reuse of history/latest/cycles;
- SnapshotId representation;
- temporal-reference storage shape;
- fixed core metric columns versus more generic structures;
- compound indexes;
- schema-version migration/rebuild strategy.

Do not choose flexibility abstractions without a measured need.

Deliverable: benchmarkable schema candidates.

### Stage 07 — Live query path design

Define the intended live path:

~~~text
read latest
→ cheap elimination
→ rank/filter current universe
→ targeted indexed history for survivors
→ aggregate/custom comparisons
→ final qualification/ranking
~~~

Define representative public workloads, not a final trading formula.

Deliverable: query-path contract and workload mapping.

### Stage 08 — Synthetic benchmark harness

Build sanitized deterministic data generation and browser benchmark instrumentation.

Required capabilities:

- configurable universe size;
- realistic cadence/timestamps;
- raw-record-like payload shape without private provider data;
- precomputed fields and references when required;
- repeatable dataset seeds;
- median / p95 / max reporting where meaningful;
- separate setup/load time from measured query time.

Deliverable: reusable benchmark harness.

### Stage 09 — Baseline-scale IndexedDB benchmarks

Measure representative workloads near one hour of data, approximately the 400k-row order of magnitude for the current representative universe/cadence.

Measure at least latest read, latest filtering, sorting/ranking, one-security recent history, 5/10/20/50-security recent history and a precomputed historical condition count.

Deliverable: first real latency evidence.

### Stage 10 — Million-row scale benchmarks

Extend to larger stores:

~~~text
1M+
2M+
full-trading-day-like scale when practical
optional multi-day/heavy local experiment
~~~

Do not make normal CI depend on a multi-million-row performance run.

Deliverable: scaling curve and storage observations.

### Stage 11 — Write and transaction throughput

Measure one coherent large successful-cycle transaction, a representative full-universe enriched cycle, commit latency and sustained repeated-cycle behavior.

Deliverable: ingest/write headroom evidence.

### Stage 12 — Temporal-reference and enrichment throughput

Measure candidate reference-resolution approaches and enrichment cost.

Key question:

Can the collector resolve eight historical references and derive the core metrics for the whole current universe with large headroom relative to cadence?

Include refresh/bootstrap cost when relevant.

Deliverable: chosen or rejected reference-resolution approach with numbers.

### Stage 13 — Latest elimination and cross-security ranking

Measure repeated live filtering/ranking over the current universe and verify that the elimination-first path reduces later historical work as intended.

Deliverable: current-universe live-query evidence.

### Stage 14 — Targeted history and arbitrary comparison workloads

Measure recent history for survivor sets, counts based on persisted LastChange-like fields, direct previous-snapshot lookups, arbitrary cross-snapshot field comparisons and repeated operations over one-hour windows.

Deliverable: targeted-history analytical evidence.

### Stage 15 — Mixed ingest + repeated live-query workload

Run ingestion and analytics together.

Representative pattern:

~~~text
ingest current cycle
+
persist atomically
+
run current live query
+
targeted history aggregation
+
repeat around the representative cadence
~~~

Measure contention, latency distribution and stability.

Deliverable: realistic mixed-workload evidence.

### Stage 16 — Recovery, atomicity, memory and browser stability

Verify refresh/reopen bootstrap, immutable temporal references, enriched-cycle atomicity, history/latest coherence, memory observations for targeted JS aggregation, browser storage-size observations and long-running behavior where practical.

Deliverable: operational browser evidence.

### Stage 17 — Architecture decision gate

Classify the evidence and choose the minimum sufficient architecture:

1. IndexedDB + JavaScript analytics;
2. IndexedDB source of truth + a small analytical layer;
3. browser collector + localhost engine.

The decision must state which workloads were Verified, which conclusions remain Inferred, what remains Unknown, the exact bottleneck if IndexedDB is rejected, whether the problem is performance or only query ergonomics, and the minimum additional mechanism required.

Deliverable: durable evidence-backed architecture decision.

### Stage 18 — V2 implementation contract and execution plan

Map the approved architecture into V2:

- retained/replaced/removed inherited behavior;
- affected/new V2 specs;
- schema/migration plan;
- tests-first vertical implementation slices;
- browser verification gates;
- live verification needs;
- performance regression strategy.

Deliverable: verified next implementation direction.

## Post-decision implementation track

The exact implementation track is intentionally conditional on Stage 17 evidence. If the selected direction keeps the current V2 browser architecture, the likely order is:

1. schema/version and migration/rebuild mechanism;
2. SnapshotId + horizon definition owner;
3. temporal-reference bootstrap/resolution;
4. pure enrichment functions and unit tests;
5. enriched atomic cycle persistence;
6. targeted history/read APIs;
7. elimination-first analytical pipeline;
8. candidate/result read model and diagnostics;
9. performance/regression safeguards;
10. browser integration and live provider verification.

If Stage 17 selects a hybrid or localhost analytical layer, Stage 18 must replace this tentative sequence with the smallest architecture-specific plan.

## Explicit non-goals

This program does not define final trading strategy, final momentum/ranking formula, buy/sell execution, final thresholds, a final distinct-wave algorithm, WAF/access-control bypass, a mandatory SQL engine or a mandatory Worker architecture.
