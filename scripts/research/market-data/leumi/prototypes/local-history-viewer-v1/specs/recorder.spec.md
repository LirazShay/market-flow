# MF-LHV-REC-001 — Recorder Specification

## Purpose

The recorder converts provider calls into trustworthy complete market-data cycles and hands only validated cycles to persistence.

Its job is not merely to poll endpoints. Its primary responsibility is:

~~~text
prove completeness before data becomes durable current/history state
~~~

Operational progress is tracked only in `../STATUS.json`.

## Scope

The recorder owns:

- validated configuration;
- dynamic universe loading;
- chunk planning;
- sequential GetSecuritiesData collection;
- cycle construction/completeness;
- no-overlap scheduling;
- start/stop lifecycle;
- persistence integration;
- recorder diagnostics/heartbeat;
- post-commit notification hooks.

The recorder does not own:

- IndexedDB schema design;
- viewer rendering;
- history querying;
- cross-tab data transport;
- trade execution.

## Contract

### Configuration

V1 configuration includes:

~~~text
snapshotIntervalMs
chunkDelayMs
chunkSize
refreshUniverseEveryCycle
~~~

`snapshotIntervalMs` is a target cycle start-to-start cadence. It is not a promise that provider collection finishes within that duration.

`chunkDelayMs` applies between sequential chunks, not after the final chunk.

`chunkSize` is configurable and must not imply a fixed universe size.

### Start

Starting the recorder:

- validates configuration;
- creates a new recorder instance identity;
- resets run-local counters/state;
- schedules the first cycle;
- must fail clearly if a previous stop persistence operation is still pending;
- must not start while a previous cycle remains in flight.

### Universe

The recorder loads a dynamic universe from MapHeat2, validates count/membership, canonicalizes identities, and creates chunks.

The current V1 baseline may cache the universe unless `refreshUniverseEveryCycle` requests reload.

### Cycle

A cycle:

1. captures cycle start time;
2. fetches planned chunks sequentially;
3. validates each chunk membership;
4. aggregates securities;
5. validates whole-cycle exact membership;
6. produces an immutable complete cycle object;
7. hands it to persistence.

A complete cycle exposes integrity counters:

~~~text
requested
received
unique
missing
duplicates
~~~

For success:

~~~text
requested == received == unique
missing == 0
duplicates == 0
~~~

### Persistence handoff

The recorder may expose cycle success only after the successful-cycle persistence transaction commits.

After commit it may publish `CYCLE_COMMITTED` metadata.

### Stop

Stop:

- prevents future scheduling;
- marks the controller stopping/stopped as appropriate;
- waits for an in-flight cycle to settle before final stop persistence;
- persists session stop state;
- closes owned DB resources;
- makes restart safe only after stop persistence has completed.

## Invariants

1. No two recorder cycles overlap.
2. Chunk execution is sequential under the V1 baseline.
3. Dynamic universe count is never hardcoded.
4. Every security identity is canonicalized as string.
5. A chunk/cycle with uncertain membership is not successful.
6. Successful cycle persistence precedes in-memory completed-success exposure.
7. Successful cycle notification follows commit.
8. Failed provider/validation/persistence work cannot partially update `latest/history`.
9. Full raw Security payloads pass through for persistence.
10. `null`, `0`, empty string and missing remain distinct.
11. Run-local instance/session ownership prevents a stale recorder instance from committing into another recorder's active state.
12. Scheduling state and persistence state are separate concerns but must converge cleanly on stop.

## Failure semantics

Provider/validation failure:

~~~text
cycle fails
→ record failure diagnostics where possible
→ increment failed-cycle state
→ preserve prior latest/history
→ next cycle may be scheduled only if recorder remains running
~~~

Persistence failure:

~~~text
validated cycle exists
→ commit fails
→ treat as recorder cycle failure
→ do not expose success
~~~

Diagnostics persistence failure must be surfaced/logged, but must not be mistaken for successful market-state persistence.

Heartbeat failure is observable diagnostics and does not rewrite market data.

Stop persistence failure must remain visible rather than silently allowing overlapping ownership.

## Extension and reuse

The recorder is a reusable collector pattern.

Future research tools may reuse:

- config validation pattern;
- dynamic universe abstraction;
- exact membership validation;
- complete-cycle handoff object;
- no-overlap scheduler;
- recorder ownership/session identity;
- commit-before-success boundary.

Future variants may introduce:

- parallel chunking;
- streaming;
- workers;
- adaptive cadence;
- alternate providers.

Such variants require explicit revised specs for ordering, snapshot consistency, backpressure, concurrency and completeness. Parallelism must not be introduced merely as an optimization if it weakens the ability to reason about complete cycles.

## Verification mapping

Pure recorder behavior:

~~~text
../tests/unit/config-logic.test.js
../tests/unit/universe-logic.test.js
../tests/unit/securities-chunk-logic.test.js
../tests/unit/cycle-logic.test.js
../tests/unit/recorder-loop-logic.test.js
~~~

Browser/provider-adapter integration:

~~~text
../tests/automation/specs/recorder-stage-7.spec.js
../tests/automation/specs/recorder-persistence-integration.spec.js
../tests/automation/specs/recorder-diagnostics.spec.js
../tests/automation/specs/integrated-v1-e2e.spec.js
~~~

Current real-provider behavior remains a live-verification concern.

## Change triggers

Review this spec whenever changing:

- recorder config fields/defaults/semantics;
- universe refresh policy;
- chunk sizing/order/delay/concurrency;
- cycle integrity contract;
- scheduling/no-overlap behavior;
- start/stop/restart lifecycle;
- instance/session ownership;
- persistence handoff;
- diagnostics/heartbeat semantics;
- post-commit messaging.

## References

- `provider-data-contract.spec.md`
- `persistence.spec.md`
- `messaging.spec.md`
- `../recorder/`
- `../docs/architecture.md`
- `../docs/requirements.md`
- `../tests/TESTING_POLICY.md`
