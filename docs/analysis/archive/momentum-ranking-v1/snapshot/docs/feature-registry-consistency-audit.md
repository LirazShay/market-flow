# Feature Registry Consistency Audit

Date: 2026-09-23

Scope: all material registry entries present before Cross-Sectional / Relative Edge population.

## Audited families

- PW Price / Wave
- AF Activity / Flow
- BD Book / Directional Flow
- TE Tradability / Execution Preconditions
- FQ Freshness / Data Quality
- PH Path Quality / Wave Health
- PR Pullback / Retest / Micro-Barrier
- SQ Sequence / Lead-Lag / Opportunity Stage
- RO Remaining Opportunity / Target Frontier
- WM Recent Wave Memory / Capacity Prior
- MR Multi-Horizon / Local Regime / Session Context

Total audited entries: **158**.

## Documentation-contract result

Every material entry is expected to carry:

- Family
- Kind
- Raw sources
- Derivation
- Unit / shape
- Role
- Availability
- Evidence
- Decision role
- Meaning
- Plain-language intuition
- Market mechanism / why it can matter
- Objective connection
- Favorable / unfavorable interpretation
- Failure modes / counterexamples
- Relationship to other evidence
- Known overlaps
- Confidence limits
- Validation targets
- Research state
- worked example where useful

The audit found one systematic retrofit gap: **65 earlier entries** in PW, AF, BD-001..016, TE and FQ had received the deep-rationale fields but were missing the later-added **Decision role** field. The audit assigned it explicitly.

## Primary ownership / double-counting rules

### Current-leg observed move

`PW-009 CurrentLegObservedMovePct` is the primary measurement owner.

`PH-006 ProgressSinceRecentLowPct` may consume the shared leg/reset reference as path context, but is not an independently scored duplicate. Issue #6 still owns final shared leg/reference semantics.

### Price acceleration

`PW-004 PriceAccelerationState` owns raw acceleration.

`PR-006 PostRetestAccelerationState` owns only the contextual interpretation of acceleration specifically after reclaim/retest.

### Giveback

`PH-004 GiveBackPct` owns generic recent giveback.

`PR-013 PostBreakGiveBackPct` owns only barrier-specific post-break giveback context.

### Activity and effort-to-progress

AF owns raw executed activity: count, rate, quantity, monetary turnover and related participation state.

PH-009/010 own only the cross-family question of how efficiently that effort converts into useful price progress and whether that conversion is deteriorating.

### L1 depth

BD owns displayed Level-1 depth/pressure as market-state evidence.

TE-006/007 own only intended-size-specific entry/exit feasibility relative to displayed ASK/BID depth.

### Observation age

`FQ-002 PerSecurityObservationAgeSeconds` is the canonical owner.

`TE-009 ObservationLatencySeconds` is a consumer alias for execution feasibility and must not recompute a competing age.

### Technical trust

FQ owns freshness, semantic validity, temporal alignment, consistency and coverage.

Other families consume FQ outputs and must not create competing technical-trust definitions.

### Target frontier

`RO-008 TargetFeasibilityFrontier` owns the current target/time/adverse frontier.

`MR-018 RegimeConditionedTargetFeasibilityContext` may qualify/reshape that frontier only when regime-conditioned incremental value is empirically supported.

### Future outcomes

Realized MFE, MAE, TimeToTarget, WhichBarrierFirst and future-BID exitability labels belong to the Issue #15 / Issue #11 outcome-validation layer.

They may validate historical relationships but must never leak into online decision-time inputs.

### Recent memory

WM owns recent same-stock capacity/history as a conditional prior.

It is context for RemainingOpportunity/confidence, not a second directional-alpha vote.

## General rule

~~~text
shared raw input
!=
shared score ownership
~~~

A downstream contextual interpretation may reuse an upstream measurement, but the same underlying evidence must not receive multiple independent additive votes unless incremental out-of-sample value is demonstrated.

## Remaining intentional unresolved semantics

These are later research responsibilities rather than current ownership conflicts:

- canonical phase-aware LAST mapping;
- authoritative TASE tick-size rules;
- authoritative session/phase semantics;
- final wave/leg segmentation and shared reset-reference rules in Issue #6;
- pattern-similarity method in Issue #7;
- regime transfer/decay calibration in Issue #9/#16;
- direct outcome calibration in Issue #15/#11;
- L2/trade-tape dependency decision in Issue #12.

## Outcome

The existing registry is structurally consistent enough to resume feature-family population.

The next family should preserve:

~~~text
absolute opportunity
→ trust / feasibility eligibility
→ relative comparison
~~~

A high market percentile must never substitute for a good absolute opportunity.
