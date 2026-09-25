# Browser SQL — Persistence, Reopen and Recovery

This is the Phase I planning artifact for Local History Viewer V2.

It defines persistent database identity, durability acknowledgement, checkpoint policy, restart reconciliation, schema migration, scheduler/session recovery, storage persistence state, quota handling and corruption/reopen boundaries.

It does not define runtime asset packaging or Viewer delivery.

Durable decision: ../../../../../../../docs/project/decisions/D-030.md

## Persistent database identity

The target authoritative local database is one origin-scoped OPFS DuckDB file owned by the authenticated Leumi browser origin.

Logical identity:

~~~text
opfs://market-flow-v2.duckdb
~~~

The SQL Authority Worker is the sole normal runtime owner of the OPFS handle.

## Browser-storage durability class

At startup inspect:

~~~text
navigator.storage.persisted()
navigator.storage.persist()
navigator.storage.estimate()
~~~

Rules:

- persistent grant → durability = persistent;
- no grant → request persistence where supported;
- denied persistence → runtime may continue only as explicit best-effort durability;
- never describe best-effort storage as guaranteed;
- usage/quota are estimates, not exact accounting;
- explicit user clearing of site data remains possible.

## Exact package pin before authority cutover

Do not depend on floating npm tags such as latest or next.

Current official surfaces are inconsistent on 2026-09-25:

- DuckDB-Wasm documentation presents stable client version 1.5.5;
- npm still presents latest = 1.33.1-dev57.0 and next = 1.33.1-dev64.0;
- the official 2026-09-18 OPFS article identifies 1.33.1-dev57.0 as affected by a persistence regression.

Authority cutover therefore requires:

~~~text
exact package/artifact pinned
+ embedded DuckDB core version recorded
+ Chromium OPFS write/CHECKPOINT/reopen regression green
~~~

Version labels alone are not evidence.

## Durable market-cycle acknowledgement

Durable success boundary:

~~~text
BEGIN
→ cycle/snapshot/enrichment/current/latest writes
→ COMMIT
→ CHECKPOINT
→ durable-success acknowledgement
~~~

COMMIT establishes transactional visibility. CHECKPOINT is required before Market Flow tells the Recorder that the market cycle is durably persisted.

## ingest_token for acknowledgement ambiguity

Every complete validated-cycle handoff receives a stable opaque ingest_token before it is sent to the SQL Authority.

Target uniqueness:

~~~text
ingest_token VARCHAR NOT NULL UNIQUE
~~~

The same handoff keeps the same token across retry.

This closes the ambiguity window:

~~~text
COMMIT succeeded
→ Worker/page communication died before acknowledgement
→ caller retries
~~~

Recovery:

- token absent → normal ingest may proceed;
- matching complete token already exists → do not insert again; reconcile as already committed;
- same token with conflicting immutable cycle metadata → integrity error; never guess.

At minimum compare start/end times and requested/received/unique counts before accepting idempotent reconciliation.

## CHECKPOINT policy

Explicit CHECKPOINT is required:

- after every successful market-cycle COMMIT and before acknowledgement;
- after query-definition/version activation or user configuration changes that must survive immediate refresh;
- before and after schema migration;
- during graceful shutdown when practical.

A read-only analytical query alone does not require a dedicated CHECKPOINT.

Query-execution metadata may rely on WAL recovery and will normally be swept into frequent market-cycle checkpoints.

If later benchmarks show per-cycle CHECKPOINT is too expensive, weakening this durability policy requires an explicit decision.

## CHECKPOINT failure after COMMIT

This is not an ordinary rollback case because the transaction may already be committed.

Required state:

~~~text
durability = uncertain
success acknowledgement = withheld
blind retry = forbidden
~~~

Reconcile by ingest_token.

If the committed cycle is present and coherent, checkpoint/recovery can resolve it as already committed.

If state cannot be verified, enter recovery-required.

## Startup / reopen sequence

~~~text
1. verify required browser storage capabilities
2. inspect persistent/best-effort state and quota estimate
3. instantiate exact pinned DuckDB-Wasm assets
4. open opfs://market-flow-v2.duckdb READ_WRITE
5. inspect/create schema_meta
6. compare logical schema version
7. migrate if required and supported
8. reconcile unclean prior runtime state
9. verify core schema/readability
10. restore active query state
11. compute scheduler recovery state
12. create a new recording_session
13. report SQL Authority READY
14. allow Recorder and scheduler to run
~~~

Recorder must not begin successful-cycle persistence before READY.

## Unclean recording-session recovery

Any prior recording_session still marked running on reopen is evidence of an unclean end.

Recovery:

~~~text
old session.status = interrupted
old session.stopped_at_ms = NULL unless exact stop time is known
old session.stop_reason = runtime-recovered-after-unclosed-session
→ create a new recording_session
~~~

Do not fabricate a crash timestamp.

## Query-execution recovery

A persisted query_execution still marked running on reopen is classified:

~~~text
status = interrupted
finished_at_ms = NULL unless known
recovery metadata = runtime-ended-before-completion
~~~

The latest successful execution remains unchanged.

## Active query / scheduler recovery

Persist query_version and active_query_state in the authoritative database.

On reopen:

- restore the same active version if enabled;
- preserve original schedule_anchor_ms;
- calculate missed cadence boundaries;
- coalesce all downtime ticks into at most one pending execution opportunity;
- continue future scheduling on the original cadence;
- never burst-execute every missed tick.

Phase H priority still applies when a validated cycle commit is waiting.

## Schema migration

schema_meta owns the logical Market Flow schema version.

Rules:

- current supported version → continue;
- older supported version → explicit ordered migration;
- database newer than runtime understands → refuse writes;
- unknown/incompatible version → stop; never reset automatically.

Migration sequence:

~~~text
CHECKPOINT
→ controlled migration
→ update schema_meta last
→ COMMIT
→ CHECKPOINT
→ readiness verification
~~~

On migration failure:

- rollback where transactional semantics permit;
- never delete/recreate automatically;
- do not advance schema_meta;
- do not start Recorder;
- expose migration-failed/recovery-required.

## Database readiness verification

After open/recovery/migration verify at minimum:

- schema_meta is readable and expected;
- required core tables exist;
- latest_snapshot pointers resolve;
- current_universe/latest consistency holds;
- last complete cycle counts are coherent;
- enabled active query points to an existing query_version.

This is application-level readiness validation, not a promise to detect every possible storage corruption.

## Open/recovery failure

On open/readiness failure:

~~~text
do not delete
do not silently recreate
do not switch to an empty authority
→ recovery-required
~~~

Destructive reset requires explicit user/admin action outside normal startup.

## Storage estimate and quota

Use navigator.storage.estimate() for observable estimated usage/quota.

Do not hardcode an absolute quota or derive capacity from a fixed universe size.

Catch QuotaExceededError/storage-write failures explicitly.

No fixed warning percentage is selected in Phase I; benchmark/retention evidence will determine useful thresholds.

## Quota/storage exhaustion

If a cycle cannot be durably persisted:

~~~text
no durable-success acknowledgement
→ persistence state = storage-blocked
→ stop accepting further cycles as successfully recorded
~~~

Do not silently delete history or silently drop new cycles.

Automatic cleanup requires an explicit retention policy.

## OPFS authority vs absolute backup guarantee

Within the Browser-only architecture, the OPFS DuckDB file is the authoritative local market-history database after cutover.

Browser storage may still be explicitly cleared, evicted when best-effort, or lost with the browser profile/device.

Runtime diagnostics must expose the durability class.

## Graceful shutdown

When a real stop path has time:

~~~text
stop scheduling new DB work
→ settle current allowed operation
→ CHECKPOINT
→ close connection
→ terminate SQL Worker
~~~

Correctness must not depend on this callback running.

## Worker-only loss

If the Runtime Controller survives but SQL Worker dies:

~~~text
pause Recorder acknowledgements / new SQL executions
→ create new SQL Authority Worker
→ reopen same OPFS DB
→ recovery/readiness
→ reconcile pending ingest_token
→ READY
→ resume
~~~

Never resend an ambiguous pending cycle before reconciliation.

## Acceptance scenarios

I-A1: cycle COMMIT + CHECKPOINT + refresh reopens the same cycle/latest state.

I-A2: Worker dies after COMMIT but before acknowledgement; same ingest_token does not duplicate history.

I-A3: CHECKPOINT fails after COMMIT; success is withheld and state becomes durability-uncertain.

I-A4: stale running recording session becomes interrupted without fabricated stop time; a new session starts.

I-A5: stale running query execution becomes interrupted while latest successful result remains intact.

I-A6: downtime missed scheduler ticks coalesce to at most one pending execution and original cadence anchor remains.

I-A7: supported older schema migrates before Recorder starts; schema_meta advances only after success.

I-A8: newer/unknown schema is not reset or overwritten.

I-A9: QuotaExceededError produces storage-blocked rather than silent deletion.

I-A10: persistence request denied → explicit best-effort durability.

I-A11: readiness failure never triggers automatic empty-database replacement.

I-A12: graceful shutdown checkpoints when possible, abrupt shutdown remains recoverable.

## Official evidence

- https://duckdb.org/docs/current/clients/wasm/instantiation
- https://duckdb.org/2026/09/18/opfs-wasm
- https://duckdb.org/docs/current/sql/statements/checkpoint
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

## Deferred

Phase I does not decide runtime asset packaging/loading topology, Viewer transport/UI, exact retention cleanup, export/backup UI, IndexedDB migration or performance thresholds.

## Completion result

~~~text
one origin-scoped OPFS authority
+ exact pinned/verified DuckDB-Wasm artifact
+ COMMIT → CHECKPOINT → acknowledgement
+ ingest_token idempotency
+ explicit persistent/best-effort state
+ non-destructive schema/reopen recovery
+ interrupted session/query reconciliation
+ explicit quota/storage-blocked state
~~~