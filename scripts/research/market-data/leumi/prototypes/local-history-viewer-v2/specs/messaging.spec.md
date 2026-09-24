# MF-LHV-MSG-001 — Cross-Tab Messaging Specification

## Purpose

Cross-tab messaging tells viewers that durable state may have changed.

It is intentionally **not** a market-data transport.

Operational progress is tracked only in `../STATUS.json`.

## Scope

This spec owns:

- BroadcastChannel name;
- supported message types;
- message creation/validation;
- metadata-only payload rule;
- publish-after-commit ordering;
- subscription/degraded behavior.

It does not own:

- market data;
- IndexedDB persistence;
- viewer query logic;
- provider requests.

## Contract

Channel:

~~~text
market-flow-leumi-v1
~~~

Supported message types:

~~~text
RECORDER_STARTED
RECORDER_HEARTBEAT
CYCLE_COMMITTED
RECORDER_STOPPED
RECORDER_ERROR
DATABASE_CLEARED
~~~

Messages contain:

~~~text
type
atMs
metadata
~~~

`CYCLE_COMMITTED` metadata includes sufficient identity/timing information to tell a viewer that a committed cycle exists, such as:

~~~text
cycleId
completedAtMs
~~~

The message does not carry the complete market snapshot.

The ordering contract for successful market state is:

~~~text
successful IndexedDB commit completes
→ publish CYCLE_COMMITTED metadata
→ viewer rereads IndexedDB
~~~

## Invariants

1. BroadcastChannel is notification only.
2. IndexedDB remains authoritative even when a message arrives.
3. No full market-row payload is transmitted through the channel.
4. `CYCLE_COMMITTED` is never published before the corresponding durable commit succeeds.
5. Message type must be one of the declared supported values.
6. Required message metadata must be validated.
7. A viewer opened after prior messages can still reconstruct state from IndexedDB.
8. Channel availability is not a prerequisite for DB readability/manual viewer refresh.
9. Messaging contains no credentials, session tokens, account identifiers, or private browser/session state.

## Failure semantics

Publisher unavailable:

~~~text
publish()
→ delivered = false
→ durable state remains valid
~~~

Publisher exception:

~~~text
return explicit failure reason
→ log diagnostic
→ do not roll back an already successful DB commit merely because notification failed
~~~

Subscriber unavailable:

~~~text
viewer remains usable
→ startup/manual refresh reads IndexedDB
~~~

Malformed/unknown messages are not treated as trustworthy state.

## Extension and reuse

Future tools can reuse the pattern:

~~~text
durable state first
→ small invalidation/event notification second
→ consumer rereads source of truth
~~~

A future high-volume streaming architecture may use another transport, but it must state explicitly whether that transport becomes data-bearing or remains notification-only.

If the transport becomes authoritative data transport, that is an architectural change requiring new consistency/recovery specs.

## Verification mapping

Pure message creation/validation:

~~~text
../tests/unit/channel-message-logic.test.js
~~~

Browser BroadcastChannel behavior and viewer refresh:

~~~text
../tests/automation/specs/viewer-live-refresh.spec.js
../tests/automation/specs/integrated-v1-e2e.spec.js
~~~

Degraded/unavailable BroadcastChannel behavior requires browser semantics.

## Change triggers

Review this spec whenever changing:

- channel name;
- message types;
- message metadata;
- publish timing;
- data-bearing vs metadata-only policy;
- subscription behavior;
- degraded fallback;
- database notification ordering;
- multi-viewer assumptions.

## References

- `../messaging/`
- `../docs/architecture.md`
- `recorder.spec.md`
- `persistence.spec.md`
- `viewer.spec.md`
