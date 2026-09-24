# Storage Module — Local History Viewer V1

Durable IndexedDB component orientation only. The normative persistence contract lives in:

~~~text
../specs/persistence.spec.md
~~~

Operational progress lives in:

~~~text
../STATUS.json
~~~

## Files

- `schema.js` — database/store/index names and schema metadata.
- `connection.js` — Promise-based open/close helpers.
- `upgrade.js` — object-store/index creation.
- `read.js` — generic readonly helpers.
- `write.js` — generic single-store write helpers.
- `pure/persistence-records.js` — deterministic record mapping.
- `lifecycle-persistence.js` — session/universe lifecycle transactions.
- `successful-cycle-persistence.js` — atomic successful-cycle transaction.
- `recorder-diagnostics-persistence.js` — heartbeat/failed-cycle diagnostics persistence.

## Database contract

Durable schema/source of truth:

~~~text
../docs/data-model.md
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

## Single-store helpers

~~~text
put(database, storeName, value)
add(database, storeName, value)
deleteRecord(database, storeName, key)
clear(database, storeName)
~~~

These helpers are low-level single-store transactions.

They must **not** be composed to simulate the successful-cycle atomic boundary.

## Successful-cycle atomicity

~~~text
cycles + history + latest + meta
→ one readwrite transaction
→ all succeed or all roll back
~~~

The generated cycleId is reused consistently across the cycle/history/latest/meta records.

A request/constraint/transaction failure aborts the whole successful-cycle transaction.

## Lifecycle persistence

~~~text
startSession
    sessions + meta

persistUniverse
    universe + meta

stopSession
    sessions + meta
~~~

Universe replacement is atomic and preserves full raw MapHeat records.

## Failure diagnostics

~~~text
recordHeartbeat
    meta

recordFailedCycle
    cycles + meta
~~~

Failed-cycle persistence never writes `history` or `latest`.

## Data integrity

- preserve `null != 0 != ""`.
- preserve full raw Security / MapHeat payloads where defined by the data model.
- canonical security IDs remain strings.
- do not silently accept missing/duplicate/unexpected IDs.
- no automatic retention in V1.

## Tests

~~~text
../tests/unit/persistence-records.test.js
../tests/automation/specs/storage-self-tests.spec.js
../tests/automation/specs/persistence-lifecycle.spec.js
../tests/automation/specs/successful-cycle-persistence.spec.js
../tests/automation/specs/recorder-persistence-integration.spec.js
~~~
