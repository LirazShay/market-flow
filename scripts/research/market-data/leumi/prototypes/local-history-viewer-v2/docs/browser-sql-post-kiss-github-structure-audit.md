# Browser SQL V2 — Post-KISS GitHub Execution-Structure Audit

## Role

This is the seventh post-KISS consistency audit under Issue #72.

Scope:
- Master Issue #20;
- Epic Issues #21..#28;
- old executable WP Issues #29..#71;
- current planning Issue #72;
- ROADMAP / implementation decomposition / GitHub execution map / final planning freeze as they relate to the old graph.

Goal:

~~~text
preserve verified history
without leaving the obsolete 42-WP graph looking like the current implementation plan
~~~

No old Issue is mutated by this audit. This document is the disposition map that Pass G will use after the compact replacement graph is designed and verified.

---

# 1. Overall conclusion

Do **not** rewrite the old 42 Work Issues into the KISS plan.

Reason:

~~~text
their bodies encode the old architecture
+ old dependencies
+ old checkpoints
+ old mandatory mechanisms
~~~

Reusing the Issue numbers would leave historical comments/evidence mixed with materially different new scope.

Preferred transition:

~~~text
completed old evidence stays closed
→ create a fresh compact Master/mini-project/Issue graph
→ link reusable evidence from old Issues
→ close remaining old graph as superseded
→ close old Epics
→ close old Master last
~~~

This creates one obvious current plan and preserves history cleanly.

---

# 2. Disposition vocabulary

~~~text
HISTORICAL_EVIDENCE
= already completed useful work; leave closed and reference from successors

SUPERSEDE_AFTER_SUCCESSOR
= old open Issue becomes obsolete; close only after replacement owner exists

REMOVE_FROM_INITIAL_V2
= scope is no longer planned for initial V2; no standing successor Issue

CONDITIONAL_ONLY
= create work only if a measured/live trigger occurs

FUTURE_ONLY
= deliberately outside initial V2

CURRENT_PLANNING
= remains open until re-baseline materialization/verification finishes
~~~

---

# 3. Master and Epic disposition

| Issue | Old role | Disposition | Successor meaning |
|---:|---|---|---|
| #20 | Browser SQL implementation Master | SUPERSEDE_AFTER_SUCCESSOR | new compact implementation Master |
| #21 | M1 feasibility/test foundation | SUPERSEDE_AFTER_SUCCESSOR | K1 real-site feasibility + small shared test foundation |
| #22 | M2 SQL authority/OPFS/ingest | SUPERSEDE_AFTER_SUCCESSOR | K2 minimum SQL core + K3 V1-on-SQL product |
| #23 | M3 analytical SQL runtime | SUPERSEDE_AFTER_SUCCESSOR | K5 simple Scanner |
| #24 | M4 runtime delivery/Viewer | SUPERSEDE_AFTER_SUCCESSOR | split naturally across K2/K3/K5/K6 |
| #25 | M5 health/diagnostics/security | SUPERSEDE_AFTER_SUCCESSOR | concerns merged into owning compact Issues; no dedicated Epic required |
| #26 | M6 shadow verification | REMOVE_FROM_INITIAL_V2 / CONDITIONAL_ONLY | no standing Epic; temporary task only if CND-01 triggers |
| #27 | M7 performance/capacity | SUPERSEDE_AFTER_SUCCESSOR | query-specific measurement in K4 + representative daily workload K6 |
| #28 | M8 cutover/cleanup | SUPERSEDE_AFTER_SUCCESSOR | K7 final live verification + explicit cutover/rollback/cleanup |

The eight-Milestone architecture should not survive merely as navigation.

The new parent structure should follow the compact product flow rather than old technical layers.

---

# 4. Completed Issues: preserve evidence, do not reopen

| Issue | WP | Disposition | Reuse |
|---:|---|---|---|
| #29 | WP-01 engine pin/manifest | HISTORICAL_EVIDENCE | exact DuckDB-Wasm/package/core/asset identity and build guards |
| #30 | WP-02 minimal Browser SQL probe | HISTORICAL_EVIDENCE | sanitized Worker/Wasm/OPFS/reopen probe + Chromium regression |
| #65 | duplicate WP-37 | HISTORICAL_EVIDENCE / DUPLICATE | leave closed as duplicate; never make canonical |

#29 and #30 are successful implementation evidence, not obsolete mistakes.

New compact Issues should link them rather than duplicate the work.

---

# 5. Feasibility and test-foundation WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #31 | WP-03 real authenticated L-1 | SUPERSEDE_AFTER_SUCCESSOR | K1 small real-origin Worker/Wasm/OPFS L-1; remove early Web-Lock burden |
| #32 | WP-04 deterministic Chromium harness/fixtures | SUPERSEDE_AFTER_SUCCESSOR | merge only necessary shared fixtures/harness into K2/K3 test work |

Important transition rule for #31:

~~~text
do not close #31
until
new K1 successor references its runbook/probe artifacts and owns the pending live premise
~~~

Otherwise the one current live blocker would temporarily become ownerless.

---

# 6. SQL authority / persistence WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #33 | WP-05 SQL Worker/controller | SUPERSEDE_AFTER_SUCCESSOR | K2 minimum SQL authority |
| #34 | WP-06 OPFS open/reopen | SUPERSEDE_AFTER_SUCCESSOR | K2 atomic persistence/reopen |
| #35 | WP-07 schema version/core schema | SUPERSEDE_AFTER_SUCCESSOR | K2 minimum raw/current/history schema + simple compatibility ID |
| #36 | WP-08 readiness/recovery | SUPERSEDE_AFTER_SUCCESSOR | K2 reopen/readiness; no generalized recovery platform |
| #37 | WP-09 validated-cycle handoff | SUPERSEDE_AFTER_SUCCESSOR | K2 collector contract/handoff |
| #38 | WP-10 staging + typed promotion | SUPERSEDE_AFTER_SUCCESSOR | K2 bulk cycle write; typed promotion only if actual query need |
| #39 | WP-11 atomic persistence/current/latest | SUPERSEDE_AFTER_SUCCESSOR | K2 atomic persistence core |
| #40 | WP-12 temporal links/enrichment | REMOVE_FROM_INITIAL_V2 / CONDITIONAL_ONLY | K4 only if real query proves persisted optimization is needed |
| #41 | WP-13 CHECKPOINT-before-ack/token | SUPERSEDE_AFTER_SUCCESSOR | K2 minimum proven durable-success/retry mechanism only |
| #42 | WP-14 SQL-authority checkpoint | REMOVE AS STANDALONE ISSUE | K2 completion boundary via tests/CI, not a separate checkpoint Issue |

Do not preserve old M2 dependency order.

The successor K2 should be a small coherent storage/runtime slice rather than eight micro-Issues.

---

# 7. Old analytical-runtime WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #43 | WP-15 query definition/version/execution persistence | REMOVE_FROM_INITIAL_V2 as designed | K5 persists only current active SQL/interval |
| #44 | WP-16 SQL safety/hardening | SUPERSEDE_AFTER_SUCCESSOR | K5 Scanner core; strong read-only safety retained |
| #45 | WP-17 streamed execution/result semantics | SUPERSEDE_AFTER_SUCCESSOR | K5 simple execution/result table; streaming conditional |
| #46 | WP-18 anchored scheduler/priority | SUPERSEDE_AFTER_SUCCESSOR | K5 simple no-overlap timer |
| #47 | WP-19 query/scheduler restart recovery | SUPERSEDE_AFTER_SUCCESSOR | K5 load active config + fresh run; no historical scheduler recovery |
| #48 | WP-20 analytical runtime checkpoint | REMOVE AS STANDALONE ISSUE | Scanner completion verified by normal tests/CI |
| #69 | WP-40 cancellation/preemption | CONDITIONAL_ONLY | no standing Issue unless mixed-load evidence proves need |

These Issues are the strongest example of why old bodies should not be rewritten in place: the KISS Scanner is materially smaller than the old M3 architecture.

---

# 8. Runtime / Viewer / product WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #49 | WP-21 deterministic bundling | SUPERSEDE_AFTER_SUCCESSOR | merge into K2 runtime/build work |
| #50 | WP-22 Runtime Controller/preflight/recovery | SUPERSEDE_AFTER_SUCCESSOR | merge into K2 minimum runtime controller |
| #51 | WP-23 Recorder→SQL integration | SUPERSEDE_AFTER_SUCCESSOR | K3 integrated V1-on-SQL path |
| #52 | WP-24 live L-2 provider compatibility | SUPERSEDE_AFTER_SUCCESSOR | K3 bounded L-2 proof |
| #53 | WP-25 Viewer bridge/full state | SUPERSEDE_AFTER_SUCCESSOR | K3 small trusted-read bridge/resync |
| #54 | WP-26 editor activation/OCC | SUPERSEDE_AFTER_SUCCESSOR | K5 simple editor/Activate; remove optimistic collaboration |
| #55 | WP-27 result preview/health | SUPERSEDE_AFTER_SUCCESSOR | K5 result table/status; health kept small |
| #56 | WP-28 Current/history behind SQL | SUPERSEDE_AFTER_SUCCESSOR | K3 Current + Detail/History parity |
| #57 | WP-29 integration checkpoint | REMOVE AS STANDALONE ISSUE | K3 parity/L-2 completion boundary |
| #70 | WP-41 Web Locks ownership | SUPERSEDE_AFTER_SUCCESSOR | K6 simple exclusive one-owner Issue; move live proof near cutover |

K3 should prove the existing product before K5 Scanner work.

That product-first ordering is one of the main purposes of the re-baseline.

---

# 9. Health / security WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #58 | WP-30 scoped health/incidents/debug bundle | SUPERSEDE_AFTER_SUCCESSOR | small health/error behavior merged into K2/K3/K5; no incident subsystem |
| #59 | WP-31 secret/redaction/artifact security | SUPERSEDE_AFTER_SUCCESSOR | cross-cutting static/artifact guards in Fast CI and relevant Issues |

These concerns remain important but do not need their own implementation Epic.

---

# 10. Shadow WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #60 | WP-32 isolated SQL shadow | CONDITIONAL_ONLY | no standing successor; create temporary focused task only if a specific unresolved live ambiguity triggers it |
| #61 | WP-33 shadow comparison/endurance | REMOVE_FROM_INITIAL_V2 as written | conditional shadow evidence if triggered; final live run belongs to K7 |

Do not keep M6 or these Issues open as blockers 'just in case'.

---

# 11. Performance WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #62 | WP-34 generic benchmark harness | SUPERSEDE_AFTER_SUCCESSOR | small query-specific measurement in K4 and/or daily workload utility in K6 |
| #63 | WP-35 mandatory target Windows capacity gates | CONDITIONAL_ONLY / MERGE | K6 representative daily workload; target-Windows lane only if materially needed |

There is no need for a dedicated M7 Epic after KISS.

Performance is evidence attached to the feature/query being decided and one integrated daily-workload proof.

---

# 12. Cutover / cleanup / lifecycle WPs

| Issue | Old WP | Post-KISS disposition | Compact destination |
|---:|---|---|---|
| #64 | WP-36 production cutover | SUPERSEDE_AFTER_SUCCESSOR | K7 explicit fresh SQL cutover |
| #66 | WP-37 rollback/roll-forward/L-3 | SUPERSEDE_AFTER_SUCCESSOR | K7 bounded final live run + simple rollback to old release |
| #67 | WP-38 cleanup/final closure | SUPERSEDE_AFTER_SUCCESSOR | K7 remove temporary scaffolding/docs/final verification |
| #68 | WP-39 archive/rollover | FUTURE_ONLY / CONDITIONAL_ONLY | no standing successor in initial V2 |
| #71 | WP-42 generalized upgrade lifecycle | FUTURE_ONLY | no standing successor in initial V2 |

#65 remains the already-closed duplicate of #66.

---

# 13. Current planning Issue #72

#72 remains CURRENT_PLANNING.

It should stay open through:

~~~text
post-KISS audit synthesis
→ compact execution-graph design
→ durable decision/product/doc reconciliation
→ new GitHub graph materialization
→ old-graph retirement
→ guards
→ fresh-AI dry run
→ final Fast CI
~~~

Only then should #72 close.

Do not turn #72 into an implementation Issue.

---

# 14. Old graph retirement order

Pass G should retire the old graph in this order:

~~~text
1. create and verify compact successor Master/parents/work Issues
2. ensure successor K1 owns pending L-1 and links #29/#30 evidence
3. update decisions/product docs/ROADMAP/testing policy to the new graph
4. update STATUS.json to the new implementation entry point only after planning closes
5. add superseded comments to old open Work Issues with successor links/disposition
6. close old open Work Issues
7. update/close old Epics #21..#28
8. update/close old Master #20 last
9. verify no current docs/guards present the old graph as canonical
10. close #72 after final planning verification
~~~

This avoids a period where the current live blocker or execution plan has no owner.

---

# 15. How to close old Issues

Do not rewrite old bodies into the new plan.

Preferred closure comment shape:

~~~text
Superseded by the post-KISS Browser SQL plan.

Historical rationale/evidence in this Issue remains valid where referenced.

Current implementation owner: #<new issue> / <compact mini-project>

Reason: <one-line scope simplification or deferral>
~~~

For removed/conditional/future scope:

~~~text
Superseded by the post-KISS plan.

No initial-V2 successor is created because this mechanism is now conditional/future-only.

Trigger/reference: <KISS/audit doc section>
~~~

Use the platform's non-planned/superseded closure semantics if supported; the important part is the explicit comment and new graph authority.

---

# 16. Do not recycle old Issue IDs

Why:
- old comments may refer to obsolete dependencies;
- bodies contain obsolete acceptance criteria;
- WP labels/titles imply the old sequence;
- external references may assume old semantics;
- rewriting history makes future RCA harder.

New compact work deserves new Issue IDs.

The only exception would be an Issue whose old scope is materially identical to the successor, and this audit finds no open WP that is clean enough to justify that exception.

Even #44, #51, #56 and #70 contain dependency/acceptance assumptions tied to the old graph.

---

# 17. Old planning-document disposition

## ROADMAP.md

SUPERSEDE/REWRITE in Pass G.

The A..W planning history is valuable, but the current roadmap must become the compact implementation order rather than continuing to advertise completed planning phases and the old handoff.

Historical phase detail should move/remain in cold docs/history.

## browser-sql-implementation-decomposition.md

SUPERSEDE as current implementation decomposition.

Preserve as historical reference under an explicit history/superseded location or banner.

Create a new compact decomposition rather than editing 42 WP sections into unrelated meanings.

## browser-sql-github-execution-structure.md

SUPERSEDE.

Replace current navigation with the new Master/mini-project/Issue graph.

Preserve the old mapping as cold history if needed for evidence links.

## browser-sql-final-planning-freeze.md

SUPERSEDE as current freeze authority.

Preserve as historical proof that the old plan was once deliberately verified.

The new plan needs a new post-KISS final audit/freeze rather than editing history to pretend the old freeze never existed.

---

# 18. STATUS.json cleanup required during materialization

Current STATUS still contains historical live-looking fields such as:
- old 42-WP implementation decomposition marked complete;
- old GitHub execution structure marked complete/canonical-looking;
- old D-042 final planning freeze;
- old WP-03 wording that real-origin Web Locks block WP-05+.

These are historical evidence, but after the new graph exists they must not remain as if they define current execution.

Pass G should compact/remove/archive them from HOT STATUS and retain only:

~~~text
current compact plan identity
current implementation entry pointer
current relevant verification evidence
links to cold historical evidence when needed
~~~

Do not lose #29/#30 evidence; move its durable reference to the correct cold/verification owner.

---

# 19. New graph shape implied by this audit

This audit does not yet finalize Issue count, but the old WPs naturally collapse into roughly:

~~~text
K1  real-site DuckDB premise
K2  minimum SQL core/persistence
K3  Recorder + trusted reads + Current/Detail parity
K4  real analytical SQL / optional targeted optimization
K5  simple Dynamic SQL Scanner
K6  single-owner + representative daily workload
K7  final live run + explicit cutover/rollback/cleanup
~~~

Likely executable Issue count remains in the approximate 10–15 range, possibly fewer if implementation boundaries are naturally larger.

Do not force the earlier 12–18 estimate if KISS analysis supports fewer.

---

# 20. Post-KISS GitHub-structure acceptance test

The repository structure is simple enough when a fresh engineer sees:

~~~text
one current Master
→ a small number of product-flow mini-projects
→ a small set of executable Issues
→ one STATUS pointer
~~~

and the old #20..#71 graph is clearly historical/superseded rather than an alternative current plan.

If a fresh engineer must decide whether #20 or the new Master is authoritative, or whether WP-40/WP-42 are still mandatory, Pass G is not complete.
