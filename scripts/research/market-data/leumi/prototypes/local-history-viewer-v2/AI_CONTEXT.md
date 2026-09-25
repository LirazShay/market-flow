# AI Context — Local History Viewer V2

Compact continuation context only. Live progress/current/next belong only in `STATUS.json`.

Fresh-chat order:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current Issue/task docs/code/tests/specs only
~~~

## Baseline vs target

Implemented baseline:

~~~text
authenticated Leumi page
→ Recorder
→ atomic IndexedDB persistence
→ Viewer rereads IndexedDB
~~~

Planned target:

~~~text
authenticated Leumi page
→ Recorder
→ Runtime Controller
→ one SQL Authority Worker
   → DuckDB-Wasm + persistent OPFS
   → atomic ingest + SQL scheduler
→ Viewer client(s)
~~~

## Durable decisions

Browser SQL decisions are `D-025` through `D-037`.

Key execution source:

~~~text
docs/browser-sql-implementation-decomposition.md
~~~

It defines 8 implementation milestones, 38 issue-ready work packages and hard gates. Phase Q materializes them into GitHub Issues/milestones/labels/dependencies.

## Core contracts

Data:
- security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- preserve full raw MapHeat + Security;
- preserve `null != 0 != "" != undefined`;
- one successful cycle has unique `(cycle_id, security_id)`;
- horizons = 10, 20, 30, 60, 90, 120, 300, 600 seconds;
- missing history = NULL;
- DealsDelta remains disabled until reset semantics are Verified.

Ingest:

~~~text
validated cycle
→ immutable handoff + stable ingest_token
→ one bulk operation
→ SQL enrichment
→ one transaction
→ COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

SQL:
- immutable query versions;
- read-only analytical statement classification + DuckDB hardening;
- independent anchored cadence;
- no overlap; missed ticks coalesce;
- cycle commit outranks pending query;
- latest execution != latest successful execution.

Viewer:
- never opens DuckDB/OPFS;
- attach/re-attach gets a full state snapshot;
- notifications are hints only;
- multiple Viewers share one runtime;
- stale query activation is rejected;
- result preview is bounded runtime memory.

Persistence/recovery:
- one origin-scoped OPFS authority;
- no destructive automatic reset;
- ambiguous retry reconciles ingest_token;
- unclosed sessions/executions become interrupted;
- quota/durability/schema failures block or require recovery.

Health/security:
- recovery-required > blocked > degraded > healthy;
- provider auth stays in the authenticated page;
- no cookies/tokens/auth headers/account data in Worker/Viewer/repo/diagnostics;
- diagnostics are sanitized/local; no external telemetry baseline.

## Mandatory live gate

Before heavy Browser SQL authority work:

~~~text
injected JS / Bookmarklet
→ Blob Worker
→ exact pinned DuckDB Worker/Wasm
→ probe OPFS write
→ COMMIT + CHECKPOINT
→ refresh/reopen
→ verify
~~~

This must be directly Verified on the real authenticated Leumi page with synthetic data. CI cannot substitute for it.

## Testing

~~~text
deterministic logic → Node
Worker/Wasm/OPFS/runtime/Viewer → Playwright Chromium
real Leumi CSP/origin/provider behavior → live verification
~~~

Fast CI is the normal push/PR gate. Browser-dependent numbered implementation checkpoints require full Browser CI.

## Performance / cutover

Normal-profile benchmark gates target roughly 4x isolated and 2x mixed cadence headroom; full-session + 2x-session target Windows/Chrome evidence is required before cutover.

Cutover starts a fresh SQL history epoch. No initial legacy-history import, permanent dual-write/read, or silent IndexedDB fallback. Legacy IndexedDB remains inert until explicit cleanup.

## Navigation

Detailed planning/evidence is indexed by:

~~~text
docs/README.md
ROADMAP.md
docs/browser-sql-implementation-decomposition.md
docs/history/README.md
~~~

Read only the current Issue/package source docs.

## Implementation ownership

~~~text
recorder/   authenticated provider collection
storage/    current IndexedDB baseline; target SQL code lands deliberately
runtime/    controller/build/Bookmarklet
viewer/     UI/client
tests/      Node + Playwright + sanitized fixtures
specs/      implemented normative contracts
~~~

V2 remains isolated from frozen V1. Do not modify V1 merely to make V2 easier.
