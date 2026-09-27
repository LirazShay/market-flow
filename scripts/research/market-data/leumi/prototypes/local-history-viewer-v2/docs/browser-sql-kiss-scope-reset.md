# Browser SQL V2 — KISS Scope Reset

## Role

This is the product-complexity reset triggered during Issue #72 after Pass F2.

The earlier re-baseline work found many real edge cases and verification concerns, but the implementation target is a single-user daily browser tool, not a multi-tenant database platform.

This document separates what initial V2 actually needs, what remains conditional, what is future-only, and what should be removed from the initial execution graph.

This is planning-only. No product/runtime code is implemented here.

---

# 1. Product reality

The intended daily workflow is simple:

~~~text
open authenticated Leumi page
→ Market Flow collects the same provider data as V1
→ DuckDB-Wasm/OPFS stores history locally
→ Current Universe shows latest data
→ Detail/History shows one security
→ optional enrichment is calculated/stored
→ Dynamic SQL Scanner runs user SQL every X seconds
→ user may later download/export/local-save data if needed
~~~

There is one user, one browser, local browser storage, no server database, no multi-tenant service, no distributed cluster, no remote database failover, and no requirement for indefinite unattended operation.

Planning and implementation must reflect that reality.

---

# 2. KISS rule

For initial V2:

~~~text
build the simplest mechanism that proves the required daily behavior
~~~

Only add a more complex mechanism when:

~~~text
a concrete test / benchmark / live fact
shows the simple mechanism is insufficient
~~~

Do not implement infrastructure because it might someday be useful.

---

# 3. What must remain strong

KISS does not mean weakening correctness.

These stay mandatory:
1. same proven V1 provider flow;
2. dynamic universe, no hardcoded count;
3. canonical SecurityId;
4. exact requested/received/unique/duplicate/missing/unexpected validation;
5. full raw MapHeat + Security preservation;
6. null != 0 != empty string != missing;
7. one complete cycle commits atomically;
8. failed cycle leaves no partial Current/History;
9. Viewer reads authoritative committed SQL state;
10. Scanner cannot mutate market-history authority;
11. Scanner executions do not overlap;
12. one browser/runtime writer owns the production DB at a time;
13. no silent DB deletion/reset;
14. important behavior is covered by automated tests;
15. real Leumi-only facts use automated self-verifying probes rather than manual judgement.

These are data-integrity rules, not enterprise extras.

---

# 4. Initial V2 implementation shape

The initial product should be understandable as seven mini-projects, not dozens of architectural subsystems.

## K1 — Prove Browser SQL on the real site

~~~text
pinned DuckDB-Wasm
→ Worker
→ OPFS
→ COMMIT/CHECKPOINT
→ reopen
→ automated PASS/FAIL on authenticated Leumi
~~~

Reuse existing WP-01/WP-02 evidence.

Do not build production SQL architecture before this premise is proven.

## K2 — Build the minimum SQL recorder/storage core

~~~text
same validated V1 cycle
→ one SQL Worker
→ one simple schema
→ one atomic transaction
→ reopen/recovery
~~~

Minimum data:
- cycle identity/time;
- current universe;
- raw MapHeat;
- raw Security history;
- stable snapshot identity;
- latest/current lookup;
- minimal idempotency token if required for safe retry.

No Scanner state. No enrichment yet. No generic migration framework.

## K3 — Recreate the existing V1 product on SQL

~~~text
SQL storage
→ trusted reads
→ Current Universe
→ Security Detail/History
→ parity tests
→ live provider verification
~~~

This is the first major checkpoint.

Until this works, do not add analytical features.

## K4 — Add only useful enrichment

Process:

~~~text
analytical need
→ prove field meaning
→ try dynamic SQL
→ benchmark
→ persist only if worthwhile
~~~

Do not pre-create the old wide horizon schema by default.

No undefined wave model. No guessed DealsDelta semantics.

## K5 — Build the Dynamic SQL Scanner

Initial Scanner scope:

~~~text
SQL textarea
+ repeat interval
+ explicit activate
+ read-only SQL
+ one execution at a time
+ result table
+ useful errors/status
+ optional SecurityId drill-down
~~~

Start simple.

Do not initially require saved-query library, immutable version history, collaborative editing, sophisticated cancellation, streaming for every result, or complex scheduler policy.

Add these only if tests/benchmarks prove the simple implementation inadequate.

## K6 — Prove one normal trading-day workload

Test the actual shipped shape with a representative daily workload:

~~~text
continuous collection
+ SQL persistence
+ selected enrichment
+ Current/Detail reads
+ repeated Scanner query
~~~

Check no growing backlog, acceptable responsiveness, storage growth, reopen, memory/runtime stability, and data integrity.

This is the primary performance/capacity target.

Stress data may add a safety margin, but the product is not designed as an indefinite historical data warehouse.

## K7 — Final live run and explicit cutover

Before switching authority:

~~~text
final Browser tests
→ real authenticated live run
→ keep old working release available
→ switch to SQL version explicitly
~~~

If the new version is bad:

~~~text
stop it
→ return to previous release
~~~

Do not build a generalized release-migration platform for this initial transition.

---

# 5. Mandatory simple mechanisms

These mechanisms are simple enough and valuable enough to remain initial scope.

## One SQL Worker / Runtime Controller

Keep one clear owner for DuckDB/OPFS.

## Atomic cycle transaction

Required for correctness.

## Trusted read API

Current/Detail should not depend on physical SQL table layout.

Keep the API small:

~~~text
getCurrentUniverse
getSecurityCurrent
getSecurityHistoryPage
health/readiness
~~~

## Basic exclusive Web Lock

Use one stable exclusive Web Lock so two tabs cannot both become production writers.

Keep the behavior simple:

~~~text
if lock acquired
→ run recorder/runtime

if lock unavailable
→ passive Viewer/client only
~~~

No distributed-election framework. No heartbeat authority. No automatic steal.

## Read-only Scanner guard

Required because arbitrary SQL is user input.

Use the simplest proven parser/engine-backed protection on the pinned DuckDB build.

## Simple status/health

Need only enough to tell the truth:

~~~text
starting
running
stale/stopped
storage/runtime error
Scanner query error
~~~

Do not build a large observability framework.

---

# 6. Conditional only

These are not part of the initial mandatory path.

## C1 — Shadow comparison

Default: do not build.

Only activate for one specific unresolved live migration uncertainty. Remove it after the experiment.

## C2 — Archive / rollover system

Default: do not build.

Initial behavior is retain-all plus truthful storage failure.

Activate archive/rollover only if a representative daily/storage test proves it is actually needed.

## C3 — Advanced Scanner cancellation/preemption

Default:

~~~text
one query at a time
→ let it finish / use the simplest safe replacement behavior
~~~

Only add cancellation/recycle/Worker-restart machinery when a mixed-load benchmark proves the simple model harms collection.

## C4 — Streaming large results

Default: bounded practical result rendering.

Choose streaming only if real result-size tests justify it.

The UI must remain truthful about truncation/completeness.

## C5 — Windows-specific performance lane

Use it when target-OS behavior/performance is uncertain or before final release if it materially adds evidence.

Do not duplicate every benchmark on every OS by default.

---

# 7. Future-only / remove from initial V2

Future-only:
- generalized DuckDB engine upgrade framework;
- generalized schema side-by-side migration platform;
- permanent archive management UI;
- restore/import platform;
- multi-epoch query federation;
- long-term historical warehouse lifecycle;
- sophisticated multi-editor Scanner collaboration;
- immutable history of every SQL edit;
- generic cancellation/preemption framework;
- generalized Worker crash-supervisor framework;
- rich observability/event framework;
- distinct-wave persistence model;
- final trading formula/automatic execution.

Remove as mandatory architecture:
- mandatory dual-write shadow period;
- mandatory archive/rollover before first release;
- mandatory complex query preemption;
- mandatory always-streaming result transport;
- mandatory future-upgrade machinery;
- mandatory multi-version Scanner history.

Historical docs may retain the analysis, but the canonical implementation plan must not schedule these as required work.

---

# 8. Daily storage model

Initial mental model:

~~~text
one local SQL history DB
→ record normal daily use
→ keep data while storage remains healthy
~~~

If the user wants a local copy later, explicit export/download capability may be added.

If day-scale capacity is healthy, no archive lifecycle is required merely for architectural neatness.

If storage eventually becomes a practical issue:

~~~text
measure first
→ choose simplest explicit solution
~~~

A possible future solution may simply be:

~~~text
download/export what matters
→ start a fresh DB explicitly
~~~

It does not need to begin as a full database-epoch product.

---

# 9. Upgrade model

Initial V2 needs only:

~~~text
schema/build identity
+ detect incompatible DB
+ do not corrupt/reset silently
~~~

For development before production cutover, a deliberate fresh development DB may be acceptable when schema changes and no valuable production history exists.

For the first production cutover:

~~~text
keep previous working release available
+ switch explicitly
+ do not merge IndexedDB and SQL history
~~~

A reusable future migration framework is deferred until a concrete post-V2 release actually needs to migrate valuable SQL production history.

Therefore the previously planned F3 generalized-upgrade audit is no longer a necessary initial-V2 design exercise.

---

# 10. Test strategy after KISS reset

Keep the test suite strong but focused.

Permanent high-value tests:
- collector validation;
- atomic persistence;
- reopen;
- null/zero/empty/missing;
- Current membership/sort;
- Detail/history paging;
- V1↔SQL parity;
- one-writer Web Lock;
- Scanner read-only safety;
- Scanner no-overlap;
- result-grid truthfulness;
- Scanner isolation;
- representative daily workload;
- final live real-site verification.

Temporary engineering probes are allowed for DuckDB feature feasibility, query-performance comparison, cancellation API experiments, and storage-growth experiments.

Disposition:

~~~text
useful regression
→ keep minimal test

experiment only
→ remove
~~~

Do not turn every investigation into permanent infrastructure.

---

# 11. Planning-document reading model

The large audit/manual set created during the re-baseline is useful as design rationale, edge-case library and verification reference.

It should not become the implementation startup reading list.

After Pass G, a fresh implementation chat should normally need only:

~~~text
AGENTS.md
→ V2 README
→ STATUS.json
→ active Issue
→ one compact canonical implementation plan
→ only the relevant detailed manual when the active task needs it
~~~

The detailed E/F documents remain cold/reference material.

---

# 12. Target canonical execution size

The previous 42-WP graph is too large for the product.

The D3 ND-01..ND-33 graph is an analysis model, not a desired Issue count.

Pass G should aim for roughly:

~~~text
7 major mini-projects
≈ 12–18 coherent executable Issues
~~~

Exact count follows natural engineering boundaries.

Do not create one Issue for every audit bullet.

Do not recreate 33 planning nodes merely with new names.

---

# 13. Proposed simplified execution sequence

~~~text
1. real-site DuckDB proof
2. collector contract + minimum SQL core
3. atomic persistence + reopen
4. trusted reads + Current/Detail parity
5. minimal evidence-backed enrichment
6. simple Dynamic SQL Scanner
7. single-owner + representative daily workload
8. final live run + explicit SQL cutover
9. cleanup/docs
~~~

Some steps may split into two Issues where tests/implementation boundaries make that natural.

This sequence preserves:

~~~text
existing product first
→ new analytical data second
→ Scanner third
→ final hardening/cutover last
~~~

---

# 14. Decisions that Pass G must reconcile

At minimum, the canonical rewrite must update/supersede older durable decisions that overstate initial scope:
- D-037 — 42-package decomposition;
- D-038 — mandatory archive/rollover;
- D-039 — advanced resource isolation if written as mandatory;
- D-041 — generalized side-by-side upgrade lifecycle;
- D-042 — frozen 42-package implementation baseline;
- D-043 — old-WP traceability while preserving its product meaning.

Also review D-027/D-028/D-029/D-032 where re-baseline work changed mechanism commitments.

Do not leave contradictory accepted decisions in place while implementing a simpler graph.

---

# 15. KISS acceptance test

The final canonical plan is simple enough only if a fresh engineer can summarize it as:

~~~text
prove DuckDB works
→ move V1 storage to SQL without changing collection
→ prove Current/Detail still work
→ add only useful analytics
→ add simple safe SQL Scanner
→ run it like a normal full day
→ switch over
~~~

If the canonical plan requires explaining epochs, shadow, upgrade frameworks, multi-editor OCC, query preemption or archive orchestration before normal V2 can run, the plan is still too complicated.

---

# 16. Result of this reset

Initial V2 is no longer planned as a generalized browser database platform.

It is planned as:

~~~text
a robust local daily market recorder/viewer
+ useful SQL history
+ a simple Dynamic SQL Scanner
~~~

Advanced lifecycle machinery is added only when measured reality demands it.