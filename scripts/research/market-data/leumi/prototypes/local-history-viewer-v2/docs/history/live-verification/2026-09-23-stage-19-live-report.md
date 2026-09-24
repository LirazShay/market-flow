# Stage 19 Live Verification and Long-Run Report — 2026-09-23

This is historical verification evidence for Local History Viewer V1.

Current operational state remains in:

~~~text
../../../STATUS.json
~~~

Current live-verification procedure:

~~~text
../../live-verification.md
~~~

## Scope

This report preserves the evidence used to close:

- Stage 19.3 — live Leumi browser verification;
- Stage 19.4 — long-run live report.

It intentionally stores only sanitized counters, timings and classifications. Raw provider payloads, cookies, tokens, authorization headers, account data and private browser/session data are not stored here.

## Live environment

Verified browser origin/path:

~~~text
https://hb2.bankleumi.co.il
/lti/lti-app/markets/il/shares/main
~~~

Observed browser:

~~~text
Chrome 153 on Windows
timezone: Asia/Jerusalem
~~~

The exact repository commit/runtime artifact used for the original live run was not captured in the exported live evidence.

Classification:

~~~text
runtime artifact identity: Unknown
~~~

This does not change the directly observed live provider/persistence results below.

## Long-run capture

Sanitized source capture:

~~~text
market-flow-debug-20260923-122837.json
~~~

Recorder capture:

~~~text
startedAtMs: 1790163349455
generatedAtMs: 1790166517664
observed duration: 3,168,209 ms
observed duration: about 52m 48s
completedCycles: 596
failedCycles: 0
latestError: null
~~~

Recorder configuration:

~~~text
snapshotIntervalMs: 3000
chunkDelayMs: 1000
chunkSize: 187
refreshUniverseEveryCycle: false
~~~

Observed average completion rate over the capture interval:

~~~text
about 11.29 completed cycles/minute
~~~

## Data-integrity evidence

At the long-run capture boundary:

~~~text
requested: 561
received: 561
unique: 561
missing: 0
duplicates: 0
chunkCount: 3
~~~

Recent live cycles were complete and retained the same integrity contract.

Each observed GetSecuritiesData chunk contained:

~~~text
requested: 187
received: 187
HTTP 200
~~~

Three chunks therefore covered the current dynamic 561-security universe.

Classification:

~~~text
GetSecuritiesData completeness: Verified
current universe size at capture: Verified = 561
missing/duplicate protection at capture: Verified
~~~

## Live-data movement

Adjacent successful cycles had different market-data and provider-time fingerprints.

Examples from the captured evidence included non-zero:

~~~text
changedMarketSecuritiesVsPrevious
changedProviderTimeSecuritiesVsPrevious
~~~

The data collected by the recorder was therefore not a frozen repeated snapshot during the observed session.

Classification:

~~~text
live snapshot movement: Verified
~~~

## Persistence and Viewer

At the long-run capture boundary:

~~~text
sessions: 5
cycles: 1783
universe: 561
latest: 561
history: 855525
storage usage: 1025891130 bytes
storage usage ratio: about 8.72%
viewer state: MAIN
viewer open: true
~~~

A later sanitized live-verification capture, after another session boundary, showed:

~~~text
sessions: 6
universe: 561
latest: 561
history: 896478
viewer state: MAIN
recent complete cycles: 8/8 integrity-valid
~~~

This proves that previously persisted history remained available across a new recorder session.

Classification:

~~~text
IndexedDB latest/universe persistence: Verified
history persistence across session boundary: Verified
Viewer reading persisted state: Verified
~~~

## Repeated launch contract clarification

The live browser observation showed:

~~~text
Recorder continued normally
another Viewer opened
~~~

That behavior is accepted.

The durable contract was corrected so repeated launch:

- must not start a duplicate Recorder;
- may focus/reuse an existing Viewer or open another same-origin Viewer;
- keeps IndexedDB as the single authoritative market-data source.

No production runtime change was required for this clarification.

## Diagnostic-helper incident

The first manual helper report incorrectly returned:

~~~text
NEEDS_REVIEW
~~~

only because it required:

~~~text
recorder.status === "running"
~~~

A healthy active recorder was actually in:

~~~text
status: "running-cycle"
isRunning: true
~~~

Root cause:

- the helper treated a transient recorder phase as the semantic health contract.

Prevention:

- recorder health now uses `isRunning`;
- the phase remains diagnostic information only;
- a regression unit test covers `running-cycle + isRunning=true`.

The fix was Fast-CI verified.

## Automated closure verification

Final browser/test state for Stage 19 was verified by:

~~~text
Browser CI run: 35862723542
commit: 362fe0278f93ba9b4417522355ab4f7ae4494519
Chromium: 56 passed / 56
~~~

That run also generated and published a verified rolling runtime artifact.

The temporary push trigger used only to start this CI run was removed immediately afterward; the workflow returned byte-for-byte to its prior durable configuration.

Fast CI for the Stage 19 contract/status changes was also green before closure.

## Verified / Inferred / Unknown summary

### Verified

- real Leumi-origin runtime executed successfully;
- real GetSecuritiesData returned complete current-universe chunks;
- complete cycles preserved requested/received/unique equality;
- no missing/duplicate IDs in the captured successful cycles;
- recorder completed 596 cycles over about 52m 48s with 0 failures;
- live market/provider evidence changed between adjacent cycles;
- IndexedDB persisted latest/universe/history;
- history survived a later recorder session;
- Viewer rendered persisted state;
- repeated live launch did not disrupt the running Recorder;
- full Chromium suite passed 56/56 after the repeated-launch contract correction.

### Inferred

- the successful live recorder session necessarily passed through the configured universe-loading path.

### Unknown

- exact repository commit/runtime artifact identity of the original live browser run;
- direct MapHeat2 HTTP status in the sanitized Debug Bundle, because that endpoint status is not included in the bundle contract.

## Result

The available live and automated evidence is sufficient for the Stage 19 scope without further user-driven manual testing.

Stage 19.3 and Stage 19.4 may be closed, subject to the repository's normal STATUS update and next-pointer transition to Stage 20.
