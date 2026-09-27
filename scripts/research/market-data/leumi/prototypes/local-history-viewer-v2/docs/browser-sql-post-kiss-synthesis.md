# Browser SQL V2 — Post-KISS Synthesis

## Role

This document synthesizes the seven post-KISS audits under Issue #72 into one compact planning contract.

It is the input to the next step: designing the new compact execution graph.

It is still planning-only:
- no product/runtime implementation;
- no new canonical GitHub Issues yet;
- no retirement of the old #20..#71 graph yet.

Current scope authority:

~~~text
browser-sql-kiss-scope-reset.md
+ this synthesis
~~~

The detailed post-KISS audits remain rationale/reference.

---

# 1. Product definition

Initial V2 is:

~~~text
a single-user daily local browser market recorder/viewer
+ DuckDB-Wasm/OPFS history
+ Current Universe
+ Security Detail/History
+ simple Dynamic SQL Scanner
~~~

It is not:
- a database platform;
- a long-term historical warehouse;
- a collaborative SQL product;
- a migration framework;
- a distributed runtime;
- an automated trading/execution engine.

---

# 2. Fixed product/data invariants

These are mandatory and survive every simplification:

1. preserve the proven V1 provider flow;
2. MapHeat2 defines the dynamic universe;
3. GetSecuritiesData remains sequential as proven unless later evidence deliberately changes it;
4. canonical SecurityId is String(PaperId or Key);
5. no hardcoded universe size;
6. validate requested/received/unique/duplicate/missing/unexpected IDs;
7. preserve full raw MapHeat and Security facts;
8. preserve null != 0 != empty string != missing;
9. incomplete/corrupt provider cycles never become successful persisted cycles;
10. one successful cycle becomes visible atomically;
11. SQL/OPFS is the single post-cutover market-history authority;
12. Viewer rereads authoritative SQL state; notifications are hints only;
13. Scanner cannot mutate market-history authority;
14. Scanner executions do not overlap;
15. only one browser runtime owns the production DB/Recorder at a time;
16. no silent DB deletion/reset;
17. security/session secrets never enter repository/runtime evidence artifacts;
18. tests protect observable/public behavior rather than private internals.

---

# 3. Chosen simple architecture

~~~text
authenticated Leumi page
→ existing V1 collector/validation
→ one Runtime Controller / SQL Worker
→ DuckDB-Wasm + OPFS
→ atomic raw/current/history persistence
→ small trusted read API
→ Current Universe
→ Security Detail/History
→ Dynamic SQL Scanner
~~~

Cross-tab rule:

~~~text
one stable exclusive Web Lock
→ owner runs Worker/DB/Recorder
→ non-owner is passive
~~~

No leader-election framework, heartbeat authority or steal mechanism.

---

# 4. Mandatory mini-projects

## K1 — Real-site DuckDB premise

Purpose:

~~~text
prove the selected browser SQL runtime can actually run on authenticated Leumi
~~~

Reuse completed evidence:
- #29 exact DuckDB-Wasm/package/core/asset pin;
- #30 synthetic Worker/Wasm/OPFS/reopen probe.

Remaining proof:
- real authenticated origin;
- Blob Worker;
- exact pinned Worker/Wasm;
- OPFS test DB;
- synthetic write/commit;
- required reopen/durability behavior;
- sanitized self-verifying PASS/FAIL.

Web Locks are not part of this early blocker.

## K2 — Minimum SQL core

Purpose:

~~~text
same validated V1 cycle
→ one SQL authority
→ minimum schema
→ atomic persistence
→ reopen safely
~~~

Minimum responsibilities:
- Worker/Controller ownership;
- deterministic generated runtime/build identity;
- minimal raw/current/history schema;
- stable snapshot/cycle ordering identity;
- bulk validated-cycle handoff;
- atomic current/history/latest update;
- minimum proven durability/retry semantics;
- explicit incompatible-schema refusal;
- no silent reset;
- small runtime/storage health.

No Scanner.
No persisted horizons.
No generic migration framework.

## K3 — V1 product on SQL

Purpose:

~~~text
normal Recorder
→ SQL
→ trusted reads
→ Current Universe
→ Detail/History
~~~

Responsibilities:
- integrate authenticated Recorder with SQL persistence;
- small trusted read API;
- authoritative Viewer attach/reread;
- Current parity;
- Detail/history parity;
- stable bounded paging;
- missed-notification/reload recovery;
- bounded real-provider L-2 proof;
- compact V1-on-SQL parity closure.

This is the first usable product checkpoint.

## K4 — Real analytical SQL / optional optimization

Purpose:

~~~text
write the analytical SQL we actually want
→ test it on representative day-sized history
→ optimize only if necessary
~~~

Possible outcome:

~~~text
no persisted enrichment is required
~~~

If optimization is needed, choose the smallest one:
- better SQL;
- useful verified typed source field;
- targeted engine/schema optimization;
- predecessor reference;
- persisted derived metric.

No predefined eight-horizon schema.
No DealsDelta until semantics are verified.

## K5 — Simple Dynamic SQL Scanner

Purpose:

~~~text
user SQL
+ repeat interval
+ Activate
→ safe read-only execution
→ one query at a time
→ truthful result table/status/error
~~~

Initial Scanner state:
- draft SQL/interval;
- one active SQL/interval;
- persist current active config only;
- fresh run after runtime restart;
- simple no-overlap timer;
- last successful result may remain visibly stale after a later error within one runtime;
- optional SecurityId drill-down to shared Detail.

No immutable version history.
No collaborative OCC.
No mandatory streaming.
No advanced cancellation/preemption unless evidence triggers it.

## K6 — Single-owner + representative daily workload

Purpose:

~~~text
prove the actual shipped product behaves like a reliable daily local tool
~~~

Responsibilities:
- exclusive Web Lock ownership;
- passive non-owner;
- safe acquisition after prior owner closes;
- synthetic/Chromium representative trading-day workload;
- normal Recorder + SQL + Current/Detail + Scanner together;
- no growing ingest backlog;
- no Scanner overlap;
- usable responsiveness;
- stable-enough memory;
- understood storage growth;
- reopen after accumulated data.

Real-origin Web Lock proof belongs near final readiness, not K1.

## K7 — Final live run + explicit cutover

Purpose:

~~~text
verify final candidate on real Leumi
→ switch authority explicitly
→ retain simple rollback path
~~~

Flow:

~~~text
Fast CI
+ full Browser CI
+ representative daily workload
+ prior L-1/L-2 evidence
+ bounded final authenticated run
+ real-origin ownership proof
→ stop old recorder at settled boundary
→ start fresh SQL production history
~~~

Rollback if seriously broken:

~~~text
stop SQL release
→ preserve SQL DB
→ run retained old IndexedDB release
~~~

No legacy history import.
No automatic fallback.
No dual authority.

---

# 5. Candidate executable Issue boundaries

The graph should follow natural engineering boundaries, not a target count.

Current candidate shape is approximately **10–12 executable Issues**:

~~~text
I1  K1 real-origin DuckDB L-1

I2  K2 SQL Worker/runtime + minimum schema/build identity
I3  K2 atomic persistence + reopen/durability

I4  K3 Recorder integration + trusted reads
I5  K3 Current + Detail/History parity + L-2 closure

I6  K4 real analytical SQL + day-sized measurement
I7  K4 targeted optimization ONLY IF I6 proves necessary

I8  K5 Scanner core/safety/timer
I9  K5 Scanner UI/results/integration

I10 K6 exclusive Web Lock ownership
I11 K6 representative daily mixed workload

I12 K7 final live verification + cutover/rollback/cleanup
~~~

Important:
- I7 is conditional and may never exist;
- I8/I9 may merge if implementation is naturally small;
- I4/I5 may adjust slightly after code-level dependency review;
- no artificial checkpoint-only Issues;
- no Issues solely for health, observability, security, archive, shadow or upgrade frameworks.

Therefore the final graph may be closer to 10–11 normal Issues than 12.

---

# 6. Hard dependency spine

Only true blockers should be hard edges.

Provisional simple spine:

~~~text
#29/#30 completed evidence
→ I1 L-1
→ I2 minimum SQL authority
→ I3 atomic persistence/reopen
→ I4 Recorder + trusted reads
→ I5 Current/Detail parity + L-2
→ I6 real analytical SQL
→ I8/I9 Scanner
→ I10/I11 ownership + daily workload
→ I12 final live/cutover
~~~

Nuance:
- I2/I3 may begin only after I1 proves the real-origin runtime premise;
- I10 Web Lock implementation can start after the runtime shape is stable and may overlap later product work;
- I7, if activated, sits after I6 and before the final workload that depends on it;
- final daily workload must use the actual shipped Scanner/enrichment shape;
- final live/cutover depends on all selected initial-V2 work, not on conditional/future mechanisms that were never activated.

---

# 7. Conditional work

Conditional mechanisms are **not standing Issues**.

Create a focused Issue only when its trigger occurs.

## C1 — Shadow comparison

Trigger:
- one specific material live migration ambiguity survives deterministic parity + L-2.

Default:
~~~text
not built
~~~

## C2 — Storage export/fresh-DB workflow

Trigger:
- representative day/storage evidence or real use shows local history growth needs an explicit user workflow.

Default:
~~~text
retain-all + truthful storage failure
~~~

First solution to consider:
~~~text
explicit export/download if desired
→ explicit fresh DB
~~~

## C3 — Advanced Scanner cancellation/preemption

Trigger:
- representative mixed load proves Scanner materially harms ingest and simpler query/schema/interval changes do not solve it.

Default:
~~~text
one query at a time; no overlap
~~~

## C4 — Streaming/chunked result delivery

Trigger:
- representative result sizes make simple materialization unsafe/unusable.

Default:
~~~text
simple result materialization + truthful bounded rendering
~~~

## C5 — Target Windows-specific performance lane

Trigger:
- CI/browser evidence is insufficient for a material target-machine performance/browser decision.

Default:
~~~text
normal Chromium CI
~~~

---

# 8. Future-only scope

No initial-V2 Issue should exist for:
- generalized engine upgrade framework;
- generalized schema migration platform;
- side-by-side candidate DB promotion;
- automatic archive/rollover orchestration;
- archive restore/import platform;
- multi-epoch query federation;
- long-term warehouse lifecycle;
- immutable history of every SQL edit;
- sophisticated multi-editor collaboration;
- generic cancellation/preemption framework;
- generalized Worker crash supervisor;
- rich incident/event/telemetry subsystem;
- distinct-wave persisted model;
- final trading formula;
- order placement/execution.

These can be planned later when a concrete requirement exists.

---

# 9. Testing contract

Use the cheapest layer that proves the public behavior:

~~~text
Node
= pure deterministic logic

Chromium
= Worker/Wasm/OPFS/Web Locks/runtime/Viewer/Scanner integration

Live Leumi
= authenticated origin/provider facts only
~~~

Permanent regression areas:
- Provider/Data;
- SQL Storage;
- Viewer;
- Ownership;
- Scanner;
- Integrated Daily workload.

Normal CI:
~~~text
Fast CI
Browser CI
~~~

No workflow per Issue/mini-project.

Full Browser CI runs at meaningful browser/runtime integration boundaries and before cutover, not after every docs/pure-code change.

---

# 10. Live verification contract

Only three live moments are normal:

## L-1 — early premise
Worker/Wasm/OPFS/reopen on authenticated Leumi.

## L-2 — provider integration
real provider → complete validation → SQL → trusted read.

## Final integrated live run
real collection + SQL + Viewer + Scanner + ownership before cutover.

All are self-verifying and sanitized.

Human participation is limited to launching inside the authenticated session where unavoidable.

---

# 11. Storage/recovery contract

Initial policy:

~~~text
retain all committed history
→ never silently delete/reset
→ if persistence cannot safely continue, stop claiming successful cycles and show explicit error
~~~

Initial compatibility:

~~~text
runtime/build identity
+ schema version
+ unsupported DB blocks safely
~~~

No generalized migration framework before valuable SQL production history exists.

---

# 12. Health/diagnostic contract

Keep it small:

~~~text
starting
running
stale/stopped
storage/runtime error
Scanner query error
~~~

Diagnostics may show safe build/schema/last-success/error information.

No generic incident database or telemetry platform.

---

# 13. Decisions that must be reconciled before implementation

Pass G must explicitly update/supersede the old accepted chain so there is only one current truth.

Required treatment:

~~~text
D-025  KEEP + update engine-selected fact
D-026  KEEP
D-027  SUPERSEDE fixed wide enrichment schema
D-028  SUPERSEDE fixed mandatory enrichment transaction design
D-029  SUPERSEDE version-history/anchored scheduler design
D-030  SIMPLIFY durability/recovery mechanism commitment
D-031  KEEP
D-032  SIMPLIFY Viewer/client + remove editor OCC requirement
D-033  KEEP verification-layer principle
D-034  SUPERSEDE rigid performance ratios/gates
D-035  KEEP + simplify cutover/shadow wording
D-036  SIMPLIFY health/observability
D-037  SUPERSEDE 42-WP graph
D-038  SUPERSEDE mandatory archive/rollover
D-039  SUPERSEDE mandatory preemption
D-040  KEEP Web Lock + move live gate timing
D-041  FUTURE-ONLY for initial V2
D-042  SUPERSEDE old frozen 42-WP baseline
D-043  KEEP product/provider boundary + update traceability
~~~

Do not leave contradictory Accepted decisions beside the new implementation graph.

---

# 14. Current product/docs that must change during materialization

Pass G must align at least:
- ROADMAP.md;
- product shape traceability;
- live SQL product engine-status wording;
- TESTING_POLICY.md Browser SQL section;
- current implementation decomposition;
- GitHub execution-structure navigation;
- final planning-freeze authority;
- relevant decisions D-025..D-043;
- STATUS.json historical live-looking fields;
- plan guards/static checks.

Detailed old manuals/audits may remain cold reference and should not be required startup reading.

---

# 15. Old GitHub graph transition

Do not mutate/close old Issues until the new graph exists.

Transition:

~~~text
design compact graph
→ create new Master/parents/work Issues
→ ensure new K1 owns pending L-1 and links #29/#30
→ update current docs/decisions/guards
→ mark old open WPs superseded with successor/deferral comments
→ close old WPs
→ close old Epics
→ close old Master #20
→ final consistency audit
→ close planning #72
~~~

Completed #29/#30 remain closed evidence.
#65 remains closed duplicate.

---

# 16. Fresh-chat implementation reading target

After final materialization, a new implementation chat should normally need:

~~~text
AGENTS.md
→ V2 README.md
→ STATUS.json
→ AI_CONTEXT.md
→ active compact Issue
→ only directly linked spec/test/source files
~~~

It should not need to read:
- all seven post-KISS audits;
- the old 42-WP decomposition;
- the old Phase A-W planning history;
- old final freeze;
- future-only lifecycle documents.

---

# 17. Canonical-plan quality test

The plan is sufficiently simple when a fresh engineer can summarize it as:

~~~text
prove DuckDB on Leumi
→ store the same V1 cycles safely in SQL
→ make Current/Detail work from SQL
→ try the real analytical SQL and optimize only if needed
→ add a simple safe repeating SQL Scanner
→ prove one-owner normal-day operation
→ run final live check and switch over
~~~

Any mandatory step that cannot be explained as supporting one of those sentences must justify why it belongs in initial V2.

---

# 18. Synthesis result

The post-KISS audits do not merely shorten the old plan.

They replace its implementation model.

The new initial V2 is intentionally based on:

~~~text
correct data
+ minimum SQL authority
+ existing product parity first
+ real SQL before precomputation
+ simple Scanner
+ one-owner daily operation
+ boring cutover
~~~

Next step:

~~~text
design the compact execution DAG and exact Issue boundaries from this synthesis
~~~

Do not create the GitHub Issues until that DAG is reviewed for hard vs soft dependencies and unnecessary serialization.