# Browser SQL V2 — Compact Issue Critique

## Role

This is the deliberate adversarial review of the draft C01..C11 execution graph and Issue specifications before GitHub materialization.

Goal:

~~~text
try to break the compact plan now
rather than discover after Issue creation that it still contains
giant Issues, artificial blockers, vague acceptance or navigation bureaucracy
~~~

This review is planning-only. It does not yet rewrite the DAG/specification documents; the next planning step applies the accepted corrections.

---

# 1. Overall verdict

The compact plan is fundamentally sound, but it still has several correctable defects.

Most important findings:

1. C05 is too large because Current and Detail/History are genuinely separate implementation/test surfaces in the existing codebase.
2. C10 currently contains a redundant direct dependency on C05.
3. four navigation-only parent Issues P1..P4 do not earn their administrative cost after the KISS reset.
4. C01 wording risks accidentally turning the current probe CHECKPOINT behavior into a production durability requirement.
5. C03 acceptance makes retry/idempotency sound mandatory even though the plan says it is evidence-dependent.
6. C10 contains a few subjective performance phrases that need observable closure criteria.
7. some direct-dependency counts in the DAG summary are stale/inaccurate.

None of these findings requires re-expanding the architecture.

---

# 2. Evidence from the current codebase

The current Viewer is already split into substantial independent surfaces:

~~~text
viewer/current-table.js       ~22 KB
viewer/security-detail.js     ~34 KB
viewer/bootstrap.js           ~24 KB
viewer/history-data.js        ~6 KB
viewer/live-refresh.js        ~8 KB
~~~

Existing Chromium coverage is similarly separated:

~~~text
viewer-current-table.spec.js
viewer-security-detail.spec.js
viewer-history-data.spec.js
viewer-live-refresh.spec.js
viewer-recovery.spec.js
~~~

This is concrete evidence that Current and Detail/History are natural implementation/test boundaries rather than an artificial split.

Therefore the plan should not preserve C05 as one large Issue merely to keep the Issue count at 11.

---

# 3. Finding A — split old C05

## Problem

Draft C05 owns all of:
- Current Universe;
- Detail/History;
- navigation between them;
- Viewer lifecycle parity;
- six parity scenario families;
- authenticated L-2.

That is the largest implementation surface in the compact graph.

It also combines two separately testable UI/data surfaces with the final real-provider proof.

## Decision

Split it into two real product Issues, **without creating a checkpoint-only Issue**.

Revised shape:

~~~text
C05  Current Universe SQL parity
C06  Detail/History SQL parity + bounded L-2 provider proof
~~~

Both depend directly on C04 and may be implemented in parallel.

C06 owns the integrated Current→Detail navigation check once both surfaces exist, but does not block its implementation on C05.

Post-V1 analytical work waits for **both** C05 and C06.

## Why this is not a return to over-decomposition

The split is justified by:
- separate production modules;
- separate public behaviors;
- separate existing browser tests;
- independent development/debugging surfaces;
- real ability to work in parallel.

No extra checkpoint Issue is introduced.

---

# 4. Revised numbering after the split

To keep execution IDs chronological and avoid letter suffixes, renumber the later nodes:

~~~text
C01  Real-origin DuckDB L-1
C02  Minimum SQL runtime + schema
C03  Atomic persistence + reopen/durability
C04  Recorder integration + trusted reads
C05  Current Universe SQL parity
C06  Detail/History SQL parity + L-2
C07  Real analytical SQL + day-sized measurement
C08  Scanner core
C09  Scanner UI/results/integration
C10  Exclusive Web Lock ownership
C11  Representative daily mixed workload
C12  Final live verification + cutover/rollback/cleanup
~~~

Result:

~~~text
12 mandatory executable Issues
0 checkpoint-only Issues
0 standing conditional/future Issues
~~~

The number 12 is an outcome of natural boundaries, not a target.

---

# 5. Finding B — Current and Detail should be parallel

Old compact graph:

~~~text
C04 → C05 combined Current/Detail
~~~

Revised graph:

~~~text
        ┌→ C05 Current
C04 ────┤
        └→ C06 Detail/History + L-2
~~~

Then:

~~~text
C05 + C06
→ C07 analytical SQL

C05 + C06
→ C08 Scanner core
~~~

This preserves the deliberate product rule:

~~~text
existing V1 browsing product complete
before
new analytical product work becomes the active path
~~~

while allowing the two existing surfaces to be implemented in parallel.

---

# 6. Finding C — remove redundant C10/C11 dependency edges

In the 11-node draft, daily workload C10 directly depends on C05 even though:

~~~text
C06 depends on C05
and
C08 transitively depends on C05 through C07
~~~

The canonical DAG rule says only direct blockers belong in executable dependency edges.

After renumbering, revised daily workload C11 should depend directly only on:

~~~text
C07 analytical SQL
C09 Scanner UI/integration
C10 Web Lock ownership
+ any activated candidate-changing conditional
~~~

C05/C06 are already transitively required by C07 and C09.

Do not repeat them as GitHub blockers.

---

# 7. Finding D — C01 must prove capability, not freeze durability policy

Current C01 wording includes:

~~~text
minimum selected durability/reopen behavior
~~~

and existing probe evidence currently includes COMMIT + CHECKPOINT.

Risk:

A future implementation chat may infer:

~~~text
C01 proved CHECKPOINT
→ therefore CHECKPOINT after every production cycle is mandatory
~~~

That is exactly the mechanism-level lock-in the KISS reset removed.

## Correction

C01 should prove only the browser capability needed to continue:

~~~text
Worker/Wasm/OPFS
+ synthetic SQL write/COMMIT
+ close/reopen/read marker
~~~

The existing probe may continue to execute CHECKPOINT as part of its tested sequence, but the Issue/spec must state:

~~~text
probe CHECKPOINT usage does not define production checkpoint cadence
~~~

C03 owns the actual durable-success policy.

---

# 8. Finding E — C03 idempotency must remain conditional

Current C03 scope correctly says idempotency is added only if the selected acknowledgement boundary requires it.

But acceptance currently says:

~~~text
duplicate replay does not create contradictory state under the selected retry contract
~~~

This can be read as requiring a replay protocol even when the final design has no ambiguous replay seam.

## Correction

Acceptance should be:

~~~text
if the selected durable-success boundary admits committed-but-unacknowledged retry ambiguity,
the chosen minimal retry/idempotency mechanism proves replay safety;
otherwise no retry-token/idempotency subsystem is required
~~~

This makes the conditional nature explicit.

---

# 9. Finding F — C04 boundary remains valid

Challenge considered:

~~~text
Should Recorder integration and trusted reads be split?
~~~

Decision: **keep together**.

Reason:
- both meet at the new SQL authority seam;
- the write path establishes committed state;
- the read contract defines how the application consumes that state;
- splitting would create another coordination boundary before either surface is usable;
- the Issue remains medium-sized compared with the Viewer surfaces.

Implementation can sequence write path first, then read API, inside one Issue.

---

# 10. Finding G — Scanner C08/C09 split remains valid

After renumbering:

~~~text
C08 Scanner core
C09 Scanner UI/results/integration
~~~

Keep the split.

Reason:
- core owns SQL safety, activation, scheduling/no-overlap and runtime restart behavior;
- UI owns editor, results, types, errors and drill-down;
- they require different test emphases;
- merging them would recreate another large Issue.

No additional Scanner checkpoint Issue is needed.

---

# 11. Finding H — Web Lock remains independent and early

Revised C10 Web Lock dependency should remain:

~~~text
C02 → C10
~~~

Do not make it depend on persistence, Viewer or Scanner completion.

Reason:
- it needs the production runtime ownership boundary;
- it can be developed/tested independently;
- it only needs to converge before the integrated daily workload.

This is legitimate parallelism, not premature optimization.

---

# 12. Finding I — daily workload acceptance must be objective

Current wording includes phrases such as:
- practical responsiveness;
- stable-enough memory;
- required daily use.

These are useful goals but weak PASS/FAIL criteria.

## Correction

C11 should have observable closure conditions:

- workload parameters are recorded and representative of intended daily operation;
- every injected provider cycle reaches one terminal state: committed or explicitly failed;
- persistence queue/backlog does not show sustained monotonic growth during the steady-state portion;
- Scanner never overlaps itself;
- representative Scanner executions repeatedly complete;
- Current/Detail reads continue to complete during mixed load;
- browser/runtime does not crash or hit OOM;
- storage growth is measured and no quota/storage failure occurs for the required workload;
- accumulated DB closes/reopens and expected committed state is readable;
- measured latency/memory/storage values are recorded for future regression comparison.

Do **not** invent a universal millisecond or memory threshold in planning.

If a concrete responsiveness threshold is needed for release, set it before the final run from actual product use/baseline, not after seeing the result.

---

# 13. Finding J — final C12 boundary remains valid

Challenge considered:

~~~text
Should final live verification and cutover be separate Issues?
~~~

Decision: **keep together**.

Reason:
- cutover is a bounded release operation, not a software subsystem;
- splitting creates a gate-only Issue;
- the same candidate/evidence is required immediately before the switch;
- rollback/cleanup are part of leaving the release in a coherent state.

Guardrail:

C12 must not grow into generalized deployment, migration or upgrade infrastructure.

---

# 14. Finding K — remove navigation-only parent Issues

The compact DAG proposed:

~~~text
1 Master
+ 4 navigation parent Issues
+ executable Issues
~~~

After the KISS reset, the four navigation-only Issues do not justify themselves.

They would:
- duplicate grouping already visible in the Master;
- create more Issues with no executable owner/work;
- require updates whenever child structure changes;
- resemble the old Epic bureaucracy we are intentionally removing.

## Decision

Materialization target should be:

~~~text
1 compact Master
+ 12 executable child Issues
~~~

The Master body groups children under four headings:

~~~text
Feasibility + SQL Core
V1 Product on SQL
Analytics + Scanner
Daily Readiness + Cutover
~~~

These are headings, not parent Issues.

Labels/milestones may be used only if they add practical navigation value; they are not required.

---

# 15. Finding L — direct edge accounting must be corrected

The previous DAG summary's direct-edge count is stale.

After the accepted split and deduplication, the direct mandatory implementation edges are:

~~~text
C01 → C02
C02 → C03
C03 → C04
C04 → C05
C04 → C06
C05 → C07
C06 → C07
C05 → C08
C06 → C08
C08 → C09
C02 → C10
C07 → C11
C09 → C11
C10 → C11
C11 → C12
~~~

That is **15 direct mandatory implementation edges**, excluding the historical #29/#30 evidence links into C01.

Do not maintain hand-counted dependency numbers unless a guard derives them mechanically; stale counts add no value.

## Decision

The revised canonical DAG should list edges but should not make the numeric edge count an important contract.

---

# 16. Finding M — C06 L-2 ownership is appropriate

After the Current/Detail split, bounded authenticated L-2 belongs with revised C06 (Detail/History + L-2), not in a standalone gate Issue.

Reason:
- C04 already provides the normal provider→SQL→trusted-read seam;
- C06 is the final V1-browsing implementation branch to close;
- L-2 validates the integrated real provider path before analytics/Scanner become active work;
- C05 and C06 both gate the next product phase.

L-2 itself should not be made dependent on Current rendering internals; it should prove provider accounting, SQL commit and trusted readback.

---

# 17. Finding N — conditional branches remain correct

No standing placeholder Issues should be created for:
- targeted analytical optimization;
- advanced Scanner resource hardening;
- streaming/chunking;
- storage/export/fresh DB;
- Windows-specific evidence;
- shadow comparison.

Each branch still has a clear trigger and rejoin point.

No change required.

---

# 18. Fresh-chat executability review

With the corrections above, a fresh implementation chat should be able to open one active Issue and understand:
- exactly what observable outcome it owns;
- only its direct predecessors;
- what it explicitly does not build;
- which test layer proves it;
- what conditional complexity it must not introduce;
- what completion means.

One additional rule should be added to each materialized Issue:

~~~text
Before implementation, read the current versions of the directly touched code/tests/specs;
do not preload historical Browser SQL planning documents unless a linked uncertainty requires them.
~~~

This protects the repository's HOT/WARM/COLD context policy.

---

# 19. Accepted corrections for the next step

The next planning step should update the canonical DAG and Issue specifications as follows:

1. split old C05 into revised C05 Current and C06 Detail/History + L-2;
2. renumber old C06..C11 to C07..C12;
3. make C05 and C06 parallel direct children of C04;
4. make C07 and C08 depend on both C05 and C06;
5. remove redundant daily-workload dependency on V1 surface nodes;
6. clarify C01 CHECKPOINT evidence does not set production cadence;
7. make C03 retry/idempotency acceptance explicitly conditional;
8. make C11 daily-workload PASS criteria observable and non-arbitrary;
9. keep C04, C08/C09, C10 and C12 boundaries otherwise intact;
10. remove P1..P4 as actual GitHub Issues; retain those names only as Master headings;
11. remove/stay away from stale hand-maintained dependency-count claims;
12. add the fresh-chat direct-code/tests/spec reading rule to materialized executable Issues.

---

# 20. Critique result

The compact plan survives adversarial review, but the correct final shape is now:

~~~text
1 compact Master
+ 12 mandatory executable Issues
+ 0 standing conditional/future Issues
~~~

with two real parallel fronts:

~~~text
after C02:
C03 persistence || C10 Web Lock

after C04:
C05 Current || C06 Detail/History+L2

after C05+C06:
C07 analytical SQL || C08→C09 Scanner
~~~

Final convergence:

~~~text
C07 + C09 + C10
→ C11 daily mixed workload
→ C12 final live/cutover
~~~

This is simpler administratively than the 11-node draft despite adding one real executable Issue, because four navigation-only parent Issues are removed.