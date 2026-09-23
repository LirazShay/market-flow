# Debug Bundle — Local History Viewer V1

This directory contains the bounded sanitized diagnostic export used during live verification and production-like browser debugging.

Normative contract:

~~~text
../specs/debug-bundle.spec.md
~~~

Operational progress lives only in:

~~~text
../STATUS.json
~~~

## Normal usage

The Debug Bundle is part of the normal generated runtime. It is **not** a second recorder.

After the Bookmarklet is running:

~~~js
await MarketFlowRuntime.createDebugBundle()
~~~

returns the sanitized object in memory.

~~~js
await MarketFlowRuntime.downloadDebugBundle()
~~~

downloads a JSON file such as:

~~~text
market-flow-debug-20260923-013500.json
~~~

The Viewer header exposes the normal user-facing action:

~~~text
הורד קובץ Debug
~~~

Use that button for ordinary live debugging; the runtime API remains available for automated/testing use.

For a one-step manual health/evidence report against an already-running runtime, use:

~~~text
live-verification-check.js
~~~

The helper is observational and reuses the existing Debug Bundle API.

Recorder health checks must use the semantic lifecycle flag:

~~~text
recorder.isRunning
~~~

Do not require one exact `recorder.status` string as proof of health. Status is a transient phase; a healthy active recorder may be `waiting` between cycles or `running-cycle` while a cycle is in flight.

## What the file contains

- recorder lifecycle/config/counters without raw latest-cycle securities;
- persistence/session identifiers needed for correlation;
- viewer state summary;
- IndexedDB row counts;
- bounded recent cycle diagnostics;
- selected market-field fingerprints;
- provider-time fingerprints;
- count of securities changed between adjacent successful cycles;
- bounded provider timestamp summaries;
- selected sanitized security summaries for the newest complete cycle;
- storage estimate;
- origin pathname/timezone/browser metadata useful for reproduction.

## What the file intentionally does not collect

- cookies;
- authorization headers;
- tokens;
- account numbers;
- localStorage/sessionStorage dumps;
- authenticated HAR/network captures;
- full raw MapHeat payloads;
- full raw Security payloads.

Do not add any of those categories to the bundle.

## Bounds

~~~text
default recent cycles: 8
maximum recent cycles: 20
maximum rows read per cycle: 5000
~~~

The debug path must never solve diagnosis by materializing unbounded history.

## Why fingerprints are split

Market fields and provider timestamps use separate fingerprints.

That lets live evidence distinguish:

~~~text
market unchanged + provider time unchanged
market unchanged + provider time changed
market changed + provider time changed
~~~

The Debug Bundle reports evidence. It does not itself decide whether TASE is open or closed.
