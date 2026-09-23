# Sparse Predictive Core — Comprehensive Research Handoff

Date: 2026-09-24
Source: Issue #17 Stages 17.A–17.E

## Thesis

The large feature registry exists to ensure research coverage.

The model should remain small.

Current research has reduced the original eight provisional concepts to:

~~~text
4 universal interfaces
+
1 conditional renewal reserve
~~~

and only two universal interfaces are currently treated as directional/dynamic predictors.

## Provisional architecture

### Fresh Market Repricing

Role: primary current-state predictor.

Question:

> Is the quoted market repricing upward now, freshly, with BID participation?

Owns MID/BID/ASK movement, speed, acceleration, recency and quote-side cause decomposition as one information channel.

### Progress Conversion Efficiency

Role: secondary dynamic predictor.

Question:

> Is new participation/effort converting into useful desired-direction repricing, or is conversion stalling/deteriorating?

Must prove incremental value beyond Fresh Market Repricing.

### Path Usability / Adverse Efficiency

Role: protective path modifier.

Question:

> Given an opportunity, is the route sufficiently usable with respect to reversals, giveback and adverse movement?

It is not standalone bullish alpha.

### Fresh Reset / Renewal

Role: conditional reserve.

Question:

> Did a genuine pullback/reclaim sequence create a new local opportunity inside an older move?

Only applicable when a reset/reclaim lifecycle exists.

### Remaining Opportunity Lifecycle

Role: objective-aligned synthesis.

Question:

> How much useful opportunity still appears to remain from NOW after move consumption, timing/lead consumption, path risk, renewal and execution/trust constraints?

It is not an additive alpha vote.

## Mandatory non-alpha gates

~~~text
DataQuality
Freshness / ObservationAge
Two-sided L1 validity
Spread burden
latency
size/depth feasibility
explicit costs
~~~

## Context excluded by default

~~~text
RecentWavePrior
MultiHorizon / Regime
TimeOfDay
CrossSectionalRelativeEdge
~~~

These may enter only after stable incremental held-out value is demonstrated.

## What was deliberately removed as independent votes

~~~text
Fresh Price Impulse
BID / Quote Migration Strength
Activity-to-Price Conversion
Stall / Effort-to-Progress Deterioration
Move Consumption / Remaining Opportunity
Usable Lead / Opportunity Stage
raw activity strength
static queue imbalance
microprice tilt
WaveHealthState
OpportunityStage
~~~

Most survive as child evidence, modifiers or diagnostics, not independent votes.

## Empirical burden of proof

The sparse architecture is provisional.

Every retained concept can still be removed.

Primary burden:

~~~text
stable incremental out-of-sample value
on direct target/time/adverse/future-BID outcomes
after stronger concepts are known
~~~

Prefer the smallest model that is effectively as good as the best supported model.

## Data/cadence boundary

How data is extracted and how frequently the provider is polled is a separate design problem owned by Issue #18.

Do not increase provider load merely because faster polling may be technically possible.

Use the slowest cadence that preserves the information actually required by the empirically retained core.

## Timing ownership from Issue #16

Issue #16 does not add a new universal predictor.

```text
ConversionTimingState
→ nested in Progress Conversion Efficiency

OpportunityEvidenceDecayProfile / UsableLeadBudget
→ nested in Remaining Opportunity Lifecycle

Book-pressure conversion timing
→ diagnostic / validate-only
```

Do not assume a universal SignalOpportunityHalfLife. A half-life is reportable only if empirical incremental-value decay is sufficiently monotonic/stable and a 50% crossing is identifiable out of sample.

## Wave segmentation ownership from Issue #6

Wave segmentation does not add a universal predictor.

```text
CompletedWaveEpisode
→ historical capacity/memory primitive

CurrentLegReference
→ geometric reference for conditional Renewal / Remaining Opportunity
```

Canonical V1 segmentation uses causal MID directional-change semantics with separate extremum timestamps and known-at confirmation timestamps. Completed-wave memory becomes available only after completionKnownAtTime; active episodes remain censored. Recent wave capacity is context/prior and must prove incremental value beyond the sparse core and Issue #15 all-observation baseline.
