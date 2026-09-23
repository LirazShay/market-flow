# Issue #15 Data Feasibility Map

Date: 2026-09-23

Purpose:

> Map the direct-outcome contract to the **actual frozen Local History Viewer V1 schema and recorded provider payload**, before any label generator is implemented.

Classification vocabulary:

~~~text
AVAILABLE_NOW
DERIVABLE_NOW
SEMANTICS_BLOCKED
DATA_NOT_COLLECTED
~~~

This document is about **data feasibility**, not predictive value.

## 1. Source boundary

The frozen V1 database is:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Relevant stores:

~~~text
sessions
cycles
history
latest
universe
~~~

For Issue #15, historical labels must read the `history` store as source of truth.

The frozen V1 must not be modified merely to support this research.

## 2. Verified persisted observation shape

Every successful historical security row contains:

~~~text
cycleId
sessionId
securityId
chunkIndex

cycleStartedAtMs
chunkReceivedAtMs
collectedAtMs
serverAsOfDate

data
~~~

where `data` preserves the full raw `GetSecuritiesData Security` object.

History key:

~~~text
[cycleId, securityId]
~~~

History time index:

~~~text
[securityId, collectedAtMs]
~~~

This is sufficient for timestamp-ordered per-security historical scans.

## 3. Temporal anchor

### collectedAtMs — AVAILABLE_NOW

`collectedAtMs` is a local epoch-millisecond timestamp assigned after the chunk response has been parsed/completed.

It is persisted on every history row.

For Issue #15:

~~~text
t0 = history.collectedAtMs
~~~

is the canonical local observation timestamp unless a later research step proves a better synchronized reference.

### chunkReceivedAtMs — AVAILABLE_NOW

Preserved separately from `collectedAtMs`.

Useful for measuring local parsing/completion delay:

~~~text
collectedAtMs - chunkReceivedAtMs
~~~

### cycleStartedAtMs — AVAILABLE_NOW

Useful for cycle skew/context.

It must **not** replace per-security `collectedAtMs`.

### cycleId / sessionId — AVAILABLE_NOW

Useful for integrity, diagnostics and session-boundary censoring.

### serverAsOfDate — AVAILABLE_NOW, semantics qualified

The raw table `AsOfDate` is preserved per chunk/row.

Its exact relationship to each individual security field update is not proven strongly enough to replace `collectedAtMs` as the Issue #15 path clock.

Classification:

~~~text
field availability: AVAILABLE_NOW
use as canonical event time: SEMANTICS_BLOCKED
~~~

## 4. Identity and denominator integrity

### securityId — AVAILABLE_NOW

Canonical rule is already implemented:

~~~text
String(PaperId or Key)
~~~

Persisted successful cycles enforce exact membership:

~~~text
requested == received == unique
missing == 0
duplicates == 0
~~~

Failed cycles do not write partial `history` / `latest`.

Therefore:

> persisted history rows from successful cycles already sit behind a strong collection-integrity boundary.

Issue #15 still must report its own label-family denominator/censoring counts.

## 5. L1 quote fields

The full raw provider object is persisted, including:

~~~text
data.BuyLimit1
data.SellLimit1
data.BuyVolume1
data.SellVolume1
~~~

Measured snapshot availability:

~~~text
BuyLimit1 / BuyVolume1:
543 / 561 usable
96.79%

SellLimit1 / SellVolume1:
550 / 561 usable
98.04%
~~~

Therefore field presence is:

~~~text
AVAILABLE_NOW
~~~

but values remain nullable.

### zero-value caveat

Observed provider data contained:

~~~text
BuyLimit1:
null values
and
zero values
~~~

Repository evidence explicitly says zero must not automatically be collapsed into missing or assumed to be a valid executable quote.

For return arithmetic, Issue #15 may conservatively require a finite positive quote.

This is a mathematical eligibility rule, not a claim that every provider zero has one specific market meaning.

## 6. MID market-center outcomes

Given positive valid L1 quotes:

~~~text
MID =
(BuyLimit1 + SellLimit1) / 2
~~~

Classification:

~~~text
BID1/ASK1: AVAILABLE_NOW
MID: DERIVABLE_NOW
MID endpoint return: DERIVABLE_NOW
MidMFE: DERIVABLE_NOW
MidMAE: DERIVABLE_NOW
MID target/adverse observed order: DERIVABLE_NOW
interval-censored MID TimeToTarget/TimeToAdverse: DERIVABLE_NOW
~~~

No Local History Viewer change is required.

## 7. ASK(t0) → future BID touch-exit outcomes

Required fields:

~~~text
ASK1(t0) = data.SellLimit1
future BID1 = future history.data.BuyLimit1
~~~

Both are already persisted.

Therefore:

~~~text
FutureBidVsEntryAskReturn(h): DERIVABLE_NOW
BidVsEntryAskReturn(t): DERIVABLE_NOW
TouchExitMFE(h): DERIVABLE_NOW
TouchExitMAE(h): DERIVABLE_NOW
touch target/adverse observed order: DERIVABLE_NOW
interval-censored touch TimeToTarget/TimeToAdverse: DERIVABLE_NOW
~~~

Important boundary:

~~~text
touch-price outcome
!=
actual fill
~~~

The V1 history does not contain actual execution telemetry.

## 8. LAST-related fields

Persisted raw data includes:

~~~text
LastKnownRate
ContinuousLastDealRate
LastKnownRateDate
trade_time
LastDealTimeOnly
LastDealVolume
~~~

Measured availability is strong for several of these fields.

However the project has **not yet verified one canonical, phase-aware conceptual LAST mapping** suitable for all Issue #15 observations.

Therefore:

~~~text
raw candidate LAST fields: AVAILABLE_NOW
canonical LAST(t): SEMANTICS_BLOCKED
LastReturn path: SEMANTICS_BLOCKED
LastMFE / LastMAE: SEMANTICS_BLOCKED
FutureLastReturn(h): SEMANTICS_BLOCKED
FutureBidVsEntryLastReturn(h): SEMANTICS_BLOCKED
LAST-reference target/adverse labels: SEMANTICS_BLOCKED
~~~

No implementation may silently choose `LastKnownRate` or `ContinuousLastDealRate` as universal LAST.

## 9. Provider time fields

Persisted raw provider fields include:

~~~text
LastKnownRateDate
trade_time
LastDealTimeOnly
~~~

Availability:

- `LastKnownRateDate`: value observed in 100% of the measured snapshot;
- `trade_time`: value observed in 100%;
- `LastDealTimeOnly`: partial / empty-string possible.

Classification:

~~~text
raw fields: AVAILABLE_NOW
exact event-time semantics for outcome ordering: SEMANTICS_BLOCKED
~~~

They may later help freshness research after semantics are verified.

They do not currently justify replacing local collection time or reconstructing exact intra-poll trade order.

## 10. Path construction

Per-security history can be queried by:

~~~text
[securityId, collectedAtMs]
~~~

Therefore an ordered future path:

~~~text
t0 < collectedAtMs <= t0 + horizon
~~~

is:

~~~text
DERIVABLE_NOW
~~~

From it we can derive:

~~~text
pathSampleCount
firstFutureSampleDelaySec
lastSampleBeforeDeadlineAgeSec
maxInterObservationGapSec
~~~

Classification:

~~~text
DERIVABLE_NOW
~~~

## 11. Endpoint-at-horizon matching

The contract requires:

~~~text
latest valid observation timestamp <= deadline
~~~

with a later empirically chosen tolerance.

The indexed history contains enough information to find that endpoint.

Classification:

~~~text
matched endpoint candidate: DERIVABLE_NOW
deadline error: DERIVABLE_NOW
ENDPOINT_TOLERANCE_MISS state: DERIVABLE_NOW
actual endpointTolerance value: NOT YET CALIBRATED
~~~

The storage schema itself does not block this work.

## 12. Horizon feasibility under current cadence

Verified earlier live evidence:

~~~text
average full-cycle duration ≈ 4.986 seconds
no overlapping cycles
sequential chunks
~~~

Each security's timestamp is its own chunk completion time.

Consequences:

- 10–120 second horizons are structurally feasible from existing history;
- 5-second horizon is also contractually valid, but may have materially lower evaluability because the next sample can land just after the 5-second deadline;
- actual horizon coverage must be **measured**, not inferred from the average cadence.

Classification:

~~~text
horizon path data: AVAILABLE_NOW
per-horizon evaluability statistics: DERIVABLE_NOW
endpoint tolerance / maximum path-gap policy: NOT YET CALIBRATED
~~~

## 13. Session boundaries

The V1 stores:

~~~text
sessionId
sessions.startedAtMs
sessions.stoppedAtMs
session status
~~~

Therefore windows that would require crossing into another recorder session can be detected.

Classification:

~~~text
recorder-session boundary detection: DERIVABLE_NOW
RIGHT_CENSORED_DATA_END: DERIVABLE_NOW
recorder-session-end censoring: DERIVABLE_NOW
~~~

This is not equivalent to an exchange trading-session/phase boundary.

## 14. Exchange phase semantics

The current V1 data does not contain a verified normalized exchange phase field per observation.

Repository research also requires authoritative re-verification before depending on TASE phase semantics.

Therefore:

~~~text
CENSORED_PHASE_BOUNDARY using authoritative exchange phases:
SEMANTICS_BLOCKED
~~~

The label generator must not invent phase cutoffs.

A first research implementation may operate only under an explicitly documented subset whose phase compatibility is externally verified later, or keep phase compatibility UNKNOWN.

## 15. Gap detection

Because actual per-security timestamps are available:

~~~text
inter-observation gaps: DERIVABLE_NOW
maxInterObservationGap: DERIVABLE_NOW
gap distribution: DERIVABLE_NOW
CENSORED_DATA_GAP once a policy exists: DERIVABLE_NOW
~~~

But:

~~~text
maximum allowed path gap:
NOT YET CALIBRATED
~~~

It should be selected only after measuring the empirical cadence/jitter distribution.

## 16. True barrier ordering inside polling gaps

The recorder stores snapshots, not the continuous path between them.

Therefore:

~~~text
first OBSERVED target/adverse sample:
DERIVABLE_NOW

true target-vs-adverse first passage:
DATA_NOT_COLLECTED
~~~

If both barriers may have been crossed between two stored observations, the true order cannot be reconstructed.

This remains a possible Issue #12 data-resolution requirement.

## 17. Exact trade-by-trade timing

No trade tape is persisted.

Therefore:

~~~text
exact inter-trade duration:
DATA_NOT_COLLECTED

exact aggressor sequence:
DATA_NOT_COLLECTED

signed trade flow:
DATA_NOT_COLLECTED

true precursor/trade event ordering inside a snapshot gap:
DATA_NOT_COLLECTED
~~~

Snapshot-counter deltas may still support other research, but cannot manufacture a tape.

## 18. Deeper order book

Provider fields for levels 2–5 are preserved in raw data if returned, but the verified 561-equity snapshot measured them as null for 561/561.

For the proven current feed:

~~~text
usable L2-L5 history:
DATA_NOT_COLLECTED
~~~

The schema technically preserves the fields, but there is no demonstrated usable data in them.

Issue #12 owns the richer-data decision.

## 19. Actual execution outcomes

The Local History Viewer is a market-data recorder, not an execution telemetry system.

It does not persist:

~~~text
actual order submission timestamp
actual fill timestamp
actual fill price
filled quantity
queue position
partial fills
broker commission charged
realized slippage
market impact
~~~

Classification:

~~~text
actual-fill / filled opportunity:
DATA_NOT_COLLECTED
~~~

Issue #15 can compute gross touch-price economics only.

## 20. Size-aware execution

Available now:

~~~text
BuyVolume1
SellVolume1
~~~

so L1 displayed-size context is available.

But the history does not prove:

- fill probability;
- queue priority;
- hidden liquidity;
- deeper available size;
- realized impact.

Therefore:

~~~text
L1 displayed size at touch: AVAILABLE_NOW
simple intended-size/L1 ratio: DERIVABLE_NOW if intended size is supplied externally
full-size executable outcome: DATA_NOT_COLLECTED / SEMANTICS_BLOCKED
~~~

## 21. Daily high / low and cumulative activity

Raw history preserves:

~~~text
DailyHighestRate
DailyLowestRate
DailyDealsQuantity
DailyTurnover
DailyNISRevenue
LastDealVolume
~~~

Classification:

~~~text
raw values: AVAILABLE_NOW
snapshot deltas across history: DERIVABLE_NOW
~~~

These are useful inputs/context elsewhere but are not required to generate the core MID/touch outcome surface.

## 22. Censoring capability map

### DERIVABLE_NOW

~~~text
RIGHT_CENSORED_DATA_END
recorder-session-end censoring
ENDPOINT_TOLERANCE_MISS
REFERENCE_INVALID for missing/nonpositive required quote
FUTURE_REFERENCE_INVALID
CENSORED_DATA_GAP after a gap policy is selected
UNKNOWN
~~~

### SEMANTICS_BLOCKED

~~~text
CENSORED_PHASE_BOUNDARY
canonical LAST-reference semantic validity
provider-event-time-based path ordering
~~~

## 23. Contract field-by-field summary

| Contract requirement | Feasibility | Evidence / note |
| --- | --- | --- |
| securityId | AVAILABLE_NOW | persisted string canonical ID |
| cycleId | AVAILABLE_NOW | history primary-key component |
| sessionId | AVAILABLE_NOW | persisted on every row |
| t0 / observationTimestamp | AVAILABLE_NOW | `collectedAtMs` |
| chunkReceivedAtMs | AVAILABLE_NOW | persisted |
| cycleStartedAtMs | AVAILABLE_NOW | persisted |
| serverAsOfDate | AVAILABLE_NOW | persisted, exact event-time semantics not canonical |
| BID1 | AVAILABLE_NOW | `data.BuyLimit1`, nullable |
| ASK1 | AVAILABLE_NOW | `data.SellLimit1`, nullable |
| BID1 volume | AVAILABLE_NOW | `data.BuyVolume1`, nullable |
| ASK1 volume | AVAILABLE_NOW | `data.SellVolume1`, nullable |
| MID | DERIVABLE_NOW | positive valid BID1/ASK1 required |
| ordered per-security future path | DERIVABLE_NOW | `bySecurityTime` |
| endpoint <= deadline | DERIVABLE_NOW | timestamp scan/index |
| endpoint error | DERIVABLE_NOW | timestamps |
| MFE/MAE on MID | DERIVABLE_NOW | snapshot path |
| ASK-entry → future-BID endpoint return | DERIVABLE_NOW | L1 fields |
| touch-exit MFE/MAE | DERIVABLE_NOW | future BID path |
| observed barrier order | DERIVABLE_NOW | snapshot path only |
| interval-censored TimeToTarget | DERIVABLE_NOW | previous/current sample interval |
| path gap metrics | DERIVABLE_NOW | timestamps |
| per-horizon coverage | DERIVABLE_NOW | historical scan |
| canonical LAST | SEMANTICS_BLOCKED | raw candidate fields exist; mapping not proven |
| LAST outcome family | SEMANTICS_BLOCKED | depends on canonical LAST |
| authoritative exchange phase | SEMANTICS_BLOCKED | not normalized/verified |
| true intra-gap barrier order | DATA_NOT_COLLECTED | snapshots only |
| exact trade tape | DATA_NOT_COLLECTED | not persisted |
| usable L2-L5 | DATA_NOT_COLLECTED | verified null in current equity snapshot |
| actual fills/execution telemetry | DATA_NOT_COLLECTED | outside LHV V1 |
| realized slippage/impact | DATA_NOT_COLLECTED | no fill telemetry/deeper book |

## 24. Outcome families we can research immediately

Without changing frozen Local History Viewer V1:

### Ready after cadence-policy measurement

~~~text
MID endpoint returns
MidMFE / MidMAE
MID target/adverse observed order
MID interval-censored TimeToTarget/TimeToAdverse

FutureBidVsEntryAskReturn
TouchExitMFE / TouchExitMAE
touch target/adverse observed order
touch interval-censored TimeToTarget/TimeToAdverse
~~~

### Blocked until semantic verification

~~~text
LAST endpoint returns
LastMFE / LastMAE
FutureBidVsEntryLastReturn
LAST-reference target/adverse surfaces
~~~

### Impossible from current data alone

~~~text
true continuous first-passage ordering
trade-tape event ordering
actual-fill outcomes
deep-book executable outcomes
~~~

## 25. Architectural conclusion

No change to frozen Local History Viewer V1 is required for the first useful Issue #15 research implementation.

The correct dependency direction is:

~~~text
Frozen LHV V1 IndexedDB history
→ read-only research extraction
→ outcome labeling
→ aggregate surfaces / diagnostics
~~~

not:

~~~text
modify recorder
→ add ranking semantics into LHV
~~~

This preserves the V1 freeze and its source-of-truth responsibilities.

## 26. Next work unit

Before implementing a label generator, measure the actual timestamp behavior in recorded history and define the **observation-coverage policy**:

~~~text
per-security inter-observation delta distribution
per-horizon endpoint availability
deadline-error distribution
first-future-sample delay
max-gap distribution
session-edge censoring rate
5s / 10s / 20s / ... / 120s evaluability
~~~

From those measurements, define research-run parameters such as:

~~~text
endpointTolerance
maxAllowedPathGap
minimumPathCoverage
~~~

No tolerance should be chosen merely from the nominal 5-second average cycle duration.
