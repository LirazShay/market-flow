# Browser SQL V2 — Post-KISS Decision and Product-Contract Audit

## Role

This is the first post-KISS consistency audit under Issue #72.

Scope:
- durable Browser SQL decisions D-025..D-043;
- Local History Viewer V2 product shape;
- Live SQL Query Execution product requirement.

Classification vocabulary:

~~~text
KEEP
SIMPLIFY
SUPERSEDE
DEFER
REMOVE-FROM-INITIAL-V2
~~~

This audit does not yet edit the accepted decisions or canonical GitHub execution Issues. It records the required reconciliation for the later canonical rewrite.

Current initial-V2 scope authority:

~~~text
docs/browser-sql-kiss-scope-reset.md
~~~

---

# 1. Product contracts

## local-history-viewer-v2-product-shape.md — KEEP + small cleanup

Keep the product meaning unchanged:

~~~text
same V1 provider/data contract
→ SQL authority
→ Current Universe
→ Security Detail/History
→ separate Dynamic SQL Scanner
~~~

Keep:
- authenticated page-context collection;
- MapHeat2 dynamic universe;
- sequential GetSecuritiesData;
- exact complete-cycle validation;
- canonical SecurityId;
- raw MapHeat/Security preservation;
- no hardcoded universe size;
- null/zero/empty/missing truthfulness;
- three user-facing surfaces;
- one coherent committed authority;
- Scanner is additive, not a replacement;
- no order/trading execution scope.

Required cleanup in Pass G:
- replace old WP-09..WP-38 traceability with the compact canonical graph;
- avoid wording that implies enrichment must be broad/heavy;
- keep enrichment phrased as only what the selected SQL/data model actually needs.

No product redesign is required.

## live-sql-query-execution.md — KEEP + factual simplification

Keep:
- editable user SQL;
- independent repeat interval;
- repeated SQL execution;
- zero rows = success;
- query error must not corrupt/stop ingest;
- committed-state reads;
- SQL features such as JOIN/GROUP BY/HAVING/window/ranking;
- raw history remains rich enough for future SQL;
- browser-only process boundary.

Required cleanup:
- remove stale wording that the concrete Browser SQL engine is still undecided;
- record DuckDB-Wasm as the selected/pinned current engine;
- avoid implying a complex scheduler/streaming mechanism;
- leave deterministic overrun/no-overlap as behavior, not architecture.

---

# 2. Durable decision classification

| Decision | Classification | Initial-V2 disposition |
|---|---|---|
| D-025 Browser-only SQL | KEEP + UPDATE | browser-only boundary stays; update stale engine-selection text |
| D-026 one SQL Authority Worker | KEEP | simple single Worker/Controller ownership remains |
| D-027 fixed wide eight-horizon schema | SUPERSEDE | replace with minimal raw/current/history schema + evidence-selected enrichment |
| D-028 atomic cycle after fixed SQL enrichment | SUPERSEDE | keep atomic complete-cycle persistence; enrichment is optional/evidence-selected and atomic only when selected |
| D-029 immutable SQL versions + anchored scheduler | SUPERSEDE | keep safe read-only SQL, no overlap, committed reads, latest execution/success; simplify lifecycle/scheduler mechanisms |
| D-030 checkpoint/idempotent OPFS recovery | SIMPLIFY | keep explicit durability/reopen/no-reset; retain only checkpoint/idempotency mechanics proven necessary/sufficient |
| D-031 self-contained runtime + pinned assets | KEEP | still simple, valuable and required for reproducibility |
| D-032 detachable Viewer client | SIMPLIFY | keep no direct DB + authoritative resync; remove mandatory optimistic multi-editor/versioning machinery |
| D-033 Node + Chromium + live gates | KEEP | verification layering remains correct; live only for facts CI cannot prove |
| D-034 strict cadence ratios + full-session/2x gates | SUPERSEDE | replace arbitrary ratios/mandatory 2x with representative daily workload + evidence-based safety margin |
| D-035 fresh SQL cutover/no legacy import | KEEP + UPDATE | fresh SQL authority remains; shadow wording becomes conditional only |
| D-036 scoped health/observability | SIMPLIFY | keep truthful scoped failure/security; use small health model, no rich event system |
| D-037 42-WP implementation graph | SUPERSEDE | replace with compact KISS execution graph |
| D-038 mandatory archive/rollover | SUPERSEDE | retain-all + no silent deletion mandatory; archive/rollover conditional only |
| D-039 mandatory analytics preemption | SUPERSEDE | simple one-query/no-overlap baseline; advanced preemption conditional on measured contention |
| D-040 exclusive Web Lock | KEEP + UPDATE | one stable lock remains; move live ownership proof later, not an early SQL-feasibility blocker |
| D-041 generalized side-by-side upgrade lifecycle | DEFER / SUPERSEDE initial applicability | remove from initial V2; revisit only for a concrete future persistence-affecting release |
| D-042 frozen 42-package baseline | SUPERSEDE | replaced by current re-baseline and forthcoming compact plan |
| D-043 provider continuity + three surfaces | KEEP + UPDATE | product boundary remains authoritative; replace old-WP traceability |

---

# 3. Decisions that remain strong with almost no conceptual change

## D-025 — Browser-only SQL

### Keep

The process boundary still fits the product:

~~~text
authenticated browser
→ collector
→ Browser SQL
→ local persistent SQL
→ Viewer/Scanner
~~~

A localhost/Node/.NET service would add moving parts without a current need.

### Fix

The decision still says the concrete engine is not selected. That is stale.

Current verified selection is already:

~~~text
@duckdb/duckdb-wasm@1.32.0
DuckDB core v1.4.3
~~~

Pass G should amend only the stale engine-status section, not reopen the browser-only boundary.

## D-026 — one SQL Authority Worker

KEEP.

This is KISS-compatible:
- one owner;
- one DB handle boundary;
- Recorder hands off validated data;
- Viewer does not own DuckDB;
- no SharedWorker/threaded/multi-owner requirement.

Do not expand it into a runtime platform.

## D-031 — generated self-contained runtime + pinned engine assets

KEEP.

Exact pinned Worker/Wasm/runtime identity is low complexity and high value:
- reproducibility;
- CSP/live testing;
- no floating CDN version;
- easy rollback to a known artifact.

## D-033 — verification layers

KEEP.

The cheap-layer rule remains ideal:

~~~text
Node
→ Chromium
→ live Leumi only when necessary
~~~

KISS should reduce unnecessary live/manual work, not reduce verification quality.

## D-043 — product continuity

KEEP as the main durable product decision.

Only its old 42-WP traceability is stale.

---

# 4. Schema and enrichment decisions that must be superseded

## D-027 — fixed wide eight-horizon schema

SUPERSEDE.

Keep only the durable good parts:
- snapshot/history identity is not timestamp-only;
- raw Security payload is preserved;
- typed fields may exist where useful;
- promoted NULL does not replace raw presence semantics;
- latest/current lookup may be optimized.

Remove from initial mandatory design:

~~~text
exactly eight persisted horizons
wide prev_H columns
wide last_change_H_pct columns
wide deals_delta_H columns
~~~

New KISS rule:

~~~text
minimum raw/current/history schema first
→ prove V1-on-SQL
→ test dynamic SQL
→ persist only selected enrichment that earns its cost
~~~

## D-028 — fixed enrichment inside every successful cycle

SUPERSEDE.

Keep:
- one validated complete-cycle handoff;
- one atomic authoritative transaction;
- one bulk operation rather than N page↔DB calls;
- current/history/latest advance coherently;
- failed transaction exposes nothing partial;
- any persisted derived state must remain rebuildable.

Change:
- fixed predecessor/enrichment work is not required before base V1-on-SQL works;
- the at-or-before temporal rule is not automatically canonical;
- Arrow is an implementation candidate, not a product requirement;
- if selected enrichment is persisted later, it joins the cycle atomically.

The new core transaction can initially be just:

~~~text
cycle + raw/current/history/latest
→ COMMIT
~~~

---

# 5. Scanner decisions that must become simpler

## D-029 — immutable versions + anchored scheduler

SUPERSEDE.

Keep these product/correctness truths:
- editable SQL is read-only;
- admin/mutation SQL is blocked;
- committed-state reads only;
- at most one analytical execution;
- collection cadence and Scanner interval are independent;
- no missed-tick burst;
- zero rows is success;
- latest execution != latest successful execution;
- no hidden LIMIT/filter/ranking.

Do not require initially:
- immutable history of every query version;
- activation-anchored cadence formula;
- one specific coalescing algorithm;
- always-streamed Arrow results;
- a durable query-version database merely for history.

Simpler first-release model:

~~~text
draft SQL + interval
→ explicit activate
→ one active config
→ one execution at a time
→ bounded truthful result preview/table
~~~

## D-032 — Viewer as detachable client

SIMPLIFY.

Keep:
- Viewer never opens DuckDB;
- runtime/DB is authority;
- attach/re-attach performs full authoritative read;
- notifications are hints;
- multiple Viewer clients do not create extra DB owners;
- Viewer close does not stop Recorder.

Remove as mandatory initial complexity:
- optimistic multi-Viewer SQL activation concurrency;
- expectedActiveQueryVersionId as a required product primitive;
- persistent query-version history coupling.

Choose the simplest deterministic editing policy later.

---

# 6. Durability decision: simplify carefully

## D-030 — OPFS durability/recovery

SIMPLIFY, not remove.

Keep:
- one known production DB identity;
- reopen same DB;
- no silent delete/recreate;
- explicit schema/build compatibility check;
- pinned engine;
- storage failure blocks false success;
- correctness must not depend on graceful shutdown.

Re-evaluate as implementation mechanisms:
- explicit CHECKPOINT after every single cycle;
- explicit CHECKPOINT after every Scanner activation;
- full ingest-token ambiguity machinery in every path.

These may still be the simplest correct solution, but the compact plan should say:

~~~text
prove the minimum durable-success/retry contract on the pinned DuckDB build
→ use CHECKPOINT/idempotency where required by that proof
~~~

Do not keep extra durability state merely because an earlier plan anticipated it.

---

# 7. Performance decision must be replaced

## D-034 — strict cadence-relative ratios

SUPERSEDE.

The 25%/50% ratios and mandatory 2x-session run are too prescriptive for the actual local daily tool.

New initial target:

~~~text
representative normal trading-day workload
→ no growing ingest backlog
→ no query overlap
→ responsive Current/Detail/Scanner
→ storage growth understood
→ reopen works
→ no OOM/corruption/quota failure
→ reasonable safety margin
~~~

Still record p50/p95 and workload parameters where useful.

Do not freeze arbitrary percentages before real implementation exists.

---

# 8. Cutover remains simple

## D-035 — fresh SQL authority/no legacy import

KEEP + UPDATE.

Keep:
- no legacy IndexedDB history import;
- cut over between settled cycles;
- no automatic fallback;
- SQL history begins fresh;
- rollback means stop SQL version and run retained old release;
- preserve SQL DB for diagnosis;
- no hidden cross-authority merge.

Change only:

~~~text
optional isolated SQL shadow verification
~~~

to:

~~~text
conditional CND-01 only when a specific unresolved live uncertainty requires it
~~~

---

# 9. Health/observability should shrink

## D-036 — scoped health

SIMPLIFY.

Keep:
- failure is scoped to the smallest relevant subsystem;
- provider/query/Viewer failures should not unnecessarily stop unrelated healthy work;
- persistence/storage/schema failures may block recording;
- no secret/session material in Worker/Viewer/diagnostics;
- no generic blind retry engine;
- no external telemetry requirement.

Simplify user-visible/runtime health toward:

~~~text
starting
running
stale/stopped
storage/runtime error
Scanner query error
~~~

Do not require a rich generic health/event model.

---

# 10. Execution-plan decisions are obsolete

## D-037 — 42 work packages

SUPERSEDE completely as an execution-structure decision.

Its good meta-rules survive:
- dependency-aware work;
- explicit scope/non-goals;
- acceptance criteria;
- cheapest valid test layer;
- cleanup ownership;
- live feasibility before depending on unverified browser premises.

The number 42, eight milestones and WP mapping do not survive.

## D-042 — frozen 42-package baseline

SUPERSEDE.

The freeze rule was correctly reopened by a material product/planning correction.

A new freeze may happen only after:

~~~text
post-KISS audits
→ compact plan
→ GitHub Issue rewrite
→ consistency/guard review
→ fresh-AI dry run
~~~

Do not preserve the old freeze as concurrently authoritative.

---

# 11. Lifecycle decisions that leave initial V2

## D-038 — archive/rollover

SUPERSEDE.

Mandatory:

~~~text
retain-all
no silent delete/prune
storage failure is truthful
delete only exact Market-Flow-owned storage
~~~

Conditional only:

~~~text
archive/export
fresh DB/epoch rollover
maintenance journal
rollover UI
~~~

A simple future user flow may be enough:

~~~text
export/download if desired
→ explicitly start a fresh DB
~~~

Only build more when measured daily capacity proves the need.

## D-041 — generalized upgrade lifecycle

DEFER from initial V2 and supersede its initial applicability.

Initial V2 needs only:

~~~text
build/schema identity
→ detect incompatible DB
→ do not corrupt/reset silently
→ keep previous working release
~~~

Before production cutover, development DBs may be deliberately recreated when no valuable production SQL history exists.

A generic side-by-side migration framework belongs to the first future release that actually needs to preserve valuable SQL production history across an incompatible change.

---

# 12. Resource-isolation decision becomes conditional

## D-039 — mandatory preemption

SUPERSEDE.

Keep:
- market ingest correctness has priority;
- one analytical query at a time;
- Scanner must not create unbounded provider/persistence backlog;
- cancelled/incomplete result must not pretend success if cancellation is later selected.

Initial mechanism:

~~~text
one query at a time
+ simplest safe scheduling/replacement behavior
+ representative mixed-load benchmark
~~~

Only if measured Scanner work materially harms collection:

~~~text
activate conditional advanced cancellation/preemption
~~~

No mandatory pending-stream/cancel/recreate/Worker-restart framework up front.

---

# 13. Cross-tab ownership stays, but gate timing changes

## D-040 — exclusive Web Lock

KEEP the mechanism.

It protects a real correctness invariant:

~~~text
one production writer/runtime owner
~~~

Keep:
- one stable lock;
- exclusive;
- fail-fast/passive non-owner;
- no heartbeat authority;
- no steal:true;
- readiness/recovery before a new owner records.

Update:
- real-origin Web Lock verification should not block all heavy SQL work;
- synthetic Chromium can prove mechanics during implementation;
- real-origin ownership verification is required before production single-owner/final integration/cutover.

---

# 14. Product-document contradictions found

## Product shape traceability is stale

local-history-viewer-v2-product-shape.md still maps behavior to old WPs.

Required Pass-G correction:

~~~text
remove WP-09..WP-38 execution traceability
→ reference new compact mini-project/issues
~~~

## Live SQL engine status is stale

live-sql-query-execution.md says the concrete browser engine is still an engineering decision.

Current project evidence has already selected/pinned DuckDB-Wasm.

Required correction.

## Decision chain contains mutually incompatible accepted statements

Examples:

~~~text
D-027
fixed eight-horizon wide schema

KISS reset / E5-E6
evidence-selected persisted enrichment only
~~~

~~~text
D-039
mandatory advanced preemption

KISS reset
advanced preemption only if mixed-load evidence requires it
~~~

~~~text
D-041/D-042
future-upgrade framework + frozen 42-WP graph mandatory

KISS reset
future-only + compact graph rebuilt from scratch
~~~

These cannot remain concurrently accepted when implementation starts.

Pass G must explicitly mark older decisions superseded/amended, not merely add newer docs nearby.

---

# 15. Minimal durable decision set after reconciliation

The initial V2 should be explainable with a much smaller durable decision set:

~~~text
A. Browser-only DuckDB-Wasm/OPFS
B. one SQL Worker/runtime authority
C. same V1 collector + atomic raw/current/history persistence
D. Viewer uses small trusted SQL reads
E. three surfaces: Current, Detail/History, Scanner
F. Scanner is read-only, one-at-a-time, deterministic enough, no hidden semantics
G. one exclusive Web Lock prevents two writers
H. representative daily workload must pass
I. fresh explicit SQL cutover, old release retained for rollback
J. no silent storage deletion/reset
~~~

Everything else is implementation detail, conditional evidence-driven work, or future scope.

---

# 16. Actions required later in Pass G

Pass G should:
1. amend/update product docs;
2. mark D-027/D-028/D-029/D-034/D-037/D-038/D-039/D-041/D-042 superseded or replace them with compact successor decisions;
3. amend D-025 engine status;
4. simplify D-030/D-032/D-036/D-040 wording;
5. amend D-035 shadow wording;
6. preserve D-026/D-031/D-033/D-043 core meaning;
7. rebuild decision relationships so no accepted decision points at the obsolete 42-WP graph;
8. run a guard that fails if current product/decision docs still claim the old graph is canonical.

---

# 17. Audit result

The post-KISS decision layer is salvageable without discarding the research.

The durable product and integrity principles are mostly correct.

The main over-engineering resides in:

~~~text
fixed enrichment physical design
query-version/scheduler machinery
strict performance thresholds
mandatory shadow/archive/preemption
generalized future upgrade lifecycle
42-package execution freeze
~~~

Those must be removed or demoted before the compact canonical implementation plan is materialized.