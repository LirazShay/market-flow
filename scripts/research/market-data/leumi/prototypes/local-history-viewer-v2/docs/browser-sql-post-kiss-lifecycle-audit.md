# Browser SQL V2 — Post-KISS Lifecycle / Hardening / Cutover Audit

## Role

This is the fifth post-KISS consistency audit under Issue #72.

Scope:
- cross-tab ownership;
- storage/retention;
- health/error handling;
- shadow verification;
- archive/rollover;
- performance/capacity;
- rollback/cutover;
- generalized upgrade lifecycle;
- advanced analytical preemption.

Goal:

~~~text
keep only the lifecycle/hardening needed by a single-user daily local browser tool
~~~

This audit does not implement runtime/product code and does not yet mutate canonical GitHub execution Issues.

Current scope authority: browser-sql-kiss-scope-reset.md.

---

# 1. Overall conclusion

Initial V2 needs a very small operational model:

~~~text
one runtime owner
+ one local SQL database
+ retain-all while healthy
+ explicit failure instead of silent loss
+ representative daily workload test
+ explicit switch from old release to SQL release
+ explicit rollback to old release if needed
~~~

That is enough for first production use.

Shadow, archive/rollover, generalized upgrades and advanced query preemption are not normal prerequisites.

---

# 2. Cross-tab ownership — KEEP, very simple

D-040 remains one of the few lifecycle decisions that is both valuable and simple.

Keep:

~~~text
one stable exclusive Web Lock
→ lock holder may start SQL Worker / production DB / Recorder
→ non-holder remains passive
~~~

Also keep:
- no heartbeat authority;
- no localStorage election;
- no steal:true;
- new owner runs reopen/readiness before recording.

Do not add:
- lease renewal;
- leader election protocol;
- distributed fencing tokens;
- owner heartbeat persistence.

One browser lock is enough.

---

# 3. Web Lock verification timing

The old D-040/WP-03 rule made real-origin Web Lock proof an early blocker for all heavy SQL work.

SIMPLIFY.

New order:

~~~text
early L-1 proves Worker/Wasm/OPFS on real origin
→ implementation proceeds
→ Chromium proves Web Lock mechanics
→ real-origin two-tab Web Lock proof occurs before final single-owner/cutover readiness
~~~

This preserves the safety invariant without blocking early product development on a later operational behavior.

---

# 4. Storage policy — retain-all and tell the truth

Mandatory initial behavior:

~~~text
retain committed SQL history
→ do not silently prune
→ do not silently reset
→ do not delete unrelated origin storage
→ if durable persistence cannot continue: show storage/runtime error and stop claiming successful cycles
~~~

No storage lifecycle product is required beyond this.

Keep exact Market-Flow-owned deletion boundaries for any explicit developer/user cleanup action.

---

# 5. Storage monitoring stays lightweight

Initial V2 only needs enough information to diagnose obvious local-storage pressure.

Useful observations may include:
- current DB/storage size where measurable;
- browser storage estimate/quota where reliably available;
- last persistence/checkpoint error;
- reopen success/failure.

Do not build:
- quota forecasting engine;
- automatic retention policy;
- multiple warning tiers;
- capacity daemon;
- persistent storage-pressure journal.

If a write fails because storage is exhausted, that is a clear explicit failure.

---

# 6. Archive/export — DEFER unless user need or measured storage issue appears

Initial V2 does not require archive management.

If later useful, the simplest acceptable feature may be:

~~~text
explicit export/download of the local SQL DB or logical data
~~~

followed by an explicit fresh DB start.

Do not prebuild:
- archive browser UI;
- backup catalog;
- restore/import platform;
- multi-epoch query support.

Archive is not a backup promise unless restore is actually implemented/tested.

---

# 7. Rollover — REMOVE from mandatory initial V2

The F2 audit already made rollover conditional.

Post-KISS simplification goes one step further:

~~~text
do not design/implement rollover at all
until a representative daily-capacity test or real usage proves that a fresh-DB workflow is actually needed
~~~

If that day comes, first consider the simplest manual flow:

~~~text
export/download if desired
→ stop runtime
→ explicitly start fresh DB
~~~

Only build automatic journaled rollover if real requirements later justify it.

---

# 8. Health model — shrink to what the user needs

D-036 is directionally correct but too formal.

Initial user/runtime states can be:

~~~text
starting
running
stale/stopped
storage/runtime error
Scanner query error
~~~

Additional component detail may exist in diagnostics, but do not build a generic health-precedence framework.

Keep one important rule:

~~~text
failure is scoped to the smallest subsystem that is actually broken
~~~

Examples:
- Scanner query error does not stop Recorder;
- Viewer rendering error does not corrupt DB;
- provider cycle failure means that cycle is not committed;
- SQL/storage failure stops successful recording claims.

---

# 9. Observability — ordinary diagnostics, not a subsystem

Initial diagnostics may include:
- runtime/build/schema identity;
- last successful cycle time;
- latest collection/persistence error;
- Scanner latest status/error;
- DB reopen status;
- safe storage estimate if available.

Do not build:
- durable generic incident/event database;
- rich telemetry pipeline;
- remote monitoring;
- long failure history.

Use ordinary console/debug bundle/test output where enough.

Security remains strict: no cookies, tokens, account identifiers or raw authenticated dumps.

---

# 10. Shadow — conditional diagnostic only

Keep F1 conclusion exactly:

~~~text
default = no shadow
~~~

Only create a temporary same-cycle comparison if one specific live migration ambiguity cannot be resolved by deterministic parity + L-2.

Do not include shadow in:
- normal implementation plan;
- normal runtime;
- normal cutover;
- rollback.

If activated, remove its temporary dual-path scaffolding after the question is answered.

---

# 11. Performance/capacity target — one normal trading-day shape

D-034's strict ratios and multiple release gates are superseded.

Initial V2 performance proof should answer:

~~~text
Can the shipped product run through a representative normal trading day without degrading into backlog, instability or unusable latency?
~~~

Test the actual shipped shape:
- normal cycle collection cadence;
- SQL persistence;
- Current/Detail reads;
- selected enrichment, if any;
- active Scanner at a representative interval/query;
- normal Viewer usage.

Observe:
- no growing persistence backlog;
- no overlapping Scanner executions;
- query/Viewer responsiveness remains usable;
- memory remains stable enough;
- storage growth is understood;
- reopen succeeds after accumulated data;
- no corruption/quota/runtime failure.

---

# 12. Safety margin — modest and evidence-based

A small extra-data or faster-cadence stress run may be useful.

But do not require a formal 2x-session or fixed percentage budget.

Use the stress case only to answer a concrete question such as:

~~~text
Do we still have comfortable headroom if the day is busier than the representative case?
~~~

If the representative run is already far from any observed bottleneck, stop.

---

# 13. Windows/target-machine testing — selective

Do not make every benchmark run on every OS.

Use target Windows/Chrome evidence when:
- OPFS/browser behavior differs materially from CI;
- performance conclusions are sensitive to target hardware/browser;
- final release confidence benefits from it.

Otherwise Linux Chromium relative tests are enough during development.

The final real browser run naturally provides additional target-environment evidence.

---

# 14. Advanced preemption — conditional only

Keep Scanner audit conclusion:

~~~text
default = one Scanner query at a time
~~~

Measure mixed daily load first.

If Scanner materially delays collection, try the smallest fix:

~~~text
better query
→ query/schema optimization
→ longer minimum interval
→ separate analytics connection if useful
→ cancellation only if required
→ Worker recovery only as last resort
~~~

D-039's mandatory preemption framework must be superseded.

---

# 15. Cutover — keep it intentionally boring

D-035's core is good.

Initial SQL cutover should be:

~~~text
1. stop old IndexedDB recorder at a settled boundary
2. keep old data untouched
3. launch the tested SQL release
4. open/create fresh production SQL DB
5. prove runtime ready
6. begin new SQL recording
7. verify first successful SQL cycles and Viewer reads
~~~

No legacy-history import.

No silent dual authority.

No automatic fallback.

No generic migration platform.

---

# 16. What 'fresh SQL DB' means in initial V2

Because initial cutover intentionally starts a new SQL history:

- no IndexedDB→DuckDB history importer;
- no hidden predecessor bridging;
- no merge of old/new histories;
- analytical history warms naturally after cutover.

This is the simplest correct transition.

Any later desire to import old history is a separate future feature.

---

# 17. Rollback — release rollback, not data synchronization

If the SQL release is bad:

~~~text
stop SQL runtime
→ preserve SQL DB for diagnosis
→ launch retained old IndexedDB release
~~~

Accept the documented history gap during time spent on SQL authority.

Do not attempt automatic synchronization back into IndexedDB.

This is appropriate for a local daily tool and dramatically simpler than dual-write rollback.

---

# 18. When rollback should be used

Rollback is for:
- serious functional regression;
- SQL runtime cannot start/recover;
- data integrity concern;
- unusable performance not caught before cutover.

Minor Scanner/UI defects that do not threaten collection/storage may be fixed forward if the user chooses, but there is no automatic policy engine.

Human decision is acceptable here because cutover/rollback is an explicit release operation, not a per-cycle correctness mechanism.

---

# 19. Final authenticated transition — small, integrated, machine-observed

Do not build an elaborate L-3 framework.

The final authenticated proof is part of one explicit no-overlap release transition:

~~~text
stop old IndexedDB Recorder at a settled boundary
→ preserve legacy data
→ launch the tested SQL candidate
→ prove real-origin two-tab ownership
→ granted owner opens fresh production OPFS/readiness
→ begin SQL recording
→ run a bounded integrated verification
→ accept cutover only if required checks pass
~~~

If a material post-stop/cutover check fails, explicitly stop SQL, preserve its DB and launch the retained old release. There is no automatic fallback or history synchronization.

Machine-observe at least:
- provider cycles attempted/completed/failed and exact integrity counters;
- validation/persistence failures;
- current committed cycle freshness;
- Current/Detail trusted reads;
- one explicitly activated representative Scanner query plus executions/errors/overlap count;
- one-writer/passive-loser ownership state;
- obvious backlog growth;
- runtime/storage errors.

Human role:

~~~text
launch the tested artifact and perform the explicit release transition in the authenticated session
~~~

Assertions remain automated where technically possible.

---

# 20. Final authenticated transition does not need to reproduce a full market day

The heavy day-shaped workload is proven deterministically in Chromium with synthetic data.

The bounded authenticated transition proves:
- real origin/provider compatibility on the final candidate;
- the actual no-overlap authority switch works;
- real two-tab single-owner behavior works;
- Current/Detail and one representative Scanner execution work on live committed SQL data;
- no unexpected live-only browser/provider issue appears.

It does not need to reproduce an entire trading day if CI already proves the day-scale workload and a shorter live session exercises the real-only surfaces adequately.

Choose duration from practical coverage, not ceremony.

---

# 21. Generalized upgrade lifecycle — future-only

D-041 must leave initial V2.

Initial V2 needs only:

~~~text
runtime build identity
+ schema version
+ detect unsupported DB
+ refuse silent destructive reset
+ keep previous release available
~~~

Before first SQL production cutover, development DB schema changes may use explicit rebuild of disposable data.

After valuable SQL production history exists, the first future incompatible release can design the migration it actually needs.

Do not build side-by-side upgrade machinery now.

---

# 22. Schema incompatibility behavior

Initial runtime rule:

~~~text
DB schema/build unsupported
→ do not record
→ show explicit incompatibility/error
→ preserve DB untouched
~~~

Developer/user may then choose an explicit supported recovery path.

No auto-reset.

No down-migration.

No generic candidate DB framework.

---

# 23. Cleanup after successful cutover

Do not automatically delete legacy IndexedDB.

After a stabilization period, cleanup may simply mean:
- remove temporary migration/test scaffolding from code;
- keep old runtime artifact available until confidence is sufficient;
- optionally let the user explicitly delete old local data later.

No cleanup subsystem is required.

---

# 24. Proposed lifecycle/hardening implementation size

Most of this should not become standalone Issues.

Likely canonical work:

~~~text
A. simple exclusive Web Lock ownership
B. representative day/mixed-load verification
C. final live run + explicit cutover/rollback docs
~~~

Storage/health behavior belongs inside the SQL core/runtime Issues.

Archive, shadow, advanced preemption and generalized upgrades remain conditional/future and get no normal implementation Issue.

---

# 25. Permanent regression targets

Keep tests for:
- exclusive Web Lock single writer;
- passive non-owner;
- owner close/release + later acquisition;
- no steal/heartbeat authority;
- storage failure does not create fake successful cycle;
- no silent DB reset/delete;
- Scanner error isolation;
- provider failure isolation;
- representative daily workload;
- mixed Scanner+ingest no unbounded backlog;
- cutover startup against fresh SQL DB;
- unsupported schema blocks safely.

Rollback itself may be documented/manual release switching rather than a complicated automated E2E workflow.

---

# 26. Detailed-doc disposition

## browser-sql-shadow-verification-audit.md

KEEP as conditional reference only.

## browser-sql-storage-lifecycle-audit.md

SUPERSEDE as initial implementation guidance; retain safety reasoning as cold reference.

Archive/rollover becomes future/conditional only.

## browser-sql-migration-cutover.md

SIMPLIFY heavily.

Keep fresh cutover, no legacy import, no automatic fallback and explicit rollback.

Remove mandatory shadow/complex lifecycle dependencies.

## browser-sql-analytical-resource-isolation.md

SUPERSEDE as baseline design.

Keep only as advanced troubleshooting/reference if mixed-load evidence later activates preemption work.

---

# 27. Decision updates required in Pass G

Pass G should make the accepted decision chain say roughly:

~~~text
D-035 successor:
fresh explicit SQL cutover, no legacy import, old release retained for rollback

D-036 successor:
small scoped health/errors + sanitized diagnostics

D-038 successor:
retain-all + no silent deletion; archive/rollover future/conditional

D-039 successor:
one query at a time; advanced preemption only if mixed-load evidence requires it

D-040 successor:
one stable exclusive Web Lock; real-origin proof required before cutover, not before all SQL implementation

D-041:
superseded for initial V2 / future-only
~~~

---

# 28. Post-KISS lifecycle acceptance test

The lifecycle plan is simple enough when a fresh engineer can explain it as:

~~~text
one tab owns the runtime
→ store locally until a real storage problem appears
→ show errors honestly
→ prove a normal day works
→ stop old recorder
→ start tested SQL release on a fresh SQL DB
→ if it is seriously bad, stop it and launch the old release
~~~

If initial implementation requires archive journals, database epochs, dual-write shadow, preemption budgets, side-by-side engine upgrades or a generalized recovery platform, lifecycle is still over-planned.
