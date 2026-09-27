> **FROZEN / NOT EXECUTABLE:** Authenticated C01 failed at `wasm-instantiate`. D-045 replaces the Browser-SQL process boundary with localhost Node.js + loopback WebSocket + native DuckDB. This file is retained as planning history/reference while the 100-stage replacement plan is materialized. Follow `STATUS.json`, not the C01-C12 graph below.

# Local History Viewer V2 — Browser SQL Implementation Roadmap

This file owns stable implementation scope and order.

Live progress, current focus and verification results belong only in `STATUS.json`.

Durable boundaries:

~~~text
D-043 = provider/data continuity + three product surfaces
D-044 = post-KISS Browser SQL implementation baseline
~~~

Current GitHub execution authority:

~~~text
Master #85
C01..C12 = #73..#84
~~~

## Fixed product and integrity constraints

V1 provider/collection continuity is preserved while storage and analytical authority change.

- preserve the proven authenticated MapHeat2 → sequential GetSecuritiesData contract;
- canonical SecurityId = `String(PaperId or Key)`;
- no hardcoded universe size;
- validate requested/received/unique/duplicate/missing/unexpected accounting;
- preserve full raw MapHeat and Security facts;
- preserve `null != 0 != "" != undefined`;
- incomplete/corrupt cycles do not advance authoritative state;
- successful cycle persistence is atomic;
- DuckDB-Wasm/OPFS becomes the sole new market-history authority after cutover;
- Viewer uses trusted reads; notifications are hints;
- Scanner is read-only and non-overlapping;
- one exclusive Web Lock owner controls production DB/Recorder;
- no silent DB delete/reset.

## Group 1 — Feasibility + SQL Core

~~~text
completed evidence #29/#30
→ C01 #73 real-origin DuckDB L-1
→ C02 #74 minimum SQL runtime + schema
→ C03 #75 atomic persistence + reopen/durability
→ C04 #76 Recorder integration + trusted reads
~~~

C10 #82 Web Lock ownership may start after C02 #74 in parallel with C03-C09 work.

## Group 2 — V1 Product on SQL

~~~text
C04 #76
├→ C05 #77 Current Universe SQL parity
└→ C06 #78 Security Detail/History SQL parity + bounded L-2
~~~

C05 and C06 are separate preserved product surfaces and may progress in parallel.

Both must be complete before new analytical product work becomes the active dependency path.

## Group 3 — Analytics + Dynamic SQL Scanner

~~~text
C05 #77 + C06 #78
├→ C07 #79 real analytical SQL + representative day-sized measurement
└→ C08 #80 Scanner core → C09 #81 Scanner UI/results/integration
~~~

C07 and C08/C09 intentionally run in parallel.

The Scanner does not depend on precomputed enrichment.

C07 may conclude that dynamic SQL is sufficient and no persisted analytical optimization is needed.

## Group 4 — Daily Readiness + Cutover

~~~text
C07 #79 + C09 #81 + C10 #82
→ C11 #83 representative daily mixed workload
→ C12 #84 final authenticated verification + explicit cutover/rollback/cleanup
~~~

Cutover starts fresh SQL production history. There is no required legacy IndexedDB history import, permanent dual authority or automatic fallback.

## Conditional work — create only from evidence

No standing Issues exist for these paths.

- **O1 analytical optimization** — only if C07/#79 proves an important query is materially too slow/awkward.
- **O2 Scanner resource hardening** — only if C11/#83 proves Scanner materially harms ingest after simpler fixes fail.
- **O3 streaming/chunked results** — only if C09/#81 or C11/#83 proves simple materialization is unsafe/unusable.
- **O4 storage/export/fresh-DB workflow** — only if C11/#83 proves retain-all cannot support required daily use.
- **O5 target Windows/Chrome evidence** — only if C11/#83 shows normal Chromium evidence is insufficient for a material target decision.
- **O6 temporary shadow comparison** — only if C06/#78 leaves one specific material live parity uncertainty unresolved.

Conditional rejoin rules are strict:
- O1 may be triggered by C07, but C11 cannot start on the optimized candidate until O1 is complete and every earlier contract actually touched by it is reverified;
- O2/O4 and C11-triggered O3 keep C11 open until the branch rejoins and C11 is green again;
- C09-triggered O3 keeps C09 open until affected result behavior is green;
- O5 is evidence-only unless its result forces a candidate change; C11 remains open until that target evidence is green;
- O6 keeps C06 open until the named parity ambiguity is resolved, temporary shadow is retired and affected C06 proof is green.

No conditional creates a permanent extra phase or independent source of truth.

## Verification model

~~~text
Node
→ pure deterministic logic

Chromium
→ Worker/Wasm/OPFS/runtime/Viewer/Web Locks/Scanner integration

authenticated Leumi
→ only real-origin/provider facts that CI cannot prove
~~~

Permanent normal workflows remain Fast CI and Browser CI.

C01/#73 is the early live premise for Worker/Wasm/OPFS/write/COMMIT/close-reopen only. Real-origin Web Lock proof belongs to C12/#84.

## Initial-V2 non-goals

- generalized engine/schema migration framework;
- automatic archive/rollover orchestration;
- restore/import or multi-epoch query federation;
- immutable history of every SQL edit;
- collaborative SQL editing;
- generic cancellation/preemption platform;
- rich telemetry/incident platform;
- final trading formula;
- order placement/execution.

## Execution authority

GitHub Master #85 and executable Issues #73..#84 own executable work.

Dependency rationale:

~~~text
docs/browser-sql-compact-execution-dag.md
~~~

Design/specification reference:

~~~text
docs/browser-sql-compact-issue-specifications.md
~~~

Issue-number navigation:

~~~text
docs/browser-sql-github-execution-structure.md
~~~

This ROADMAP owns only stable scope/order. `STATUS.json` remains the only live progress pointer.
