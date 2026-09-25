# Browser SQL — Final Planning Assurance and Freeze

This is the Phase-W final pre-implementation assurance artifact.

It supersedes the earlier Phase-R handoff audit as the final planning-freeze authority.

Live progress still belongs only in `../STATUS.json`.

Durable freeze decision: `../../../../../../../docs/project/decisions/D-042.md`.

## 1. Final result

Content audit result:

~~~text
PASS
~~~

The Browser SQL plan is coherent and implementation-ready **subject to final repository Fast CI being green in STATUS.json**.

No material architecture/product/data-integrity/security/operability planning gap is knowingly left unowned.

Remaining unknowns are implementation/live/benchmark evidence questions with explicit blocking owners.

## 2. Frozen implementation baseline

~~~text
Master Issue: #20
Epics:        #21..#28
Work Issues: WP-01..WP-42
Canonical Issue range: #29..#71
Closed duplicate: #65
Implementation entry: WP-01 / #29
~~~

GitHub execution map:

~~~text
docs/browser-sql-github-execution-structure.md
~~~

Implementation decomposition:

~~~text
docs/browser-sql-implementation-decomposition.md
~~~

## 3. Mechanical execution-graph audit

Verified on the final Phase-W planning state:

~~~text
plan WP headings                    = 42
open canonical WP Issues            = 42
missing WP IDs                      = 0
extra WP IDs                        = 0
required Issue sections missing     = 0
dependency mismatches               = 0
dependency cycles                   = 0
wrong Parent Epic references        = 0
broken linked Browser-SQL docs       = 0
Epic child-rollup omissions         = 0
Master Epic/gate omissions          = 0
placeholder/undefined links         = 0
~~~

All canonical Work Issues contain:

~~~text
Why / source contracts
Dependencies / blockers
Target repository areas
Scope
Explicit non-goals
Implementation sequence
Acceptance criteria
Required verification
Security / data integrity
SPEC / docs impact
Cleanup
Definition of done
~~~

## 4. Requirements traceability

Every requirement has at least one executable implementation/verification owner.

### Fixed decisions

| Requirement | Owner(s) |
|---|---|
| FD-01 | WP-03, WP-05, WP-36, WP-38 |
| FD-02 | WP-15, WP-16, WP-17, WP-26 |
| FD-03 | WP-28, WP-36, WP-38 |
| FD-04 | WP-03, WP-34, WP-35 |
| FD-05 | WP-03 |
| FD-06 | WP-23, WP-24, WP-31 |
| FD-07 | all WP-01..WP-42 via frozen-V1 non-goal |
| FD-08 | WP-01 implementation entry after freeze |

### Design requirements

~~~text
DR-01..DR-40 → owners from the original A–R audit
DR-41       → WP-39
DR-42       → WP-35, WP-39
DR-43       → WP-39
DR-44       → WP-07, WP-39, WP-42
DR-45       → WP-39
DR-46       → WP-40
DR-47       → WP-40
DR-48       → WP-40
DR-49       → WP-35, WP-40
DR-50       → WP-27, WP-40
DR-51       → WP-40
DR-52       → WP-40
DR-53       → WP-41
DR-54       → WP-41, WP-42
DR-55       → WP-41
DR-56       → WP-41
DR-57       → WP-41
DR-58       → WP-03, WP-41
DR-59       → WP-01, WP-42
DR-60       → WP-42
DR-61       → WP-42
DR-62       → WP-01, WP-42
DR-63       → WP-07, WP-42
DR-64       → WP-42
DR-65       → WP-42
DR-66       → WP-21, WP-42
~~~

Phase-W automated traceability check verified that **DR-01..DR-66 all exist and all have valid WP owners**.

### Acceptance behaviors

~~~text
AB-01..AB-15 → owners from the original A–R audit
AB-16..AB-18 → WP-39
AB-19..AB-20 → WP-40
AB-21        → WP-27, WP-40
AB-22..AB-23 → WP-40
AB-24..AB-25 → WP-41
AB-26        → WP-08, WP-41
AB-27        → WP-41
AB-28..AB-32 → WP-42
~~~

Phase-W automated traceability check verified that **AB-01..AB-32 all exist and all have valid WP owners**.

## 5. Durable-decision traceability

All Browser SQL durable decisions `D-025..D-041` have executable owners.

Assurance additions:

~~~text
D-038 storage lifecycle       → WP-35, WP-39
D-039 resource isolation      → WP-35, WP-40
D-040 cross-tab ownership     → WP-03, WP-41
D-041 release upgrade safety  → WP-01, WP-07, WP-21, WP-39, WP-41, WP-42
~~~

`D-042` freezes this planning baseline and defines reopen rules.

## 6. Hard-gate audit

Critical gate chain is explicit:

~~~text
WP-01 pin/manifest foundation
→ WP-02 synthetic compatibility probe
→ WP-03 real authenticated-Leumi gate
   └─ blocks WP-05+ heavy SQL authority

WP-14 SQL authority checkpoint
→ WP-40 analytical preemption/resource isolation
→ WP-20 analytical runtime checkpoint

WP-41 cross-tab owner gate
→ WP-22 production Runtime Controller
→ WP-29 integrated runtime/Viewer checkpoint

WP-33 shadow/live correctness
→ WP-35 target Windows/Chrome performance evidence
→ WP-39 storage lifecycle
→ WP-42 upgrade/release lifecycle
→ WP-36 production cutover
→ WP-37 rollback/roll-forward + live endurance
→ WP-38 final migration-scaffolding cleanup
~~~

The full dependency graph is acyclic.

## 7. Unknown / deferred evidence inventory

These are intentionally **not guessed** and are not planning gaps:

| Evidence still unknown until implementation/live/benchmark | Blocking owner |
|---|---|
| exact DuckDB-Wasm package/core/asset pin | WP-01 |
| real Leumi CSP + Blob Worker + Wasm + OPFS suitability | WP-03 |
| two-tab Web Locks behavior on authenticated Leumi origin | WP-03 / WP-41 |
| provider DealsDelta cumulative/reset semantics | WP-12; remain NULL until Verified |
| exact numeric Viewer preview cap | WP-27 / WP-35 |
| hidden/background behavior and real capacity/headroom | WP-35 |
| storage-warning reserve bytes | WP-35 / WP-39 |
| pinned pending-query cancellation + active-stream abort behavior | WP-40 |
| exact bounded archive/rollover physical mechanism | WP-39 |
| exact storage-compatibility setting and candidate-upgrade copy mechanism | WP-42 |
| live provider integration after full SQL runtime | WP-24 |
| final live rollback/endurance behavior | WP-37 |

Explicit non-goals, not missing work:

- automatic hot-standby takeover;
- automatic partial-history pruning;
- archive restore/import and cross-epoch live SQL;
- legacy IndexedDB historical import;
- arbitrary-query export product UI;
- final trading formula/order execution logic.

## 8. Fresh-AI dry-run audit

Representative Issues were reviewed as if a new chat had only:

~~~text
AGENTS.md
→ workstream README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current Issue
→ only docs linked by that Issue
~~~

Dry-run set:

| Issue | Concern | Result |
|---|---|---|
| WP-01 / #29 | engine pin/build foundation | PASS |
| WP-03 / #31 | real Leumi entry gate + Web Locks probe | PASS after Phase-W Issue correction |
| WP-11 / #39 | atomic market-cycle persistence | PASS |
| WP-27 / #55 | result preview/health presentation | PASS |
| WP-40 / #69 | cancellation/resource isolation | PASS |
| WP-41 / #70 | cross-tab ownership | PASS |
| WP-36 / #64 | production cutover | PASS |
| WP-38 / #67 | final cleanup | PASS |
| WP-42 / #71 | upgrade/rollback lifecycle | PASS |

Each gives prerequisites, target areas, bounded scope/non-goals, implementation order, acceptance, native verification, security, SPEC impact and cleanup without requiring this conversation history.

## 9. Cleanup ownership audit

| Temporary concern | Owner |
|---|---|
| feasibility/live probe artifacts | WP-03 + final WP-38 audit |
| SQL shadow path/comparison instrumentation | WP-38 |
| active legacy IndexedDB runtime wiring | WP-38 |
| rollover candidates/journal | WP-39 |
| cancellation/failure-injection hooks | WP-40 |
| ownership race/failure-injection hooks | WP-41 |
| upgrade candidate/journal/rollback snapshot lifecycle | WP-42 |

No known temporary mechanism has an ownerless lifetime.

## 10. Planning defects caught before freeze

Phase W found and corrected:

1. decomposition `Depends on` fields lagged GitHub blockers for WP-20/WP-22/WP-36;
2. post-audit headings made WP-42 invisible to one mechanical parser;
3. old Phase-B/E/H wording still said `deferred/not selected/no cancellation` after later phases resolved those items;
4. WP-03 did not explicitly own the live two-tab Web Locks probe added by Phase U;
5. WP-35 did not explicitly own storage-lifecycle and analytical-preemption measurements added by Phases S/T.

Prevention: final freeze requires machine-auditable decomposition, Issue/source parity and fresh-AI dry runs.

## 11. Context/navigation audit

Verified:

~~~text
README fresh-chat HOT path exists
STATUS is the only live current/next owner
AI_CONTEXT remains below its guard
STATUS remains below its guard
GitHub execution map contains 42 WPs
duplicate #65 is closed as duplicate
no placeholder/undefined execution links
~~~

## 12. Reopen conditions

Planning is frozen for implementation, not immutable forever.

Reopen only when one of these occurs:

- WP-03 live evidence proves the Browser SQL architecture cannot satisfy a required capability;
- pinned DuckDB-Wasm evidence invalidates a frozen contract;
- benchmark evidence violates required performance/capacity/durability bounds and cannot be fixed within the existing architecture;
- a material new product requirement changes the scope/invariants;
- implementation exposes a real design contradiction not resolvable inside the owning Work Issue.

When reopened, update the smallest owning decision/doc + decomposition + GitHub blockers + STATUS in one coherent batch.

Do not redesign because an implementation detail is merely inconvenient.

## 13. Implementation handoff

After final Fast CI is green, the planning project hands execution to:

~~~text
WP-01 / GitHub Issue #29
Pin DuckDB-Wasm and create the engine asset manifest foundation
~~~

The implementation chat must start from current `main` and follow the normal repository loading path.

No implementation work is part of this Phase-W planning chat.