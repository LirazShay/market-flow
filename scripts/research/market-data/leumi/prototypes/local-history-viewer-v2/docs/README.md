# Local History Viewer V2 — Design Docs

This directory contains durable V2 design/evidence. It does **not** own live progress; use `../STATUS.json`.

## Current Browser SQL authorities

| Need | Authority |
|---|---|
| product/provider continuity + three surfaces | [product shape](../../../../../../../docs/product/local-history-viewer-v2-product-shape.md) + [D-043](../../../../../../../docs/project/decisions/D-043.md) |
| post-KISS implementation baseline | [D-044](../../../../../../../docs/project/decisions/D-044.md) |
| live user SQL product behavior | [live SQL requirement](../../../../../../../docs/product/live-sql-query-execution.md) |
| compact target architecture | [browser-sql-target-architecture.md](browser-sql-target-architecture.md) |
| implementation dependency rationale | [browser-sql-compact-execution-dag.md](browser-sql-compact-execution-dag.md) |
| design/specification reference for C01..C12 | [browser-sql-compact-issue-specifications.md](browser-sql-compact-issue-specifications.md) |
| current GitHub graph | Master #85 / C01..C12 #73..#84 via [browser-sql-github-execution-structure.md](browser-sql-github-execution-structure.md) |
| testing policy | [../tests/TESTING_POLICY.md](../tests/TESTING_POLICY.md) |
| stable plan/order | [../ROADMAP.md](../ROADMAP.md) |
| materialization/re-baseline history | [browser-sql-pre-materialization-reconciliation-map.md](browser-sql-pre-materialization-reconciliation-map.md) and post-KISS audits — reference only |

## Historical Browser SQL planning

Pre-KISS 42-WP planning and superseded mechanism designs are COLD history:

~~~text
history/README.md
~~~

Start there only when a current Issue explicitly needs historical rationale/evidence.

The post-KISS audit trail is also planning rationale rather than normal implementation startup context. Prefer D-044, the compact DAG and the active Issue.

## Source-of-truth reminder

~~~text
STATUS.json = live progress/current/verification
ROADMAP.md   = stable plan/scope/order
GitHub Issue = active executable work unit
D-043/D-044  = durable product/implementation decisions
docs/history = cold historical evidence
~~~
