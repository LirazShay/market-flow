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
