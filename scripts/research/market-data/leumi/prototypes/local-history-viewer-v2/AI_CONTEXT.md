# AI Context — Local History Viewer V2

Compact continuation context only. Live progress/current/next belong only in `STATUS.json`.

Fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current task docs/code/tests/specs only
~~~

Cold history: `docs/history/README.md`.

## Baseline vs target

Implemented baseline:

~~~text
authenticated Leumi page
→ Recorder
→ validated cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ Viewer rereads IndexedDB
~~~

Planning target:

~~~text
authenticated Leumi page
→ Recorder
→ Runtime Controller
→ one SQL Authority Worker
   → DuckDB-Wasm + persistent OPFS
   → atomic ingest + SQL scheduler
→ Viewer client(s)
~~~

No Browser SQL implementation until planning reaches implementation handoff.

## Durable decisions

~~~text
D-025 Browser-only SQL
D-026 one SQL Authority Worker
D-027 snapshot-centric relational model
D-028 atomic enriched cycle ingest
D-029 immutable SQL versions + anchored non-overlapping scheduler
D-030 checkpointed OPFS durability + idempotent recovery
D-031 pinned browser runtime delivery
D-032 Viewer as detachable Runtime Controller client
D-033 Node + Chromium + live-Leumi verification
D-034 cadence-relative performance headroom
D-035 fresh SQL cutover epoch; no legacy-history import
D-036 scoped failures + worst-active health + sanitized diagnostics
~~~

Files: `../../../../../../../docs/project/decisions/D-025.md` through `D-036.md`.

## Core target contracts

Data:
- security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- preserve full raw MapHeat + Security;
- preserve `null != 0 != "" != undefined`;
- `UNIQUE(cycle_id, security_id)`;
- latest points to authoritative history;
- horizons: 10, 20, 30, 60, 90, 120, 300, 600 seconds;
- unavailable history = NULL;
- DealsDelta disabled until reset semantics are verified.

Ingest:

~~~text
validated cycle
→ immutable handoff
→ authority validation
→ one bulk operation
→ SQL enrichment
→ one transaction
→ COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

Stable UNIQUE `ingest_token` handles ambiguous retries.

SQL:
- analysis changes by immutable query version;
- user SQL is read-only via statement classification + DuckDB hardening;
- query cadence is independent and anchored;
- no overlap; missed ticks coalesce;
- cycle commit outranks pending query;
- latest execution != latest successful execution;
- do not assume hard cancellation until pinned Wasm proves it.

Viewer:
- never opens DuckDB/OPFS;
- attach gets full state snapshot;
- notifications are hints only;
- multiple Viewers share one runtime;
- stale SQL editor activation is rejected;
- result preview is bounded runtime memory; execution metadata persists.

## Browser/runtime gate

Before heavy Browser SQL implementation, real authenticated-Leumi verification with synthetic data must prove:

~~~text
injected JS / Bookmarklet
→ Blob Worker
→ pinned DuckDB Worker/Wasm
→ OPFS write
→ COMMIT + CHECKPOINT
→ refresh/relaunch
→ reopen + verify
~~~

CI cannot substitute for real-page CSP/origin proof.

## Testing

~~~text
deterministic logic → Node
Worker/Wasm/OPFS/runtime/Viewer → Playwright Chromium
real Leumi CSP/origin/provider behavior → live verification
~~~

Tests protect observable contracts, not private internals. Fast CI is the normal push/PR gate.

Performance: correctness first; normal-profile p95 targets retain ~4x isolated and ~2x mixed cadence headroom. Full-session + 2x-session evidence is required before cutover.

Cutover: isolated SQL shadow may verify while IndexedDB remains authority; production switches explicitly to fresh OPFS with no legacy import or silent fallback.

Health: scoped failures; recovery-required > blocked > degraded > healthy. Diagnostics are local/sanitized; no external telemetry baseline.

## Planning map

~~~text
ROADMAP.md
docs/browser-sql-current-state-audit.md
docs/browser-sql-requirements-and-acceptance.md
docs/browser-sql-browser-constraints.md
docs/browser-sql-official-capability-research.md
docs/browser-sql-target-architecture.md
docs/browser-sql-relational-data-model.md
docs/browser-sql-ingest-enrichment-atomicity.md
docs/browser-sql-execution-scheduler.md
docs/browser-sql-persistence-recovery.md
docs/browser-sql-runtime-delivery.md
docs/browser-sql-viewer-result-delivery.md
docs/browser-sql-testing-verification-strategy.md
docs/sql-live-engine-benchmark-plan.md
docs/browser-sql-migration-cutover.md
docs/browser-sql-failure-security-observability.md
~~~

Read only current-phase artifacts.

## Implementation map / isolation

~~~text
recorder/   provider collection
storage/    current IndexedDB baseline
messaging/  current BroadcastChannel baseline
viewer/     current Viewer baseline
runtime/    generated runtime/Bookmarklet
tests/      Node + Playwright
specs/      current implemented contracts
~~~

V2 identities remain isolated from frozen V1. Do not modify V1 merely to make V2 easier.
