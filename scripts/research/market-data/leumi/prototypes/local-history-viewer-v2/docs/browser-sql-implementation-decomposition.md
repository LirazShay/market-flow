# Browser SQL — Implementation Decomposition

This is the Phase P planning artifact for Local History Viewer V2.

It converts Phases A–O into issue-ready implementation work packages. It does **not** create GitHub Issues; Phase Q creates the real GitHub execution structure from this document.

Durable sequencing decision: ../../../../../../../docs/project/decisions/D-037.md

## 1. Decomposition rules

- one work package is intended to become one executable GitHub Issue in Phase Q;
- packages are ordered by real dependency, not by document order alone;
- every package owns observable acceptance criteria and its cheapest valid test layer;
- production/browser code packages must follow tests-first when practical;
- no package may bypass the real authenticated-Leumi gates with mock evidence;
- temporary probe/shadow/migration scaffolding must have an explicit removal package;
- package completion requires SPEC impact review and STATUS update;
- no package may introduce a second permanent market-history authority;
- the exact active package later comes from STATUS.json / GitHub issue state, not this document.

## 2. Proposed implementation milestones

| Milestone | Purpose | Packages |
|---|---|---|
| M1 | Feasibility and test foundation | WP-01..WP-04 |
| M2 | SQL authority, OPFS and ingest | WP-05..WP-14 |
| M3 | Analytical SQL runtime | WP-15..WP-20 |
| M4 | Runtime delivery and Viewer | WP-21..WP-29 |
| M5 | Health, diagnostics and security | WP-30..WP-31 |
| M6 | Shadow migration verification | WP-32..WP-33 |
| M7 | Performance and capacity evidence | WP-34..WP-35 |
| M8 | Production cutover and cleanup | WP-36..WP-38 |

These milestone names are Phase-Q inputs. Phase Q may create them as GitHub Milestones when supported/useful.

## 3. Hard gates

### Gate G1 — Real-page feasibility

~~~text
WP-01 → WP-02 → WP-03 PASS
~~~

WP-05 and all heavy Browser SQL authority implementation are blocked until WP-03 directly verifies the selected Worker/Wasm/OPFS premise on the authenticated Leumi page.

WP-04 test-harness work may proceed in parallel with WP-02/WP-03.

### Gate G2 — SQL authority correctness

~~~text
WP-05..WP-14
~~~

Must close atomicity, durable acknowledgement and reopen/recovery before user SQL/runtime product work relies on the database.

### Gate G3 — Analytical runtime

~~~text
WP-15..WP-20
~~~

Must close read-only SQL, result semantics and scheduler behavior before Viewer/editor integration.

### Gate G4 — Integrated runtime/product

~~~text
WP-21..WP-31
~~~

Must close generated delivery, real provider compatibility, Viewer and security/diagnostics before shadow/cutover evidence.

### Gate G5 — Cutover evidence

~~~text
WP-32..WP-35
~~~

Shadow/live correctness and target Windows/Chrome capacity evidence must be green before production authority switch.

### Gate G6 — Production cutover

~~~text
WP-36..WP-38
~~~

Explicit authority switch, rollback/live endurance, then removal of temporary migration scaffolding.

## 4. Work packages

### WP-01 — Pin DuckDB-Wasm and create the engine asset manifest foundation

**Milestone:** M1

**Depends on:** none

**Scope**

- add the exact reviewed @duckdb/duckdb-wasm dependency and lockfile state;
- record exact package identity and embedded DuckDB core version when observable;
- create deterministic engine asset-manifest generation for matching mvp/eh Worker + Wasm URLs;
- prohibit floating latest/next URLs and implicit version fallback;

**Acceptance**

- generated manifest identifies one exact package and matching Worker/Wasm artifacts;
- mvp and eh asset pairs cannot accidentally mix versions;
- Fast tests prove manifest determinism and reject floating/version-mismatched configuration;

**Primary verification:** Node/Fast CI

**Exit:** Exact engine identity exists, is reproducible, and no Browser SQL authority code is added yet.

### WP-02 — Build the minimal Browser SQL live-compatibility probe

**Milestone:** M1

**Depends on:** WP-01

**Scope**

- build a minimal sanitized Bookmarklet/injected probe separate from the production database;
- exercise Blob Worker creation, pinned Worker loading, Wasm instantiate and a probe-only OPFS database;
- write one synthetic row, COMMIT, CHECKPOINT, reopen and verify;
- ensure probe cleanup can delete only the probe-owned database;

**Acceptance**

- probe contains no provider calls, credentials, account data or production database name;
- each bootstrap stage reports a distinct sanitized success/failure;
- probe can be generated from repository source;

**Primary verification:** Node artifact checks + Playwright Chromium probe harness

**Exit:** A safe executable probe exists for the real authenticated Leumi page.

### WP-03 — Execute Live Gate L-1 on the authenticated Leumi page

**Milestone:** M1

**Depends on:** WP-02

**Scope**

- run the exact generated probe on the real authenticated Leumi page;
- record only sanitized capability outcomes;
- verify injected JS, Blob Worker, pinned Worker/Wasm, OPFS write, COMMIT, CHECKPOINT, refresh/relaunch and reopen;
- classify every material result Verified/Inferred/Unknown;

**Acceptance**

- all required Browser SQL capabilities are directly Verified on the real page before dependent heavy work;
- no cookies, headers, tokens, account data, HAR or private screenshots are persisted;
- failure blocks WP-05 onward and records the exact capability that failed;

**Primary verification:** Live authenticated-Leumi verification

**Exit:** Hard implementation-entry gate. PASS unlocks WP-05+; FAIL returns architecture to evidence review.

### WP-04 — Create deterministic Browser SQL Chromium harness and synthetic fixtures

**Milestone:** M1

**Depends on:** WP-01

**Scope**

- serve exact pinned engine assets deterministically for normal CI;
- add sanitized synthetic universe/provider/temporal/query/failure fixtures;
- provide isolated OPFS database identities/BrowserContexts;
- add focused browser scripts/tags only when real specs exist;

**Acceptance**

- Chromium tests do not require Leumi credentials or live provider access;
- fixtures preserve null/zero/empty/missing and dynamic ID cases;
- OPFS tests cannot delete the production database identity;

**Primary verification:** Fast checks + targeted Playwright

**Exit:** Browser SQL implementation has a deterministic real-browser test foundation.

### WP-05 — Implement SQL Authority Worker bootstrap and minimal Controller bridge

**Milestone:** M2

**Depends on:** WP-03, WP-04

**Scope**

- create one dedicated SQL Authority Worker;
- instantiate the pinned DuckDB-Wasm engine with selected mvp/eh bundle;
- create minimal request/response correlation between Runtime Controller and Worker;
- enforce one healthy authority owner per runtime;

**Acceptance**

- Worker reaches an explicit READY/FAILED state;
- repeated runtime bootstrap does not create a second SQL authority;
- provider authentication/session data is never sent to the Worker;

**Primary verification:** Node state tests + Playwright engine-bootstrap

**Exit:** One browser SQL authority can start safely under deterministic Chromium.

### WP-06 — Implement OPFS open/reopen and browser storage durability classification

**Milestone:** M2

**Depends on:** WP-05

**Scope**

- open the production logical OPFS path through the SQL Worker;
- implement persisted/best-effort storage classification and storage estimate observation;
- support reopen without creating a replacement database;
- surface blocked/recovery states without automatic reset;

**Acceptance**

- write/CHECKPOINT/reopen survives Chromium page/runtime reopen;
- denied persistence is reported as best-effort rather than guaranteed;
- unexpected incompatible production DB never triggers destructive recreation;

**Primary verification:** Playwright opfs-persistence + Node state policy

**Exit:** Persistent SQL authority can reopen coherently.

### WP-07 — Implement logical schema versioning and core relational schema

**Milestone:** M2

**Depends on:** WP-06

**Scope**

- implement schema_meta and ordered migration framework;
- create recording_session, security, current_universe, cycle, snapshot and latest_snapshot;
- add UNIQUE(cycle_id, security_id) and UNIQUE ingest_token semantics;
- keep schema migrations non-destructive and schema_meta updated last;

**Acceptance**

- fresh database initializes to the current logical schema;
- supported older schema migrates explicitly;
- newer/unknown schema refuses writes without reset;

**Primary verification:** Node migration decisions + Playwright schema/reopen

**Exit:** The target market-history schema exists with explicit version ownership.

### WP-08 — Implement startup readiness and unclean-runtime recovery

**Milestone:** M2

**Depends on:** WP-07

**Scope**

- validate schema/readability/latest-current invariants before READY;
- mark stale running sessions interrupted without fabricating stop time;
- define persistent recovery state required before Recorder starts;
- surface recovery-required when readiness cannot be proven;

**Acceptance**

- Recorder cannot start before readiness succeeds;
- unclean prior session becomes interrupted and a new session is created;
- readiness failure preserves evidence and never resets the database;

**Primary verification:** Node recovery policy + Playwright reopen/recovery

**Exit:** Startup/reopen has deterministic recovery semantics.

### WP-09 — Implement immutable validated-cycle handoff and defensive authority validation

**Milestone:** M2

**Depends on:** WP-08

**Scope**

- adapt existing complete-cycle output into the target immutable handoff;
- attach stable ingest_token before Worker handoff;
- include exact validated universe, full raw MapHeat and full raw Security records;
- revalidate complete counts/membership/IDs/timestamps at SQL authority boundary;

**Acceptance**

- partial/duplicate/missing/unexpected cycle never reaches successful SQL mutation;
- same handoff preserves the same ingest_token across retry;
- conflicting data under one ingest_token is rejected;

**Primary verification:** Node exact-membership/handoff tests

**Exit:** Recorder-to-SQL authority contract is explicit and idempotency-ready.

### WP-10 — Implement one-cycle bulk staging and verified typed promotion

**Milestone:** M2

**Depends on:** WP-09

**Scope**

- normalize one validated cycle into one Arrow/equivalent bulk relation;
- preserve complete raw JSON;
- promote verified LastKnownRate, DailyDealsQuantity, BuyLimit1 and SellLimit1 mappings;
- preserve null/zero/empty/missing source semantics;

**Acceptance**

- no per-security JS→Worker→SQL RPC loop is used;
- raw future fields remain queryable;
- invalid typed shapes fail rather than silently coercing source data;

**Primary verification:** Node normalization + Playwright bulk roundtrip

**Exit:** A complete cycle can enter DuckDB as one validated bulk staging unit.

### WP-11 — Implement atomic successful-cycle persistence and current/latest synchronization

**Milestone:** M2

**Depends on:** WP-10

**Scope**

- insert complete cycle metadata and one snapshot per security;
- upsert security catalog/raw MapHeat;
- synchronize current_universe and latest_snapshot in the same transaction;
- update recording_session counters/metadata;
- rollback the complete attempted cycle on any transactional failure;

**Acceptance**

- N-security successful cycle exposes exactly N coherent snapshots/current/latest entries;
- injected pre-COMMIT failure exposes none of the attempted cycle;
- security leaving the universe leaves current/latest but history remains;

**Primary verification:** Playwright atomic-cycle-ingest + Node set logic

**Exit:** One cycle is all-or-nothing SQL-visible market state.

### WP-12 — Implement temporal predecessor links and core persisted enrichment

**Milestone:** M2

**Depends on:** WP-11

**Scope**

- implement the canonical 10/20/30/60/90/120/300/600-second horizon set;
- resolve latest same-security predecessor at or before target time;
- compute MID and LAST-change under verified null/zero rules;
- keep DealsDelta disabled/NULL until provider reset semantics are explicitly verified;

**Acceptance**

- ~11-second prior snapshot is valid for 10-second horizon;
- too-young/no history produces NULL;
- zero denominator produces NULL;
- derived-field failure remains inside cycle transaction and rolls back raw rows too;

**Primary verification:** Node arithmetic/predecessor logic + Playwright temporal-enrichment

**Exit:** Core temporal facts are deterministic, reusable and atomically persisted.

### WP-13 — Implement CHECKPOINT-before-ack durability and ingest-token reconciliation

**Milestone:** M2

**Depends on:** WP-11, WP-12

**Scope**

- make durable cycle success COMMIT → CHECKPOINT → acknowledgement;
- withhold success on post-COMMIT CHECKPOINT ambiguity;
- reconcile retry using UNIQUE ingest_token;
- support already-committed matching retry without duplicate history;

**Acceptance**

- lost acknowledgement after COMMIT never duplicates a cycle;
- CHECKPOINT failure becomes durability-uncertain/blocked;
- blind replay is impossible;

**Primary verification:** Playwright ingest-idempotency-recovery + failure injection

**Exit:** Recorder acknowledgement means durable, reconciled cycle persistence.

### WP-14 — Close SQL-authority ingest/recovery integration checkpoint

**Milestone:** M2

**Depends on:** WP-08..WP-13

**Scope**

- run the complete browser persistence/atomicity/recovery suite on final M2 code;
- verify dynamic universe/raw-data/null semantics across reopen;
- update implemented normative specs for the SQL authority contracts now delivered;

**Acceptance**

- all M2 public contracts pass in Chromium;
- Fast CI and full Browser CI are green;
- no live-only requirement is falsely marked Verified;

**Primary verification:** Fast CI + full Browser CI

**Exit:** M2 is a numbered implementation checkpoint ready for SQL runtime work.

### WP-15 — Implement query-definition/version/execution persistence

**Milestone:** M3

**Depends on:** WP-14

**Scope**

- add query_definition, immutable query_version, active_query_state and query_execution schema/migrations;
- persist active version, interval and schedule anchor;
- preserve latest execution and latest successful execution identities;

**Acceptance**

- SQL edit creates a new immutable version;
- old executions remain attributable to exact prior version;
- 0-row successful execution can be represented distinctly from error;

**Primary verification:** Node model tests + Playwright schema/reopen

**Exit:** Analytical query identity/state survives runtime restart.

### WP-16 — Implement analytical SQL safety classification and DuckDB hardening

**Milestone:** M3

**Depends on:** WP-15

**Scope**

- enforce one result-producing analytical statement;
- reject DDL/DML/admin/config/transaction commands by parsed statement type;
- apply verified external-access/extension/configuration hardening for the pinned build;
- keep trusted migration/admin SQL on a separate application path;

**Acceptance**

- unsafe SQL is rejected before mutation;
- prefix/regex-only classification is not the safety mechanism;
- external-access attempts fail under the configured hardening;

**Primary verification:** Node policy tests + Playwright runtime-security

**Exit:** User SQL cannot mutate the authoritative database or open unintended external surfaces.

### WP-17 — Implement streamed analytical query execution and result-state semantics

**Milestone:** M3

**Depends on:** WP-16

**Scope**

- execute active SQL against committed state;
- stream Arrow result batches and count full rows;
- materialize only bounded Viewer preview;
- record query_execution timing/status/row counts/error metadata;
- keep latest execution separate from latest successful execution;

**Acceptance**

- SELECT/JOIN/GROUP BY/HAVING/window/ranking queries work;
- zero rows is success;
- large results can be counted/streamed without silent SQL LIMIT rewrite;
- query error does not erase prior successful result identity;

**Primary verification:** Playwright sql-runtime + Node result-state tests

**Exit:** Real user-defined analytical SQL executes safely and observably.

### WP-18 — Implement anchored non-overlapping scheduler and DB-operation priority

**Milestone:** M3

**Depends on:** WP-17

**Scope**

- schedule from activation anchor rather than completion time;
- permit at most one active analytical query;
- coalesce missed ticks to one pending opportunity;
- give validated market-cycle commit priority over pending query;
- capture visible committed cycle identity at query start;

**Acceptance**

- no overlapping analytical executions;
- no burst catch-up after delay/restart;
- query never sees half a cycle;
- normal pending ingest outranks pending analytical work;

**Primary verification:** Node scheduler tests + Playwright scheduler-integration

**Exit:** Collection and SQL cadences coexist deterministically.

### WP-19 — Implement query/scheduler restart recovery

**Milestone:** M3

**Depends on:** WP-18

**Scope**

- mark stale running query executions interrupted;
- restore active query version and original schedule anchor;
- coalesce downtime ticks to at most one pending execution;
- preserve latest successful execution identity;

**Acceptance**

- restart does not burst missed ticks;
- old running execution is not guessed success/error;
- latest successful state survives restart;

**Primary verification:** Node recovery tests + Playwright restart integration

**Exit:** Analytical runtime recovers coherently across page/Worker lifecycle loss.

### WP-20 — Close analytical SQL runtime checkpoint

**Milestone:** M3

**Depends on:** WP-15..WP-19

**Scope**

- run complete SQL/scheduler/security/recovery integration suite;
- update normative specs for delivered SQL runtime behavior;
- verify no ingest regression under mixed functional load;

**Acceptance**

- Fast CI and full Browser CI green;
- AB-03 through AB-07 and relevant security contracts are covered;
- no hard-cancellation behavior is claimed unless actually proven;

**Primary verification:** Fast CI + full Browser CI

**Exit:** M3 analytical runtime is verified before Viewer/product integration.

### WP-21 — Replace runtime concatenation with deterministic Browser SQL bundling

**Milestone:** M4

**Depends on:** WP-20

**Scope**

- bundle Market Flow runtime plus pinned DuckDB main JS from repository source;
- embed exact engine asset manifest into runtime;
- generate readable runtime, compact Bookmarklet and inspection manifest;
- retain version/build identity and reproducibility;

**Acceptance**

- generated artifacts all reference the same exact engine package;
- application/business logic is not dynamically fetched at launch;
- generated outputs remain derived, never hand-edited;

**Primary verification:** Node build/artifact tests

**Exit:** Production-shaped Browser SQL artifacts can be generated deterministically.

### WP-22 — Implement Runtime Controller preflight, singleton lifecycle and Worker recovery bridge

**Milestone:** M4

**Depends on:** WP-21

**Scope**

- implement lifecycle states and capability/CSP preflight;
- start SQL Authority before Recorder/scheduler;
- reuse one healthy Runtime Controller on repeated launch;
- perform one controlled Worker recreation after unexpected loss;

**Acceptance**

- blocked Worker/Wasm/OPFS stage fails explicitly before Recorder starts;
- repeated launch creates no second authority;
- failed Worker recovery ends recovery-required rather than looping;

**Primary verification:** Node lifecycle tests + Playwright engine-bootstrap

**Exit:** Production runtime orchestration owns exactly one SQL authority.

### WP-23 — Integrate the authenticated Recorder with SQL authority persistence

**Milestone:** M4

**Depends on:** WP-22

**Scope**

- reuse proven page-context provider collection;
- replace candidate runtime persistence handoff with validated SQL handoff;
- keep provider requests/authentication in the page context;
- expose SQL durable acknowledgement as Recorder success boundary;

**Acceptance**

- provider collection still validates dynamic universe exactly;
- no credentials/session data are copied into Worker;
- Recorder never calls a SQL cycle successful before durable acknowledgement;

**Primary verification:** Node recorder contract + Playwright provider mocks

**Exit:** Candidate runtime records market cycles through SQL authority.

### WP-24 — Execute Live Gate L-2 provider compatibility

**Milestone:** M4

**Depends on:** WP-23

**Scope**

- run candidate Browser SQL runtime on authenticated Leumi;
- verify MapHeat/GetSecuritiesData collection still works from page context;
- verify complete-cycle counts/membership and SQL durable cycle result using sanitized evidence;
- verify no new authentication path or secret copying exists;

**Acceptance**

- provider integration is directly Verified on the real page;
- sanitized result records exact runtime/commit/browser;
- failure blocks cutover progression and remains explicit;

**Primary verification:** Live authenticated-Leumi verification

**Exit:** Real provider + Browser SQL integration is proven.

### WP-25 — Implement Viewer bridge, attach/re-attach and full state snapshots

**Milestone:** M4

**Depends on:** WP-22, WP-23

**Scope**

- implement same-origin Viewer bridge through Runtime Controller;
- add runtimeInstanceId/stateRevision;
- send full ViewerStateSnapshot on attach/re-attach;
- treat notifications only as hints that trigger resync;

**Acceptance**

- Viewer can reconstruct state without waiting for next notification;
- dropped notification never corrupts authority;
- Viewer never opens DuckDB/OPFS;

**Primary verification:** Node protocol tests + Playwright viewer-result-delivery

**Exit:** Viewer becomes a detachable client of one runtime authority.

### WP-26 — Implement SQL editor activation and multi-Viewer optimistic concurrency

**Milestone:** M4

**Depends on:** WP-25, WP-17

**Scope**

- keep draft state in Viewer only;
- send activateQuery with expectedActiveQueryVersionId;
- surface parse/safety/stale-editor errors without changing healthy runtime;
- propagate successful activation to all attached Viewers through resync;

**Acceptance**

- stale Viewer cannot silently overwrite newer active SQL;
- bad draft leaves previous active query unchanged;
- activation result is correlated by requestId;

**Primary verification:** Node concurrency tests + Playwright multi-Viewer

**Exit:** User SQL can be changed safely from Viewer clients.

### WP-27 — Implement query-result preview and health/diagnostic presentation

**Milestone:** M4

**Depends on:** WP-25, WP-26, WP-17

**Scope**

- render latest execution separately from latest successful execution;
- render bounded preview/truncation/full-row counts;
- show empty-success distinctly from error;
- show runtime/persistence/query/scheduler diagnostics without sensitive data;

**Acceptance**

- new query error leaves prior successful preview clearly labeled;
- truncated preview never claims completeness;
- restart does not present old in-memory preview as new-runtime data;

**Primary verification:** Node presentation model + Playwright Viewer UI

**Exit:** SQL results and runtime state are understandable without ambiguity.

### WP-28 — Move current/history market-data browsing behind SQL authority reads

**Milestone:** M4

**Depends on:** WP-25, WP-11, WP-12

**Scope**

- replace active Viewer IndexedDB reads with Runtime Controller/SQL Authority read commands;
- preserve current-table and security-history public behavior where still applicable;
- ensure Viewer never becomes direct database owner;

**Acceptance**

- current/history displays are sourced from committed SQL authority state;
- manual refresh is DB/runtime-state only and makes no provider request;
- raw/history coverage reflects the new SQL epoch honestly;

**Primary verification:** Playwright current/history Viewer integration

**Exit:** Active target Viewer no longer depends on IndexedDB market-history reads.

### WP-29 — Close runtime and Viewer integration checkpoint

**Milestone:** M4

**Depends on:** WP-21..WP-28

**Scope**

- run repeated-launch, multi-Viewer, Viewer reload, runtime restart and result-delivery scenarios;
- update normative runtime/Viewer specs;
- verify generated Browser SQL artifacts from final M4 code;

**Acceptance**

- Fast CI and full Browser CI green;
- no extra SQL authority/OPFS owner appears under repeated/multi-Viewer use;
- live-only L-2 status is accurately reflected;

**Primary verification:** Fast CI + full Browser CI

**Exit:** M4 product runtime/Viewer is verified.

### WP-30 — Implement scoped health model, incidents and Debug Bundle extension

**Milestone:** M5

**Depends on:** WP-29

**Scope**

- implement lifecycle separate from component health;
- derive overall health by recovery-required > blocked > degraded > healthy;
- implement bounded sanitized recent incidents;
- extend Debug Bundle with build/health/storage/cycle/query/scheduler/recovery summaries;

**Acceptance**

- unrelated success cannot clear a higher-severity component failure;
- pre-DB startup failures remain diagnosable from bounded Controller state;
- Debug Bundle works even before first successful market cycle;

**Primary verification:** Node health/redaction tests + Playwright failure scenarios

**Exit:** Failure state is observable without another event-log authority.

### WP-31 — Implement secret/redaction and generated-artifact security verification

**Milestone:** M5

**Depends on:** WP-30, WP-16, WP-21

**Scope**

- add allowlist-based diagnostic serialization;
- scan generated/test artifacts for forbidden secret classes;
- verify full SQL text and arbitrary query rows are absent from default Debug Bundle;
- verify no runtime contract sends provider credentials to Worker/Viewer;

**Acceptance**

- security tests fail on introduced cookie/header/token/account patterns;
- diagnostics expose only approved fields/bounded messages;
- runtime-security hardening tests pass on pinned engine;

**Primary verification:** Fast static/security tests + Playwright runtime-security

**Exit:** Security boundaries are regression-protected.

### WP-32 — Implement isolated SQL shadow path while IndexedDB remains authoritative

**Milestone:** M6

**Depends on:** WP-29, WP-31

**Scope**

- add temporary shadow database identity and validated-cycle fanout after one provider collection;
- keep IndexedDB success/viewer semantics authoritative;
- ensure SQL shadow failure cannot alter production IndexedDB state;
- add observable comparison counters without promoting shadow data;

**Acceptance**

- one provider collection feeds both persistence paths during shadow only;
- shadow DB identity cannot collide with production OPFS;
- production Viewer still reads only IndexedDB during this package;

**Primary verification:** Node authority-state tests + Playwright shadow integration

**Exit:** Candidate SQL can be exercised live without changing production authority.

### WP-33 — Run shadow comparison/endurance and close migration-verification evidence

**Milestone:** M6

**Depends on:** WP-32, WP-24

**Scope**

- compare membership/counts/raw preservation/promoted fields/current-latest and horizon behavior;
- run representative live shadow/endurance session;
- record sanitized discrepancies and resolve or explicitly block cutover;
- define exact removal list for shadow scaffolding;

**Acceptance**

- no unresolved correctness discrepancy remains;
- shadow failure never changed IndexedDB authority;
- cutover candidate evidence is stored without secret/raw authenticated dumps;

**Primary verification:** Live verification + Browser comparison suite

**Exit:** Migration shadow evidence is sufficient to proceed to benchmark/cutover gates.

### WP-34 — Implement deterministic Browser SQL benchmark harness

**Milestone:** M7

**Depends on:** WP-29, WP-31

**Scope**

- implement seeded synthetic market-data generator and payload profiles;
- run real generated runtime + DuckDB Worker/Wasm + OPFS under Chromium;
- measure ingest/CHECKPOINT/query/mixed load/memory/storage/reopen metrics;
- emit machine-readable environment/dataset/sample/pass-fail artifact;

**Acceptance**

- 1M/2M/full-session/2x-session parameter sets can be generated without hardcoded universe size;
- benchmark separates normal and stress profiles;
- results identify commit/engine/browser/OS/workload exactly;

**Primary verification:** Harness self-tests + targeted Chromium benchmark smoke

**Exit:** Repeatable decision-grade benchmark tooling exists.

### WP-35 — Execute performance/capacity gates on target Windows Chrome

**Milestone:** M7

**Depends on:** WP-33, WP-34

**Scope**

- run normal isolated and mixed-load headroom benchmarks;
- run representative full-session and 2x-session capacity/stress;
- measure storage growth, reopen and hidden/background behavior;
- classify conclusions Verified/Inferred/Unknown;

**Acceptance**

- normal p95 headroom gates from D-034 pass;
- normal coalesced ticks and query overlap are zero;
- full-session/2x-session complete without OOM/corruption/quota/backlog failure;
- target Windows/Chrome evidence is retained as the production performance proof;

**Primary verification:** Heavy benchmark + target environment evidence

**Exit:** Performance/capacity prerequisites for cutover are green.

### WP-36 — Implement explicit production cutover release and storage-authority switch

**Milestone:** M8

**Depends on:** WP-20, WP-29, WP-31, WP-33, WP-35

**Scope**

- retain an immutable identifiable IndexedDB rollback release;
- mark Browser SQL release manifest storageAuthority=duckdb-opfs;
- stop/settle legacy Recorder before authority switch;
- start with a fresh verified production OPFS authority and new SQL history epoch;
- never import legacy history or silently reuse shadow/probe DB;

**Acceptance**

- no cycle is intentionally split across authorities;
- after switch normal target performs no IndexedDB market-history writes/reads;
- SQL startup failure leaves Recorder stopped rather than falling back;

**Primary verification:** Playwright cutover scenarios + release artifact checks

**Exit:** Production authority transition is explicit and reversible only by operator release switch.

### WP-37 — Verify rollback, roll-forward and Live Gate L-3 endurance

**Milestone:** M8

**Depends on:** WP-36

**Scope**

- exercise explicit rollback to retained IndexedDB release while preserving OPFS;
- exercise fixed-runtime roll-forward reopening coherent OPFS;
- run representative real authenticated-Leumi end-to-end session;
- verify collection, SQL commits, scheduler, Viewer and refresh/reopen;

**Acceptance**

- rollback never merges SQL-period rows into IndexedDB silently;
- roll-forward resumes committed SQL history without reset;
- Live Gate L-3 records sanitized end-to-end evidence;

**Primary verification:** Browser recovery/cutover suite + live authenticated-Leumi verification

**Exit:** Operational recovery and live production-shaped behavior are proven.

### WP-38 — Remove migration scaffolding and close Browser SQL implementation

**Milestone:** M8

**Depends on:** WP-37

**Scope**

- remove shadow/probe comparison paths from active production runtime;
- remove active IndexedDB production wiring and obsolete Viewer IndexedDB reads;
- retain legacy local DB untouched unless user explicitly chooses deletion;
- run final spec/docs/cleanup audit and generated runtime publication checks;

**Acceptance**

- no final production code automatically selects/merges IndexedDB and DuckDB;
- temporary migration/test hooks are absent from production path;
- Fast CI + full Browser CI green on final code;
- STATUS points to the next real product work rather than migration cleanup;

**Primary verification:** Fast CI + full Browser CI + artifact/security guards

**Exit:** Browser SQL target is the single production architecture with no migration-cleanup debt.

## 5. Dependency spine

Critical path:

~~~text
WP-01
→ WP-02
→ WP-03 LIVE PASS
→ WP-05
→ WP-06
→ WP-07
→ WP-08
→ WP-09
→ WP-10
→ WP-11
→ WP-12
→ WP-13
→ WP-14
→ WP-15
→ WP-16
→ WP-17
→ WP-18
→ WP-19
→ WP-20
→ WP-21
→ WP-22
→ WP-23
→ WP-24 LIVE PASS
→ WP-25..WP-31
→ WP-32
→ WP-33
→ WP-34
→ WP-35
→ WP-36
→ WP-37
→ WP-38
~~~

Important parallelism:

- WP-04 can proceed after WP-01 while the live probe is prepared/executed;
- WP-25 Viewer bridge may begin after WP-22/WP-23 while WP-24 live verification is pending, but cutover work remains blocked by the live gate;
- WP-34 benchmark harness can be implemented after the integrated runtime/security checkpoint while WP-32/WP-33 shadow evidence proceeds;
- WP-35 requires both shadow/live correctness evidence and the benchmark harness.

## 6. Issue body contract for Phase Q

Every GitHub Issue created from a work package must contain:

~~~text
Why / source contracts
Scope
Explicit non-goals
Dependencies / blockers
Target repository areas
Implementation sequence
Acceptance criteria
Required tests
Fast/Browser/Live verification gate
SPEC/docs impact
Security/data-integrity checks
Temporary-artifact cleanup
Definition of done
~~~

A fresh AI should be able to execute an Issue by reading AGENTS.md, workstream HOT context, the Issue, and only the source docs explicitly linked by that Issue.

## 7. Labels proposed for Phase Q

Minimal useful label set:

~~~text
workstream:local-history-v2
browser-sql
type:implementation
type:test
type:live-verification
type:benchmark
type:migration
type:cutover
gate:blocking
needs:browser-ci
needs:live-leumi
cleanup-required
~~~

Phase Q should reuse existing equivalent labels rather than create duplicates.

## 8. Milestone completion rule

A milestone closes only when:

- every package/Issue in it is complete;
- required tests have run in their native layer;
- numbered implementation checkpoint requirements have Fast CI + full Browser CI where required;
- required live gates are directly Verified, not inferred;
- STATUS.json points to the next package/milestone;
- temporary artifacts introduced by the milestone are either removed or explicitly owned by a later cleanup package.

## 9. Planning-to-execution boundary

Phase P ends with this decomposition only.

Phase Q must create the real management layer in GitHub:

~~~text
milestones where useful
+ labels
+ 38 executable Issues
+ dependency/blocker references
+ parent/epic/checklist structure where the available GitHub API supports it
+ navigation from planning docs to the execution structure
~~~

Markdown alone is not the final planning deliverable.

## 10. Phase P completion result

~~~text
Phases A–O
→ 8 implementation milestones
→ 40 executable work packages
→ explicit hard gates
→ test/verification owner per package
→ live Leumi feasibility before heavy implementation
→ explicit shadow/cutover cleanup
→ issue-body contract ready for Phase Q
~~~

## GitHub execution structure

Phase Q materialized this decomposition into real GitHub Issues.

~~~text
Master: #20
Epics:  #21..#28
WP-01..WP-38: #29..#67
~~~

Canonical mapping and the one closed duplicate exception are documented in:

~~~text
docs/browser-sql-github-execution-structure.md
~~~

Issue state and STATUS.json now drive execution; this planning document remains the durable decomposition contract.

## Post-audit assurance additions

The Phase-R red-team review found a previously deferred storage-lifecycle decision. The implementation graph therefore gains:

### WP-39 — Implement explicit storage lifecycle, archive export and database rollover

**Milestone:** M8

**Depends on:** WP-35

**Scope**

- add database_epoch_id to production schema/runtime metadata;
- expose benchmark-derived storage-pressure warning without automatic deletion;
- implement maintenance-mode archive export with bounded memory;
- implement explicit fresh-epoch rollover with a non-secret crash-recovery journal;
- preserve active SQL/interval/runtime configuration into the fresh epoch;
- delete only exact Market-Flow-owned OPFS entries;
- prove rollover/reopen and storage usage behavior in Chromium;

**Acceptance**

- retain-all is the default and no storage warning silently deletes history;
- archive generation failure leaves the old production DB authoritative;
- rollover cannot start with active cycle/query work;
- proceeding without archive requires explicit irreversible confirmation;
- successful rollover creates a new database_epoch_id and no old market history is visible in the new live DB;
- old query-result state is not presented as current after rollover;
- Market Flow never clears the complete Leumi-origin OPFS;
- interrupted rollover is recoverable before Recorder readiness;

**Primary verification:** Node lifecycle/state tests + Playwright OPFS/archive/rollover integration + Phase-M storage benchmark evidence

**Exit:** storage growth has an explicit safe lifecycle; cutover no longer depends on an unresolved retention/export policy.

### Dependency update

WP-36 production cutover additionally depends on WP-39.
### WP-40 — Implement analytical resource isolation, cancellation and ingest preemption

**Milestone:** M3

**Depends on:** WP-16, WP-17, WP-18

**Scope**

- create a dedicated disposable analytics connection separate from trusted ingest/admin connection;
- execute user SQL through bounded pending/streamed query slices;
- prove and use pinned-build pending-query cancellation;
- abort active result streaming by bounded stop-fetch + analytics-connection recycle;
- preempt analytics immediately when a complete validated cycle waits;
- implement benchmark-configured hard query runtime/preemption budgets;
- suspend query version on runtime-budget cancellation;
- keep ingest-priority cancellation enabled for later anchored opportunities;
- implement truthful incomplete row-count metadata and bounded preview/backpressure;
- escalate failed cancellation to controlled Worker reopen/recovery;
- suppress new provider collection while one complete cycle waits for SQL persistence;

**Acceptance**

- pending execution can be cancelled in the exact pinned build and the connection remains usable;
- active stream can be abandoned/recycled safely without corrupting DB authority;
- waiting validated cycle preempts analytics and commits before later analytical work;
- only one result fetch is in flight;
- runtime-budget cancellation suspends active query version;
- cancelled execution never overwrites latest successful result and incomplete row counts are labeled incomplete;
- failed cooperative cancellation triggers controlled Worker recovery and never early-acknowledges ingest;
- no unbounded complete-cycle queue can form behind analytics;

**Primary verification:** Node state/scheduler tests + Playwright real DuckDB-Wasm cancellation/stream/recovery integration + later WP-35 resource benchmarks

**Exit:** arbitrary analytical SQL is resource-isolated so already-running analytics cannot indefinitely starve authoritative market persistence.

### Phase T dependency update

WP-20 analytical-runtime checkpoint additionally depends on WP-40.