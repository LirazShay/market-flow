# AI Context — Momentum Ranking V1

Compact continuation context.

## Objective

Rank the dynamic TASE equity universe for the best **remaining executable short-horizon upside opportunity**, primarily seconds to about two minutes, with strong preference for useful speed.

This is a ranking problem first, not exact-price regression.

~~~text
92/100 != 92% probability
~~~

Probability may exist later only after empirical calibration.

## Architecture

~~~text
validated complete cycle
→ StockObserver per security
→ local state + recent session memory
→ StockCard
→ cross-sectional context
→ CentralRanker
→ leader / NO_OPPORTUNITY
→ later ExecutionEvaluator
~~~

## StockObserver responsibility

Derive and remember:

- price/wave direction, speed, acceleration, continuity, wave/leg age;
- trade/activity acceleration;
- volume/money flow and effort/result;
- L1 book direction/persistence;
- ASK↔LAST, BID↔LAST and MID↔LAST gaps;
- LAST position inside spread and its movement;
- path quality/noise/giveback;
- freshness/reconfirmation;
- exhaustion/pullback/retest state;
- recent wave memory and realized wave capacity;
- multi-horizon trend and local regime;
- data quality, coverage and confidence.

## CentralRanker responsibility

- use absolute quality plus relative cross-sectional rank;
- compare family-level evidence rather than double-count raw derivatives;
- separate Potential, Confirmation and RemainingOpportunity;
- apply trust/feasibility constraints: DataQuality, Freshness, Tradability;
- support leader persistence/challenger hysteresis;
- support NO_OPPORTUNITY.

## Critical data constraints

- dynamic universe; never hardcode count;
- canonical security id: String(PaperId or Key);
- collection is sequential across chunks, not an atomic market instant;
- prior verified full cycle was roughly five seconds in the tested setup;
- preserve null semantics;
- L1 may be missing;
- deeper L2-L5 fields existed in schema but were null in the previously tested equity snapshot;
- current snapshot feed cannot reconstruct true signed trade flow between observations.

## Evidence vocabulary

~~~text
Verified
Inferred
Hypothesis
Unknown
~~~

External literature must be separated into general evidence, US/Nasdaq evidence, TASE evidence and project-specific inference.

## Research management

Live next work item: read STATUS.json.

Master backlog: GitHub Issue #3.

Full recovery artifact:

~~~text
docs/research-checkpoint.md
~~~
