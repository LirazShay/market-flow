# Core Signal Prioritization Mini-Research Plan

Issue: #17
Date: 2026-09-23

## Goal

Prioritize the eight provisional predictive concepts gradually and reduce them to the smallest defensible predictive core.

This mini-research is intentionally split into multiple work units.

Do not produce one final ranking in a single pass.

## Hard design constraint

~~~text
preferred final directional core: 5–8 concepts
hard cap: 10
~~~

The current eight are hypotheses, not adopted signals.

A concept may end as:

~~~text
KEEP_CORE
KEEP_CONDITIONAL
MERGE_INTO_PARENT
DEMOTE_TO_CONTEXT
DEMOTE_TO_GATE
DROP
UNRESOLVED
~~~

## The eight provisional concepts

1. Fresh Price Impulse
2. BID / Quote Migration Strength
3. Activity-to-Price Conversion
4. Clean Path / Adverse Efficiency
5. Stall / Effort-to-Progress Deterioration
6. Fresh Reset / Reclaim / Reacceleration
7. Move Consumption / Remaining Opportunity
8. Usable Lead / Opportunity Stage

## Important separation

The mini-research ranks predictive / remaining-opportunity concepts only.

These remain outside the eight-slot competition:

~~~text
DataQuality
Freshness
ObservationAge / latency
Spread burden
Two-sided L1 availability
size/depth feasibility
explicit cost feasibility
~~~

They are trust/execution gates, not directional alpha.

## Common evaluation dimensions

Each concept will be evaluated against the same questions:

1. Directness to the exact objective.
2. Lead vs lag.
3. Mechanistic uniqueness.
4. Expected incremental information beyond already-retained concepts.
5. Falsifiability and semantic clarity.
6. Coverage / frequency of UNKNOWN.
7. Sensitivity to noise, stale quotes, bid-ask bounce or displayed-liquidity artifacts.
8. Lateness / move-consumption risk.
9. Dependency on blocked data such as canonical LAST, tape or L2.
10. Simplicity relative to alternatives.

Qualitative judgments such as VERY_HIGH / HIGH / MEDIUM / LOW are allowed for research prioritization.

Do not invent statistical scores before empirical validation.

## Stage 17.A — Direct market-motion pair

Research only:

1. Fresh Price Impulse
2. BID / Quote Migration Strength

Questions:

- Which is closer to the future sellable price path?
- Does BID migration add independent information beyond price impulse?
- Which one is leading and which one is confirming?
- Which child metrics should collapse into one parent concept?

Output:

~~~text
relationship map
provisional priority
merge/keep decision
key falsification tests
~~~

Do not analyze concepts 3–8 deeply in this stage.

## Stage 17.B — Participation and path-conversion trio

Research:

3. Activity-to-Price Conversion
4. Clean Path / Adverse Efficiency
5. Stall / Effort-to-Progress Deterioration

Questions:

- Is activity conversion genuinely leading or mainly confirmation?
- Are Clean Path and Stall independent ideas or phases of the same path-health concept?
- Which is closest to target-before-adverse rather than merely describing recent history?

Output:

~~~text
3-way relationship map
merge boundaries
provisional priority within concepts 3–5
~~~

## Stage 17.C — Renewal / remaining / timing trio

Research:

6. Fresh Reset / Reclaim / Reacceleration
7. Move Consumption / Remaining Opportunity
8. Usable Lead / Opportunity Stage

Questions:

- Are these predictors or higher-level interpretations of concepts 1–5?
- Which adds genuinely new information?
- Can one replace several lower-level concepts?
- Which mainly protects against late entry?

Output:

~~~text
3-way relationship map
input-vs-synthesis classification
provisional priority within concepts 6–8
~~~

## Stage 17.D — Cross-group elimination

Only after A–C:

- identify duplicated information channels;
- decide merge candidates;
- separate predictors from modifiers/syntheses;
- build a provisional sparse set.

Target output:

~~~text
provisional core: ideally 4–6 concepts
reserve candidates: at most 2–3
~~~

This is still not the empirically validated final model.

## Stage 17.E — Empirical-selection contract

Define how Issues #15/#11 later prove or reject the sparse candidates.

Must cover:

- direct outcome;
- horizons;
- individual out-of-sample value;
- incremental out-of-sample value;
- backward deletion;
- redundancy;
- lateness penalty;
- coverage;
- stability;
- smallest-model preference.

Only after this contract may empirical evidence promote the shortlist into the final predictive core.

## Working hypothesis to investigate, not assume

Several of the eight may not be independent:

~~~text
Fresh Price Impulse + Move Consumption
may form one fresh-usable-motion concept

Clean Path + Stall/Deterioration
may be complementary states of path conversion

Fresh Reset
may be a modifier of remaining opportunity

Usable Lead / Opportunity Stage
may be a lateness modifier rather than alpha
~~~

The mini-research must be willing to merge them.

## Collection cadence boundary

Do not solve extraction or polling cadence in Issue #17.

Issue #18 owns:

- extraction architecture;
- IndexedDB/export strategy;
- whether approximately 1-second polling is useful;
- provider load;
- cadence/jitter design.

Current principle:

> Prefer the slowest collection cadence that still preserves the information required by the final validated core and target horizons.

Technical ability to poll faster is not itself a reason to do so.

## Completion condition

Issue #17 completes only after:

1. stages A–D produce a small conceptual core;
2. stage E fixes the empirical elimination protocol;
3. final candidate predictive concepts are <=10 and preferably 5–8;
4. every demoted/dropped concept has a documented reason;
5. #10/#11 consume the sparse-core result rather than the full registry.
