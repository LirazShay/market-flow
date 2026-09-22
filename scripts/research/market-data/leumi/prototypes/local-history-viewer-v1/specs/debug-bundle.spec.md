# MF-LHV-DEBUG-001 — Sanitized Live Debug Bundle Specification

## Purpose

The Debug Bundle captures enough bounded, sanitized evidence from a running Local History Viewer session to diagnose live-provider and browser-state problems without requiring ad-hoc console archaeology or unsafe session dumps.

It is specifically intended for cases where:

- the provider returns valid HTTP responses but behavior is ambiguous;
- market values appear frozen;
- recorder/viewer state diverges from expectations;
- a live-only problem cannot be reproduced by mocks.

Operational progress is tracked only in `../STATUS.json`.

## Scope

The Debug Bundle owns:

- bounded recorder/runtime/viewer diagnostic state;
- IndexedDB store counts;
- a bounded set of recent cycle summaries;
- market-data fingerprints;
- provider-time fingerprints;
- changed-security counts between adjacent cycles;
- provider timestamp summaries;
- safe JSON export/download.

It does not own:

- provider access;
- recorder behavior;
- market-open/closed policy;
- full raw market-data export;
- cookies, tokens, auth headers, browser storage dumps, account data, or authenticated HAR capture.

## Contract

The bundle is generated from the already-running normal runtime.

It is not a separate recorder and must not require replaying the problem in a second tool.

Runtime entry points:

~~~text
MarketFlowRuntime.createDebugBundle(options)
MarketFlowRuntime.downloadDebugBundle(options)
~~~

The download entry point writes UTF-8 JSON with a deterministic diagnostic filename pattern:

~~~text
market-flow-debug-YYYYMMDD-HHMMSS.json
~~~

Intended flow:

~~~text
run normal Bookmarklet
→ problem occurs
→ click "הורד קובץ Debug" in the Viewer
→ Debug Bundle is generated/downloaded from the existing runtime
→ inspect bounded sanitized evidence
~~~

The Viewer action is a convenience surface over the same Debug Bundle API. It must not create another collector/recorder or make provider requests.

A cycle diagnostic must include:

- cycle identity/status/timing;
- requested/received/unique/missing/duplicate counters;
- chunk count and bounded chunk provider-time metadata;
- security count;
- deterministic market-data fingerprint;
- deterministic provider-time fingerprint;
- count of securities whose market fields changed vs previous cycle;
- count of securities whose provider-time fields changed vs previous cycle;
- bounded distinct provider timestamp values.

The market fingerprint is based only on selected diagnostic market fields, not the full raw Security object.

The provider-time fingerprint is independent from the market fingerprint so these cases can be distinguished:

~~~text
market unchanged + provider time unchanged
market unchanged + provider time changed
market changed + provider time changed
~~~

## Invariants

1. The bundle is generated from the normal running runtime; it does not start a second recorder.
2. Diagnostic collection is bounded and must not call `getAll(history)` over unbounded history.
3. Raw Security/MapHeat payload dumps are not included by default.
4. Cookies, tokens, authorization headers, account numbers, private browser/session storage and authenticated HAR data are never included.
5. `null`, `0`, empty string and missing/undefined remain distinguishable in diagnostics.
6. Fingerprints are deterministic for equivalent diagnostic input regardless of row order.
7. Market-data and provider-time fingerprints are separate.
8. Recent-cycle comparison reports changed-security counts rather than assuming repeated cycles are identical.
9. A missing previous cycle yields unknown/no comparison rather than inventing zero changes.
10. Debugging output must be JSON-serializable.
11. Viewer export is observational and must not make provider requests or mutate market persistence.
12. Diagnostic evidence does not itself decide whether the exchange is open or closed.
13. Operational stage/status snapshots remain owned by `STATUS.json`, not this spec.

## Failure semantics

If diagnostic data cannot be read:

- bundle generation fails explicitly or records a bounded diagnostic error section;
- it must not alter recorder/persistence state;
- it must not trigger provider requests merely to make the bundle look complete.

If a store is large, use counts/indexed bounded reads rather than unbounded materialization.

If a value is unavailable, preserve it as unavailable/unknown; do not synthesize a market-state conclusion.

## Extension and reuse

The Debug Bundle is intended as a reusable diagnostic pattern for future Market Flow research tools.

Future extensions may add:

- provider request counters/status summaries;
- bounded console-event capture;
- performance timings;
- schema/version metadata;
- richer freshness analysis;
- one-click upload workflows.

Any extension must preserve the sanitization and bounded-read invariants.

The diagnostic layer should remain observational: it may describe evidence but should not silently change product behavior.

## Verification mapping

Pure fingerprint/change-detection behavior:

~~~text
../tests/unit/debug-bundle-logic.test.js
~~~

Browser/IndexedDB/runtime integration is covered by Playwright for the collector, assembled runtime API/download, and Viewer export action.

Real provider usefulness remains live verification.

## Change triggers

Review this spec whenever changing:

- included diagnostic fields;
- fingerprint inputs/algorithm;
- cycle comparison semantics;
- IndexedDB read strategy;
- recent-cycle bounds;
- export/download format;
- runtime API for diagnostics;
- viewer Debug UI;
- sanitization/security rules;
- provider freshness evidence captured by the bundle.

## References

- `system.spec.md`
- `provider-data-contract.spec.md`
- `recorder.spec.md`
- `persistence.spec.md`
- `runtime-delivery.spec.md`
- `../tests/TESTING_POLICY.md`
- `../../../../../../../docs/project/specification-policy.md`
