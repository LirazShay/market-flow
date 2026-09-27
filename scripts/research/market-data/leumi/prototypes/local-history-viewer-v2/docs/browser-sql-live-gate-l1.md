# Browser SQL Live Gate L-1 — C01 Runbook

This document defines the safe authenticated-origin verification for C01 / GitHub Issue #73.

Operational progress/result belongs only in `../STATUS.json`.

## Purpose

C01 proves only the Browser SQL feasibility facts that deterministic CI cannot prove on the real authenticated Leumi origin:

- injected JavaScript execution;
- Blob Worker creation;
- exact pinned DuckDB Worker loading;
- exact pinned DuckDB Wasm instantiation;
- OPFS open/write;
- synthetic SQL write + COMMIT;
- Worker/runtime close + reopen;
- persisted marker readback;
- probe-owned cleanup.

This probe does **not** call Leumi provider APIs and does not open the production Market Flow database.

Cross-tab Web Locks are **not** part of C01. Chromium owns Web Lock implementation verification in C10 / #82. The authenticated-origin two-tab proof belongs inside the C12 / #84 no-overlap release transition, after the old IndexedDB Recorder is settled/stopped and before SQL production recording is accepted.

The existing probe may execute CHECKPOINT as part of its current synthetic sequence. That is capability evidence only; it does **not** define production CHECKPOINT cadence or the C03 durability/acknowledgement policy.

## Safety boundary

Never copy, commit, upload or persist:

- cookies;
- session tokens;
- authorization headers;
- account numbers;
- authenticated HAR files;
- private screenshots;
- raw authenticated provider payloads;
- browser/session storage dumps.

Only sanitized PASS/FAIL stage results and non-sensitive capability observations may be recorded.

## Inputs

Use the exact pinned probe generated from the repository commit being verified.

~~~text
npm ci
npm run build:browser-sql-probe
~~~

Generated artifacts:

~~~text
runtime/dist/market-flow-v2.browser-sql-probe.js
runtime/dist/market-flow-v2.browser-sql-probe.bookmarklet.txt
~~~

The targeted probe workflow also uploads those two generated files as a short-lived GitHub Actions artifact named:

~~~text
local-history-viewer-v2-c01-live-probe-<commit-sha>
~~~

Use the artifact from the exact green commit being verified. The generated bookmarklet TXT file is the intended live-launch artifact.

Probe-owned DB names remain isolated from production identities.

## Deterministic preflight

Before live execution, real Chromium CI proves all browser mechanics that do not require the authenticated Leumi origin, including:

- injected probe bootstrap on a synthetic page;
- Blob Worker;
- exact Worker/Wasm loading;
- OPFS write/COMMIT/reopen;
- sanitized failure classification;
- probe-only cleanup.

CI evidence is not upgraded to `Verified` for the live Leumi origin.

## Live procedure

C01 should use a generated self-verifying artifact so the human role is limited to launching it inside an already-authenticated Leumi market page.

Required result:

~~~text
status = passed
~~~

Required capability stages are the probe's equivalents of:

~~~text
bookmarklet-bootstrap
browser-capabilities
blob-worker-create
worker-asset-load
wasm-instantiate
opfs-open
synthetic-write-commit
close-reopen-verify
probe-cleanup
~~~

If the current generated probe still names the write stage `write-commit-checkpoint`, a passing stage is acceptable as evidence of write/COMMIT/reopen capability; CHECKPOINT itself is not an initial-V2 production policy decision.

The current C01 artifact auto-runs the complete live gate after launch:

~~~text
run
→ close/reopen/read marker
→ probe-owned cleanup
→ sanitized C01-L1 result
~~~

The sanitized result is written to:

~~~text
window.__MARKET_FLOW_BROWSER_SQL_L1_RESULT__
~~~

and logged as a one-line JSON value prefixed by:

~~~text
Market Flow Browser SQL C01 L-1:
~~~

The result contains only engine/candidate identity, capability classifications, failed stage (if any), and explicit sanitization flags. It does not include raw browser/session/provider data.

## Evidence classification

For live-origin facts use exactly:

~~~text
Verified
Inferred
Unknown
~~~

`Verified` means directly observed by the self-verifying artifact on the authenticated Leumi origin.

## Sanitized evidence shape

An equivalent compact shape is sufficient:

~~~json
{
  "repositoryCommit": "<commit>",
  "browser": "<browser/version>",
  "probe": "C01-L1",
  "status": "passed|failed",
  "failedStage": null,
  "capabilities": {
    "bookmarkletBootstrap": "Verified|Inferred|Unknown",
    "blobWorkerCreate": "Verified|Inferred|Unknown",
    "workerAssetLoad": "Verified|Inferred|Unknown",
    "wasmInstantiate": "Verified|Inferred|Unknown",
    "opfsOpen": "Verified|Inferred|Unknown",
    "syntheticWriteCommit": "Verified|Inferred|Unknown",
    "closeReopenReadback": "Verified|Inferred|Unknown",
    "probeCleanup": "Verified|Inferred|Unknown"
  },
  "sanitization": {
    "cookiesPersisted": false,
    "tokensPersisted": false,
    "authorizationHeadersPersisted": false,
    "accountDataPersisted": false,
    "privateSessionArtifactsPersisted": false
  }
}
~~~

## Gate decision

PASS requires the required C01 Worker/Wasm/OPFS/write/COMMIT/close-reopen/cleanup capabilities to be directly `Verified`.

If a required capability fails or remains `Unknown`:

~~~text
C01 / #73 remains open
C02 / #74 remains blocked
record only the sanitized failed/unknown stage
revisit the specific runtime-delivery premise
~~~

Do not introduce an unverified fallback merely to force the gate green.
