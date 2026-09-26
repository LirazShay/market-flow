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
