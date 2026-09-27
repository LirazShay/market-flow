# Browser SQL V2 — Compact Target Architecture

## Role

This is the current architecture for initial Browser SQL V2.

Durable product/data boundary:
`../../../../../../../docs/project/decisions/D-043.md`

Durable implementation baseline:
`../../../../../../../docs/project/decisions/D-044.md`

Live progress belongs only in `../STATUS.json`.

## 1. Topology

~~~text
Authenticated Leumi page
│
├─ existing Recorder / Collector
│  └─ MapHeat2 → sequential GetSecuritiesData → exact complete-cycle validation
│
└─ Runtime Controller
   ├─ production-owner boundary
   ├─ SQL Worker bridge
   └─ Viewer bridge
        │
        ▼
   one SQL Authority Worker
   ├─ pinned DuckDB-Wasm
   ├─ one persistent OPFS DB
   ├─ atomic raw/current/history writes
   ├─ trusted application reads
   └─ read-only Scanner execution

Viewer surface(s)
├─ Current Universe
├─ Security Detail/History
└─ Dynamic SQL Scanner
~~~

Viewer surfaces are clients. They do not independently own DuckDB/OPFS.

The Dynamic SQL Scanner is additive and does not replace the V1-derived Current Universe or Security Detail/History surfaces.

## 2. Provider continuity

~~~text
authenticated page
→ MapHeat2 dynamic universe
→ sequential GetSecuritiesData
→ exact validation
→ one validated complete cycle
~~~

Preserve canonical IDs, dynamic universe, exact accounting, full raw facts and null/zero/empty/missing distinctions. Unknown provider semantics remain unknown.

## 3. SQL authority

The SQL Worker owns the persistent DuckDB-Wasm/OPFS database.

After cutover:

~~~text
DuckDB/OPFS = only new market-history authority
~~~

The minimum initial schema supports cycle/snapshot identity, current/latest state, raw MapHeat, raw Security history, stable history ordering and small trusted reads.

No fixed persisted horizon/metric/predecessor matrix is required.

## 4. Successful cycle

~~~text
Recorder collects
→ exact validation
→ one validated-cycle handoff
→ SQL transaction
→ atomic current/history/latest state
→ selected proven durability boundary
→ success acknowledgement
→ notification hint
→ clients reread authority
~~~

Failed provider validation or SQL persistence does not create a successful authoritative cycle.

The exact CHECKPOINT/retry/idempotency mechanism is evidence-driven and owned by C03.

## 5. Trusted reads

Approximate semantic read surface:

~~~text
getCurrentUniverse()
getSecurityCurrent(SecurityId)
getSecurityHistoryPage(SecurityId, cursor, limit)
getHealth/readiness()
~~~

Viewer code should not depend on physical table layout.

## 6. Scanner

~~~text
draft SQL + interval
→ explicit Activate
→ one active config
→ read-only SQL
→ one execution at a time
→ truthful result/error
~~~

Committed-state reads only; zero rows is success; no hidden analytical semantics; no overlap or burst replay.

Persist only the current active config for initial restart usefulness.

Immutable query history, anchored scheduler machinery, mandatory streaming and advanced cancellation/preemption are not baseline architecture.

## 7. Analytical optimization

~~~text
real query
→ representative day-sized measurement
→ sufficient? stop
→ insufficient? smallest targeted optimization
~~~

Typed promotions, engine-specific optimizations, predecessor references or derived metrics are optional and must earn their cost.

## 8. Cross-tab ownership

~~~text
stable exclusive Web Lock
→ holder starts production runtime
→ loser remains passive
~~~

No heartbeat election, localStorage authority or `steal:true`.

Authenticated-origin ownership proof belongs before final cutover, not as an early blocker for all SQL work.

## 9. Storage and compatibility

~~~text
retain committed history
→ no silent pruning
→ no silent reset
→ explicit failure if safe persistence cannot continue
~~~

Unsupported DB/schema compatibility blocks writable startup and preserves the DB unchanged.

Archive/rollover and generalized upgrade machinery are conditional/future.

## 10. Runtime restart

~~~text
page/runtime restarts
→ reacquire ownership when allowed
→ create Worker
→ reopen same DB
→ compatibility/readiness
→ resume Recorder
→ load active Scanner config
→ run Scanner fresh
~~~

Correctness relies on persisted authoritative state, not Worker memory.

## 11. Security

Provider credentials/session state remain in the authenticated page/browser session.

The SQL Worker receives validated market data and application/query commands, not copied authentication secrets.

## 12. Verification

~~~text
Node → pure deterministic logic
Chromium → Worker/Wasm/OPFS/runtime/Viewer/Web Locks/Scanner
authenticated Leumi → real origin/provider facts only
~~~

Representative daily mixed workload is required before cutover.

## 13. Cutover

~~~text
stop old IndexedDB Recorder at settled boundary
→ preserve legacy local data
→ start fresh SQL production history
→ verify first cycles/reads
~~~

Rollback is explicit: stop SQL release, preserve SQL DB, run retained old release.

No history synchronization back to IndexedDB is required.

## 14. Implementation map

Dependency rationale:
`browser-sql-compact-execution-dag.md`

Issue-body source before GitHub materialization:
`browser-sql-compact-issue-specifications.md`

Actual Issue numbers belong in the GitHub execution map after materialization. Live completion remains only in `STATUS.json`.
