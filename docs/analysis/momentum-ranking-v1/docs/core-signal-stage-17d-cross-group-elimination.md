# Stage 17.D — Cross-Group Elimination and Provisional Sparse Core

Issue: #17
Stage: 17.D
Date: 2026-09-24

## Scope

This stage compares the five parent concepts produced by Stages 17.A–17.C:

1. Fresh Market Repricing
2. Progress Conversion Efficiency
3. Clean Path / Adverse Efficiency
4. Fresh Reset / Renewal
5. Remaining Opportunity Lifecycle

Stage 17.E empirical-selection protocol is intentionally out of scope.

## Executive conclusion

The five concepts should not become five equal-weight or additive model votes.

The strongest current architecture is:

~~~text
UNIVERSAL CURRENT-STATE PREDICTORS
1. Fresh Market Repricing
2. Progress Conversion Efficiency

UNIVERSAL PROTECTIVE / PATH MODIFIER
3. Path Usability / Adverse Efficiency

CONDITIONAL RESERVE / RENEWAL MODIFIER
4. Fresh Reset / Renewal

OBJECTIVE-ALIGNED SYNTHESIS
5. Remaining Opportunity Lifecycle
~~~

### Stage 17.D elimination decision

Fresh Reset / Renewal should **not** consume a universal core slot.

It remains an explicit conditional reserve because it can matter when a real pullback/reclaim episode exists, but it overlaps heavily with:

- Fresh Market Repricing through reacceleration;
- Progress Conversion Efficiency through renewed conversion;
- Path Usability through pullback/reclaim quality;
- Remaining Opportunity Lifecycle through opportunity-age renewal.

Therefore the provisional sparse architecture is:

~~~text
4 universal core interfaces
+
1 conditional renewal modifier
~~~

This preserves five meaningful concepts when renewal is applicable without creating five permanent votes.

## 1. Why the concepts must have different architectural roles

A common scoring mistake would be:

~~~text
repricing score
+ conversion score
+ path score
+ reset score
+ remaining-opportunity score
~~~

That is structurally unsafe because the later concepts consume evidence from the earlier ones.

Correct architecture is closer to:

~~~text
raw observations
→ current repricing
→ conversion interpretation
→ path-risk interpretation
→ optional renewal modifier
→ remaining-opportunity synthesis
→ later ranking
~~~

The arrows matter.

They mean information can be reused for interpretation without being counted again as independent evidence.

## 2. Core interface 1 — Fresh Market Repricing

Disposition:

~~~text
KEEP_CORE_PREDICTOR
~~~

Primary question:

> Is the quoted market repricing upward now, freshly enough, with the BID participating rather than only ASK widening?

Why it survives:

- closest direct observable to immediate upward movement;
- cause-aware BID/ASK decomposition is relevant to future exitability;
- broad coverage from L1/MID data;
- relatively simple and falsifiable;
- it is required by several later concepts but is not itself a synthesis of them.

Primary risk:

- can already be late;
- quote flicker can mislead;
- current movement does not imply remaining opportunity.

Stage 17.D role:

~~~text
PRIMARY CURRENT-STATE PREDICTOR
~~~

## 3. Core interface 2 — Progress Conversion Efficiency

Disposition:

~~~text
KEEP_CORE_PREDICTOR
~~~

Primary question:

> Is new market effort/participation converting efficiently into desired-direction repricing, and is that conversion strengthening or deteriorating?

Why it survives:

- introduces a different information channel: activity/participation conditional on price response;
- can potentially distinguish productive participation from churn/absorption-like non-progress;
- deterioration may appear before outright reversal;
- it can add timing information beyond current repricing magnitude.

Why it is still at risk in Stage 17.E:

It consumes Fresh Market Repricing as its output variable.

Therefore it must prove incremental value beyond Fresh Market Repricing.

If it does not:

~~~text
DROP / DEMOTE_TO_DIAGNOSTIC
~~~

Stage 17.D role:

~~~text
SECONDARY DYNAMIC PREDICTOR
~~~

## 4. Core interface 3 — Path Usability / Adverse Efficiency

Stage 17.D renames:

~~~text
Clean Path / Adverse Efficiency
→
Path Usability / Adverse Efficiency
~~~

Reason:

`Clean Path` can sound like a bullish predictor.

The real purpose is protective:

> Given an opportunity, has the recent route been usable enough—limited adverse travel, reversals and giveback—to support target-before-adverse?

Disposition:

~~~text
KEEP_CORE_PROTECTIVE
~~~

Why it survives separately:

- target-before-adverse directly depends on path geometry, not just endpoint direction;
- identical gross upward moves can have radically different adverse paths;
- it is not reducible to activity conversion;
- it can protect the system from opportunities that look strong but are practically hostile.

Why it is not a bullish vote:

~~~text
clean recent path
!=
future rise
~~~

It should modify usability/confidence/remaining opportunity rather than independently add bullish strength.

Stage 17.D role:

~~~text
PROTECTIVE PATH MODIFIER
~~~

## 5. Fresh Reset / Renewal — demoted from universal core

Disposition:

~~~text
CONDITIONAL_RESERVE
~~~

Primary question:

> Did a real retreat/reclaim sequence create a young local opportunity inside an older move?

Why it is not discarded:

- simple wave age can misclassify a genuinely renewed local leg as old;
- a validated reset can restore target room/time after prior extension;
- the renewal sequence can contain structural information not captured by elapsed age alone.

Why it loses the universal core slot:

### Coverage

Many good opportunities begin directly and have no pullback/reclaim episode.

### Redundancy

Most of its child evidence is already represented elsewhere:

~~~text
reacceleration → Fresh Market Repricing
renewed activity conversion → Progress Conversion Efficiency
pullback/reclaim quality → Path Usability
re-aged opportunity → Remaining Opportunity Lifecycle
~~~

### Semantics

Reset detection depends on segmentation and local-reference choices that Issue #6 has not finalized.

Correct use:

~~~text
if valid renewal episode exists:
  supply RenewalState to Remaining Opportunity Lifecycle
else:
  NOT_APPLICABLE
~~~

Not:

~~~text
no reset = zero score
~~~

## 6. Core interface 4 — Remaining Opportunity Lifecycle

Disposition:

~~~text
KEEP_CORE_SYNTHESIS
~~~

Primary question:

> Given what is happening now, how much useful opportunity still appears to remain after progress consumption, timing/lead consumption, path risk and execution constraints?

Why it survives:

- closest interface to the exact project objective;
- prevents a strong-but-late move from outranking a fresher opportunity;
- combines move-age and usable-time concepts without counting both separately;
- provides the natural bridge from raw predictive evidence to later ranking.

Critical architectural rule:

Remaining Opportunity Lifecycle is **not another independent predictor vote**.

It is the synthesis layer.

Therefore:

~~~text
Fresh Market Repricing
Progress Conversion Efficiency
Path Usability
RenewalState
execution/trust gates

→ Remaining Opportunity Lifecycle
~~~

and not:

~~~text
those components
+
Remaining Opportunity Lifecycle score
~~~

## 7. The provisional sparse architecture

### Universal core

~~~text
1. Fresh Market Repricing
   role: primary current-state predictor

2. Progress Conversion Efficiency
   role: secondary dynamic predictor

3. Path Usability / Adverse Efficiency
   role: protective path modifier

4. Remaining Opportunity Lifecycle
   role: objective-aligned synthesis
~~~

### Conditional reserve

~~~text
5. Fresh Reset / Renewal
   role: renewal modifier
   active only when a valid reset/reclaim episode exists
~~~

### Mandatory gates outside the predictor count

~~~text
DataQuality
Freshness / ObservationAge
Two-sided L1 validity
Spread burden
Latency
size/depth feasibility
explicit cost feasibility
~~~

### Context/prior outside the core unless empirical value is proven

~~~text
RecentWavePrior
MultiHorizon / Regime
TimeOfDay
CrossSectionalRelativeEdge
~~~

## 8. Why four universal concepts is acceptable

The earlier 5–8 target was a sparsity target, not a command to manufacture five independent channels when research finds only four universal interfaces.

Forcing another universal feature merely to hit a number would contradict the core principle:

~~~text
keep only information that is genuinely distinct and useful
~~~

The architecture still retains five meaningful concepts when a renewal episode exists:

~~~text
4 universal
+
1 conditional renewal modifier
~~~

Stage 17.E may still remove one, restore the reserve, or promote another diagnostic if empirical incremental value demands it.

## 9. Remaining cross-group overlap

### Fresh Market Repricing ↔ Progress Conversion Efficiency

Overlap:

Progress Conversion uses repricing as its output.

Required guard:

Progress Conversion survives only if activity/effort context adds information beyond repricing itself.

### Fresh Market Repricing ↔ Remaining Opportunity Lifecycle

Overlap:

strong repricing can influence lifecycle state.

Required guard:

Lifecycle must focus on consumption/remaining budget, not re-score repricing strength.

### Path Usability ↔ Remaining Opportunity Lifecycle

Overlap:

path risk contributes to capturable remaining opportunity.

Required guard:

Path Usability owns measurement; Lifecycle consumes it.

Do not rederive a second path score inside Lifecycle.

### Renewal ↔ all four interfaces

Overlap is substantial.

This is exactly why Renewal is conditional reserve rather than a universal vote.

## 10. What was eliminated or demoted through Stages 17.A–D

### Merged away as independent slots

~~~text
Fresh Price Impulse
BID / Quote Migration Strength
Activity-to-Price Conversion
Stall / Effort-to-Progress Deterioration
Move Consumption / Remaining Opportunity
Usable Lead / Opportunity Stage
~~~

They survive inside parent concepts.

### Demoted to inputs / diagnostics

~~~text
raw activity strength
activity burst as standalone alpha
static L1 queue imbalance
microprice tilt
WaveHealthState as separate vote
OpportunityStage as separate alpha
~~~

### Demoted to conditional reserve

~~~text
Fresh Reset / Renewal
~~~

## 11. Provisional priority order by architectural importance

This is **not** a measured predictive ranking.

It is a design priority for Stage 17.E testing.

### Tier A — must test first

~~~text
Fresh Market Repricing
Remaining Opportunity Lifecycle
~~~

Why:

- first is the most direct current market-motion evidence;
- second is the closest representation of the actual objective.

### Tier B — must prove incremental value

~~~text
Progress Conversion Efficiency
Path Usability / Adverse Efficiency
~~~

Why:

- both may add independent information;
- both also consume/interpret evidence already present elsewhere.

### Tier C — conditional reserve

~~~text
Fresh Reset / Renewal
~~~

Why:

- potentially important;
- episodic and highly overlapping;
- dependent on segmentation semantics.

## 12. Minimal decision flow

Provisional design:

~~~text
1. Trust / execution gates pass?
   no → NO_OPPORTUNITY / unusable

2. Fresh Market Repricing present?
   no → weak/no current upward process

3. Progress Conversion Efficiency
   qualifies whether participation is producing/losing progress

4. Path Usability
   qualifies target-before-adverse risk

5. RenewalState if applicable
   may re-age an older move

6. Remaining Opportunity Lifecycle
   synthesizes what is still usable from NOW

7. Later CentralRanker
   compares eligible candidates
~~~

This is a dependency flow, not a rigid rule engine and not yet a production algorithm.

## 13. Provisional sparse-core contract for Stage 17.E

Stage 17.E should empirically test these hypotheses in this order:

### H1

Fresh Market Repricing must show direct out-of-sample relationship to future target/BID outcomes.

If H1 fails, the current conceptual model needs major revision.

### H2

Progress Conversion Efficiency must add stable incremental value after Fresh Market Repricing.

### H3

Path Usability must improve target-before-adverse / MAE outcomes after current repricing/conversion are known.

### H4

Remaining Opportunity Lifecycle must improve selection of fresh/capturable moves rather than merely re-express current strength.

### H5

Fresh Reset / Renewal must add value only in applicable episodes after the universal core is known.

## 14. Stage 17.D decision table

| Concept | Stage 17.D disposition | Architectural role |
| --- | --- | --- |
| Fresh Market Repricing | KEEP_CORE_PREDICTOR | primary current-state predictor |
| Progress Conversion Efficiency | KEEP_CORE_PREDICTOR | secondary dynamic predictor |
| Clean Path / Adverse Efficiency | KEEP_CORE_PROTECTIVE, rename Path Usability / Adverse Efficiency | protective modifier |
| Fresh Reset / Renewal | DEMOTE_TO_CONDITIONAL_RESERVE | optional renewal modifier |
| Remaining Opportunity Lifecycle | KEEP_CORE_SYNTHESIS | objective-aligned synthesis |

## 15. Count after Stage 17.D

~~~text
original provisional concepts: 8
after 17.A: 7
after 17.B: 6
after 17.C: 5 parent concepts
after 17.D:
  4 universal core interfaces
  + 1 conditional reserve
~~~

This is the provisional sparse architecture that Stage 17.E must challenge empirically.

## 16. Stage boundary

Next:

> Stage 17.E only — define the empirical selection/elimination contract that can reject, retain or restore these concepts using direct Issue #15 outcomes and leakage-safe Issue #11 methodology.

Do not start data extraction/cadence implementation here; Issue #18 owns that work.
