# Browser SQL — GitHub Execution Structure

This is the current GitHub navigation for the post-KISS Browser SQL V2 implementation.

Live progress/current-next state belongs only in `../STATUS.json`.

Durable product/implementation decisions:

~~~text
D-043 = provider/data continuity + three product surfaces
D-044 = compact post-KISS Browser SQL implementation baseline
~~~

## Current execution graph

Master:

~~~text
#85 — [Browser SQL][V2] Compact implementation master
~~~

Executable Issues:

| ID | GitHub Issue | Scope | Direct predecessor(s) |
|---|---:|---|---|
| C01 | #73 | real-origin DuckDB L-1 | completed evidence #29, #30 |
| C02 | #74 | minimum SQL runtime + schema | #73 |
| C03 | #75 | atomic persistence + reopen/durability | #74 |
| C04 | #76 | Recorder integration + trusted reads | #75 |
| C05 | #77 | Current Universe SQL parity | #76 |
| C06 | #78 | Detail/History SQL parity + bounded L-2 | #76 |
| C07 | #79 | real analytical SQL + day-sized measurement | #77, #78 |
| C08 | #80 | Scanner core | #77, #78 |
| C09 | #81 | Scanner UI/results/integration | #80 |
| C10 | #82 | exclusive Web Lock ownership | #74 |
| C11 | #83 | representative daily mixed workload | #79, #81, #82 |
| C12 | #84 | final live verification + cutover/rollback/cleanup | #83 |

Dependency rationale:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

Detailed design/specification reference:

~~~text
docs/browser-sql-compact-issue-specifications.md
~~~

The GitHub Issue bodies are the executable owners. The design/specification file is retained for durable rationale and consistency review.

## Completed reusable evidence

~~~text
#29 — engine pin / manifest evidence
#30 — deterministic Worker/Wasm/OPFS/reopen probe
~~~

They remain closed completed evidence and are referenced by C01; they are not reopened or reimplemented.

## Conditional work

No placeholder Issues exist for O1..O6.

Create a focused Issue only when the triggering executable Issue records the evidence defined in the compact DAG:

- O1 analytical optimization ← C07 / #79;
- O2 Scanner resource hardening ← C11 / #83;
- O3 streaming/chunked results ← C09 / #81 or C11 / #83;
- O4 storage/export/fresh-DB workflow ← C11 / #83;
- O5 target Windows/Chrome evidence ← C11 / #83;
- O6 temporary shadow comparison ← C06 / #78.

## Historical graph

The pre-KISS Master #20 / Epics #21..#28 / WP graph #29..#71 is historical.

Its preserved source is under:

~~~text
docs/history/browser-sql-pre-kiss-42wp-plan/
~~~

#29/#30 remain reusable completed evidence and #65 remains a closed duplicate. The other pre-KISS execution Issues are retired as superseded/conditional/future during the post-KISS transition.
