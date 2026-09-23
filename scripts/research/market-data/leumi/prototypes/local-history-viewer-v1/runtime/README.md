# Runtime Assembly

This directory contains the generated-delivery mechanism for Local History Viewer V1.

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
runtime/dist/market-flow-v1.runtime.js
runtime/dist/market-flow-v1.bookmarklet.txt
runtime/dist/market-flow-v1.manifest.json
runtime/dist/market-flow-loader-probe.bookmarklet.txt
~~~

The dist directory is generated and ignored by Git.

## Artifact roles

`market-flow-v1.runtime.js` is the readable assembled runtime used for inspection and debugging.

`market-flow-v1.bookmarklet.txt` is the user-facing delivery artifact. It is generated as compact single-line JavaScript. Terser is intentionally configured with compression and identifier mangling disabled: comments/formatting are removed, but source identifiers and runtime behavior remain recognizable. The Bookmarklet body is raw compact JavaScript prefixed only by `javascript:`; it is not whole-payload percent-encoded.

The normal V1 Bookmarklet remains self-contained. It does not fetch executable code from an external host.

`market-flow-v1.manifest.json` is a deterministic integrity manifest for the readable runtime. Its `buildId` is derived from the runtime SHA-256 and it records the stable verified runtime URL, SHA-256 and byte length.

`market-flow-loader-probe.bookmarklet.txt` is **not** the production launcher. It is a small non-invasive compatibility test for a possible future permanent loader. It fetches the manifest/runtime with credentials omitted, verifies the runtime against the manifest, and compiles it without executing it. It does not stop or replace a currently running Market Flow runtime.

There is no arbitrary absolute Bookmarklet size ceiling in the build. The packaging contract instead requires that the Bookmarklet body be the compact runtime itself, prefixed only by `javascript:`. This prevents URL encoding from inflating a legitimately large runtime.

## Stable verified download

A successful full Browser CI run on `main` publishes the generated delivery and compatibility artifacts to a rolling GitHub Release:

~~~text
tag:
local-history-viewer-v1-runtime-latest
~~~

Release page:

~~~text
https://github.com/LirazShay/market-flow/releases/tag/local-history-viewer-v1-runtime-latest
~~~

Stable Bookmarklet download:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-v1.bookmarklet.txt
~~~

Stable readable runtime download:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-v1.runtime.js
~~~

Stable manifest:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-v1.manifest.json
~~~

Stable loader compatibility probe:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-loader-probe.bookmarklet.txt
~~~

The rolling release is updated only after the full Chromium suite succeeds. The ordinary per-run GitHub Actions artifact is retained as additional verification evidence.

## Browser usage

Download `market-flow-v1.bookmarklet.txt`, open it as text, and copy its complete single line into the URL field of a browser bookmark.

Run that bookmark only while already on the intended Leumi page/origin.

Launching it:

~~~text
embedded assembled runtime
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
MarketFlowRuntime.createDebugBundle(options)
MarketFlowRuntime.downloadDebugBundle(options)
~~~

If stop persistence is still pending, a restart fails clearly rather than creating overlapping recorder state.

## Verification

Fast tests cover deterministic assembly, compact Bookmarklet generation, exact no-inflation packaging, absence of `%20` encoding, large-runtime packaging, and artifact writing.

Chromium smoke coverage executes the generated Bookmarklet on a clean page with deterministic mocked Leumi endpoints and verifies initial launch, repeated idempotent launch, restart after a clean stop, and the compact artifact contract.

Real Chrome bookmark storage/execution on the authenticated Leumi site remains provider-dependent live verification and must not be claimed from CI alone.


## Loader compatibility probe

Normative probe contract:

~~~text
../specs/loader-probe.spec.md
~~~

The probe may be run while an older Market Flow runtime is already active because it is observational only.

Expected live flow:

~~~text
save market-flow-loader-probe.bookmarklet.txt as a bookmark
→ open the authenticated Leumi origin
→ click the probe
→ inspect the four checks:
   Manifest fetch
   Runtime fetch
   SHA-256
   Runtime compile
→ if any check fails, download the probe JSON and use its CSP/failure evidence
~~~

A green mocked Chromium probe is not proof that the real Leumi origin permits the same remote-loader mechanism. Permanent loader/hot-upgrade implementation must wait for the live result.
