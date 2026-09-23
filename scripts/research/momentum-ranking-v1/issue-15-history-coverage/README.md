# Issue #15 — Existing-History Coverage Analyzer

## Purpose

Read the frozen Local History Viewer V1 IndexedDB history **without modifying it** and measure the timing evidence needed before choosing endpoint/path coverage tolerances.

The analyzer reports:

- per-security inter-observation delta distribution;
- first-future-sample delay distribution;
- per-horizon endpoint availability for `5/10/20/30/40/50/60/90/120s`;
- endpoint timing error when a strict endpoint candidate exists;
- session-edge censoring;
- future-sample count per evaluable path;
- maximum observed inter-sample gap per evaluable path;
- exact `history` store count vs `bySecurityTime` index coverage.

It does **not** choose `endpointTolerance`, `maxAllowedPathGap`, `minimumPathCoverage`, collection cadence, predictive thresholds, or model weights. Those decisions require the measured report. Collection/extraction cadence remains owned by Issue #18.

## Safety / data boundary

The script reads only `securityId`, `sessionId`, and `collectedAtMs`. The generated report contains aggregate counts/timing distributions only. It does not export raw provider payloads, cookies, tokens, account data, or per-security market values.

## Browser use

Run on the same Leumi browser origin that owns `market-flow-leumi-history-v1`.

1. Load/paste `history-coverage-analyzer.js` in DevTools.
2. Run:

```js
const report = await MarketFlowIssue15HistoryCoverage.run({
    download: true
});
```

`download: true` saves a sanitized aggregate JSON report locally. The analyzer uses readonly transactions and refuses to create/upgrade a missing database.

## Measurement semantics

For every `(securityId, sessionId)` sequence and horizon `h`:

- deadline = `t0 + h`;
- endpoint candidate = latest strictly-future observation at or before the deadline;
- session-edge censored = the same-session observed path ends before the deadline;
- strict evaluable = an endpoint candidate exists and the same-session observed path reaches at least the deadline;
- endpoint timing error = `deadline - endpointTimestamp`;
- no tolerance/path-gap/minimum-coverage rule is applied yet.

Sessions are never joined across gaps.

## Deterministic test

```text
node scripts/research/momentum-ranking-v1/issue-15-history-coverage/history-coverage-analyzer.test.js
```

The test covers exact endpoint semantics, non-edge cadence misses, session boundaries, strictly increasing timestamps, and multiple securities.

## Evidence status

- Pure timing semantics: testable deterministically.
- IndexedDB adapter: requires Chromium/browser verification.
- Actual cadence/jitter/evaluability numbers: require execution against the real local IndexedDB history and remain unknown until that run is captured.
