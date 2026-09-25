# Local History Viewer V2 — Design Docs

This directory contains stable V2 design/evidence documents, not operational status.

## Current Browser SQL planning direction

| Need | File |
|---|---|
| current-state migration audit | [browser-sql-current-state-audit.md](browser-sql-current-state-audit.md) |
| consolidated requirements + acceptance scenarios | [browser-sql-requirements-and-acceptance.md](browser-sql-requirements-and-acceptance.md) |
| browser/platform constraint matrix | [browser-sql-browser-constraints.md](browser-sql-browser-constraints.md) |
| official Browser SQL / DuckDB-Wasm capability research | [browser-sql-official-capability-research.md](browser-sql-official-capability-research.md) |
| selected Browser SQL target architecture | [browser-sql-target-architecture.md](browser-sql-target-architecture.md) |
| selected Browser SQL relational data model | [browser-sql-relational-data-model.md](browser-sql-relational-data-model.md) |
| ingest / enrichment / atomicity plan | [browser-sql-ingest-enrichment-atomicity.md](browser-sql-ingest-enrichment-atomicity.md) |
| SQL execution / scheduler contract | [browser-sql-execution-scheduler.md](browser-sql-execution-scheduler.md) |
| OPFS persistence / reopen / recovery contract | [browser-sql-persistence-recovery.md](browser-sql-persistence-recovery.md) |
| runtime delivery / authenticated-browser integration | [browser-sql-runtime-delivery.md](browser-sql-runtime-delivery.md) |
| Viewer / result-delivery contract | [browser-sql-viewer-result-delivery.md](browser-sql-viewer-result-delivery.md) |
| Browser SQL testing / verification strategy | [browser-sql-testing-verification-strategy.md](browser-sql-testing-verification-strategy.md) |
| Browser SQL migration / cutover strategy | [browser-sql-migration-cutover.md](browser-sql-migration-cutover.md) |
| Browser SQL failure / security / observability contract | [browser-sql-failure-security-observability.md](browser-sql-failure-security-observability.md) |
| Browser SQL implementation decomposition | [browser-sql-implementation-decomposition.md](browser-sql-implementation-decomposition.md) |
| Browser SQL GitHub execution structure | [browser-sql-github-execution-structure.md](browser-sql-github-execution-structure.md) |
| Browser SQL final plan audit / implementation handoff | [browser-sql-final-plan-audit.md](browser-sql-final-plan-audit.md) |
| Browser SQL data lifecycle / retention / archive / rollover | [browser-sql-data-lifecycle-retention.md](browser-sql-data-lifecycle-retention.md) |
| Browser SQL analytical resource isolation / runaway-query safety | [browser-sql-analytical-resource-isolation.md](browser-sql-analytical-resource-isolation.md) |
| Browser SQL multi-tab ownership / split-brain prevention | [browser-sql-multi-tab-ownership.md](browser-sql-multi-tab-ownership.md) |
| SQL architecture direction | [sql-live-analytics-design.md](sql-live-analytics-design.md) |
| Browser SQL benchmark planning | [sql-live-engine-benchmark-plan.md](sql-live-engine-benchmark-plan.md) |
| Browser-only durable decision | [D-025](../../../../../../../docs/project/decisions/D-025.md) |
| single SQL authority durable decision | [D-026](../../../../../../../docs/project/decisions/D-026.md) |
| relational schema durable decision | [D-027](../../../../../../../docs/project/decisions/D-027.md) |
| atomic ingest durable decision | [D-028](../../../../../../../docs/project/decisions/D-028.md) |
| SQL scheduler durable decision | [D-029](../../../../../../../docs/project/decisions/D-029.md) |
| persistence/recovery durable decision | [D-030](../../../../../../../docs/project/decisions/D-030.md) |
| runtime delivery durable decision | [D-031](../../../../../../../docs/project/decisions/D-031.md) |
| Viewer/result-delivery durable decision | [D-032](../../../../../../../docs/project/decisions/D-032.md) |
| Browser SQL verification durable decision | [D-033](../../../../../../../docs/project/decisions/D-033.md) |
| Browser SQL benchmark/headroom durable decision | [D-034](../../../../../../../docs/project/decisions/D-034.md) |
| Browser SQL migration/cutover durable decision | [D-035](../../../../../../../docs/project/decisions/D-035.md) |
| Browser SQL failure/security/observability durable decision | [D-036](../../../../../../../docs/project/decisions/D-036.md) |
| Browser SQL implementation decomposition durable decision | [D-037](../../../../../../../docs/project/decisions/D-037.md) |
| Browser SQL data-lifecycle durable decision | [D-038](../../../../../../../docs/project/decisions/D-038.md) |
| Browser SQL analytical-resource durable decision | [D-039](../../../../../../../docs/project/decisions/D-039.md) |
| Browser SQL multi-tab ownership durable decision | [D-040](../../../../../../../docs/project/decisions/D-040.md) |
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
