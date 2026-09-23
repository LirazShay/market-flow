"use strict";

const assert = require("node:assert/strict");
const analyzer = require("./history-coverage-analyzer.js");

function row(securityId, sessionId, collectedAtMs) {
  return { securityId, sessionId, collectedAtMs };
}

{
  const report = analyzer.analyzeRows([
    row("A", 1, 0),
    row("A", 1, 4900),
    row("A", 1, 10100),
    row("A", 1, 15000)
  ], { horizonsSec: [5, 10] });

  assert.equal(report.integrity.validRowCount, 4);
  assert.equal(report.integrity.securityCount, 1);
  assert.equal(report.integrity.sessionGroupCount, 1);
  assert.equal(report.cadence.interObservationDeltaMs.count, 3);
  assert.equal(report.cadence.interObservationDeltaMs.p50, 4900);
  assert.equal(report.cadence.interObservationDeltaMs.max, 5200);

  const h5 = report.horizons["5"];
  assert.equal(h5.baseObservationCount, 4);
  assert.equal(h5.sessionEdgeCensoredCount, 2);
  assert.equal(h5.endpointCandidateCount, 2);
  assert.equal(h5.strictEvaluableCount, 1);
  assert.equal(h5.endpointUnavailableNonEdgeCount, 1);
  assert.equal(h5.strictCoverageRateAmongNonEdge, 0.5);
  assert.equal(h5.endpointTimingErrorMs.count, 1);
  assert.equal(h5.endpointTimingErrorMs.p50, 100);

  const h10 = report.horizons["10"];
  assert.equal(h10.sessionEdgeCensoredCount, 2);
  assert.equal(h10.strictEvaluableCount, 2);
  assert.equal(h10.strictCoverageRateAmongNonEdge, 1);
  assert.equal(h10.endpointTimingErrorMs.min, 4800);
  assert.equal(h10.endpointTimingErrorMs.max, 5100);
}

{
  const report = analyzer.analyzeRows([
    row("A", 1, 0),
    row("A", 1, 4000),
    row("A", 2, 100000),
    row("A", 2, 104000)
  ], { horizonsSec: [5] });

  assert.equal(report.integrity.sessionGroupCount, 2);
  assert.equal(report.horizons["5"].sessionEdgeCensoredCount, 4);
  assert.equal(report.horizons["5"].strictEvaluableCount, 0);
}

{
  assert.throws(
    () => analyzer.analyzeRows([
      row("A", 1, 1000),
      row("A", 1, 1000)
    ], { horizonsSec: [5] }),
    /strictly increasing/
  );
}

{
  const report = analyzer.analyzeRows([
    row("A", 1, 0), row("A", 1, 1000),
    row("B", 1, 0), row("B", 1, 2000)
  ], { horizonsSec: [5] });
  assert.equal(report.integrity.securityCount, 2);
  assert.equal(report.integrity.sessionGroupCount, 2);
  assert.equal(report.cadence.firstFutureSampleDelayMs.count, 2);
}

console.log("history-coverage-analyzer tests passed");
