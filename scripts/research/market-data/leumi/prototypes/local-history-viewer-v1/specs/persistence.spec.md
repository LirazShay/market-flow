# MF-LHV-PERSIST-001 — Persistence Specification

## Purpose

Persistence turns validated recorder output into durable browser-local state without exposing partial successful snapshots.

IndexedDB is the durable browser source of truth for this tool.

Operational progress is tracked only in `../STATUS.json`.

## Scope

This spec owns:

- database identity/version;
- store responsibilities;
- canonical persisted keys;
- session lifecycle persistence;
- universe persistence;
- successful-cycle atomic transaction;
- failed-cycle/heartbeat diagnostics persistence;
- read/write consistency boundaries;
- preservation of raw provider payloads;
- browser-local recovery expectations.

It does not own:

- provider fetching;
- viewer DOM behavior;
- BroadcastChannel delivery;
- retention beyond the explicit V1 rule of no automatic retention.

## Contract

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

### Store ownership

`meta`
- small system/recorder state;
- universe state;
- heartbeat/last-completed metadata.

`sessions`
- one record per recorder run;
- preserves start/stop/config/counters.

`universe`
- canonical security metadata from MapHeat2;
- one row per security;
- preserves full raw MapHeat record.

`cycles`
- one record per complete or failed cycle attempt;
- complete-cycle integrity/timing summary;
- failed-cycle diagnostics when available.

`latest`
- one current row per canonical security ID;
- replaced/upserted by later successful cycles.

`history`
- every persisted successful sample;
- keyed by cycle/security;
- queried by security/time.

### Successful-cycle transaction

A successful cycle must commit in one IndexedDB readwrite transaction spanning:

~~~text
cycles
history
latest
meta
~~~

The transaction:

1. validates recorder ownership from persisted recorder state;
2. creates the complete cycle row and obtains `cycleId`;
3. writes all history rows using that `cycleId`;
4. upserts all latest rows using that `cycleId`;
5. updates recorder meta state;
6. commits as one unit.

Only transaction completion constitutes durable success.

### Session/universe lifecycle

Session start:

~~~text
sessions + meta
~~~

Universe replacement:

~~~text
universe + meta
~~~

Session stop:

~~~text
sessions + meta
~~~

Each lifecycle operation must use a transaction that keeps its coupled state internally consistent.

### History identity

Canonical security ID is string.

History primary key:

~~~text
[cycleId, securityId]
~~~

History security/time index:

~~~text
[securityId, collectedAtMs]
~~~

## Invariants

1. IndexedDB is the authoritative persisted market state.
2. Successful-cycle persistence is all-or-nothing across `cycles + history + latest + meta`.
3. A generated cycle ID is reused consistently across cycle/history/latest state.
4. `latest` represents only successfully committed complete cycles.
5. `history` never receives partial rows from a failed successful-cycle transaction.
6. Failed-cycle persistence never writes `latest` or `history`.
7. Recorder instance ownership must match persisted active recorder state before committing a successful cycle.
8. Canonical `securityId` remains string.
9. Full raw Security payload is preserved in persisted market rows.
10. Full raw MapHeat payload is preserved in universe rows.
11. `null`, `0`, `""`, and missing remain semantically distinct.
12. No automatic retention deletes history in this V1 contract.
13. Viewer reads do not mutate provider state or trigger collection.

## Failure semantics

Any request/constraint/transaction failure during successful-cycle persistence:

~~~text
abort transaction
→ reject commit
→ leave prior latest/history consistent
→ recorder treats cycle as failed
~~~

A failure in session/universe lifecycle must reject that lifecycle operation; it must not be converted into apparent success.

Failed-cycle diagnostics may persist independently:

~~~text
cycles + meta
~~~

but must never create market-state visibility in `latest/history`.

Database open/upgrade errors are explicit errors.

Unknown/unsupported upgrade paths must fail clearly instead of guessing schema migration behavior.

## Extension and reuse

The persistence design establishes reusable patterns:

- explicit store ownership;
- persisted recorder/session ownership;
- durable complete-cycle boundary;
- one atomic transaction for state that must move together;
- append-only historical samples plus current materialized state;
- raw-provider preservation plus normalized identifiers;
- independent diagnostic persistence.

Future storage engines may replace IndexedDB, but a replacement must specify equivalent guarantees for:

- atomic cycle commit;
- current/history consistency;
- durable identity;
- restart recovery;
- failure rollback;
- raw evidence preservation.

A future retention feature must have its own explicit spec. It must not be introduced as an incidental cleanup behavior.

## Verification mapping

Pure persisted-record mapping:

~~~text
../tests/unit/persistence-records.test.js
~~~

Browser IndexedDB semantics:

~~~text
../tests/automation/specs/storage-self-tests.spec.js
../tests/automation/specs/persistence-lifecycle.spec.js
../tests/automation/specs/successful-cycle-persistence.spec.js
../tests/automation/specs/recorder-persistence-integration.spec.js
../tests/automation/specs/integrated-v1-e2e.spec.js
~~~

Browser tests are required for transaction/reopen semantics because Node-only mocks are insufficient proof.

## Change triggers

Review this spec whenever changing:

- database name/version;
- stores, keys, indexes;
- record shapes;
- canonical persisted identity;
- transaction boundaries;
- session/universe lifecycle;
- successful-cycle atomicity;
- recorder ownership checks;
- current/history semantics;
- failed-cycle diagnostics;
- raw payload preservation;
- retention/deletion behavior;
- storage-engine choice.

## References

- `../docs/data-model.md`
- `../docs/architecture.md`
- `../storage/`
- `recorder.spec.md`
- `viewer.spec.md`
- `../tests/TESTING_POLICY.md`
