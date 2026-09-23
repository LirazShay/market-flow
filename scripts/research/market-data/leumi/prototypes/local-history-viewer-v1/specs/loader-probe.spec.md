# MF-LHV-LOADER-001 — Remote Loader Compatibility Probe Specification

## Purpose

This spec defines the non-invasive compatibility probe used before adopting a permanent remote loader for Local History Viewer V1.

The probe answers one question:

~~~text
Can code running from a normal Bookmarklet on the real Leumi origin
fetch the verified GitHub Release manifest/runtime
and compile that fetched runtime under the site's browser/CSP rules?
~~~

It does not replace the current self-contained Bookmarklet.

Operational progress is tracked only in `../STATUS.json`.

## Scope

The probe owns:

- fetching the stable verified runtime manifest;
- fetching the runtime referenced by that manifest;
- SHA-256 and byte-length verification;
- compilation of the fetched runtime without execution;
- capture of relevant Content Security Policy violation metadata;
- a visible pass/fail panel;
- a sanitized downloadable JSON result.

It does not own:

- stopping the currently running recorder;
- replacing the currently loaded Market Flow runtime;
- executing the fetched runtime;
- IndexedDB migration;
- automatic rollback;
- final permanent-loader behavior.

Those capabilities require a later contract only if live compatibility is proven.

## Contract

The default manifest endpoint is the stable rolling verified Release asset:

~~~text
https://github.com/LirazShay/market-flow/releases/download/local-history-viewer-v1-runtime-latest/market-flow-v1.manifest.json
~~~

The manifest identifies the runtime with:

~~~text
formatVersion
buildId = sha256:<runtime SHA-256>
runtime.fileName
runtime.url
runtime.sha256
runtime.bytes
~~~

Probe sequence:

~~~text
fetch manifest with credentials omitted
→ validate manifest shape
→ fetch referenced runtime with credentials omitted
→ compute SHA-256 and byte length
→ require exact manifest match
→ compile complete runtime via Function without invoking it
→ record CSP violations/evidence
→ show result
~~~

A successful probe means the browser/origin can support the basic fetch + integrity-check + compile mechanism required by the proposed loader architecture.

It does not by itself prove hot-upgrade lifecycle correctness.

## Invariants

1. The probe never executes the downloaded runtime.
2. The probe never stops or replaces a currently running `MarketFlowRuntime`.
3. Both manifest and runtime requests use `credentials: "omit"`.
4. The runtime is not compiled unless SHA-256 and byte length match the manifest.
5. A hash mismatch is a hard failure.
6. The manifest is deterministic for a given runtime.
7. `buildId` is derived from the runtime SHA-256.
8. Probe output does not include cookies, authorization headers, account data, session tokens, or full browser-storage dumps.
9. Redirect target URLs with transient signed query parameters are not recorded in the report.
10. CSP evidence is observational and must not weaken or bypass site policy.
11. The current self-contained Bookmarklet remains the verified production delivery path until a later decision explicitly changes that contract.
12. A mocked Chromium success is not evidence that the real Leumi origin permits remote loading.

## Failure semantics

Manifest fetch failure:

~~~text
record manifestFetch failure
→ do not fetch/compile runtime
~~~

Runtime fetch failure:

~~~text
record runtimeFetch failure
→ do not hash/compile unavailable runtime
~~~

Integrity failure:

~~~text
SHA-256 mismatch or byte-length mismatch
→ record runtimeHash failure
→ do not compile
~~~

Compilation/CSP failure:

~~~text
record runtimeCompile failure
→ preserve CSP violation metadata when the browser provides it
→ do not execute code
~~~

The probe must leave the existing Market Flow recorder/viewer untouched on every failure path.

## Extension and reuse

If real Leumi live verification succeeds, this probe provides evidence for a later permanent-loader design with:

- stable tiny loader Bookmarklet;
- manifest-driven build identity;
- integrity verification before execution;
- version comparison;
- orderly runtime shutdown/dispose;
- verified runtime replacement;
- rollback/last-known-good behavior.

Those are not silently implied by this probe and require their own tests/spec updates before implementation.

If live verification fails because the Leumi origin blocks the required network or execution primitive, the result should guide an alternate delivery mechanism such as a userscript/extension without weakening CSP or access controls.

## Verification mapping

Deterministic build/manifest tests:

~~~text
../tests/unit/runtime-build.test.js
~~~

Browser probe behavior:

~~~text
../tests/automation/specs/loader-probe.spec.js
~~~

Browser CI verifies:

- manifest/runtime fetch behavior with controlled mock endpoints;
- SHA-256 verification;
- compile-without-execute behavior;
- hash-mismatch refusal;
- sanitized result download.

Actual GitHub Release access and CSP behavior on the authenticated Leumi origin require live verification.

## Change triggers

Review this spec whenever changing:

- manifest shape or build identity;
- stable Release URLs;
- request credentials/referrer policy;
- runtime integrity verification;
- runtime compilation primitive;
- CSP evidence collection;
- probe report contents;
- execution/non-execution boundary;
- adoption of a permanent loader;
- fallback delivery architecture.

## References

- `runtime-delivery.spec.md`
- `../runtime/build-runtime.js`
- `../runtime/loader-probe.js`
- `../runtime/README.md`
- `../tests/unit/runtime-build.test.js`
- `../tests/automation/specs/loader-probe.spec.js`
- `../../../../../../../docs/project/specification-policy.md`
