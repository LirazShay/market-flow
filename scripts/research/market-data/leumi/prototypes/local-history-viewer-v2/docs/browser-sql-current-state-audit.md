# Browser SQL Migration — Current-State Audit

This document is durable planning evidence for the transition from the inherited Local History Viewer V2 baseline to Browser SQL.

It does not contain live progress. `../STATUS.json` owns the current pointer.

## Audit purpose

Establish what is already proven, what is inherited, what should be retained as behavior, what is replaceable implementation detail, what became stale after the Browser-only decision, and what remains unknown.

Use:

~~~text
Verified
Inferred
Unknown
~~~

## Current implemented baseline — Verified

Frozen V1 implements:

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ exact complete-cycle validation
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ Viewer rereads IndexedDB
→ current/history/diagnostics
→ generated browser runtime
~~~

V2 began as an exact V1 clone and then isolated its persistent/runtime identity.

Current V2 code still implements the inherited architecture:

~~~text
authenticated browser
→ Recorder
→ validated complete cycle
→ IndexedDB
→ BroadcastChannel notification
→ same-origin Viewer
~~~

Current V2 identities include:

~~~text
IndexedDB        market-flow-leumi-history-v2
BroadcastChannel market-flow-leumi-v2
Viewer window    market-flow-leumi-v2-viewer
runtime          market-flow-v2.*
~~~

## Proven contracts worth preserving

- dynamic universe; no hardcoded universe size;
- canonical security ID as `String(PaperId or Key)`;
- requested/received/unique/duplicate/missing/unexpected integrity checks;
- full raw MapHeat and Security preservation;
- `null != 0 != "" != undefined`;
- complete-cycle validation before market-state persistence;
- atomic successful-cycle visibility;
- failure cannot leave partial latest/history;
- one Recorder owner;
- authenticated browser collection;
- viewer recovery from durable browser state;
- generated runtime from repository sources;
- unit + Playwright/Chromium testing discipline.

## Current storage — Verified

Stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

Important current behavior:

- history primary identity: `[cycleId, securityId]`;
- history security/time access: `[securityId, collectedAtMs]`;
- latest: one row per security;
- successful cycle uses one transaction across `cycles + history + latest + meta`;
- Recorder exposes success only after commit.

The IndexedDB implementation is replaceable. The coherent-cycle behavior is not.

## Messaging and Viewer — Verified

Current successful flow:

~~~text
durable commit
→ CYCLE_COMMITTED metadata
→ Viewer rereads DB
~~~

BroadcastChannel is notification-only, not market-data authority.

Viewer currently reads current/history from IndexedDB, preserves null/zero display distinction, supports deterministic sorting, diagnostics and reopen from durable state.

The notification-only principle is reusable. BroadcastChannel itself is TBD.

## Runtime delivery — Verified

V2 currently generates:

~~~text
market-flow-v2.runtime.js
market-flow-v2.bookmarklet.txt
~~~

The current Bookmarklet is self-contained.

Browser SQL may make this packaging impractical because WASM/Workers/assets have different loading constraints. Packaging therefore remains TBD.

## Preliminary retain / adapt / replace / remove matrix

| Responsibility | Preliminary disposition | Rationale |
|---|---|---|
| authenticated browser collection boundary | RETAIN | provider authentication already exists there |
| dynamic universe | RETAIN | proven |
| canonical SecurityId | RETAIN | established identity boundary |
| provider completeness validation | RETAIN | core data integrity |
| sequential chunking baseline | RETAIN initially | no need to change merely for SQL migration |
| complete-cycle handoff | RETAIN | clean storage boundary |
| full raw preservation | RETAIN | future SQL needs unknown fields |
| atomic successful-cycle visibility | RETAIN | SQL must never see half-cycle success |
| IndexedDB market-history authority | REPLACE / TRANSITION | Browser SQL DB is target authority |
| IndexedDB physical schema | REPLACE | implementation-specific |
| latest behavior | RETAIN CONCEPT / REDESIGN | current-universe SQL remains core |
| history behavior | RETAIN CONCEPT / REDESIGN | append history remains core |
| BroadcastChannel | TBD | pattern useful; transport not selected |
| Viewer | ADAPT / PARTIAL REPLACE | behavior useful, storage coupling changes |
| diagnostics | RETAIN / ADAPT | required |
| one Recorder owner | RETAIN | avoids duplicate collection |
| one SQL DB/Worker owner | UNKNOWN | requires Browser SQL concurrency research |
| self-contained Bookmarklet | TBD | WASM/Worker loading may change delivery |
| generated delivery from source | RETAIN PRINCIPLE | avoids forked runtime logic |
| debug bundle | RETAIN / ADAPT | useful diagnostics |
| V1 | RETAIN FROZEN | reference only |
| current V2 IndexedDB implementation | TRANSITIONAL | baseline/migration source, not target engine |

This is preliminary planning evidence, not final target architecture.

## Existing planning already worth reusing

- `docs/product/live-opportunity-discovery.md`;
- `docs/product/live-sql-query-execution.md`;
- `docs/sql-live-analytics-design.md`;
- `docs/sql-live-engine-benchmark-plan.md`;
- inherited V1/V2 specs/tests;
- archived IndexedDB-primary research.

Do not recreate parallel versions without an ownership need.

## Stale/contradictory planning found

### Local/native as active candidate

Earlier SQL planning still retained localhost/native DuckDB as an active or conditional path.

That is superseded for this planning cycle.

Current rule:

~~~text
Browser SQL is fixed.
No localhost/native implementation, benchmark track or implementation Issues.
A future non-browser path requires a new explicit architecture decision.
~~~

### Product wording

The product SQL document previously allowed browser-embedded or local/native execution. That is stale relative to the later Browser-only constraint.

### Benchmark wording

The benchmark document previously planned a browser-vs-native engine comparison. The correct current question is whether Browser SQL satisfies the required workloads and where browser optimization is needed.

### Inherited V2 specs

Some V2 specs still carry V1 identity strings/titles even though V2 code already uses isolated V2 identities.

Those are baseline documentation defects, not target Browser SQL decisions.

## Major gaps not yet designed

### External capability evidence — Unknown

- current DuckDB-Wasm capabilities/version;
- persistence/OPFS semantics;
- origin implications;
- concurrency/locking;
- Worker requirements;
- CSP/CORS/module/WASM loading in the Leumi environment;
- interruption/cancellation;
- memory/large-DB behavior;
- browser background lifecycle.

### Target architecture — Unknown

- SQL Worker ownership;
- DB connection ownership;
- latest/current representation;
- result delivery;
- viewer query ownership;
- BroadcastChannel role;
- startup/recovery orchestration.

### Data model — Unknown

- physical SnapshotId;
- raw JSON vs typed columns;
- SQL types;
- temporal relation representation;
- core metric representation;
- schema versioning;
- time/percent/price units.

### SQL runtime — Unknown

- scheduling clock;
- overrun;
- read-only user SQL enforcement;
- admin/DDL separation;
- timeout/cancellation;
- result materialization limit;
- query versioning.

### Persistence/recovery — Unknown

- authoritative browser persistence API;
- refresh/reopen;
- schema upgrade;
- quota/eviction;
- retention;
- corruption handling;
- export/backup.

### Migration — Unknown

- migrate/ignore/import existing V2 IndexedDB history;
- coexistence boundary;
- authority cutover;
- rollback points.

## Important inference

**Inferred, not yet a target design decision:**

The existing Recorder already hands a complete validated cycle to a distinct persistence responsibility. That suggests the collector can probably be retained while the persistence implementation changes.

The target design must validate that at observable contract boundaries rather than preserve private module structure by accident.

## Planning consequence

Do not create the implementation backlog yet.

Correct sequence:

~~~text
audit
→ requirements
→ browser constraints
→ official capability research
→ target architecture
→ detailed data/runtime/recovery/testing/performance/migration planning
→ completeness audit
→ implementation decomposition
→ GitHub Issues
~~~

The planning order is owned by `../ROADMAP.md`.
