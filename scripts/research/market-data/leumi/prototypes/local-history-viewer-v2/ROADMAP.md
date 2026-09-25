# Local History Viewer V2 — Browser SQL Planning Roadmap

This file owns the planning project's phases, scope, order and major dependencies.

Live progress and the exact current pointer belong only in `STATUS.json`.

This roadmap is deliberately a planning roadmap. It is not authorization to implement Browser SQL. The final planning phase will evolve this file into the implementation roadmap only after architecture, contracts, verification strategy and executable GitHub Issues are ready.

## Fixed planning constraints

- Browser-only SQL is a fixed constraint for this planning cycle.
- Real user-defined SQL is first-class.
- SQL runs repeatedly at a configurable interval independent from collector cadence.
- IndexedDB is not the target analytical engine.
- DuckDB-Wasm + browser persistence is the leading engine candidate, but not yet a verified implementation choice.
- localhost / Node / .NET / native DuckDB are not active candidates in this planning project.
- A future non-browser contingency requires a new explicit architecture decision.
- V1 remains frozen.
- No implementation begins until this planning project completes.

Durable decision:

~~~text
docs/project/decisions/D-025.md
~~~

## Planning Phase A — Current-state audit

Understand what V1/V2 already prove before designing replacement architecture.

Deliverables:

- current-state audit;
- preliminary retain/adapt/replace/remove matrix;
- gap inventory;
- stale/contradictory planning inventory.

No implementation.

## Planning Phase B — Requirements consolidation

Consolidate:

- Browser-only SQL;
- arbitrary user SQL;
- query interval;
- committed-data consistency;
- full raw preservation;
- canonical IDs;
- snapshot identity;
- temporal/horizon needs;
- LAST change / Deals delta / MID;
- result/error semantics;
- query traceability;
- analytical read-only safety;
- observability;
- explicit non-goals.

Deliverables:

- requirement catalog;
- end-to-end acceptance scenarios;
- decision / requirement / assumption / unknown classification.

## Planning Phase C — Browser architecture constraints

Define:

- Chrome/Chromium on Windows target;
- origin ownership;
- same-origin implications;
- CSP/CORS/module/Worker/WASM constraints;
- page/tab lifecycle;
- background throttling;
- persistence/quota/eviction expectations;
- security boundary;
- possible one-writer requirement.

Deliverable: browser constraint matrix.

## Planning Phase D — External capability research

Verify current official documentation for:

- DuckDB-Wasm current release/API;
- OPFS/persistence;
- Worker architecture;
- SQL features;
- transactions/concurrency/locking;
- reopen/recovery;
- interruption/cancellation;
- JSON;
- Arrow/bulk ingest;
- EXPLAIN/profiling;
- browser memory/runtime limitations;
- package/runtime loading.

Rules:

- official documentation first;
- Verified / Inferred / Unknown;
- no spike implementation.

Deliverable: capability matrix with references.

## Planning Phase E — Target architecture

Choose browser-only boundaries for:

- collector;
- enrichment;
- SQL engine/Worker owner;
- Browser SQL source of truth;
- scheduler;
- result delivery;
- viewer;
- notifications;
- startup/recovery ownership.

Deliverables:

- target architecture diagram;
- responsibility matrix;
- sequence flows;
- durable decisions where justified.

## Planning Phase F — Relational data model

Plan:

- Cycle;
- Snapshot;
- universe/security metadata;
- stable SnapshotId;
- time model;
- full raw representation;
- typed promoted columns;
- current/latest representation;
- query definition/execution metadata if needed;
- horizon/temporal representation;
- naming/types/units/null semantics;
- schema versioning.

Deliverables:

- relational model;
- typing strategy;
- raw-vs-column strategy;
- selected schema direction.

## Planning Phase G — Ingest, enrichment and atomicity

Plan:

- validated-cycle handoff;
- bulk ingest;
- transaction boundary;
- current/history coherence;
- enrichment ownership;
- compute-once/query-many;
- rollback;
- query visibility during writes;
- rebuild/recovery implications.

Deliverables:

- ingest sequence;
- atomicity/isolation contract;
- enrichment decision.

## Planning Phase H — SQL execution and scheduler

Plan:

- active query;
- read-only user SQL boundary;
- DDL/admin separation;
- scheduling clock semantics;
- collector cadence independence;
- overrun behavior;
- no uncontrolled overlap;
- cancellation/timeout;
- errors;
- latest execution vs latest successful result;
- result size/materialization;
- query versioning.

Deliverable: SQL execution/scheduler contract.

## Planning Phase I — Persistence and recovery

Plan:

- persistent authority;
- startup/open/reopen;
- refresh;
- tab close/reopen;
- schema upgrade;
- migration failure;
- quota exhaustion;
- corruption;
- retention;
- export/backup scope.

Deliverables:

- persistence lifecycle;
- recovery matrix;
- schema migration policy.

## Planning Phase J — Runtime delivery and browser integration

Plan:

- WASM/Worker loading;
- dynamic/module imports;
- CSP/CORS;
- asset pinning;
- caching/integrity;
- Bookmarklet practicality;
- alternative browser-only delivery if needed;
- distribution/update flow.

Deliverable: runtime delivery decision.

## Planning Phase K — Viewer and result delivery

Classify and design:

- retain/adapt/replace existing current/history/diagnostics;
- result delivery;
- DB reread vs pushed result;
- multi-viewer behavior;
- future SQL editor/input;
- query/result/error/timing display.

Deliverable: viewer/result architecture.

## Planning Phase L — Testing and verification

Plan:

- pure/unit tests;
- Playwright Chromium;
- OPFS/WASM/Worker integration;
- SQL correctness fixtures;
- atomicity;
- refresh/reopen;
- query failure isolation;
- live-provider boundary;
- CI matrix;
- public behavior contracts.

Deliverable: testing/verification strategy.

## Planning Phase M — Performance and benchmark strategy

Plan workloads:

- current universe SELECT/WHERE/ORDER/LIMIT;
- current/history JOIN;
- recent-window aggregation;
- GROUP BY/HAVING;
- window functions;
- cross-security ranking;
- scheduled SQL;
- continuous ingest + query;
- reopen;
- multi-million rows;
- WASM/Worker startup;
- JS↔WASM/result materialization;
- persistence/commit;
- memory/DB growth;
- background and long-running behavior.

Deliverable: benchmark datasets, metrics, run classes and decision gates.

## Planning Phase N — Migration and cutover

Plan:

- isolated Browser SQL proof boundary;
- temporary coexistence if required;
- single authority at every point;
- existing IndexedDB history decision;
- incremental cutover;
- rollback boundaries;
- point where IndexedDB ceases to be authoritative.

Deliverable: migration/cutover sequence.

## Planning Phase O — Failure, security and observability

Plan:

- failure-mode inventory;
- recovery/integrity expectation per failure;
- security/secrets boundary;
- cycle/query/runtime telemetry;
- DB size/quota visibility;
- last success/error;
- debug bundle evolution.

Deliverable: failure/recovery/security/observability matrix.

## Planning Phase P — Implementation decomposition

Only after architecture is coherent, decompose natural vertical implementation slices.

Each future implementation issue must include:

- Purpose / Why;
- Scope / Non-scope;
- prerequisites/dependencies;
- observable behavior;
- expected artifacts;
- implementation guidance;
- data-integrity requirements;
- tests;
- verification;
- acceptance criteria;
- Definition of Done;
- risks/traps;
- references.

Deliverable: reviewed issue drafts and dependency graph.

## Planning Phase Q — GitHub execution structure

Create only after decomposition is reviewed:

- navigation/epic issue;
- implementation issues;
- useful milestones;
- controlled labels;
- dependency references/sub-issues/checklists where supported;
- parallelization notes.

ROADMAP remains phase/order ownership, not a duplicate issue list.

## Planning Phase R — Final plan audit and implementation handoff

Audit:

- missing requirements;
- contradictions;
- duplicated truth;
- unowned behavior;
- missing/circular dependencies;
- giant/micro issues;
- missing tests/performance/recovery/security/docs;
- traceability from product requirement → design/spec → issue → test → verification.

Then:

- finalize target planning artifacts;
- evolve ROADMAP into the approved implementation phase plan;
- point STATUS.json to the first implementation issue;
- leave enough context for a fresh AI to execute without this planning conversation.

The initial Phase-R audit triggered a deeper pre-implementation red-team review. Implementation remains blocked until the added assurance phases below are complete.

## Planning Phase S — Data lifecycle, retention and archive/rollover

Close retention/export/backup lifecycle:

- retain-all vs automatic deletion;
- storage-pressure warning;
- archive semantics;
- database epoch identity;
- explicit crash-recoverable rollover;
- OPFS deletion safety under the Leumi origin;
- quota recovery without false VACUUM assumptions.

Deliverable: durable lifecycle policy + implementation owner.

## Planning Phase T — Analytical resource isolation and runaway-query safety

Close the gap where an arbitrary long-running analytical query can starve market ingest even though scheduler overlap is prevented.

Plan:

- query admission/resource budgets;
- timeout/cancellation capability evidence in the exact pinned Wasm API;
- behavior when cancellation is unavailable;
- ingest starvation bound;
- large-result backpressure;
- query health/block/disable policy.

Deliverable: resource-isolation contract + implementation owner.

## Planning Phase U — Multi-tab ownership and split-brain prevention

Prove how two independent authenticated Leumi tabs cannot create competing SQL Authorities against the same OPFS database.

Plan:

- owner discovery/election;
- stale-owner detection;
- takeover after page death;
- independent-tab Bookmarklet invocation;
- Viewer-only vs Recorder-owner roles;
- OPFS exclusivity failure handling.

Deliverable: cross-tab ownership protocol + tests/issues.

## Planning Phase V — Engine/schema upgrade and release compatibility lifecycle

Plan post-cutover upgrades, not only initial pinning:

- DuckDB-Wasm engine upgrade compatibility;
- storage-version compatibility;
- schema migrations across app releases;
- rollback when a newer engine has touched the DB;
- release manifest compatibility gates;
- upgrade verification evidence.

Deliverable: upgrade/release lifecycle contract.

## Planning Phase W — Final planning assurance and freeze

Run a final independent planning QA pass:

- mechanical requirements→decision→Issue→test traceability;
- dependency DAG and hard-gate audit;
- fresh-AI dry runs against representative Issues (early/core/live/cutover/cleanup);
- temporary-scaffolding ownership;
- unresolved-unknown inventory;
- Issue-body completeness;
- HOT-context budget/ownership guards;
- final Fast CI.

Only a green Phase-W planning freeze may hand the next chat to WP-01 implementation.

## Planning non-goals

This planning project does not implement DuckDB-Wasm, OPFS integration, SQL runtime, scheduler, viewer replacement, migration, benchmark harness or production code.

It also does not define the final trading formula, entry/exit execution logic or a fixed analytical query.
