# Stage 17.B — Progress Conversion and Path Quality

Issue: #17
Stage: 17.B
Date: 2026-09-23

## Scope

This stage compares only:

3. Activity-to-Price Conversion
4. Clean Path / Adverse Efficiency
5. Stall / Effort-to-Progress Deterioration

Concepts 6–8 are intentionally out of scope.

## Executive conclusion

The three provisional concepts should not survive as three independent core votes.

Best current structure:

~~~text
Activity-to-Price Conversion
+
Stall / Effort-to-Progress Deterioration
→ one dynamic parent concept

Clean Path / Adverse Efficiency
→ separate path-risk parent concept
~~~

### Stage 17.B decisions

~~~text
Activity-to-Price Conversion
→ MERGE_INTO_PARENT

Stall / Effort-to-Progress Deterioration
→ MERGE_INTO_PARENT

Progress Conversion Efficiency
→ KEEP_CORE_CANDIDATE

Clean Path / Adverse Efficiency
→ KEEP_CORE_CANDIDATE
~~~

After Stage 17.A reduced eight provisional concepts to seven, this stage reduces the parent count again:

~~~text
7 → 6
~~~

This is conceptual prioritization, not empirical proof.

## 1. Two different questions

### Progress Conversion Efficiency

> Given the market effort/activity arriving now, is useful upward progress being produced efficiently, and is that conversion improving or deteriorating?

This is a dynamic input→output conversion question.

### Clean Path / Adverse Efficiency

> Regardless of how much effort produced it, has the recent path delivered progress with manageable reversals, giveback and adverse travel?

This is a realized path-geometry / risk question.

Key distinction:

~~~text
conversion != path geometry
~~~

A market can currently convert activity efficiently but still have arrived through a hostile path. Conversely, a recent path can look clean while current conversion is beginning to stall.

## 2. Why raw activity is not a core predictor

Activity/Flow includes trade count, trade rate, acceleration, bursts, quantity turnover, money turnover and participation expansion.

But:

~~~text
more activity != upward opportunity
~~~

High activity can accompany buying, selling, churn, panic, absorption or a mature battle.

Therefore raw ActivityStrength is not retained as an independent bullish core slot.

The useful question is:

~~~text
what useful price progress did the new activity produce?
~~~

## 3. External microstructure support

Cont, Kukanov & Stoikov, The Price Impact of Order Book Events, report that short-interval price changes were strongly related to best-quote order-flow imbalance, while the relation with raw trade volume was noisier and less robust in their sample.

Implication:

> raw activity alone is too ambiguous; activity becomes more interesting when paired with its price response.

Research on order imbalance in the Indian NSE also reports short-horizon return information in order flow after controlling for bid-ask bounce.

Important limitation:

our current snapshot feed does not provide true signed trade flow, so unsigned trade count/volume must not be treated as buyer-vs-seller imbalance.

Limit-order-book resiliency research treats the dynamic response after liquidity shocks as important: price, spread and depth can recover or persist at different speeds.

Implication:

> change in conversion over time—continued progress versus stall/deterioration—is a meaningful hypothesis to test.

These sources motivate testing. They do not establish TASE predictive value.

## 4. New parent — Progress Conversion Efficiency

Conceptual structure:

~~~text
ProgressConversionEfficiency {
  activityChange
  participationExpansion
  priceProgress
  bidProgress
  conversionEfficiency
  conversionTrend
  stallClock
  confidence
}
~~~

The core information channel is:

~~~text
market effort → useful repricing
~~~

not raw effort magnitude.

## 5. Why Activity-to-Price Conversion and Stall belong together

Activity-to-Price Conversion asks whether rising effort produces upward progress.

Stall / Effort-to-Progress Deterioration asks whether the same or greater effort now produces less progress than before.

The second is largely the temporal deterioration state of the first:

~~~text
conversion efficiency now
+
change in conversion efficiency
=
one dynamic process
~~~

Keeping both as additive core votes would double-count the same loss of response.

Suggested parent lifecycle:

~~~text
WAKING_AND_CONVERTING
EFFICIENT
STABLE_CONVERSION
WEAK_CONVERSION
STALLING
DETERIORATING
SEVERE_DIVERGENCE
UNKNOWN
~~~

## 6. Inputs to Progress Conversion Efficiency

Activity-side inputs:

~~~text
AF-002 TradeRateProfile
AF-003 TradeRateAccelerationState
AF-004 ActivityBurstState
AF-005 TurnoverQuantityDeltaProfile
AF-006 MoneyTurnoverDeltaProfile
AF-008 ParticipationExpansionState
~~~

These are inputs, not independent positive votes.

Desired-direction progress should consume the Stage 17.A parent:

~~~text
Fresh Market Repricing
~~~

especially market-center progress, BID advance, freshness and elapsed time.

Architecture rule:

~~~text
Progress Conversion Efficiency
consumes
Fresh Market Repricing output

it does not recreate another price score
~~~

## 7. Registry concepts to collapse

~~~text
PH-009 EffortToProgressEfficiency
PH-010 EffortToProgressDeteriorationState
PH-007 TimeSinceMeaningfulProgressSeconds
PH-008 ProgressStallState
~~~

These should form one dynamic parent rather than four model slots.

They are respectively current conversion, change in conversion, time since output, and stall lifecycle.

## 8. Directionality guard

Unsigned activity has no direction.

~~~text
activity up + price down
~~~

is adverse conversion, not positive evidence.

Likewise:

~~~text
activity up + price flat
~~~

can reflect resistance, absorption-like behavior, churn, a temporary barrier or sampling noise.

Do not infer participant intent from this. The observable statement is only that activity increased while desired-direction progress did not.

## 9. Lead vs confirmation

A possible useful sequence is:

~~~text
activity wakes
→ repricing begins
→ conversion strengthens
→ target path develops
~~~

Activity can therefore lead full price acceleration.

But directional conversion cannot be known until some desired-direction response exists.

Provisional role:

~~~text
LEADING-CONDITIONAL + EARLY_CONFIRMING
~~~

Issue #16 later owns the empirical measurement of how much lead remains before useful price progress.

## 10. Why deterioration may matter

Example:

~~~text
prior window:
40 trades → +0.15%

latest window:
80 trades → +0.01%
~~~

More effort produced much less progress.

That can be a candidate early warning that the process is losing conversion efficiency before price visibly reverses.

Benign counterexamples include consolidation, a short-lived barrier, liquidity replenishment and sampling artifacts.

Therefore deterioration is protective / remaining-opportunity evidence, not an automatic negative-direction signal.

## 11. Why Clean Path remains separate

Clean Path asks about the geometry of the already-observed path:

~~~text
directional efficiency
reversal density
reversal depth
giveback
progress per adverse excursion
~~~

That is not the same information as effort→progress conversion.

Example A:

~~~text
moderate activity, strong conversion
path: +0.10, -0.09, +0.20, -0.08, +0.30
~~~

Example B:

~~~text
moderate activity, strong conversion
path: +0.08, +0.15, +0.22, +0.30
~~~

Gross progress is similar; target-before-adverse usability is very different.

Therefore Clean Path retains a separate candidate slot.

## 12. Clean Path is more protective than directional

Stage 17.B does not claim:

~~~text
clean historical path → future rise
~~~

Instead:

> conditional on an upward opportunity existing, does the recent route look usable or fragile?

Provisional role:

~~~text
PATH_RISK_CORE_CANDIDATE
~~~

rather than standalone directional alpha.

## 13. Clean Path child reduction

Primary evidence:

~~~text
PH-001 RecentDirectionalEfficiency
PH-002 ReversalDensityRecent
PH-003 ReversalDepthProfile
PH-004 GiveBackPct
PH-011 ProgressPerAdverseExcursion
~~~

These should collapse into one path-risk representation.

Do not give them five independent votes.

## 14. Provisional priority within Stage 17.B

### 1. Progress Conversion Efficiency

Priority: VERY_HIGH

Reasons:

- dynamic rather than static;
- directly links market effort to useful repricing;
- deterioration may warn before overt reversal;
- raw activity is otherwise direction-ambiguous;
- it is conceptually distinct from Stage 17.A even though it consumes repricing output.

Main risks:

- conversion uses price response and can become confirming/late;
- unsigned snapshot activity is coarse;
- causal interpretation is unavailable.

### 2. Clean Path / Adverse Efficiency

Priority: HIGH

Reasons:

- direct alignment with target-before-adverse;
- distinguishes equal gross moves with different path risk;
- can remain informative after repricing/conversion are known.

Main risks:

- mostly describes path already traveled;
- messy history can transition to a clean new state;
- an extremely clean old move can still be almost fully consumed.

The ordering is conceptual, not statistical.

## 15. Demotions

~~~text
Raw Activity Strength
→ DEMOTE_TO_INPUT / DIAGNOSTIC

ActivityBurstState
→ lifecycle/input state, not separate core vote

WaveHealthState
→ synthesis/explanation, not another vote on top of the two parents
~~~

## 16. Redundancy map

### Parent 1 — Progress Conversion Efficiency

Owns:

~~~text
activity→progress efficiency
change in efficiency
stall clock
stall/deterioration lifecycle
~~~

### Parent 2 — Clean Path / Adverse Efficiency

Owns:

~~~text
path directness
reversal frequency/severity
giveback
adverse travel relative to progress
~~~

### Stage 17.A — Fresh Market Repricing

Owns:

~~~text
immediate market movement itself
~~~

Therefore:

~~~text
Fresh Market Repricing
= what price/book is doing

Progress Conversion Efficiency
= how effectively new participation is producing that movement

Clean Path / Adverse Efficiency
= how usable/hostile the recent route has been
~~~

These remain distinct candidates for now.

## 17. Falsification tests

### A — conversion incremental value

Compare Fresh Market Repricing alone versus Fresh Market Repricing + Progress Conversion Efficiency.

If conversion adds no stable out-of-sample value, drop it.

### B — deterioration incremental value

Compare current conversion efficiency versus current efficiency + conversion trend/stall.

If trend/stall adds nothing, simplify the parent.

### C — raw activity ablation

After conversion state is known, add raw activity features.

If they add nothing, retain diagnostics only.

### D — path-quality incremental value

Compare repricing + conversion versus repricing + conversion + Clean Path.

Primary outcomes:

~~~text
target-before-adverse
MAE before target
TimeToTarget
future BID exitability
~~~

If Clean Path only explains old smoothness and does not improve future path outcomes, demote it.

### E — transition-aware path quality

Test NOISE_TO_ORDERED_UP separately from persistently choppy path.

### F — early deterioration

Test whether effort up / progress down predicts worse future outcomes before Fresh Market Repricing itself clearly reverses.

If deterioration appears only after price deterioration, it is late/redundant.

## 18. Decision table

| Old concept | Decision |
| --- | --- |
| Activity-to-Price Conversion | MERGE_INTO_PARENT |
| Stall / Effort-to-Progress Deterioration | MERGE_INTO_PARENT |
| Progress Conversion Efficiency | KEEP_CORE_CANDIDATE |
| Clean Path / Adverse Efficiency | KEEP_CORE_CANDIDATE |
| Raw Activity Strength | DEMOTE_TO_INPUT / DIAGNOSTIC |
| WaveHealthState | SYNTHESIS / DIAGNOSTIC |

## 19. Provisional core after Stage 17.B

~~~text
1. Fresh Market Repricing
2. Progress Conversion Efficiency
3. Clean Path / Adverse Efficiency
4. Fresh Reset / Reclaim / Reacceleration
5. Move Consumption / Remaining Opportunity
6. Usable Lead / Opportunity Stage
~~~

Count progression:

~~~text
original: 8
after 17.A: 7
after 17.B: 6
~~~

No conclusion has yet been made about the last three concepts; they belong to Stage 17.C.

## 20. Stage boundary

Next:

> Stage 17.C only — compare Fresh Reset / Reclaim / Reacceleration, Move Consumption / Remaining Opportunity, and Usable Lead / Opportunity Stage.

The next stage must decide especially whether these are independent predictors or higher-level modifiers/syntheses of the three retained parent concepts.
