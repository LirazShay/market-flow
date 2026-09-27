# Browser SQL V2 — Compact Post-KISS Execution DAG

## Role

This document defines the exact compact implementation graph derived from the post-KISS synthesis.

It replaces the provisional ND-01..ND-33 graph as the **planning input** for later GitHub materialization.

It is still planning-only:
- no product/runtime implementation;
- no successor GitHub Issues created yet;
- no old #20..#71 Issues retired yet.

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

The compact initial-V2 graph has **11 mandatory executable nodes**.

~~~text
C01  Real-origin DuckDB L-1

C02  Minimum SQL runtime + schema
C03  Atomic persistence + reopen/durability
C04  Recorder integration + trusted reads
C05  Current/Detail V1 parity + L-2

C06  Real analytical SQL + day-sized measurement

C07  Scanner core
C08  Scanner UI/results/integration

C09  Exclusive Web Lock ownership

C10  Representative daily mixed workload

C11  Final live verification + cutover/rollback/cleanup
~~~

Existing completed Issues #29/#30 are evidence inputs, not new graph nodes.

No mandatory checkpoint-only node exists.

---

# 2. C01 — Real-origin DuckDB L-1

## Purpose

Prove the selected pinned Browser SQL runtime works on the authenticated Leumi origin before the implementation depends heavily on it.

## Inputs
- completed #29 engine pin/manifest evidence;
- completed #30 synthetic Worker/Wasm/OPFS/reopen probe;
- existing L-1 probe/runbook assets.

## Scope
- injected runtime executes;
- Blob Worker works;
- exact pinned Worker/Wasm loads;
- OPFS probe DB opens;
- synthetic write/commit succeeds;
- minimum selected durability/reopen behavior succeeds;
- probe-owned cleanup;
- sanitized machine PASS/FAIL.

## Explicitly not included
- Web Locks;
- provider requests;
- production schema;
- Viewer;
- Scanner.

## Size review

Small. Keep as one Issue.

---

# 3. C02 — Minimum SQL runtime + schema

## Purpose

Create the smallest production-shaped SQL authority that can receive later cycle persistence.

## Scope
- one Runtime Controller / SQL Worker boundary;
- deterministic runtime/build/asset identity;
- minimum DB identity;
- minimum schema/build compatibility identity;
- minimal raw/current/history schema;
- stable cycle/snapshot ordering identity;
- startup/preflight/readiness needed to open the DB;
- explicit unsupported-schema refusal;
- no silent destructive reset;
- minimal runtime/storage health.

## Non-scope
- provider integration;
- cycle persistence implementation beyond schema/runtime primitives;
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
- one transaction for current/history/latest coherence;
- failure before commit leaves prior state only;
- raw MapHeat/Security/value preservation;
- dynamic-universe add/remove behavior;
- reopen same DB;
- minimum proven durable-success acknowledgement boundary;
- retry/idempotency mechanism only if the chosen boundary actually needs it;
- storage/write failure is explicit and never reported as successful persistence.

## Non-scope
- normal Leumi Recorder wiring;
- Viewer reads;
- persisted enrichment;
- archive/rollover.

## Size review

Medium-to-large but cohesive: this is the core storage correctness boundary. Do not split into checkpoint-only Issues.

---

# 5. C04 — Recorder integration + trusted reads

## Purpose

Connect the proven V1 collection path to SQL and expose the small semantic read surface needed by the product.

## Scope
- preserve V1 MapHeat2 → sequential GetSecuritiesData → complete validation;
- normal Recorder hands one validated cycle to SQL;
- Recorder success follows the selected SQL durable-success contract;
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

Medium. Write-path integration and semantic reads meet at the SQL authority boundary, so keeping them together avoids an artificial intermediate checkpoint.

---

# 6. C05 — Current/Detail V1 parity + L-2

## Purpose

Deliver the first usable V2 product slice before analytical features.

## Scope
- Current Universe backed by trusted SQL reads;
- Security Detail/History backed by trusted SQL reads;
- Current→Detail navigation;
- reload/missed-notification authoritative reread;
- deterministic Current behavior preserved where intended;
- bounded newest-first Detail history;
- equal-timestamp-safe pagination;
- no duplicate/skip;
- security leaves current universe but historical detail remains meaningful;
- compact deterministic V1 parity scenario families;
- one bounded self-verifying authenticated L-2:
  - real provider flow;
  - exact complete-cycle accounting;
  - validated data reaches SQL;
  - committed facts read back;
  - no session/auth leakage.

## Why Current + Detail remain one Issue

They are the two halves of one product milestone:

~~~text
the existing V1 browsing product works from SQL
~~~

Splitting them would require another parity/checkpoint coordination Issue or duplicate shared Viewer bridge work.

Implementation may still use multiple commits/substeps inside the Issue.

## Size review

Large but coherent. If code inspection during implementation proves it genuinely too large, it may split by surface, but no standalone 'checkpoint Issue' should be introduced.

---

# 7. C06 — Real analytical SQL + day-sized measurement

## Purpose

Use the SQL history directly before deciding that any persisted analytical optimization is needed.

## Scope
- define a small set of real useful analytical queries;
- include representative short-horizon/cross-security/history/group/ranking use cases as actually needed;
- run them against representative day-sized synthetic history;
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
- activation of conditional O1 with one narrowly defined optimization.

## Size review

Medium. This is analysis through executable SQL/benchmark evidence, not a generic benchmark framework.

---

# 8. C07 — Scanner core

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
- query replacement attribution when prior query is still finishing;
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

# 9. C08 — Scanner UI/results/integration

## Purpose

Expose C07 as the actual third product surface.

## Scope
- SQL editor;
- interval control;
- Activate;
- active/draft/status visibility;
- truthful result grid;
- SQL result column/order fidelity;
- common value types including BigInt-safe display;
- NULL vs zero truthfulness;
- clear zero-row success;
- clear query error;
- truthful bounded rendering/truncation if UI shows only part of a materialized result;
- last successful result may remain visibly previous/stale after a later error within one runtime;
- optional canonical SecurityId drill-down to shared Detail;
- Scanner isolation regressions.

## Non-scope
- generic data-grid product;
- full result-export platform;
- streaming unless conditional O3 activates.

## Size review

Medium. Keep separate from C07 because engine/security behavior and UI/result rendering have distinct browser-test surfaces.

---

# 10. C09 — Exclusive Web Lock ownership

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

Real-origin two-tab ownership is not performed here as an early blocker; C11 owns final real-origin ownership verification.

## Size review

Small-to-medium. One focused Issue.

---

# 11. C10 — Representative daily mixed workload

## Purpose

Prove the shipped shape behaves like a reliable daily local tool.

## Preconditions

Must use the actual selected product shape:
- C05 V1 browsing product;
- C06 selected real analytical query set;
- C08 Scanner;
- C09 ownership;
- O1/O2/O3/O4 if any of those conditionals were activated and change the candidate.

## Scope
- deterministic day-shaped history/workload;
- normal collector cadence;
- SQL persistence;
- Current/Detail reads;
- repeated representative Scanner query;
- no growing persistence backlog;
- no Scanner overlap;
- practical responsiveness;
- stable-enough memory;
- storage growth understood;
- reopen after accumulated data;
- explicit errors rather than corruption/silent loss.

## Decision outputs

C10 may activate:
- O2 advanced Scanner resource hardening;
- O4 storage/fresh-DB workflow;
- O5 target-Windows-specific evidence.

Any activated candidate-changing branch must rejoin and **rerun C10 affected verification** before C11.

## Size review

Medium. It is an integrated proof Issue, but unlike the old checkpoint Issues it owns real workload implementation/test artifacts and concrete decisions.

---

# 12. C11 — Final live verification + cutover/rollback/cleanup

## Purpose

Verify the final candidate on authenticated Leumi and switch authority explicitly.

## Preconditions
- Fast CI green;
- full Browser CI green;
- C10 final candidate green;
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
- generic upgrade platform.

## Size review

Medium-to-large but one release operation. Splitting verification from cutover would create another gate-only Issue with little value.

---

# 13. Direct mandatory dependency table

Only direct executable blockers belong in the canonical graph.

| Node | Direct predecessor(s) | Classification | Why |
|---|---|---|---|
| C01 | completed #29, #30 evidence | HARD-TECH | real-origin premise depends on the pinned/probe artifacts already built |
| C02 | C01 | HARD-TECH | do not build production Browser SQL around an unverified real-origin delivery premise |
| C03 | C02 | HARD-TECH | persistence needs the actual runtime/schema |
| C04 | C03 | HARD-TECH | Recorder/read API needs coherent persisted SQL state |
| C05 | C04 | HARD-PRODUCT | first prove the existing browsing product on the new authority |
| C06 | C05 | HARD-PRODUCT | analytical optimization starts only after V1-on-SQL product parity |
| C07 | C05 | HARD-PRODUCT | Scanner starts only after the existing product is usable on SQL |
| C08 | C07 | HARD-TECH | UI/result surface depends on stable Scanner core contracts |
| C09 | C02 | HARD-TECH | ownership gating needs production-shaped runtime identity/startup boundary, but not finished persistence/Viewer/Scanner |
| C10 | C05, C06, C08, C09, activated candidate-changing conditionals | HARD-PRODUCT | daily workload must exercise the actual shipped shape |
| C11 | C10 | HARD-PRODUCT | cutover only follows final integrated daily evidence |

No other direct mandatory edges should be encoded.

---

# 14. Parallel work fronts

## After C02

~~~text
C03 persistence work
and
C09 Web Lock ownership work
~~~

may proceed in parallel.

C09 must converge by C10, not block every intermediate feature.

## After C05

~~~text
C06 real analytical SQL
and
C07 Scanner core
~~~

may proceed in parallel.

This is intentional.

The Scanner does not require precomputed enrichment, and C06 does not require the Scanner UI.

## After C07

C08 can proceed while C06 finishes if needed.

Final convergence is C10.

---

# 15. Soft coordination, not blockers

Do not encode these as GitHub blockers:

- C06 may inform Scanner default/example SQL/help text;
- C09 ownership diagnostics may later appear in Viewer health;
- C03 storage errors may inform C05/C08 display wording;
- C06 query shapes may influence C08 demo/default query;
- C10 may suggest minor UI/status tuning before C11.

These are normal implementation coordination, not dependency edges.

---

# 16. Conditional O1 — Targeted analytical optimization

## Trigger

C06 proves a real important query is materially too slow/awkward with the simple raw/history design.

## Scope

Exactly one justified optimization at a time, selected from the smallest viable option:
- SQL rewrite;
- verified typed source field;
- targeted engine/schema optimization;
- predecessor reference;
- persisted derived metric.

## Rejoin

~~~text
C06 trigger
→ O1 implement + focused correctness/benchmark
→ C10 uses the optimized candidate
~~~

If O1 changes a surface already covered by C07/C08 tests, rerun those affected tests; do not invent a new checkpoint.

---

# 17. Conditional O2 — Advanced Scanner resource hardening

## Trigger

C10 shows Scanner materially harms ingest or creates unacceptable backlog, and simpler query/schema/interval remedies are insufficient.

## Possible scope

Only the smallest proven mechanism, potentially:
- separate analytics connection;
- cancellation;
- abort/recycle;
- Worker recovery as last resort.

## Rejoin

~~~text
C10 failure/evidence
→ O2
→ rerun affected Scanner correctness
→ rerun C10
~~~

No standing O2 Issue exists before the trigger.

---

# 18. Conditional O3 — Streaming/chunked result delivery

## Trigger

C08 or C10 proves simple result materialization is unsafe/unusable for representative queries.

## Rejoin

~~~text
evidence
→ O3 smallest streaming/chunked mechanism
→ rerun C08 affected result tests
→ rerun C10 if resource behavior changed
~~~

No hidden SQL LIMIT is an acceptable substitute.

---

# 19. Conditional O4 — Storage/export/fresh-DB workflow

## Trigger

C10 proves retain-all cannot support the required normal daily operating shape safely.

## First solution

Prefer the simplest explicit workflow:

~~~text
export/download if desired
→ stop runtime
→ explicitly start a fresh DB
~~~

Do not jump directly to automatic epoch/journal rollover.

## Rejoin

Any shipped storage-lifecycle change must rerun C10 before C11.

---

# 20. Conditional O5 — Target Windows/Chrome evidence

## Trigger

C10/Chromium evidence is insufficient for a material target-environment performance/browser conclusion.

## Scope

Run only the affected representative workload on the target environment.

## Rejoin

Must be green before C11 if it was activated as a release-confidence requirement.

---

# 21. Conditional O6 — Shadow comparison

## Trigger

C05 cannot resolve one specific material live migration/provider parity uncertainty using deterministic parity + bounded L-2.

## Scope

Temporary same-cycle comparison only for the named uncertainty.

## Rejoin

~~~text
C05 evidence gap
→ O6 temporary shadow
→ resolve question
→ remove/retire temporary shadow path
→ rerun affected C05 proof
~~~

Shadow never becomes production authority or a normal cutover step.

---

# 22. Effective compact DAG

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
  C03              C09
   │                │
   ▼                │
  C04               │
   │                │
   ▼                │
  C05               │
 ┌─┴───────┐        │
 ▼         ▼        │
C06       C07       │
 │          │        │
[O1?]      ▼        │
 │         C08      │
 └────┬─────┴────────┘
      ▼
     C10
 [O2/O3/O4/O5?]
      │
   rerun C10
      │
      ▼
     C11

O6, if triggered, branches from C05 and returns to C05.
~~~

---

# 23. Critical path

Without activated conditionals, the product critical path is:

~~~text
C01
→ C02
→ C03
→ C04
→ C05
→ C07
→ C08
→ C10
→ C11
~~~

C06 runs in parallel with C07/C08 after C05.

C09 runs in parallel from C02 and rejoins at C10.

This is intentionally shorter than the provisional ND graph.

---

# 24. Why C06 is not a Scanner blocker

The product principle is:

~~~text
existing V1 product first
→ analytical features second
~~~

That requires both C06 and C07 to wait for C05.

It does **not** require:

~~~text
finish analytical optimization study
→ only then start Scanner engine
~~~

The Scanner can execute ordinary raw/history SQL while C06 determines whether any query deserves physical optimization.

Therefore C06 → C07 is deliberately **not** a hard edge.

---

# 25. Why C09 is not a Recorder/Viewer blocker

Web Lock ownership is mandatory before production daily operation, but basic SQL persistence and Viewer behavior can be built/tested deterministically without making every step wait for final ownership integration.

Therefore:

~~~text
C02 → C09
and
C09 → C10
~~~

rather than:

~~~text
C09 → C03/C04/C05
~~~

This keeps correctness while avoiding unnecessary serialization.

---

# 26. No checkpoint-only Issues

Old nodes such as:
- SQL-authority checkpoint;
- analytical-engine checkpoint;
- Scanner product checkpoint;
- integrated runtime checkpoint;
- capacity checkpoint;

are not successor Issues.

The verification belongs to the Issue that owns the actual product/runtime work.

Example:

~~~text
C03 implementation
→ its Chromium/storage verification
→ complete
~~~

not:

~~~text
C03 implementation
→ separate checkpoint Issue
~~~

---

# 27. Issue-size review

| Node | Size | Decision |
|---|---|---|
| C01 | small | keep one Issue |
| C02 | medium | keep one Issue |
| C03 | medium-large | keep one Issue; core atomicity boundary is cohesive |
| C04 | medium | keep one Issue |
| C05 | large-cohesive | keep one Issue initially; split only if code inspection proves it unwieldy |
| C06 | medium | keep one Issue |
| C07 | medium | keep one Issue |
| C08 | medium | keep one Issue |
| C09 | small-medium | keep one Issue |
| C10 | medium | keep one Issue because it owns real workload artifacts/decisions |
| C11 | medium-large | keep one release Issue; avoid gate-only cutover split |

Result:

~~~text
11 mandatory Issues
+ 0..N conditional Issues created only by evidence
~~~

No target count should override these natural boundaries.

---

# 28. Mini-project grouping for navigation

For GitHub navigation, do not recreate eight technical Epics.

Recommended small parent grouping:

~~~text
P1 — Feasibility + SQL Core
     C01 C02 C03

P2 — V1 Product on SQL
     C04 C05

P3 — Analytics + Scanner
     C06 C07 C08

P4 — Daily Readiness + Cutover
     C09 C10 C11
~~~

Four product-flow parent Issues are enough.

Conditional work links directly to the triggering executable Issue and does not need its own standing Epic.

---

# 29. GitHub materialization rule

When the graph is materialized later:
- create one new compact Master;
- create at most four navigation parent Issues P1..P4;
- create C01..C11 executable Issues;
- include only **direct** dependency references from section 13;
- use old #29/#30 as evidence links, not parents;
- link old Issue predecessors only as historical context, not blockers;
- do not create O1..O6 unless triggered;
- no Milestone/label dependency is required for correctness.

This yields:

~~~text
1 Master
+ 4 small parents
+ 11 executable Issues
~~~

which is intentionally much smaller and easier to navigate than:

~~~text
1 Master
+ 8 Epics
+ 42 WPs
~~~

---

# 30. DAG review result

The compact graph now has:

~~~text
mandatory executable nodes = 11
mandatory checkpoint-only nodes = 0
standing conditional/future nodes = 0
direct mandatory edges = 12
parallel fronts = 2 major fronts
early hard live premise = C01
first usable product = C05
final convergence = C10
release/cutover = C11
~~~

Most importantly, the graph preserves:
- real-origin feasibility before deep dependency on Browser SQL;
- atomicity/data integrity;
- V1 product parity before analytical product work;
- safe Scanner semantics;
- one production owner;
- day-shaped evidence before cutover;

without preserving the old platform-style infrastructure.

---

# 31. Next planning step

Before creating GitHub Issues, turn C01..C11 into concise executable Issue specifications:

~~~text
purpose
scope
non-goals
direct dependencies
public acceptance criteria
tests/verification
security/data-integrity
cleanup
~~~

Then perform one issue-size/dependency critique pass.

Only after that should Pass G materialize the new GitHub graph.