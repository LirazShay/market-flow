# Local History Viewer V2 — Design Docs

This directory contains stable V2 design/evidence documents, not operational status.

## Current Browser SQL planning direction

| Need | File |
|---|---|
| current-state migration audit | [browser-sql-current-state-audit.md](browser-sql-current-state-audit.md) |
| consolidated requirements + acceptance scenarios | [browser-sql-requirements-and-acceptance.md](browser-sql-requirements-and-acceptance.md) |
| browser/platform constraint matrix | [browser-sql-browser-constraints.md](browser-sql-browser-constraints.md) |
| SQL architecture direction | [sql-live-analytics-design.md](sql-live-analytics-design.md) |
| Browser SQL benchmark planning | [sql-live-engine-benchmark-plan.md](sql-live-engine-benchmark-plan.md) |
| Browser-only durable decision | [D-025](../../../../../../../docs/project/decisions/D-025.md) |
| product SQL requirement | [repository product doc](../../../../../../../docs/product/live-sql-query-execution.md) |
| planning phases/order | [../ROADMAP.md](../ROADMAP.md) |

## Implemented inherited baseline

| Need | File |
|---|---|
| inherited requirements baseline | [requirements.md](requirements.md) |
| inherited component architecture | [architecture.md](architecture.md) |
| inherited schema/data model | [data-model.md](data-model.md) |
| inherited IndexedDB growth evidence | [storage-growth-report.md](storage-growth-report.md) |
| testing design | [test-plan.md](test-plan.md) |

The inherited baseline documents describe currently implemented V1-derived behavior. They do not override the Browser SQL planning target.

## Superseded research

The abandoned IndexedDB-primary analytical evaluation is preserved at:

~~~text
history/superseded-indexeddb-primary-evaluation/
~~~

It is historical context only and no longer governs the V2 roadmap.

## Truth ownership

~~~text
../STATUS.json = live progress
../ROADMAP.md = planning/implementation phase order
../AI_CONTEXT.md = compact continuation context
../specs/ = currently implemented normative contracts until deliberately replaced
docs/ = durable design/evidence
docs/history/ = superseded/completed cold evidence
~~~
