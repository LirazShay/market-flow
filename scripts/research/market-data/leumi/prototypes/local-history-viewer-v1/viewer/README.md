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
