# Browser SQL V2 — Enrichment Decision Benchmark Plan

## Role

This is Pass E6 of Issue #72.

It defines the focused benchmark used to decide the physical analytical-enrichment design before schema freeze.

This is not the final V2 capacity benchmark. It answers narrower questions:

~~~text
Which analytical work is worth persisting?
Which should remain query-time SQL?
Which horizons/typed fields/indexes materially help?
What write/storage/reopen cost does each choice introduce?
~~~

Planning only. No runtime/product implementation and no canonical GitHub Issue mutation.

Detailed enrichment authority: browser-sql-enrichment-implementation-manual.md.

Baseline dependency: ND-17B raw persistence/storage/reopen evidence.

---

# 1. Decision-first benchmark rule

Every benchmark case must name the decision it is intended to inform.

Valid pattern:

~~~text
candidate design question
→ baseline
→ controlled alternative
→ same workload/data
→ correctness validation
→ measured delta
→ persist / query-time / defer / reject
~~~

Invalid pattern:

~~~text
benchmark many mechanisms
→ collect numbers
→ decide later what they meant
~~~

Do not benchmark hypothetical complexity without a real decision owner.

---

# 2. Required compared variants

Use the same deterministic dataset and query suite for each applicable comparison.

## V0 — raw V1-on-SQL baseline

~~~text
raw/current/history persistence
+ required trusted-read indexes only
+ no enrichment-specific predecessor links
+ no enrichment-derived metrics
~~~

This is the cost floor and reference.

## V1 — dynamic SQL analytical baseline

Same physical data as V0, but execute representative analytical queries dynamically from raw/history data.

Purpose: prove whether precomputation is needed at all.

## V2 — selected predecessor persistence

Add only candidate predecessor references selected for the experiment.

No persisted derived metric unless the case specifically tests it.

## V3 — selected predecessor + metric persistence

Add the exact candidate metrics under decision.

## V4 — optional typed/indexed promotion

Add one or a small coherent group of promoted fields/indexes whose value is being tested.

Do not create one giant 'max optimized schema' variant because it prevents attributing benefit/cost.

---

# 3. Candidate isolation

Prefer one-variable or one-coherent-bundle comparisons.

Examples:

~~~text
V1 dynamic 30s LAST change
vs
V2 persisted 30s predecessor only
vs
V3 persisted predecessor + last_change_30s_pct
~~~

and separately:

~~~text
raw JSON BID1 filter
vs
typed bid1 column
vs
typed bid1 + justified index
~~~

This makes the source of performance improvement measurable.

---

# 4. Dataset profiles

Use deterministic synthetic datasets shaped like the real collector contract.

Every dataset records actual parameters rather than assuming a fixed universe size.

Required profiles:

## D1 — short warm-up

Enough cycles to exercise:
- no predecessor;
- partial horizons available;
- all selected short horizons available.

Purpose: correctness and warm-up behavior, not performance claims.

## D2 — representative intraday slice

Enough rows to represent realistic steady-state history for repeated analytical queries.

Purpose: primary persist-vs-query decision workload.

## D3 — large intraday/session-scale

Enough history to expose scaling differences between dynamic joins/window queries and persisted references.

Purpose: ensure a choice does not look good only on tiny data.

## D4 — safety-margin stress

Larger-than-representative history and/or payload profile.

Purpose: detect pathological growth; not the normal-user performance target.

Exact row counts are parameters chosen from measured V1-on-SQL cycle size/cadence, not hardcoded product invariants.

---

# 5. Payload profiles

At minimum support:

~~~text
compact synthetic Security JSON
representative field-count/payload size
larger safe synthetic payload
~~~

All payloads are sanitized synthetic data.

Storage conclusions must record which payload profile produced them.

---

# 6. Horizon workloads

For each candidate horizon set, measure representative query patterns rather than merely column access.

Minimum analytical patterns:
- single-security predecessor lookup;
- current-universe LAST-change filter;
- ORDER BY/LIMIT ranking by short-horizon move;
- multi-horizon predicate;
- current ASK1 versus historical BID1;
- current BID1 versus historical ASK1;
- GROUP BY/HAVING over recent qualifying history;
- cross-security rank;
- one window-function formulation where it is a realistic alternative.

If a horizon has no representative consumer/query, it has no benchmark justification for persistence.

---

# 7. Typed-promotion workloads

For each candidate promoted field compare:

~~~text
raw JSON extraction
vs typed column
vs typed column + index only if index is plausible/useful
~~~

Measure both:
- common filter/order query;
- ingest/write overhead.

A typed column may still be selected for semantics/ergonomics even when speedup is modest, but that rationale must be explicit.

---

# 8. Metrics collected per run

Every variant records at least:

## Ingest
- validated-cycle staging time;
- enrichment computation time where applicable;
- transaction/COMMIT time;
- CHECKPOINT time;
- durable acknowledgement service time;
- p50/p95/max after warm-up.

## Query
- query service time;
- p50/p95/max;
- returned row count;
- result bytes or bounded estimate;
- query correctness checksum/assertions.

## Storage
- DB bytes before/after workload;
- bytes/cycle;
- bytes/snapshot;
- storage amplification versus V0;
- WAL/CHECKPOINT effects where observable.

## Reopen
- DB open/recovery/readiness duration at selected tiers;
- first trusted read after reopen.

## Resource/health
- memory observations where reliable;
- errors/crashes;
- backlog or waiting time when mixed workload is exercised.

Unavailable measurements remain Unknown/unavailable. Do not synthesize values.

---

# 9. Correctness-first benchmark invariant

A timing result is usable only if the run also passes the relevant correctness assertions.

At minimum:
- exact row/cycle counts;
- no partial committed cycle;
- predecessor identity is correct;
- selected formula outputs match deterministic oracle;
- null/zero/empty/missing semantics preserved;
- no duplicate snapshots;
- current/latest coherence;
- rebuildability spot-check where persisted enrichment exists.

A faster incorrect variant is FAIL, not a candidate winner.

---

# 10. Warm-up and measurement protocol

For each environment/variant/workload:

~~~text
prepare deterministic DB
→ run correctness setup checks
→ execute warm-up iterations
→ discard warm-up timing
→ execute measured repetitions
→ capture raw samples
→ compute summary statistics
~~~

Use enough repetitions to make p50/p95 meaningful for the workload.

Do not select a design from one wall-clock sample.

Heavy storage/session runs may have fewer repetitions, but must still record repeated or independently reproducible evidence where practical.

---

# 11. Noise control

Machine-readable benchmark evidence records:
- OS;
- browser/version;
- CPU architecture/category where available;
- DuckDB/Wasm identity;
- commit/build;
- dataset seed/version;
- row/cycle counts;
- payload profile;
- query-suite version;
- warm-up count;
- measured iteration count.

For regression-style comparisons, compare variants within the same run/environment whenever possible.

Do not compare an Ubuntu CI number directly against a Windows number and infer a schema winner from the absolute difference.

---

# 12. Environment classes

## Linux Chromium CI

Use for:
- deterministic relative comparisons;
- regression trends;
- query-shape experiments;
- correctness-backed timing.

## Windows Chromium GitHub Actions

Use for:
- target-OS comparative sanity;
- Worker/Wasm/OPFS behavior;
- selected enrichment design confirmation.

## Exact user machine / live origin

Not required to choose every enrichment column.

Use later for release/capacity/live claims that genuinely depend on the real target environment.

No environment class may masquerade as another.

---

# 13. Decision metrics: benefit

For each persisted candidate quantify benefit relative to V1 dynamic SQL.

Useful measures:

~~~text
query latency reduction
CPU/service-time reduction where observable
query-plan simplicity
reduced repeated historical scanning
reduced memory/result intermediate size
SQL ergonomics / stable semantics
~~~

Performance benefit should be shown on the representative query patterns that actually consume the candidate.

---

# 14. Decision metrics: cost

Quantify cost relative to V0/V1:

~~~text
extra ingest ms/cycle
extra CHECKPOINT ms/cycle
extra bytes/snapshot
extra bytes/session
extra reopen cost
extra migration/backfill complexity
extra schema/index complexity
~~~

Do not hide migration/maintenance cost because a query becomes faster.

---

# 15. Persist-vs-query decision rule

A candidate may be selected for persistence only when all mandatory semantic/correctness gates are green and the evidence shows a real benefit worth its cost.

Decision template:

~~~text
Candidate: <id>
Semantics: Verified / Inferred / Unknown
Representative consumers: ...
Dynamic SQL p95: ...
Persisted SQL p95: ...
Ingest overhead: ...
Storage amplification: ...
Reopen delta: ...
Complexity delta: ...
Decision: persist | query-time | defer | reject
Reason: ...
~~~

No universal percentage speedup threshold is frozen in planning because query importance and cost differ by candidate.

But 'persist' requires an explicit evidence-backed reason; absence of proof defaults to query-time/defer, not persistence.

---

# 16. Horizon-set decision rule

Evaluate horizons incrementally.

Do not benchmark only:

~~~text
zero horizons
vs all eight horizons
~~~

because that cannot identify low-value horizons.

Use at least:
- short-horizon bundle driven by real product needs;
- medium-horizon additions;
- long-horizon additions;
- any individually controversial horizon.

For each addition record marginal query benefit and marginal ingest/storage cost.

Final horizon set is the smallest set that earns its persistence.

---

# 17. Predecessor-link decision rule

Separate these questions:

~~~text
Should a horizon exist?
Should its predecessor identity be persisted?
Should a derived metric also be persisted?
~~~

It is valid to choose:

~~~text
persist predecessor link
+ compute multiple derived comparisons dynamically
~~~

if that gives most of the query benefit with less schema/write amplification.

This comparison is mandatory before defaulting to link+metric pairs.

---

# 18. Index decision rule

Every enrichment-specific index must name:
- target query;
- measured query benefit;
- ingest/storage penalty;
- whether DuckDB already optimizes the access pattern adequately without it.

Indexes are not added 'just in case'.

---

# 19. Mixed-load check before design freeze

For the leading candidate design, run a focused mixed workload:

~~~text
continuous representative cycle ingest
+ representative analytical query repetition
~~~

Purpose:
- detect enrichment write cost that starves reads;
- detect query design that creates growing ingest wait;
- reveal interactions invisible in isolated timing.

This is not the final Scanner/resource-isolation benchmark.

If mixed-load contention appears material, record it as input to later Scanner/resource planning rather than prematurely adding complex cancellation machinery here.

---

# 20. Storage projection

Compute projections from measured bytes, not guessed schema widths:

~~~text
bytesPerSnapshot
× measured/expected snapshotsPerCycle
× cyclesPerSession
→ projectedSessionBytes
~~~

Record range across payload profiles.

Use this to compare candidate enrichment amplification.

Do not decide archive/rollover in E6; that remains a later capacity decision.

---

# 21. Reopen impact

At representative and large tiers compare:

~~~text
V0 raw DB reopen/readiness
vs
candidate enriched DB reopen/readiness
~~~

Reject or revisit a design that causes pathological growth even if query latency improves.

No hard startup SLA is invented here.

---

# 22. Benchmark result artifact

Each decision run emits machine-readable evidence conceptually containing:

~~~text
benchmarkSchemaVersion
decisionId
variantId
repositoryCommit
runtimeBuildId
schemaVariant
environment
dataset
payloadProfile
querySuiteVersion
correctness
rawSamples
summaryStats
storage
reopen
decisionInputs
~~~

Derived Markdown summaries are convenience only.

Raw machine-readable benchmark results are the evidence source.

---

# 23. Decision reproducibility

A decision is reproducible when another implementation chat can:

~~~text
checkout the candidate commit
→ generate the named dataset seed
→ run the named variants/query suite
→ reproduce correctness assertions
→ obtain directionally consistent relative results
~~~

Exact milliseconds need not match across hardware.

The selected design must not depend on an unexplained one-machine anomaly.

---

# 24. Regression threshold policy

Do not turn noisy benchmark numbers into flaky CI gates.

Use:

~~~text
correctness = hard gate
large/pathological regression = hard or checkpoint gate
small timing movement = trend/report unless evidence supports a stable threshold
~~~

Candidate selection uses controlled paired comparisons rather than arbitrary global latency limits.

Cadence-relative release gates remain owned by later integrated capacity work.

---

# 25. Optimization loop

If a candidate is too expensive:

~~~text
identify dominant measured cost
→ smallest design/SQL change
→ rerun exact same workload
→ compare correctness + cost + benefit
→ keep or revert
~~~

Do not stack multiple optimizations into one experiment.

---

# 26. Required decision outputs before ND-19

E6 evidence must allow ND-18 to freeze:
- final persisted horizon subset, if any;
- predecessor-link persistence decisions;
- derived-metric persistence decisions;
- typed-promotion decisions;
- index decisions;
- selected predecessor semantics where performance is relevant;
- expected ingest/storage overhead;
- query-time alternatives retained;
- rejected/deferred candidates.

Each selected persisted item links to benchmark evidence and semantic evidence.

---

# 27. ND-20 benchmark revalidation

After ND-19 implements the selected physical design, rerun the same benchmark suite against the actual implementation.

Compare:

~~~text
pre-freeze experiment
vs
actual schema/implementation
~~~

If actual cost/benefit materially differs, ND-20 may:
- remove a metric;
- remove an index;
- reduce horizons;
- move a metric back to query-time;
- require a simpler implementation.

Schema work already invested is not a reason to keep a losing design.

---

# 28. E6 anti-goals

Do not use E6 to:
- choose Scanner scheduling policy;
- choose large-result streaming architecture;
- set final archive/rollover policy;
- claim exact Windows/user-machine production latency from Linux CI;
- optimize undefined wave detection;
- benchmark a final trading formula;
- hardcode universe size.

---

# 29. E6 exit criteria

Pass E6 planning is complete when implementation can answer without guessing:
- which variants are compared;
- which datasets/query patterns are required;
- which metrics are recorded;
- how warm-up/noise/repetition are handled;
- how correctness gates timing evidence;
- how one candidate's benefit/cost is isolated;
- how horizons/links/metrics/promotions/indexes are decided separately;
- how storage/reopen impact is included;
- how machine-readable evidence is reproduced;
- what outputs ND-18 consumes before schema freeze;
- why final capacity/Scanner benchmarking remain later work.
