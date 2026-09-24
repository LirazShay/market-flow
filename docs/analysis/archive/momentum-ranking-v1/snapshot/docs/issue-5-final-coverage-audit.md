# Issue #5 Final Coverage Audit

Date: 2026-09-23

## Purpose

Verify that every material concept preserved in `research-checkpoint.md` and `objective-alignment-audit.md` has either:

1. a primary owner in `feature-registry.md`; or
2. an explicit downstream GitHub Issue owner where the concept requires empirical research/composition rather than another online metric.

## Coverage map

| Research concern | Owner |
| --- | --- |
| Price / wave shape, speed, acceleration, age, LAST/MID agreement | PW |
| Activity, trade count/rate, turnover, participation expansion | AF |
| BID/ASK migration, L1 displayed pressure, LAST/quote geometry, buyer exitability | BD |
| Spread, tick, displayed-depth feasibility, latency, explicit costs | TE |
| Data integrity, freshness, semantics, temporal alignment, coverage | FQ |
| Directional efficiency, reversal/giveback, stall, effort→progress deterioration | PH |
| Pullback/retest/reset and path-relevant barrier lifecycle | PR |
| Observable family ordering, precursor lead, lateness, opportunity stage | SQ |
| Potential/consumption/target frontier/capturable remaining opportunity | RO |
| Recent same-stock capacity/failure/coverage/conditional memory | WM |
| Multi-horizon context, regime, transferability, decay, session/time-of-day | MR |
| Absolute-first cross-sectional comparison, percentile/rank context, rank-rise cause, async comparability | CS |
| Direct all-observation MFE/MAE/TimeToTarget/target-before-adverse/future-BID outcome surfaces, including `FutureBidVsEntryLastReturn` / `FutureBidVsEntryAskReturn` | Issue #15 |
| Activity/Book→Price conversion latency and signal opportunity half-life, including `ActivityToPriceConversionLatency`, `BookPressureToPriceConversionLatency`, `PressureConversionEfficiency`, `ProgressStallClock` and `SignalOpportunityHalfLife` | Issue #16 |
| Wave/leg segmentation and reference semantics | Issue #6 |
| Recent-wave recurrence/pattern similarity | Issue #7 |
| Deeper multi-horizon research | Issue #8 |
| Local regime/decay/conditional prior calibration | Issue #9 |
| CentralRanker composition, family weighting/gates, leader/challenger/hysteresis/ties/NO_OPPORTUNITY | Issue #10 |
| Leakage-safe validation, calibration, ablation, raw-vs-executable outcome evaluation | Issue #11 |
| L2 vs trade-tape data-gap decision | Issue #12 |
| Final architecture/specification and prediction-vs-execution integration | Issue #13 |

## Checkpoint-specific concerns

### Highs / breakout levels

Covered by PR-009..PR-013.

Candidate levels may include recent ~30/60/120s highs, wave high, leg high and daily/continuous high. A level is **not** a standalone signal. It only matters when it is inside or near the current short target path and then must pass clearance/acceptance/rejection logic.

### Exhaustion

Covered primarily by PH-007..PH-013 with PW/AF/BD inputs. Issue #16 later calibrates conversion-latency/stall timing. There is no separate duplicated “exhaustion score”.

### Normalization

- self-relative opportunity abnormality → CS-007;
- cross-sectional percentile → CS-006;
- time-of-day abnormality → MR-017;
- coverage/comparability → FQ/CS;
- final scalar normalization/composition → Issue #10.

### Family scores / confidence

Registry keeps Strength, Confidence, Coverage, Freshness and EvidenceDiversity conceptually separate. Final composition/weighting belongs to Issue #10 and calibration to Issue #11.

### Execution reality

Online/pre-entry ownership:
- TE → feasibility/friction;
- RO → CapturableRemaining / OpportunityBudget.

Empirical outcome ownership:
- Issue #11 → raw-market vs executable evaluation;
- Issue #15 → direct future target/adverse/touch-exit labels;
- Issue #12 → whether deeper book/tape is required;
- Issue #13 → final prediction-vs-execution architecture.

No additional online “execution alpha” family is warranted at this stage.

### Leader persistence / hysteresis

Not an online stock-feature family.

Issue #10 owns:
- LeaderExpiryState;
- HysteresisTimeBudget;
- ChallengerDominance;
- ChallengerAdvantageAfterUncertainty;
- LeaderRemainingBudget / LeaderDecayRate;
- SwitchValue;
- LeaderDominanceMargin;
- CLEAR_LEADER / SOFT_LEADER / EFFECTIVE_TIE / NO_ELIGIBLE_CANDIDATE semantics;
- pre-entry ranking switching vs post-entry position/execution switching.

### L2 / tape

Explicitly owned by Issue #12. Current registry remains truthful about L1 limitations and does not fabricate signed flow, deeper depth or exact event ordering.

## Final Issue #5 verdict

Every material checkpoint concept now has an explicit registry owner or downstream issue owner.

No important signal remains only as chat prose.

The registry also satisfies the deep-rationale contract and cross-family ownership/double-counting guard.

Therefore Issue #5 is ready to close.

The next research work should follow STATUS/ROADMAP order rather than extending the registry horizontally without a newly discovered gap.
