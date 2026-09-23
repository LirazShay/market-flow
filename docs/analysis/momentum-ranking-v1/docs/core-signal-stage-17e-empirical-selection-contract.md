# Stage 17.E — Empirical Selection and Elimination Contract

Issue: #17
Stage: 17.E
Date: 2026-09-24

## Purpose

Predeclare how empirical evidence may retain, reject, merge or restore the sparse concepts produced by Stages 17.A–17.D.

This contract is intentionally fixed **before** looking at final held-out results.

Current provisional architecture:

~~~text
UNIVERSAL
1. Fresh Market Repricing
2. Progress Conversion Efficiency
3. Path Usability / Adverse Efficiency
4. Remaining Opportunity Lifecycle

CONDITIONAL RESERVE
5. Fresh Reset / Renewal
~~~

None of these is guaranteed a production slot.

## 1. Primary empirical question

For each eligible observation at decision time t0:

> Does knowing this concept improve our ability to identify a useful positive move from NOW, fast enough and clean enough to capture, beyond what the already-retained concepts tell us?

The test is **incremental** and **objective-aligned**.

Not:

~~~text
does the feature correlate with future return?
~~~

but:

~~~text
does it improve held-out target-before-adverse / timing / exitability decisions
after stronger retained concepts are already known?
~~~

## 2. Primary outcome hierarchy

### Primary decision-aligned research view

Where valid BID data permits:

~~~text
reference = BID1(t0)
future path = BID1(t)
~~~

Primary labels are computed on BID advancement from NOW:

~~~text
FutureBidVsCurrentBidReturn
BidAdvanceMFE
BidAdvanceMAE
target-before-adverse
ObservedTimeToTarget
ObservedTimeToAdverse
~~~

This directly asks whether the sellable-side BID advanced after detection, without penalizing a candidate for the contemporaneous displayed spread.

### Parallel raw-market control

Use MID-based:

~~~text
MidMFE
MidMAE
MID target-before-adverse
MID TimeToTarget
~~~

Purpose:

> distinguish BID-side advancement from broader market-center movement.

### Secondary diagnostic only — ASK entry to future BID

`ASK1(t0) → future BID1(t)` may be retained as a conservative crossing-friction diagnostic, but it is **not** the primary selection outcome and must not gate/rank the predictive model.

### LAST

Canonical LAST outcomes remain secondary / blocked until phase-aware LAST semantics are verified.

No concept may survive merely because it looks good on a weaker or semantically unresolved outcome family.

## 3. Horizon rule

Evaluate by explicit short horizon rather than one blended target:

~~~text
5s
10s
20s
30s
40s
50s
60s
90s
120s
~~~

Coverage may differ materially by horizon.

A concept may be retained as horizon-specific if:

- the effect is stable and useful in that horizon;
- the horizon was declared before final-test inspection;
- the system preserves that specificity rather than pretending universality.

## 4. Target/adverse rule

Use the target/time/adverse grid owned by Issue #15.

Do not choose a special target for each concept after seeing final results.

All candidates must be compared on the same declared outcome surfaces.

## 5. Leakage-safe data split

Random snapshot splitting is forbidden.

Reason:

adjacent observations from the same security/session share nearly the same market path and would leak future structure across train/test.

Required structure:

~~~text
development period
  → time/session-separated internal folds

locked final test period
  → untouched until concept/model-selection rules are frozen
~~~

Preferred development method:

~~~text
walk-forward / expanding-window evaluation
~~~

Each validation fold must occur strictly after the data used to construct/tune that fold's model/thresholds.

## 6. Grouping / overlap guard

Because outcomes from nearby t0 observations overlap in future windows, uncertainty estimates must not pretend each snapshot is independent.

Evaluation should preserve clustering at useful levels such as:

~~~text
session/day
security × session/day
or another empirically justified block
~~~

Exact inferential method remains Issue #11 ownership.

The principle is fixed:

> do not derive confidence from millions of highly overlapping pseudo-independent snapshots.

## 7. Representation freeze

Before the final test period is opened:

- each parent concept's formula/state mapping must be fixed;
- child metrics included in the parent must be fixed;
- missing/UNKNOWN behavior must be fixed;
- target/adverse grid must be fixed;
- gating logic used for evaluation must be fixed;
- model-selection rule must be fixed.

If any of these changes after final-test inspection:

~~~text
the old final test becomes development data
and a new untouched test period is required
~~~

## 8. Evaluate concepts, not 176 children

The initial empirical search space is the sparse parents from Stage 17.D.

Do not run unconstrained automatic feature selection over all 176 registry entries.

Child features may be used to implement a parent representation, but they do not independently compete for model slots unless a new research decision explicitly reopens them.

## 9. Small-search advantage — exhaustive subset evaluation

There are only four universal interfaces.

Therefore Stage 17.E prefers evaluating **all meaningful subsets** rather than relying only on greedy forward selection.

Conceptually:

~~~text
{R}
{R,C}
{R,P}
{R,L}
{R,C,P}
{R,C,L}
{R,P,L}
{R,C,P,L}
...
~~~

where:

~~~text
R = Fresh Market Repricing
C = Progress Conversion Efficiency
P = Path Usability / Adverse Efficiency
L = Remaining Opportunity Lifecycle
~~~

Important:

Remaining Opportunity Lifecycle is a synthesis that consumes other concepts.

Therefore only architecturally valid subsets should be evaluated.

For example, Lifecycle may be tested as:

~~~text
Lifecycle(R)
Lifecycle(R,C)
Lifecycle(R,P)
Lifecycle(R,C,P)
~~~

rather than as an independent additive variable that double-counts its inputs.

## 10. Baselines

Every candidate model must beat relevant simple baselines.

At minimum compare against:

~~~text
B0: eligibility/gates only → no directional selection
B1: simple recent MID/BID movement baseline
B2: Fresh Market Repricing parent only
~~~

Additional naive baseline:

~~~text
largest recent return / strongest raw momentum
~~~

Purpose:

> prove that the research complexity adds value beyond simply chasing the strongest recent move.

## 11. Candidate-specific hypotheses

### H1 — Fresh Market Repricing

Must demonstrate direct held-out relationship to the primary future outcome.

If it cannot outperform simple recent-movement baselines robustly:

~~~text
CURRENT CONCEPTUAL MODEL REQUIRES MAJOR REVISION
~~~

It is the anchor, not automatically guaranteed.

### H2 — Progress Conversion Efficiency

Test:

~~~text
Fresh Market Repricing
vs
Fresh Market Repricing + Progress Conversion Efficiency
~~~

Retention condition:

> stable incremental held-out improvement after repricing is known.

If not:

~~~text
DEMOTE_TO_DIAGNOSTIC
~~~

### H3 — Path Usability / Adverse Efficiency

Test after current motion is known.

Primary expected value:

~~~text
target-before-adverse
MAE before target
adverse-hit avoidance
~~~

If it only explains past path smoothness without improving future path outcomes:

~~~text
DEMOTE_TO_EXPLANATION / CONTEXT
~~~

### H4 — Remaining Opportunity Lifecycle

Must prove that it separates:

~~~text
strong-but-mostly-consumed
from
fresh-and-still-capturable
~~~

after current repricing is known.

Primary expected gains:

- better target-before-adverse;
- lower late-entry rate;
- better future BID exitability;
- preserved or improved TimeToTarget.

If it merely restates current strength:

~~~text
SIMPLIFY / REMOVE SYNTHESIS COMPLEXITY
~~~

### H5 — Fresh Reset / Renewal

Evaluate only on observations where a valid reset/reclaim episode is applicable.

Test:

~~~text
universal core
vs
universal core + RenewalState
~~~

and specifically compare renewed old waves with otherwise comparable non-renewed old waves.

If it adds no stable value:

~~~text
KEEP AS DIAGNOSTIC / EXPLANATION ONLY
~~~

If it adds strong stable value:

~~~text
PROMOTE CONDITIONAL RESERVE
~~~

It still does not become mandatory on non-reset observations.

## 12. Metrics for concept selection

No single metric decides retention.

Use an objective-aligned panel including:

~~~text
target-before-adverse rate
TouchExitMFE
TouchExitMAE
TimeToTarget
late-entry / mostly-consumed rate
coverage
NO_OPPORTUNITY quality
~~~

For ranker-facing evaluation later, also measure:

~~~text
top-k / leader capture of best subsequent usable opportunity
regret vs best eligible candidate
leader churn / instability
~~~

Exact ranking metrics belong to Issue #10/#11.

## 13. Lateness penalty

A concept is penalized if its apparent predictive strength appears only after most of the move has already occurred.

Required diagnostics:

~~~text
observed move at detection
DetectionLatenessState
usable lead after latency
remaining target room
future BID upside after detection
~~~

A late concept may be statistically associated with continuation but still fail the project objective.

## 14. Coverage penalty

Every result must report:

~~~text
eligible observations
evaluable observations
UNKNOWN / NOT_APPLICABLE
censoring
security count
session/day count
~~~

Do not keep a concept based on spectacular results from a tiny slice without explicitly classifying it as conditional.

## 15. Stability requirements

A concept should not enter the stable core because it worked in one lucky slice.

Evaluate stability across:

~~~text
time folds
securities
target horizons
time-of-day / session context where available
liquidity / movement regimes where available
counter-trend vs aligned cases
~~~

Not every subgroup must show identical effect.

But the concept must have an interpretable domain where the effect is repeatable rather than one unexplained pocket.

## 16. Redundancy / conditional-value test

Two concepts can both be individually predictive but one may be unnecessary after the other is known.

Therefore preserve:

~~~text
individual value
incremental value
leave-one-concept-out value
~~~

for every retained parent.

If removing a concept does not materially worsen held-out performance:

~~~text
REMOVE / DEMOTE
~~~

## 17. Forward addition and backward deletion

Although all small subsets are evaluated, keep the intuitive checks:

### Forward question

> What does this concept add to the best smaller model?

### Backward question

> If we remove this concept from the selected model, does held-out performance materially degrade?

A concept must survive both interpretations.

## 18. Smallest-model preference

Do not choose the numerically highest development score if a much simpler model is effectively equivalent within uncertainty.

Selection rule:

> Choose the smallest architecturally valid model whose held-out development performance is not meaningfully worse than the best supported model across the declared primary outcome panel.

The exact statistical equivalence / uncertainty rule belongs to Issue #11 and must be fixed before the final test.

This explicitly favors:

~~~text
2 strong concepts
over
4 weakly additive concepts
~~~

when their practical held-out performance is effectively the same.

## 19. No arbitrary universal weights

Stage 17.E does not authorize:

~~~text
R = 40%
C = 25%
P = 20%
L = 15%
~~~

before empirical calibration.

Initial tests should prefer:

- transparent states;
- monotonic/simple relationships where supported;
- low-capacity models;
- interaction terms only when pre-specified or clearly justified in development data.

Complex nonlinear models must prove incremental value over simpler models and remain interpretable enough to detect leakage/redundancy.

## 20. Concept promotion rule

A demoted registry concept may return only if:

1. it represents a genuinely distinct information channel;
2. it was not selected merely after mining the locked final test;
3. it adds stable incremental development/OOS value;
4. the sparse-core cap is reconsidered explicitly.

Therefore:

~~~text
registry existence
!=
permission to enter the model
~~~

## 21. Gates stay outside alpha selection

The following are evaluated as trust/execution gates, not competing predictors:

~~~text
DataQuality
Freshness / ObservationAge
RecentExecutedActivityNow
Two-sided L1 validity
latency
size/depth feasibility where relevant
explicit cost feasibility where relevant
~~~

A gate may improve net results by rejecting unusable cases.

That does not make it directional alpha.

## 22. Context/prior admission rule

Context families remain excluded from the sparse core unless they pass the same incremental-value test after the current-state core is known:

~~~text
RecentWavePrior
MultiHorizon / Regime
TimeOfDay
CrossSectionalRelativeEdge
~~~

For each:

~~~text
core only
vs
core + context
~~~

with held-out incremental evaluation.

## 23. Registry-wide disposition classes

The 176-entry registry is classified by **architectural ownership**, not as 176 model candidates.

### CORE_CANDIDATE INPUT / CHILD EVIDENCE

~~~text
PW / selected BD movement evidence
→ Fresh Market Repricing

AF + selected PH conversion/stall evidence
→ Progress Conversion Efficiency

selected PH path evidence
→ Path Usability / Adverse Efficiency
~~~

### CONDITIONAL CORE / RESERVE INPUT

~~~text
PR pullback/reclaim/reset evidence
→ Fresh Reset / Renewal
~~~

### SYNTHESIS / OBJECTIVE LAYER

~~~text
SQ timing/lateness evidence
RO remaining-opportunity evidence
→ Remaining Opportunity Lifecycle
~~~

### GATE

~~~text
TE
FQ
~~~

### CONTEXT_PRIOR

~~~text
WM
MR
CS
BD historical buyer-exitability context where not part of current repricing
~~~

### DIAGNOSTIC / VALIDATE_ONLY

~~~text
static queue imbalance
microprice tilt
family synthesis states that duplicate their child evidence
raw activity strength after conversion is known
OpportunityStage as standalone alpha
WaveHealthState as standalone alpha
~~~

### OUTCOME / VALIDATION ONLY

~~~text
future MFE / MAE
future BID exitability
target-before-adverse
TimeToTarget / TimeToAdverse
future barrier order labels
~~~

This satisfies the registry-classification requirement without pretending each registry row deserves an independent model-selection trial.

## 24. Final-test protocol

After development selection is frozen:

1. open the untouched final time period once;
2. run the selected sparse model and predeclared baselines;
3. report the full primary outcome panel, coverage and uncertainty;
4. report concept ablations without retuning on final-test outcomes;
5. do not replace a failed concept using the same final period and still call the replacement final-tested.

If the final result is poor:

~~~text
the honest conclusion is insufficient demonstrated edge
~~~

not repeated tuning until it passes.

## 25. Decision statuses after empirical evaluation

Every provisional concept must end in one of:

~~~text
RETAIN_CORE
RETAIN_PROTECTIVE
RETAIN_SYNTHESIS
RETAIN_CONDITIONAL
DEMOTE_CONTEXT
DEMOTE_DIAGNOSTIC
DROP
INSUFFICIENT_EVIDENCE
~~~

UNKNOWN / insufficient evidence must not be converted into a favorable result.

## 26. What Stage 17.E does and does not decide

Stage 17.E fixes **how evidence will decide**.

It does not claim:

- predictive accuracy;
- calibrated probabilities;
- optimal thresholds;
- final weights;
- final polling cadence;
- production implementation.

Those require later Issues #15/#16/#11/#18/#10.

## 27. Sparse-core handoff

Until empirical evidence rejects or changes it, downstream research should use this provisional architecture:

~~~text
Fresh Market Repricing
  ↓
Progress Conversion Efficiency (must prove incremental value)
  ↓
Path Usability / Adverse Efficiency (protective)
  ↓
RenewalState when applicable
  ↓
Remaining Opportunity Lifecycle
  ↓
trust / execution gating
  ↓
later CentralRanker
~~~

Interpret the arrows as dependency/interpretation flow, not mandatory causal sequence.

## 28. Completion criterion

Stage 17.E is complete when:

- the primary outcome hierarchy is fixed;
- leakage-safe split principles are fixed;
- the four-universal + renewal search space is fixed;
- individual/incremental/backward-ablation rules are fixed;
- lateness/coverage/stability penalties are fixed;
- smallest-model preference is fixed;
- registry disposition classes are fixed;
- Issue #10/#11 consume this contract.

The actual empirical results come later.
