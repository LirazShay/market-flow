# Runtime Assembly

This directory contains the generated-delivery mechanism for Local History Viewer V1.

Operational progress remains only in `../STATUS.json`.

## Source of truth

The runtime is assembled from the existing verified browser modules. Business logic is not copied into a second implementation.

Dependency order:

~~~text
source-order.js
~~~

Browser launch orchestration only:

~~~text
entry.js
~~~

Build:

~~~text
node runtime/build-runtime.js
~~~

or:

~~~text
npm run build:runtime
~~~

Generated files:

~~~text
runtime/dist/market-flow-v1.runtime.js
runtime/dist/market-flow-v1.bookmarklet.txt
~~~

The dist directory is generated and ignored by Git. Browser CI regenerates it from repository sources.

## Browser usage

Generate the artifacts, then create a browser bookmark whose URL is the complete contents of:

~~~text
runtime/dist/market-flow-v1.bookmarklet.txt
~~~

Run that bookmark only while already on the intended Leumi page/origin.

The Bookmarklet embeds the complete generated runtime. It does not fetch code from an external host and does not embed cookies, tokens, authorization headers, account data or private session state.

Launching it:

~~~text
existing source modules
→ MarketFlowRuntime
→ recorder starts if not already running
→ same-origin viewer opens/focuses
~~~

Launching the same Bookmarklet again while the recorder is already running reuses the existing recorder instance and named viewer window.

Public runtime API:

~~~text
MarketFlowRuntime.launch({ recorderConfig })
MarketFlowRuntime.stop(reason)
MarketFlowRuntime.closeViewer()
MarketFlowRuntime.getSnapshot()
~~~

If stop persistence is still pending, a restart fails clearly rather than creating overlapping recorder state.

## Verification

Fast tests cover deterministic generation, exact Bookmarklet decoding and artifact writing.

Chromium smoke coverage executes the generated Bookmarklet on a clean page with deterministic mocked Leumi endpoints and verifies initial launch, repeated idempotent launch and restart after a clean stop.
