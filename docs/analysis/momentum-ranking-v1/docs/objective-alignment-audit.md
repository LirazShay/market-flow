# Objective Alignment Audit — Momentum Ranking V1

Purpose: re-evaluate all Momentum Ranking research against the actual objective rather than conventional stock-analysis intuition.

Core question:

> Which security can make a useful upward move **from now**, preferably within seconds and with an outer horizon around two minutes, with a path and execution conditions that make the move usable?

This is not a general recommendation engine.

## Audit verdict vocabulary

- **KEEP** — directly aligned with the objective.
- **REFRAME** — useful, but only after changing the question/meaning to the short-horizon objective.
- **DEMOTE_TO_CONTEXT** — may matter, but must not drive selection without incremental evidence.
- **GATE_ONLY** — can disqualify/attenuate feasibility or trust but is not directional alpha.
- **VALIDATE_ONLY** — plausible; do not grant scoring influence before empirical evidence.
- **REJECT_IF_NO_INCREMENTAL_VALUE** — common or intuitive, but should disappear if it does not improve the direct short-horizon outcome.

---

# Global conclusions from the objective audit

## 1. Primary validation must be barrier/time based

A fixed future return such as return after 60 seconds is incomplete for this project.

The direct outcome is closer to:

~~~text
from decision time t:
did +target occur before -adverse and before timeout?
how long did it take?
what MFE/MAE occurred before exit/timeout?
~~~

This naturally supports target/time ladders rather than one universal horizon.

Research leads:
- https://www.sciencedirect.com/science/article/abs/pii/S0378437112004116
- https://www.sciencedirect.com/science/article/pii/S0304405X02001344

## 2. Horizon sensitivity is mandatory

A feature can be useful for 30–60 seconds and useless at 5–10 seconds.

Future validation should ask:

~~~text
for which target / horizon / adverse barrier / regime is feature X useful?
~~~

not merely whether X is predictive in general.

Research lead:
- https://arxiv.org/abs/2505.17388

## 3. Description is not enough; conversion speed matters

Many current features say activity is rising, book pressure leans upward, or price is accelerating.

The actual objective asks one step further:

> Does this evidence convert into useful price progress quickly enough that the move is still capturable after system latency?

This creates a new research dimension:

~~~text
precursor → useful price progress latency
~~~

and motivates Issue #16.

## 4. Remaining opportunity matters more than historical move quality

A stock that already moved +0.8% may look stronger than one just starting +0.08%.

For this project the important question is:

~~~text
how much usable move remains from NOW?
~~~

not how impressive the past move was.

Every mature/trend feature must therefore be checked for lateness.

## 5. Absolute executable opportunity dominates relative elegance

Cross-sectional rank helps choose among candidates, but 99th percentile does not imply a usable opportunity.

If the whole market is dead, the best relative stock may still be unusable. If the whole market is surging, a stock does not need positive residual alpha versus the market to produce a useful short excursion.

Therefore:
- absolute target feasibility is primary;
- relative percentile is context/ranking support;
- market-relative residual strength must not become mandatory without validation.

## 6. Longer-horizon trend must never become an automatic veto

A stock can be deeply negative on the day and still have the best micro-upwave now.

Daily/30m/60m context is DEMOTE_TO_CONTEXT unless project history proves that it materially changes the short-horizon conditional outcome.

The system must explicitly test a COUNTER_TREND_MICRO_OPPORTUNITY class instead of assuming it is bad.

## 7. Fast-opportunity propensity should be measured directly, not only through segmented waves

Wave memory is valuable, but segmentation introduces definition risk.

A complementary direct method is:

> At every eligible historical observation, how often did this stock subsequently produce +X before -Y within Z seconds?

This avoids requiring a prior declaration that a wave existed and motivates Issue #15.

---

# Audit pass 1 — currently registered families

## Price / Wave — KEEP + REFRAME

Keep multi-window LAST/MID returns, recent speed, acceleration/deceleration, recency concentration and LAST/MID agreement because they directly describe whether a usable move may be forming now.

Reframe RecentPriceSpeed: fast is not automatically good. It should eventually answer whether current speed increases target-before-adverse success after spread, tick/noise and latency.

WaveAge, LegAge and CurrentLegObservedMove are VALIDATE_ONLY until their value is demonstrated mainly through move consumption / remaining opportunity rather than an assumption that younger is always better.

New candidate:

~~~text
MoveConsumedRatio
= current observed leg progress
  relative to recent conditional future excursion / comparable wave capacity
~~~

## Activity / Flow — KEEP, direction-agnostic and conversion-aware

Keep trade-rate acceleration, ActivityBurst and quantity/money expansion.

Demote absolute high activity by itself.

New objective-aligned concepts:

~~~text
ActivityToPriceConversionLatency
ActivityToPriceConversionEfficiency
~~~

Questions:
- when activity bursts in this stock/regime, how quickly does MID/LAST usually progress?
- is current activity already late relative to its normal conversion?
- is activity continuing while price progress stalls?

Persistent effort without timely progress can become protective evidence.

## Book / Directional Flow — KEEP, prefer dynamics over static levels

General literature supports investigation of best-quote imbalance and order-flow imbalance for short-horizon movement, but this is not yet TASE validation.

Research leads:
- https://arxiv.org/abs/1512.03492
- https://arxiv.org/abs/1011.6402

Keep strongly:
- BID/ASK migration;
- cause-aware ASK-LAST dynamics;
- LastSpreadPosition velocity/trend;
- persistent directional L1 state.

VALIDATE_ONLY:
- static L1 queue imbalance;
- static microprice tilt;
- one-frame displayed depth.

New candidate concepts:

~~~text
BookPressureToPriceConversionLatency
PressureConversionEfficiency
PressureWithoutProgressDuration
~~~

A pressure state that usually converts within 10 seconds but persists 30 seconds without progress may have changed meaning.

## Tradability / Execution Preconditions — GATE_ONLY

This family should not increase bullish desirability simply because spread/liquidity are good.

Correct conceptual form:

~~~text
Opportunity × Feasibility
~~~

not an additive liquidity bonus.

Keep as gates/modifiers:
- SpreadPct / spread stability;
- two-sided L1 availability;
- size-to-depth ratios;
- observation/decision latency;
- latency-to-horizon ratio;
- explicit cost floor.

Important reframe: future movement must eventually distinguish market observation reference from executable entry reference.

Candidate outcome:

~~~text
ExecutableTargetBeforeAdverse
from a defined entry reference
~~~

rather than future LAST return alone.

## Freshness / Data Quality — GATE_ONLY + CONFIDENCE

Keep per-security observation age, signal age, reconfirmation, temporal alignment, cycle integrity, dependency/coverage and DataQuality.

New conclusion: Freshness should also be judged against signal opportunity half-life, not only a generic maximum horizon.

Candidate:

~~~text
SignalOpportunityHalfLife
~~~

If a precursor historically loses most usefulness after about 15 seconds, a 12-second-old signal may already be mostly consumed despite being far below two minutes.

---

# New first-principles hypotheses created by the audit

## A. FastExcursionProfile

At every eligible observation measure future MFE/MAE at 5/10/20/30/60/120 seconds.

## B. TargetBeforeAdverseSurface

Across a grid of positive target × adverse barrier × timeout, record which barrier occurs first and when.

## C. ConditionalContinuationSurface

Condition on what just happened: if stock moved +X in last Y seconds and current state is S, what target/adverse path followed?

## D. PrecursorConversionLatency

Measure activity burst → MID progress, book pressure → MID progress, and quote migration → trade-price confirmation, using interval uncertainty where exact order is unknowable.

## E. ProgressStallClock

Measure time since last meaningful upward progress while bullish effort/pressure remains active.

Hypothesis:

~~~text
pressure persists
+ no new progress beyond normal conversion latency
→ remaining opportunity may be deteriorating
~~~

## F. OpportunityHalfLife

Estimate how predictive usefulness decays after signal onset/reconfirmation. This is different from generic data freshness.

## G. CounterTrendMicroOpportunity

Explicitly classify and validate:

~~~text
daily/30m negative
but current 5–60s process turns strongly positive
~~~

Do not reject it by design.

## H. AbsoluteOpportunityBeforeRelativeRank

Candidate pipeline:

~~~text
absolute short-horizon feasibility
→ eligibility
→ cross-sectional comparison
~~~

## I. EntryNowOpportunity

Future labels should eventually be measured from a decision/executable reference, not only from historical wave start or latest printed trade.

## J. DetectionLateness

Measure how much of the eventual useful excursion had already occurred before the system first declared the candidate.

A detector that is accurate only after most of the move is consumed is not useful for this project.

---

# Research discipline added by this audit

For every candidate feature, ask:

1. What exact short-horizon outcome can prove it useful?
2. How early does it become available?
3. How much system latency remains after detection?
4. Does it describe future opportunity or only past movement?
5. Could it incorrectly reject a valid counter-trend micro-wave?
6. Does it add information after stronger/directer features are known?
7. Is its contribution directional, feasibility, protective or confidence only?

A conventional indicator has no privileged status.

If it does not add out-of-sample value to the direct target, remove or demote it.


---

# Audit pass 2 — path, retest, levels and sequence

## Path Quality / Wave Health — KEEP + REFRAME

Past path cleanliness is descriptive. It deserves scoring influence only if it helps predict the **remaining path from now**.

A stock that rose smoothly for the last minute may be:
- genuinely still efficient;
- already mature and mostly consumed;
- about to exhaust after an unusually clean run.

Therefore do not reward “smooth past path” mechanically.

### Keep / investigate

- recent directional efficiency;
- reversal density/depth;
- giveback;
- MID-vs-LAST path agreement;
- time since meaningful progress;
- effort-to-progress efficiency.

### Reframe around usable future path

Candidate objective-aligned concepts:

~~~text
ProgressPerAdverseExcursion
RecentDirectionalEfficiency
ReversalDensityRecent
GiveBackToTargetRatio
ProgressStallClock
EffortToProgressEfficiency
EffortToProgressDeterioration
~~~

The important question is not whether the past looked clean, but whether the current state historically leads to:
- low MAE before target;
- quick next progress;
- target-before-adverse;
- short recovery after minor adverse movement.

### Important asymmetry

A “messy” past path can still be acceptable if the current state has just transitioned from noise to ordered upward movement.

Conversely, an extremely smooth old move can be dangerous if almost all recent wave capacity has already been consumed.

Verdict:

~~~text
PathQuality = protective/quality evidence
not independent bullish alpha
~~~

Its strongest role may be to distinguish two equally bullish candidates by expected adverse path and remaining usability.

---

## Pullback / Retest — KEEP, but only as a short-horizon reset/reacceleration hypothesis

Do not encode:

~~~text
pullback = healthy = good
~~~

A pullback is useful only if it creates a **new capturable leg from now**.

The objective-aligned sequence is closer to:

~~~text
prior upward progress
→ limited adverse excursion
→ selling/counter-pressure fails to expand
→ price/book reclaims quickly
→ fresh activity/book/price acceleration
→ new leg
~~~

### New first-principles interpretation: opportunity reset

A successful short pullback may matter because it can:
- reduce current extension;
- create a clearer new reference point;
- expose whether counter-pressure can actually break the structure;
- create a fresh leg whose age is much lower than the age of the broad wave.

This can make:

~~~text
old WaveAge
+ young LegAge
~~~

a potentially attractive combination.

### Candidate concepts

~~~text
PullbackDepthPct
PullbackDuration
ReclaimLatency
ReclaimStrength
PostRetestAcceleration
PostRetestBookConfirmation
RetestFailureClock
LegResetStrength
~~~

A particularly objective-aligned question:

> After a small pullback completes, how quickly does the stock historically reach the next positive target before revisiting the pullback low?

### Guardrail

A pullback that takes too long relative to the two-minute objective may be irrelevant even if it looks “healthy” on a chart.

Verdict:

~~~text
KEEP as a state transition
not as a classical chart-pattern rule
~~~

---

## Levels / Breakout — DEMOTE broad levels; KEEP only path-relevant micro barriers

A daily high/low or distant historical level is not automatically useful to this engine.

The key question is:

> Does a currently relevant level sit **inside the path to the short target from now**, and does crossing/rejecting it change the target-before-adverse outcome?

This creates a new concept:

~~~text
TargetPathObstacle
~~~

Example:

- target from now = +0.20%;
- recent micro high = +0.07% above current price.

That level may matter because the move must clear it before the desired target.

But if the daily high is +4% away, it is irrelevant to a +0.20% / 30-second opportunity.

### Demote

- daily high proximity by itself;
- “breakout” as an automatic positive label;
- number of old tests without recency/context.

### Keep / reframe

- recent micro high / leg high when it lies inside the candidate target path;
- time from level cross to continued progress;
- whether BID/MID remain above the crossed level;
- immediate giveback/rejection after crossing.

Candidate concepts:

~~~text
DistanceToNearestRelevantMicroBarrier
BarrierDistanceToTargetRatio
LevelCrossToAcceptanceLatency
PostBreakProgressPct
PostBreakGiveBackPct
FailedBreakLatency
BarrierClearanceState
~~~

### New conclusion

For this objective, “breakout” is not the feature.

The useful feature may be:

~~~text
how quickly the market converts a barrier cross
into additional executable progress
before rejection
~~~

A recent 2026 SSRN study of QQQ opening-range retests explicitly treats retest/breakout outcomes as conditional descriptive associations rather than universal causal rules; that is consistent with our decision to validate precise operational states rather than adopt “breakout = bullish” folklore.

Research lead:
- https://ssrn.com/abstract=6745958

Broader literature also documents that short-run continuation and reversal can both occur depending on market conditions/liquidity, reinforcing that prior movement or a break alone is not sufficient evidence.

Research leads:
- https://www.sciencedirect.com/science/article/pii/S014829631830420X
- https://www.sciencedirect.com/science/article/pii/S1042957385710066

---

## Sequence / Lead-Lag — KEEP STRONGLY; make usable lead time the core quantity

This topic is unusually aligned with the project because the engine needs to detect the opportunity **before most of the useful move has occurred**.

Candidate sequences remain useful:

~~~text
Activity → Book → Price
Book → Activity/Trades → Price
Price → rapid cross-family confirmation
Pullback → reclaim → reacceleration
Pressure → level cross → acceptance
Effort ↑ → progress stalls → exhaustion
~~~

But sequence quality should not be scored because it “looks logical”.

It must be validated by:

~~~text
how much usable lead time exists
before target/adverse outcome?
~~~

### New candidate concepts

~~~text
EarliestQualifiedPrecursorTime
FirstPriceProgressTime
UsableLeadTime
UsableLeadTimeAfterSystemLatency
SequenceStage
SequenceCompression
DetectionLateness
CrossFamilyConfirmationLatency
~~~

Candidate definition:

~~~text
UsableLeadTimeAfterSystemLatency
=
time from first qualified precursor
to useful target/progress
- observation/decision/execution latency
~~~

If the result is near zero or negative, the precursor may be statistically predictive but operationally useless.

### SequenceCompression

With ~5-second collection cadence, activity/book/price may all change inside one unseen interval.

In that case:

~~~text
SIMULTANEOUS_CLUSTER
~~~

may be the honest state.

Do not invent:

~~~text
Activity definitely led Book by 2 seconds
~~~

when the data cannot observe it.

### Important new distinction

~~~text
Predictive sequence
!=
Tradable sequence
~~~

A sequence can correctly precede price movement but still be too late after system latency.

This connects directly to Issues #15/#16.

Verdict:

~~~text
Sequence / Lead-Lag = KEEP STRONGLY
because early detection is part of the objective itself
~~~

but validate by usable lead time and target-before-adverse, not narrative plausibility.

---

# New hypotheses from audit pass 2

## K. TargetPathObstacle

Only levels/barriers that lie inside or near the desired short target path should receive meaningful attention.

## L. BarrierClearanceLatency

Time from crossing a relevant micro barrier to additional confirmed progress.

Slow/no conversion after a break may be protective evidence.

## M. PullbackResetValue

A short pullback may increase opportunity quality if it creates a fresh low-extension leg and rapidly reclaims upward structure.

This must be compared against:
- no-pullback continuation;
- failed pullback/retest;
- long/stale pullbacks.

## N. EffortToProgressEfficiency

Instead of activity alone:

~~~text
executed effort / useful price progress
~~~

and especially its deterioration over time may identify when active trading stops producing upward movement.

## O. UsableLeadTimeAfterSystemLatency

The key sequence quantity is not raw lead-lag, but how much actionable lead remains after the system has observed, ranked and acted.

## P. ProgressStallRelativeToNormalConversion

“No new high for 20 seconds” has no universal meaning.

It becomes informative relative to:
- current target horizon;
- recent stock/regime conversion latency;
- ongoing effort/pressure.

This links Path/WaveHealth directly to Issue #16.



---

# Audit pass 3 — Remaining Opportunity

## RemainingOpportunity — KEEP AS A CORE DIMENSION, but redefine it more strictly

This concept is more central to the project than generic momentum strength.

The engine does not primarily care:

~~~text
how strong was the move?
~~~

It cares:

~~~text
from the current decision point,
how much useful upward excursion is still plausibly available,
how quickly,
before how much adverse movement,
and after how much friction/latency?
~~~

This means RemainingOpportunity should not be a single heuristic score derived from “young wave + strong momentum”.

It should eventually be grounded in direct conditional future-outcome surfaces.

## Key decomposition

Separate at least:

~~~text
ObservedMove
CurrentPotential
RemainingCapturableExcursion
TimeBudget
AdversePathBudget
ExecutionBudget
Confidence
~~~

### ObservedMove

What already happened before the decision.

This is descriptive and can create **lateness risk**.

### CurrentPotential

Evidence that upward force/process currently exists.

Examples:
- fresh acceleration;
- activity expansion;
- upward L1 dynamics;
- successful reclaim/retest;
- favorable sequence.

Potential is not the same as remaining magnitude.

### RemainingCapturableExcursion

The future upward movement that remains potentially usable **from the current reference point**.

This is the quantity most aligned with the user objective.

### TimeBudget

How much of the allowed horizon remains after:
- data age;
- ranking latency;
- decision latency;
- entry latency.

### AdversePathBudget

How much adverse movement can occur before the opportunity ceases to be attractive/usable for the selected target definition.

### ExecutionBudget

How much expected movement remains after:
- spread;
- tick granularity;
- slippage/impact;
- explicit costs;
- fill delay/uncertainty.

---

## Important correction: do not estimate RemainingOpportunity as "typical wave size minus current move" mechanically

A tempting formula is:

~~~text
recent median wave amplitude
- current wave amplitude
~~~

This can be useful as context but is not a valid final estimator by itself.

Why:

1. Current wave may belong to a different regime.
2. Previous wave amplitudes are a distribution, not a fixed capacity.
3. A wave can terminate early.
4. A new leg can reset opportunity after a pullback.
5. Current state may already be deteriorating despite low consumed amplitude.
6. A stock can exceed its recent median/max during a new regime.
7. Segmentation errors can distort both numerator and denominator.

Therefore recent realized wave capacity should provide a **conditional prior/reference**, not a deterministic budget.

---

## New core concept: Conditional Future Excursion Surface

For each eligible decision observation and state, future research should estimate/measure:

~~~text
P(+0.05% before -0.05% within 5s | state)
P(+0.10% before -0.05% within 10s | state)
P(+0.20% before -0.10% within 30s | state)
...
~~~

plus empirical:

~~~text
MFE
MAE
TimeToTarget
TimeToAdverse
WhichBarrierFirst
~~~

No calibrated probability should be claimed until enough project history exists.

Issue #15 owns the detailed research of this direct outcome surface.

Recent first-passage work in high-frequency FX explicitly separates imminent move occurrence, direction and monetisation using excursions within 120 seconds. This is external methodological support only, not TASE evidence:

- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6919443

---

## New distinction: PotentialRemaining vs CapturableRemaining

A move may still have raw upside potential but no useful capturable opportunity.

Example:

~~~text
estimated raw remaining excursion: +0.20%
spread + slippage + latency consume much of it
→ capturable remaining excursion may be near zero
~~~

Therefore:

~~~text
PotentialRemaining
!=
CapturableRemaining
~~~

This supports the existing separation:

~~~text
MarketOpportunity
→ ExecutionFeasibility
→ NetExecutableOpportunity
~~~

---

## New concept: OpportunityBudget

Represent the opportunity as a structured budget rather than one score:

~~~text
OpportunityBudget {
  positiveExcursionCandidates
  timeRemaining
  adverseTolerance
  frictionEstimate
  confidence
}
~~~

The final CentralRanker may later compress this into a ranking score, but the internal representation should preserve these dimensions.

---

## New concept: MoveConsumptionState

Do not ask only:

~~~text
how much did the stock already move?
~~~

Ask:

~~~text
relative to comparable current-state future excursions,
how much of the likely usable move appears already consumed?
~~~

Candidate concepts:

~~~text
ConsumedFraction
RemainingFraction
DetectionLateness
CurrentVsRecentCapacity
CurrentVsConditionalExcursion
~~~

But these should remain separate until empirical history proves how they relate.

Candidate state:

~~~text
EARLY
PARTIALLY_CONSUMED
MATURE
MOSTLY_CONSUMED
RENEWED_AFTER_RESET
UNKNOWN
~~~

The important state is not necessarily the age of the broad wave.

A pullback/reclaim can create:

~~~text
broad wave = old
current leg = fresh
remaining opportunity = renewed
~~~

---

## New concept: TimeBudgetAfterLatency

The outer horizon is not fully available at decision time.

Candidate:

~~~text
TimeBudgetAfterLatency
=
targetHorizon
- observationAge
- rankingDelay
- decisionDelay
- expectedEntryDelay
~~~

This is more objective-aligned than comparing signal age to two minutes in isolation.

If the remaining time budget is too small for the target's empirically observed TimeToTarget distribution, the candidate should be downgraded/rejected even when the signal looks strong.

---

## New concept: TargetFeasibilityFrontier

Instead of selecting one universal target, maintain a frontier:

~~~text
target size
× timeout
× adverse barrier
× friction
× confidence
~~~

Example conceptual output:

~~~text
+0.10% / 10s : plausible
+0.20% / 30s : plausible
+0.30% / 60s : weak
+0.50% / 120s: unsupported
~~~

This is not a probability table until calibrated.

It is a structured representation of which opportunities the evidence supports.

---

## New concept: OpportunityDominance

When comparing two stocks, avoid forcing all dimensions immediately into one weighted sum.

Candidate A may offer:
- smaller move;
- much faster target;
- cleaner path.

Candidate B may offer:
- larger possible move;
- slower target;
- more adverse path.

Before final weighting, preserve a multi-objective comparison:

~~~text
ExpectedUsefulMove
TimeToTarget
AdversePath
Tradability
Confidence
~~~

This allows future research to study Pareto-like dominance before inventing arbitrary weights.

For this project, speed has high utility, but its exact nonlinear utility should be validated rather than assumed.

---

## New conclusion: no “momentum strength bonus” without a remaining-opportunity bridge

A feature can be strongly bullish yet useless because the move is already consumed.

Therefore every bullish family should eventually connect to RemainingOpportunity through one of:

~~~text
early precursor
fresh transition
remaining target feasibility
low detection lateness
renewed leg/reset
fast conversion
~~~

Otherwise it is descriptive confirmation only.

---

## New conclusion: RemainingOpportunity is conditional on reference price

Future evaluation must explicitly distinguish:

~~~text
signalReferencePrice
decisionReferencePrice
executableEntryReference
actualFillPrice
~~~

A target measured from the historical signal price can overstate what remains available by the time the engine acts.

The most relevant future label is therefore increasingly:

~~~text
ExecutableTargetBeforeAdverse
from decision/entry reference
~~~

while raw market labels remain useful for separating prediction from execution.

---

# New hypotheses from audit pass 3

## Q. ConditionalFutureExcursionSurface

Direct state-conditioned future MFE/MAE/target/barrier outcomes from every eligible observation.

## R. PotentialRemainingVsCapturableRemaining

Separate raw remaining market movement from movement that survives latency and friction.

## S. OpportunityBudget

Preserve target/time/adverse/friction/confidence dimensions before final compression.

## T. MoveConsumptionState

Estimate how much of the state-conditioned useful excursion appears already consumed.

## U. TimeBudgetAfterLatency

Subtract observation/decision/entry delays from the relevant opportunity horizon.

## V. TargetFeasibilityFrontier

Maintain several candidate target/time/adverse combinations rather than one fixed target.

## W. OpportunityDominance

Compare candidates multi-dimensionally before imposing final scalar weights.

---

## Audit verdict

~~~text
RemainingOpportunity = CORE
~~~

but it should be treated as a structured, conditional, forward-looking quantity.

It must not collapse into:

~~~text
momentum score
+ wave youth
- exhaustion
~~~

without direct validation against the project's actual first-passage / target-before-adverse outcomes.



---

# Audit pass 4 — Cross-sectional ranking and leader hysteresis

## Cross-sectional ranking — KEEP, but only after absolute eligibility

The CentralRanker must not answer:

~~~text
who is best among all stocks?
~~~

before answering:

~~~text
does any stock currently satisfy a minimum absolute short-horizon opportunity standard?
~~~

Correct conceptual order:

~~~text
per-stock absolute opportunity assessment
→ trust/feasibility gates
→ eligible candidate set
→ cross-sectional comparison
→ leader or NO_OPPORTUNITY
~~~

This avoids a dead-market failure mode where the least-bad stock becomes rank #1 despite having no usable excursion.

### New candidate concepts

~~~text
AbsoluteEligibilityState
AbsoluteOpportunityFloor
NoOpportunityMargin
EligibleCandidateCount
OpportunityDensity
~~~

`OpportunityDensity` is context only: eligible candidates / eligible universe.

---

## Relative percentile — DEMOTE to comparison/context

Percentiles remain useful for normalization, unusual-activity context and resolving similar candidates.

But:

~~~text
high percentile != high absolute opportunity
~~~

and:

~~~text
low market-relative residual != no short-term upward excursion
~~~

A stock can move usefully upward because the whole market moves upward. Market-relative residual strength must not become a mandatory gate without validation.

---

## Rank velocity — REFRAME

Old idea:

~~~text
rank #180 → #75 → #22 → #5
~~~

can look like powerful early evidence.

But rank can improve for two very different reasons:

~~~text
A. this stock improved
B. peers deteriorated
~~~

Only A is direct evidence that this stock's opportunity strengthened.

Therefore add:

~~~text
SelfImprovementDelta
PeerDeteriorationContribution
RankRiseCauseState
~~~

Candidate states:

~~~text
SELF_DRIVEN_RISE
PEER_DRIVEN_RISE
MIXED
UNKNOWN
~~~

Rank velocity may remain useful only after this decomposition.

---

## Cross-sectional comparison must preserve objective dimensions

Do not immediately compress every candidate into one scalar.

Preserve at least:

~~~text
RemainingCapturableExcursion
TimeToTarget / target frontier
AdversePath
Tradability
Freshness
Confidence
~~~

Then ask whether one candidate dominates another across the dimensions that matter.

Candidate structures:

~~~text
CandidateFrontier
ParetoLikeCandidateSet
DominanceState
~~~

The external engine may still emit one leader; internal comparison should preserve the dimensions that created it.

---

## Asynchronous universe observations — cross-sectional ranking risk

Because securities are collected sequentially, two candidates can enter ranking with different observation ages.

Therefore:

~~~text
same ranking cycle != same market instant
~~~

The ranker should consume:

~~~text
PerSecurityObservationAge
FreshnessState
TemporalAlignmentState
TimeBudgetAfterLatency
~~~

and compare candidates at one decision time while preserving uncertainty about what happened after each observation.

Candidate:

~~~text
DecisionTimeComparabilityState
~~~

Possible states:

~~~text
COMPARABLE
AGE_DISADVANTAGED
STALE_FOR_HORIZON
UNKNOWN
~~~

Do not invent an unobserved price path to 'correct' stale data.

---

# Leader / challenger hysteresis — KEEP, but make it opportunity-aware and time-bounded

The purpose of hysteresis is valid: prevent noisy leader flips.

But fixed hysteresis can directly conflict with a seconds-level objective.

A leader can remain rank #1 by inertia after:
- its opportunity is mostly consumed;
- its signal becomes stale;
- book pressure disappears;
- a challenger now has much more remaining opportunity.

Therefore:

~~~text
leader persistence != entitlement to stay leader
~~~

## Leader can expire without a challenger

A leader should be able to transition to:

~~~text
NONE / NO_OPPORTUNITY
~~~

because its own opportunity degraded.

Candidate:

~~~text
LeaderExpiryState
~~~

Possible expiry reasons:
- freshness expired;
- remaining opportunity below floor;
- adverse-path risk worsened;
- execution feasibility failed;
- data quality failed;
- signal invalidated.

## Hysteresis should consume a time budget

Candidate:

~~~text
HysteresisTimeBudget
~~~

The system may tolerate a small challenger advantage briefly to avoid noise, but the delay itself consumes opportunity.

Conceptually:

~~~text
maximum hysteresis delay
<
remaining opportunity half-life / usable time budget
~~~

Exact mapping requires validation.

If the incumbent's remaining opportunity decays quickly, hysteresis should shrink.

## Challenger promotion should compare current remaining opportunity

A challenger should not need to exceed the incumbent's old peak score.

Compare:

~~~text
Leader current OpportunityBudget
vs
Challenger current OpportunityBudget
~~~

Candidate concepts:

~~~text
ChallengerDominance
ChallengerAdvantageAfterUncertainty
LeaderRemainingBudget
LeaderDecayRate
~~~

Fast promotion may be appropriate when the challenger is materially better on capturable excursion, speed, adverse path, freshness, evidence diversity and feasibility.

## New concept: SwitchValue

Generic online-decision research shows that switching costs can materially change optimal policies and motivate threshold-style decisions. This is conceptual support only; those are not TASE stock-selection models.

Research leads:
- https://arxiv.org/abs/2310.20598
- https://arxiv.org/abs/1911.12595

Candidate abstraction:

~~~text
SwitchValue
=
ChallengerObjectiveAdvantage
- switching/decision delay cost
- additional uncertainty
- execution-policy cost if any
~~~

Important separation:

### Pre-entry leader switching

Before any order/position exists, switching cost is mainly decision churn, extra waiting, stale-signal risk and possible execution delay.

### Post-entry position switching

Once a position exists, changing to another stock is a separate execution/risk-management problem.

The CentralRanker must not silently turn pre-entry leader hysteresis into post-entry trading behavior.

## New concept: LeaderDominanceMargin

Do not store only:

~~~text
leader score - challenger score
~~~

Preserve:
- absolute opportunity difference;
- time-to-target difference;
- adverse-path difference;
- confidence/coverage difference;
- feasibility difference.

Candidate:

~~~text
LeaderDominanceMargin {
  excursionAdvantage
  speedAdvantage
  pathAdvantage
  feasibilityAdvantage
  confidenceAdvantage
}
~~~

## New concept: uncertainty-aware ties

Two candidates can be numerically different but indistinguishable given stale/asynchronous data, low coverage, noisy features or uncalibrated mappings.

Candidate state:

~~~text
CLEAR_LEADER
SOFT_LEADER
EFFECTIVE_TIE
NO_ELIGIBLE_CANDIDATE
~~~

When effectively tied, fresher evidence, lower friction and lower switching cost may be legitimate tie-breakers. A tiny raw score difference should not be treated as meaningful.

## Internal candidate set

Externally the engine may expose one leader.

Internally retain a threshold/frontier-based candidate set with absolute opportunity, freshness, confidence and dominance relationships.

This improves challenger detection, leader expiry, rank-cause decomposition and later execution-profile selection.

Do not hardcode a fixed K unless implementation needs one.

---

# New hypotheses from audit pass 4

## X. AbsoluteEligibilityState

A candidate must pass an absolute short-horizon opportunity/trust/feasibility floor before relative ranking.

## Y. RankRiseCauseState

Separate self-improvement from peer deterioration.

## Z. DecisionTimeComparabilityState

Qualify asynchronous observation age instead of pretending simultaneous data.

## AA. LeaderExpiryState

The incumbent can expire into NO_OPPORTUNITY without waiting for a challenger.

## AB. HysteresisTimeBudget

Any stability delay must fit inside the remaining opportunity time budget.

## AC. ChallengerAdvantageAfterUncertainty

Promote based on meaningful current objective advantage, not a trivial raw score edge.

## AD. SwitchValue

Compare challenger advantage with delay, uncertainty and execution switching costs.

## AE. LeaderDominanceMargin

Preserve multidimensional dominance rather than only scalar score difference.

## AF. EffectiveTieState

Treat differences smaller than current evidence precision as ties.

---

## Audit verdict

~~~text
Cross-sectional ranking = SECONDARY SELECTION LAYER
Absolute opportunity eligibility = PRIMARY GATE
Hysteresis = noise-control tool with a strict opportunity-time budget
~~~

Correct behavior:

~~~text
is there any eligible opportunity?
→ if no: NO_OPPORTUNITY
→ if yes: compare eligible opportunity budgets
→ maintain leader only while its current opportunity remains valid
→ switch only when challenger advantage is meaningful enough to justify delay/uncertainty
~~~


---

# Audit pass 5 — Recent Wave Memory / realized wave capacity

## Verdict: KEEP, but as a conditional prior/reference — not a directional trigger

Recent same-stock history is potentially valuable because it tells us what movement scale, timing and adverse path the security has recently demonstrated.

But:

~~~text
recently demonstrated capacity
!=
guaranteed next-wave capacity
!=
directional signal
~~~

The memory should answer:

> Under states/regimes similar to now, what short-horizon upward excursions, times-to-target and adverse paths has this stock recently produced?

It should not answer:

> It made three +0.30% waves, therefore another +0.30% wave is likely now.

External high-frequency literature documents persistent/clustered volatility and strong intraday periodicity. That supports treating recent movement environment as potentially informative context, while also warning that recent amplitude can merely reflect time-of-day or a volatility regime rather than a repeatable directional pattern.

Research leads:
- https://www.sciencedirect.com/science/article/pii/S0927539897000042
- https://www.sciencedirect.com/science/article/pii/S0304405X01000551
- https://www.sciencedirect.com/science/article/abs/pii/S037837581000217X

These are not TASE validation.

---

## Major correction: wave memory alone cannot estimate opportunity probability

If the system stores only completed waves, it observes cases where a wave existed but omits all eligible moments where no useful wave followed.

Example:

~~~text
4 recent waves reached +0.30%
~~~

does not tell us whether those 4 waves came from 5 eligible opportunities, 50 observations, or 5,000 observations.

Therefore wave memory cannot by itself answer:

~~~text
from NOW, how likely/useful is a fast excursion?
~~~

Issue #15's all-observation future-excursion surface is the required denominator/baseline.

New principle:

~~~text
ObservationBasedExcursionMemory = baseline
WaveMemory = structured conditional context / explanation
~~~

Wave memory must prove incremental value beyond direct observation-based outcome history.

---

## Separate four different kinds of recent capacity

Do not compress capacity into one amplitude number.

### 1. Amplitude capacity

How large recent upward excursions/waves have been.

Candidates:
- median/P75/P90 upward amplitude;
- target-hit counts;
- target-hit rates with a valid denominator.

### 2. Speed capacity

How quickly useful targets were reached.

Candidates:
- median TimeToTarget;
- lower/upper time quantiles;
- fastest credible target time;
- target-specific time distribution.

### 3. Adverse-path capacity

What had to be tolerated before the upward target.

Candidates:
- MAE before target;
- giveback;
- time-under-water;
- recovery time.

### 4. Opportunity-arrival capacity

How often useful excursions appeared from eligible decision states.

This cannot be derived only from segmented waves.

Candidates:
- eligible-state count;
- target-before-adverse count;
- opportunity-arrival rate/intensity over defined windows.

These dimensions answer different questions and must remain separate.

---

## Demote RecentWaveAmplitudeMax

Maximum recent wave amplitude is fragile because one extreme event can dominate, belong to another regime, create an unrealistic target anchor, and say nothing about frequency.

Verdict:

~~~text
RecentWaveAmplitudeMax = diagnostic/context only
~~~

Median/P75/quantiles are better distribution summaries, but they still remain conditional context rather than guarantees.

---

## Target-specific memory is more useful than generic wave size

For this objective, a generic typical-wave number is less useful than target-specific memory:

~~~text
for +0.10% target:
  hit count / eligible count
  TimeToTarget distribution
  MAE-before-target distribution

for +0.20% target:
  ...

for +0.30% target:
  ...
~~~

Candidate:

~~~text
RecentConditionalTargetProfile
~~~

This aligns memory directly with the TargetFeasibilityFrontier from audit pass 3.

---

## Success memory must be paired with failure memory

Repeated similar failed setups are at least as important as successful waves.

Candidate memory should preserve:
- target reached;
- adverse barrier first;
- timeout/no-progress;
- break/retest failure;
- pressure-without-progress;
- execution infeasibility where measurable.

New candidates:

~~~text
RecentTargetFailureProfile
RecentStallProfile
RecentFalseStartProfile
~~~

Three recent successes and seven recent failures are very different from three successes and zero failures.

---

## Separate upward capacity from general volatility

A stock with large recent moves in both directions may have high movement capacity but poor upward path quality.

Therefore keep separate:

~~~text
UpwardExcursionCapacity
DownwardAdverseCapacity
GeneralMovementCapacity
~~~

A deeply negative daily stock can still have strong short upward excursion capacity; downward history must not become an automatic veto.

---

## Regime and time-of-day matching are mandatory qualifiers

Intraday volatility has strong periodic structure, so a stock's recent large movement near one phase/time may not be comparable with a quieter period.

Memory should carry:

~~~text
recency
timeOfDayMatch
sessionPhaseMatch
spread/liquidityMatch
activityMatch
volatility/pathMatch
bookStateMatch
broadMarketMatch
~~~

No single fixed decay curve is justified yet. Issue #9 owns detailed local-regime/decay research.

---

## New concept: ComparableMemoryCoverage

A recent-memory prior is only useful if enough comparable history exists.

Candidate:

~~~text
ComparableMemoryCoverage {
  rawSampleCount
  eligibleDenominator
  comparableSampleCount
  effectiveRecencyWeightedCount
  regimeMatchQuality
}
~~~

Do not allow 2/2 successes, 3/3 waves, or one extreme wave to masquerade as high-confidence evidence.

---

## New concept: hierarchical memory fallback

Exact state matches may be scarce.

Candidate fallback:

~~~text
exact state + regime
→ looser state + regime
→ same-stock recent session
→ same-stock broader session
→ cross-sectional comparable states
→ UNKNOWN
~~~

Each fallback must reduce specificity/confidence.

---

## Current unfinished wave must not leak into completed-wave memory

The active wave/leg can influence current-state features, but completed-wave statistics should not silently include future information from that same episode.

Candidate:

~~~text
WaveMemoryEpisodeStatus =
COMPLETED / ACTIVE_CENSORED / INVALID
~~~

This is important for later leakage-safe validation.

---

## Wave segmentation is a model choice, not ground truth

Different segmentation thresholds can create different wave counts, amplitudes, durations and recurrence statistics.

Issue #6 must test whether wave-memory features add predictive value across reasonable segmentation definitions rather than only one convenient threshold.

---

## Inter-wave spacing must not become periodicity prediction

InterWaveSpacing and WaveFrequency may describe opportunity density/rhythm.

Do not infer:

~~~text
last waves were 3 minutes apart
→ next wave is due now
~~~

without strong empirical evidence.

A safer interpretation is that the recent opportunity-arrival environment is active or quiet.

---

## Capacity trend — KEEP, but interpret as environment change

Rising recent wave amplitude/frequency can mean the local movement environment is expanding.

Candidate:

~~~text
CapacityTrend =
EXPANDING / STABLE / CONTRACTING / UNKNOWN
~~~

But this is not inherently bullish. It may increase upside opportunity, downside adverse risk and execution difficulty.

---

## Pattern similarity should adjust conditional prior/confidence, not override current evidence

Issue #7 remains useful, but the correct question is:

> When the current formation resembles prior recent formations, do their subsequent target/adverse outcomes add information beyond today's current Price/Activity/Book/Path state?

If not, pattern similarity is redundant.

Candidate:

~~~text
RecentWavePrior {
  supportiveOutcomeEvidence
  cautionaryOutcomeEvidence
  comparableSampleCount
  similarity
  recency
  regimeMatch
  outcomeConsistency
  confidence
}
~~~

Do not convert it directly into a large additive bullish score.

---

# New hypotheses from audit pass 5

## AG. ObservationBasedExcursionMemoryBaseline

All-observation target/adverse outcomes are the denominator against which wave-memory value must be judged.

## AH. RecentConditionalTargetProfile

Target-specific hit/time/adverse summaries are more objective-aligned than a generic typical wave amplitude.

## AI. FourCapacityDecomposition

Separate amplitude, speed, adverse-path and opportunity-arrival capacity.

## AJ. ComparableMemoryCoverage

Memory confidence requires valid denominator, comparable sample count, recency and regime match.

## AK. FailureMemory

Store recent failed target attempts / false starts / stalls alongside successful waves.

## AL. DirectionalCapacityAsymmetry

Keep upward excursion capacity separate from downside/adverse movement capacity and general volatility.

## AM. HierarchicalMemoryFallback

Back off from exact current-state matches to broader memory only with explicit confidence loss.

## AN. ActiveWaveCensoring

Do not contaminate completed-wave memory or validation with the unfinished current episode.

## AO. SegmentationSensitivity

Wave-memory usefulness must survive reasonable alternative segmentation definitions.

## AP. OpportunityArrivalEnvironment

Use wave frequency/inter-wave spacing to describe active vs quiet opportunity environment, not deterministic periodic timing.

---

## Audit verdict

~~~text
Recent Wave Memory = KEEP
Primary role = conditional prior / target-feasibility / path-time context
Directional trigger role = NO, unless independently validated
~~~

Most important correction:

~~~text
recent waves were large
!=
next move will be large

but may mean
this stock/regime has recently demonstrated the ability
to produce fast excursions of this scale
~~~

That evidence becomes useful only after conditioning on current state, target/horizon, adverse path, comparable regime, valid denominator, sample size, recency and execution feasibility.


---

# Audit pass 6 — Multi-Horizon Context and Local Regime / Decay

## Multi-Horizon Context — KEEP, but DEMOTE_TO_CONTEXT by default

The 2m/5m/10m/30m/60m history should not outvote the seconds-level process merely because it contains more observations or larger cumulative return.

Core principle:

~~~text
micro horizon = candidate opportunity
longer horizons = context that may modify interpretation
~~~

Do not build:

~~~text
20s bullish + 2m bearish + 5m bearish + 30m bearish + 60m bearish
→ four votes to one → reject
~~~

because that would structurally suppress the counter-trend micro-opportunities this project explicitly wants to detect.

External literature documents that momentum and reversal can coexist at different horizons, and more recent work on order-flow imbalance reports horizon-dependent and regime-dependent predictive behavior. That supports horizon-specific validation rather than assuming one trend rule transfers across scales.

Research leads:
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4069575
- https://www.sciencedirect.com/science/article/pii/S1544612318307414
- https://arxiv.org/abs/2505.17388

These are methodological/context evidence, not TASE validation.

---

## New hierarchy: opportunity horizon vs context horizons

Treat horizons asymmetrically.

Candidate hierarchy:

~~~text
PRIMARY opportunity horizon:
  ~5s / 10s / 20s / 30s / 60s / 120s outcome surface

NEAR context:
  ~2m / 5m

BROAD context:
  ~10m / 30m / 60m / session
~~~

The exact boundaries are research parameters, not fixed truths.

Broad context should have decreasing authority over the immediate decision unless empirical data proves otherwise.

---

## Replace overlapping-horizon vote counting with shape/state

Returns at 2m/5m/10m/30m/60m are strongly overlapping.

Do not independently add them.

Use an interpretable shape/state such as:

~~~text
ALIGNED_UP_CONTEXT
MICRO_ACCELERATION_WITH_UP_CONTEXT
MICRO_UP_INSIDE_BROAD_DOWN
REVERSAL_ATTEMPT
MICRO_UP_AFTER_BROAD_STALL
BROAD_UP_BUT_MICRO_DECELERATING
MIXED
UNKNOWN
~~~

The state describes cross-scale geometry; it does not by itself decide buy/no-buy.

---

## Counter-trend micro-opportunity must be first-class, not an exception

Candidate state:

~~~text
CounterTrendMicroOpportunityState
~~~

Possible values:

~~~text
ALIGNED
COUNTER_TREND_FRESH
COUNTER_TREND_CONFIRMED
COUNTER_TREND_WEAK
REVERSAL_ATTEMPT
UNKNOWN
~~~

Validation question:

> Conditional on the current micro Price/Activity/Book/Path state, does broader negative trend materially change target-before-adverse outcomes within seconds-to-~2m?

If the answer is no, broad negative trend must not penalize that state.

---

## New concept: ContextIncrementalValue

Broad context earns influence only if it adds out-of-sample information after current micro state is known.

Candidate research test:

~~~text
Base model:
  current micro state

Add:
  2m/5m context

Add:
  10m/30m/60m context

Measure marginal improvement in:
  target-before-adverse
  TimeToTarget
  MAE
  ranking quality
~~~

If broad horizons add no incremental value, demote or remove them regardless of conventional trading intuition.

---

## New concept: HorizonConflictState

Cross-scale disagreement is not automatically bad.

Candidate:

~~~text
HorizonConflictState {
  microDirection
  nearDirection
  broadDirection
  microAcceleration
  conflictAge
  resolutionEvidence
}
~~~

Useful interpretations may include:
- fresh counter-trend bounce;
- genuine local reversal beginning;
- broad-trend pullback resuming;
- noisy conflict with no usable edge.

The correct distinction must come from subsequent short-horizon outcomes, not labels.

---

## Broad context may matter more for adverse path than direction

A broad downtrend may not prevent a +0.10% micro excursion, but it may increase:
- adverse excursion before target;
- failure rate for larger targets;
- speed of rejection;
- probability that a pullback turns into breakdown.

Therefore validate broad context against:

~~~text
target-specific barrier-first outcomes
MAE before target
TimeToTarget
target-size frontier
~~~

rather than only future sign.

---

# Local Regime / Decay — KEEP STRONGLY as transferability/confidence logic

Regime is important because recent memory is useful only when the current process is sufficiently comparable.

But regime should not become:

~~~text
REGIME_BULLISH → add score
REGIME_BEARISH → reject
~~~

by default.

Its primary role is:

~~~text
how much should evidence learned from recent history be trusted NOW?
~~~

Recent OFI work reports horizon-dependent and regime-dependent predictive behavior, which supports testing conditional transferability rather than universal signal weights.

Research lead:
- https://arxiv.org/abs/2505.17388

---

## Separate regime dimensions; avoid premature one-label regime

A monolithic label like:

~~~text
CALM / STRESSED
~~~

may hide important combinations.

For this project preserve dimensions such as:

~~~text
LiquidityRegime
SpreadRegime
ActivityRegime
Movement/VolatilityRegime
PathNoiseRegime
BookBehaviorRegime
SessionPhase
BroadMarketRegime
~~~

Later research may compress them only if validation supports it.

---

## New concept: EvidenceTransferability

Candidate:

~~~text
EvidenceTransferability {
  stateSimilarity
  regimeSimilarity
  timeOfDaySimilarity
  recency
  sampleCoverage
  horizonMatch
}
~~~

This controls how much prior observations/waves/patterns should influence current confidence or target-feasibility estimates.

It is distinct from current signal strength.

---

## Decay should be evidence-specific, not one universal clock

Do not define:

~~~text
all evidence loses 50% every N minutes
~~~

Different evidence can decay differently:
- a quote-pressure precursor may have a lifetime of seconds;
- a local activity regime may persist minutes;
- time-of-day context changes slowly;
- a completed-wave prior may remain relevant until regime changes.

Candidate:

~~~text
EvidenceSpecificDecayState
~~~

with decay driven by both:

~~~text
elapsed time
+ state/regime divergence
~~~

---

## New concept: regime-change invalidation can dominate wall-clock recency

A two-minute-old prior can be irrelevant after a sudden spread/liquidity/activity regime change.

A ten-minute-old prior can remain useful if the local regime stayed stable and enough comparable observations exist.

Candidate:

~~~text
RegimeBreakState =
STABLE / DRIFTING / BROKEN / UNKNOWN
~~~

Possible triggers to research:
- spread jumps materially;
- activity intensity changes regime;
- path volatility/noise changes sharply;
- L1 behavior changes;
- session phase changes;
- broad market shock occurs.

No threshold is fixed yet.

---

## New concept: conditional decay rather than recency decay

Candidate weighting concept:

~~~text
PriorWeight
~
recency
× state similarity
× regime similarity
× horizon match
× sample coverage
~~~

This is conceptual only; no formula/weights are validated.

The key correction is that recency alone is insufficient.

---

## Session phase is a hard comparability boundary candidate

Opening auction, continuous trading, closing mechanisms and TAL are different market mechanisms.

At minimum, memory and short-window features should not silently cross a session-mechanism boundary.

Candidate:

~~~text
SessionEpochCompatibility
~~~

Possible outcome:

~~~text
COMPATIBLE
PHASE_CHANGED
UNKNOWN
~~~

Current TASE phase semantics must be re-verified from authoritative sources before implementation.

---

## Time of day should normalize opportunity environment, not dictate direction

Intraday activity/volatility often has strong seasonality. Therefore:

~~~text
high activity at 09:xx
may be normal

same activity at a quiet period
may be exceptional
~~~

Candidate future concept:

~~~text
TimeOfDayAbnormality
~~~

but only after enough same-phase history exists.

External literature documents strong intraday activity/volatility seasonality, supporting the need for time-of-day normalization rather than raw thresholds.

Research leads:
- https://www.sciencedirect.com/science/article/pii/S0378437115002952
- https://www.sciencedirect.com/science/article/abs/pii/S0264999320311676

---

## New concept: regime-conditioned target frontier

The same current micro signal may support different target/time combinations in different local regimes.

Candidate:

~~~text
RegimeConditionedTargetFeasibilityFrontier
~~~

Example conceptually:

~~~text
same micro state:
  liquid/fast regime  → +0.20% / 20s may be supported
  quiet/wide regime   → only +0.10% / 60s may be supported
~~~

This must be learned from project data; it is not an assumed rule.

---

## New concept: current-state evidence outranks stale prior

When strong fresh current evidence conflicts with weak old memory:

~~~text
fresh current state
>
weak / poorly matched historical prior
~~~

unless validation proves otherwise.

Recent-memory priors should be able to fall to near-zero influence under poor transferability rather than veto the live state.

---

# New hypotheses from audit pass 6

## AQ. ContextIncrementalValue

Longer horizons earn influence only if they add short-horizon outcome information beyond the current micro state.

## AR. CounterTrendMicroOpportunityState

Counter-trend micro waves are first-class candidate states, not automatic rejects.

## AS. HorizonConflictState

Preserve cross-scale disagreement and validate what each conflict pattern means for immediate outcomes.

## AT. BroadContextAdversePathEffect

Broad trend may affect MAE/failure/target-size frontier more than immediate direction.

## AU. EvidenceTransferability

Regime/state/time/horizon similarity determines how much recent evidence can transfer to now.

## AV. EvidenceSpecificDecayState

Different signal families have different useful lifetimes.

## AW. RegimeBreakState

A regime break can invalidate recent memory faster than wall-clock decay.

## AX. SessionEpochCompatibility

Do not silently transfer windows/memory across distinct market mechanisms.

## AY. TimeOfDayAbnormality

Normalize activity/volatility relative to phase/time when enough history exists.

## AZ. RegimeConditionedTargetFeasibilityFrontier

The target/time/adverse frontier may depend on the current local regime.

---

## Audit verdict

~~~text
Multi-Horizon Context = KEEP, mostly context / conditional modifier
Longer-horizon negative trend = NOT an automatic veto
Local Regime = KEEP STRONGLY for evidence transferability and confidence
Decay = evidence-specific and regime-aware, not one universal time constant
~~~

The governing question remains:

> Does this context materially improve selection of a capturable seconds-to-~2-minute excursion from NOW?

If not, it must be demoted or removed regardless of how familiar the indicator is.


---

# Audit pass 7 — Final cross-system sweep and reconciliation

## Session phase / time-of-day — GATE / NORMALIZATION / CONTEXT

Session mechanism and time of day matter because the same raw feature can mean different things under different market mechanics or normal activity baselines.

Rules:
- do not let short windows cross incompatible session mechanisms;
- do not turn opening/closing/TAL context into generic bullish/bearish votes;
- use time-of-day primarily to normalize what is unusual now;
- re-verify current TASE phase/timing rules from authoritative sources before implementation.

Primary concepts remain:

~~~text
SessionEpoch
SessionEpochCompatibility
TimeOfDayAbnormality
~~~

These affect comparability, priors and thresholds, not default direction.

---

## Adverse path — CORE OUTCOME / QUALITY DIMENSION

Adverse path must not be reduced to a late penalty after a bullish score is computed.

The project objective is path-dependent:

~~~text
+target quickly with small MAE
!=
+target after deep adverse excursion
~~~

Therefore future evaluation must retain:

~~~text
MFE
MAE
TimeToTarget
TimeToAdverse
WhichBarrierFirst
TimeUnderWater
RecoveryTime
~~~

At first these are labels/outcomes. Predictive adverse-path features must earn their status empirically.

---

## Execution reality — SEPARATE PREDICTION FROM MONETISATION

Never allow market-prediction accuracy to masquerade as executable profitability.

Keep distinct:

~~~text
RawMarketOpportunity
TradableOpportunity
DecisionReferenceOpportunity
FilledOpportunity
NetExecutableOpportunity
~~~

Reference prices must be explicit:

~~~text
signalReferencePrice
decisionReferencePrice
executableEntryReference
actualFillPrice
~~~

Touching a price does not prove fill.

Execution simulation / telemetry must account for spread, tick, queue/depth, delay, partial fill, slippage, impact and explicit costs as available.

The research ranker should remain account-agnostic where possible; account/order-size specifics belong in a parameterized ExecutionEvaluator.

---

## L2 and trade tape — DATA-GAP QUESTIONS, not architectural assumptions

Current L1 design should be exhausted before declaring richer data mandatory.

Audit implications:
- L2 is most relevant to deeper execution feasibility, depth persistence and impact beyond L1;
- trade tape is most relevant to true event-time sequencing, inter-trade durations and signed-flow estimation;
- neither feed should be required merely because conventional microstructure systems use it;
- each must be judged by the exact incremental decision/outcome it improves.

The correct question for Issue #12 is:

> Which objective-aligned decisions remain materially uncertain with validated L1/history, and does L2 or tape resolve them enough to justify the dependency?

---

## Cross-sectional normalization — KEEP RAW + ABSOLUTE + RELATIVE

Normalization must not erase economically meaningful magnitude.

For each candidate preserve where relevant:

~~~text
RawValue
AbsoluteQuality
MarketPercentile
SelfRelativeAbnormality
TimeOfDayAbnormality
Coverage
~~~

Percentiles are comparison/context, not replacements for absolute target feasibility.

Do not normalize UNKNOWN as zero.

Do not let a tiny extreme percentile outrank a materially larger usable excursion solely because it is statistically unusual.

---

## Redundancy / double counting — OBJECTIVE-BASED OWNERSHIP

The strongest anti-double-counting rule is not statistical correlation alone.

Ask:

> Does this concept add objective-aligned out-of-sample information after its parent/family evidence is already known?

Architecture remains hierarchical:

~~~text
raw observations
→ derived concepts
→ family state
→ family strength/confidence/coverage
→ cross-family interaction
→ OpportunityBudget / candidate frontier
→ ranking
~~~

Examples that must not become multiple full votes:
- overlapping returns;
- trade count / volume / money;
- BID/ASK/MID deterministic derivatives;
- queue imbalance and microprice;
- giveback reused across path/exhaustion;
- long-horizon overlapping returns.

Validation should use group ablation and marginal out-of-sample value, not only model feature importance.

---

## Family score semantics — SEMANTIC EVIDENCE, not probability

Keep:

~~~text
FamilyState
FamilyScore 0–100
FamilyConfidence
Coverage
MarketPercentile
~~~

But `FamilyScore=90` means strong evidence under the family's semantic mapping, not 90% probability and not +90 expected return.

Do not multiply score by confidence early and pretend the result is calibrated.

The audit adds a stronger rule:

~~~text
family score must map to an objective decision role
~~~

Each family should primarily serve one or more of:

~~~text
Potential
Confirmation
RemainingOpportunity
PathRisk
Feasibility
Freshness/Trust
Context/Prior
Outcome
~~~

If a feature/family cannot explain its role in the seconds-to-~2m objective and cannot name a validation outcome, it should be demoted or rejected.

---

## Scalar final score should be late, not early

Before empirical evidence, preserve the structured opportunity:

~~~text
OpportunityBudget
TargetFeasibilityFrontier
RemainingCapturableExcursion
TimeBudgetAfterLatency
AdversePath
Feasibility
Confidence
~~~

The final user-facing ranking may eventually use one scalar score, but internal architecture should not destroy these dimensions prematurely.

---

## Validation must punish late detection

Traditional direction accuracy can reward a signal that fires after most of the move occurred.

For this project future validation must include:

~~~text
DetectionLateness
UsableLeadTimeAfterSystemLatency
remaining excursion at detection
target-before-adverse from decision/entry reference
~~~

A correct but too-late detector is operationally weak.

---

## Final audit contract for every feature / heuristic

Every future candidate must answer:

1. Which exact seconds-to-~2m outcome can validate it?
2. At what timestamp does the evidence become observable?
3. How much useful lead remains after system latency?
4. Does it measure future opportunity, past description, feasibility, risk, confidence or context?
5. Can it wrongly reject a valid counter-trend micro-opportunity?
6. Does it add information after stronger/directer parent concepts are known?
7. What data quality / freshness / regime conditions make it invalid?
8. Is its value raw-market or execution-dependent?

No conventional indicator receives special status.

---

# Final Issue #14 verdict

The audit has now covered the material checkpoint areas:
- registered Price / Activity / Book / Tradability / Freshness families;
- Path/WaveHealth, pullback/retest, levels/breakout and sequence;
- RemainingOpportunity;
- cross-sectional ranking and hysteresis;
- Recent Wave Memory / recurrence;
- Multi-Horizon Context;
- Local Regime / Decay;
- session/time-of-day;
- adverse path and execution reality;
- normalization, redundancy and family-score semantics.

New material research concerns discovered by the audit have durable owners:

~~~text
#15 Direct short-horizon outcome surfaces / fast-excursion propensity
#16 Precursor-to-price conversion latency / opportunity half-life
#6/#7 wave capacity + recurrence with objective-alignment additions
#8 multi-horizon context additions
#9 regime/decay additions
#10 CentralRanker additions
#11 validation/calibration additions
#12 L2/tape objective-based data-gap decision
#13 final specification synthesis
~~~

No additional standalone research issue is required from this sweep.

Therefore Issue #14 can close after the objective-alignment contract is embedded into the feature registry/backlog.
