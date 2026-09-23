# Issue #6 — Minimal Wave Segmentation and Realized Capacity Contract

Date: 2026-09-24

## 1. Purpose

Define the **minimum** wave/leg semantics required by:

- Fresh Reset / Renewal;
- Recent Wave Memory / Capacity;
- later pattern-similarity research.

This contract deliberately does **not** create a new universal alpha family.

Wave segmentation is:

~~~text
reference infrastructure
+ historical context
+ conditional renewal support
~~~

not:

~~~text
wave detected → bullish vote
~~~

## 2. Sparse-core boundary

The sparse-core architecture remains unchanged:

~~~text
Fresh Market Repricing
Progress Conversion Efficiency
Path Usability / Adverse Efficiency
Fresh Reset / Renewal [conditional]
Remaining Opportunity Lifecycle
~~~

Issue #6 may support:

~~~text
Fresh Reset / Renewal
RecentWavePrior
Remaining Opportunity context
~~~

but may not create additional core slots merely because many wave statistics can be computed.

## 3. Two artifacts only

The segmentation layer exposes only two primary artifacts:

~~~text
1. CompletedWaveEpisode
   historical episode for capacity/memory

2. CurrentLegReference
   current local reference used by Renewal / remaining-opportunity logic
~~~

Everything else is a child field or diagnostic.

Do not expose dozens of wave-derived indicators directly to CentralRanker.

## 4. Primary segmentation series

Primary segmentation price:

~~~text
MID = (BID1 + ASK1) / 2
~~~

when both L1 quotes are valid.

Reason:

- current project data supports MID directly;
- MID reduces dependence on transaction-price bid–ask bounce;
- canonical LAST remains phase-semantics blocked.

Raw LAST-based segmentation may later be diagnostic after LAST semantics are verified, but it is not the canonical V1 wave boundary.

## 5. Why not segment on LAST by default

At very short horizons, transaction prices can move between BID and ASK without an equivalent movement in the quoted market center.

Therefore a LAST-only wave detector can manufacture tiny alternating waves from microstructure bounce.

Wave boundaries should represent a meaningful repricing process rather than the side of spread at which one trade printed.

## 6. Core segmentation model — causal directional change

Use a parameterized directional-change style state machine.

Parameter:

~~~text
waveReversalPct = δW > 0
~~~

Do not hardcode δW in this research-definition step.

### Up-wave state

Track the highest valid MID observed since the current upward episode began:

~~~text
runningHigh
runningHighTime
~~~

Remain in the same upward wave while:

~~~text
MID_now > runningHigh * (1 - δW)
~~~

A downward directional-change confirmation occurs when:

~~~text
MID_now <= runningHigh * (1 - δW)
~~~

At that moment:

- the prior upward wave becomes COMPLETED;
- its terminal extremum is the previously observed runningHigh;
- the completion becomes **known now**, at the reversal-confirmation observation.

### Down-wave state

Symmetrically track:

~~~text
runningLow
runningLowTime
~~~

An upward directional-change confirmation occurs when:

~~~text
MID_now >= runningLow * (1 + δW)
~~~

The prior downward wave becomes completed at its runningLow extremum, but is known only at the later confirmation observation.

## 7. Critical no-look-ahead distinction

Every completed episode must preserve both:

~~~text
terminalExtremumTime
completionKnownAtTime
~~~

These are usually different.

Example:

~~~text
10:00:20  running high is reached
10:00:25  small pullback
10:00:30  pullback crosses δW

terminalExtremumTime = 10:00:20
completionKnownAtTime = 10:00:30
~~~

Historical episode geometry may use the 10:00:20 extremum.

Online features at 10:00:21–10:00:29 must **not** act as though the final peak was already known.

Any memory episode becomes available to later observations only when:

~~~text
completionKnownAtTime <= decisionTime
~~~

This rule is mandatory.

## 8. Wave start semantics

A completed up-wave is bounded by two alternating confirmed directional-change structures.

Store:

~~~text
startExtremumTime
startExtremumPrice
startKnownAtTime

terminalExtremumTime
terminalExtremumPrice
completionKnownAtTime
~~~

The geometric start extremum may also predate its confirmation.

For online availability, always use the corresponding known-at timestamp.

## 9. One wave with pullback vs two waves

This question is answered mechanically by δW.

During an active up-wave:

~~~text
pullback from runningHigh < δW
→ same broad up-wave

pullback from runningHigh >= δW
→ prior up-wave completed; opposite broad wave confirmed
~~~

Likewise for down-waves.

This prevents discretionary hindsight such as:

> that dip looked small, so I decided afterward it was still the same wave.

## 10. Wave vs leg

A **wave** is the broad directional-change episode controlled by δW.

A **leg** is a local directional segment inside the current broader wave, used mainly for Renewal and local move-consumption reference.

Legs are not a second universal memory family.

## 11. Minimal CurrentLegReference

CurrentLegReference contains:

~~~text
broadWaveDirection
broadWaveStartReference
localLegStartTime
localLegStartPrice
localLegKnownAtTime
legDirection
legAgeSeconds
observedLegMovePct
referenceReason
~~~

Possible referenceReason:

~~~text
BROAD_WAVE_START
CONFIRMED_RESET_LOW
CONFIRMED_RESET_HIGH
UNKNOWN
~~~

## 12. Reset candidate inside a broad wave

For Renewal research, allow a smaller internal pullback threshold:

~~~text
resetPullbackPct = δR
~~~

with the structural constraint:

~~~text
0 < δR < δW
~~~

Exact values are development/research parameters, not universal constants.

In an active up-wave:

1. price reaches a local running high;
2. pullback reaches at least δR but remains below broad-wave reversal δW;
3. a local reset low is tracked;
4. later current-state evidence may confirm reclaim / renewed repricing.

The reset low is a **candidate reference**, not automatically a bullish reset.

PR / sparse-core Renewal logic owns whether the candidate becomes a valid RenewalState.

## 13. No backdating of Renewal

If a reset low occurs at tLow and reclaim/renewal becomes qualified at tConfirm:

~~~text
localLegStartTime = tLow
localLegKnownAtTime = tConfirm
~~~

At historical decision times before tConfirm:

~~~text
the new leg must not exist as a known feature
~~~

After tConfirm:

the earlier low may be used as the geometric reference for age/progress.

This preserves a useful local reference without leaking future confirmation backward.

## 14. Reset candidate is not Renewal

Required distinction:

~~~text
internal pullback observed
!=
renewal validated
~~~

Fresh Reset / Renewal later consumes:

- reset candidate geometry from Issue #6;
- Fresh Market Repricing;
- Progress Conversion Efficiency;
- Path Usability;
- reclaim/reacceleration evidence.

Issue #6 does not independently score reset quality.

## 15. Episode status

Every memory episode is exactly one of:

~~~text
COMPLETED
ACTIVE_CENSORED
INVALID
~~~

### COMPLETED

Opposite directional-change threshold was observed and the endpoint is known.

### ACTIVE_CENSORED

Episode is still active at the research cutoff / decision time.

It may provide current-state context but must not enter completed-wave capacity statistics as if its final amplitude/duration were known.

### INVALID

Required price/timestamp continuity or semantic validity is insufficient.

## 16. CompletedWaveEpisode shape

Minimum durable shape:

~~~text
CompletedWaveEpisode {
  securityId
  direction

  startExtremumTime
  startExtremumPrice
  startKnownAtTime

  terminalExtremumTime
  terminalExtremumPrice
  completionKnownAtTime

  amplitudePct
  geometricDurationSec
  confirmationDelaySec
  speedPctPerSec

  maxInternalGivebackPct
  pathSampleCount
  maxInterObservationGapSec

  targetProfile
  segmentationConfigId
  status
}
~~~

Do not add every registry feature to the episode object.

Keep the episode primitive enough that later research can recompute summaries without embedding a giant hidden score.

## 17. Amplitude

For an up-wave:

~~~text
amplitudePct =
(terminalExtremumPrice / startExtremumPrice - 1) * 100
~~~

For a down-wave preserve signed and absolute forms explicitly rather than overloading one field.

Never infer:

~~~text
large recent amplitude
→ next wave will be large
~~~

## 18. Duration

Preserve two different clocks:

### Geometric duration

~~~text
terminalExtremumTime - startExtremumTime
~~~

### Knowledge / confirmation timing

~~~text
completionKnownAtTime - terminalExtremumTime
~~~

Do not hide confirmation delay inside wave duration.

This matters because a beautiful completed wave may only become known well after its useful endpoint.

## 19. Speed

Episode speed may be summarized as:

~~~text
amplitudePct / geometricDurationSec
~~~

when duration is valid and nonzero.

But speed is a historical capacity descriptor.

It does not become another current-state predictor.

## 20. Internal adverse path

For an up-wave preserve at least:

~~~text
maxInternalGivebackPct
~~~

defined from the running high to subsequent MID observations while the same broad wave remained active.

This distinguishes:

~~~text
same broad amplitude
different internal path hostility
~~~

Do not label it future MAE relative to arbitrary historical entry.

Future MAE remains Issue #15 outcome ownership.

## 21. Target-specific episode profile

Each completed episode may be summarized against the same fixed Issue #15 positive target grid:

~~~text
0.10%
0.20%
0.30%
0.50%
~~~

For each target preserve descriptive episode facts such as:

~~~text
targetObservedWithinEpisode
observedTimeFromEpisodeStartToTarget
internalGivebackBeforeTarget
~~~

These are episode descriptors.

They must not replace the all-observation Issue #15 denominator.

## 22. Selected-episode bias guard

Completed waves are selected by definition:

the algorithm only labels them after a meaningful directional excursion/reversal structure exists.

Therefore:

~~~text
completed-wave target-hit rate
!=
probability from an arbitrary NOW observation
~~~

Every wave-memory result must be interpreted beside:

~~~text
Issue #15 all-observation outcome surface
~~~

and its eligible denominator.

## 23. Recent realized capacity outputs

From recent COMPLETED comparable episodes, Issue #6 may expose descriptive capacity profiles:

### Amplitude capacity

~~~text
median
P75
mean [diagnostic]
max [diagnostic only]
~~~

### Speed capacity

~~~text
median / P75 speed
~~~

### Adverse-path capacity

~~~text
median / P75 maxInternalGivebackPct
~~~

### Target-specific capacity

~~~text
episode target reach count
episode target timing distribution
internal giveback before target
~~~

Maximum amplitude is explicitly diagnostic/context only.

Do not let one extreme wave define target support.

## 24. Successful and failed evidence

Wave memory must not consist only of impressive completed up-waves.

Preserve at least:

- completed up episodes;
- completed down/adverse episodes;
- active/censored episodes;
- reset attempts that failed to renew where later PR research identifies them.

Failure semantics are consumed by WM / later Issue #7.

## 25. Directional asymmetry

Keep upward and downward capacity separate.

Do not collapse them into one generic volatility number.

~~~text
recent upward capacity
!=
recent adverse/downward capacity
~~~

Both can be large simultaneously.

## 26. Opportunity arrival is not wave count

Do not infer:

~~~text
many completed waves recently
→ another wave is due
~~~

Opportunity-arrival rate requires an all-observation denominator from Issue #15.

Inter-wave spacing is context/diagnostic only unless later validated.

## 27. Segmentation parameters are research parameters

Do not choose δW / δR from the locked final test.

Parameter selection belongs to development research.

Every run must persist:

~~~text
segmentationConfigId
waveReversalPct
resetPullbackPct
priceReference = MID
gap/coverage policy
~~~

## 28. Segmentation sensitivity

One segmentation configuration is not enough to justify a memory conclusion.

Use a small predeclared family of defensible configurations:

~~~text
TIGHT
NOMINAL
LOOSE
~~~

where exact δW / δR values are selected using development data and then frozen.

Do not create dozens of thresholds and choose the one with the best result.

Report whether conclusions are:

~~~text
ROBUST
MODERATELY_SENSITIVE
FRAGILE
UNKNOWN
~~~

across the small configuration family.

## 29. What must be stable across segmentation variants

Examples:

- relative amplitude capacity;
- target-specific capacity;
- whether Renewal references materially change Remaining Opportunity;
- whether RecentWavePrior adds incremental value;
- broad conclusions about capacity expansion/contraction.

A result that exists only under one convenient threshold should receive reduced or zero influence.

## 30. Minimum evidence and coverage

No universal minimum episode count is fabricated here.

Every memory summary must report:

~~~text
completedEpisodeCount
activeCensoredCount
invalidCount
time span
security/session coverage
segmentation configuration
~~~

WM-010 ComparableMemoryCoverage later decides how much confidence the memory deserves.

Small count never becomes certainty.

## 31. Data-gap rule

Wave boundaries require usable path continuity.

If a gap exceeds the eventual allowed-gap policy:

~~~text
do not silently bridge the gap
~~~

An affected active episode becomes:

~~~text
INVALID
or
censored under the eventual implementation policy
~~~

rather than fabricating an extremum/reversal inside missing time.

Exact gap thresholds remain Issue #18/data-methodology ownership.

## 32. Session-boundary rule

Do not silently continue a wave across incompatible recorder/exchange session boundaries.

Recorder session boundaries are observable.

Authoritative exchange-phase compatibility remains semantics-dependent.

Until verified, preserve uncertainty rather than inventing phase continuity.

## 33. Relationship to Fresh Reset / Renewal

Issue #6 provides only:

~~~text
broad wave reference
candidate internal reset low/high
local leg geometric reference
known-at timestamp
~~~

Renewal logic decides whether that geometry becomes meaningful.

Therefore:

~~~text
segmentation
!=
renewal signal
~~~

## 34. Relationship to RecentWavePrior

Issue #6 provides primitive completed/censored episodes and descriptive realized-capacity summaries.

WM owns:

- comparable-memory coverage;
- prior confidence;
- supportive vs cautionary history;
- segmentation sensitivity state.

Issue #7 owns similarity/recurrence methodology.

Issue #9 owns regime transferability/decay.

## 35. Relationship to sparse core

Allowed flow:

~~~text
historical MID path
→ Issue #6 segmentation
→ completed-wave capacity/context
→ WM / Renewal support
→ optional context to Remaining Opportunity
~~~

Forbidden flow:

~~~text
wave amplitude score
+ wave speed score
+ wave count score
+ max wave score
+ recurrence score
→ five new bullish votes
~~~

## 36. External methodological context

Directional-Change research provides a useful event-based segmentation reference: trends are separated when price reverses by a configured threshold from a tracked extremum, and overshoot movement is kept distinct from the confirmation event.

However, published DC methods also illustrate an important weakness: results depend on the chosen threshold, and fixed thresholds can be subjective.

Therefore this project adopts only the causal state-machine idea, not any literature threshold or trading rule.

Market-microstructure literature also documents short-horizon bid–ask bounce in transaction prices, supporting the choice to prefer quote MID over raw LAST for canonical V1 segmentation.

## 37. Minimal implementation-facing state machine contract

Conceptually:

~~~text
state = UP or DOWN

if state == UP:
  runningHigh = max(runningHigh, MID)
  if MID <= runningHigh * (1 - δW):
    complete prior UP episode
    knownAt = now
    switch to DOWN
    initialize runningLow

if state == DOWN:
  runningLow = min(runningLow, MID)
  if MID >= runningLow * (1 + δW):
    complete prior DOWN episode
    knownAt = now
    switch to UP
    initialize runningHigh
~~~

Initialization policy must avoid claiming a pre-history extremum that was never observed.

Initial episode may remain ACTIVE_CENSORED until enough directional evidence exists.

## 38. Issue #6 outcome

The wave system is deliberately small:

~~~text
Broad wave
= causal directional-change episode on MID

Local leg
= renewal/reference segment inside broad wave

CompletedWaveEpisode
= historical capacity primitive

CurrentLegReference
= current renewal/remaining-opportunity reference
~~~

No extra universal predictor is created.

## 39. Empirical unknowns left open

Still unknown:

- best δW;
- best δR;
- whether three segmentation variants are sufficient;
- incremental value of recent-wave capacity;
- whether Renewal benefits from segmentation at all;
- sensitivity under sparse/illiquid observations.

These remain empirical questions.

## 40. Handoff to Issue #7

Issue #7 may use CompletedWaveEpisode only after respecting:

- completionKnownAtTime;
- ACTIVE_CENSORED exclusion from completed capacity;
- segmentationConfigId;
- segmentation sensitivity;
- all-observation Issue #15 baseline;
- explicit failures/coverage.

Pattern similarity must not turn episode matching into a direct probability or universal alpha vote.
