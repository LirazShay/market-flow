# Recorder Module — Local History Viewer V1

Durable component documentation only. Operational progress lives in:

~~~text
../STATUS.json
~~~

## Responsibility

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ exact completeness validation
→ validated cycle
→ persistence boundary
→ diagnostics / notification hooks
~~~

## Core invariants

- universe size is dynamic; never hardcode 561.
- canonical security ID is `String(PaperId or Key)`.
- chunk requests are sequential under the V1 baseline.
- requested/received/unique/missing/duplicate integrity is validated.
- a failed chunk fails the cycle; later chunks are not treated as success.
- successful persistence completes before in-memory success is exposed.
- failed API/validation/DB work never partially updates `history/latest`.
- `null`, `0` and `""` remain distinct.
- full raw Security payloads are preserved for persistence.

## Main modules

~~~text
config.js
universe-loader.js
securities-chunk-loader.js
cycle-builder.js
loop.js
diagnostics.js
pure/
~~~

Pure deterministic behavior belongs under `pure/` and is covered by fast unit tests.

Browser/provider adapters remain thin and are covered with deterministic Playwright mocks.

## Timing model

Configuration includes:

~~~text
chunkSize
chunkDelayMs
snapshotIntervalMs
refreshUniverseEveryCycle
~~~

`snapshotIntervalMs` is a target start-to-start cadence, not a guarantee that a cycle finishes within that duration.

No-overlap is required: a new cycle must not overlap an in-flight cycle.

## Persistence boundary

~~~text
validated cycle
→ one atomic IndexedDB commit
→ recorder exposes completed/latest state
→ metadata notification may be published
~~~

The recorder uses the storage lifecycle/success/failure persistence modules rather than composing separate single-store writes for a successful cycle.

## Diagnostics

Recorder diagnostics include:

- heartbeat;
- completed/failed counters;
- persisted `lastError`;
- failed-cycle diagnostics;
- normalized browser storage estimate.

Failure diagnostics may update diagnostic stores/meta, but must not make partial market state visible in `history/latest`.

## Tests

~~~text
../tests/unit/
../tests/automation/specs/recorder-*.spec.js
../tests/automation/specs/recorder-persistence-integration.spec.js
~~~

Execution/verification policy:

~~~text
../tests/TESTING_POLICY.md
~~~
