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

