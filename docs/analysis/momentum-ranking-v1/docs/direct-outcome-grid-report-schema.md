# Direct Outcome Grid and Aggregate Report Schema

Issue: #15
Date: 2026-09-24

## 1. Purpose

Freeze a small, objective-aligned target/adverse/horizon research surface before empirical sparse-core comparison.

This document defines **what is measured**.

It does not define:

- how data is extracted;
- polling frequency;
- endpoint tolerance derived from cadence;
- production thresholds;
- trading recommendations;
- account-specific profitability.

Those remain separate concerns.

## 2. Primary reference families

### Primary decision-aligned research family

~~~text
BID_TO_FUTURE_BID
~~~

At t0:

~~~text
reference = BID1(t0)
~~~

Future path:

~~~text
return(t) = BID1(t) / BID1(t0) - 1
~~~

This directly measures advancement of the future sellable-side BID and does not embed current spread into the primary outcome.

### Parallel raw-market control

~~~text
MID_MARKET
~~~

At t0:

~~~text
MID(t0) = (BID1(t0) + ASK1(t0)) / 2
~~~

Future path uses MID(t).

Purpose:

> distinguish predictive market movement from spread/touch-price burden.

### Secondary diagnostic family

~~~text
ASK_ENTRY_TO_BID_EXIT
~~~

This may be reported as conservative crossing-friction context, but it is not used to select/rank the predictive model.

### Deferred semantic family

~~~text
LAST_MARKET / LAST_ENTRY_TO_BID_EXIT
~~~

Remain blocked until canonical phase-aware LAST semantics are verified.

They are not required for the first sparse-core empirical comparison.

## 3. Frozen horizon grid

Use:

~~~text
H = {5, 10, 20, 30, 40, 50, 60, 90, 120} seconds
~~~

All nine horizons remain declared so coverage limitations cannot silently remove inconvenient short horizons.

Interpretation groups:

~~~text
5–20s   = immediate
30–60s  = short
90–120s = outer objective boundary
~~~

These groups are descriptive only.

Do not average them into one score unless Issue #11 later predeclares such an aggregation.

## 4. Frozen positive-target grid

Use percentage targets:

~~~text
T = {0.10%, 0.20%, 0.30%, 0.50%}
~~~

Equivalent basis points:

~~~text
{10, 20, 30, 50 bps}
~~~

Rationale:

- small enough to study fast short-horizon opportunities;
- broad enough to distinguish very small from materially larger excursions;
- limited to four values to reduce threshold mining;
- larger-tail behavior remains visible through continuous MFE rather than adding many more target thresholds.

These are research barriers, not claims that one target is optimal or executable.

## 5. Frozen adverse grid

Use:

~~~text
A = {0.10%, 0.20%, 0.30%}
~~~

Equivalent:

~~~text
{10, 20, 30 bps}
~~~

Rationale:

- captures tight, moderate and wider short-horizon adverse budgets;
- keeps the surface small;
- avoids encoding one fixed risk/reward ratio before evidence exists.

All target/adverse combinations are retained.

Do not remove an apparently unattractive combination after seeing results.

## 6. Full barrier surface

For each valid reference family evaluate:

~~~text
4 targets
× 3 adverse barriers
× 9 horizons
= 108 barrier cells
~~~

per reference family.

For the first useful research pass:

~~~text
BID_TO_FUTURE_BID: 108 cells
MID_MARKET:         108 cells
~~~

Total:

~~~text
216 predeclared barrier cells
~~~

This is a reporting surface, not 216 independently optimized models.

## 7. Why not add 0.05%, 0.75%, 1.00%, etc.

The continuous outcomes already preserve:

~~~text
MFE
MAE
endpoint return
~~~

so tail behavior is visible without multiplying barrier thresholds.

If later evidence shows the fixed grid misses an important regime, a new grid version may be created using development data only.

The original grid remains immutable for its declared test period.

## 8. Barrier-order semantics

For each:

~~~text
(referenceFamily, targetPct, adversePct, horizonSec)
~~~

report exactly one path state:

~~~text
TARGET_OBSERVED_FIRST
ADVERSE_OBSERVED_FIRST
NEITHER_OBSERVED
UNRESOLVED
CENSORED
UNKNOWN
~~~

### TARGET_OBSERVED_FIRST

First observed target timestamp is strictly earlier than first observed adverse timestamp.

### ADVERSE_OBSERVED_FIRST

First observed adverse timestamp is strictly earlier.

### UNRESOLVED

Sampling resolution cannot determine observed order safely, including a same-sample ambiguity where both barriers become satisfied without an observed ordering.

### NEITHER_OBSERVED

Neither barrier was observed before timeout **and the path is sufficiently evaluable through the horizon**.

### CENSORED

Future path was not sufficiently observable through the required window.

Censored is not failure.

## 9. Continuous outcomes reported for every horizon

For the primary BID family and the parallel MID control preserve:

~~~text
endpointReturnPct
MFE_pct
MAE_pct
ObservedTimeToMFE_sec
ObservedTimeToMAE_sec
~~~

For the primary BID family:

~~~text
FutureBidVsCurrentBidReturn
BidAdvanceMFE
BidAdvanceMAE
~~~

Optional ASK→future-BID diagnostic may also report its touch-exit equivalents, but they are not model-selection outcomes.

Timing fields remain sampling-aware and must not imply true continuous event times.

## 10. Time-to-barrier outcomes

For each barrier cell preserve:

~~~text
ObservedTimeToTargetSec
ObservedTimeToAdverseSec
TimeToTargetInterval
TimeToAdverseInterval
~~~

Do not report a single precise crossing time when the crossing is known only to lie between snapshots.

## 11. Aggregate report — run identity

Every aggregate report starts with:

~~~text
reportSchemaVersion
outcomeGridVersion
researchRunId
generatedAt
sourceDatasetId / source period
referenceFamilies
horizonGrid
targetGridPct
adverseGridPct
endpointToleranceConfig
pathGapPolicy
phasePolicy
~~~

Current empirical cadence work defines the initial V1 endpoint configuration:

~~~text
endpointToleranceConfig:
  mode: GLOBAL_BEFORE_DEADLINE
  toleranceMs: 7229
  calibrationBasis: max p99 endpoint timing error across 10–120s
~~~

The 5-second horizon remains declared but LOW_COVERAGE_DIAGNOSTIC under the current cadence.

`pathGapPolicy` remains unset/pending until the timestamp-only gap-policy sweep is measured. An unset configuration must be explicit, not silently defaulted.

## 12. Aggregate report — denominator integrity

Per reference family report:

~~~text
requestedBaseObservations
structurallyValidBaseObservations
referenceEligibleObservations
uniqueSecurityCount
sessionDayCount
duplicateObservationKeys
invalidReferenceCount
~~~

Then per horizon:

~~~text
evaluableCount
censoredCount
unknownCount
coverageRate
censorReasonCounts
endpointTimingErrorDistribution
pathSampleCountDistribution
maxInterObservationGapDistribution
~~~

Every success/rate metric must sit next to its denominator.

## 13. Aggregate report — continuous surface

For each:

~~~text
(referenceFamily, horizonSec)
~~~

report distribution summaries for:

~~~text
endpointReturnPct
MFE_pct
MAE_pct
ObservedTimeToMFE_sec
ObservedTimeToMAE_sec
~~~

Required descriptive statistics where sample size permits:

~~~text
count
mean
median
p10
p25
p75
p90
min
max
~~~

Do not interpret these as calibrated probabilities.

## 14. Aggregate report — barrier surface row

Each of the 108 cells per reference family reports:

~~~text
referenceFamily
horizonSec
targetPct
adversePct

eligibleCount
barrierOrderEvaluableCount
censoredCount
unknownCount

targetObservedFirstCount
adverseObservedFirstCount
neitherObservedCount
unresolvedCount

targetObservedFirstRateAmongEvaluable
adverseObservedFirstRateAmongEvaluable
neitherObservedRateAmongEvaluable
unresolvedRateAmongEvaluable

ObservedTimeToTarget distribution
ObservedTimeToAdverse distribution
MFE distribution
MAE distribution
~~~

Important:

~~~text
censored observations
must not be silently moved into
NEITHER_OBSERVED or ADVERSE_OBSERVED_FIRST
~~~

## 15. Rate denominator rule

Primary barrier-order rates use:

~~~text
barrierOrderEvaluableCount
~~~

as denominator.

Coverage is always reported separately:

~~~text
coverageRate = barrierOrderEvaluableCount / referenceEligibleCount
~~~

Do not publish a target-first percentage without coverage.

This prevents a model from looking excellent merely because difficult observations were censored.

## 16. Sparse-core comparison section

When Issue #11 later compares concepts/models, the outcome report should attach:

~~~text
candidateModelId
conceptSet
architecturalRoles
developmentFold / testPeriod identity
same outcome-grid version
same denominator policy
~~~

and report deltas versus declared baselines on the **same cells**.

No candidate gets its own custom favorable grid.

## 17. Selection-facing summary

To avoid cherry-picking one lucky cell, the summary must display:

- all predeclared horizons;
- all four targets;
- all three adverse budgets;
- BID-advance and MID views side by side;
- coverage/censoring;
- lateness/time-to-target;
- MFE/MAE.

Stage #11 may later define a formal aggregate comparison rule.

Until then:

> no model is declared superior because of one best target/horizon cell.

## 18. Primary interpretation order

When reading a result, use this order:

~~~text
1. Is coverage trustworthy?
2. Is target-before-adverse improved?
3. Is the improvement early enough / TimeToTarget acceptable?
4. What happened to MAE?
5. Is future BID advancement improved?
6. Does MID show the same underlying market improvement?
7. Is the result stable across nearby horizons/targets rather than one isolated cell?
~~~

This order is designed to keep the research aligned with capturable opportunity.

## 19. No account-specific economics in the raw surface

The raw Issue #15 surface does not hardcode:

- one brokerage commission;
- one account size;
- tax;
- one position size.

Those belong to execution/net-opportunity evaluation layers.

Current spread is deliberately not a selection gate. The primary BID→future-BID outcome measures the movement objective directly. ASK→future-BID may remain a separate diagnostic only.

## 20. Versioning rule

Initial fixed version:

~~~text
outcomeGridVersion = 1

H = {5,10,20,30,40,50,60,90,120}s
T = {0.10,0.20,0.30,0.50}%
A = {0.10,0.20,0.30}%
~~~

If research later changes the grid:

- increment the version;
- document the reason;
- never retroactively relabel v1 results as if they used the new grid;
- do not choose v2 from the locked v1 final test and then reuse that same period as unbiased final evidence.

## 21. What remains deliberately unresolved

This step does **not** choose:

~~~text
endpointTolerance
maxAllowedPathGap
minimumPathCoverage
exact phase compatibility policy
final statistical uncertainty method
final model-selection aggregate score
~~~

Those depend on cadence/data methodology (#18) and validation methodology (#11).

Leaving them explicit is preferable to inventing numbers.

## 22. Issue #15 research-definition status after this step

The following are now fixed:

- outcome references;
- horizon grid;
- target grid;
- adverse grid;
- barrier-order states;
- continuous outcome panel;
- aggregate denominator schema;
- barrier-surface report schema;
- grid versioning / no-cherry-picking rules.

The direct-outcome **research definition** is therefore ready for later empirical execution.

Actual data extraction/generation remains separate.
