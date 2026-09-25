# Browser SQL Live Gate L-1 — WP-03 Runbook

This document defines the safe live-verification procedure for the Browser SQL implementation-entry gate.

Operational progress and the current gate result belong only in `../STATUS.json`.

## Purpose

WP-03 verifies capabilities that deterministic CI cannot prove on the real authenticated Leumi origin:

- injected JavaScript execution;
- Blob Worker creation;
- exact pinned DuckDB Worker loading;
- exact pinned DuckDB Wasm instantiation;
- OPFS open/write;
- COMMIT + CHECKPOINT;
- Worker teardown/reopen;
- page refresh/relaunch + reopen;
- exclusive Web Locks behavior across two authenticated same-origin tabs.

This is a capability probe only. It must not call Leumi provider APIs and must not open the production Market Flow database.

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

Use the exact WP-02 probe generated from the repository commit being verified.

Build:

~~~text
npm ci
npm run build:browser-sql-probe
~~~

Generated artifacts:

~~~text
runtime/dist/market-flow-v2.browser-sql-probe.js
runtime/dist/market-flow-v2.browser-sql-probe.bookmarklet.txt
~~~

The probe owns only:

~~~text
market-flow-browser-sql-probe-v2.duckdb
market-flow-browser-sql-probe-v2.duckdb.wal
~~~

The synthetic Web Lock name used below is:

~~~text
market-flow:wp03:web-lock-probe
~~~

It is not the production runtime-owner lock.

## Deterministic CI preflight

Before live execution, GitHub Actions runs a synthetic authenticated-Leumi-like page in real Chromium. The preflight verifies the browser mechanics that can be proven without credentials:

- injected probe execution on a same-origin synthetic page;
- Blob Worker creation;
- exact pinned Worker/Wasm loading;
- OPFS write, COMMIT, CHECKPOINT and reopen;
- persisted-marker visibility across two same-origin tabs;
- page reload/reopen;
- exclusive Web Lock denial while another tab holds the lock;
- acquisition after explicit release;
- browser lock release after owner-tab close;
- probe-only cleanup.

CI evidence from this preflight is **not** live-origin evidence. For the real authenticated Leumi page these outcomes remain `Inferred` until Part A/Part B below are directly observed there.

## Part A — Worker/Wasm/OPFS probe

### A1. Initial run

Open an already-authenticated Leumi market page and execute the generated Browser SQL probe Bookmarklet.

The probe auto-runs by default and writes only a synthetic marker.

The sanitized result is logged as:

~~~text
Market Flow Browser SQL probe: { ... }
~~~

Required stages:

~~~text
bookmarklet-bootstrap
browser-capabilities
blob-worker-create
worker-asset-load
wasm-instantiate
opfs-open
write-commit-checkpoint
reopen-verify
~~~

Every required stage must be `passed`.

Do not copy unrelated console/network output.

### A2. Page refresh/relaunch persistence proof

After A1 passed:

1. refresh the same authenticated Leumi page;
2. before injecting the probe again, set:

~~~js
window.__MARKET_FLOW_BROWSER_SQL_PROBE_AUTO_RUN__ = false;
~~~

3. execute the same generated Browser SQL probe Bookmarklet;
4. run only the persisted-marker verification:

~~~js
await MarketFlowBrowserSqlProbe.verify();
~~~

Expected sanitized result:

~~~text
status = "passed"
marker = "market-flow-browser-sql-probe-synthetic-v1"
~~~

This proves the probe database survived page refresh/relaunch and reopened coherently without rewriting the marker first.

### A3. Probe-only cleanup

After persistence verification, run:

~~~js
await MarketFlowBrowserSqlProbe.cleanup();
~~~

Expected:

~~~text
status = "passed"
deletedEntries contains only the two probe-owned filenames
~~~

Never delete arbitrary OPFS entries or clear the Leumi origin storage.

## Part B — two-tab Web Locks proof

Use two independently opened authenticated Leumi tabs on the same origin and browser profile.

### B1. Capability check in both tabs

Run:

~~~js
({
  locksAvailable:
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
})
~~~

Required: `locksAvailable === true`.

### B2. Tab A acquires and holds the synthetic exclusive lock

Run in Tab A:

~~~js
window.__mfWp03LockRelease = null;
window.__mfWp03LockRequest = navigator.locks.request(
  "market-flow:wp03:web-lock-probe",
  {
    mode: "exclusive",
    ifAvailable: true
  },
  lock => {
    if (!lock) {
      console.log({
        probe: "wp03-web-lock",
        acquired: false
      });
      return;
    }

    console.log({
      probe: "wp03-web-lock",
      acquired: true
    });

    return new Promise(resolve => {
      window.__mfWp03LockRelease = () => {
        window.__mfWp03LockRelease = null;
        resolve();
      };
    });
  }
);
~~~

Required sanitized observation:

~~~text
acquired = true
~~~

Keep Tab A open and do not call the release function yet.

### B3. Tab B must fail fast while Tab A holds the lock

Run in Tab B:

~~~js
await navigator.locks.request(
  "market-flow:wp03:web-lock-probe",
  {
    mode: "exclusive",
    ifAvailable: true
  },
  lock => ({
    acquired: Boolean(lock)
  })
);
~~~

Required:

~~~text
acquired = false
~~~

No waiting election, heartbeat, localStorage, IndexedDB or `steal:true` may be used.

### B4. Release Tab A

Run in Tab A:

~~~js
window.__mfWp03LockRelease();
await window.__mfWp03LockRequest;
~~~

Alternatively, closing Tab A is acceptable for the release-on-owner-loss observation.

### B5. Tab B acquires after release

Run the B3 request again in Tab B.

Required:

~~~text
acquired = true
~~~

This confirms the second tab can become owner only after the first exclusive holder releases/closes.

## Evidence classification

Every material item must be recorded as exactly one of:

~~~text
Verified
Inferred
Unknown
~~~

`Verified` means directly observed on the real authenticated Leumi origin.

Do not upgrade CI evidence to `Verified` for the live origin.

## Sanitized evidence template

Record only the following shape or an equivalent sanitized summary:

~~~json
{
  "repositoryCommit": "<commit>",
  "browser": "<browser/version>",
  "workerWasmOpfs": {
    "bookmarkletBootstrap": "Verified|Inferred|Unknown",
    "browserCapabilities": "Verified|Inferred|Unknown",
    "blobWorkerCreate": "Verified|Inferred|Unknown",
    "workerAssetLoad": "Verified|Inferred|Unknown",
    "wasmInstantiate": "Verified|Inferred|Unknown",
    "opfsOpen": "Verified|Inferred|Unknown",
    "writeCommitCheckpoint": "Verified|Inferred|Unknown",
    "workerReopenVerify": "Verified|Inferred|Unknown",
    "pageRefreshRelaunchReopen": "Verified|Inferred|Unknown",
    "probeCleanup": "Verified|Inferred|Unknown"
  },
  "webLocks": {
    "apiAvailable": "Verified|Inferred|Unknown",
    "tabAAcquiresExclusive": "Verified|Inferred|Unknown",
    "tabBDeniedWhileAHolds": "Verified|Inferred|Unknown",
    "tabBAcquiresAfterRelease": "Verified|Inferred|Unknown",
    "stealUsed": false,
    "fallbackElectionUsed": false
  },
  "sanitization": {
    "cookiesPersisted": false,
    "tokensPersisted": false,
    "authorizationHeadersPersisted": false,
    "accountDataPersisted": false,
    "harPersisted": false,
    "privateScreenshotsPersisted": false
  }
}
~~~

## Gate decision

PASS requires every required Worker/Wasm/OPFS/page-reopen/Web-Locks capability above to be directly `Verified`.

If any required capability fails or remains `Unknown`:

~~~text
WP-03 remains open
WP-05+ remains blocked
record the exact failed/unknown capability
revisit the relevant runtime-delivery assumption before dependent implementation
~~~

Do not weaken the architecture with an unverified fallback merely to pass this gate.
