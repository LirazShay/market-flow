# Stage 17.C — Renewal and Remaining Opportunity Lifecycle

Issue: #17
Stage: 17.C
Date: 2026-09-24

## Scope

This stage compares only:

6. Fresh Reset / Reclaim / Reacceleration
7. Move Consumption / Remaining Opportunity
8. Usable Lead / Opportunity Stage

Stage 17.D cross-group elimination is intentionally out of scope.

## Executive conclusion

The three concepts should not survive as three independent core votes.

Best current structure:

~~~text
Move Consumption / Remaining Opportunity
+
Usable Lead / Opportunity Stage
→ one lifecycle/budget parent

Fresh Reset / Reclaim / Reacceleration
→ separate conditional renewal concept
~~~

### Stage 17.C decisions

~~~text
Move Consumption / Remaining Opportunity
→ MERGE_INTO_PARENT

Usable Lead / Opportunity Stage
→ MERGE_INTO_PARENT

Remaining Opportunity Lifecycle
→ KEEP_CORE_SYNTHESIS_CANDIDATE

Fresh Reset / Reclaim / Reacceleration
→ KEEP_CONDITIONAL_CORE_CANDIDATE
~~~

Parent count:

~~~text
after 17.B: 6
after 17.C: 5
~~~

This is conceptual prioritization, not empirical validation.

## 1. Why Move Consumption and Usable Lead are one process

Move Consumption asks:

> How much of the useful move appears to have already happened before NOW?

Usable Lead / Opportunity Stage asks:

> How much actionable time remains after detection and system latency, and are we early, confirmed, mature or late?

These are two dimensions of the same lifecycle question:

~~~text
how much useful opportunity remains from NOW?
~~~

One measures progress-budget consumption.

The other measures time/lead-budget consumption.

Keeping them as separate additive votes would risk counting lateness twice.

## 2. New parent — Remaining Opportunity Lifecycle

Conceptual structure:

~~~text
RemainingOpportunityLifecycle {
  observedMove
  localLegAge
  moveConsumption
  opportunityStage
  usableLeadAfterLatency
  timeBudgetAfterLatency
  renewalState
  remainingTargetRoom
  confidence
}
~~~

The parent does not assert a probability.

It answers:

> Given the current process, how early/late are we and how much of the potentially useful move/time budget still appears available?

## 3. Why this should be a synthesis, not another alpha vote

Remaining opportunity necessarily consumes information from earlier parents:

~~~text
Fresh Market Repricing
Progress Conversion Efficiency
Clean Path / Adverse Efficiency
Fresh Reset / Renewal state
~~~

Therefore it must not be added as though it were an independent fifth measurement of market strength.

Correct architecture:

~~~text
current-state evidence
→ lifecycle / remaining-opportunity synthesis
→ later ranking
~~~

Incorrect architecture:

~~~text
repricing score
+ conversion score
+ path score
+ remaining-opportunity score
where the last score simply re-sums the first three
~~~

Stage 17.D must preserve this distinction.

## 4. Why move consumption matters

Two stocks can have the same current strength but very different remaining room.

Example:

~~~text
Stock A:
strong repricing for 80 seconds
large observed move
no reset
recent progress slowing

Stock B:
same current repricing strength
small recent observed move
fresh local leg
little time consumed
~~~

Raw momentum can rank A higher because its move is more obvious.

The project objective may prefer B because the opportunity is earlier.

Therefore consumption is not optional bookkeeping; it protects against chasing.

## 5. Why usable lead belongs inside the same parent

A signal can be predictive but operationally useless.

Example:

~~~text
precursor lead observed: 12s
system/observation/decision delay: 10s
usable lead: about 2s
~~~

Versus:

~~~text
precursor lead observed: 12s
system/observation/decision delay: 3s
usable lead: about 9s
~~~

The raw predictor is identical.

The remaining actionable opportunity is not.

Therefore Usable Lead / Stage is mainly a lifecycle modifier rather than a separate directional alpha channel.

## 6. External microstructure support for explicit timing

Limit-order-book resiliency research shows that market responses to shocks can occur on short and heterogeneous time scales rather than remaining equally informative indefinitely.

For example, Large (2007) estimates fast conditional replenishment dynamics in an electronic order book and explicitly separates whether recovery occurs from how quickly it occurs.

More recent execution/microstructure work likewise models transient effects and decaying execution/impact relevance.

Implication for this project:

> timing and decay are part of opportunity value; a correct state observed too late is not equivalent to the same state observed early.

This supports a lifecycle/time-budget treatment.

It does not establish one universal half-life for TASE; Issue #16 owns empirical decay/lead measurement.

## 7. Fresh Reset is related, but not identical

Fresh Reset / Reclaim / Reacceleration asks:

> Did a retreat remove some prior extension and then produce a genuinely renewed local leg?

This is not merely 'we are early'.

It is an observable transition sequence:

~~~text
prior extension
→ controlled retreat
→ reclaim
→ renewed repricing / reacceleration
~~~

That sequence can make an old broad wave contain a young local opportunity.

Therefore Fresh Reset provides a possible mechanism for:

~~~text
opportunity age renewal
~~~

and is not fully represented by raw elapsed age or observed-move consumption.

## 8. Why Fresh Reset remains conditional rather than universal

Most observations are not necessarily in a pullback/reclaim episode.

A stock can have an excellent fresh opportunity without any reset:

~~~text
dormant
→ wakes
→ reprices upward immediately
~~~

So Fresh Reset cannot be a mandatory prerequisite.

Provisional role:

~~~text
CONDITIONAL_CORE_CANDIDATE
~~~

It becomes active only when a valid reset/reclaim lifecycle exists.

Otherwise:

~~~text
NOT_APPLICABLE
~~~

not zero and not negative.

## 9. Fresh Reset child reduction

The following should not be independent votes:

~~~text
PR-001 PullbackDepthPct
PR-002 PullbackDurationSeconds
PR-004 ReclaimLatencySeconds
PR-005 ReclaimStrengthState
PR-006 PostRetestAccelerationState
PR-007 LegResetStrength
PR-008 RetestFailureClockSeconds
~~~

They are pieces of one renewal lifecycle.

Barrier-specific evidence remains separate context inside PR and should not automatically become another core slot.

## 10. What belongs inside Remaining Opportunity Lifecycle

Primary inputs/syntheses:

~~~text
RO-001 ObservedMoveFromDecisionContext
RO-003 PotentialRemainingState
RO-004 MoveConsumptionState
RO-005 TimeBudgetAfterLatencySeconds
RO-011 CapturableRemainingState
RO-014 RemainingOpportunityState

SQ-006 ObservedPrecursorLeadSeconds
SQ-008 UsableLeadTimeAfterSystemLatency
SQ-009 DetectionLatenessState
SQ-010 OpportunityStage
SQ-013 SequenceOpportunityState
~~~

These should collapse to one lifecycle/budget representation rather than multiple votes.

## 11. PotentialRemaining vs CapturableRemaining

The parent must preserve this distinction:

~~~text
PotentialRemaining
= market-side room that may remain

CapturableRemaining
= portion that still appears usable after timing/path/friction constraints
~~~

However execution friction itself remains owned by TE gates.

Remaining Opportunity Lifecycle consumes those constraints; it does not duplicate their score.

## 12. Fresh Reset relationship to the lifecycle parent

Fresh Reset modifies the lifecycle state.

Example:

~~~text
broad wave age: 6 minutes
broad observed move: large

then:
20s controlled pullback
fast reclaim
new BID/MID acceleration
~~~

Without reset information, a pure age/consumption model may label the move MATURE.

With a validated renewal event:

~~~text
broad wave = old
local opportunity = renewed / young
~~~

Therefore Stage 17.C keeps Fresh Reset separately for now.

But it must later prove incremental value beyond:

~~~text
Fresh Market Repricing
+
Remaining Opportunity Lifecycle
~~~

If it does not, Stage 17.D/17.E should merge it into the lifecycle parent.

## 13. Provisional priority within Stage 17.C

### 1. Remaining Opportunity Lifecycle

Priority: VERY HIGH

Reason:

- closest concept to the project's actual objective;
- directly protects against late entry;
- combines progress consumption and time/lead consumption;
- can distinguish 'strong now' from 'still useful from now';
- naturally receives renewal information without confusing it with direction.

Main risk:

- it is a synthesis, not an independent raw information channel;
- poorly designed composition could simply re-score its own inputs;
- PotentialRemaining is hypothesis-driven until Issue #15/#11 validation.

### 2. Fresh Reset / Reclaim / Reacceleration

Priority: HIGH, CONDITIONAL

Reason:

- provides a concrete mechanism for a new local leg inside an older wave;
- can distinguish renewed opportunities from mature uninterrupted moves;
- may carry lifecycle information not captured by simple age/observed move.

Main risk:

- episodic coverage;
- highly dependent on segmentation/reference semantics;
- reacceleration overlaps Fresh Market Repricing;
- reclaim quality overlaps Clean Path / Progress Conversion;
- may collapse into Remaining Opportunity Lifecycle after empirical ablation.

### 3. Usable Lead / Opportunity Stage as independent slot

Decision:

~~~text
MERGE
~~~

It remains important, but inside Remaining Opportunity Lifecycle rather than as a separate core concept.

## 14. Why opportunity stage is not alpha

Labels such as:

~~~text
EARLY
CONFIRMED
MATURE
LATE
FAILING
~~~

describe where evidence sits in its lifecycle.

They do not create upward pressure by themselves.

Therefore OpportunityStage is primarily:

~~~text
timing / lateness / remaining-opportunity interpretation
~~~

not an independent directional predictor.

## 15. Why reset is not automatically positive

Do not encode:

~~~text
pullback happened
→ good reset
~~~

A valid renewal requires observable reclaim/reacceleration behavior.

A failed pullback can instead signal deterioration.

Fresh Reset should therefore contain states such as:

~~~text
NO_RESET
RESETTING
RECLAIMING
RENEWED_LEG
FAILED_RENEWAL
NOT_APPLICABLE
UNKNOWN
~~~

and only renewed states can modify remaining opportunity positively.

## 16. Falsification tests

### Test A — lifecycle synthesis vs raw strength

Compare:

~~~text
Fresh Market Repricing
vs
Fresh Market Repricing + Remaining Opportunity Lifecycle
~~~

Does lifecycle information improve future target-before-adverse / BID exitability after current strength is known?

If not, simplify aggressively.

### Test B — usable lead incremental value

Within similar current-state evidence, compare:

~~~text
high usable lead
vs
low / negative usable lead
~~~

If timing does not change outcomes or decision usefulness, demote the lead component.

### Test C — reset incremental value

Condition on comparable current repricing, conversion and path state.

Compare:

~~~text
renewed-after-reset
vs
uninterrupted continuation
~~~

If reset history adds no stable incremental value, merge it into lifecycle/explanation.

### Test D — renewal must re-age outcomes

Test whether a validated reset actually restores target feasibility / lowers lateness relative to equally old broad waves without reset.

### Test E — stage must not become circular

OpportunityStage must use only evidence available at decision time.

Future peak/future target success must never define EARLY/MATURE online.

### Test F — late-but-accurate penalty

A state that predicts direction only after most future BID upside is already consumed should fail the objective even if directional accuracy is high.

## 17. Decision table

| Old concept | Decision |
| --- | --- |
| Fresh Reset / Reclaim / Reacceleration | KEEP_CONDITIONAL_CORE_CANDIDATE |
| Move Consumption / Remaining Opportunity | MERGE_INTO_PARENT |
| Usable Lead / Opportunity Stage | MERGE_INTO_PARENT |
| Remaining Opportunity Lifecycle | KEEP_CORE_SYNTHESIS_CANDIDATE |
| OpportunityStage alone | TIMING / LIFECYCLE INTERPRETATION |

## 18. Provisional five concepts after Stage 17.C

~~~text
1. Fresh Market Repricing
2. Progress Conversion Efficiency
3. Clean Path / Adverse Efficiency
4. Fresh Reset / Renewal
5. Remaining Opportunity Lifecycle
~~~

Important:

These five do not all play the same architectural role.

~~~text
1 = current market repricing
2 = effort→progress conversion
3 = path-risk geometry
4 = conditional renewal event
5 = lifecycle / remaining-opportunity synthesis
~~~

Stage 17.D must now test whether concepts 3–5 deserve independent core positions or should be demoted/merged further.

## 19. Count progression

~~~text
original provisional list: 8
after 17.A: 7
after 17.B: 6
after 17.C: 5
~~~

This reaches the desired lower edge of the sparse-core range before cross-group elimination.

## 20. Stage boundary

Next:

> Stage 17.D only — perform cross-group elimination across the five provisional concepts, classify each as raw predictor / conditional predictor / protective modifier / synthesis, identify remaining double counting, and produce the provisional sparse core plus reserve/demoted concepts.

Do not yet define the empirical selection protocol; that remains Stage 17.E.
