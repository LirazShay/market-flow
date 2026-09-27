# Browser SQL V2 — Compact Post-KISS Execution DAG

## Role

This document defines the exact compact implementation graph derived from the post-KISS synthesis and subsequent Issue-boundary critique.

It replaces the provisional ND-01..ND-33 graph and the earlier 11-node compact draft as the planning input for GitHub materialization.

The graph has been materialized in GitHub:

~~~text
Master #85
C01..C12 = #73..#84
~~~

This document remains the durable dependency rationale. GitHub Issue bodies own executable work; live progress belongs only in STATUS.json.

Dependency classes:

~~~text
HARD-TECH
= code/runtime/data dependency; successor cannot work correctly without predecessor output

HARD-PRODUCT
= deliberate product-order boundary; technically possible earlier, but intentionally blocked to protect product-first delivery

SOFT/PARALLEL
= useful coordination or shared knowledge, not an executable blocker

CONDITIONAL
= exists only after an explicit evidence trigger
~~~

---

# 1. Final mandatory node set

The compact initial-V2 graph has **12 mandatory executable nodes**.

~~~text
C01  Real-origin DuckDB L-1
C02  Minimum SQL runtime + schema
C03  Atomic persistence + reopen/durability
C04  Recorder integration + trusted reads

C05  Current Universe SQL parity
C06  Detail/History SQL parity + bounded L-2

C07  Real analytical SQL + day-sized measurement
C08  Scanner core
C09  Scanner UI/results/integration

C10  Exclusive Web Lock ownership
C11  Representative daily mixed workload
C12  Final live verification + cutover/rollback/cleanup
~~~

Existing completed Issues #29/#30 are evidence inputs, not new graph nodes.

No mandatory checkpoint-only node exists.
No standing conditional/future node exists.

---

# 2. C01 — Real-origin DuckDB L-1

## Purpose

Prove the selected pinned Browser SQL runtime works on the authenticated Leumi origin before production SQL implementation depends heavily on it.

## Inputs
- completed #29 engine pin/manifest evidence;
- completed #30 synthetic Worker/Wasm/OPFS/reopen probe;
- existing L-1 probe/runbook assets.

## Scope
- injected runtime executes;
- Blob Worker works;
- exact pinned Worker/Wasm loads;
- OPFS probe DB opens;
- synthetic SQL write + COMMIT succeeds;
- Worker/runtime can close/reopen and read the marker;
- probe-owned cleanup;
- sanitized machine PASS/FAIL.

The existing probe may execute CHECKPOINT as part of its tested sequence, but that is browser-capability evidence only. **C01 does not define production CHECKPOINT cadence or production durable-success policy. C03 owns that decision.**

## Explicitly not included
- Web Locks;
- provider requests;
- production schema;
- Viewer;
- Scanner;
- production persistence cadence.

## Size review

Small. Keep as one Issue.

---

# 3. C02 — Minimum SQL runtime + schema

## Purpose

Create the smallest production-shaped SQL authority that can receive later cycle persistence.

## Scope
- one Runtime Controller / SQL Worker boundary;
- deterministic runtime/build/asset identity;
- one production DB identity;
- simple schema/storage-format compatibility identity; runtime/build identity is recorded separately for traceability and does not itself make a DB incompatible;
- minimal raw/current/history schema;
- stable cycle/snapshot ordering identity;
- startup/preflight/readiness needed to open the DB;
- explicit unsupported schema/storage-format refusal; ordinary runtime build changes do not block startup unless they intentionally change the declared storage compatibility contract;
- no silent destructive reset;
- minimal runtime/storage health.

## Non-scope
- provider integration;
- complete-cycle persistence flow beyond schema/runtime primitives;
- Current/Detail UI;
- Scanner;
- enrichment;
- generic migrations/upgrades.

## Size review

Medium. Natural foundation Issue.

---

# 4. C03 — Atomic persistence + reopen/durability

## Purpose

Prove a validated complete cycle can be stored coherently and survives the supported reopen/restart boundary.

## Scope
- validated-cycle bulk handoff contract;
- defensive SQL-side completeness/shape checks where useful;
- one transaction for coherence of the selected current/history authority structures; a separate latest/current lookup is maintained only if C02 selected one as necessary;
- failure before commit leaves prior state only;
- raw MapHeat/Security/value preservation;
- dynamic-universe add/remove behavior;
- reopen same DB;
- minimum proven durable-success acknowledgement boundary;
- retry/idempotency mechanism only if the chosen boundary actually creates committed-but-unacknowledged retry ambiguity;
- storage/write failure is explicit and never reported as successful persistence.

## Non-scope
- normal Leumi Recorder wiring;
- Viewer reads;
- persisted enrichment;
- archive/rollover;
- generic durability/checkpoint framework.

## Size review

Medium-to-large but cohesive: this is the core storage-correctness boundary. Do not split it into checkpoint-only Issues.

---

# 5. C04 — Recorder integration + trusted reads

## Purpose

Connect the proven V1 collection path to SQL and expose the small semantic read surface needed by the product.

## Scope
- preserve V1 MapHeat2 → sequential GetSecuritiesData → complete validation;
- normal Recorder hands one validated complete cycle to SQL;
- Recorder success follows C03's durable-success contract;
- small trusted read API:
  - getCurrentUniverse;
  - getSecurityCurrent;
  - getSecurityHistoryPage;
  - readiness/health;
- committed-only visibility;
- stable bounded history ordering/cursor behavior;
- distinguish unknown vs not-current where required;
- notification/resync contract: notification is hint, read is authority.

## Non-scope
- Current/Detail rendering/parity itself;
- Scanner;
- analytical optimization.

## Size review

Medium. Write-path integration and semantic reads meet at the SQL-authority seam, so keeping them together avoids an artificial intermediate checkpoint.

---

# 6. C05 — Current Universe SQL parity

## Purpose

Move the Current Universe browsing surface to trusted SQL reads while preserving intentional V1 public behavior.

## Scope
- Current Universe reads SQL through the trusted API;
- current membership follows the latest committed validated universe;
- preserve intended values, sort behavior and missing/zero rendering;
- open-after-existing-data and reload reread authoritative SQL state;
- missed notifications do not make cached UI state authoritative;
- Current remains independent of Scanner state/errors;
- row selection/navigation emits only the canonical SecurityId needed by Detail.

## Non-scope
- Detail/History implementation;
- live L-2 provider proof;
- Scanner;
- enrichment.

## Size review

Medium. Current already has its own substantial module and Chromium suite.

---

# 7. C06 — Detail/History SQL parity + bounded L-2

## Purpose

Move Security Detail/History to trusted SQL reads, close the existing V1 browsing-product migration, and prove the real provider→SQL→read path once.

## Scope
- Detail/History reads SQL through the trusted API;
- newest-first bounded history paging;
- equal-timestamp-safe continuation with no duplicate/skip;
- detail remains meaningful for known history when the security is no longer current;
- reload/open-after-existing-data/missed-notification rereads authority;
- integrated Current→Detail navigation check once Current exists;
- compact V1 parity scenarios for Detail/history/Viewer lifecycle;
- bounded self-verifying authenticated L-2:
  - real provider flow;
  - exact complete-cycle accounting;
  - validated data reaches SQL;
  - committed facts read back through trusted reads;
  - no session/auth leakage.

## Non-scope
- Current implementation itself;
- Scanner;
- persisted horizon schema;
- shadow unless one specific material ambiguity triggers it.

## Size review

Medium-to-large but cohesive. Detail/history is a distinct existing surface; L-2 closes the V1-on-SQL browsing phase without creating a checkpoint-only Issue.

---

# 8. C07 — Real analytical SQL + day-sized measurement

## Purpose

Use SQL history directly before deciding that any persisted analytical optimization is needed.

## Scope
- define a small set of real useful analytical queries;
- include representative short-horizon/cross-security/history/group/ranking use cases as needed;
- run them against representative day-sized deterministic history;
- record correctness and practical latency;
- identify useful typed source fields if raw JSON is ergonomically/performance-costly;
- conclude explicitly:

~~~text
dynamic SQL is sufficient
or
one specific optimization is required
~~~

## Output

Either:
- no schema optimization;
or
- activate conditional O1 with one narrowly defined optimization.

## Size review

Medium. This is analysis through executable SQL/measurement evidence, not a generic benchmark framework.

---

# 9. C08 — Scanner core

## Purpose

Implement the minimum safe repeating SQL engine.

## Scope
- draft SQL + interval;
- explicit Activate;
- one active SQL/interval;
- persist current active config only;
- parser/engine-backed read-only safety;
- representative allowed/blocked SQL corpus;
- committed-state reads;
- one execution at a time;
- simple no-overlap timer;
- no burst replay;
- query replacement attribution when a prior query is still finishing;
- zero rows = success;
- query errors are isolated;
- fresh active-query run after runtime restart.

## Non-scope
- rich editor/grid UX;
- immutable query history;
- collaboration/OCC;
- mandatory streaming;
- advanced cancellation/preemption.

## Size review

Medium. Core correctness/security is cohesive.

---

# 10. C09 — Scanner UI/results/integration

## Purpose

Expose C08 as the third product surface.

## Scope
- SQL editor;
- interval control;
- Activate;
- active/draft/status visibility;
- truthful result grid;
- SQL result column/order fidelity;
- common result types including BigInt-safe display;
- NULL vs zero truthfulness;
- clear zero-row success;
- clear query error;
- truthful bounded rendering/truncation if the UI shows only part of a materialized result;
- previous successful result may remain visibly previous/stale after a later error within one runtime;
- optional canonical SecurityId drill-down to shared Detail;
- Scanner isolation regressions.

## Non-scope
- generic data-grid product;
- result-export platform;
- streaming unless conditional O3 activates.

## Size review

Medium. Keep separate from C08 because engine/security behavior and UI/result rendering have distinct browser-test surfaces.

---

# 11. C10 — Exclusive Web Lock ownership

## Purpose

Ensure only one independent same-origin tab owns production Worker/DB/Recorder.

## Scope
- stable exclusive Web Lock;
- same-tab local singleton reuse;
- owner may start production Worker/DB/Recorder;
- non-owner stays passive;
- owner close releases browser lock;
- later owner runs normal readiness/reopen before recording;
- no heartbeat authority;
- no steal:true;
- no localStorage/IndexedDB election fallback;
- Chromium multi-page ownership tests.

## Live proof

Real-origin two-tab ownership is not performed here as an early blocker; C12 owns final real-origin ownership verification.

## Size review

Small-to-medium. One focused Issue.

---

# 12. C11 — Representative daily mixed workload

## Purpose

Prove the shipped shape behaves like a reliable daily local tool.

## Preconditions

Must use the actual selected product shape:
- C07 representative analytical query set and any selected O1 optimization;
- C09 Scanner;
- C10 ownership;
- any activated candidate-changing O2/O3/O4 mechanism.

## Scope
- deterministic day-shaped history/workload;
- normal collector cadence;
- SQL persistence;
- Current/Detail reads;
- repeated representative Scanner query;
- selected analytical optimization, if any;
- one-owner runtime behavior;
- record workload parameters and measured latency/memory/storage facts needed for future regression comparison;
- verify explicit errors rather than corruption/silent loss.

## Observable acceptance
- workload parameters are recorded and represent intended normal daily operation;
- every injected provider cycle reaches a terminal state: committed or explicitly failed;
- persistence queue/backlog shows no sustained monotonic growth during the steady-state portion;
- Scanner executions never overlap;
- representative Scanner executions repeatedly complete;
- Current and Detail reads continue to complete during mixed load;
- browser/runtime does not crash or hit OOM;
- storage growth is measured and no quota/storage failure occurs for the required workload;
- accumulated DB closes/reopens and expected committed state is readable;
- measured latency/memory/storage observations are recorded; no universal threshold is invented after seeing results.

If a concrete responsiveness threshold is necessary for release, define it before the deciding run from real product use/baseline evidence.

## Decision outputs

C11 may activate:
- O2 advanced Scanner resource hardening;
- O4 storage/export/fresh-DB workflow;
- O5 target-Windows-specific evidence.

Any activated candidate-changing branch must rejoin and rerun affected C11 verification before C12.

## Size review

Medium. It owns real workload artifacts and evidence-trigger decisions, not a checkpoint-only ceremony.

---

# 13. C12 — Final live verification + cutover/rollback/cleanup

## Purpose

Verify the final candidate on authenticated Leumi and switch authority explicitly.

## Preconditions
- Fast CI green;
- full Browser CI green;
- C11 final candidate green;
- L-1 complete;
- L-2 complete;
- no unresolved material data-integrity/security issue.

## Scope
- bounded self-verifying final live run;
- real collection + SQL commits;
- Current/Detail healthy;
- Scanner healthy when enabled;
- real-origin two-tab ownership proof;
- sanitized machine evidence;
- explicit settled-boundary stop of old IndexedDB Recorder;
- fresh production SQL history start;
- verify first SQL production cycles/reads;
- retain old working release for rollback;
- rollback procedure: stop SQL release, preserve SQL DB, run old release;
- remove temporary migration/probe scaffolding that has no continuing owner;
- final docs/status handoff.

## Non-scope
- IndexedDB history import;
- automatic fallback;
- dual-write rollback;
- generic upgrade platform;
- automatic archive/rollover.

## Size review

Medium-to-large but one bounded release operation. Splitting verification from cutover would create a gate-only Issue.

---

# 14. Direct mandatory dependency table

Only direct executable blockers belong in the canonical graph.

| Node | Direct predecessor(s) | Classification | Why |
|---|---|---|---|
| C01 | completed #29, #30 evidence | HARD-TECH | real-origin premise reuses the pinned/probe artifacts already built |
| C02 | C01 | HARD-TECH | do not build production Browser SQL around an unverified real-origin delivery premise |
| C03 | C02 | HARD-TECH | persistence needs the actual runtime/schema |
| C04 | C03 | HARD-TECH | Recorder/read API needs coherent persisted SQL state |
| C05 | C04 | HARD-TECH | Current depends on trusted SQL reads |
| C06 | C04 | HARD-TECH | Detail/history and L-2 depend on the normal SQL/read path |
| C07 | C05, C06 | HARD-PRODUCT | analytical optimization waits until both existing browsing surfaces are migrated |
| C08 | C05, C06 | HARD-PRODUCT | Scanner work starts after the existing V1 browsing product is complete on SQL |
| C09 | C08 | HARD-TECH | UI/result surface depends on stable Scanner core contracts |
| C10 | C02 | HARD-TECH | ownership gating needs the production-shaped runtime identity/startup boundary |
| C11 | C07, C09, C10, activated candidate-changing conditionals | HARD-PRODUCT | daily workload must exercise the actual shipped shape |
| C12 | C11 | HARD-PRODUCT | cutover only follows final integrated daily evidence |

No other direct mandatory edges should be encoded.

---

# 15. Parallel work fronts

## After C02

~~~text
C03 persistence
||
C10 Web Lock ownership
~~~

may proceed in parallel.

C10 must converge by C11, not block every intermediate feature.

## After C04

~~~text
C05 Current
||
C06 Detail/History + L-2
~~~

may proceed in parallel.

C06 can implement Detail/history independently; its integrated Current→Detail check runs once C05 exists.

## After C05 + C06

~~~text
C07 real analytical SQL
||
C08 Scanner core → C09 Scanner UI/results
~~~

may proceed in parallel.

The Scanner does not require precomputed enrichment, and C07 does not require the Scanner UI.

Final convergence is C11.

---

# 16. Soft coordination, not blockers

Do not encode these as GitHub blockers:
- C06's navigation check may wait for C05 without blocking C06's core implementation;
- C07 may inform Scanner default/example SQL/help text;
- C10 ownership diagnostics may later appear in Viewer health;
- C03 storage errors may inform C05/C06/C09 display wording;
- C11 may suggest minor UI/status tuning before C12.

These are normal implementation coordination, not dependency edges.

---

# 17. Conditional O1 — Targeted analytical optimization

## Trigger

C07 proves a real important query is materially too slow/awkward with the simple raw/history design.

## Scope

Exactly one justified optimization at a time, selected from the smallest viable option:
- SQL rewrite;
- verified typed source field;
- targeted engine/schema optimization;
- predecessor reference;
- persisted derived metric.

## Rejoin

~~~text
C07 trigger
→ O1 implement + focused correctness/measurement
→ C11 uses the optimized candidate
~~~

If O1 changes a Scanner-consumed surface, rerun affected C08/C09 tests; do not invent a new checkpoint.

---

# 18. Conditional O2 — Advanced Scanner resource hardening

## Trigger

C11 shows Scanner materially harms ingest or creates unacceptable backlog, and simpler query/schema/interval remedies are insufficient.

## Possible scope

Only the smallest proven mechanism, potentially:
- separate analytics connection;
- cancellation;
- abort/recycle;
- Worker recovery as last resort.

## Rejoin

~~~text
C11 failure/evidence
→ O2
→ rerun affected Scanner correctness
→ rerun C11
~~~

No standing O2 Issue exists before the trigger.

---

# 19. Conditional O3 — Streaming/chunked result delivery

## Trigger

C09 or C11 proves simple result materialization is unsafe/unusable for representative queries.

## Rejoin

~~~text
evidence
→ O3 smallest streaming/chunked mechanism
→ rerun C09 affected result tests
→ rerun C11 if resource behavior changed
~~~

No hidden SQL LIMIT is an acceptable substitute.

---

# 20. Conditional O4 — Storage/export/fresh-DB workflow

## Trigger

C11 proves retain-all cannot support the required normal daily operating shape safely.

## First solution

Prefer the simplest explicit workflow:

~~~text
export/download if desired
→ stop runtime
→ explicitly start a fresh DB
~~~

Do not jump directly to automatic epoch/journal rollover.

## Rejoin

Any shipped storage-lifecycle change must rerun C11 before C12.

---

# 21. Conditional O5 — Target Windows/Chrome evidence

## Trigger

C11/Chromium evidence is insufficient for a material target-environment performance/browser conclusion.

## Scope

Run only the affected representative workload on the target environment.

## Rejoin

Must be green before C12 if activated as a release-confidence requirement.

---

# 22. Conditional O6 — Shadow comparison

## Trigger

C06 cannot resolve one specific material live migration/provider parity uncertainty using deterministic parity + bounded L-2.

## Scope

Temporary same-cycle comparison only for the named uncertainty.

## Rejoin

~~~text
C06 evidence gap
→ O6 temporary shadow
→ resolve question
→ remove/retire temporary shadow path
→ rerun affected C06 proof
~~~

Shadow never becomes production authority or a normal cutover step.

---

# 23. Effective compact DAG

~~~text
completed evidence
#29 + #30
     │
     ▼
    C01
     │
     ▼
    C02
   ┌─┴──────────────┐
   ▼                ▼
  C03              C10
   │                │
   ▼                │
  C04               │
 ┌─┴────────┐        │
 ▼          ▼        │
C05        C06       │
 └──┬────┬──┘        │
    │    │           │
    ▼    ▼           │
   C07  C08          │
   │      │           │
 [O1?]    ▼           │
   │     C09          │
   └──┬───┴───────────┘
      ▼
     C11
 [O2/O3/O4/O5?]
      │
   rerun C11
      │
      ▼
     C12

O6, if triggered, branches from C06 and returns to C06.
~~~

---

# 24. Critical path

Without activated conditionals, the longest mandatory product path is:

~~~text
C01
→ C02
→ C03
→ C04
→ C05/C06
→ C08
→ C09
→ C11
→ C12
~~~

C05 and C06 are parallel.
C07 runs in parallel with C08/C09 after C05+C06.
C10 runs in parallel from C02 and rejoins at C11.

---

# 25. Why C07 is not a Scanner blocker

The product principle is:

~~~text
existing V1 product first
→ analytical features second
~~~

That requires C07 and C08 to wait for both C05 and C06.

It does **not** require:

~~~text
finish analytical optimization study
→ only then start Scanner engine
~~~

The Scanner can execute ordinary raw/history SQL while C07 determines whether any query deserves physical optimization.

Therefore C07 → C08 is deliberately not a hard edge.

---

# 26. Why C10 is not a Recorder/Viewer blocker

Web Lock ownership is mandatory before production daily operation, but basic SQL persistence and Viewer behavior can be built/tested deterministically without making every step wait for final ownership integration.

Therefore:

~~~text
C02 → C10
and
C10 → C11
~~~

rather than:

~~~text
C10 → C03/C04/C05/C06
~~~

---

# 27. No checkpoint-only Issues

Verification belongs to the Issue that owns the actual product/runtime work.

Examples of old checkpoint concepts that do not become successor Issues:
- SQL-authority checkpoint;
- analytical-engine checkpoint;
- Scanner product checkpoint;
- integrated runtime checkpoint;
- capacity checkpoint.

---

# 28. Issue-size review

| Node | Size | Decision |
|---|---|---|
| C01 | small | keep one Issue |
| C02 | medium | keep one Issue |
| C03 | medium-large | keep one cohesive atomicity Issue |
| C04 | medium | keep Recorder + trusted reads together |
| C05 | medium | separate Current surface |
| C06 | medium-large | separate Detail/History + L-2 surface |
| C07 | medium | one real-query/measurement Issue |
| C08 | medium | Scanner core |
| C09 | medium | Scanner UI/results |
| C10 | small-medium | focused ownership Issue |
| C11 | medium | real integrated workload work, not a gate-only Issue |
| C12 | medium-large | bounded release operation; keep together |

---

# 29. GitHub materialization shape

Materialized structure:

~~~text
1 compact Master Issue #85
+ 12 executable Issues C01..C12 = #73..#84
+ 0 standing conditional/future Issues
~~~

The Master body groups children under four headings only:

~~~text
Feasibility + SQL Core
V1 Product on SQL
Analytics + Scanner
Daily Readiness + Cutover
~~~

Conditional O1..O6 Issues are created only if evidence triggers them.

Old #29/#30 remain completed evidence links, not new children/blockers.

---

# 30. Fresh-chat rule for every materialized executable Issue

Each C01..C12 Issue must include:

~~~text
Before implementation, read the current versions of the directly touched code/tests/specs.
Do not preload historical Browser SQL planning documents unless a linked uncertainty requires them.
~~~

This keeps implementation aligned with the repository HOT/WARM/COLD context policy.

---

# 31. Execution handoff

The graph is materialized. Use `browser-sql-github-execution-structure.md` for Issue numbers and `STATUS.json` for the current pointer.

Do not create navigation-only parent Issues or placeholder conditional Issues.