# Browser SQL V2 — Analytical Enrichment Implementation Manual

> **Reference-only / superseded implementation guidance.** Initial V2 has no mandatory enrichment mini-project. C07 first measures real SQL; only evidence may create focused O1 work. Do not implement the ND-18..ND-21 sequence from this file.


## Role

This is Pass E5 of Issue #72.

It is the implementation manual for the analytical-enrichment mini-project:

~~~text
proven V1-on-SQL product
→ semantic evidence
→ analytical-value experiments
→ benchmark-informed persist-vs-query choices
→ concrete schema evolution
→ set-based enrichment
→ correctness/performance checkpoint
~~~

This document is planning-only. It does not implement product/runtime code and does not mutate the canonical GitHub Issue graph.

Dependency authority: browser-sql-rebaseline-dependency-dag.md Pass D3.

Entry gate: ND-16 V1-on-SQL checkpoint must be complete and ND-17B raw persistence/storage/reopen baseline must exist.

---

# 1. Scope

This mini-project owns ND-18, ND-19 and ND-20.

It does not own:
- Dynamic SQL Scanner product behavior;
- final production ownership/cutover;
- archive/rollover unless later capacity evidence promotes it;
- distinct-wave/event detection;
- final trading formula;
- arbitrary future metrics merely because they are imaginable.

ND-21 selective Current/Detail exposure happens after the enrichment checkpoint and is planned separately.

---

# 2. Re-baseline authority over older enrichment drafts

Older Phase F/G documents are valuable design evidence, but they predate the product-first re-baseline.

The following older selections are therefore **candidates, not implementation commands**, until re-approved by this mini-project:

~~~text
8 fixed persisted horizons
wide prev_H / last_change_H / deals_delta_H columns
at-or-before predecessor rule
initial typed promotion set
MID positivity rule
set of persisted derived metrics
~~~

If the final E5 decision differs from an existing durable decision such as D-027/D-028, Pass G must supersede/update the durable decision before implementation begins.

No implementer may resolve that conflict silently.

---

# 3. Non-negotiable source-of-truth rules

Preserve:
- full raw MapHeat;
- full raw Security;
- canonical SecurityId;
- stable SnapshotId;
- collection/source timings already defined by V1-on-SQL;
- missing != null != 0 != empty string;
- one committed cycle is atomically coherent.

Derived state is never promoted above raw provider facts as the irrecoverable source.

Required invariant:

~~~text
preserved raw facts + stable identities/timestamps
→ sufficient to rebuild every persisted enrichment selected by E5
~~~

---

# 4. Work-unit discipline

For every enrichment work unit:

~~~text
1. state the analytical question
2. prove provider/source semantics needed by that question
3. express the calculation dynamically in SQL first where practical
4. add deterministic correctness tests
5. benchmark dynamic/query-time cost and persistence cost
6. decide persist / query-time / defer / reject
7. only then change schema
8. integrate enrichment atomically
9. rerun correctness + benchmark evidence
10. retain only justified production complexity
~~~

Schema-first implementation is explicitly rejected.

---

# 5. E5-A — Analytical requirement inventory [ND-18]

Create one decision row for every candidate enrichment.

Minimum fields:

~~~text
candidateId
analyticalQuestion
consumers
sourceFields
semanticStatus
dynamicSqlPossible
dynamicQueryCostEvidence
persistWriteCostEvidence
storageCostEvidence
rebuildable
decision = persist | query-time | defer | reject
rationale
~~~

Initial candidate families:
- predecessor references;
- LAST percentage change by horizon;
- deal-count deltas by horizon;
- MID;
- typed LAST/BID1/ASK1/deal-count promotions;
- any other field requested by real product/query needs.

Do not create a candidate because a column existed in the old schema draft.

---

# 6. E5-B — Provider semantic evidence gates

Before a source field participates in a persisted derived metric, classify its semantics:

~~~text
Verified
Inferred
Unknown
~~~

At minimum review:
- LastKnownRate;
- BuyLimit1;
- SellLimit1;
- DailyDealsQuantity;
- any newly promoted field.

For each field record:
- provider path/key;
- observed type/range/nullability;
- known meaning;
- reset/session/day behavior if relevant;
- whether zero is a real value;
- whether missing/empty has special meaning;
- allowed uses.

### DealsDelta hard gate

DailyDealsQuantity availability is not enough.

Until reset/session/day semantics are Verified:

~~~text
DealsDelta persisted decision = reject/defer
DealsDelta persisted value = not authorized
~~~

Do not derive durable subtraction from a suggestive field name.

---

# 7. E5-C — Canonical horizon decision

Start from product candidates:

~~~text
10s
20s
30s
60s
90s
120s
300s
600s
~~~

For each horizon answer:
- what analytical question does it enable?;
- how often will it be reused?;
- can dynamic SQL answer it cheaply enough?;
- does it need a persisted predecessor link?;
- does it need any persisted metric?;
- what storage/write amplification does it cause?;
- does it materially improve representative queries?

The final selected horizon set must have one canonical definition shared by schema, ingest, tests, docs and Scanner-facing SQL contracts.

Changing it later is explicit schema evolution.

---

# 8. E5-D — Temporal predecessor semantics decision

The old at-or-before rule is a candidate:

~~~text
target = current.collected_at_ms - H
choose latest same-security snapshot where collected_at_ms <= target
~~~

Before freezing it, compare alternatives needed by the product:
- at-or-before;
- absolute nearest;
- at-or-before with maximum acceptable age gap;
- session/day-boundary restrictions where semantics require them.

Decision must define:
- same-security requirement;
- strictly older-than-current requirement;
- tie-breaker for equal timestamps;
- behavior with large collection gaps;
- behavior across Recorder sessions;
- behavior across market-day boundaries if relevant;
- NULL behavior when no acceptable predecessor exists.

Use deterministic edge-case fixtures, not intuition.

---

# 9. E5-E — Dynamic SQL proof before persistence

For each candidate relationship/metric, write representative dynamic SQL against the proven raw V1-on-SQL history.

Prove at least:
- one-horizon predecessor lookup;
- multiple-horizon query;
- current ASK1 versus historical BID1;
- current BID1 versus historical ASK1;
- current LAST versus historical LAST;
- per-security recent-window aggregation;
- GROUP BY/HAVING across historical conditions;
- cross-security ranking;
- window-function use where beneficial.

Purpose:

~~~text
prove analytical capability first
→ measure query cost
→ persist only repeated expensive/stable work
~~~

This protects flexibility and prevents premature schema growth.

---

# 10. E5-F — Persist-vs-query decision gate

Strong persist candidate only when all are true:
- semantics stable enough;
- calculation deterministic/rebuildable;
- repeatedly useful;
- measured dynamic-query cost matters;
- measured ingest/storage cost is acceptable;
- simpler persisted representation improves real workloads.

Prefer query-time when any of these dominate:
- experimental use;
- rare use;
- trivial dynamic SQL;
- uncertain semantics;
- high storage/write amplification;
- physical representation would constrain future queries unnecessarily.

Decision output is explicit per candidate.

---

# 11. E5-G — Typed promotion decision

Re-evaluate old candidates:

~~~text
last_rate
daily_deals_quantity
bid1
ask1
mid
~~~

For each selected typed source field define:
- exact raw provider mapping;
- SQL type;
- valid source shapes;
- invalid shape behavior;
- promotion NULL semantics;
- raw-presence fallback;
- index/filter/order use;
- benchmark/ergonomic reason for promotion.

Promoted NULL never erases whether the source key was absent, explicit null or otherwise represented; raw JSON remains the presence evidence.

---

# 12. E5-H — Formula contracts

Every persisted derived metric gets a formula contract before schema work.

## LAST change

Define:

~~~text
last_change_H_pct = ((current - previous) / previous) * 100
~~~

only if this remains the selected formula.

Specify:
- percentage-point unit;
- source fields;
- NULL cases;
- zero denominator behavior;
- precision expectations.

## MID

Do not automatically inherit the old strictly-positive bid/ask rule.

First verify whether:
- zero means valid market value;
- zero means unavailable;
- other provider semantics apply.

Then define the formula/NULL policy explicitly.

## DealsDelta

Only define a persisted formula after the source reset/session semantics gate passes.

---

# 13. E5-I — Warm-up and sparse-history semantics

Tests must cover partial availability:

~~~text
10s predecessor available
20s predecessor available
30s+ unavailable
~~~

Rules:
- no fabricated history;
- missing predecessor = NULL;
- derived metric requiring that predecessor = NULL;
- zero remains numeric zero, never used to mean warm-up;
- Scanner/Viewer can distinguish no analytical history from numeric zero.

---

# 14. E5-J — Benchmark decision phase [ND-17B input]

Before schema freeze compare at least:

~~~text
A. raw V1-on-SQL persistence baseline
B. raw + selected predecessor links
C. raw + links + selected persisted metrics
D. optional extra typed/indexed fields
~~~

Measure:
- ingest service time;
- COMMIT cost;
- CHECKPOINT cost;
- bytes/snapshot;
- bytes/cycle;
- projected session growth;
- reopen impact;
- representative dynamic-query latency;
- representative persisted-query latency;
- mixed-load impact where relevant.

Every benchmark run carries correctness assertions.

Do not accept a faster design that violates atomicity or null/raw semantics.

---

# 15. E5-K — Freeze selected physical enrichment design [ND-18 exit]

ND-18 exits only when the project has one explicit table of decisions covering:
- selected horizons;
- selected predecessor semantics;
- selected typed promotions;
- selected persisted metrics;
- rejected/deferred metrics;
- warm-up behavior;
- backfill/rebuild strategy;
- benchmark evidence references;
- unresolved Unknowns.

Any mandatory item still Unknown keeps ND-18 in-progress.

At this point Pass G must also know which older durable decisions need superseding if the re-baselined design differs.

---

# 16. E5-L — Existing-history treatment decision

By ND-19, the SQL DB may already contain raw V1-on-SQL history.

Choose exactly one initial-development strategy:

~~~text
A. backfill selected enrichment for existing rows
B. existing rows remain explicitly raw-only; new rows enriched
C. deliberate pre-production rebuild/fresh development DB
~~~

Decision factors:
- production cutover has happened or not;
- amount/value of existing development history;
- implementation complexity;
- ability to prove mixed-state semantics;
- rebuild cost.

No silent mixed semantics.

If old and new rows coexist, enrichment availability must be explicitly discoverable rather than inferred from NULL alone when NULL is also a valid warm-up result.

---

# 17. E5-M — Concrete schema evolution [ND-19]

Only after ND-18 decisions are frozen:
- bump Market Flow logical schema version;
- add only selected predecessor structures;
- add only selected metrics;
- add only justified typed/indexed fields;
- encode any enrichment-version/availability metadata needed by the chosen history strategy;
- retain all raw facts;
- add only indexes justified by query/ingest evidence.

Do not build a generalized future-upgrade platform.

This migration is the concrete schema evolution needed for the current enrichment project.

---

# 18. E5-N — Schema-evolution tests first

Before implementation, add Chromium tests for:
- reopen old V1-on-SQL schema and migrate non-destructively;
- chosen backfill/raw-only/rebuild behavior;
- exact schema-version transition;
- preserved raw/current/history facts;
- no duplicate snapshots;
- no silent reset;
- failure during migration leaves an explicit recoverable state;
- retry/reopen after interrupted migration behaves according to contract.

If the chosen strategy is a deliberate pre-production rebuild rather than migration, tests must prove the rebuild is explicit and cannot happen silently to a production epoch.

---

# 19. E5-O — Set-based enrichment implementation

Use one complete validated cycle as the unit.

Preferred shape:

~~~text
validated cycle
→ bulk staging
→ set-based predecessor resolution
→ set-based selected metric computation
→ current/latest synchronization
→ one transaction COMMIT
~~~

Avoid per-security JS↔Worker SQL round trips.

Arrow/batch encoding is an implementation choice selected from benchmark evidence, not a product contract.

---

# 20. E5-P — Enrichment atomicity

For every enrichment selected as part of the committed analytical snapshot:

~~~text
raw cycle
+ current/latest
+ selected enrichment
→ commit together
or none becomes visible
~~~

Fault-injection coverage should include failure:
- before predecessor resolution;
- during link resolution;
- during metric calculation;
- during latest/current synchronization;
- before COMMIT.

Expected outcome:
- attempted enriched cycle invisible;
- previous committed state remains coherent;
- no partially enriched successful cycle.

---

# 21. E5-Q — Rebuildability proof

Provide a deterministic maintenance/rebuild proof using only durable source facts.

Conceptually:

~~~text
raw snapshots
+ SecurityId
+ SnapshotId
+ collected_at_ms
+ selected verified source values
→ recompute selected links/metrics
~~~

Compare recomputed results with persisted enrichment.

A mismatch is an implementation/corruption signal, not something to normalize away.

---

# 22. E5-R — Arbitrary cross-time capability proof

After the selected physical design exists, run representative SQL that was not simply the precomputed metric:
- current ASK1 vs historical BID1;
- current BID1 vs historical ASK1;
- historical MID vs current LAST where MID is authorized;
- historical raw field unavailable as typed column;
- multi-horizon comparison;
- per-security GROUP BY/HAVING;
- cross-security rank.

The point is to prove that precomputation did not sacrifice access to full historical facts.

---

# 23. E5-S — Enrichment correctness suite

Permanent tests should cover:
- predecessor same-security identity;
- predecessor strictly older than current;
- exact selected temporal rule;
- equal-timestamp tie behavior;
- missing history;
- irregular gaps;
- session/day boundary behavior where selected;
- LAST formula;
- denominator zero;
- MID policy;
- DealsDelta only if authorized;
- null/zero/empty/missing preservation;
- backfill/raw-only/rebuild semantics;
- rebuildability;
- atomic rollback.

Use Node for pure selection/formula policies and Chromium for real DuckDB-Wasm/OPFS integration.

Every added/modified Playwright test runs in Chromium after final edit.

---

# 24. E5-T — Enrichment performance proof [ND-20]

Run the same representative benchmark suite before and after enrichment.

Checkpoint evidence must show:
- write/storage overhead is measured;
- query benefit is measured;
- CHECKPOINT/reopen effect is measured;
- no unacceptable backlog/ingest degradation;
- chosen persisted set still has justified value.

ND-20 may reject/remove an enrichment selected earlier if implementation evidence shows the cost is not justified.

Do not preserve sunk-cost complexity.

---

# 25. E5-U — Enrichment checkpoint [ND-20]

ND-20 becomes verification-pending when implementation is complete.

It may become complete only when all are fresh PASS:

~~~text
semantic evidence gates
selected-horizon/predecessor contract
persist-vs-query decisions
schema migration/rebuild behavior
formula correctness
warm-up/NULL behavior
atomic enriched-cycle behavior
rebuildability
arbitrary cross-time SQL capability
historical aggregation capability
enrichment benchmark
Fast CI
full Browser CI
security/artifact guards
documentation consistency
zero unresolved mandatory Unknowns
~~~

Scanner is not part of this checkpoint.

---

# 26. Failure routing

## Semantic field remains Unknown

~~~text
do not persist dependent metric
→ defer/reject it
→ continue with independent enrichment candidates
~~~

## Dynamic SQL is already cheap enough

~~~text
choose query-time
→ do not add persisted metric
~~~

## Persisted design is too expensive

~~~text
remove/reduce persisted candidate
→ rerun benchmark
→ prefer simpler design
~~~

## Migration/backfill fails

~~~text
do not reset silently
→ stay verification-pending
→ fix migration/rebuild contract
→ rerun browser migration tests
~~~

## Formula disagreement

~~~text
resolve semantics/spec first
→ update tests/decision
→ rerun
~~~

---

# 27. Recommended coherent commit boundaries

Suggested sequence:

~~~text
A analytical candidate inventory
B provider semantic evidence
C horizon/predecessor decision
D dynamic SQL capability experiments
E benchmark-informed persist/query decisions
F selected physical design freeze
G history migration/rebuild tests
H schema evolution
I set-based enrichment
J atomicity/rebuildability regressions
K arbitrary SQL/aggregation proof
L enrichment benchmark
M ND-20 checkpoint
~~~

Do not combine semantic decisions and large schema implementation in one opaque commit.

---

# 28. Output consumed by later phases

ND-20 must leave durable outputs for later work:
- selected Scanner-facing analytical fields/links;
- exact names/types/units;
- exact horizon definitions;
- exact predecessor semantics;
- which metrics are persisted versus query-time;
- which candidate metrics remain deferred;
- benchmark evidence;
- schema version;
- rebuild/history compatibility rules.

ND-21 later decides whether any selected enrichment appears in Current/Detail.

ND-22+ later builds the Scanner on top of the proven analytical contract.

---

# 29. E5 exit criteria

Pass E5 planning is complete when another implementation chat can determine without guessing:
- what must be proven before any enrichment column is added;
- how horizons are selected;
- how predecessor semantics are selected;
- how persist-vs-query is decided;
- which old Phase F/G assumptions are only candidates;
- how DealsDelta is blocked until semantics are Verified;
- how existing SQL history is treated;
- how schema evolution is tested;
- how enrichment remains atomic and rebuildable;
- how arbitrary SQL flexibility is preserved;
- what evidence closes ND-20.
