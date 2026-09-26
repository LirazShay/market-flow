# Browser SQL V2 — Work-Package Re-baseline Audit

## Role

This is the Pass-B classification ledger for Issue #72.

It compares the existing WP graph against the independent product capability map.

It is a planning artifact only. It does not itself mutate the canonical GitHub execution graph, implementation order or product runtime.

Classification vocabulary:

~~~text
KEEP
REORDER
SPLIT
MERGE
DEFER
REMOVE
REPLACE
~~~

A package may receive a primary classification plus a secondary sequencing note.

Product capability authority:

~~~text
browser-sql-product-capability-map.md
~~~

---

# Pass B1 — WP-01 through WP-07

## WP-01 — Pin DuckDB-Wasm and create the engine asset manifest foundation

**Current Issue:** #29  
**State:** already completed  
**Classification:** KEEP

### Why

Exact engine identity is a real correctness and reproducibility prerequisite, independent of the old milestone structure.

It directly supports:

- CAP-DB-01 target-engine feasibility;
- CAP-RUN-01 reproducible Browser SQL delivery;
- deterministic Chromium verification;
- prevention of Worker/Wasm version mismatch.

### What remains valid

- exact package pin;
- exact compatible Worker/Wasm asset identity;
- no floating latest/next URLs;
- deterministic manifest checks.

### Re-baseline consequence

Do not redo this work merely because the downstream graph changes.

Treat WP-01 as reusable completed evidence/foundation.

It does not imply that the old WP-02..WP-42 ordering remains valid.

---

## WP-02 — Build the minimal Browser SQL live-compatibility probe

**Current Issue:** #30  
**State:** already completed  
**Classification:** KEEP

### Why

A sanitized self-contained probe is the correct way to test real-origin runtime feasibility without implementing the product first.

It supports:

- CAP-DB-01 real-origin Browser SQL feasibility;
- CAP-VER-03 Chromium proof;
- CAP-VER-04 self-verifying authenticated-origin gates;
- automation-first engineering verification.

### What remains valid

The probe should continue to prove with synthetic data:

~~~text
injected JS
→ Worker
→ exact Wasm
→ probe-only OPFS
→ write
→ COMMIT
→ CHECKPOINT
→ reopen
→ verify
→ safe cleanup
~~~

### Re-baseline consequence

Preserve the probe and its regression coverage as engineering evidence.

Do not turn it into product runtime logic.

If later live-gate responsibilities are split, the same probe may serve more than one gate.

---

## WP-03 — Execute Live Gate L-1 on the authenticated Leumi page

**Current Issue:** #31  
**State:** open / verification pending  
**Classification:** SPLIT

### Problem in current package

The current Issue combines two independent questions:

1. **SQL runtime/storage feasibility on the real Leumi origin**
   - injection;
   - Worker;
   - exact Wasm;
   - OPFS;
   - COMMIT/CHECKPOINT;
   - reopen.

2. **cross-tab ownership primitive feasibility**
   - Web Locks;
   - two-tab exclusion;
   - release/reacquire semantics.

The first question is a hard prerequisite for building V1-on-SQL.

The second is an important correctness concern for the eventual production runtime, but failure there does not prove that DuckDB/OPFS persistence itself cannot be developed or that a single-owner development vertical slice is impossible.

Binding both into one all-or-nothing implementation-entry gate over-couples two capability groups.

### Proposed split

#### Early gate — real-origin SQL persistence feasibility

Must be satisfied before dependent V1-on-SQL runtime/storage implementation:

~~~text
authenticated Leumi origin
→ injected runtime allowed
→ Worker/Wasm works
→ OPFS works
→ COMMIT/CHECKPOINT
→ reopen/verify
~~~

This gate must be self-verifying and emit sanitized PASS/FAIL.

No visual/manual correctness checklist.

#### Ownership feasibility gate

Verify the selected cross-tab ownership primitive before production multi-tab ownership becomes a dependency.

Web Locks availability can still be probed early because it is cheap, but its acceptance should belong to the ownership capability rather than redefine SQL-engine feasibility.

### Capability coverage

Early half:

- CAP-DB-01
- CAP-VER-04
- CAP-VER-07

Ownership half:

- CAP-RUN-02
- CAP-VER-03
- CAP-VER-04

### Re-baseline consequence

WP-03 should not survive unchanged.

Its already-built probe/evidence remains reusable.

The exact replacement Issues/order are decided only after Pass D/E.

---

## WP-04 — Create deterministic Browser SQL Chromium harness and synthetic fixtures

**Current Issue:** #32  
**State:** open  
**Classification:** SPLIT

### Problem in current package

The current scope tries to create in one early package:

- engine serving;
- universe/provider fixtures;
- temporal fixtures;
- analytical query fixtures;
- failure fixtures;
- OPFS isolation;
- focused test commands.

That front-loads test data for features that belong to later mini-projects.

It also risks creating a giant generic harness before the observable contracts being tested exist.

### Proposed split by need

#### Early V1-on-SQL verification foundation

Build only what the first vertical slice needs:

- deterministic exact engine assets;
- sanitized MapHeat/GetSecuritiesData fixtures;
- dynamic-universe cases;
- duplicate/missing/unexpected IDs;
- null/zero/empty/missing source cases;
- OPFS-isolated Chromium context/database helpers;
- persistence/reopen/failure-injection seams required by parity work.

#### Enrichment-specific fixtures

Add only when the analytical-data mini-project begins:

- horizon jitter;
- no-history;
- denominator-zero;
- temporal-link cases;
- enrichment failure scenarios.

#### Scanner-specific fixtures

Add only when Dynamic SQL Scanner begins:

- SELECT/JOIN/GROUP BY/HAVING/window/ranking;
- zero rows;
- syntax/runtime errors;
- large result/preview behavior;
- scheduler/overrun/cancellation cases.

### Capability coverage

Early slice:

- CAP-VER-01
- CAP-VER-02
- CAP-VER-03
- CAP-VER-07

Later fixture families follow their owning product mini-projects.

### Re-baseline consequence

Keep a small deterministic Chromium foundation early.

Do not create all future fixtures before their public contracts exist.

---

## WP-05 — Implement SQL Authority Worker bootstrap and minimal Controller bridge

**Current Issue:** #33  
**State:** open  
**Classification:** KEEP

### Why

A dedicated SQL authority with a minimal page↔Worker request bridge is directly required for the V1-on-SQL vertical slice.

It supports:

- one SQL execution/storage authority;
- keeping provider authentication in page context;
- Worker-owned DuckDB;
- future detachable Viewer/read APIs.

### Scope correction

Keep this package deliberately minimal:

~~~text
page/runtime
→ minimal Controller bridge
→ one SQL Authority Worker
→ explicit READY / FAILED
~~~

Do not let it absorb:

- cross-tab production ownership;
- Scanner protocol;
- full Viewer state protocol;
- scheduler state;
- analytical resource isolation.

Those belong to their own capability owners.

### Capability coverage

- CAP-DB-02
- CAP-RUN-03 foundation
- CAP-RUN-05
- CAP-VER-03

### Sequencing note

This belongs very early in the corrected V1-on-SQL foundation, after the real-origin engine/storage premise is sufficiently proven and alongside the minimum Chromium harness.

---

## WP-06 — Implement OPFS open/reopen and browser storage durability classification

**Current Issue:** #34  
**State:** open  
**Classification:** KEEP

### Why

Persistent reopen is not optional enrichment or Scanner functionality.

It is part of the basic promise that V1 history moved to a persistent SQL authority.

Without it, there is no meaningful V1-on-SQL parity.

### What remains valid

- production logical DB identity;
- reopen the same DB;
- CHECKPOINT/reopen verification;
- explicit persisted/best-effort storage classification;
- no destructive automatic reset;
- explicit blocked/recovery state.

### Capability coverage

- CAP-DB-03
- CAP-LIFE-01
- CAP-LIFE-02
- CAP-VER-03

### Scope boundary

Do not expand this package into:

- archive/export;
- rollover;
- generalized future release upgrade;
- legacy IndexedDB migration.

Those require separate justification.

---

## WP-07 — Implement logical schema versioning and core relational schema

**Current Issue:** #35  
**State:** open  
**Classification:** SPLIT

### Problem in current package

The current package mixes two different lifecycle moments:

1. the **minimum market-data schema needed for V1-on-SQL parity**;
2. a generalized ordered schema-migration framework.

It also risks letting analytical/enrichment schema decisions become prerequisites for the first Current/History vertical slice.

### Proposed split

#### V1-on-SQL minimum durable schema

The early schema should contain only what is needed to preserve the V1 market-history contract truthfully:

~~~text
schema identity/version marker
recording session/run identity
security catalog + full raw MapHeat
current universe
complete cycle
historical snapshot + full raw Security
latest/current pointer
stable canonical SecurityId
stable snapshot identity where required
cycle uniqueness/idempotency foundations
~~~

This schema must be sufficient for:

- atomic complete-cycle persistence;
- Current Universe reads;
- Security Detail/History reads;
- raw-source preservation.

It must not require temporal horizon columns or Dynamic SQL query-state tables.

#### Schema evolution/migration capability

Plan the actual forward schema-evolution mechanism before enrichment changes the durable schema and certainly before production cutover.

That mechanism should be driven by concrete schema changes we now know are needed, rather than building a generalized framework before the first usable SQL-backed product slice exists.

### Capability coverage

Minimum schema:

- CAP-DB-04
- CAP-DB-05 foundation
- CAP-DB-07
- CAP-AN-01 only where stable SnapshotId is needed for history identity/future links

Later evolution:

- persistence compatibility/recovery correctness;
- enrichment schema additions;
- initial-release upgrade/cutover safety.

### Re-baseline consequence

The current WP-07 should not survive as one package.

The first replacement owns **minimal V1 parity schema**.

A later package owns **schema evolution needed by the next actual durable change**.

---

# B1 cross-package findings

## Finding B1-01 — The earliest useful target should be V1-on-SQL, not an abstract SQL platform

The first product-shaped path emerging from WP-01..07 is:

~~~text
pinned engine evidence
→ real-origin SQL persistence feasibility
→ minimal Chromium/provider fixture foundation
→ SQL Authority Worker
→ persistent OPFS reopen
→ minimal V1-parity schema
~~~

This is a foundation for the later vertical slice:

~~~text
same V1 validated collector
→ atomic SQL cycle
→ Current Universe
→ Security Detail/History
~~~

## Finding B1-02 — Verification scaffolding should grow with the product

Do not implement every temporal/query/failure fixture in an early generic test package.

Use:

~~~text
current contract
→ smallest sufficient fixture/harness
→ temporary POC if needed
→ durable regression only when justified
~~~

## Finding B1-03 — Real-origin feasibility and production ownership are different gates

Worker/Wasm/OPFS feasibility must be known before dependent SQL persistence work.

Cross-tab ownership is also required for the finished production runtime, but should not be allowed to distort the definition of SQL persistence feasibility.

## Finding B1-04 — Minimal schema comes before enrichment schema

The V1-on-SQL vertical slice needs truthful current/history storage first.

Temporal predecessor columns, derived metrics and Scanner/query-state schema should be owned by later mini-projects.

## Finding B1-05 — No implementation changes are authorized by this audit

Pass B records planning conclusions only.

Canonical Issue rewrites, dependency changes and replacement packages wait until the later materialization pass after the entire backlog and missing-work audit are complete.


---

# Pass B2 — WP-08 through WP-14

## WP-08 — Implement startup readiness and unclean-runtime recovery

**Current Issue:** #36  
**State:** open  
**Classification:** KEEP

### Why

Startup/readiness/recovery is part of the minimum trustworthy V1-on-SQL authority.

A persisted SQL database is not usable merely because it can reopen. Before the Recorder writes again, the runtime must know that:

- schema/state is readable;
- current/latest invariants are coherent;
- stale prior runtime/session state is classified truthfully;
- unresolved recovery blocks writes rather than resetting or guessing.

### Capability coverage

- CAP-DB-03
- CAP-RUN-04
- CAP-LIFE-01
- CAP-VER-03

### Scope correction

Keep the package focused on the **minimum V1-on-SQL authority state**.

Do not make readiness depend on Scanner state, horizon enrichment, query scheduler state or generalized future-upgrade machinery.

### Sequencing consequence

This remains early, immediately after the minimum persistent schema/reopen foundation.

---

## WP-09 — Implement immutable validated-cycle handoff and defensive authority validation

**Current Issue:** #37  
**State:** open  
**Classification:** KEEP

### Why

This is one of the most important D-043 boundaries.

The V2 SQL system must consume the same validated complete-cycle market facts already produced by the proven V1 collector.

The handoff is the seam that lets us change persistence without redesigning provider acquisition.

### What must remain

- exact dynamic-universe membership;
- full raw MapHeat;
- full raw Security;
- canonical SecurityId;
- source timing evidence;
- null/zero/empty/missing distinctions;
- rejection of partial/duplicate/missing/unexpected data;
- stable ingest-token identity across retry.

### Capability coverage

- CAP-COL-01 through CAP-COL-05
- CAP-COL-07
- CAP-DB-06 foundation
- CAP-VER-01

### Sequencing consequence

This belongs in the V1-on-SQL mini-project before any enrichment.

Its automated verification should include V1-derived characterization fixtures so SQL handoff equivalence is proved rather than assumed.

---

## WP-10 — Implement one-cycle bulk staging and verified typed promotion

**Current Issue:** #38  
**State:** open  
**Classification:** SPLIT

### Problem in current package

The current WP combines two concerns with different reasons and timing:

1. **efficient one-cycle transport/staging of the complete validated V1 facts**;
2. **selection/promotion of typed analytical columns**.

Bulk staging is a fundamental ingest-mechanics concern.

Typed promotion is a data-model/product/query concern and should be introduced only where a current read/analysis need justifies it.

The current fixed promotion list:

~~~text
LastKnownRate
DailyDealsQuantity
BuyLimit1
SellLimit1
~~~

does not itself represent full V1 Viewer parity and should not silently become the canonical analytical schema merely because it was chosen in an earlier architecture phase.

### Proposed split

#### Early package — complete-cycle bulk staging

Own:

- one validated cycle transferred as a bounded bulk unit;
- full raw source preservation;
- no per-security page↔Worker RPC loop;
- exact source-value distinctions;
- round-trip verification in real DuckDB/Chromium.

This is required before atomic cycle persistence.

#### Later/need-driven typed projections

Typed columns/projections are added based on their actual consumers:

- minimum V1 Current/Detail read efficiency;
- later enrichment;
- later Dynamic SQL performance.

The plan should first decide whether V1 parity reads can use raw JSON directly, a V1-compatible typed projection, or a small promoted set justified by benchmark/read ergonomics.

Do not promote fields merely because they are available.

### Capability coverage

Early staging:

- CAP-DB-05 foundation
- CAP-DB-08 raw queryability
- CAP-VER-03

Typed promotion:

- CAP-DB-07 where needed for product reads
- CAP-AN-06
- CAP-VER-06 performance evidence

### Re-baseline consequence

WP-10 should not survive as one early package with a preselected mixed-purpose promotion list.

---

## WP-11 — Implement atomic successful-cycle persistence and current/latest synchronization

**Current Issue:** #39  
**State:** open  
**Classification:** KEEP

### Why

This is the core persistence contract for V1-on-SQL.

The minimum SQL authority must atomically advance:

~~~text
cycle
history snapshots
security/raw MapHeat catalog
current universe
latest/current pointers
session/cycle metadata
~~~

or expose none of the attempted successful cycle.

### Capability coverage

- CAP-DB-05
- CAP-COL-07
- CAP-CUR-01 foundation
- CAP-DET-02 foundation
- CAP-VER-03

### Important boundary

Atomic persistence must work **without temporal enrichment**.

Later enrichment may join the same transaction if product correctness requires derived values to be part of the successful analytical snapshot, but that is a later mini-project decision.

The foundation itself must prove raw/current/history atomicity first.

### Verification

This deserves durable Chromium failure-injection regression coverage:

- fail before transaction;
- fail during snapshot insertion;
- fail before COMMIT;
- dynamic universe remove/add;
- prior committed state remains intact.

---

## WP-12 — Implement temporal predecessor links and core persisted enrichment

**Current Issue:** #40  
**State:** open  
**Classification:** REORDER

### Why it remains required

The product direction still requires:

- stable historical predecessor references;
- canonical 10/20/30/60/90/120/300/600s horizons;
- persisted LAST-change metrics;
- selected cheap verified same-row metrics;
- deal deltas only after provider semantics are proven.

So this is not obsolete work.

### Why it must move

None of the following requires WP-12:

- preserving V1 provider collection;
- storing a complete raw SQL cycle;
- Current Universe parity;
- Security Detail/History parity;
- durable acknowledgement/idempotency.

Making temporal enrichment a prerequisite for the first V1-on-SQL slice increases complexity before we have proved the storage replacement itself.

### New conceptual home

WP-12 belongs to the separate **analytical data/enrichment mini-project** after V1-on-SQL parity.

Before implementation, that mini-project should re-evaluate:

- which horizons remain worth persisting;
- predecessor algorithm;
- which metrics are persisted versus computed dynamically;
- storage cost;
- ingest cost;
- query benefit;
- mixed-workload performance.

### Capability coverage

- CAP-AN-02 through CAP-AN-08
- CAP-VER-06

### Re-baseline consequence

Keep the requirement, move the work.

Do not let WP-12 block V1-on-SQL parity.

---

## WP-13 — Implement CHECKPOINT-before-ack durability and ingest-token reconciliation

**Current Issue:** #41  
**State:** open  
**Classification:** KEEP + REORDER

### Why

Durable acknowledgement and idempotent retry are correctness properties of the basic SQL storage replacement.

They are not analytical enrichment features.

The product must never say a cycle succeeded and then create duplicate history because acknowledgement was lost.

### Current dependency defect

Current dependency:

~~~text
WP-11 atomic persistence
+
WP-12 temporal enrichment
→ WP-13 durability/idempotency
~~~

The WP-12 dependency is artificial for the V1-on-SQL foundation.

Correct conceptual dependency:

~~~text
validated handoff
→ atomic raw/current/history persistence
→ durability / acknowledgement / retry reconciliation
~~~

Temporal enrichment can later inherit the already-proven durable transaction/retry boundary.

### Capability coverage

- CAP-DB-06
- CAP-DB-03 recovery semantics
- CAP-RUN-04
- CAP-VER-03

### Verification

Permanent fault-injection coverage should prove at least:

~~~text
COMMIT succeeds
→ acknowledgement is lost
→ reopen/retry same ingest token
→ exactly one durable cycle
~~~

and the CHECKPOINT-uncertain branch must remain explicit.

### Re-baseline consequence

Keep this package but move it before enrichment and remove WP-12 as a prerequisite in the later canonical graph.

---

## WP-14 — Close SQL-authority ingest/recovery integration checkpoint

**Current Issue:** #42  
**State:** open  
**Classification:** SPLIT

### Problem in current package

The current M2 checkpoint requires WP-08..WP-13, which means it combines:

- basic SQL authority readiness/recovery;
- exact V1-cycle handoff;
- bulk ingest;
- atomic raw/current/history persistence;
- durability/idempotency;
- temporal enrichment.

That prevents us from obtaining an early verified storage-replacement checkpoint.

It also labels the checkpoint as ready for analytical runtime work before the V1 Current/History product slice has been proven.

### Proposed split

#### Foundation checkpoint — SQL persistence parity

Verify automatically:

- persistent reopen/readiness;
- exact V1 validated-cycle handoff;
- complete raw preservation;
- atomic history/current/latest;
- durable acknowledgement;
- idempotent retry;
- dynamic universe behavior;
- null/zero/empty/missing semantics;
- Fast CI + full Chromium integration.

This checkpoint excludes temporal enrichment.

It proves:

~~~text
same validated V1 market cycle
→ trustworthy persistent SQL authority
~~~

It does **not yet** prove the Viewer product.

#### Later enrichment checkpoint

After enrichment design/benchmark/implementation, separately prove:

- predecessor selection;
- horizon NULL/warm-up;
- derived-value correctness;
- enrichment transaction semantics;
- performance headroom.

#### Later V1-on-SQL product checkpoint

A distinct later checkpoint must prove:

~~~text
same collector
→ SQL durable authority
→ Current Universe
→ Security Detail/History
~~~

This will require WPs/read-contract/Viewer work audited later.

### Capability coverage

Foundation checkpoint:

- CAP-COL-04/05/07
- CAP-DB-03/04/05/06
- CAP-VER-01/03/07

Enrichment checkpoint:

- CAP-AN-* relevant capabilities
- CAP-VER-06

### Re-baseline consequence

The old M2 closure should not survive as one checkpoint.

---

# B2 cross-package findings

## Finding B2-01 — V1-on-SQL persistence has a coherent minimum

The minimum trustworthy persistence chain is now:

~~~text
minimum persistent schema
→ startup readiness/recovery
→ immutable V1 validated-cycle handoff
→ complete-cycle bulk staging
→ atomic raw/current/history persistence
→ CHECKPOINT/ack/idempotent retry
→ persistence foundation checkpoint
~~~

Temporal enrichment is not part of that chain.

## Finding B2-02 — WP-12 currently creates an artificial dependency wall

Temporal horizons and derived metrics are analytically important, but they should not block:

- durable acknowledgement;
- retry reconciliation;
- initial SQL persistence checkpoint;
- later Current/History parity.

## Finding B2-03 — typed promotion must be consumer-driven

The old WP-10 promotion list is an implementation choice, not a complete product contract.

The corrected plan must identify:

~~~text
consumer/read need
→ required typed projection
→ benchmark/correctness evidence
→ persist/promote only when justified
~~~

Full raw source preservation remains mandatory regardless.

## Finding B2-04 — persistence checkpoint and product checkpoint are different

A green SQL persistence foundation proves the storage authority.

It does not prove the user-facing V1 replacement.

The corrected plan must later include a separate product checkpoint for Current Universe + Security Detail/History parity.

## Finding B2-05 — automated fault injection is first-class implementation evidence

Atomicity/durability/retry behavior should be proven in GitHub Actions/Chromium through explicit fault injection.

These checks must not be delegated to the user.

## Finding B2-06 — no implementation or canonical graph mutation yet

Pass B2 records classification only.

The full backlog must be audited before replacement Issues/dependencies are materialized.


---

# Pass B3 — WP-15 through WP-20

## WP-15 — Implement query-definition/version/execution persistence

**Current Issue:** #43  
**State:** open  
**Classification:** SPLIT + REORDER

### Why the capability remains

The Dynamic SQL Scanner needs durable state for at least:

- active SQL text/definition;
- active repeat interval;
- activation state;
- restart/reopen recovery;
- distinction between latest execution and latest successful execution where surfaced.

Those are real Scanner product requirements.

### Problem in current package

The current WP assumes a fairly rich persistence model up front:

~~~text
query_definition
immutable query_version
active_query_state
query_execution
~~~

and treats immutable version history as if it were itself a product requirement.

The product requires correct active/draft/restart/result semantics. It does not inherently require a permanent immutable history record for every SQL edit.

### Proposed split

#### Scanner durable configuration/lifecycle state [CORE]

Persist only what is required to recover the product truthfully:

- active SQL definition or exact active SQL snapshot;
- active interval;
- activation timestamp/anchor only if the chosen scheduler semantics need it;
- active/suspended state;
- latest execution identity/status as required by the UI;
- latest successful execution identity as required by the UI.

#### Execution/version audit history [JUSTIFY LATER]

Keep richer immutable query-version/execution history only if needed for:

- exact result attribution;
- diagnostics;
- recovery correctness;
- benchmark/observability;
- future saved-query/history functionality.

If exact attribution can be achieved more simply by storing the executed SQL/hash/snapshot with each execution, do not build generalized query-version history merely because the old architecture selected it.

### Capability coverage

- CAP-SCN-01
- CAP-SCN-02
- CAP-SCN-03
- CAP-SCN-11
- CAP-VER-05

### Sequencing consequence

All of this moves into the Dynamic SQL Scanner mini-project and must not block V1-on-SQL parity.

---

## WP-16 — Implement analytical SQL safety classification and DuckDB hardening

**Current Issue:** #44  
**State:** open  
**Classification:** KEEP + REORDER

### Why

Once arbitrary user SQL exists, a hard read-only analytical boundary is non-negotiable.

The Scanner must not be able to:

- mutate authoritative market data;
- execute trusted migration/admin paths;
- enable unintended external/file/network surfaces;
- weaken engine hardening.

### What remains valid

- parsed/engine-backed statement classification rather than prefix-only regex;
- one result-producing analytical statement where that remains the chosen product contract;
- DDL/DML/admin/config/transaction rejection;
- trusted migration/admin SQL on a separate application path;
- pinned-build external-access/extension/configuration hardening.

### Scope boundary

This work belongs only when user-defined SQL is introduced.

It is not a prerequisite for the V1 Current Universe or Security Detail/History surfaces because those use trusted application-owned read contracts, not arbitrary user SQL.

### Capability coverage

- CAP-SCN-04
- CAP-RUN-05
- CAP-VER-05
- CAP-VER-03

---

## WP-17 — Implement streamed analytical query execution and result-state semantics

**Current Issue:** #45  
**State:** open  
**Classification:** SPLIT + REORDER

### Core behavior that must remain

The Scanner needs:

- execute the active user SQL against committed state;
- SELECT/JOIN/GROUP BY/HAVING/window/ranking support where the engine supports the required contract;
- dynamic result schema;
- zero rows = successful result;
- query errors isolated from market ingestion;
- latest execution distinct from latest successful result;
- timing/status/row-count metadata sufficient for the product;
- bounded UI delivery when necessary.

### Problem in current package

The current WP also commits early to a specific large-result implementation:

~~~text
stream Arrow result batches
count every full result row
materialize only bounded Viewer preview
~~~

Streaming may be the correct implementation, but it is an optimization/mechanism, not the primary product contract.

It should be selected from evidence about:

- actual Scanner result sizes;
- DuckDB-Wasm behavior;
- memory use;
- UI preview requirements;
- cancellation/preemption strategy;
- benchmark data.

### Proposed split

#### Core Scanner query execution/result semantics

Implement the observable Scanner contract first.

#### Large-result delivery strategy

Choose streaming/materialization/paging/truncation behavior through focused Chromium POCs and benchmarks.

If preview is bounded, truncation/completeness must be explicit; no silent SQL rewrite/LIMIT is allowed.

### Capability coverage

- CAP-SCN-06
- CAP-SCN-07
- CAP-SCN-08
- CAP-SCN-09
- CAP-VER-05
- CAP-VER-06 for large-result strategy

---

## WP-18 — Implement anchored non-overlapping scheduler and DB-operation priority

**Current Issue:** #46  
**State:** open  
**Classification:** SPLIT + REORDER

### Core behavior that must remain

The product requires:

- Scanner interval independent from collection cadence;
- repeated execution;
- no overlapping execution of one active Scanner;
- deterministic overrun behavior;
- query reads only coherent committed state.

These are Scanner lifecycle contracts.

### What is not yet a product requirement

The old WP fixes several implementation decisions at once:

- activation-anchored cadence;
- coalesced missed ticks;
- one pending opportunity;
- explicit DB-operation priority model;
- ingest priority over pending analytics.

Some of these are likely good engineering choices, but they need to be justified against actual runtime behavior and benchmark evidence.

The product requirement is deterministic, non-overlapping repeated execution that does not damage ingestion—not a particular scheduler algorithm.

### Proposed split

#### Scanner repeat scheduler [CORE]

Own:

- user interval;
- activation/start semantics;
- one active execution maximum;
- deterministic overrun/missed-tick policy;
- clean stop/change/replace behavior.

#### Ingest-vs-analytics resource policy [CORRECTNESS/PERFORMANCE]

Own separately with the resource-isolation work:

- whether waiting ingest preempts active analytics;
- connection separation;
- cancellation;
- hard runtime budgets;
- backpressure;
- queue bounds.

Those behaviors should be driven by measured contention, not hidden inside the basic scheduler package.

### Capability coverage

Core scheduler:

- CAP-SCN-02
- CAP-SCN-03
- CAP-SCN-05
- CAP-SCN-06
- CAP-VER-05

Resource policy:

- CAP-VER-06
- runtime correctness under mixed workload

### Sequencing consequence

Scheduler belongs inside the Scanner mini-project.

Resource isolation must not automatically become an early prerequisite until Pass B/F audits WP-40 and benchmark evidence.

---

## WP-19 — Implement query/scheduler restart recovery

**Current Issue:** #47  
**State:** open  
**Classification:** MERGE + REORDER

### Why

The behavior is required:

- active Scanner definition survives restart as defined;
- stale running execution becomes interrupted/unknown rather than guessed success;
- latest successful result identity survives;
- restart does not create a burst of missed executions.

### Why a separate package may be artificial

Much of WP-19 is the runtime behavior of the durable Scanner state already owned conceptually by the corrected WP-15 replacement:

~~~text
persist active Scanner lifecycle state
+
restore it truthfully after restart
~~~

Treating persistence and its recovery as unrelated work risks duplicating state-machine ownership.

### Proposed merge

Create one coherent **Scanner durable lifecycle and restart recovery** package owning:

- active SQL;
- active interval;
- active/suspended status;
- scheduler restart state required by the chosen cadence policy;
- interrupted execution recovery;
- latest-success preservation.

Scheduler calculation itself can remain separately testable, but durable state ownership/recovery should have one owner.

### Capability coverage

- CAP-SCN-03
- CAP-SCN-11
- CAP-RUN-04
- CAP-VER-05

---

## WP-20 — Close analytical SQL runtime checkpoint

**Current Issue:** #48  
**State:** open  
**Classification:** SPLIT + REORDER

### Problem in current package

The current checkpoint declares the analytical runtime complete **before Viewer/product integration**, while also requiring WP-40 resource isolation/cancellation/preemption.

This mixes two different proof goals:

1. a headless Scanner engine can safely execute and schedule user SQL;
2. the complete Dynamic SQL Scanner product is usable, observable and robust under real mixed workload.

It also risks making advanced resource isolation a mandatory blocker before evidence establishes which mechanisms are required.

### Proposed split

#### Scanner core-engine checkpoint

Automatically prove:

- durable active Scanner state;
- safe analytical SQL boundary;
- user SQL executes against committed state;
- zero-row/error/latest-success semantics;
- non-overlap and deterministic interval behavior;
- restart recovery;
- Fast CI + focused/full Chromium as appropriate.

This is a headless/internal integration checkpoint.

#### Final Dynamic SQL Scanner product checkpoint

Occurs only after the later Viewer/UI packages are integrated and proves:

~~~text
editable SQL
+ interval controls
+ active/draft lifecycle
+ dynamic result grid
+ status/errors/timing
+ SecurityId drill-down
+ restart/reopen
+ mixed ingest/query behavior
~~~

Resource-isolation/cancellation/hard-budget mechanisms belong here only to the extent Pass B/F + benchmark evidence prove they are required for correctness/capacity.

### Capability coverage

Core engine:

- CAP-SCN-01 through CAP-SCN-09
- CAP-SCN-11
- CAP-VER-05

Final product checkpoint additionally:

- CAP-SCN-10
- Viewer Scanner contracts
- CAP-VER-06 where performance is release-relevant

### Re-baseline consequence

The current WP-20 must not remain the sole definition of Scanner completion.

---

# B3 cross-package findings

## Finding B3-01 — Dynamic SQL is one separate mini-project

The current WP-15..20 set should move out of the path to V1-on-SQL parity.

A corrected conceptual Scanner sequence is:

~~~text
Scanner durable lifecycle/configuration
→ analytical SQL safety boundary
→ core user-query execution/result semantics
→ repeat scheduler
→ restart recovery
→ core-engine checkpoint
→ Viewer editor/controls/result grid
→ final Scanner product checkpoint
~~~

The exact placement relative to the enrichment mini-project is finalized in Pass D/E.

## Finding B3-02 — Preserve contracts, re-justify mechanisms

Several current choices are plausible but should not be mistaken for product requirements:

~~~text
immutable version table for every SQL edit
Arrow streaming as the mandatory result strategy
full result row counting in every case
activation-anchored cadence
specific pending-tick coalescing algorithm
hard cancellation/preemption before benchmark evidence
~~~

The re-baseline should retain the observable behavior and choose mechanisms through focused POCs/benchmarks.

## Finding B3-03 — Scanner persistence and restart recovery need one state owner

The old WP-15 and WP-19 divide one durable lifecycle across schema creation and later recovery.

The corrected plan should have one owner for the persisted Scanner state machine and its reopen semantics.

## Finding B3-04 — Scheduler and resource isolation are different concerns

Basic repeat/no-overlap semantics are product requirements.

Cancellation, connection recycling, ingest preemption and hard budgets are resource-management mechanisms whose required depth must be established separately.

## Finding B3-05 — Scanner completion needs both engine and product checkpoints

A headless analytical engine checkpoint is useful.

It cannot replace the final user-facing Scanner checkpoint containing the editor, interval controls, dynamic grid, errors/status and drill-down behavior.

## Finding B3-06 — automation-first verification applies throughout

Scanner work should use:

- Node state/scheduler policy tests;
- real Chromium SQL/security/restart tests;
- synthetic query fixtures;
- temporary large-result/cancellation/performance POCs;
- fault injection;
- benchmark evidence.

Only durable public-contract regressions should remain permanently.

No automatable Scanner verification should be delegated to the user.

## Finding B3-07 — no implementation or canonical graph mutation yet

Pass B3 records planning classifications only.

Canonical Issue replacement/reordering waits until the full audit is complete.


---

# Pass B4 — WP-21 through WP-29

## WP-21 — Replace runtime concatenation with deterministic Browser SQL bundling

**Current Issue:** #49  
**State:** open  
**Classification:** KEEP + REORDER

### Why

A reproducible production-shaped runtime artifact is required before the real Collector→SQL→Viewer vertical slice can be trusted on the target page.

It supports:

- exact engine/runtime identity;
- generated rather than hand-edited runtime artifacts;
- reproducible live/provider verification;
- final browser delivery.

### Current sequencing defect

WP-21 currently depends on WP-20, meaning the entire Dynamic SQL engine must be complete before production-shaped runtime bundling begins.

That dependency is not product-driven.

The V1-on-SQL vertical slice needs a generated runtime **before** Scanner completion so it can prove:

~~~text
same collector
→ SQL persistence
→ Viewer Current/History
~~~

### Capability coverage

- CAP-RUN-01
- CAP-VER-03
- CAP-VER-04

### Re-baseline consequence

Keep deterministic bundling, but move it into the V1-on-SQL path before integrated Recorder/live-provider/Viewer verification.

It must not depend on Scanner completion.

---

## WP-22 — Implement Runtime Controller preflight, singleton lifecycle and Worker recovery bridge

**Current Issue:** #50  
**State:** open  
**Classification:** SPLIT + MERGE + REORDER

### Why the core capability remains

A runtime owner is required to coordinate:

- SQL Authority Worker lifecycle;
- readiness/preflight;
- Recorder start only after storage readiness;
- Viewer attachment/read commands;
- controlled Worker recovery;
- same-tab repeated launch.

### Overlap with WP-05

WP-05 already owns:

~~~text
SQL Authority Worker bootstrap
+ minimal Controller bridge
~~~

WP-22 then creates another Controller/lifecycle layer later.

The corrected plan should avoid two artificial phases owning the same runtime boundary.

### Proposed decomposition

#### Early Runtime Controller foundation

Merge the relevant WP-05/WP-22 responsibilities into one coherent early owner:

- instantiate/own the SQL Authority Worker;
- explicit runtime/Worker READY/FAILED;
- minimal request/response/read-command bridge;
- storage readiness before Recorder;
- same-tab repeated-launch reuse;
- one controlled Worker recovery path;
- sanitized runtime failure states.

This belongs before Collector→SQL integration.

#### Cross-tab production ownership

Keep cross-tab exclusion as a separate correctness capability owned with the audited WP-41 replacement.

Do not require the full cross-tab mechanism merely to construct/test the single-runtime V1-on-SQL vertical slice, but require it before production multi-tab operation/cutover.

### Capability coverage

- CAP-DB-02
- CAP-RUN-03
- CAP-RUN-04
- CAP-RUN-05
- CAP-VER-03

### Re-baseline consequence

The current WP-22 should not survive with its old dependencies on WP-21 + WP-41 as one indivisible package.

---

## WP-23 — Integrate the authenticated Recorder with SQL authority persistence

**Current Issue:** #51  
**State:** open  
**Classification:** KEEP + REORDER

### Why

This is the actual product seam that converts the proven V1 collector into a SQL-backed recorder without redesigning provider behavior.

It is essential to the first V1-on-SQL vertical slice.

### What must remain

~~~text
same authenticated page context
same MapHeat2 dynamic universe
same sequential GetSecuritiesData flow
same exact complete-cycle validation
same raw facts
→ SQL durable handoff/acknowledgement
~~~

### Relationship to WP-09

These are distinct responsibilities:

- corrected WP-09: define/prove the immutable validated-cycle boundary;
- WP-23: wire the real inherited Recorder to that boundary.

Do not merge provider acquisition into SQL storage logic.

### Capability coverage

- CAP-COL-01 through CAP-COL-07
- CAP-DB-06
- CAP-VER-01

### Sequencing consequence

Move this immediately after the SQL persistence foundation + production-shaped runtime foundation.

It belongs before enrichment and before Scanner.

---

## WP-24 — Execute Live Gate L-2 provider compatibility

**Current Issue:** #52  
**State:** open  
**Classification:** KEEP + REORDER

### Why

Mocks can prove our integration logic, but only the authenticated Leumi origin can prove that the storage/runtime migration did not accidentally break the real provider acquisition path.

This is a genuine live-only fact.

### Automation-first correction

The live gate must not become a manual correctness checklist.

The candidate runtime/probe should automatically assert and report sanitized PASS/FAIL for:

- MapHeat2 success;
- expected dynamic membership accounting;
- sequential GetSecuritiesData completion;
- complete-cycle validation;
- raw handoff completeness;
- SQL durable cycle acknowledgement;
- absence of copied auth/session material.

The unavoidable human boundary, if any, is only launching/running the self-verifying artifact inside the authenticated session.

### Capability coverage

- CAP-VER-01
- CAP-VER-04
- CAP-VER-07
- D-043 provider continuity

### Sequencing consequence

Place this after integrated Recorder→SQL exists and before declaring V1-on-SQL provider parity complete.

It must not wait for Scanner UI/runtime.

---

## WP-25 — Implement Viewer bridge, attach/re-attach and full state snapshots

**Current Issue:** #53  
**State:** open  
**Classification:** SPLIT + REORDER

### Problem in current package

WP-25 currently builds one Viewer protocol for all three surfaces at once:

~~~text
Current Universe
Security Detail/History
Dynamic SQL Scanner
~~~

That forces Scanner state design into the critical path for basic V1-on-SQL Viewer parity.

### Proposed split

#### Shared Viewer/runtime bridge for V1-derived surfaces

Move early and own:

- same-origin detachable Viewer attachment;
- no direct Viewer DuckDB/OPFS ownership;
- attach/re-attach after reload;
- authoritative resync rather than notification payload authority;
- runtime instance/revision mechanism only to the extent needed for reliable resync;
- trusted Current/Detail/History read command transport;
- Viewer close not stopping Recorder/runtime.

#### Scanner-specific state delivery

Add later with the Scanner mini-project:

- active SQL/config state;
- query execution state;
- latest-success result metadata;
- result-preview state;
- Scanner-specific stale-editor/state revision semantics.

### Capability coverage

Early bridge:

- CAP-UI-02
- CAP-UI-03
- CAP-RUN-03
- CAP-VER-02/03

Later bridge:

- CAP-SCN-03
- CAP-SCN-07/08/11
- CAP-VER-05

### Re-baseline consequence

Do not make Scanner state protocol a dependency for Current/History.

---

## WP-26 — Implement SQL editor activation and multi-Viewer optimistic concurrency

**Current Issue:** #54  
**State:** open  
**Classification:** SPLIT + REORDER

### Core Scanner product behavior that remains

The Dynamic SQL Scanner needs:

- editable draft SQL;
- editable repeat interval;
- explicit activation;
- bad draft leaving current active query unchanged;
- activation/error feedback.

This is clearly Scanner-only work and moves to the Scanner mini-project.

### Mechanism requiring separate justification

The current WP additionally mandates:

~~~text
expectedActiveQueryVersionId
→ multi-Viewer optimistic concurrency
→ stale-editor rejection
~~~

Multiple Viewer windows may exist, but the product contract does not yet independently require simultaneous collaborative Scanner editing.

The corrected plan should decide the concurrency behavior deliberately:

- optimistic concurrency if multiple Scanner editors are a supported first-release behavior;
- simpler single-editor/last-explicit-activation semantics if sufficient;
- never silent corruption/ambiguous active state.

Do not adopt a complex concurrency protocol solely because it exists in the old design.

### Capability coverage

Core:

- CAP-SCN-01
- CAP-SCN-02
- CAP-SCN-03
- CAP-VER-05

Optional/conditional mechanism:

- simultaneous multi-Viewer edit conflict protection.

### Re-baseline consequence

Move core editor/activation/interval work entirely out of the V1-on-SQL path.

---

## WP-27 — Implement query-result preview and health/diagnostic presentation

**Current Issue:** #55  
**State:** open  
**Classification:** SPLIT + REORDER

### Problem in current package

It combines two different UI needs:

1. shared runtime/persistence/collector health and diagnostics;
2. Scanner result-grid semantics.

The first is useful for the V1-on-SQL product.

The second cannot exist until the Scanner engine/UI exists.

### Proposed split

#### Shared V1-on-SQL health/diagnostics

Move early enough to support observable product states:

- runtime/storage/Recorder health;
- last committed cycle/freshness;
- storage/read failure visibility;
- sanitized diagnostics;
- explicit loading/empty/error distinctions.

Preserve the useful V1 diagnostics experience where relevant.

#### Scanner result/diagnostic presentation

Keep later with Scanner:

- dynamic result columns;
- zero-row success;
- latest execution vs latest success;
- query error;
- timing/row-count metadata;
- explicit preview truncation/completeness;
- SecurityId drill-down.

### Capability coverage

Shared:

- CAP-UI-04
- CAP-RUN-06

Scanner:

- CAP-SCN-07/08/10
- CAP-VER-05

### Re-baseline consequence

Do not wait for Scanner results to provide V1-on-SQL health/error visibility.

---

## WP-28 — Move current/history market-data browsing behind SQL authority reads

**Current Issue:** #56  
**State:** open  
**Classification:** SPLIT + REORDER

### Why this package is central

This is the user-facing V1-on-SQL product transition:

~~~text
IndexedDB reads
→ trusted Runtime Controller / SQL Authority reads
→ same Current Universe + Security Detail/History behavior
~~~

It currently appears far too late and depends on WP-12 temporal enrichment.

That WP-12 dependency is not justified.

### Current scope problem

WP-28 mixes:

1. storage/read-model contracts;
2. Runtime read commands;
3. two Viewer surfaces;
4. V1 behavior parity verification;
5. Scanner SecurityId reuse.

These are related but too broad for one implementation package.

### Proposed split

#### Stable SQL read contracts/models

Own application-trusted reads for:

~~~text
Current Universe
selected-security current/detail
selected-security history
bounded continuation/load-older
health/read metadata needed by UI
~~~

Define observable result contracts before UI adaptation.

Do not use arbitrary user SQL as the Viewer contract.

#### Current Universe SQL migration + parity

Own:

- all latest committed securities;
- V1 field/display semantics;
- deterministic sort behavior;
- DB/runtime-only refresh;
- committed-cycle live refresh;
- state preservation.

#### Security Detail/History SQL migration + parity

Own:

- selected SecurityId summary;
- isolated newest-first history;
- bounded paging/load older;
- duplicate/skip-safe continuation;
- return-state/live refresh behavior.

#### Scanner drill-down reuse

A tiny later integration concern: Scanner row with canonical SecurityId navigates into the already-proven detail surface.

### Capability coverage

- CAP-DB-07
- CAP-CUR-01..05
- CAP-DET-01..05
- CAP-VER-02

### Sequencing consequence

Move the read contracts and two V1-derived surfaces immediately after trustworthy SQL persistence + integrated Recorder/runtime.

Remove temporal enrichment and Scanner dependencies from the V1 parity path.

---

## WP-29 — Close runtime and Viewer integration checkpoint

**Current Issue:** #57  
**State:** open  
**Classification:** SPLIT + REORDER

### Problem in current package

WP-29 currently requires all of:

- generated runtime;
- controller;
- real provider integration;
- Viewer bridge;
- Scanner editor;
- Scanner results;
- Current/History migration.

This delays the most important early product proof until the entire Scanner UI exists.

### Proposed split

#### V1-on-SQL product parity checkpoint

This should occur much earlier and prove automatically, with live-only facts separately self-verified:

~~~text
same V1 provider contract
→ SQL durable authority
→ Current Universe
→ Security Detail/History
~~~

Acceptance includes:

- V1 collection characterization preserved;
- Current table parity on shared synthetic cycles;
- detail/history parity;
- null/zero/empty/missing semantics;
- dynamic universe;
- sorting/paging/refresh behavior;
- Viewer reload/re-attach;
- no direct Viewer DB ownership;
- runtime/Recorder health visibility;
- Fast CI + full Browser CI;
- L-2 live provider status accurately recorded.

This is the milestone after which we can truthfully say the storage migration produced the old product behavior on SQL.

#### Final three-surface integration checkpoint

Occurs after the Scanner mini-project and proves:

~~~text
Current Universe
+ Security Detail/History
+ Dynamic SQL Scanner
→ one coherent SQL authority/runtime
~~~

This checkpoint owns the D-043 three-surface integration acceptance.

### Capability coverage

Early checkpoint:

- CAP-COL-*
- CAP-DB-*
- CAP-UI-02..05
- CAP-CUR-*
- CAP-DET-*
- CAP-VER-01/02/03/04/07

Final checkpoint:

- above
- CAP-SCN-*
- final mixed product integration

### Re-baseline consequence

The old single M4 closure is too late and too broad.

---

# B4 cross-package findings

## Finding B4-01 — Old milestone order places product-critical work after Scanner internals

The existing graph effectively requires:

~~~text
complete analytical SQL runtime
→ production runtime packaging/controller
→ real Recorder integration
→ V1 Current/History
~~~

The product-driven sequence should instead expose the V1-on-SQL vertical slice before Scanner:

~~~text
SQL persistence foundation
→ production-shaped runtime/controller
→ real Recorder→SQL integration
→ stable trusted SQL read contracts
→ Current Universe
→ Security Detail/History
→ V1-on-SQL product checkpoint
~~~

## Finding B4-02 — WP-12 must be removed from the Current/History dependency chain

Temporal enrichment is not required to:

- read latest committed securities;
- read one security's raw persisted history;
- preserve V1 sorting/paging/display behavior.

## Finding B4-03 — Viewer transport and Scanner state protocol must be separated

A shared detachable Viewer bridge is needed early.

Scanner-specific state/result/editor protocol should be added only with the Scanner mini-project.

## Finding B4-04 — Trusted product reads are a first-class missing boundary

The corrected plan needs explicit stable application-owned SQL read contracts for Current/Detail/History.

They are distinct from:

- raw DuckDB tables;
- arbitrary user Scanner SQL;
- UI implementation.

This boundary is important enough to receive explicit package ownership in Pass C/G.

## Finding B4-05 — V1 parity needs its own automated product checkpoint

The corrected graph needs a clear point where synthetic fixtures and Chromium prove:

~~~text
same input cycle
→ SQL-backed Current/History
→ same promised observable V1 behavior
~~~

This should happen before enrichment and Scanner development continue.

## Finding B4-06 — Live L-2 remains evidence, not manual QA

Authenticated-provider verification is necessary but must be self-verifying and sanitized.

The user is not the assertion engine.

## Finding B4-07 — runtime/controller responsibilities are currently duplicated

WP-05 and WP-22 both own parts of Worker/Controller bootstrap/lifecycle.

The corrected package set should give this boundary one coherent early owner and keep cross-tab ownership separate.

## Finding B4-08 — no implementation or canonical graph mutation yet

Pass B4 remains planning-only.

Canonical Issue rewrites/dependency changes wait until the full Pass B/C/D/E/F audit is complete.
