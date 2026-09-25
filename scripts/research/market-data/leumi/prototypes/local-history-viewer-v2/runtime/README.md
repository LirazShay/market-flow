# Runtime Assembly

This directory contains the generated-delivery mechanism for Local History Viewer V2.

Normative delivery contract:

~~~text
../specs/runtime-delivery.spec.md
~~~

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
npm run build:runtime
~~~

Generated files:

~~~text
runtime/dist/market-flow-v2.runtime.js
runtime/dist/market-flow-v2.bookmarklet.txt
~~~

The dist directory is generated and ignored by Git.

## DuckDB engine asset manifest

Browser SQL engine identity is owned by:

~~~text
runtime/duckdb-engine-manifest.js
~~~

Build only the deterministic engine manifest with:

~~~text
npm run build:engine-manifest
~~~

Generated file:

~~~text
runtime/dist/market-flow-v2.duckdb-engine-manifest.json
~~~

The manifest pins one reviewed engine family:

~~~text
npm package: @duckdb/duckdb-wasm@1.32.0
DuckDB core: v1.4.3
core commit: d1dc88f950d456d72493df452dabdcd13aa413dd
bundles: mvp + eh
~~~

Every Worker/Wasm URL contains the exact npm package version. Floating tags such as `latest` / `next`, semver ranges, cross-version Worker/Wasm pairs and flavor-mismatched pairs are rejected by the generator/validator. This file is only the engine identity/asset foundation; it does not instantiate DuckDB or create a SQL authority.

## Browser SQL live-compatibility probe

Build the synthetic probe with:

~~~text
npm run build:browser-sql-probe
~~~

Generated files:

~~~text
runtime/dist/market-flow-v2.browser-sql-probe.js
runtime/dist/market-flow-v2.browser-sql-probe.bookmarklet.txt
~~~

The probe is deliberately not the production runtime. It uses the exact pinned DuckDB Worker/Wasm assets, a probe-only OPFS database, and one synthetic marker to test Blob Worker creation, Wasm instantiation, COMMIT/CHECKPOINT, reopen verification and exact probe-file cleanup.

It makes no Leumi provider calls and contains no credentials, cookies, authorization headers, account data or production database identity. Deterministic Chromium verification uses locally fulfilled copies of the exact locked Worker/Wasm files; the actual authenticated-Leumi CSP/origin result remains a separate live verification gate.

## Artifact roles

`market-flow-v2.runtime.js` is the readable assembled runtime used for inspection and debugging.

`market-flow-v2.bookmarklet.txt` is the user-facing delivery artifact. It is generated as compact single-line JavaScript. Terser is intentionally configured with compression and identifier mangling disabled: comments/formatting are removed, but source identifiers and runtime behavior remain recognizable. The Bookmarklet body is raw compact JavaScript prefixed only by `javascript:`; it is not whole-payload percent-encoded.

The Bookmarklet remains self-contained. It does not fetch executable code from an external host.

There is no arbitrary absolute Bookmarklet size ceiling in the build. The packaging contract instead requires that the Bookmarklet body be the compact runtime itself, prefixed only by `javascript:`. This prevents URL encoding from inflating a legitimately large runtime.

## Stable verified download

A successful full Browser CI run on `main` can publish the two generated files to a rolling GitHub Release when the workflow input `publish_runtime=true` is selected.

Ordinary Browser CI verification leaves `publish_runtime=false` (the default), so verification completes without waiting for release publication. Release publication remains downstream of the same successful Browser CI job rather than using an unverified build.

~~~text
tag:
local-history-viewer-v2-runtime-latest
~~~

Release page:

~~~text
https://github.com/LirazShay/market-flow/releases/tag/local-history-viewer-v2-runtime-latest
~~~

Stable Bookmarklet download:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v2-runtime-latest/market-flow-v2.bookmarklet.txt
~~~

Stable readable runtime download:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v2-runtime-latest/market-flow-v2.runtime.js
~~~

The rolling release is updated only after the full Chromium suite succeeds. The ordinary per-run GitHub Actions artifact is retained as additional verification evidence.

## Browser usage

Download `market-flow-v2.bookmarklet.txt`, open it as text, and copy its complete single line into the URL field of a browser bookmark.

Run that bookmark only while already on the intended Leumi page/origin.

Launching it:

~~~text
embedded assembled runtime
→ MarketFlowRuntime
→ recorder starts if not already running
→ same-origin Viewer opens
~~~

Launching the same Bookmarklet again while the recorder is already running reuses the existing recorder instance. The browser may focus/reuse an existing Viewer or open another same-origin Viewer; multiple Viewers are valid because IndexedDB remains the data authority.

Public runtime API:

~~~text
MarketFlowRuntime.launch({ recorderConfig })
MarketFlowRuntime.stop(reason)
MarketFlowRuntime.closeViewer()
MarketFlowRuntime.getSnapshot()
MarketFlowRuntime.createDebugBundle(options)
MarketFlowRuntime.downloadDebugBundle(options)
~~~

If stop persistence is still pending, a restart fails clearly rather than creating overlapping recorder state.

## Verification

Fast tests cover deterministic assembly, compact Bookmarklet generation, exact no-inflation packaging, absence of `%20` encoding, large-runtime packaging, artifact writing, exact DuckDB package/core identity, deterministic engine-manifest serialization, rejection of floating/version-mismatched engine assets, and deterministic sanitized Browser SQL probe generation.

Chromium smoke coverage executes the generated runtime Bookmarklet on a clean page with deterministic mocked Leumi endpoints. The targeted Browser SQL probe spec separately verifies real Chromium Blob Worker, exact pinned Worker/Wasm loading, OPFS COMMIT/CHECKPOINT/reopen and probe-only cleanup.

Real Chrome bookmark storage/execution on the authenticated Leumi site remains provider-dependent live verification and must not be claimed from CI alone.
