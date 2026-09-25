# AI Context — Local History Viewer V2

Compact continuation context only. Live current/next belongs only in `STATUS.json`.

Fresh chat:

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
→ current GitHub Issue
→ only docs/tests/specs linked by that Issue
~~~

## Target

~~~text
authenticated Leumi page
→ Recorder
→ Runtime Controller
→ one SQL Authority Worker
   → DuckDB-Wasm + persistent OPFS
   → atomic ingest + SQL scheduler
→ Viewer client(s)
~~~

V1 remains frozen. Browser-only SQL is fixed unless evidence reopens D-025.

## Execution baseline

Durable decisions: `D-025..D-042`.

~~~text
Master #20
Epics #21..#28
WP-01..WP-42
~~~

Mapping: `docs/browser-sql-github-execution-structure.md`.

Final assurance: `docs/browser-sql-final-planning-freeze.md`.

## Core invariants

- security ID = `String(PaperId or Key)`;
- no hardcoded universe size;
- preserve full raw MapHeat + Security and `null != 0 != "" != undefined`;
- one successful cycle is complete/atomic; no partial latest/history;
- horizons = 10,20,30,60,90,120,300,600 seconds; missing history = NULL;
- DealsDelta stays NULL until reset semantics are Verified.

Ingest:

~~~text
validated cycle + ingest_token
→ bulk SQL enrichment
→ one transaction
→ COMMIT
→ CHECKPOINT
→ acknowledgement
~~~

SQL:
- immutable query versions; read-only analytical gate + DuckDB hardening;
- anchored independent cadence; no overlap/catch-up burst;
- ingest preempts analytics;
- user SQL runs on disposable analytics connection;
- runtime-budget query is cancelled/suspended;
- one complete waiting cycle maximum;
- cancelled partial row count is never reported complete.

Persistence:
- one origin-scoped OPFS authority; no destructive auto-reset;
- retain-all default; no automatic history deletion;
- explicit archive + crash-recoverable rollover creates new database_epoch_id;
- quota/durability/schema ambiguity blocks acknowledgement.

Cross-tab:
- stable exclusive Web Lock `market-flow:local-history-viewer-v2:runtime-owner`;
- acquire before Worker/OPFS/provider startup;
- second tab passive; no steal/heartbeat/BC authority.

Upgrade:
- runtime/package/core/storage/schema identities are separate;
- compatible runtime-only release uses READ_ONLY preflight;
- persistence-affecting upgrade uses side-by-side candidate;
- rollback uses preserved old release + old DB snapshot.

Viewer:
- never opens DuckDB/OPFS;
- attach/re-attach receives full state snapshot;
- notifications are hints only;
- latest execution != latest successful result;
- preview memory is bounded.

Security:
- provider auth stays in authenticated page;
- no cookies/tokens/auth headers/account/private session data in Worker/Viewer/repo/diagnostics;
- diagnostics local/sanitized; no remote telemetry baseline.

## Mandatory evidence gates

Before WP-05+:

~~~text
WP-03 real authenticated-Leumi probe:
Bookmarklet/injected JS
→ Blob Worker
→ exact pinned Worker/Wasm
→ OPFS COMMIT+CHECKPOINT+reopen
→ two-tab exclusive Web Lock
~~~

CI cannot substitute for live-only evidence.

Testing:

~~~text
pure deterministic → Node
Worker/Wasm/OPFS/runtime/Viewer → Playwright Chromium
real Leumi behavior → live verification
performance/capacity → target Windows/Chrome benchmark
~~~

Production cutover is blocked by correctness/shadow/security/performance/storage-lifecycle/upgrade gates.

Read only the current Issue and its linked contracts. Do not preload all planning history.
