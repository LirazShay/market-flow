# Decision Index — Market Flow

This is the **compact decision index**.

Normal AI work should scan this file, identify only the decisions relevant to the current task, and open those specific files under `docs/project/decisions/`.

Do not read all detailed decisions by default.

## Read flow

~~~text
decisions.md
→ identify relevant IDs/tags
→ read only those D-NNN.md files
~~~

| ID | Decision | Status | Relevance tags |
|---|---|---|---|
| [D-001](decisions/D-001.md) | Evidence before architecture | Accepted | architecture, evidence |
| [D-002](decisions/D-002.md) | Repository is the project memory | Accepted | repository, project-memory |
| [D-003](decisions/D-003.md) | Adaptive work batches + natural continuation boundaries | Accepted / evolved | workflow, delivery, chat-handoff |
| [D-004](decisions/D-004.md) | MapHeat2 role | Accepted based on observed behavior | leumi-api, mapheat2 |
| [D-005](decisions/D-005.md) | GetSecuritiesData role | Accepted based on observed behavior | leumi-api, securities-data |
| [D-006](decisions/D-006.md) | Join key | Verified | data, join |
| [D-007](decisions/D-007.md) | Do not hardcode 561 | Accepted | universe, data-integrity |
| [D-008](decisions/D-008.md) | Conservative GetSecuritiesData batching | Accepted for current research flow | polling, batching |
| [D-009](decisions/D-009.md) | Sequential batching is the proven baseline | Accepted until measured otherwise | polling, batching |
| [D-010](decisions/D-010.md) | null != 0 | Accepted / required | data-model, null-semantics |
| [D-011](decisions/D-011.md) | Level 1 is nullable | Verified | market-data, order-book |
| [D-012](decisions/D-012.md) | Do not use order-book levels 2–5 from GetSecuritiesData | Verified for tested Equity snapshot | market-data, order-book |
| [D-013](decisions/D-013.md) | Dynamic values from both endpoints are not atomic | Verified | market-data, timing |
| [D-014](decisions/D-014.md) | Prefer GetSecuritiesData for live/dynamic values | Accepted recommendation | market-data, source-selection |
| [D-015](decisions/D-015.md) | Preserve raw payloads when production collection is designed | Accepted design requirement | data-model, raw-payload |
| [D-016](decisions/D-016.md) | No final technology stack yet | Open / intentionally undecided | architecture, technology-stack |
| [D-017](decisions/D-017.md) | Separate research, production code and production tests | Accepted | repository-structure, testing |
| [D-018](decisions/D-018.md) | Documentation follows code ownership | Accepted | documentation, repository-structure |
| [D-019](decisions/D-019.md) | Local History Viewer V1 is a browser-only prototype | Accepted for V1 planning | local-history-viewer-v1, architecture |
| [D-020](decisions/D-020.md) | Tests-first pyramid with mandatory Chromium verification after code changes | Accepted / evolved | testing, ci, playwright |
| [D-021](decisions/D-021.md) | KISS: simplest sufficient design, complexity only when proven necessary | Accepted | architecture, simplicity, kiss, yagni |
| [D-022](decisions/D-022.md) | Failure-to-learning loop and continuous improvement | Accepted | quality, learning, rca, process, testing |
| [D-023](decisions/D-023.md) | Progressive context loading with preserved cold history | Accepted | ai-context, navigation, history, efficiency |
| [D-024](decisions/D-024.md) | Repository self-maintenance is part of every change | Accepted | maintenance, hygiene, source-of-truth, ai-workflow |
| [D-025](decisions/D-025.md) | Market Flow V2 analytical architecture is Browser-only SQL | Superseded by D-045 for V2 | browser-sql, architecture, local-history-viewer-v2 |
| [D-026](decisions/D-026.md) | Browser SQL uses one dedicated SQL Authority Worker | Accepted | browser-sql, duckdb-wasm, opfs, worker, architecture |
| [D-027](decisions/D-027.md) | Browser SQL uses snapshot-centric wide core-horizon schema | Superseded by D-044 for initial V2 | browser-sql, schema, snapshot, horizons, data-model |
| [D-028](decisions/D-028.md) | Validated cycles commit atomically after SQL-side enrichment | Superseded by D-044 for initial V2 | browser-sql, ingest, atomicity, enrichment, transactions |
| [D-029](decisions/D-029.md) | Analytical SQL uses immutable versions and a non-overlapping anchored scheduler | Superseded by D-044 for initial V2 | browser-sql, scheduler, query-runtime, sql-safety, versioning |
| [D-030](decisions/D-030.md) | OPFS durability uses checkpointed batches and idempotent recovery | Superseded by D-044 for initial V2 | browser-sql, opfs, persistence, recovery, checkpoint, idempotency |
| [D-031](decisions/D-031.md) | Browser SQL delivery keeps Market Flow self-contained and pins external engine assets | Accepted / amended by D-044 | browser-sql, runtime, bookmarklet, wasm, worker, delivery, csp |
| [D-032](decisions/D-032.md) | Viewer is a detachable client of one Runtime Controller | Superseded by D-044 for initial V2 | browser-sql, viewer, results, messaging, multi-viewer |
| [D-033](decisions/D-033.md) | Browser SQL verification uses Node + Chromium + mandatory live Leumi gates | Accepted / amended by D-044 | browser-sql, testing, playwright, live-verification, ci |
| [D-034](decisions/D-034.md) | Browser SQL performance is gated by cadence-relative headroom and full-session evidence | Superseded by D-044 for initial V2 | browser-sql, performance, benchmark, headroom, chromium |
| [D-035](decisions/D-035.md) | Browser SQL cutover starts a fresh authority epoch without importing legacy IndexedDB history | Accepted / amended by D-044 | browser-sql, migration, cutover, indexeddb, rollback |
| [D-036](decisions/D-036.md) | Browser SQL uses scoped failures, worst-active health precedence and sanitized local observability | Superseded by D-044 for initial V2 | browser-sql, failure, security, observability, health, diagnostics |
| [D-037](decisions/D-037.md) | Browser SQL implementation follows gate-ordered executable work packages | Superseded by D-044 for initial V2 | browser-sql, implementation-plan, dependencies, milestones, issues |
| [D-038](decisions/D-038.md) | Browser SQL storage lifecycle uses retain-all plus explicit archive-and-rollover | Superseded by D-044 for initial V2 | browser-sql, retention, quota, archive, rollover, opfs |
| [D-039](decisions/D-039.md) | Browser SQL analytical work is preemptible and cannot indefinitely block market ingest | Superseded by D-044 for initial V2 | browser-sql, sql, cancellation, scheduler, resource-isolation, ingest |
| [D-040](decisions/D-040.md) | Browser SQL uses one stable exclusive Web Lock for cross-tab runtime authority | Accepted / amended by D-044 | browser-sql, web-locks, multi-tab, ownership, split-brain, runtime |
| [D-041](decisions/D-041.md) | Browser SQL persistence-affecting releases upgrade side-by-side and roll back by preserved snapshot | Superseded for initial V2; future reference | browser-sql, upgrade, schema, storage-version, rollback, release |
| [D-042](decisions/D-042.md) | Browser SQL planning is frozen at the 42-package implementation baseline | Superseded by D-044 | browser-sql, planning-freeze, implementation-handoff, quality |
| [D-043](decisions/D-043.md) | V2 preserves the V1 collection/data contract and exposes three Viewer surfaces | Accepted / amended by D-045 traceability | local-history-viewer-v2, node-sql, viewer, product-shape, collection-continuity |
| [D-044](decisions/D-044.md) | Browser SQL V2 uses a post-KISS minimum SQL core, product-first migration and evidence-triggered optimization | Superseded by D-045 for V2 | browser-sql, architecture, kiss, implementation-plan, evidence-driven |
| [D-045](decisions/D-045.md) | Local History Viewer V2 uses a loopback Node.js SQL authority | Accepted | node-sql, localhost, websocket, duckdb, architecture, local-history-viewer-v2 |

## Fast lookup

~~~text
Leumi batching/polling
→ D-008, D-009

Data identity/null/raw preservation
→ D-006, D-007, D-010, D-015, D-043, D-044

Repository/docs/workflow
→ D-002, D-003, D-017, D-018

Architecture / complexity / KISS
→ D-001, D-021

Failures / RCA / continuous improvement
→ D-022

AI context / fresh-chat loading / preserved history
→ D-023

Repository self-maintenance / no-cleanup debt
→ D-024

Local History Viewer V1
→ D-019, D-020

Browser SQL / V2 analytical migration — current
→ D-025, D-026, D-031, D-033, D-035, D-040, D-043, D-044, D-001, D-021

Browser SQL / V2 analytical migration — superseded historical mechanisms
→ D-027, D-028, D-029, D-030, D-032, D-034, D-036, D-037, D-038, D-039, D-041, D-042

V2 product continuity / three Viewer surfaces
→ D-043, D-044, D-019, D-025, D-035, D-040
~~~

## Adding a durable decision

1. create the next `docs/project/decisions/D-NNN.md`;
2. add one row to this index;
3. update wider project state only if the decision changes it.

The individual decision files are the detailed durable source.
