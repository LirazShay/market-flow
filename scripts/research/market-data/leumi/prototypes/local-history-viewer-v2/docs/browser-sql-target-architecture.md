# Browser SQL — Target Architecture

This document is the Phase E target-architecture artifact for Local History Viewer V2.

It defines component ownership and system flow. It intentionally does not define the relational schema, exact Arrow payload shape, query-overrun policy, retention policy, runtime packaging or implementation backlog.

Live progress remains owned by `../STATUS.json`.

Durable architecture decision:

~~~text
../../../../../../../docs/project/decisions/D-026.md
~~~

## 1. Selected topology

Target:

~~~text
Authenticated Leumi page
│
├─ Runtime Controller
│  ├─ Recorder / Collector
│  ├─ SQL Worker bridge
│  └─ Viewer bridge
│
└─ Dedicated SQL Authority Worker
   ├─ DuckDB-Wasm
   ├─ one persistent OPFS DuckDB database
   ├─ serialized DB command coordination
   ├─ successful-cycle transaction execution
   ├─ active SQL + query scheduler
   └─ query execution + result/error production

Viewer window(s)
└─ read-only clients of the active Runtime Controller / SQL Authority
   └─ no direct OPFS/DuckDB ownership
~~~

The architectural baseline is single-threaded DuckDB-Wasm.

The threaded `coi` bundle is not part of the required architecture and may only become an optimization after real-page evidence proves cross-origin isolation and stability.

## 2. Authority model

### Market-history authority

The persistent Browser SQL database owned by the SQL Authority Worker is the target authoritative market-history store.

After migration completes:

~~~text
DuckDB-Wasm + OPFS database
= market-history source of truth
~~~

IndexedDB may exist temporarily during migration, but must not remain a co-equal authority after cutover.

### Write authority

Exactly one SQL Authority Worker coordinates successful market-cycle writes.

Collector, Viewer and other browser windows do not independently mutate authoritative SQL market history.

### Query authority

The same SQL Authority Worker owns execution of the active analytical SQL.

This avoids assuming unverified multi-instance or cross-tab OPFS semantics.

### Viewer authority

Viewer state is presentation state only.

Viewer windows do not become a second source of truth and do not open independent authoritative DuckDB/OPFS handles in the baseline architecture.

## 3. Component responsibilities

| Component | Owns | Does not own |
|---|---|---|
| Authenticated Leumi page | provider session/origin | SQL persistence internals |
| Recorder / Collector | universe discovery, provider calls, chunking, complete-cycle validation | durable SQL writes, user SQL execution |
| Runtime Controller | lifecycle orchestration, singleton ownership, Worker bridge, Viewer bridge | authoritative market history, SQL execution |
| SQL Authority Worker | DuckDB-Wasm instance, persistent DB handle, serialized DB operations, active SQL runtime, scheduler, query execution | provider authentication/fetching, UI rendering |
| Persistent DuckDB/OPFS DB | committed market-history authority | ephemeral UI state |
| Viewer | query input/control surface, results/diagnostics presentation | provider calls, authoritative market writes, direct DB ownership |
| Messaging bridge | control/result/notification transport | authoritative durable market state |

## 4. Why one dedicated SQL Authority Worker

This is the simplest architecture consistent with current evidence.

Current research established:

- normal DuckDB-Wasm is Worker-based and single-threaded;
- OPFS uses Worker-only synchronous handles;
- an OPFS file may be held by only one handle at a time;
- cross-tab/multi-instance OPFS behavior is not sufficiently proven for our target;
- at Phase E, query cancellation was not yet a verified Wasm primitive; Phase T later established a preemption/resource-isolation contract and requires exact pinned-build proof in WP-40.

Therefore the architecture deliberately avoids:

~~~text
Viewer A → opens DB
Viewer B → opens DB
Recorder tab → opens DB
another Worker → opens DB
~~~

Instead:

~~~text
all authoritative DB operations
→ one SQL Authority Worker
~~~

This is KISS plus correctness, not an optimization claim.

## 5. DB-operation coordination

The SQL Authority Worker owns one logical serialization boundary for DB-affecting work.

Conceptually:

~~~text
validated cycle commit
scheduled analytical query
query-definition update
maintenance/checkpoint command
recovery/admin command
→ one authority
→ deterministic coordination
~~~

The later ingest and scheduler phases will define priority, queuing, backpressure and overrun semantics.

Phase E only fixes this rule:

> No uncontrolled concurrent owners may race against the authoritative database.

The implementation may use one or more internal DuckDB connections only if later evidence proves that safe and useful; internal connection count is not an architecture contract.

## 6. Startup sequence

Target startup:

~~~text
1. user launches Market Flow on authenticated Leumi page
2. Runtime Controller enforces one active owner for that page/runtime identity
3. Controller creates SQL Authority Worker
4. Worker loads pinned DuckDB-Wasm assets
5. Worker opens/reopens the persistent OPFS database
6. Worker completes required recovery/schema-readiness checks
7. Worker reports READY
8. Controller starts/resumes Recorder
9. Worker starts/resumes active SQL scheduling according to later scheduler contract
10. Viewer may attach/re-attach through Controller
~~~

Important rule:

The Recorder must not expose a successful durable cycle before the SQL Authority confirms commit.

Exact startup failure/retry policy belongs to Phase I / O.

## 7. Successful collection cycle

Target data path:

~~~text
Recorder
→ discover/fetch provider data
→ validate exact complete cycle
→ immutable validated-cycle handoff
→ Runtime Controller bridge
→ SQL Authority Worker
→ BEGIN transaction
→ write full cycle + required related state
→ COMMIT
→ durability/checkpoint behavior per persistence contract
→ success acknowledgement
→ Recorder may expose successful committed cycle
→ Viewer notification/result refresh
~~~

The collector never marks the cycle durably successful merely because provider collection succeeded.

The exact relational writes and Arrow/bulk-ingest representation are deferred to Phases F and G.

## 8. Failed collection cycle

If provider collection or validation fails:

~~~text
no validated-cycle handoff
→ no authoritative DB mutation for that attempted cycle
~~~

If SQL persistence fails before successful commit:

~~~text
transaction fails/rolls back
→ no successful-cycle acknowledgement
→ previous committed state remains authoritative
→ failure is observable
~~~

This preserves the V1/V2 integrity contract while changing the storage engine.

## 9. Scheduled analytical SQL flow

Target:

~~~text
SQL Authority Worker
→ scheduler reaches due execution
→ capture active SQL identity/version
→ execute against committed authoritative DB state
→ 0..N rows or explicit error
→ record execution metadata
→ publish result/error to Runtime Controller
→ Viewer client(s)
~~~

A query failure:

- does not invalidate committed market history;
- does not silently stop the Recorder;
- does not overwrite the identity of the previous successful result;
- must leave the DB command coordinator usable for subsequent work.

Exact scheduling interval, overrun and timeout behavior are Phase H decisions.

## 10. Query update flow

Target:

~~~text
Viewer / future SQL editor
→ Runtime Controller
→ SQL Authority Worker
→ activate a new SQL definition/version at a deterministic boundary
→ later scheduled executions use that version
~~~

The Viewer does not rewrite application/collector source code to change analysis.

The exact persistence of query definitions and activation semantics are deferred.

## 11. Viewer model

Viewer windows are clients, not DB owners.

Baseline target:

~~~text
Viewer
→ request/control message
→ Runtime Controller
→ SQL Authority Worker when DB/query work is needed

SQL Authority Worker
→ result/status/error message
→ Runtime Controller
→ one or more Viewer windows
~~~

Consequences:

- no direct OPFS handle per Viewer;
- no duplicated DB authority;
- no requirement for SharedWorker merely to support multiple Viewers;
- closing a Viewer does not stop Recorder/SQL authority;
- reopening a Viewer attaches to the active runtime and reconstructs presentation from authoritative/runtime state.

The exact messaging mechanism remains Phase K work. BroadcastChannel may be reused where useful, but is not mandated by this architecture.

## 12. Page refresh / owner loss

A Dedicated Worker is tied to its owning page/runtime and may disappear when that owner is refreshed or closed.

The architecture therefore relies on persistent DB state, not Worker memory, for market-history recovery.

Conceptually after refresh:

~~~text
new Runtime Controller
→ new SQL Authority Worker
→ reopen same persistent DB
→ recovery/readiness
→ resume collection/query runtime
~~~

Exact WAL/checkpoint/reopen semantics, query-definition persistence and interrupted-operation handling belong to Phase I.

## 13. Background/hidden tab behavior

Phase D did not prove exact hidden-tab/Worker scheduling behavior on the authenticated Leumi site.

Therefore:

- correctness must not depend on an undocumented promise that timers run at exact cadence while hidden;
- the scheduler remains logically owned by the SQL Authority Worker;
- cadence precision and degraded/background behavior require Phase H/L/M verification.

This does not move the scheduler back into the main page; page timers have the same class of browser-lifecycle uncertainty and would duplicate ownership.

## 14. Security boundary

Provider credentials/session material remain in the authenticated page/browser session.

The Worker receives:

- validated market data;
- query/configuration commands;
- schema/admin commands defined by Market Flow.

It does not need copied browser cookies, authorization headers or account secrets merely to execute analytics.

Viewer/result messages must not become a secret-bearing transport.

## 15. Single-thread-first rule

The target architecture assumes the normal single-thread DuckDB-Wasm path.

No architecture requirement depends on:

- SharedArrayBuffer;
- cross-origin isolation;
- `coi`;
- Wasm parallel query execution.

If later evidence proves threaded execution available and materially useful, it can optimize the SQL Authority internally without changing the authority boundary.

## 16. Phase-E deferred decisions and later ownership

Phase E intentionally did not decide the items below. Later phases F–V resolved them or assigned exact evidence to implementation Issues; this is historical phase-boundary context, not a current unowned list:

- table names/columns/types;
- SnapshotId physical representation;
- raw JSON vs promoted columns;
- temporal-link schema;
- Arrow batch schema;
- exact transaction statements;
- query scheduling skip/delay/timeout policy;
- hard cancellation behavior;
- OPFS checkpoint cadence;
- retention/cleanup;
- asset packaging/Bookmarklet replacement;
- exact result payload format;
- exact Viewer transport;
- migration/import of old IndexedDB rows;
- exact pinned DuckDB-Wasm version.

These belong to later dedicated planning phases.

## 17. Architecture sequence summary

### Startup

~~~text
Page
→ Controller
→ SQL Worker
→ open/recover DB
→ READY
→ Recorder + Scheduler
~~~

### Ingest

~~~text
Provider
→ Recorder
→ validated complete cycle
→ SQL Worker
→ atomic commit
→ success acknowledgement
~~~

### Query

~~~text
SQL Worker scheduler
→ active SQL
→ committed DB
→ result/error
→ Controller
→ Viewer(s)
~~~

### Recovery

~~~text
page/runtime restarts
→ recreate Worker
→ reopen persistent DB
→ recover
→ resume
~~~

## 18. Phase E completion result

Selected architectural boundary:

~~~text
one authenticated page runtime
+
one Recorder
+
one dedicated single-authority SQL Worker
+
one persistent DuckDB-Wasm/OPFS market-history database
+
SQL scheduler inside that authority
+
Viewer clients without direct DB ownership
~~~

This architecture is now the basis for Phase F relational data-model planning.


## Phase U authority gate

The Runtime Controller is now cross-tab singular, not merely page-local. Before constructing SQL Authority Worker it must hold the stable exclusive V2 runtime-owner Web Lock. A second independent tab is passive and never opens production storage. The owner lock covers Recorder + storage authority across shadow, production, rollover and cutover phases.
