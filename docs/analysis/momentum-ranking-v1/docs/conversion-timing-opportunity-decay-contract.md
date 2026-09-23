# Issue #16 — Conversion Timing and Opportunity Decay Contract

Date: 2026-09-24

## 1. Purpose

Define how precursor→price timing and opportunity decay should interact with the sparse core without creating new duplicate predictor slots.

Original Issue #16 candidate concepts:

~~~text
ActivityToPriceConversionLatency
BookPressureToPriceConversionLatency
PressureConversionEfficiency
ProgressStallClock
SignalOpportunityHalfLife
LeadTimeAfterSystemLatency
~~~

Stage #17 already changed the architecture materially.

The question now is:

> Which of these timing concepts add a distinct information channel, and which are timing interpretations of core concepts already retained?

## 2. Executive decision

Issue #16 does **not** create a new universal core predictor.

Instead it produces two timing interfaces inside the existing sparse architecture:

~~~text
A. ConversionTimingState
   owner: Progress Conversion Efficiency

B. OpportunityEvidenceDecay / UsableLeadBudget
   owner: Remaining Opportunity Lifecycle
~~~

Other original concepts are merged or demoted.

Therefore the sparse architecture remains:

~~~text
4 universal interfaces
+
1 conditional Renewal reserve
~~~

and not:

~~~text
4 core
+ 6 latency features
~~~

## 3. Concept disposition

| Original concept | Disposition | Owner |
| --- | --- | --- |
| ActivityToPriceConversionLatency | MERGE | ConversionTimingState / Progress Conversion Efficiency |
| BookPressureToPriceConversionLatency | DIAGNOSTIC / VALIDATE_ONLY | Fresh Market Repricing / future richer-book research |
| PressureConversionEfficiency | ALREADY MERGED | Progress Conversion Efficiency |
| ProgressStallClock | MERGE | ConversionTimingState / Progress Conversion Efficiency |
| SignalOpportunityHalfLife | REFRAME / MERGE | OpportunityEvidenceDecay / Remaining Opportunity Lifecycle |
| LeadTimeAfterSystemLatency | ALREADY MERGED | Remaining Opportunity Lifecycle |

## 4. Interface A — ConversionTimingState

### Question

> Once relevant participation/effort wakes up, how quickly does useful desired-direction repricing become observable, and has the current process waited longer than comparable conversion episodes normally do?

This is not a new alpha channel.

It is the timing dimension of:

~~~text
Progress Conversion Efficiency
~~~

### Core components

~~~text
precursorActivationTime
firstMeaningfulRepricingTime
conversionLatencyInterval
timeSinceMeaningfulProgress
conditionalExpectedConversionWindow
stallRelativeToExpectedConversion
timingConfidence
~~~

## 5. Activity precursor timing

Activity-side precursor candidates come from existing Activity/Flow evidence such as:

~~~text
TradeRateAcceleration
ActivityBurst
ParticipationExpansion
~~~

But raw activity remains direction-ambiguous.

Therefore an activity activation timestamp means only:

> an observable change in market participation/effort occurred.

It does **not** mean:

> buyers caused the next rise.

Observed ordering is descriptive, not causal.

## 6. Meaningful price progress

The price-response event should be defined using the Stage #17 parent:

~~~text
Fresh Market Repricing
~~~

not a new duplicate return metric.

Conceptually:

~~~text
firstMeaningfulRepricingTime
= first observation at which the predeclared Fresh Market Repricing condition becomes satisfied
~~~

The exact threshold/state transition must be fixed before final empirical evaluation.

It must not be chosen after observing which latency looks most favorable.

## 7. Conversion latency must preserve sampling uncertainty

Current observations are snapshots.

Therefore:

~~~text
observed precursor timestamp
and
observed repricing timestamp
~~~

do not prove exact event times between samples.

When the ordering is unresolved at available resolution:

~~~text
SIMULTANEOUS_CLUSTER
~~~

must be preserved.

When an interval can be bounded, use an interval rather than false precision.

Example:

~~~text
activity state first qualifies at sample t1
price state is still below progress condition at t2
price condition first qualifies at t3

conversion occurred observationally after activity
but exact crossing lies within the sampled interval around t3
~~~

## 8. ProgressStallClock belongs to the same process

ProgressStallClock asks:

> How long has it been since the last meaningful useful progress?

This is the inverse side of conversion latency:

~~~text
conversion arrives quickly
vs
effort remains present while progress fails to arrive
~~~

Therefore:

~~~text
ActivityToPriceConversionLatency
+
ProgressStallClock
!=
two independent core votes
~~~

They are one timing lifecycle.

## 9. Conditional—not universal—stall semantics

Do not encode:

~~~text
15 seconds without progress = stalled
~~~

or any other universal threshold.

A delay is meaningful only relative to comparable conditions, for example:

~~~text
security
activity state
liquidity state
target horizon
possibly time/regime when later validated
~~~

Provisional state vocabulary:

~~~text
CONVERTING_WITHIN_EXPECTATION
PAUSING_WITHIN_EXPECTATION
LATE_CONVERSION
STALLING_BEYOND_EXPECTED
RECOVERED_CONVERSION
UNKNOWN
~~~

Thresholds remain empirical.

## 10. Interface B — OpportunityEvidenceDecay

Original name:

~~~text
SignalOpportunityHalfLife
~~~

is too strong as a primary concept.

It assumes there is one useful scalar half-life and can imply exponential decay before evidence supports that shape.

Reframe to:

~~~text
OpportunityEvidenceDecayProfile
~~~

Question:

> After a concept/state is first detected, how does its incremental usefulness for the direct Issue #15 outcome change as the evidence ages?

## 11. No universal half-life assumption

Do not assume:

~~~text
value(age) = value0 * 2^(-age / halfLife)
~~~

before observing the actual decay shape.

Possible empirical shapes include:

- rapid decay;
- plateau then cliff;
- delayed conversion then peak;
- non-monotonic reset/revival;
- horizon-specific persistence.

Therefore the primary artifact is the **decay profile**.

A half-life may be reported later only if:

1. the incremental value is meaningfully positive at detection;
2. decay is sufficiently monotonic/stable;
3. a 50% crossing is identifiable with adequate coverage;
4. the result survives held-out validation.

Otherwise:

~~~text
halfLife = NOT_IDENTIFIED
~~~

## 12. What 'signal value' means

Decay must be measured against the same objective-aligned outcome surface used by Issue #15/#17.

Conceptually:

~~~text
IncrementalValue(age)
=
performance(core + concept-at-age)
-
performance(core without that incremental information)
~~~

depending on concept role.

Examples:

- Fresh Market Repricing: does fresh repricing retain useful future BID upside as it ages?
- Progress Conversion: does conversion state still add value 10/20/30s after first qualification?
- Renewal: how long after reclaim does renewal information remain useful?

Do not define decay from raw correlation alone.

## 13. Age buckets

Use the existing Issue #15 time grid as the primary research clock rather than inventing a second arbitrary grid:

~~~text
5, 10, 20, 30, 40, 50, 60, 90, 120 seconds
~~~

Age-bucket interpretation may use:

~~~text
0–5
5–10
10–20
20–30
30–40
40–50
50–60
60–90
90–120
>120
~~~

subject to coverage.

This is a reporting grid, not a claim that the state changes exactly at those boundaries.

## 14. LeadTimeAfterSystemLatency remains lifecycle budget

Original concept:

~~~text
LeadTimeAfterSystemLatency
~~~

is already owned by:

~~~text
Remaining Opportunity Lifecycle
~~~

Conceptual form:

~~~text
usableLead
=
observed precursor lead
- observation/data age
- ranking delay
- decision delay
- expected entry delay
~~~

Exact components depend on what is measurable in the eventual system.

It is a budget/modifier, not a directional predictor.

## 15. BookPressureToPriceConversionLatency is demoted

Current sparse-core research deliberately did not retain static queue imbalance/microprice as universal predictors.

Current V1 data also lacks:

- true event-by-event add/cancel sequencing;
- signed trade tape;
- demonstrated usable L2–L5 depth.

Therefore:

~~~text
BookPressureToPriceConversionLatency
→ DIAGNOSTIC / VALIDATE_ONLY
~~~

Possible V1 diagnostic:

> does observable L1 quote-side state tend to precede Fresh Market Repricing?

But this must not become a new core slot unless it later proves incremental value beyond the Fresh Market Repricing parent.

Issue #12 may reopen richer-book/tape timing if deeper data is shown to be necessary.

## 16. External microstructure context

Jeremy Large (2007), Measuring the resiliency of an electronic limit order book, explicitly models book recovery as a time-dependent process after large trades. In the LSE sample, recovery was not reliable in most cases; when it occurred, the reported replenishment half-life was around 20 seconds.

Implication:

> response timing can matter, but there is no basis for importing a universal 20-second half-life into this project.

Bechler & Ludkovski (2017), Order Flows and Limit Order Book Resiliency on the Meso-Scale, report predictive relevance of limit-order flows and deeper book shape in six large-tick Nasdaq assets.

Implication:

> richer event/depth data can contain useful timing information, but those results do not justify pretending current TASE L1 snapshots contain the same information.

These references motivate timing research; they do not validate TASE thresholds.

## 17. Relationship to sparse core

After Issue #16:

~~~text
Fresh Market Repricing
  = current movement

Progress Conversion Efficiency
  = effort→progress quality
  + ConversionTimingState

Path Usability / Adverse Efficiency
  = route risk

Fresh Reset / Renewal
  = conditional renewal modifier

Remaining Opportunity Lifecycle
  = move/time/lead budget
  + OpportunityEvidenceDecayProfile
~~~

No new universal predictor has been added.

## 18. Primary empirical tests

### Test A — conversion timing adds value

Compare:

~~~text
Progress Conversion Efficiency without timing
vs
Progress Conversion Efficiency + ConversionTimingState
~~~

Question:

> Does knowing how quickly effort converts, or how overdue conversion is, improve future target-before-adverse / BID outcomes?

If no:

~~~text
timing remains diagnostic
~~~

### Test B — stall before repricing failure

Test whether:

~~~text
STALLING_BEYOND_EXPECTED
~~~

predicts deterioration **before** Fresh Market Repricing itself visibly weakens.

If not, stall timing is late/redundant.

### Test C — decay profile

For each retained concept, measure incremental outcome value as evidence age increases.

Question:

> Is there stable decay, delayed peak, plateau or no detectable age effect?

Do not force a half-life.

### Test D — usable lead

Condition on similar core state but different remaining lead after observation/decision latency.

Question:

> Does more usable lead correspond to more capturable future BID opportunity?

### Test E — book-pressure diagnostic

Test L1 pressure/quote-state timing only as an incremental diagnostic beyond Fresh Market Repricing.

If it does not add held-out value:

~~~text
do not reopen it
~~~

## 19. Required outputs when empirical work eventually runs

For ConversionTimingState:

~~~text
eligible precursor episodes
SIMULTANEOUS_CLUSTER rate
conversion latency interval distribution
no-conversion/censored count
stall-age distribution
target-before-adverse by latency bucket
future BID outcomes by latency bucket
~~~

For OpportunityEvidenceDecayProfile:

~~~text
concept activation count
age bucket coverage
incremental outcome value by age
uncertainty by age
identified peak-age if any
identified expiry/decay region if any
half-life only when identifiable
~~~

## 20. No-causality rule

Observed sequence:

~~~text
activity first
then price
~~~

does not prove:

~~~text
activity caused price
~~~

Likewise displayed L1 pressure preceding price does not reveal participant intent.

Required vocabulary:

~~~text
observed lead
observed conversion
observed sequence
conditional association
~~~

not causal claims.

## 21. No cadence conclusion

Issue #16 does not decide that the recorder must run every second.

Instead it defines what timing uncertainty matters.

Later Issue #18 asks:

> Is the existing cadence sufficient to estimate the retained timing interfaces well enough, or would faster collection materially improve the decisions?

Faster polling must earn its cost through value-of-information evidence.

## 22. Research-definition result

Original six Issue #16 concepts are reduced to:

~~~text
1. ConversionTimingState
   nested in Progress Conversion Efficiency

2. OpportunityEvidenceDecayProfile / UsableLeadBudget
   nested in Remaining Opportunity Lifecycle

3. Book-pressure timing
   diagnostic / validate-only
~~~

No additional core slot is created.

## 23. Remaining empirical unknowns

Still unknown:

- actual conversion-latency distributions;
- whether timing adds incremental value;
- whether stall is early enough to matter;
- actual opportunity-decay shape;
- whether a half-life is identifiable;
- whether current cadence is sufficient.

These must remain UNKNOWN until empirical history is evaluated.

## 24. Handoff

Later empirical work should use:

- Issue #15 fixed outcome grid;
- Issue #17 sparse-core selection contract;
- Issue #11 leakage-safe validation;
- Issue #18 data/cadence design only when needed.

Do not expand Issue #16 back into six independent signals.
