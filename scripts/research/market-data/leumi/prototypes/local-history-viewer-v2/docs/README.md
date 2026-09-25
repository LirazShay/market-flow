# Local History Viewer V2 — Design Docs

This directory contains stable V2 design documents, not operational status.

## Current direction

| Need | File |
|---|---|
| SQL-first architecture direction | [sql-live-analytics-design.md](sql-live-analytics-design.md) |
| SQL engine benchmark workloads | [sql-live-engine-benchmark-plan.md](sql-live-engine-benchmark-plan.md) |
| product requirement | [repository product doc](../../../../../../../docs/product/live-sql-query-execution.md) |
| inherited requirements baseline | [requirements.md](requirements.md) |
| inherited component architecture | [architecture.md](architecture.md) |
| inherited schema/data model | [data-model.md](data-model.md) |
| inherited IndexedDB growth evidence | [storage-growth-report.md](storage-growth-report.md) |
| testing design | [test-plan.md](test-plan.md) |

## Superseded research

The abandoned IndexedDB-primary analytical evaluation is preserved at:

~~~text
history/superseded-indexeddb-primary-evaluation/
~~~

It is historical context only and no longer governs the V2 roadmap.

## Truth ownership

~~~text
../STATUS.json = live progress
../ROADMAP.md = plan/order
../specs/ = durable normative contracts
docs/ = durable design/evidence
docs/history/ = superseded/completed cold evidence
~~~
