# Viewer Module — Local History Viewer V1

Durable viewer orientation only. The normative viewer contract lives in:

~~~text
../specs/viewer.spec.md
~~~

Operational progress lives in:

~~~text
../STATUS.json
~~~

## Responsibility

~~~text
same-origin child window
→ read authoritative IndexedDB state
→ render current table / detail history / diagnostics
→ respond to metadata-only refresh notifications
~~~

IndexedDB is the viewer's source of truth. BroadcastChannel never carries market-row payloads.

## Main modules

~~~text
bootstrap.js
current-table.js
history-data.js
security-detail.js
diagnostics-data.js
diagnostics.js
live-refresh.js
pure/
~~~

## Bootstrap contract

The named viewer window is:

~~~text
market-flow-leumi-v1-viewer
~~~

Public API:

~~~text
MarketFlowViewerBootstrap.openViewer()
MarketFlowViewerBootstrap.closeViewer()
MarketFlowViewerBootstrap.isViewerOpen()
MarketFlowViewerBootstrap.getViewerSnapshot()
~~~

Repeated launch may reuse/focus an existing viewer or open another same-origin viewer. Multiple viewers are acceptable because IndexedDB remains the single data authority; runtime launch must not start a duplicate recorder.

Reload recovery rebuilds the same-origin shell and rereads IndexedDB rather than depending on an in-memory market snapshot.

## Current table

~~~text
IndexedDB.latest
+
IndexedDB.universe
(join by canonical securityId)
~~~

Behavior:

- latest rows are not silently dropped when universe metadata is missing;
- missing display values render as `—`;
- zero renders as `0`;
- sorting is deterministic/null-safe;
- selected sort survives refresh.

## Detail/history

Row activation opens per-security history read from IndexedDB.

History is queried newest-first and supports continuation/load-older without duplicate/skip across equal-timestamp boundaries.

## Live refresh

~~~text
CYCLE_COMMITTED metadata notification
→ viewer rereads IndexedDB
→ rerender current/detail/diagnostics
~~~

Manual refresh is DB-only and never calls the market provider.

If BroadcastChannel is unavailable, startup/manual DB refresh remain available.

## Diagnostics

The persistent header renders recorder health and storage/persistence metrics from IndexedDB/browser storage diagnostics.

The header also exposes:

~~~text
הורד קובץ Debug
~~~

This downloads the bounded sanitized Debug Bundle from the normal running runtime. It does not start another recorder and does not call the provider.

Debug Bundle contract/contents:

~~~text
../specs/debug-bundle.spec.md
../debug/README.md
~~~

Health semantics are defined in:

~~~text
pure/diagnostics-logic.js
~~~

## Tests

~~~text
../tests/unit/viewer-*.test.js
../tests/automation/specs/viewer-*.spec.js
~~~

Verification policy:

~~~text
../tests/TESTING_POLICY.md
~~~
