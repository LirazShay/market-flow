# Browser SQL V2 — Compact Executable Issue Specifications

## Role

This document turns C01..C11 from the compact DAG into draft executable Issue specifications.

It is the direct input to the next review step: issue-size/dependency critique.

It is still planning-only:
- no successor GitHub Issues created yet;
- no old #20..#71 Issues retired yet;
- no product/runtime implementation.

Canonical dependency source:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

Each draft intentionally contains only what a fresh implementation chat needs.

---

# Shared rules for C01..C11

Every executable Issue must follow these rules:

- GitHub main is source of truth;
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

# P1 — Feasibility + SQL Core

## C01 — Prove pinned DuckDB-Wasm on authenticated Leumi

### Purpose

Close the only early live premise: the already pinned Browser SQL runtime must actually work on the authenticated Leumi origin.

### Direct dependencies

- completed Issue #29 — engine pin/manifest evidence;
- completed Issue #30 — deterministic synthetic Browser SQL probe evidence.

### Scope

- reuse/adapt the existing minimal live probe;
- prove injected JS can create the required Blob Worker;
- load the exact pinned DuckDB Worker/Wasm assets;
- open a probe-only OPFS database;
- execute synthetic create/write/commit;
- exercise the minimum reopen/durability action required by the selected design;
- tear down and reopen the Worker/runtime;
- verify the marker after reopen;
- clean only probe-owned storage;
- emit sanitized machine-readable PASS/FAIL with failed stage and candidate identity.

### Non-goals

- no provider calls;
- no production DB/schema;
- no Web Lock proof;
- no Recorder/Viewer/Scanner work;
- no manual visual acceptance.

### Acceptance

- exact pinned runtime works on authenticated Leumi origin;
- probe data survives the supported reopen boundary;
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

Create one production-shaped DuckDB-Wasm/OPFS authority with the smallest schema and startup contract required by later cycle persistence.

### Direct dependency

- C01.

### Scope

- one Runtime Controller owns one SQL Worker;
- deterministic generated runtime/build identity using the pinned assets;
- one production DB identity;
- simple schema/build compatibility metadata;
- minimal tables/structures for cycle identity, current universe, raw MapHeat, raw Security history and stable snapshot/cycle ordering;
- latest/current lookup structure only where needed by the trusted read contract;
- startup/open/readiness states required for normal use;
- unsupported schema/build compatibility blocks writable startup;
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
- runtime identity and schema compatibility are explicit;
- unsupported DB is preserved and startup fails visibly;
- repeated startup does not silently recreate/reset the DB.

### Verification

- Node tests only for pure manifest/schema compatibility logic;
- Chromium tests for Worker/Wasm/OPFS open/reopen and incompatible-schema blocking;
- Fast CI;
- full Browser CI because shared runtime/storage surfaces change.

### Cleanup

- no temporary alternate DB identities or experimental schema paths remain;
- generated assets/manifests stay deterministic.

---

## C03 — Implement atomic complete-cycle persistence and reopen durability

### Purpose

Persist one already-validated complete market cycle atomically and prove the successful state survives the supported reopen/restart boundary.

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
- add retry/idempotency state only if the proven acknowledgement boundary requires it;
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
- duplicate replay does not create contradictory state under the selected retry contract;
- failed persistence is never acknowledged as success.

### Verification

- Node tests for deterministic validation/normalization pieces;
- Chromium tests for real DuckDB transaction failure, reopen and retry seams;
- fault injection around pre-commit and selected durability boundary;
- Fast CI + full Browser CI.

### Cleanup

- remove temporary fault hooks unless retained as test-only adapters;
- document only the durability mechanism actually selected/proven.

---

# P2 — V1 Product on SQL

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

- remove any temporary direct-table Viewer/debug path;
- keep trusted API intentionally small.

---

## C05 — Deliver Current Universe + Detail/History parity and bounded live L-2

### Purpose

Make the existing V1 browsing product usable from SQL before building analytical product features.

### Direct dependency

- C04.

### Scope

- Current Universe reads SQL through trusted API;
- preserve intended membership, values, sorting and missing/zero rendering behavior;
- Security Detail/History reads SQL through trusted API;
- newest-first bounded history paging;
- equal-timestamp-safe continuation with no duplicate/skip;
- Current→Detail navigation and practical Back/state behavior;
- detail remains meaningful for a security no longer in current universe;
- reload/open-after-existing-data/missed-notification causes authoritative reread;
- compact V1 parity scenario families:
  - changing universe;
  - source-value truthfulness;
  - invalid/partial cycles;
  - persistence/reopen;
  - Current/Detail/history;
  - Viewer lifecycle;
- bounded self-verifying L-2 using real provider data through the normal Recorder→SQL→trusted-read path.

### Non-goals

- no Scanner;
- no persisted horizon schema;
- no general benchmark framework;
- no shadow unless one material ambiguity explicitly triggers it.

### Acceptance

- Current and Detail/History match the intentional V1 public behavior on deterministic scenarios;
- no material parity Unknown remains;
- real provider L-2 reports complete accounting and successful SQL readback;
- Viewer remains a client and never becomes DB authority;
- evidence remains sanitized.

### Verification

- deterministic Node/Chromium parity tests by the six scenario families;
- full Browser CI;
- bounded authenticated L-2 PASS;
- conditional shadow only if the documented trigger is met.

### Cleanup

- remove temporary parity/shadow scaffolding not promoted to a durable regression;
- keep one compact parity fixture/oracle set.

---

# P3 — Analytics + Scanner

## C06 — Prove the real analytical SQL on day-sized history

### Purpose

Use the actual SQL queries the product needs before deciding that persisted analytical optimization is necessary.

### Direct dependency

- C05.

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

- the representative analytical questions are expressible correctly from current SQL history;
- day-sized behavior is measured rather than guessed;
- every proposed persisted optimization has a concrete measured/query reason;
- no optimization is selected by default.

### Verification

- deterministic query correctness tests;
- focused Chromium/DuckDB timing measurement where browser runtime matters;
- Fast CI;
- Browser CI only for changed browser/SQL integration surfaces.

### Cleanup

- remove one-off benchmark scaffolding unless reused by C10;
- if no optimization is needed, explicitly record that outcome and stop.

---

## C07 — Implement the simple safe Scanner core

### Purpose

Provide one active read-only SQL statement running at a configurable repeat interval without overlapping or mutating market authority.

### Direct dependency

- C05.

### Scope

- draft SQL + draft interval;
- explicit Activate;
- one active SQL + interval persisted;
- validate positive finite interval without silent clamping;
- parser/engine-backed read-only enforcement on pinned DuckDB-Wasm;
- allow representative SELECT/CTE/JOIN/GROUP BY/HAVING/window/order/limit queries;
- block mutation/admin/external-access/multi-statement paths;
- committed-state reads only;
- run promptly after activation according to selected simple policy;
- one execution at a time;
- if already running, skip/coalesce timer opportunity; no burst replay;
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
- query errors never corrupt or stop successful Recorder persistence;
- restart behavior is deterministic and simple.

### Verification

- Node tests for pure interval/config/state logic where useful;
- Chromium with real pinned DuckDB-Wasm for safety corpus, timer/no-overlap, restart and execution attribution;
- Fast CI + full Browser CI because Scanner/runtime integration is browser-dependent.

### Cleanup

- remove parser/cancellation experiments not selected;
- keep only durable safety regressions.

---

## C08 — Build Scanner UI, truthful result grid and product integration

### Purpose

Expose C07 as the third user-facing surface without adding hidden analytical semantics.

### Direct dependency

- C07.

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
- previous successful result may remain visibly previous/stale after later error in same runtime;
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
- streaming task is created only if evidence triggers it.

---

# P4 — Daily Readiness + Cutover

## C09 — Enforce one production runtime owner with Web Locks

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
- no early authenticated-origin proof; final real-origin ownership belongs to C11.

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

## C10 — Prove representative daily mixed workload

### Purpose

Verify the actual selected product shape can run like a normal daily local tool before any production cutover.

### Direct dependencies

- C05;
- C06;
- C08;
- C09;
- any activated conditional mechanism that changes the release candidate.

### Scope

- deterministic day-shaped market history/workload;
- realistic collection cadence and changing universe shape;
- continuous SQL persistence;
- Current/Detail reads;
- representative active Scanner query/interval;
- selected analytical optimization, if any;
- one-owner runtime behavior;
- measure backlog, query durations, responsiveness, memory trend, storage growth and reopen behavior as needed to answer release questions;
- verify no corruption, silent loss or Scanner overlap.

### Conditional decisions owned here

C10 may activate, only on evidence:
- advanced Scanner resource hardening;
- storage/export/fresh-DB workflow;
- target Windows/Chrome evidence.

If any activated mechanism changes the candidate, rerun the affected C10 workload before closure.

### Non-goals

- no arbitrary 25%/50% thresholds;
- no mandatory 2x-session ceremony;
- no generic benchmark framework;
- no archive/rollover platform by default.

### Acceptance

- persistence backlog does not grow without bound;
- Scanner does not overlap;
- Current/Detail/Scanner remain practically usable;
- memory/storage behavior is understood and stable enough for the required daily use;
- accumulated DB reopens successfully;
- no data-integrity failure occurs;
- every triggered conditional is either resolved and reverified or blocks completion explicitly.

### Verification

- deterministic Chromium integrated workload;
- repeatable workload parameters/results;
- Fast CI;
- full Browser CI;
- optional target-Windows run only if evidence requires it.

### Cleanup

- remove temporary benchmark/profiling scaffolding not retained for regression;
- keep only the minimal repeatable daily-workload test/assets that protect the product.

---

## C11 — Run final live verification and perform explicit SQL cutover

### Purpose

Verify the final candidate in the authenticated Leumi environment, switch authority explicitly, retain a simple rollback path and leave the repository ready for normal V2 use.

### Direct dependency

- C10.

### Preconditions

- current candidate Fast CI green;
- full Browser CI green;
- C10 green on final candidate;
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
- update durable docs/STATUS to implementation-complete state only after required verification is green.

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
- C10 final workload evidence;
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
O1 analytical optimization   ← C06
O2 Scanner resource hardening ← C10
O3 streaming/chunking         ← C08 or C10
O4 storage/export/fresh DB    ← C10
O5 target Windows evidence    ← C10
O6 shadow comparison          ← C05
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

# Parent navigation drafts

These are navigation only and must not duplicate live status.

## P1 — Feasibility + SQL Core

Children:
~~~text
C01 C02 C03
~~~

Outcome:
~~~text
Browser SQL premise proven and complete-cycle SQL authority trustworthy
~~~

## P2 — V1 Product on SQL

Children:
~~~text
C04 C05
~~~

Outcome:
~~~text
existing Current + Detail/History product works from SQL with real-provider proof
~~~

## P3 — Analytics + Scanner

Children:
~~~text
C06 C07 C08
~~~

Outcome:
~~~text
real analytical SQL proven and simple Scanner usable
~~~

## P4 — Daily Readiness + Cutover

Children:
~~~text
C09 C10 C11
~~~

Outcome:
~~~text
one-owner daily operation proven and SQL authority switched explicitly
~~~

---

# Master draft

One compact Master should explain only:

~~~text
same V1 provider contract
→ SQL authority
→ preserve Current + Detail/History
→ add simple Dynamic SQL Scanner
→ prove normal daily use
→ explicit cutover
~~~

It should link P1..P4, point to STATUS.json for live progress, identify #29/#30 as reused completed evidence, and state that conditional mechanisms are created only on evidence triggers.

It should not reproduce every child acceptance criterion.

---

# Draft-spec completion test

These drafts are ready for critique only if:

- every C01..C11 has one clear product/engineering purpose;
- every dependency is direct and matches the compact DAG;
- acceptance criteria are externally meaningful;
- test layer matches the behavior being proven;
- no Issue requires future/conditional machinery by default;
- no Issue exists solely to say 'run a checkpoint';
- no live/manual step remains where Chromium/Node can assert the behavior;
- C01 safely owns the pending L-1 transfer from old #31 during later materialization;
- C11 owns final cutover/rollback/cleanup without becoming a generalized release platform.

Next step: critique these Issue sizes/dependencies and revise before creating GitHub Issues.