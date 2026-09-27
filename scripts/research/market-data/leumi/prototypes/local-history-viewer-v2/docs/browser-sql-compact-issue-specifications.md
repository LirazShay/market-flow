# Browser SQL V2 — Compact Executable Issue Specifications

## Role

This document preserves the corrected design/specification source for C01..C12 after the compact-Issue critique.

The executable Issues are materialized as:

~~~text
Master #85
C01..C12 = #73..#84
~~~

GitHub Issue bodies own executable work. This file remains the durable specification/reference used for consistency checks.

Canonical dependency source:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

---

# Shared rules for C01..C12

Every executable Issue must follow these rules:

- GitHub main is source of truth;
- before implementation, read the current versions of directly touched code/tests/specs;
- do not preload historical Browser SQL planning documents unless a linked uncertainty requires them;
- preserve the V1 provider/data contract unless the Issue explicitly changes it;
- no hardcoded universe size;
- canonical SecurityId = String(PaperId or Key);
- preserve full raw MapHeat and Security facts;
- preserve null != 0 != empty string != missing;
- no partial/corrupt cycle may advance authoritative SQL state;
- public/observable behavior tests over private implementation details;
- Node for pure deterministic logic;
- Chromium for browser/Worker/Wasm/OPFS/Web Lock/Viewer/Scanner behavior;
- live Leumi only for real-origin/provider facts;
- no credentials/session/account data in repo/evidence;
- update STATUS.json with real verification state;
- do not add future/conditional machinery without the named evidence trigger;
- temporary probes are removed unless they protect a durable regression.

---

# Feasibility + SQL Core

## C01 — Prove pinned DuckDB-Wasm on authenticated Leumi

### Purpose

Close the early live premise: the already pinned Browser SQL runtime must actually work on the authenticated Leumi origin.

### Direct dependencies

- completed Issue #29 — engine pin/manifest evidence;
- completed Issue #30 — deterministic synthetic Browser SQL probe evidence.

### Scope

- reuse/adapt the existing minimal live probe;
- prove injected JS can create the required Blob Worker;
- load the exact pinned DuckDB Worker/Wasm assets;
- open a probe-only OPFS database;
- execute synthetic SQL write + COMMIT;
- close/reopen Worker/runtime and read the marker;
- clean only probe-owned storage;
- emit sanitized machine-readable PASS/FAIL with failed stage and candidate identity.

The current probe may execute CHECKPOINT as part of its existing tested sequence. That does **not** define production CHECKPOINT cadence or production durable-success semantics; C03 owns that decision.

### Non-goals

- no provider calls;
- no production DB/schema;
- no Web Lock proof;
- no Recorder/Viewer/Scanner work;
- no production persistence cadence.

### Acceptance

- exact pinned runtime works on authenticated Leumi origin;
- probe data survives the supported close/reopen boundary;
- cleanup is limited to probe-owned data;
- failure is classified automatically and safely;
- evidence contains no auth/session/account material.

### Verification

- existing Fast CI/build/probe guards remain green;
- existing deterministic Chromium probe remains green if touched;
- authenticated L-1 self-verifier PASS for the candidate.

### Cleanup

- keep only reusable minimal probe/regression assets;
- remove temporary diagnostics created solely for the live investigation.

---

## C02 — Build the minimum SQL runtime and schema

### Purpose

Create one production-shaped DuckDB-Wasm/OPFS authority with the smallest schema/startup contract required by later cycle persistence.

### Direct dependency

- C01.

### Scope

- one Runtime Controller owns one SQL Worker;
- deterministic generated runtime/build identity using pinned assets;
- one production DB identity;
- simple schema/storage-format compatibility metadata; runtime/build identity remains diagnostic/traceability metadata and does not itself make an existing DB incompatible;
- minimal tables/structures for cycle identity, current universe, raw MapHeat, raw Security history and stable snapshot/cycle ordering;
- latest/current lookup structure only where needed by trusted reads;
- startup/open/readiness states required for normal use;
- unsupported schema/storage-format compatibility blocks writable startup; an ordinary runtime build change does not block startup unless it intentionally changes the declared storage compatibility contract;
- no silent delete/recreate/reset;
- minimal storage/runtime error reporting.

### Non-goals

- no normal provider collection;
- no complete-cycle persistence flow yet;
- no analytical horizons/derived metrics;
- no Scanner state;
- no migration/upgrade framework;
- no archive/rollover.

### Acceptance

- runtime opens the intended OPFS DB through one Worker authority;
- schema represents minimum raw/current/history needs without fixed enrichment columns;
- runtime identity and schema/storage compatibility are explicit and separate;
- unsupported DB is preserved and writable startup fails visibly;
- repeated startup does not silently recreate/reset the DB.

### Verification

- Node tests only for pure manifest identity and schema/storage compatibility logic;
- Chromium tests for Worker/Wasm/OPFS open/reopen and incompatible-schema blocking;
- Fast CI;
- full Browser CI because shared runtime/storage surfaces change.

### Cleanup

- no temporary alternate DB identities or experimental schema paths remain;
- generated assets/manifests stay deterministic.

---

## C03 — Implement atomic complete-cycle persistence and reopen durability

### Purpose

Persist one already-validated complete market cycle atomically and prove successful state survives the supported reopen/restart boundary.

### Direct dependency

- C02.

### Scope

- one bulk validated-cycle handoff into SQL;
- defensive shape/completeness assertions at the authority seam where valuable;
- atomically update raw/current/history/latest state for the cycle;
- preserve dynamic-universe additions/removals;
- preserve raw MapHeat/Security facts and exact value distinctions;
- failure before commit leaves the prior committed state unchanged;
- define and prove the minimum safe durable-success acknowledgement boundary;
- add retry/idempotency state only if that boundary creates committed-but-unacknowledged retry ambiguity;
- explicit storage/write/durability failures;
- reopen the same DB and verify committed facts.

### Non-goals

- no authenticated Recorder wiring;
- no Viewer UI;
- no persisted enrichment;
- no archive/rollover;
- no generic checkpoint/recovery framework beyond what the proven durability contract needs.

### Acceptance

- one complete cycle appears atomically or not at all;
- failed/partial/corrupt input cannot create a successful authoritative cycle;
- current/history/latest remain mutually coherent;
- raw facts and null/zero/empty/missing distinctions survive round-trip;
- reopen returns the same committed state;
- if the selected durable-success boundary admits committed-but-unacknowledged retry ambiguity, the chosen minimal retry/idempotency mechanism proves replay safety;
- if no such ambiguity exists, no retry-token/idempotency subsystem is required;
- failed persistence is never acknowledged as success.

### Verification

- Node tests for deterministic validation/normalization pieces;
- Chromium tests for real DuckDB transaction failure and reopen;
- fault injection around pre-commit and the selected durability boundary;
- replay/idempotency tests only if that mechanism is actually selected;
- Fast CI + full Browser CI.

### Cleanup

- remove temporary fault hooks unless retained as test-only adapters;
- document only the durability mechanism actually selected/proven.

---

## C04 — Integrate the Recorder and expose trusted SQL reads

### Purpose

Connect the proven V1 collection path to the SQL authority and provide the small semantic read API used by the Viewer.

### Direct dependency

- C03.

### Scope

- preserve MapHeat2 dynamic universe;
- preserve sequential GetSecuritiesData chunks;
- preserve exact requested/received/unique/duplicate/missing/unexpected validation;
- normal Recorder hands exactly one validated complete cycle to SQL;
- Recorder success follows C03's durable-success boundary;
- implement trusted reads for:
  - current universe;
  - current security;
  - bounded security history page;
  - readiness/health;
- committed-only visibility;
- deterministic stable history ordering/cursor including equal timestamps;
- distinguish unknown security from known-but-not-current where product behavior needs it;
- commit notification remains a hint; clients reread authority.

### Non-goals

- no Current/Detail rendering/parity yet;
- no Scanner;
- no analytical optimization;
- no new provider API design.

### Acceptance

- provider acquisition behavior remains V1-compatible;
- only validated complete cycles reach SQL;
- trusted reads expose semantic data rather than physical table details;
- history continuation has no duplicate/skip under equal timestamps;
- no direct Viewer DuckDB ownership is introduced.

### Verification

- reuse/add public collector characterization tests only where coverage is missing;
- Chromium integration for Recorder→SQL and trusted read contracts;
- dropped-notification/reread test at the bridge boundary;
- Fast CI + full Browser CI.

### Cleanup

- remove temporary direct-table Viewer/debug paths;
- keep the trusted API intentionally small.

---

# V1 Product on SQL

## C05 — Move Current Universe to trusted SQL reads

### Purpose

Make the Current Universe surface work from SQL while preserving intentional V1 public behavior.

### Direct dependency

- C04.

### Scope

- Current Universe reads SQL through the trusted API;
- current membership follows the latest committed validated universe;
- preserve intended values, default/user sorting and missing/zero rendering;
- open-after-existing-data and reload reread authoritative SQL state;
- missed notifications do not make cached Viewer state authoritative;
- Current remains independent of Scanner state/errors;
- row selection/navigation emits the canonical SecurityId needed by Detail.

### Non-goals

- no Detail/History implementation;
- no L-2 live provider proof;
- no Scanner;
- no analytical enrichment UI.

### Acceptance

- Current membership/values/sort/rendering match intended V1 public behavior on deterministic scenarios;
- a committed cycle refreshes Current from authoritative SQL;
- reload/open-after-existing-data reconstructs Current from SQL;
- missing notification is recovered by authoritative reread;
- Scanner absence/error cannot change Current semantics.

### Verification

- Chromium Current parity tests using deterministic provider/SQL fixtures;
- reuse existing Current public-behavior tests where possible;
- Fast CI + full Browser CI.

### Cleanup

- remove temporary IndexedDB/direct-table Current paths once the SQL-backed path is authoritative in V2;
- keep no duplicate Current data authority.

---

## C06 — Move Detail/History to SQL and run bounded L-2

### Purpose

Make Security Detail/History work from SQL, close the V1 browsing-product migration, and prove the real provider→SQL→read path once.

### Direct dependency

- C04.

### Scope

- Detail/History reads SQL through the trusted API;
- newest-first bounded history paging;
- equal-timestamp-safe continuation with no duplicate/skip;
- detail remains meaningful for known history when the security is no longer current;
- reload/open-after-existing-data/missed-notification rereads authority;
- integrated Current→Detail navigation check once C05 exists;
- deterministic Detail/history/Viewer-lifecycle parity scenarios;
- bounded self-verifying L-2 using real provider data through the normal Recorder→SQL→trusted-read path.

### Non-goals

- no Current implementation itself;
- no Scanner;
- no persisted horizon schema;
- no general benchmark framework;
- no shadow unless one material ambiguity explicitly triggers it.

### Acceptance

- Detail current summary/history/paging match intended V1 public behavior;
- equal-timestamp paging has no duplicate/skip;
- historical Detail remains available for a security no longer current;
- reload/missed notification recovers by authoritative reread;
- when C05 is available, Current→Detail navigation works using canonical SecurityId;
- L-2 reports exact provider accounting, successful SQL persistence/readback and no auth/session leakage;
- no material V1-on-SQL parity Unknown remains after C05 and C06 are both complete.

### Verification

- deterministic Chromium Detail/history/lifecycle parity tests;
- full Browser CI;
- bounded authenticated L-2 PASS;
- conditional shadow only if the documented trigger is met.

### Cleanup

- remove temporary parity/shadow scaffolding not promoted to a durable regression;
- keep compact reusable fixtures/oracles only.

---

# Analytics + Scanner

## C07 — Prove the real analytical SQL on day-sized history

### Purpose

Use the actual SQL queries the product needs before deciding that persisted analytical optimization is necessary.

### Direct dependencies

- C05;
- C06.

### Scope

- define a small representative query set from real product needs;
- include useful short-horizon/history/cross-security/filter/group/ranking patterns as required;
- run against representative day-sized deterministic history;
- measure practical query latency/correctness;
- identify source fields whose typed promotion is truly useful;
- document one explicit conclusion:
  - dynamic SQL is sufficient; or
  - activate one narrowly scoped optimization task.

### Non-goals

- no fixed eight-horizon physical schema;
- no generic benchmark platform;
- no DealsDelta until provider semantics are verified;
- no preemptive backfill/migration framework;
- no UI enrichment requirement.

### Acceptance

- representative analytical questions are expressible correctly from current SQL history;
- day-sized behavior is measured rather than guessed;
- every proposed persisted optimization has a concrete measured/query reason;
- no optimization is selected by default.

### Verification

- deterministic query correctness tests;
- focused Chromium/DuckDB measurement where browser runtime matters;
- Fast CI;
- Browser CI only for changed browser/SQL integration surfaces.

### Cleanup

- remove one-off measurement scaffolding unless reused by C11;
- if no optimization is needed, explicitly record that outcome and stop.

---

## C08 — Implement the simple safe Scanner core

### Purpose

Provide one active read-only SQL statement running at a configurable repeat interval without overlapping or mutating market authority.

### Direct dependencies

- C05;
- C06.

### Scope

- draft SQL + draft interval;
- explicit Activate;
- one active SQL + interval persisted;
- validate positive finite interval without silent clamping;
- parser/engine-backed read-only enforcement on pinned DuckDB-Wasm;
- allow representative SELECT/CTE/JOIN/GROUP BY/HAVING/window/order/limit queries;
- block mutation/admin/external-access/multi-statement paths;
- committed-state reads only;
- run promptly after activation according to the selected simple policy;
- one execution at a time;
- if already running, skip/coalesce the timer opportunity; no burst replay;
- when B is activated while A runs, A may finish but is never attributed to B;
- zero rows is success;
- query error is isolated from Recorder and market data;
- runtime restart loads active config and executes fresh.

### Non-goals

- no immutable query version history;
- no multi-user collaboration/OCC;
- no mandatory streaming;
- no advanced cancellation/preemption;
- no rich grid/editor UX.

### Acceptance

- safe read-only SQL works for the intended analytical language subset;
- unsafe SQL cannot mutate authority or access forbidden external/admin capabilities;
- no Scanner overlap occurs;
- interval changes require Activate;
- query results remain attributable to the config that produced them;
- query errors never corrupt or stop successful Recorder persistence;
- restart behavior is deterministic and simple.

### Verification

- Node tests for pure interval/config/state logic where useful;
- Chromium with real pinned DuckDB-Wasm for safety corpus, timer/no-overlap, restart and execution attribution;
- Fast CI + full Browser CI.

### Cleanup

- remove parser/cancellation experiments not selected;
- keep only durable safety regressions.

---

## C09 — Build Scanner UI, truthful result grid and product integration

### Purpose

Expose C08 as the third user-facing surface without adding hidden analytical semantics.

### Direct dependency

- C08.

### Scope

- SQL editor;
- interval control;
- Activate action;
- draft vs active/status visibility;
- dynamic result columns in SQL order;
- row order exactly as SQL returns it;
- truthful rendering of NULL, boolean, integer/float/decimal, BigInt-safe values, text, date/time/timestamp and JSON/raw text used by real queries;
- zero-row successful table;
- clear query error distinct from empty result;
- if only first N rows are rendered, say so clearly without silently rewriting SQL;
- previous successful result may remain visibly previous/stale after a later error within one runtime;
- optional canonical SecurityId drill-down to shared Detail;
- Scanner isolation from Recorder/Current/Detail.

### Non-goals

- no generic enterprise data grid;
- no result export platform;
- no mandatory streaming;
- no query-history browser.

### Acceptance

- grid schema/order comes from SQL result only;
- values are not silently coerced into misleading forms;
- no hidden sort/filter/rank/LIMIT is added;
- errors and zero-row success are distinguishable;
- Scanner can fail/disable without breaking Current/Detail or Recorder;
- drill-down, if implemented, rereads Detail authority by SecurityId.

### Verification

- Chromium UI/result/type tests;
- practical representative result-size test;
- Scanner isolation/navigation regressions;
- Fast CI + full Browser CI.

### Cleanup

- remove temporary result-delivery experiments if simple materialization is sufficient;
- create streaming work only if evidence triggers O3.

---

# Daily Readiness + Cutover

## C10 — Enforce one production runtime owner with Web Locks

### Purpose

Prevent two independent same-origin tabs from opening competing production SQL/Recorder owners.

### Direct dependency

- C02.

### Scope

- one stable exclusive Web Lock name;
- same-tab repeated launch reuses local singleton;
- lock holder may start production Worker/DB/Recorder;
- loser/passive tab starts no production DB or provider collection;
- owner holds lock for runtime lifetime;
- owner close/release allows a later explicit owner to acquire;
- new owner runs normal readiness/reopen before recording;
- no steal:true;
- no heartbeat/localStorage/IndexedDB election fallback;
- BroadcastChannel may be notification/presence hint only.

### Non-goals

- no distributed lease protocol;
- no automatic takeover while owner is alive;
- no early authenticated-origin proof; final real-origin ownership belongs to C12.

### Acceptance

- racing Chromium pages yield exactly one active production owner;
- passive tab performs no provider collection and opens no production DB;
- owner close permits later acquisition without silent reset;
- hidden/background owner is not displaced by timeout;
- absence/failure of Web Locks blocks production ownership rather than falling back to weaker authority.

### Verification

- Chromium multi-page Web Lock/runtime tests;
- runtime reopen/readiness after ownership transfer;
- Fast CI + full Browser CI.

### Cleanup

- remove any temporary alternate election mechanism;
- keep ownership diagnostics sanitized and minimal.

---

## C11 — Prove representative daily mixed workload

### Purpose

Verify the actual selected product shape can run like a normal daily local tool before production cutover.

### Direct dependencies

- C07;
- C09;
- C10;
- any activated conditional mechanism that changes the release candidate.

### Scope

- deterministic day-shaped market history/workload;
- representative collection cadence and changing universe shape;
- continuous SQL persistence;
- Current/Detail reads;
- representative active Scanner query/interval;
- selected analytical optimization, if any;
- one-owner runtime behavior;
- record workload parameters and measured latency/memory/storage facts needed for future regression comparison;
- verify explicit errors rather than corruption/silent loss.

### Conditional decisions owned here

C11 may activate, only on evidence:
- O2 advanced Scanner resource hardening;
- O4 storage/export/fresh-DB workflow;
- O5 target Windows/Chrome evidence.

If any activated mechanism changes the candidate, rerun affected C11 workload verification before closure.

### Non-goals

- no arbitrary 25%/50% thresholds;
- no mandatory 2x-session ceremony;
- no generic benchmark framework;
- no archive/rollover platform by default.

### Acceptance

- workload parameters are recorded and represent intended normal daily operation;
- every injected provider cycle reaches a terminal state: committed or explicitly failed;
- persistence queue/backlog shows no sustained monotonic growth during the steady-state portion;
- Scanner executions never overlap;
- representative Scanner executions repeatedly complete;
- Current and Detail reads continue to complete during mixed load;
- browser/runtime does not crash or hit OOM;
- storage growth is measured and no quota/storage failure occurs for the required workload;
- accumulated DB closes/reopens and expected committed state is readable;
- measured latency/memory/storage observations are recorded for future regression comparison;
- no data-integrity failure occurs;
- every triggered conditional is resolved/reverified or explicitly blocks completion.

If a concrete responsiveness threshold is required for release, define it before the deciding run from real product use/baseline evidence; do not invent it after seeing the result.

### Verification

- deterministic Chromium integrated workload;
- repeatable workload parameters/results;
- Fast CI;
- full Browser CI;
- optional target-Windows run only if evidence requires it.

### Cleanup

- remove temporary benchmark/profiling scaffolding not retained for regression;
- keep only the minimal repeatable daily-workload assets that protect the product.

---

## C12 — Run final live verification and perform explicit SQL cutover

### Purpose

Verify the final candidate in the authenticated Leumi environment, switch authority explicitly, retain a simple rollback path and leave the repository ready for normal V2 use.

### Direct dependency

- C11.

### Preconditions

- current candidate Fast CI green;
- full Browser CI green;
- C11 green on final candidate;
- L-1 and L-2 evidence valid for the compatible candidate;
- no unresolved material data-integrity/security issue.

### Scope

- bounded self-verifying final authenticated run;
- prove real provider cycles continue through SQL persistence;
- Current/Detail healthy from SQL;
- Scanner healthy if enabled;
- real-origin two-tab exclusive ownership proof;
- sanitized machine evidence;
- stop old IndexedDB Recorder at an explicit settled boundary;
- preserve legacy IndexedDB data;
- open/start fresh production SQL history;
- verify first production SQL cycles and trusted reads;
- keep previous working release available;
- document/verify simple rollback procedure: stop SQL release, preserve SQL DB, run prior release;
- remove temporary migration/live-probe scaffolding that has no continuing purpose;
- update durable docs/STATUS only after required verification is green.

### Non-goals

- no IndexedDB history import;
- no automatic fallback;
- no dual-write synchronization;
- no side-by-side upgrade framework;
- no automatic archive/rollover.

### Acceptance

- final authenticated run produces PASS with no secret leakage;
- one real-origin runtime owner is proven;
- SQL becomes the only new market-history authority after the explicit switch;
- first production SQL cycles and Viewer reads succeed;
- rollback instructions use the retained old release and do not mutate/sync legacy history;
- temporary migration/probe artifacts have explicit keep/remove disposition;
- final repository has one unambiguous current execution/status truth.

### Verification

- Fast CI;
- full Browser CI;
- C11 final workload evidence;
- final authenticated self-verifying run;
- explicit first-production-cycle/readback checks;
- final security/static guards and docs consistency checks.

### Cleanup

- remove obsolete migration scaffolding and stale current-plan references;
- preserve historical evidence under cold/history ownership;
- do not silently delete legacy local data.

---

# Conditional Issue creation contract

Conditional Issues are created only when triggered by evidence from their owner:

~~~text
O1 analytical optimization    ← C07
O2 Scanner resource hardening ← C11
O3 streaming/chunking         ← C09 or C11
O4 storage/export/fresh DB    ← C11
O5 target Windows evidence    ← C11
O6 shadow comparison          ← C06
~~~

A conditional Issue body must state:
- exact triggering evidence;
- exact problem to solve;
- smallest candidate mechanism;
- affected tests/evidence to rerun;
- rejoin point;
- cleanup/disposition.

Do not create placeholder conditional Issues.

---

# Compact Master

The compact Master is materialized as **#85**. There are no navigation-only parent/Epic Issues.

The Master should explain only:

~~~text
same V1 provider contract
→ SQL authority
→ preserve Current + Detail/History
→ add simple Dynamic SQL Scanner
→ prove normal daily use
→ explicit cutover
~~~

Group C01..C12 inside the Master under four headings:

~~~text
Feasibility + SQL Core
V1 Product on SQL
Analytics + Scanner
Daily Readiness + Cutover
~~~

The Master should:
- point to STATUS.json for live progress;
- identify #29/#30 as reused completed evidence;
- link C01..C12;
- state only direct dependencies;
- state that conditional O1..O6 work is created only on evidence triggers.

It should not reproduce every child acceptance criterion and should not duplicate live status.

---

# Draft-spec completion test

These corrected drafts are ready for materialization review only if:

- every C01..C12 has one clear product/engineering purpose;
- every dependency is direct and matches browser-sql-compact-execution-dag.md;
- Current and Detail/History are separate parallel product boundaries;
- acceptance criteria are observable and avoid arbitrary implementation/performance lock-in;
- C01 does not freeze production CHECKPOINT cadence;
- C03 idempotency remains conditional;
- C11 workload acceptance is measurable without arbitrary after-the-fact thresholds;
- test layer matches the behavior being proven;
- no Issue requires future/conditional machinery by default;
- no Issue exists solely to run a checkpoint;
- no live/manual step remains where Chromium/Node can assert the behavior;
- C01 safely owns the pending L-1 transfer from old #31 during later materialization;
- C12 owns final cutover/rollback/cleanup without becoming a generalized release platform;
- no navigation-only parent Issues are required.

Materialization is complete; use the current GitHub execution map and STATUS pointer for implementation.