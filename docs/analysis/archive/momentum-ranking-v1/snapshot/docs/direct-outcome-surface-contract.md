# Direct Short-Horizon Outcome Surface Contract

Issue: #15  
Date: 2026-09-23

## Strategy correction — active-trading eligibility and spread

For Momentum Ranking V1, the candidate universe is expected to contain securities with **recent executed trading activity**.

Therefore:

~~~text
recent executed activity / trade recency
= eligibility signal for "alive now"

displayed spread
= raw diagnostic only
= NOT a ranking input
= NOT an eligibility gate
~~~

The primary future-price outcome is BID advancement:

~~~text
FutureBidVsCurrentBidReturn(h) =
(BID1(endpoint_h) / BID1(t0) - 1) * 100
~~~

and the corresponding future BID path is used for MFE/MAE and target/adverse timing.

`ASK(t0) → future BID` remains an optional conservative execution-friction diagnostic only. It must not be used as the primary signal-selection outcome because doing so embeds current spread into the target and would contradict the active-trading strategy assumption.

---

## 1. Purpose

Define the historical labels needed to answer the project's actual question:

> From an observation available at time `t0`, what useful upward movement became observable afterward, how quickly, before how much adverse movement, and—where L1 allows—what gross future BID exitability was visible from a plausible entry reference?

This contract is deliberately **observation-based**.

It does not require a wave to have been segmented first.

That gives Issue #15 an all-observation baseline against which later wave-memory, pattern, regime and ranking hypotheses can be tested.

## 2. Non-negotiable separation

~~~text
information available at or before t0
= candidate online input

information strictly after t0
= outcome / label only
~~~

Future outcome values must never be fed into the feature state being evaluated at `t0`.

In particular:

- future MFE;
- future MAE;
- future target hit;
- future adverse hit;
- future BID;
- final excursion;
- future wave endpoint

are labels, never decision-time features.

## 3. Observation identity

Every base observation must be addressable by at least:

~~~text
securityId
observationTimestamp = t0
source cycle / snapshot identity when available
session/date identity
~~~

Canonical security ID remains:

~~~text
String(PaperId or Key)
~~~

The per-security observation timestamp is the temporal anchor.

A full collection cycle is **not** treated as one simultaneous market instant.

## 4. Denominator — every eligible observation, not only successful waves

The base denominator is built from all structurally valid historical observations that satisfy the minimum requirements for the label family being evaluated.

Do **not** filter the denominator by:

- whether a wave later formed;
- whether price later rose;
- whether a target was hit;
- whether the stock ranked highly;
- whether the observation looks interesting in hindsight.

Required accounting:

~~~text
requested observations
base structurally valid observations
label-family eligible observations
evaluable observations
censored observations
invalid observations
~~~

and for each exclusion/censoring class:

~~~text
count
reason
security/date distribution where useful
~~~

A success-only denominator is invalid for Issue #15.

## 5. Eligibility is label-family specific

One observation may be evaluable for one outcome family and UNKNOWN/CENSORED for another.

### 5.1 Primary BID-advancement labels

Require:

~~~text
valid BID1(t0)
valid future BID1 observations
~~~

Primary decision-aligned reference:

~~~text
BID1(t0)
~~~

This family owns `FutureBidVsCurrentBidReturn`, `BidAdvanceMFE`, `BidAdvanceMAE` and BID-path target/adverse timing.

### 5.2 Market-center control labels

Require a valid decision-time market-center reference:

~~~text
MID(t0) = (BID1(t0) + ASK1(t0)) / 2
~~~

only when both L1 quotes are valid under verified provider semantics.

MID is the parallel raw-market control, not the primary model-selection family.

### 5.3 LAST-reference labels

Require a verified phase-aware conceptual LAST mapping at `t0`.

Until that mapping is verified, LAST-based labels must preserve semantic status rather than silently assuming a provider field.

### 5.4 ASK-entry → future-BID diagnostic labels

Require:

~~~text
valid ASK1(t0)
valid future BID1 observations
~~~

This is a conservative displayed touch-price execution-friction diagnostic:

~~~text
aggressive entry now
→ possible displayed exit later
~~~

It is **not** an actual fill simulation and must not determine predictive model selection.

### 5.5 LAST-entry-reference → future-BID labels

Require:

~~~text
valid LAST(t0)
valid future BID1 observations
~~~

This is a looser historical transaction-reference view and must remain separate from the ASK-entry proxy.

## 6. Research horizon grid

Initial analysis horizon set:

~~~text
H = {5, 10, 20, 30, 40, 50, 60, 90, 120} seconds
~~~

Reasons:

- preserves the primary seconds-to-~2-minute objective;
- includes the original 5/10/20/30/60/120 research grid;
- includes the 40/50/90-second horizons already proposed for historical BID exitability.

This does **not** imply that every horizon is equally observable with the current collection cadence.

Each horizon must carry its own coverage/evaluability statistics.

## 7. Timestamp semantics — never assume exact cadence

For a requested horizon `h`:

~~~text
deadline = t0 + h
~~~

Do not index by “N rows later”.

Use actual timestamps.

### 7.1 Endpoint-at-h label

For an endpoint return at horizon `h`:

- use the latest valid observation whose timestamp is `<= deadline`;
- require that its distance from the deadline is within a configured endpoint tolerance;
- never use an observation after the deadline to represent “return at h”;
- record the actual matched timestamp and signed/absolute deadline error.

Conceptually:

~~~text
matchedEndpointTimestamp <= t0 + h
deadline - matchedEndpointTimestamp <= endpointTolerance
~~~

Otherwise:

~~~text
ENDPOINT_CENSORED
~~~

### 7.2 Empirically calibrated endpoint tolerance

The first real same-origin V1 history measurement is recorded in:

~~~text
docs/analysis/momentum-ranking-v1/docs/issue-15-history-coverage-measurement.md
~~~

For the current V1 research dataset:

~~~text
endpointToleranceMs = 7229
~~~

This is the maximum observed p99 endpoint-timing error across the 10–120 second horizons. One global value is used to avoid horizon-specific post-hoc tuning.

The rule remains:

~~~text
matchedEndpointTimestamp <= deadline
~~~

No after-deadline observation may be used.

The 5-second horizon remains declared but is LOW_COVERAGE_DIAGNOSTIC under the current cadence; a tolerance cannot manufacture a missing pre-deadline observation.

`maxAllowedPathGap` and `minimumPathCoverage` remain unresolved pending an exact timestamp-only gap-policy coverage sweep.

All coverage parameters are run configuration and must be persisted with research results.

## 8. Path window

For path-dependent outcomes at horizon `h`, use only valid observations with:

~~~text
t0 < timestamp <= t0 + h
~~~

No observation after the timeout may contribute to:

- MFE;
- MAE;
- barrier-first;
- TimeToTarget;
- TimeToAdverse.

Path metadata must preserve:

~~~text
pathSampleCount
firstFutureSampleDelay
lastSampleBeforeDeadlineAge
maxInterObservationGap
coverage/censoring state
~~~

A path with unacceptable gaps is not silently treated as fully observed.

## 9. Raw market-center excursion surface

Where MID is valid, define:

~~~text
MidReturn(t) =
(MID(t) / MID(t0) - 1) * 100
~~~

For each horizon `h`:

~~~text
MidMFE(h) = max MidReturn(t) for t in (t0, t0+h]
MidMAE(h) = min MidReturn(t) for t in (t0, t0+h]
~~~

This is the preferred **raw market-center** excursion family because it is less directly exposed to trade-price bid/ask bounce than LAST.

It is still snapshot-based and not an executable return.

## 10. LAST excursion surface

Where conceptual LAST is valid:

~~~text
LastReturn(t) =
(LAST(t) / LAST(t0) - 1) * 100
~~~

For each horizon:

~~~text
LastMFE(h)
LastMAE(h)
FutureLastReturn(h)
~~~

LAST outcomes are supplementary and must remain distinct from MID and touch-exit outcomes.

## 11. Future-BID outcome surfaces

### 11.0 Current BID reference → future BID — PRIMARY

~~~text
FutureBidVsCurrentBidReturn(h) =
(BID1(endpoint_h) / BID1(t0) - 1) * 100
~~~

For every valid future BID observation:

~~~text
BidAdvanceReturn(t) =
(BID1(t) / BID1(t0) - 1) * 100
~~~

Then:

~~~text
BidAdvanceMFE(h) = max BidAdvanceReturn(t)
BidAdvanceMAE(h) = min BidAdvanceReturn(t)
~~~

This is the primary decision-aligned outcome family for sparse-core selection.

It measures whether the exit-side BID advanced after NOW without embedding current spread into the label.

### 11.1 Historical LAST reference → future BID

~~~text
FutureBidVsEntryLastReturn(h) =
(BID1(endpoint_h) / LAST(t0) - 1) * 100
~~~

This asks:

> If the historical transaction reference at `t0` were the entry reference, what gross displayed BID return was visible near horizon `h`?

### 11.2 Historical ASK touch entry → future BID

~~~text
FutureBidVsEntryAskReturn(h) =
(BID1(endpoint_h) / ASK1(t0) - 1) * 100
~~~

This is the stricter touch-price proxy.

It naturally includes the initial spread hurdle.

### 11.3 Touch-exit path

For every valid future BID observation:

~~~text
BidVsEntryAskReturn(t) =
(BID1(t) / ASK1(t0) - 1) * 100
~~~

Then:

~~~text
TouchExitMFE(h) = max BidVsEntryAskReturn(t)
TouchExitMAE(h) = min BidVsEntryAskReturn(t)
~~~

This is still:

~~~text
displayed touch economics
!=
guaranteed fill
!=
full-size executable result
~~~

Depth, size, latency, queue priority, slippage, impact and explicit costs remain separate.

## 12. Target / adverse grid

Issue #15 labels operate on explicit tuples:

~~~text
TargetCandidate {
  targetPct,
  timeoutSec,
  adversePct,
  referenceFamily
}
~~~

The fixed v1 research grid and aggregate report schema are defined normatively in:

`docs/analysis/momentum-ranking-v1/docs/direct-outcome-grid-report-schema.md`

Grid v1:

~~~text
H = {5,10,20,30,40,50,60,90,120} seconds
T = {0.10%,0.20%,0.30%,0.50%}
A = {0.10%,0.20%,0.30%}
~~~

Primary reference family:

~~~text
BID_TO_FUTURE_BID
~~~

Parallel raw-market control:

~~~text
MID_MARKET
~~~

Optional conservative diagnostic:

~~~text
ASK_ENTRY_TO_BID_EXIT
~~~

LAST-based families remain secondary/blocked until canonical phase-aware LAST semantics are verified.

These are research barriers, not optimized production thresholds.

## 13. First observed target/adverse events

Because the current history is snapshot-based, the contract does not claim exact first-passage time.

For a target curve `R(t)`:

~~~text
firstObservedTargetTimestamp =
first observed t where R(t) >= targetPct
~~~

and:

~~~text
firstObservedAdverseTimestamp =
first observed t where R(t) <= -adversePct
~~~

The state is:

~~~text
TARGET_OBSERVED_FIRST
ADVERSE_OBSERVED_FIRST
NEITHER_OBSERVED
UNRESOLVED
UNKNOWN
~~~

Use names that preserve the word **observed**.

Do not silently shorten this to a claim about the unobserved continuous path.

## 14. TimeToTarget is interval-censored by sampling

If the first observed target hit occurs at sample `tk`, and the prior valid sample `tk-1` was below target:

~~~text
actual crossing occurred somewhere in:
(tk-1, tk]
~~~

Therefore preserve:

~~~text
ObservedTimeToTarget = tk - t0

TimeToTargetInterval = (
  tk-1 - t0,
  tk - t0
]
~~~

when the prior sample is available and path coverage is valid.

The same applies to adverse-barrier timing.

This avoids false precision such as claiming a 12.37-second crossing from five-second snapshots.

## 15. Barrier-order limitation

Even when:

~~~text
TARGET_OBSERVED_FIRST
~~~

the unobserved path between snapshots may have touched the adverse barrier first.

Therefore Issue #15 produces:

~~~text
observed barrier order
~~~

not true event-time barrier order.

Exact/near-exact event ordering is a separate data-resolution question for Issue #12 (trade tape / richer data).

## 16. Censoring

Do not drop observations merely because the future label cannot be fully observed.

Required censoring examples:

~~~text
RIGHT_CENSORED_DATA_END
RIGHT_CENSORED_SESSION_END
CENSORED_PHASE_BOUNDARY
CENSORED_DATA_GAP
ENDPOINT_TOLERANCE_MISS
REFERENCE_INVALID
FUTURE_REFERENCE_INVALID
SEMANTICS_UNVERIFIED
UNKNOWN
~~~

A censored observation is not:

~~~text
failure
success
zero return
neutral
~~~

## 17. Session / phase boundary rule

A future window must not silently cross a market-mechanism boundary that is known to be incompatible.

Until authoritative TASE session/phase semantics are verified:

- do not fabricate phase boundaries;
- preserve phase compatibility as UNKNOWN where necessary;
- document which windows were included/excluded under the verified rules available at research time.

## 18. Outcome record shape

A conceptual per-observation/per-horizon record should preserve at least:

~~~text
securityId
t0
horizonSec
referenceFamily

entryReferenceValue
entryReferenceSemanticStatus

matchedEndpointTimestamp
endpointTimingErrorSec
endpointReturnPct

mfePct
maePct

pathSampleCount
firstFutureSampleDelaySec
lastSampleBeforeDeadlineAgeSec
maxInterObservationGapSec

targetPct
adversePct
observedBarrierOrder
observedTimeToTargetSec
observedTimeToAdverseSec
timeToTargetInterval
timeToAdverseInterval

coverageState
censorReason
~~~

Touch-exit records additionally preserve:

~~~text
entryAsk
futureBidReference
~~~

No field name should imply actual execution unless actual execution telemetry exists.

## 19. Denominator / integrity report

Every generated surface must report:

~~~text
requestedBaseObservations
structurallyValidBaseObservations
eligibleByReferenceFamily
evaluableByHorizon
censoredByHorizon
censorReasons
uniqueSecurityCount
duplicateObservationKeys
missing / invalid reference counts
pathCoverage distribution
endpointTimingError distribution
~~~

No aggregate result is accepted without its denominator/coverage metadata.

## 20. No-leakage rules

### Online feature boundary

At `t0`, features may use only observations with timestamp `<= t0`.

### Label boundary

Outcome generation may inspect `> t0` only to create labels.

### Split boundary

Later model/threshold evaluation must be time/session separated.

Randomly splitting highly overlapping snapshots into train/test is not acceptable; Issue #11 owns the final leakage-safe protocol.

### Target-selection boundary

Do not inspect test outcomes to choose the target/adverse grid, endpoint tolerance or censoring policy and then report those same outcomes as unbiased evidence.

## 21. Required parallel views

Issue #15 should preserve these distinct outcome views:

~~~text
1. PRIMARY: BID advancement
   BID(t0) → future BID

2. raw market-center control
   MID-based

3. optional diagnostic only
   ASK(t0) → future BID

4. trade-price movement
   LAST-based only when semantics are verified
~~~

They answer different questions.

Do not average them into one label, and do not use the ASK→BID diagnostic to penalize ranking for displayed spread.

## 22. Interpretation boundary

These surfaces may later support statements such as:

~~~text
under state X,
target Y was historically observed before adverse Z
within timeout H
with coverage C
~~~

They do **not** yet support:

~~~text
there is a 72% chance this stock will rise
~~~

until Issue #11 establishes sufficient data, calibration and out-of-sample evidence.

## 23. Relationship to later issues

- **Issue #16:** precursor→price conversion latency and signal opportunity half-life.
- **Issue #6/#7:** segmented wave capacity and pattern recurrence, to be compared against this all-observation baseline.
- **Issue #9:** regime-conditioned transferability/decay.
- **Issue #10:** CentralRanker consumption of calibrated/validated outcome priors.
- **Issue #11:** leakage-safe evaluation/calibration.
- **Issue #12:** whether current snapshot resolution is insufficient for true barrier ordering/execution questions.
- **Issue #13:** final implementation-ready synthesis.

## 24. Completion criterion for this contract

The contract is complete when the next implementation/research step can answer, without inventing semantics:

1. which observations enter each denominator;
2. which future samples belong to a horizon;
3. how endpoint and path labels are computed;
4. how timing uncertainty is represented;
5. how censoring is represented;
6. how raw-market and touch-exit outcomes remain separated;
7. exactly where future information is allowed and forbidden.

The next work unit is **data-feasibility mapping** against the actual Local History Viewer/storage schema: classify every required field/timestamp above as AVAILABLE NOW, DERIVABLE NOW, SEMANTICS-BLOCKED, or DATA-NOT-COLLECTED before writing a label generator.
