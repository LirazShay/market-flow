# Viewer Module — Local History Viewer V1

Stage 10 establishes the viewer bootstrap boundary.

## Files

~~~text
pure/viewer-state.js
bootstrap.js
~~~

## Stage 10 contract

~~~text
Leumi-origin recorder page
→ MarketFlowViewerBootstrap.openViewer()
→ named about:blank child window
→ same-origin DOM + IndexedDB access
→ Hebrew / RTL viewer shell
→ initial viewer state = BOOTING
~~~

The shell intentionally does not load current market rows yet.

That belongs to:

~~~text
Stage 11 — Current table from IndexedDB
~~~

The viewer window is named:

~~~text
market-flow-leumi-v1-viewer
~~~

Calling `openViewer()` again reuses/focuses the existing viewer rather than creating duplicate viewer tabs.

Public bootstrap API:

~~~text
MarketFlowViewerBootstrap.openViewer()
MarketFlowViewerBootstrap.closeViewer()
MarketFlowViewerBootstrap.isViewerOpen()
MarketFlowViewerBootstrap.getViewerSnapshot()
~~~

V1 continues to use IndexedDB as the source of truth. The child window itself does not receive copied market-data arrays from the opener.


## Stage 10 verification

~~~text
Fast CI
Run 35754581099
127 passed / 0 failed

Browser CI
Run 35754648747
29 passed / 0 failed
~~~

Browser verification proves that the child viewer can read an IndexedDB record created by its opener, so the V1 same-origin storage requirement is actually satisfied rather than inferred.

Next:

~~~text
Stage 11 — Current table from IndexedDB
~~~


## Stage 11 current table

Stage 11 loads:

~~~text
IndexedDB.latest
+
IndexedDB.universe
(join by securityId)
~~~

and renders the 16 planned V1 current-market columns.

Files:

~~~text
current-table.js
pure/current-table-logic.js
~~~

Behavior:

- latest rows are never silently dropped when universe metadata is missing;
- missing paper name displays as `—`;
- `null` / `undefined` / empty string display as `—`;
- numeric zero displays as `0`;
- empty DB transitions the viewer to `EMPTY`;
- populated DB transitions the viewer to `MAIN`;
- current row count, last cycle and latest collection time are populated from the current snapshot.

Interactive sorting remains Stage 13. Cross-tab live refresh remains Stage 12.


## Stage 11 verification

~~~text
Fast CI
Run 35755728772
132 passed / 0 failed
~~~

Playwright coverage for real IndexedDB → viewer DOM rendering is already present in:

~~~text
tests/automation/specs/viewer-current-table.spec.js
~~~

Per the V1 testing policy, Chromium execution is intentionally deferred until the planned Checkpoint C after Stage 12.

Next:

~~~text
Stage 12 — Cross-tab live refresh
~~~


## Stage 12 cross-tab live refresh

Channel:

~~~text
market-flow-leumi-v1
~~~

The recorder publishes metadata-only notifications after durable persistence boundaries.

For a successful cycle:

~~~text
IndexedDB commit succeeds
→ CYCLE_COMMITTED { cycleId, completedAtMs }
→ viewer receives notification
→ viewer re-reads IndexedDB.latest + universe
→ rerender
~~~

No market row payload is copied through BroadcastChannel.

The viewer also exposes:

~~~text
רענן תצוגה
~~~

Manual refresh is DB-only and never calls the market API.

If BroadcastChannel is unavailable, startup still reads IndexedDB and the UI explicitly reports degraded live-update mode while manual refresh remains available.
