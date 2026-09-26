# Browser SQL V2 — Product-First Replacement Dependency DAG

## Role

This is Pass D1 of Issue #72.

It defines a **new provisional execution DAG from scratch** using:

- the D-043 product shape;
- the Pass-A capability map;
- the Pass-B audit of old WP-01..WP-42;
- the Pass-C missing-work inventory.

The old 42-WP graph is not the structure being repaired here. It is historical evidence and requirement input.

This document is still planning-only:

- no product/runtime implementation;
- no canonical GitHub Issue mutation yet;
- no final WP numbering yet;
- no final critical-path claim yet.

Pass D2 will analyze the critical path after this DAG exists.

---

# 1. Preserved completed evidence

The replacement plan does **not** redo already-valid evidence.

## PRE-01 — exact Browser SQL engine identity

Preserve completed WP-01 evidence:

~~~text
@duckdb/duckdb-wasm@1.32.0
DuckDB core v1.4.3
core commit d1dc88f950d456d72493df452dabdcd13aa413dd
~~~

## PRE-02 — deterministic synthetic Browser SQL probe

Preserve completed WP-02 evidence:

~~~text
Blob Worker
+ pinned Worker/Wasm
+ OPFS probe database
+ write / COMMIT / CHECKPOINT
+ Worker teardown/reopen
+ persisted marker verification
+ sanitized failure classification
~~~

These are prerequisites/evidence, not new implementation work.

---

# 2. DAG design rules

The new DAG follows these rules.

1. **V1-on-SQL product parity precedes enrichment.**
2. **Enrichment precedes the Dynamic SQL Scanner product.**
3. **Scanner is a separate mini-project.**
4. **Health/security/verification are introduced with the first component that needs them, not as late milestones.**
5. **Benchmarks happen before expensive mechanisms are frozen.**
6. **Live-only facts use self-verifying artifacts.**
7. **Cross-tab production ownership is mandatory before cutover, but does not block early single-runtime development.**
8. **Shadow, archive/rollover and generalized future-upgrade machinery are conditional unless evidence promotes them.**
9. **Every node owns one coherent engineering/verification boundary.**
10. **A checkpoint node proves a useful product/correctness truth, not merely that internal architecture exists.**

---

# 3. Provisional mandatory DAG nodes

These IDs are planning IDs only. They are not final GitHub Work Package numbers.

## Foundation and real-origin feasibility

### ND-01 — Verification foundation

Own the reusable verification base:

- sanitized/versioned fixture corpus;
- initial V1 parity oracles;
- public-boundary fault-injection harness;
- machine-readable evidence schema;
- artifact redaction/security scanning;
- Fast/Chromium/Windows/live evidence classification;
- temporary-POC disposition rule.

Dependencies:

~~~text
PRE-01
PRE-02
~~~

### ND-02 — V1 collector characterization

Freeze the observable inherited collector contract before replacing persistence:

- MapHeat2 dynamic universe;
- sequential GetSecuritiesData flow;
- canonical SecurityId;
- exact requested/received/unique/missing/unexpected validation;
- full raw facts;
- null/zero/empty/missing;
- no overlapping successful cycles;
- provider/validation failure isolation.

Dependencies:

~~~text
ND-01
~~~

### ND-03 — Self-verifying real-origin SQL feasibility gate

Build and execute the authenticated-Leumi self-verifying gate for the **SQL runtime premise**:

- injected/bootstrap JS;
- Blob Worker;
- exact pinned Worker/Wasm;
- OPFS;
- synthetic write;
- COMMIT/CHECKPOINT;
- reopen/relaunch;
- safe probe cleanup;
- sanitized PASS/FAIL.

Cross-tab production ownership is deliberately not part of this early blocking dependency.

Dependencies:

~~~text
PRE-01
PRE-02
ND-01
~~~

Gate:

~~~text
ND-03 PASS
→ heavy SQL-authority implementation may proceed

ND-03 FAIL/Unknown
→ runtime-delivery architecture must be reopened
~~~

---

# 4. Trustworthy SQL persistence foundation

### ND-04 — SQL Authority runtime + minimum persistent schema

Build one coherent early owner for:

- SQL Authority Worker;
- Runtime Controller minimum bridge;
- OPFS production logical identity;
- minimum V1-on-SQL schema;
- schema/release identity;
- startup readiness;
- non-destructive reopen/recovery;
- explicit blocked/recovery-required state.

Minimum schema supports:

~~~text
recording/session identity
security catalog + raw MapHeat
current universe
cycle
stable snapshot identity
raw Security history
latest/current pointer
ingest-token/idempotency foundation
~~~

It does **not** require temporal enrichment or Scanner state.

Dependencies:

~~~text
ND-03
ND-01
~~~

### ND-05 — Validated-cycle handoff + complete-cycle bulk staging

Own the immutable seam:

~~~text
proven V1 validated cycle
→ defensive SQL-authority validation
→ one bounded bulk staging operation
~~~

Requirements:

- exact universe membership;
- full raw facts;
- stable ingest token;
- source timing;
- no per-security JS↔Worker SQL loop;
- no guessed provider semantics.

Dependencies:

~~~text
ND-02
ND-04
~~~

### ND-06 — Atomic raw/current/history persistence

Persist one complete validated cycle atomically:

~~~text
cycle
+ raw snapshots
+ current universe
+ latest pointers
+ required metadata
→ one coherent COMMIT
~~~

Fault injection proves failed attempts expose none of the attempted successful state.

No temporal enrichment dependency.

Dependencies:

~~~text
ND-05
~~~

### ND-07 — Durability, acknowledgement and idempotent recovery

Add the durable-success boundary:

~~~text
COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

Own:

- acknowledgement-loss ambiguity;
- same ingest-token retry reconciliation;
- CHECKPOINT-uncertain state;
- Worker/runtime restart recovery;
- no duplicate successful cycles;
- no false durable acknowledgement.

Dependencies:

~~~text
ND-06
ND-01
~~~

### ND-08 — SQL persistence foundation checkpoint

Automatically prove:

- persistent reopen;
- exact complete-cycle handoff;
- raw preservation;
- atomic current/history/latest;
- dynamic-universe changes;
- null/zero/empty/missing;
- fault-injection isolation;
- durable acknowledgement;
- idempotent retry/recovery.

This checkpoint proves the **storage authority**, not yet the user-facing product.

Dependencies:

~~~text
ND-07
~~~

---

# 5. V1-on-SQL product vertical slice

### ND-09 — Deterministic production runtime packaging

Create the generated production-shaped runtime/build surface:

- exact runtime/Worker/Wasm identity;
- generated, reproducible artifacts;
- no hand-edited release artifact;
- baseline secret/artifact guards;
- production-shaped startup path.

Dependencies:

~~~text
ND-07
ND-01
~~~

### ND-10 — Inherited Recorder → SQL integration

Wire the existing provider/Recorder behavior to the SQL durable boundary:

~~~text
same authenticated collection
→ same complete validation
→ ND-05 handoff
→ ND-07 durable acknowledgement
~~~

Do not redesign provider requests.

Dependencies:

~~~text
ND-02
ND-07
ND-09
~~~

### ND-11 — Trusted SQL read contracts

Define and implement application-owned reads:

~~~text
Current Universe
selected-security current/detail
bounded history page
history continuation cursor
shared health/read metadata
~~~

Own:

- committed-state consistency;
- stable total order/cursor;
- equal timestamps;
- not-current vs not-found semantics;
- bounded reads;
- null/zero/empty truthfulness.

Dependencies:

~~~text
ND-07
~~~

### ND-12 — Shared Viewer shell, runtime bridge and health

Own the shared product shell:

- attach/re-attach;
- one runtime/data authority;
- notification = hint / authoritative reread = truth;
- runtime disconnect/recovery UX;
- shared health/freshness;
- three-surface navigation shell;
- surface-state isolation foundation.

Scanner-specific state is not required yet.

Dependencies:

~~~text
ND-09
ND-11
~~~

### ND-13 — Current Universe SQL-backed surface

Migrate and prove the V1-derived current table:

- all latest committed securities;
- relevant bank fields;
- deterministic sorting;
- zero vs missing;
- live committed refresh;
- runtime/DB-only manual refresh;
- state preservation;
- RTL/accessibility baseline.

Dependencies:

~~~text
ND-02
ND-11
ND-12
~~~

### ND-14 — Security Detail/History SQL-backed surface

Migrate and prove:

- canonical SecurityId drill-down;
- current/detail summary;
- newest-first bounded history;
- duplicate/skip-safe load older;
- equal-timestamp safety;
- live detail continuity;
- security leaves current universe while history remains;
- return-state continuity.

Dependencies:

~~~text
ND-02
ND-11
ND-12
~~~

### ND-15 — Self-verifying live provider compatibility gate

Build/execute L-2 against the authenticated page with sanitized machine judgement:

- MapHeat2;
- sequential GetSecuritiesData;
- universe accounting;
- exact validation;
- full raw handoff;
- SQL durable acknowledgement;
- no copied auth/session material.

Human involvement is limited to the authenticated launch boundary.

Dependencies:

~~~text
ND-10
ND-09
ND-01
~~~

### ND-16 — V1-on-SQL parity and product checkpoint

Prove the first major product truth:

~~~text
same inherited collector contract
→ SQL durable authority
→ Current Universe
→ Security Detail/History
~~~

Required evidence:

- shared V1/V2 parity corpus;
- Fast CI;
- full Chromium suite;
- Current/Detail public-behavior parity;
- fault injection/reopen;
- L-2 PASS;
- no enrichment dependency;
- no Scanner dependency.

Dependencies:

~~~text
ND-08
ND-10
ND-13
ND-14
ND-15
~~~

---

# 6. Performance foundation before analytical schema freeze

### ND-17 — Reusable benchmark foundation + raw/read baselines

Establish decision-grade benchmark infrastructure and baselines for:

- raw durable cycle path;
- CHECKPOINT cost;
- trusted Current read;
- Detail/history paging;
- storage growth;
- reopen growth;
- DB read vs Viewer rendering split.

Evidence is environment-qualified and correctness-first.

Dependencies:

~~~text
ND-08
ND-11
ND-01
~~~

ND-17 may run in parallel with ND-13..ND-16 once its dependencies are ready.

---

# 7. Analytical enrichment mini-project

### ND-18 — Enrichment selection and semantic gates

Decide, from product value and evidence:

- canonical initial horizons;
- predecessor-selection semantics;
- provider-field semantic gates;
- minimum typed promotions;
- formula contracts;
- persist-vs-query-time choices;
- warm-up/NULL behavior;
- historical backfill/rebuild strategy.

No schema change occurs until this decision work is explicit.

Dependencies:

~~~text
ND-16
ND-17
~~~

### ND-19 — Enrichment schema evolution + set-based implementation

Apply only selected analytical additions to the proven V1-on-SQL schema:

- selected predecessor links/structure;
- selected derived metrics;
- justified promoted fields/indexes;
- explicit schema-version change;
- backfill/rebuild behavior;
- rebuildability;
- atomic cycle integration;
- set-based SQL implementation.

Dependencies:

~~~text
ND-18
~~~

### ND-20 — Enrichment correctness/performance checkpoint

Prove:

- predecessor correctness;
- warm-up/NULL semantics;
- formulas;
- arbitrary cross-time joins;
- GROUP BY/HAVING/ranking capability;
- rebuildability;
- atomic integration;
- measured write/storage/query tradeoffs;
- acceptable headroom.

This checkpoint can reject or remove an enrichment that does not justify its cost.

Dependencies:

~~~text
ND-19
ND-17
~~~

### ND-21 — Selective enriched-data product exposure

For each selected metric decide:

~~~text
Scanner only
Current Universe
Detail/History
diagnostics only
~~~

Implement only the chosen Current/Detail exposure and verify formatting/null semantics/usability.

This node may be a documented no-op if no enriched metric belongs in V1-derived surfaces.

Dependencies:

~~~text
ND-20
ND-13
ND-14
~~~

---

# 8. Dynamic SQL Scanner mini-project

### ND-22 — Scanner-facing SQL contract + durable lifecycle

Own:

- stable documented Scanner SQL objects/semantics;
- draft vs active configuration;
- interval validation;
- activation/first-execution semantics;
- minimal durable active state;
- execution identity foundation;
- restart-state contract;
- first-run/default-query/schema-discovery decision.

Dependencies:

~~~text
ND-21
ND-12
~~~

### ND-23 — Safe query execution and truthful result model

Own:

- parsed/engine-backed read-only safety;
- committed-state reads;
- exact execution attribution;
- latest execution vs latest success;
- structured errors;
- cancellation/interrupted vocabulary;
- arbitrary result column/type normalization;
- zero-row success;
- large-result completeness/truncation contract.

Dependencies:

~~~text
ND-22
~~~

### ND-24 — Repeat scheduler + baseline resource safety

Own product-required timing/resource behavior:

- independent interval;
- no overlapping executions;
- deterministic overrun policy;
- restart/downtime behavior;
- bounded pending work;
- ingest correctness priority;
- bounded result memory.

Use focused benchmark/Chromium evidence to select only the cancellation/preemption/streaming mechanisms actually required.

Dependencies:

~~~text
ND-23
ND-17
~~~

### ND-25 — Scanner engine checkpoint

Headless/runtime checkpoint:

~~~text
durable lifecycle
+ SQL safety
+ execution attribution
+ committed-state reads
+ repeat/no-overlap scheduling
+ restart recovery
+ baseline resource safety
~~~

Dependencies:

~~~text
ND-24
~~~

### ND-26 — Scanner editor + dynamic result grid

Build the user-facing Scanner surface:

- multiline SQL editor;
- interval control;
- explicit activation;
- active-vs-draft feedback;
- execution/status/error display;
- dynamic typed result grid;
- explicit empty-success;
- explicit preview completeness/truncation;
- accessibility baseline.

Dependencies:

~~~text
ND-25
ND-12
~~~

### ND-27 — Scanner integration, drill-down and product checkpoint

Own:

- shared SecurityId Detail drill-down;
- result rows never become authoritative market facts;
- Scanner→Detail→Back continuity;
- runtime reconnect/restart behavior;
- selected multi-Viewer editing policy;
- Scanner failure isolation from Current/Detail;
- permanent Scanner contract suite.

Checkpoint proves:

~~~text
editable SQL + interval
→ repeated safe execution
→ truthful 0..N dynamic grid
→ restart/error/latest-success semantics
→ optional SecurityId drill-down
→ no provider/Current/Detail regression
~~~

Dependencies:

~~~text
ND-26
ND-14
~~~

---

# 9. Production hardening, final integration and cutover

### ND-28 — Cross-tab production ownership + real-origin ownership gate

Implement/prove the production singleton boundary:

- exclusive Web Lock;
- passive non-owner tab;
- loser opens no production DB/provider collection;
- owner close/release;
- readiness before takeover;
- hidden-tab lock retention;
- no heartbeat/localStorage authority;
- no `steal:true`;
- automated Chromium two-page suite;
- self-verifying real-origin Web Locks evidence.

This may proceed in parallel with enrichment/Scanner after V1-on-SQL parity.

Dependencies:

~~~text
ND-16
ND-01
~~~

### ND-29 — Final three-surface integration checkpoint

Prove one coherent runtime/data authority serves:

~~~text
Current Universe
+ Security Detail/History
+ Dynamic SQL Scanner
~~~

Include:

- shared shell/navigation;
- health/state isolation;
- Scanner isolation;
- multiple Viewer clients where supported;
- one production owner;
- generated runtime/artifact security.

Dependencies:

~~~text
ND-21
ND-27
ND-28
~~~

### ND-30 — Final capacity / target-OS / storage-lifecycle decision gate

Run the shipped system shape with:

- representative full-session data;
- safety-margin stress data;
- Windows/Chromium lane;
- mixed ingest/query load;
- Viewer reads/rendering;
- memory/storage/reopen;
- background/hidden-tab experiment;
- correctness counters.

This gate decides whether conditional archive/rollover or advanced Scanner resource mechanisms must be promoted before cutover.

Dependencies:

~~~text
ND-29
ND-17
~~~

### ND-31 — Self-verifying live endurance gate

Run L-3 with the production-shaped candidate.

Machine-evaluable evidence covers:

- repeated provider cycles;
- SQL durable commits;
- Current/Detail reads;
- shipped Scanner scheduling/results;
- runtime/storage/query failures;
- refresh/reopen;
- sanitized health/timing;
- exact build identity.

Dependencies:

~~~text
ND-29
ND-30
~~~

### ND-32 — Explicit production cutover + initial rollback/roll-forward

Switch authority deliberately:

~~~text
legacy IndexedDB production
→ SQL/OPFS production authority
~~~

Own:

- settle old Recorder;
- fresh/verified SQL production epoch;
- no implicit legacy history merge;
- no silent fallback;
- retained legacy release;
- automated rollback/roll-forward proof for this initial transition;
- preserve SQL data during rollback.

Dependencies:

~~~text
ND-31
ND-28
all activated conditional pre-cutover branches
~~~

### ND-33 — Final cleanup and release closure

Remove only temporary scaffolding actually used and verify:

- one SQL market-history authority;
- no obsolete IndexedDB production path;
- no temporary POC/migration hooks in production artifacts;
- docs/tests/runtime describe the shipped architecture;
- no conditional mechanism was implemented merely to later remove it.

Dependencies:

~~~text
ND-32
~~~

---

# 10. Conditional branches

These are not mandatory nodes in the initial critical path unless evidence activates them.

## CND-01 — Shadow comparison

Trigger only if ND-16/L-2/parity/endurance evidence leaves a material migration uncertainty that deterministic tests cannot resolve.

If activated, it must complete before ND-32.

## CND-02 — Archive/export/rollover

Trigger only if ND-30 storage/capacity evidence shows initial V2 cannot operate safely with retain-all + explicit storage-blocked behavior.

If activated, it must complete and be verified before ND-32.

## CND-03 — Advanced Scanner preemption/cancellation hardening

Trigger inside/after ND-24 when mixed-load evidence shows baseline resource safety is insufficient.

Examples:

- pending-query cancellation;
- streaming connection recycle;
- hard runtime budget;
- Worker-recovery escalation.

If activated, it must complete before ND-25.

## CND-04 — Generalized future engine/schema upgrade framework

Not an initial-V2 cutover dependency.

Schedule before the first post-V2 persistence-affecting release that actually requires generalized side-by-side SQL migration/rollback machinery.

---

# 11. Dependency graph

Compact mandatory graph:

~~~text
PRE-01 ─┐
PRE-02 ─┴─→ ND-01 ─→ ND-02
              │         │
              └─→ ND-03 │
                    │    │
                    ▼    │
                  ND-04  │
                    │    │
                    └─→ ND-05
                          │
                          ▼
                        ND-06
                          │
                          ▼
                        ND-07
                     ┌────┴─────┐
                     ▼          ▼
                   ND-08      ND-09
                     │          │
          ┌──────────┘          └──────┐
          ▼                            ▼
        ND-11                        ND-10
          │                            │
          ▼                            ▼
        ND-12                        ND-15
       ┌──┴──┐                         │
       ▼     ▼                          │
     ND-13  ND-14                       │
       └──┬──┘                          │
          └─────────┬───────────────────┘
                    ▼
                  ND-16
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
        ND-17               ND-28
          │
          ▼
        ND-18
          │
          ▼
        ND-19
          │
          ▼
        ND-20
          │
          ▼
        ND-21
          │
          ▼
        ND-22
          │
          ▼
        ND-23
          │
          ▼
        ND-24
          │
          ▼
        ND-25
          │
          ▼
        ND-26
          │
          ▼
        ND-27
          │
          └──────────────┐
                         ▼
                       ND-29 ◀──── ND-28
                         │
                         ▼
                       ND-30
                         │
                         ▼
                       ND-31
                         │
                         ▼
                       ND-32
                         │
                         ▼
                       ND-33
~~~

Additional required edges omitted from the ASCII layout for readability:

~~~text
ND-17 depends on ND-08 + ND-11
ND-18 depends on ND-16 + ND-17
ND-21 depends on ND-20 + ND-13 + ND-14
ND-22 depends on ND-21 + ND-12
ND-24 depends on ND-23 + ND-17
ND-26 depends on ND-25 + ND-12
ND-27 depends on ND-26 + ND-14
ND-29 depends on ND-21 + ND-27 + ND-28
ND-30 depends on ND-29 + ND-17
ND-31 depends on ND-29 + ND-30
ND-32 depends on ND-31 + ND-28 + any activated pre-cutover conditional branch
~~~

---

# 12. Intentional parallelism

The DAG permits useful parallel work without weakening correctness.

After ND-07:

~~~text
ND-08 persistence checkpoint
ND-09 runtime packaging
ND-11 trusted reads
~~~

can progress with their explicit dependencies rather than waiting for Scanner work.

After ND-11/ND-12:

~~~text
ND-13 Current
ND-14 Detail
ND-17 benchmark baselines
~~~

can progress in parallel.

After ND-16:

~~~text
ND-18→ND-21 enrichment path
ND-28 cross-tab production ownership
~~~

can progress independently.

The Scanner remains downstream of the enrichment checkpoint/exposure decision rather than blocking V1 parity.

---

# 13. What deliberately disappeared from the mandatory graph

There is no mandatory initial node for:

- dual-write SQL shadow architecture;
- full archive/export/rollover product;
- generalized future DuckDB/schema upgrade framework;
- immutable history of every Scanner edit;
- predetermined Arrow-streaming architecture;
- predetermined advanced cancellation/preemption;
- distinct-wave detection;
- a final trading formula.

These are either conditional mechanisms or explicitly outside V2 scope.

---

# 14. D1 completion result

The replacement plan now has a product-first dependency shape:

~~~text
real-origin feasibility
→ trustworthy SQL persistence
→ V1-on-SQL product parity
→ benchmark-informed enrichment
→ Dynamic SQL Scanner
→ single-owner final integration
→ capacity/live endurance
→ explicit cutover
→ cleanup
~~~

This DAG is provisional until:

- Pass D2 identifies the true critical path;
- Pass D3 audits/removes any remaining artificial dependencies;
- Pass E defines the mini-project implementation/checkpoint detail;
- Pass F re-justifies lifecycle/hardening scope;
- Pass G materializes the canonical GitHub Issues/Epics/guards.


---

# Pass D2 — Critical-path and gate analysis

## 15. Precision note: this is a topological gate analysis, not a duration CPM

The provisional nodes do not yet have reliable implementation-duration estimates.

Therefore D2 does **not** claim a mathematically unique Critical Path Method result.

It identifies instead:

- hard technical gates;
- deliberate product-order gates;
- checkpoint/evidence gates;
- soft sequencing;
- redundant dependencies;
- parallel work fronts.

Pass E may later estimate relative size, but no fake schedule precision is introduced here.

## 16. Gate classes

~~~text
HARD-TECH
= downstream behavior cannot be implemented/trusted safely without the predecessor

HARD-PRODUCT
= deliberate product sequencing chosen for this V2, even if engineering could technically overlap

CHECKPOINT
= implementation may progress in parallel, but the downstream product truth cannot be declared until the checkpoint passes

SOFT
= useful sequencing/rework reduction only; safe parallelism exists

REDUNDANT
= already implied transitively by another dependency

CONDITIONAL
= becomes hard only if evidence activates the branch
~~~

## 17. Main gating spine

Ignoring soft/redundant edges, the mandatory product spine is approximately:

~~~text
real-origin SQL premise
→ minimum SQL authority
→ validated-cycle persistence
→ durability/recovery
→ V1 SQL reads + Viewer surfaces + live provider proof
→ V1-on-SQL checkpoint
→ enrichment decision/implementation/checkpoint
→ Scanner engine/product
→ final three-surface integration
→ final capacity
→ live endurance
→ cutover
→ cleanup
~~~

Several branches feed this spine in parallel:

~~~text
collector characterization
benchmark infrastructure
runtime packaging
Current + Detail UI
cross-tab ownership
~~~

The longest branch in elapsed time cannot be known until implementation size is estimated.

## 18. Early-foundation dependency audit

### ND-01 → ND-02

**Classification: SOFT / candidate split.**

Collector characterization can help create the fixture/oracle corpus while the reusable verification foundation is being built.

The current ND-01 scope is slightly too broad because it already claims "initial V1 parity oracles", which logically depend on characterization.

D3 should consider splitting:

~~~text
minimal verification infrastructure
→ evidence schema / sanitization / harness primitives

collector characterization
→ contributes V1 fixtures/oracles

shared parity corpus
→ grows from both
~~~

Avoid serializing characterization behind a fully finished verification platform.

### ND-01 → ND-03

**Classification: HARD-TECH for the self-verifying evidence format/sanitization, but only a minimal ND-01 subset is required.**

The live gate should use standard evidence/redaction machinery.

It should not wait for Scanner/future fixture infrastructure.

### ND-03 → ND-04

**Classification: HARD-TECH for heavy production SQL-runtime implementation.**

The real authenticated origin must prove Worker/Wasm/OPFS viability before the project commits deeply to the runtime design.

However, this gate does not prohibit:

- interface design;
- schema planning;
- Node tests;
- synthetic Chromium harness work.

It blocks the production dependency on the unverified runtime premise, not all engineering thought.

## 19. Persistence-foundation dependency audit

### ND-02 + ND-04 → ND-05

**Classification: HARD-TECH.**

Bulk staging/handoff must know both:

- the characterized V1 cycle contract;
- the actual SQL Authority boundary.

### ND-05 → ND-06 → ND-07

**Classification: HARD-TECH.**

This is the core storage correctness chain:

~~~text
valid handoff
→ atomic commit
→ durable acknowledgement/retry recovery
~~~

### ND-01 → ND-07

**Classification: REDUNDANT.**

ND-07 already receives ND-01 transitively through ND-05/ND-04/ND-02.

The explicit edge is documentation-only and should disappear from the executable DAG.

### ND-07 → ND-08

**Classification: CHECKPOINT.**

The persistence checkpoint must pass before storage authority is declared proven.

Other non-dependent work may begin while checkpoint verification is running, but no later checkpoint may treat storage correctness as proven before ND-08 is green.

## 20. Runtime/read/Viewer parallelism

### ND-07 → ND-09

**Classification: SOFT / candidate relaxation.**

Deterministic runtime packaging infrastructure can begin once the production SQL runtime shape exists in ND-04.

The **final packaged artifact** must contain the later durable implementation, but build-system work need not wait for ND-07.

D3 should either:

- change ND-09 implementation-start dependency to ND-04; or
- split packaging infrastructure from final package verification.

### ND-07 → ND-11

**Classification: SOFT-STRONG / candidate relaxation to ND-06.**

Trusted read contracts require coherent committed raw/current/history data.

They do not intrinsically require the final CHECKPOINT-before-acknowledgement policy.

Implementation can begin after ND-06 atomic persistence.

V1 product checkpoint still depends on ND-07/ND-08 for durability.

### ND-02 → ND-13 / ND-14

**Classification: REDUNDANT.**

Current and Detail receive the collector/data contract transitively through the SQL persistence/read path.

Their direct implementation concern is:

~~~text
trusted reads
+ Viewer shell
~~~

Collector characterization belongs in parity/checkpoint evidence, not as a direct UI build dependency.

### ND-11 + ND-12 → ND-13 and ND-14

**Classification: HARD-TECH.**

Both user-facing surfaces need trusted reads and the shared runtime/Viewer shell.

### ND-13 and ND-14

**Parallel work front.**

Current Universe and Security Detail/History should be built/tested concurrently once ND-11/ND-12 are stable.

Neither should block the other except for shared-shell contract changes.

## 21. Recorder/live-provider dependency audit

### ND-02 + ND-07 + ND-09 → ND-10

The semantic dependencies are hard, but some explicit edges are transitively redundant depending on D3 packaging changes.

The real required truth is:

~~~text
characterized collector
+ durable SQL ingest contract
+ production-shaped runtime
→ Recorder→SQL integration
~~~

### ND-10 → ND-15

**Classification: HARD-TECH.**

L-2 cannot prove provider continuity before the integrated candidate exists.

### ND-09 and ND-01 → ND-15

**Classification: REDUNDANT if ND-10 already requires the production runtime/evidence machinery.**

Keep these as traceability references in docs, not executable dependency edges.

## 22. V1-on-SQL checkpoint

### ND-08 + ND-10 + ND-13 + ND-14 + ND-15 → ND-16

**Classification: HARD-PRODUCT + CHECKPOINT.**

This is intentionally strict.

ND-16 is the boundary where the project proves:

~~~text
storage migration
+ inherited provider behavior
+ Current
+ Detail/History
= V1 product on SQL
~~~

Enrichment does not start before this checkpoint.

This is a deliberate product-order gate, not merely technical convenience.

## 23. Benchmark-foundation timing

### Current ND-17 dependency on ND-08 + ND-11 + ND-01

**Classification: mixed; node should be decomposed logically.**

The benchmark **harness** can begin very early.

The benchmark **measurements** have different readiness points:

~~~text
benchmark framework
→ after minimal verification infrastructure

raw persistence baseline
→ after ND-06/ND-07

trusted-read baseline
→ after ND-11

Viewer render split
→ after ND-13/ND-14
~~~

D3 should prevent ND-17 from becoming one large late gate.

For ND-18, only the enrichment-relevant baselines need to be green.

## 24. Enrichment path

### ND-16 + enrichment-relevant ND-17 evidence → ND-18

**Classification: HARD-PRODUCT.**

This preserves the user-selected order:

~~~text
first prove V1-on-SQL
then decide/add enrichment
~~~

### ND-18 → ND-19 → ND-20

**Classification: HARD-TECH/CHECKPOINT.**

The sequence is:

~~~text
select semantics/shape
→ implement schema/enrichment
→ prove correctness + measured value
~~~

### ND-20 → ND-21

**Classification: HARD-TECH for exposure of enriched data.**

No derived metric should be surfaced in Current/Detail before its correctness/performance checkpoint.

ND-21 may legitimately resolve to a documented no-op.

## 25. Scanner entry gate

### ND-21 → ND-22

**Classification: HARD-PRODUCT / soft technically.**

Technically, Scanner engine work could begin immediately after ND-20.

The current edge preserves the user's preferred sequence:

~~~text
prove enrichment
→ decide/expose any useful enriched browsing fields
→ only then begin the separate Scanner mini-project
~~~

Because ND-21 may be a no-op, this should not become a large artificial delay.

D3 should retain the ordering intent while keeping ND-21 narrowly scoped.

### ND-12 → ND-22

**Classification: SOFT / likely unnecessary for headless Scanner lifecycle.**

ND-22 mainly owns SQL contract and durable lifecycle.

It needs the SQL authority, not the Viewer shell.

The Viewer shell becomes relevant at ND-26.

This edge is a candidate for removal in D3.

## 26. Scanner internal criticality

### ND-22 → ND-23 → ND-24 → ND-25

**Classification: HARD-TECH/CHECKPOINT.**

This is the headless Scanner-engine spine:

~~~text
lifecycle/SQL contract
→ safe truthful execution
→ scheduling/resource safety
→ engine checkpoint
~~~

### ND-17 → ND-24

**Classification: depends on benchmark subset, not whole ND-17.**

ND-24 needs mixed-load/result-strategy evidence, not every persistence/read benchmark.

D3 should model benchmark evidence by named prerequisite/output rather than one monolithic node.

### ND-25 → ND-26

**Classification: SOFT / deliberate rework-reduction, not technical necessity.**

Editor/grid implementation can begin once ND-22/ND-23 contracts are stable, while scheduling/resource work continues.

Safer parallel pattern:

~~~text
ND-22/23 contracts
├→ ND-24/25 engine path
└→ ND-26 UI path
          │
          └──────┐
                 ▼
               ND-27
~~~

ND-27, not ND-26 start, should require the engine checkpoint.

This can shorten the Scanner mini-project without weakening its product checkpoint.

### ND-14 → ND-27

**Classification: HARD-TECH for drill-down reuse, but already long-complete by then.**

## 27. Cross-tab ownership timing

### Current ND-16 → ND-28

**Classification: SOFT / too late.**

Cross-tab ownership implementation depends mainly on:

- runtime ownership boundary from ND-04/ND-09;
- verification/live-gate infrastructure.

It does **not** require completed V1 product parity.

Recommended D3 start point:

~~~text
ND-04 or ND-09
→ ND-28 implementation/Chromium ownership proof
~~~

Its final PASS is required only before ND-29/final production integration.

This work can therefore run in parallel with V1 product, enrichment and Scanner work.

## 28. Final integration

### ND-21 + ND-27 + ND-28 → ND-29

**Classification: HARD-PRODUCT.**

ND-29 proves the actual shipped three-surface runtime under single-owner behavior.

If ND-21 is a no-op, its completion is still an explicit product decision, not missing work.

## 29. Capacity and conditional-branch reintegration

### ND-29 → ND-30

**Classification: HARD-TECH/CHECKPOINT.**

Final capacity must run on the integrated shipped shape.

### Important defect in D1 conditional lifecycle flow

D1 currently lets ND-30 decide whether archive/rollover is needed, while CND-02 only has to finish before ND-32.

That is insufficient.

If ND-30 activates a shipped conditional mechanism such as archive/rollover:

~~~text
ND-30 initial capacity assessment
→ CND-02 implementation
→ rerun affected capacity/correctness verification
→ only then ND-31 live endurance
~~~

A system changed after capacity testing must not reuse stale capacity evidence.

D3 should model either:

- ND-30A assessment + ND-30B final capacity; or
- explicit "re-run ND-30 after activated branch" semantics.

### CND-03 advanced Scanner hardening

Already correctly rejoins before ND-25.

If ND-24 evidence activates advanced preemption/cancellation, the engine checkpoint waits for it.

### CND-01 shadow verification

If activated, shadow is temporary verification machinery.

It must:

- produce its evidence;
- have explicit keep/remove disposition;
- not remain accidentally in the production candidate;
- complete/clean up before final candidate integration/endurance as appropriate.

It should not alter the authority model.

### CND-04 future upgrade framework

Remains outside the initial critical path.

## 30. Final release gates

### ND-30 final capacity → ND-31 live endurance

**Classification: HARD-PRODUCT.**

Live endurance should exercise the final candidate after any capacity-driven mechanism changes.

### ND-31 → ND-32 cutover

**Classification: HARD-PRODUCT.**

Production authority is not switched before final live evidence.

### ND-28 → ND-32

**Classification: REDUNDANT if ND-29 requires ND-28 and ND-31 requires ND-29.**

Keep ownership as a cutover acceptance criterion, but remove the duplicate executable edge.

### ND-32 → ND-33

**Classification: HARD-PRODUCT.**

Final cleanup follows successful cutover/rollback proof.

## 31. Revised parallel work fronts

### Front A — after minimum verification bootstrap

~~~text
collector characterization
real-origin SQL feasibility
benchmark-harness scaffolding
~~~

can progress substantially in parallel.

### Front B — after atomic SQL persistence

~~~text
durability/recovery
trusted reads
runtime packaging
~~~

can overlap where contracts are already stable.

### Front C — after trusted reads + shell

~~~text
Current Universe
Detail/History
read/render benchmarks
~~~

run in parallel.

### Front D — after V1-on-SQL parity

~~~text
enrichment mini-project
cross-tab ownership
~~~

run in parallel.

### Front E — during Scanner

Once lifecycle/execution contracts are stable:

~~~text
scheduler/resource engine work
Scanner editor/grid work
cross-tab/final-runtime hardening
~~~

can overlap, converging at Scanner/final integration checkpoints.

## 32. Topological blocker hierarchy

### Earliest hard blocker

~~~text
ND-03 real-origin SQL feasibility
~~~

If the target origin rejects the selected Browser SQL delivery primitives, the Browser SQL architecture must reopen before heavy implementation.

### First implementation correctness blocker

~~~text
ND-07 / ND-08 durable SQL persistence proof
~~~

Without this, V1 product migration has no trustworthy authority.

### First product blocker

~~~text
ND-16 V1-on-SQL parity checkpoint
~~~

Without this, enrichment/Scanner work is deliberately not allowed to become the active product path.

### Analytical blocker

~~~text
ND-20 enrichment checkpoint
~~~

Without this, selected analytical schema cannot be treated as stable Scanner input.

### Scanner blocker

~~~text
ND-25 engine checkpoint + ND-27 product checkpoint
~~~

### Production blocker

~~~text
ND-29 integration
→ final ND-30 capacity
→ ND-31 live endurance
→ ND-32 cutover
~~~

## 33. D2 candidate edge changes for Pass D3

Pass D3 should validate and, if confirmed, apply at least these simplifications:

1. split/minimize ND-01 so collector characterization does not wait for an oversized verification platform;
2. remove redundant ND-01 → ND-07;
3. allow ND-09 packaging infrastructure to start from ND-04 rather than ND-07;
4. allow ND-11 trusted-read implementation to start after ND-06 rather than ND-07;
5. remove direct ND-02 edges from ND-13/ND-14;
6. remove redundant ND-09/ND-01 edges from ND-15 where transitive;
7. decompose ND-17 benchmark readiness by workload instead of one monolithic dependency;
8. likely remove ND-12 → ND-22 for headless Scanner lifecycle;
9. allow ND-26 Scanner UI work to overlap the ND-24/ND-25 engine path after contracts are stable;
10. move ND-28 cross-tab ownership start earlier than ND-16;
11. remove redundant ND-28 → ND-32 executable edge;
12. repair ND-30/CND-02 reintegration so any capacity-driven shipped change is re-benchmarked before live endurance.

## 34. D2 completion result

The new DAG remains product-first, but its implementation can be materially more parallel than D1's first conservative draft.

The corrected shape is:

~~~text
hard gates protect truth
checkpoints protect product claims
soft work overlaps
conditional mechanisms rejoin before evidence that depends on them
~~~

No downstream stage is accelerated by weakening:

- provider continuity;
- atomicity/durability;
- V1 parity;
- enrichment correctness;
- Scanner safety;
- single ownership;
- final capacity/live proof.
