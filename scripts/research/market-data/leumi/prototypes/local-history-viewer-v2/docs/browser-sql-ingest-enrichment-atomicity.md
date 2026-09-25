# Browser SQL — Ingest, Enrichment and Atomicity

This is the Phase G planning artifact for Local History Viewer V2.

It defines the validated-cycle handoff, bulk-ingest boundary, enrichment order, temporal-link rule, transaction boundary, rollback behavior and committed-state visibility. It is planning only.

Durable decision: ../../../../../../../docs/project/decisions/D-028.md

## Core contract

~~~text
provider collection
→ exact complete-cycle validation
→ immutable validated-cycle handoff
→ SQL Authority Worker
→ defensive revalidation
→ one bulk cycle operation
→ one SQL transaction
→ enrichment + latest/current synchronization
→ COMMIT
→ success acknowledgement
~~~

A successful market cycle is SQL-visible only after COMMIT.

## Recorder boundary

The Recorder remains responsible for universe discovery, canonical IDs, provider chunks, response validation, duplicate/missing/unexpected detection and chunk timing.

It does not allocate SnapshotIds, query historical SQL state, resolve temporal links, write DuckDB directly or mark persistence successful before Worker acknowledgement.

## Validated-cycle handoff

The handoff contains the exact validated universe used by the cycle plus the complete cycle:

~~~text
session/recorder identity
universe.loadedAtMs
universe.securityIds
full raw MapHeat records
cycle timings and integrity counts
chunk diagnostics
securities[]:
  securityId
  chunkIndex
  chunkReceivedAtMs
  collectedAtMs
  serverAsOfDate
  full raw Security object
~~~

The payload is immutable/value-oriented; shared mutable state is not part of the contract.

## SQL-authority defensive validation

Before successful-cycle persistence, the Worker verifies again:

~~~text
status == complete
requested == received == unique
missing == 0
duplicates == 0
unexpected == 0
securities.length == requested
exact universe membership == cycle membership
security IDs unique
String(raw Security.Key) == securityId
required Market Flow timestamps valid
~~~

Failure here produces no successful market-state mutation.

## Bulk ingest boundary

One complete cycle is one logical bulk operation. The target explicitly rejects hundreds of JS→Worker→SQL row round trips.

Preferred implementation direction:

~~~text
validated JS payload
→ SQL Authority Worker
→ structural normalization
→ one Arrow batch / equivalent bulk relation
→ set-based SQL
~~~

Arrow is preferred because Phase D verified first-class DuckDB-Wasm Arrow support. A later benchmark may replace the internal bulk encoding without changing the public cycle contract.

## Enrichment ownership

Worker-side structural normalization:

- preserve full raw MapHeat/Security data;
- promote only verified source mappings into typed staging columns;
- preserve null, zero and empty-string distinctions;
- reject invalid typed shapes rather than coercing silently.

SQL-side relational enrichment inside the cycle transaction:

- allocate stable SQL identities;
- resolve core temporal references;
- compute MID;
- compute LAST-change metrics;
- compute DealsDelta only after reset/day semantics are explicitly verified;
- synchronize current_universe and latest_snapshot.

Historical enrichment stays SQL-side because the historical authority already lives in DuckDB, it avoids copying prior rows back to JavaScript, and it remains rebuildable with SQL.

## Initial promoted mappings

Current project evidence supports these planning mappings:

~~~text
LastKnownRate      → last_rate
DailyDealsQuantity → daily_deals_quantity
BuyLimit1          → bid1
SellLimit1         → ask1
~~~

Raw Security JSON remains the source-preservation layer.

## MID

MID is persisted only when bid1 and ask1 are numeric and strictly positive:

~~~text
mid = (bid1 + ask1) / 2
~~~

If either side is unavailable, invalid or non-positive, mid is NULL. Original source values, including zero, remain preserved.

## Temporal predecessor rule

For each horizon H:

~~~text
target_time = current.collected_at_ms - H*1000
~~~

Select the latest prior snapshot of the same security with:

~~~text
previous.collected_at_ms <= target_time
ORDER BY previous.collected_at_ms DESC
LIMIT 1
~~~

This means a 10s target may use an ~11s snapshot, while a 10m target cannot bind to only 40s of history. No exact millisecond equality or large tolerance framework is required. If no eligible row exists, the link is NULL.

## LAST change

For an available predecessor:

~~~text
last_change_H_pct =
((current.last_rate - previous.last_rate) / previous.last_rate) * 100
~~~

If either value is unavailable or the previous value is zero, the metric is NULL. Unit: 0.5 means +0.5%.

## Deals delta evidence boundary

Repository field documentation describes DailyDealsQuantity as today's number of deals and shows 100% availability in the verified 561-Equity snapshot.

However reset/trading-day boundary semantics are not yet proven strongly enough for durable subtraction across arbitrary history. Therefore deals_delta_H remains NULL/unpopulated until that reset contract is explicitly verified. Availability is not treated as semantic proof.

## One successful-cycle transaction

Conceptual sequence:

~~~text
prepare validated bulk staging

BEGIN
1. insert complete cycle metadata
2. upsert security catalog/raw MapHeat for exact validated universe
3. synchronize current_universe to exactly that universe
4. bulk insert one snapshot per security with stable SnapshotId
5. resolve prev_*_snapshot_id set-wise
6. compute MID / LAST-change / authorized persisted metrics
7. synchronize latest_snapshot to exactly the new cycle
8. update recording_session success metadata/counters
COMMIT
~~~

Only after COMMIT may the Worker acknowledge successful persistence.

## current_universe semantics

The query-visible current universe advances only with a successfully committed cycle. A newer MapHeat refresh is not allowed to create a query-visible universe that is inconsistent with the last committed latest_snapshot set.

Previously seen securities may remain in the security catalog and history after leaving current_universe.

## latest_snapshot semantics

After commit:

~~~text
latest_snapshot security IDs == committed cycle security IDs
~~~

Each pointer targets the snapshot inserted for that security in the same cycle. Stale latest pointers are removed; historical snapshots are retained.

## Query visibility during ingest

The single SQL Authority coordinates DB operations so an analytical query cannot observe an uncontrolled mid-transaction state.

A query sees either the previous fully committed cycle or the newly fully committed cycle, never a mixture. Phase H may define timing/queuing policy but may not weaken this invariant.

## Failure / rollback

If any transactional step fails before COMMIT:

~~~text
ROLLBACK
0 attempted snapshots visible
0 partial latest transition
0 partial current_universe transition
0 partial derived metrics
no success acknowledgement
previous committed market state remains authoritative
~~~

Ephemeral Arrow/staging objects are never authority and are cleaned separately.

## Failed provider/validation cycles

If collection or validation fails before a complete handoff, no successful-cycle transaction opens.

A separate diagnostic write may record the failed attempt, but it must not mutate snapshot/latest/current_universe state. If the DB itself is unavailable, runtime observability cannot depend solely on writing the failure into that same DB.

## Rebuildability

Temporal links and persisted core metrics are performance aids, not irrecoverable facts. Raw/promoted source values plus security_id, collected_at_ms and historical snapshots must be sufficient to rebuild them later through SQL migration/maintenance work.

## Explicit rejection: post-commit enrichment

The target rejects exposing raw snapshots first and filling temporal/derived fields later. Anything that belongs to the successful analytical snapshot contract is complete before COMMIT.

## Acceptance scenarios

1. A valid N-security cycle commits exactly N coherent snapshot facts together with current/latest state.
2. A failure after partial processing leaves none of the attempted cycle visible.
3. A query during ingest sees only a fully committed state.
4. Missing horizon history produces NULL.
5. A 10s target can select an ~11s-old predecessor under the at-or-before rule.
6. A security removed from the next universe disappears from current/latest after commit but remains in history.
7. Derived-metric failure rolls back raw rows from that attempted cycle too.
8. Failed-cycle diagnostics never turn partial provider data into successful market state.

## Deferred

Phase G does not decide query scheduling cadence/overrun/cancellation, CHECKPOINT cadence, reopen/recovery, retention, runtime packaging, viewer transport or IndexedDB migration.

## Completion result

~~~text
exact validated cycle
→ one immutable handoff
→ one SQL Authority Worker
→ one bulk operation
→ set-based SQL enrichment
→ one atomic transaction
→ one success acknowledgement
~~~

Everything that defines a successful analytical market state is visible together or not visible at all.