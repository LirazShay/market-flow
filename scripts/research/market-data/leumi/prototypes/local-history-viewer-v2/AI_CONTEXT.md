# AI Context — Local History Viewer V2

Compact continuation context only. Live progress/current/next belong only in:

~~~text
STATUS.json
~~~

Fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current task docs/code/tests/specs only
~~~

Cold history remains discoverable at:

~~~text
docs/history/README.md
~~~

## Baseline vs target

Implemented baseline is still the inherited IndexedDB V2 runtime:

~~~text
authenticated Leumi page
→ Recorder
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ Viewer rereads IndexedDB
~~~

Active planning target is Browser-only SQL:

~~~text
authenticated Leumi page
→ Recorder / Collector
→ Runtime Controller
→ one SQL Authority Worker
   → DuckDB-Wasm
   → persistent OPFS DuckDB
   → atomic ingest
   → SQL scheduler/execution
→ Viewer client(s)
~~~

Production Browser SQL implementation must not begin until planning reaches implementation handoff.

## Durable decisions

~~~text
D-025 Browser-only SQL boundary
D-026 one SQL Authority Worker
D-027 snapshot-centric relational model
D-028 atomic enriched cycle ingest
D-029 immutable SQL versions + anchored non-overlapping scheduler
D-030 OPFS checkpointed durability + idempotent recovery
D-031 pinned browser runtime delivery
D-032 Viewer as detachable Runtime Controller client
D-033 Node + Chromium + live-Leumi verification layers
~~~

Decision files:

~~~text
../../../../../../../docs/project/decisions/D-025.md ... D-033.md
~~~

## Core target contracts

Data:

- canonical security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- preserve full raw MapHeat + full raw Security;
- preserve `null != 0 != "" != undefined`;
- snapshot identity is separate from security identity;
- one successful cycle has `UNIQUE(cycle_id, security_id)`;
- latest is a pointer to authoritative snapshot history;
- core horizons: 10, 20, 30, 60, 90, 120, 300, 600 seconds;
- missing horizon history stays NULL;
- DealsDelta stays disabled until provider reset semantics are verified.

Ingest:

~~~text
complete validated cycle
→ immutable handoff
→ defensive authority validation
→ one bulk operation
→ SQL enrichment
→ one transaction
→ COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

Every handoff carries stable UNIQUE `ingest_token` for retry/recovery reconciliation.

SQL:

- user analysis changes by immutable query version, not application rebuild;
- analytical SQL is read-only via statement classification + DuckDB hardening;
- cadence is anchored and independent from collection cadence;
- no overlapping queries; missed ticks coalesce;
- validated cycle commit outranks pending analytical execution;
- latest execution and latest successful execution stay distinct;
- hard cancellation is not assumed until proven in pinned Wasm.

Viewer:

- Viewer never opens DuckDB/OPFS;
- attach/re-attach obtains a full state snapshot;
- notifications are hints, not authority;
- multiple Viewers share one runtime;
- stale SQL editor activation is rejected optimistically;
- bounded result preview is runtime memory; execution metadata persists.

## Browser/runtime gate

Planned delivery keeps Market Flow code self-contained while exact pinned DuckDB Worker/Wasm assets are loaded through the selected browser bootstrap.

Before heavy Browser SQL implementation, live authenticated-Leumi verification must prove with synthetic data:

~~~text
injected JS / Bookmarklet
→ Blob Worker
→ pinned DuckDB Worker/Wasm
→ OPFS write
→ COMMIT + CHECKPOINT
→ refresh/relaunch
→ reopen + verify
~~~

CI cannot substitute for this real-page CSP/origin proof.

## Testing

~~~text
pure deterministic logic → Node
Worker/Wasm/OPFS/runtime/Viewer → Playwright Chromium
real Leumi CSP/origin/provider behavior → live verification
~~~

Tests protect observable contracts, not private internals. Fast CI is the normal push/PR gate; Browser CI is used for browser-dependent final states and Stage closure.

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
~~~

Read only the current-phase artifact(s) from this list.

## V2 isolation / implementation map

Browser identities:

~~~text
IndexedDB baseline: market-flow-leumi-history-v2
channel:            market-flow-leumi-v2
viewer window:      market-flow-leumi-v2-viewer
runtime:            market-flow-v2.*
~~~

Code ownership:

~~~text
recorder/   provider collection
storage/    implemented IndexedDB baseline
messaging/  implemented BroadcastChannel baseline
viewer/     implemented Viewer baseline
runtime/    generated runtime/Bookmarklet
tests/      Node + Playwright + fixtures
specs/      implemented baseline contracts
~~~

Do not modify frozen V1 merely to make V2 easier.
