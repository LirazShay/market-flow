# Messaging Module — Local History Viewer V1

Local orientation for the cross-tab notification layer.

Normative messaging contract:

~~~text
../specs/messaging.spec.md
~~~

Operational progress lives only in:

~~~text
../STATUS.json
~~~

## Responsibility

~~~text
durable state changes
→ metadata-only BroadcastChannel notification
→ viewer rereads IndexedDB
~~~

Channel:

~~~text
market-flow-leumi-v1
~~~

The messaging layer does not transport the full market snapshot and does not become a second source of truth.

## Files

- `pure/channel-message-logic.js` — message types, creation and deterministic validation.
- `channel.js` — browser BroadcastChannel publisher/subscriber adapter.

## Degraded behavior

If BroadcastChannel is unavailable, persisted IndexedDB state remains valid and viewer startup/manual refresh must remain usable.

## Tests

~~~text
../tests/unit/channel-message-logic.test.js
../tests/automation/specs/viewer-live-refresh.spec.js
../tests/automation/specs/integrated-v1-e2e.spec.js
~~~
