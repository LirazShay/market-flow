# Feature Registry — Momentum Ranking V1

This registry is the durable inventory of candidate inputs, derived features, states, gates and future labels used by the Momentum Ranking research.

It is intentionally built family-by-family. A feature is not considered "adopted" merely because it appears here; predictive value remains subject to later validation.

Evidence codes and role semantics are defined in:

~~~text
evidence-taxonomy.md
~~~

## Objective-alignment contract

Every candidate in this registry exists to support one narrow objective:

> select a capturable upward opportunity **from now**, preferably in seconds and with an outer research horizon around two minutes.

A feature is not useful merely because it describes a healthy stock, a strong daily trend or a conventional trading pattern.

Every future family/feature should be traceable to at least one decision role:

~~~text
Potential
Confirmation
RemainingOpportunity
PathRisk
Feasibility
Freshness/Trust
Context/Prior
Outcome
~~~

and must name an objective-aligned validation target such as target-before-adverse, TimeToTarget, MFE/MAE, detection lateness, usable lead time or execution-aware opportunity.

Longer-horizon negative trend is not an automatic veto. Relative percentile is not absolute opportunity. Historical wave capacity is a conditional prior, not a promise. Feasibility/trust families do not become bullish votes.

Before scoring or implementation, apply the durable audit in:

~~~text
objective-alignment-audit.md
~~~

---
## Registry schema

Every feature entry owns these fields:

| Field | Meaning |
|---|---|
| ID | Stable research identifier. IDs should not be silently reused for a different meaning. |
| Name | Human-readable canonical name. |
| Family | Single primary owner used to prevent double counting. |
| Kind | RAW / DERIVED / STATE / CONTEXT / GATE / LABEL. |
| Raw sources | Provider fields or upstream derived concepts required. |
| Derivation | Formula or semantic transformation; `TBD` when research is not yet sufficient. |
| Unit / shape | Percent, seconds, ticks, enum/state, vector/profile, etc. |
| Role | LEADING / CONFIRMING / LAGGING_CONTEXT / PROTECTIVE / GATE / CONTEXT / OUTCOME. |
| Availability | NOW / HISTORY / L2 / TAPE / EXEC / FUTURE. |
| Evidence | PV / TL / GL / PI / H / U, with scope notes where useful. |
| Meaning | What information the feature is intended to contribute. |
| Known overlaps | Features/families likely to carry related information. |
| Confidence limits | Conditions that make interpretation weak or invalid. |
| Validation targets | Explicit future outcomes against which usefulness should be tested. |
| Research state | Candidate / blocked / provisional / validated / rejected. |

## Ownership rule

A raw observation may support several concepts, but each scored concept must have one primary family owner.

Example:

~~~text
GiveBack may be computed from price history,
but its primary scored ownership can belong to Path/WaveHealth,
not Price + Path + Exhaustion simultaneously.
~~~

The final model should consume family-level evidence rather than summing every raw derivative.

---

# Family PW — Price / Wave

Purpose:

> Describe what price is doing now, how fast it is doing it, and whether the market-center movement confirms the trade-price movement.

This family does **not** own:
- path/noise quality;
- giveback penalties;
- exhaustion;
- breakout/level semantics;
- recent-wave recurrence;
- tradability.

Those concerns receive their own owners to prevent duplicate weighting.

## Provider-source note

The research uses a conceptual current trade-price abstraction called `LAST`.

Current project evidence identifies provider candidates including `LastKnownRate` and `ContinuousLastDealRate`, but this registry does **not** silently choose between them. The exact provider-to-`LAST` mapping must remain explicit and be verified against the provider-data semantics before implementation.

When valid BID1 and ASK1 exist:

~~~text
MID = (BID1 + ASK1) / 2
~~~

### PW-001 — TradePriceReturnProfile

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** validated `LAST` history + observation timestamps
- **Derivation:** parameterized return over candidate horizons; conceptually `(LAST_now / LAST_then - 1) * 100`
- **Unit / shape:** percent profile, candidate horizons around 5/10/20/30/60/120s
- **Role:** CONFIRMING, LAGGING_CONTEXT
- **Availability:** NOW
- **Evidence:** PV(input/history availability) + PI(derivation) + H(predictive value)
- **Meaning:** magnitude and direction of recent observed trade-price movement across several scales
- **Known overlaps:** PW-003, PW-004, PW-005; broader Multi-Horizon Trend family at longer horizons
- **Confidence limits:** bid-ask bounce; stale LAST; irregular elapsed time; sequential-cycle timing skew; provider `LAST` mapping must be explicit
- **Validation targets:** target-before-adverse, TimeToTarget, continuation, cross-sectional future rank
- **Research state:** Candidate

Important: the horizons are a **profile**, not independent votes.

### PW-002 — MidReturnProfile

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** BID1, ASK1, observation timestamps
- **Derivation:** compute valid MID per observation, then return profile across candidate horizons
- **Unit / shape:** percent profile
- **Role:** CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(BID/ASK availability where present) + PI + GL + H
- **Meaning:** movement of the market center, reducing dependence on LAST prints alone
- **Known overlaps:** PW-001, Book family BID/ASK migration features
- **Confidence limits:** UNKNOWN whenever either side required for MID is invalid; wide/unstable spreads can make MID behavior less economically useful
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Candidate

### PW-003 — RecentPriceSpeed

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** PW-001 and/or PW-002 + actual elapsed time
- **Derivation:** recent directional return normalized by actual elapsed seconds; final production mapping must be bounded/saturated rather than extrapolated linearly
- **Unit / shape:** percent per second as raw diagnostic; scored representation TBD
- **Role:** CONFIRMING
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** how quickly the current observed movement is occurring
- **Known overlaps:** PW-001; RemainingOpportunity/OpportunityVelocity
- **Confidence limits:** one-tick/illiquid jumps can create absurd raw speed; never extrapolate `%/sec × repeated cycles`
- **Validation targets:** TimeToTarget, short-horizon target hit, future rank
- **Research state:** Candidate

### PW-004 — PriceAccelerationState

- **Family:** Price / Wave
- **Kind:** STATE
- **Raw sources:** adjacent recent slices from PW-001/PW-002/PW-003
- **Derivation:** compare recent speed/progress with immediately preceding comparable slice(s); exact robust mapping TBD
- **Unit / shape:** state, e.g. ACCELERATING / STEADY / DECELERATING / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** whether the force of the current move appears to be strengthening or weakening now
- **Known overlaps:** PW-003; future Exhaustion family
- **Confidence limits:** requires enough temporally aligned observations; should not infer acceleration from two noisy prints
- **Validation targets:** continuation vs exhaustion, TimeToTarget, target-before-adverse
- **Research state:** Candidate

### PW-005 — RecencyConcentrationState

- **Family:** Price / Wave
- **Kind:** STATE
- **Raw sources:** PW-001/PW-002 multi-window profile
- **Derivation:** determine whether a meaningful share of the longer-window move occurred in the newest slice; avoid unstable division when longer-window move is near zero
- **Unit / shape:** state/profile, e.g. RECENTLY_CONCENTRATED / EVENLY_DISTRIBUTED / FRONT_LOADED / UNKNOWN
- **Role:** LEADING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes a fresh acceleration from a move that mostly happened earlier
- **Known overlaps:** PW-004, Freshness, RemainingOpportunity
- **Confidence limits:** no naive ratio near zero denominator; direction changes inside the window require explicit handling
- **Validation targets:** remaining opportunity, TimeToTarget, continuation
- **Research state:** Candidate

### PW-006 — PriceMidAgreementState

- **Family:** Price / Wave
- **Kind:** STATE
- **Raw sources:** PW-001, PW-002
- **Derivation:** compare recent LAST direction/shape with MID direction/shape
- **Unit / shape:** state, e.g. CONFIRMED_UP / LAST_ONLY_UP / MID_ONLY_UP / CONFLICTED / UNKNOWN
- **Role:** CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** distinguishes trade-price movement confirmed by market-center migration from potentially noisy LAST-only movement
- **Known overlaps:** Book Direction family
- **Confidence limits:** MID unavailable without valid L1; agreement is not causal proof
- **Validation targets:** target-before-adverse, low-MAE continuation, next MID direction
- **Research state:** Candidate

### PW-007 — WaveAgeSeconds

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** segmented wave start time
- **Derivation:** `now - currentWaveStart`
- **Unit / shape:** seconds
- **Role:** LAGGING_CONTEXT, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Meaning:** age of the broader currently identified wave
- **Known overlaps:** Freshness, RemainingOpportunity
- **Confidence limits:** blocked until Issue #6 defines wave segmentation unambiguously
- **Validation targets:** remaining opportunity, exhaustion, TimeToTarget
- **Research state:** Blocked by wave segmentation research

### PW-008 — LegAgeSeconds

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** segmented current leg start time
- **Derivation:** `now - currentLegStart`
- **Unit / shape:** seconds
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Meaning:** distinguishes an old broad wave from a fresh post-pullback leg
- **Known overlaps:** PW-007, Pullback/Retest family, Freshness
- **Confidence limits:** blocked until leg/wave segmentation semantics are defined
- **Validation targets:** remaining opportunity, continuation after retest
- **Research state:** Blocked by wave segmentation research

### PW-009 — CurrentLegObservedMovePct

- **Family:** Price / Wave
- **Kind:** DERIVED
- **Raw sources:** segmented leg start price + current valid price abstraction
- **Derivation:** return from current leg start to now
- **Unit / shape:** percent
- **Role:** CONFIRMING, LAGGING_CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Meaning:** how much of the current leg has already been observed/consumed
- **Known overlaps:** RemainingOpportunity, recent realized wave capacity
- **Confidence limits:** depends on Issue #6 segmentation and canonical reference-price choice
- **Validation targets:** remaining opportunity, target feasibility, exhaustion
- **Research state:** Blocked by wave segmentation research

### PW-010 — PriceWaveState

- **Family:** Price / Wave
- **Kind:** STATE
- **Raw sources:** PW-001 through PW-009 where available
- **Derivation:** interpretable lifecycle synthesis; provisional states include QUIET / AWAKENING / BUILDING / ACCELERATING / STRONG / SLOWING / REVERSING / UNDETERMINED
- **Unit / shape:** enum/state + strength/confidence
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW + HISTORY for full semantics
- **Evidence:** PI + H
- **Meaning:** family-level summary consumed by higher-level opportunity logic rather than summing overlapping price features independently
- **Known overlaps:** Sequence, Exhaustion, Pullback/Retest
- **Confidence limits:** state thresholds/mapping are provisional until validation; unavailable dependencies must reduce coverage rather than become zero
- **Validation targets:** continuation/exhaustion, target-before-adverse, cross-sectional future rank
- **Research state:** Provisional composite

---

## Price / Wave double-counting guard

The final model should **not** receive all of these as independent additive votes.

Preferred flow:

~~~text
PW-001..PW-009
→ Price/Wave interpretation
→ PW-010 PriceWaveState
→ family Strength + Confidence + Coverage
→ higher-level model
~~~

Raw profiles remain available for diagnostics, research and later empirical models.

# Family AF — Activity / Flow

Purpose:

> Describe how much executed market activity is occurring, whether participation is expanding or contracting, and how quickly that activity regime is changing.

This family is deliberately **direction-agnostic** by itself. High activity means that something is happening; direction must come from Price/Wave, Book/Directional Flow and sequence/context.

This family does **not** own:
- price response;
- buyer/seller aggressor classification;
- book pressure;
- effort-vs-result exhaustion conclusions;
- exact inter-trade durations without trade tape.

## Provider-source semantics

Verified project documentation currently gives:

~~~text
DailyDealsQuantity = cumulative number of trades today
DailyTurnover      = cumulative quantity traded today
DailyNISRevenue    = cumulative monetary turnover today
LastDealVolume     = quantity in latest trade; nullable in measured snapshot
~~~

For short-window features, deltas are valid only across observations that belong to the same compatible session/epoch and pass monotonicity/reset checks.

A negative cumulative delta is **not** valid negative activity; it indicates reset/session/schema/data-integrity handling is required.

### AF-001 — TradeCountDeltaProfile

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** `DailyDealsQuantity` history + observation timestamps
- **Derivation:** cumulative-count difference across candidate windows, with session/reset validation
- **Unit / shape:** trade-count profile; candidate horizons around 5/10/20/30/60/120s
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI(derivation) + H(predictive value)
- **Meaning:** how many executions occurred during recent windows
- **Known overlaps:** AF-002, AF-003, AF-004
- **Confidence limits:** sampling windows are approximate to actual observation times; multiple unseen trades occur between snapshots; valid zero differs from missing/reset
- **Validation targets:** TimeToTarget, target-before-adverse, continuation, cross-sectional future rank
- **Research state:** Candidate

Important: overlapping windows are a **profile**, not independent additive votes.

### AF-002 — TradeRateProfile

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** AF-001 + actual elapsed time
- **Derivation:** `tradeCountDelta / elapsedSeconds`
- **Unit / shape:** trades per second profile
- **Role:** LEADING, CONFIRMING
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** converts recent trade count into an elapsed-time-aware activity rate
- **Known overlaps:** AF-001, AF-003
- **Confidence limits:** short intervals are quantized by collector cadence; rate does not reveal direction or individual trade timing
- **Validation targets:** short-horizon target hit, TimeToTarget, continuation
- **Research state:** Candidate

### AF-003 — TradeRateAccelerationState

- **Family:** Activity / Flow
- **Kind:** STATE
- **Raw sources:** adjacent comparable slices from AF-001/AF-002
- **Derivation:** compare current trade rate with immediately preceding comparable interval(s); exact robust thresholds TBD
- **Unit / shape:** ACCELERATING / STEADY / DECELERATING / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** detects whether executed activity itself is waking up or cooling down
- **Known overlaps:** AF-004; Sequence family
- **Confidence limits:** requires enough aligned observations; a single burst may be transient; high acceleration is not directional
- **Validation targets:** target-before-adverse, TimeToTarget, continuation/exhaustion transition
- **Research state:** Candidate

### AF-004 — ActivityBurstState

- **Family:** Activity / Flow
- **Kind:** STATE
- **Raw sources:** AF-001/AF-002/AF-003 + cross-sectional normalization
- **Derivation:** identify a fresh material increase in executed activity relative to immediately preceding local windows and current market cross-section; exact mapping TBD
- **Unit / shape:** DORMANT / NORMAL / WAKING / BURSTING / HIGH_ACTIVITY / COOLING / UNKNOWN
- **Role:** LEADING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** interpretable activity-regime state rather than a raw trade-count threshold
- **Known overlaps:** AF-003, future self-normalization/time-of-day context
- **Confidence limits:** without historical self-baseline, “unusual for this stock at this hour” cannot yet be claimed; market-wide bursts require relative context
- **Validation targets:** opportunity onset, future rank, TimeToTarget
- **Research state:** Provisional state

### AF-005 — TurnoverQuantityDeltaProfile

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** `DailyTurnover` history + timestamps
- **Derivation:** cumulative traded-quantity difference across validated windows
- **Unit / shape:** provider quantity units per window
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + H
- **Meaning:** measures how much inventory/quantity actually changed hands recently
- **Known overlaps:** AF-001, AF-006, AF-007
- **Confidence limits:** raw quantity is not directly comparable across securities without normalization; session/reset checks required
- **Validation targets:** target-before-adverse, TimeToTarget, continuation
- **Research state:** Candidate

### AF-006 — MoneyTurnoverDeltaProfile

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** `DailyNISRevenue` history + timestamps
- **Derivation:** cumulative monetary-turnover difference across validated windows
- **Unit / shape:** provider monetary units per window
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + H
- **Meaning:** measures recent economic value of executed activity, complementing trade count and raw quantity
- **Known overlaps:** AF-001, AF-005, AF-007
- **Confidence limits:** absolute money flow differs greatly by security size/liquidity; needs cross-sectional and later self/time-of-day normalization
- **Validation targets:** target-before-adverse, TimeToTarget, future rank
- **Research state:** Candidate

### AF-007 — AverageExecutedQuantityPerTrade

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** AF-001 + AF-005
- **Derivation:** `turnoverQuantityDelta / tradeCountDelta` when `tradeCountDelta > 0`
- **Unit / shape:** quantity per trade
- **Role:** CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes many smaller executions from fewer larger executions within the sampled window
- **Known overlaps:** AF-001, AF-005; `LastDealVolume`
- **Confidence limits:** arithmetic mean can be dominated by one large trade; impossible when no trades occurred; does not reveal the distribution of individual trade sizes
- **Validation targets:** continuation, path quality, target-before-adverse
- **Research state:** Candidate

### AF-008 — ParticipationExpansionState

- **Family:** Activity / Flow
- **Kind:** STATE
- **Raw sources:** AF-003, AF-005, AF-006 and their recent changes
- **Derivation:** synthesize whether trade frequency, quantity and monetary turnover are expanding together, diverging or cooling; exact mapping TBD
- **Unit / shape:** EXPANDING / COUNT_LED / SIZE_LED / MIXED / CONTRACTING / UNKNOWN
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** asks whether the activity burst is broad-based across several executed-activity dimensions rather than visible in one counter only
- **Known overlaps:** AF-003..AF-007; future EvidenceDiversity logic
- **Confidence limits:** count/quantity/money are correlated and must not be treated as three independent votes; direction remains unknown without other families
- **Validation targets:** opportunity onset, TimeToTarget, target-before-adverse
- **Research state:** Provisional composite

### AF-009 — LastDealVolumeContext

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** `LastDealVolume` + recent quantity/trade context where available
- **Derivation:** contextualize latest trade quantity relative to recent sampled executed quantity/trade-size measures; exact robust reference TBD
- **Unit / shape:** relative/contextual value or state
- **Role:** CONTEXT, CONFIRMING
- **Availability:** NOW
- **Evidence:** PV(field meaning + partial availability) + PI + H
- **Meaning:** captures whether the latest reported trade is small/typical/large relative to recent local activity
- **Known overlaps:** AF-007; future Book/Execution features
- **Confidence limits:** measured coverage was partial; latest-trade timestamp alignment to the snapshot must be respected; one print alone is weak evidence
- **Validation targets:** continuation, target-before-adverse
- **Research state:** Candidate / lower confidence

### AF-010 — TrueInterTradeDurationProfile

- **Family:** Activity / Flow
- **Kind:** DERIVED
- **Raw sources:** transaction-by-transaction timestamps
- **Derivation:** exact durations between consecutive trades
- **Unit / shape:** seconds/milliseconds profile
- **Role:** LEADING, CONTEXT
- **Availability:** TAPE
- **Evidence:** U(project availability) + GL + H
- **Meaning:** true event-time pulse of executions, distinct from snapshot-based trade-rate proxies
- **Known overlaps:** AF-002, AF-003
- **Confidence limits:** cannot be reconstructed from cumulative counters plus sparse snapshots; must not be faked from current collector cadence
- **Validation targets:** opportunity onset, TimeToTarget, event-time continuation
- **Research state:** Blocked pending trade tape

### AF-011 — ActivityFlowState

- **Family:** Activity / Flow
- **Kind:** STATE
- **Raw sources:** AF-001 through AF-009 where valid
- **Derivation:** family-level synthesis; candidate states DORMANT / NORMAL / WAKING / ACCELERATING / EXPANDING / HIGH_ACTIVITY / COOLING / UNDETERMINED
- **Unit / shape:** enum/state + Strength/Confidence/Coverage
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** single family-level representation used by higher-level opportunity logic instead of independently summing correlated activity measures
- **Known overlaps:** Sequence, cross-sectional normalization, future regime/self-baseline context
- **Confidence limits:** does not determine direction; high activity can accompany either continuation or reversal; unavailable fields reduce coverage rather than becoming zero
- **Validation targets:** target-before-adverse, TimeToTarget, future rank, opportunity onset
- **Research state:** Provisional composite

---

## Activity / Flow ownership boundary

This family owns **executed-activity intensity and its change**.

It does not own the conclusion:

~~~text
high effort + poor price progress = exhaustion
~~~

because that conclusion requires Price/Wave information. The raw Activity side of that comparison comes from this family; the cross-family interpretation belongs to the future WaveHealth/Exhaustion owner.

Likewise, AF-001/AF-005/AF-006 are related measures. Their agreement may strengthen family confidence, but they must not become three independent additive votes in the final ranking.

Preferred flow:

~~~text
AF-001..AF-009
→ AF-011 ActivityFlowState
→ family Strength + Confidence + Coverage
→ cross-family sequence/confirmation logic
~~~

# Family BD — Book / Directional Flow

Purpose:

> Describe how the best displayed bid/ask are moving, where the latest trade sits relative to them, and whether persistent L1 behavior leans upward, downward or remains conflicted.

This family works with **displayed L1 evidence**. It does not claim true signed order flow from the current snapshot feed.

## Provider-source semantics

Verified project documentation currently gives:

~~~text
BuyLimit1   = BID1 price
SellLimit1  = ASK1 price
BuyVolume1  = displayed quantity at BID1
SellVolume1 = displayed quantity at ASK1
~~~

Measured coverage was partial, so all L1-dependent features are nullable/UNKNOWN when required inputs are invalid.

Critical interpretation rule:

~~~text
Δ displayed queue != executed flow
~~~

A decrease in displayed quantity may reflect execution, cancellation or quote replacement. An increase may reflect new displayed liquidity or replacement. Without event-level order messages/trade tape, do not infer exact participant intent or aggressor flow from queue changes alone.

The conceptual `LAST` abstraction remains explicit. For continuous-trading trade-location features, `ContinuousLastDealRate` is a provider candidate because its documented meaning is the last continuous-session trade rate; final implementation must still define the canonical phase-aware mapping rather than silently mixing it with `LastKnownRate`.

### BD-001 — BestBidMoveProfile

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** `BuyLimit1` history + timestamps
- **Derivation:** price change/return of valid BID1 across recent observation windows
- **Unit / shape:** price/percent profile
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + GL + H
- **Meaning:** detects whether the best displayed buyer level is chasing upward, holding or retreating
- **Known overlaps:** BD-003, PW-002 MID movement
- **Confidence limits:** BID1 can disappear or jump because displayed liquidity changes; invalid/zero quote must not be treated as a real price
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Candidate

### BD-002 — BestAskMoveProfile

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** `SellLimit1` history + timestamps
- **Derivation:** price change/return of valid ASK1 across recent observation windows
- **Unit / shape:** price/percent profile
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + GL + H
- **Meaning:** detects whether the best displayed seller level is moving upward, holding or retreating downward
- **Known overlaps:** BD-003, PW-002 MID movement
- **Confidence limits:** quote movement is observable behavior, not proof of seller intention
- **Validation targets:** next MID direction, target-before-adverse, continuation/exhaustion
- **Research state:** Candidate

### BD-003 — QuoteMigrationState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-001, BD-002
- **Derivation:** classify the joint movement of BID1 and ASK1
- **Unit / shape:** candidate states such as BID_CHASING / ASK_RETREATING / WHOLE_BOOK_UP / WHOLE_BOOK_DOWN / COMPRESSION / EXPANSION / STABLE / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** preserves **who moved** rather than reducing every change to a spread change
- **Known overlaps:** PW-002 MID movement; future Tradability spread-state features
- **Confidence limits:** compression is ambiguous unless its cause is retained; same final spread can result from opposite market behaviors
- **Validation targets:** next MID direction, target-before-adverse, TimeToTarget
- **Research state:** Candidate

### BD-004 — L1QueueImbalance

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** `BuyVolume1`, `SellVolume1`
- **Derivation:** candidate normalized form `(BuyVolume1 - SellVolume1) / (BuyVolume1 + SellVolume1)` when both quantities are valid and denominator > 0
- **Unit / shape:** bounded ratio in approximately [-1, +1]
- **Role:** LEADING, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(input availability) + GL + H
- **Meaning:** summarizes displayed top-of-book quantity asymmetry
- **Known overlaps:** BD-005, BD-008
- **Confidence limits:** displayed quantity is not participant count, commitment or guaranteed executable liquidity; one snapshot can be spoofed/cancelled/temporary; predictive value may depend on tick regime
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Candidate

### BD-005 — MicropriceTilt

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** BID1, ASK1, BuyVolume1, SellVolume1
- **Derivation:** candidate microprice `(ASK1*BuyVolume1 + BID1*SellVolume1)/(BuyVolume1+SellVolume1)`; tilt measured relative to MID and/or spread
- **Unit / shape:** price plus normalized tilt
- **Role:** LEADING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** expresses how displayed L1 quantity imbalance shifts a queue-weighted reference inside the spread
- **Known overlaps:** BD-004 by construction; PW-002
- **Confidence limits:** highly redundant with queue imbalance; should not receive an independent full vote; invalid when required L1 fields are unavailable or spread is not valid
- **Validation targets:** next MID direction, target-before-adverse
- **Research state:** Candidate / redundancy-sensitive

### BD-006 — BidDisplayedDepthPersistence

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** `BuyVolume1`, BID1 history
- **Derivation:** characterize whether meaningful displayed BID1 quantity persists while price/book evolves; exact persistence semantics TBD
- **Unit / shape:** PERSISTENT / TRANSIENT / REBUILDING / WEAKENING / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes a one-frame large bid from displayed support that survives/reappears across observations
- **Known overlaps:** BD-004, BD-008
- **Confidence limits:** persistence across ~snapshot intervals is not order identity; cancellations/replacements cannot be reconstructed
- **Validation targets:** target-before-adverse, low-MAE continuation, breakdown
- **Research state:** Candidate

### BD-007 — AskDisplayedDepthPersistence

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** `SellVolume1`, ASK1 history
- **Derivation:** characterize persistence/replenishment/weakening of displayed ASK1 quantity across observations; exact semantics TBD
- **Unit / shape:** PERSISTENT / TRANSIENT / REPLENISHING / WEAKENING / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes a one-frame ask quantity from a repeatedly displayed seller-side quantity pattern
- **Known overlaps:** BD-004, BD-008, future Exhaustion
- **Confidence limits:** apparent replenishment between snapshots is only a pattern, not proof of iceberg/absorption or seller identity
- **Validation targets:** continuation/exhaustion, target-before-adverse, breakout acceptance
- **Research state:** Candidate

### BD-008 — DisplayedPressurePersistenceState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-004, BD-006, BD-007 plus quote migration
- **Derivation:** synthesize whether displayed top-of-book pressure persistently leans upward/downward or remains unstable/conflicted
- **Unit / shape:** UP_LEAN / DOWN_LEAN / BALANCED / CONFLICTED / UNSTABLE / UNKNOWN
- **Role:** LEADING, CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** family-level displayed-pressure evidence that requires persistence rather than a single queue snapshot
- **Known overlaps:** BD-004..BD-007
- **Confidence limits:** still displayed liquidity only; does not equal signed executed flow
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Provisional composite

### BD-009 — AskLastGapPct

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** valid ASK1 + canonical phase-aware `LAST`
- **Derivation:** `(ASK1 - LAST) / LAST * 100`
- **Unit / shape:** percent
- **Role:** CONTEXT, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** measures the economic distance between the latest trade and current best displayed ask
- **Known overlaps:** BD-012, spread/tradability
- **Confidence limits:** gap size alone is ambiguous; a wide gap may mean poor spread rather than “room to rise”; interpretation requires cause/dynamics
- **Validation targets:** TimeToTarget, target-before-adverse, continuation
- **Research state:** Candidate

### BD-010 — LastBidGapPct

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** canonical phase-aware `LAST` + valid BID1
- **Derivation:** `(LAST - BID1) / LAST * 100`
- **Unit / shape:** percent
- **Role:** CONTEXT, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** measures the economic distance between the latest trade and current best displayed bid
- **Known overlaps:** BD-012, spread/tradability
- **Confidence limits:** value alone is not directional proof; stale trade price can sit outside the current spread
- **Validation targets:** target-before-adverse, breakdown/continuation
- **Research state:** Candidate

### BD-011 — MidLastGapPct

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** MID from valid BID1/ASK1 + canonical phase-aware `LAST`
- **Derivation:** `(MID - LAST) / LAST * 100`
- **Unit / shape:** signed percent
- **Role:** CONTEXT, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** describes whether the latest trade lies above or below the current quote midpoint and by how much
- **Known overlaps:** BD-012; PW-006 PriceMidAgreement
- **Confidence limits:** current snapshot is not transaction-level synchronized trade/quote data; do not treat this as exact aggressor classification
- **Validation targets:** next MID direction, target-before-adverse
- **Research state:** Candidate

### BD-012 — LastSpreadPosition

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** BID1, ASK1, canonical phase-aware `LAST`
- **Derivation:** `(LAST - BID1) / (ASK1 - BID1)` when the spread is valid and positive
- **Unit / shape:** normalized spread position; ordinary in-spread values around 0=BID, 0.5=MID, 1=ASK
- **Role:** CONFIRMING, CONTEXT
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** compact representation of where the latest trade lies relative to the current displayed spread
- **Known overlaps:** BD-009, BD-010, BD-011
- **Confidence limits:** values may fall outside [0,1] when the quote moved after the latest trade; that is informative timing/context, not something to clamp silently; no exact trade-sign claim
- **Validation targets:** next MID direction, continuation, target-before-adverse
- **Research state:** Candidate

### BD-013 — LastSpreadPositionVelocity

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** BD-012 history + observation times
- **Derivation:** direction/rate of movement of LAST's normalized position inside the spread across valid observations
- **Unit / shape:** normalized-position change per time plus trend state
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** detects whether recent trades are migrating toward ASK or toward BID rather than using one static location
- **Known overlaps:** BD-014, PW-001 trade-price movement
- **Confidence limits:** must retain concurrent quote movement; position can change because LAST moved, quotes moved, or both
- **Validation targets:** next MID direction, target-before-adverse, continuation/exhaustion
- **Research state:** Candidate

### BD-014 — LastQuoteGapDynamicsState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-001, BD-002, BD-009..BD-013 and `LAST` movement
- **Derivation:** classify **why** LAST-to-quote geometry is changing rather than scoring gap contraction alone
- **Unit / shape:** candidate states LAST_CHASING_ASK / ASK_RETREATING_TO_LAST / LAST_FALLING_TO_BID / BID_CHASING_LAST / WHOLE_STRUCTURE_UP / WHOLE_STRUCTURE_DOWN / CONFLICTED / UNKNOWN
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes buyer-side advance from seller-side ask retreat even when both numerically shrink `ASK-LAST`
- **Known overlaps:** BD-003, BD-013, PW-004 acceleration
- **Confidence limits:** observable price-path interpretation only; labels must not be phrased as participant intention
- **Validation targets:** next MID direction, TimeToTarget, target-before-adverse, continuation
- **Research state:** Candidate

### BD-015 — TradeLocationTrendState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-011/BD-012/BD-013 over several observations
- **Derivation:** synthesize whether latest-trade location persistently leans toward ASK, BID, center or oscillates
- **Unit / shape:** ASK_LEAN / BID_LEAN / CENTERED / MIGRATING_UP / MIGRATING_DOWN / CONFLICTED / UNKNOWN
- **Role:** CONFIRMING, CONTEXT, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** a safer snapshot-based directional-pressure proxy than pretending to classify every unseen trade
- **Known overlaps:** BD-012..BD-014
- **Confidence limits:** sparse observations miss individual prints; cannot reconstruct true signed trade flow
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Candidate

### BD-016 — L1DirectionalFlowState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-003, BD-008, BD-014, BD-015 plus PW-006/AF-011 as optional confirmation context
- **Derivation:** family-level synthesis of quote migration, persistent displayed pressure and trade-location trend
- **Unit / shape:** UPWARD_FLOW / DOWNWARD_FLOW / BALANCED / CONFLICTED / UNKNOWN + Strength/Confidence/Coverage
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + GL + H
- **Meaning:** best available L1 directional-pressure summary from current data without mislabeling it true signed order flow
- **Known overlaps:** Sequence, Price/Wave confirmation, future trade-tape flow
- **Confidence limits:** low confidence when only one evidence subtype is available; quote generation can be large relative to executed activity; disagreement across price/activity/book should remain visible
- **Validation targets:** next MID direction, target-before-adverse, TimeToTarget, future cross-sectional rank
- **Research state:** Provisional composite

---

## Book / Directional Flow ownership boundary

This family owns **L1 quote movement, displayed pressure, and trade location relative to L1**.

It does not own:

- spread-cost/tradability penalties;
- true signed trade flow;
- execution queue position;
- deeper-book pressure;
- claims of spoofing, iceberg or participant intent;
- exhaustion conclusions that require effort-vs-price-progress evidence.

Important causality guard:

~~~text
same gap change != same market story
~~~

Example:

~~~text
ASK-LAST shrinks because LAST ↑ while ASK holds
!=
ASK-LAST shrinks because ASK ↓ while LAST holds
~~~

The final model should consume BD-016 plus explicit conflict/confidence context rather than summing BD-004, BD-005, BD-009..BD-015 as independent votes.

Preferred flow:

~~~text
L1 prices/volumes + LAST geometry
→ BD-001..BD-015
→ BD-016 L1DirectionalFlowState
→ family Strength + Confidence + Coverage
→ cross-family sequence/confirmation logic
~~~

# Family TE — Tradability / Execution Preconditions

Purpose:

> Determine whether an otherwise attractive market opportunity is observable and practically usable enough to remain eligible for ranking/execution evaluation.

This family is intentionally separated from directional Book evidence. A narrow spread or deep L1 does **not** mean price will rise; it only affects feasibility and friction.

It also remains parameterizable. Security-level opportunity research should not hardcode one account size, broker fee schedule or execution policy.

## Core separation

~~~text
MarketOpportunity
!=
ExecutionFeasibility
!=
NetExecutableOpportunity
~~~

This family primarily owns the second term.

### TE-001 — SpreadPct

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** valid BID1, ASK1
- **Derivation:** candidate canonical form `(ASK1 - BID1) / MID * 100` when MID is valid and positive
- **Unit / shape:** percent
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(L1 semantics/coverage) + PI
- **Meaning:** economic width of the currently displayed best spread relative to market-center price
- **Known overlaps:** BD-003 compression/expansion; TE-005/TE-006
- **Confidence limits:** displayed spread is not full realized execution cost; no L1 side means UNKNOWN rather than infinite/zero spread
- **Validation targets:** executable opportunity after friction, fill/slippage outcomes, target-before-adverse after execution
- **Research state:** Candidate

### TE-002 — SpreadStabilityState

- **Family:** Tradability / Execution Preconditions
- **Kind:** STATE
- **Raw sources:** TE-001 + BID1/ASK1 history
- **Derivation:** characterize whether spread remains stable, widens, narrows or oscillates materially across recent observations
- **Unit / shape:** STABLE / NARROWING / WIDENING / UNSTABLE / UNKNOWN
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI + H
- **Meaning:** distinguishes a currently narrow spread that is persistent from one that is flickering or rapidly deteriorating
- **Known overlaps:** BD-003 QuoteMigrationState
- **Confidence limits:** must preserve the cause of spread change in Book family; this feature owns feasibility impact, not directional meaning
- **Validation targets:** execution slippage, fill quality, executable target-before-adverse
- **Research state:** Candidate

### TE-003 — TickSize

- **Family:** Tradability / Execution Preconditions
- **Kind:** CONTEXT
- **Raw sources:** authoritative TASE/security tick-size schedule or another verified market-structure source
- **Derivation:** lookup by security/price regime according to the authoritative rule in force
- **Unit / shape:** price units
- **Role:** CONTEXT, GATE
- **Availability:** FUTURE
- **Evidence:** U(current project source)
- **Meaning:** minimum legal price increment needed to interpret one-tick movement and spread granularity
- **Known overlaps:** TE-004, TE-005
- **Confidence limits:** no verified tick-size source currently exists in the repository; do not infer canonical tick size from a few observed quote differences
- **Validation targets:** spread burden, one-tick jump artifacts, executable opportunity
- **Research state:** Blocked pending authoritative tick-size source

### TE-004 — TickPct

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** TE-003 + valid reference price
- **Derivation:** `TickSize / referencePrice * 100`
- **Unit / shape:** percent
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + U(source dependency)
- **Meaning:** economic size of one legal tick for this security at the current price
- **Known overlaps:** TE-005, PW-003 one-tick speed artifacts
- **Confidence limits:** blocked until TE-003 is verified; reference-price convention must be explicit
- **Validation targets:** price-noise interpretation, executable opportunity
- **Research state:** Blocked by TE-003

### TE-005 — SpreadTicks

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** valid BID1/ASK1 + TE-003
- **Derivation:** `(ASK1 - BID1) / TickSize` with validity/tolerance rules
- **Unit / shape:** ticks
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + U(source dependency)
- **Meaning:** describes spread granularity in market-structure terms, complementary to SpreadPct
- **Known overlaps:** TE-001, TE-004
- **Confidence limits:** blocked until tick size is verified; should not replace SpreadPct because economic and tick burdens answer different questions
- **Validation targets:** executable opportunity, slippage/fill quality
- **Research state:** Blocked by TE-003

### TE-006 — EntrySizeToAskDepthRatio

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** intended execution quantity + valid `SellVolume1`
- **Derivation:** `intendedQty / SellVolume1`
- **Unit / shape:** ratio
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** EXEC
- **Evidence:** PV(ASK1 displayed quantity semantics) + PI + H
- **Meaning:** how large a contemplated aggressive entry is relative to currently displayed best-ask quantity
- **Known overlaps:** Book displayed-depth features; future L2 execution analysis
- **Confidence limits:** displayed depth can cancel/change; ratio <= 1 does not guarantee fill; ratio > 1 gives no information about prices beyond ASK1 without L2
- **Validation targets:** fill ratio, entry slippage, implementation shortfall
- **Research state:** Candidate for ExecutionEvaluator

### TE-007 — ExitSizeToBidDepthRatio

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** intended execution quantity + valid `BuyVolume1`
- **Derivation:** `intendedQty / BuyVolume1`
- **Unit / shape:** ratio
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** EXEC
- **Evidence:** PV(BID1 displayed quantity semantics) + PI + H
- **Meaning:** how large a contemplated aggressive exit is relative to currently displayed best-bid quantity
- **Known overlaps:** Book displayed-depth features; future L2 execution analysis
- **Confidence limits:** displayed L1 is not guaranteed liquidity and does not reveal deeper exit prices
- **Validation targets:** exit slippage, fill ratio, adverse execution
- **Research state:** Candidate for ExecutionEvaluator

### TE-008 — TwoSidedL1Availability

- **Family:** Tradability / Execution Preconditions
- **Kind:** GATE
- **Raw sources:** validated BID1/ASK1 availability
- **Derivation:** TRUE only when both required sides are currently valid executable-like quotes under domain validation; otherwise FALSE/UNKNOWN with reason
- **Unit / shape:** gate + reason
- **Role:** GATE
- **Availability:** NOW
- **Evidence:** PV
- **Meaning:** prevents spread/depth/execution assumptions when one or both L1 sides are unavailable/invalid
- **Known overlaps:** DataQuality coverage
- **Confidence limits:** presence of two quotes does not itself imply sufficient liquidity
- **Validation targets:** data/execution eligibility
- **Research state:** Candidate

### TE-009 — ObservationLatencySeconds

- **Family:** Tradability / Execution Preconditions
- **Kind:** CONTEXT
- **Raw sources:** FQ-002 PerSecurityObservationAgeSeconds
- **Derivation:** consume the primary freshness-owned observation age as an execution-feasibility input
- **Unit / shape:** seconds
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(sequential collection constraint) + PI
- **Meaning:** execution-feasibility view of per-security observation age
- **Known overlaps:** FQ-002
- **Confidence limits:** primary ownership belongs to FQ-002; TE must not independently recompute a competing age
- **Validation targets:** ranking correctness under cycle skew, executable opportunity
- **Research state:** Consumer alias of FQ-002

### TE-010 — DecisionLatencySeconds

- **Family:** Tradability / Execution Preconditions
- **Kind:** CONTEXT
- **Raw sources:** signal/observation time, rank-decision time and later order-submit time where available
- **Derivation:** elapsed latency along the system decision path
- **Unit / shape:** seconds
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** NOW for observation→ranking; EXEC for order-submit/fill phases
- **Evidence:** PI
- **Meaning:** measures how much time is consumed before an opportunity can be acted on
- **Known overlaps:** TE-009, Freshness
- **Confidence limits:** future end-to-end values require real execution telemetry
- **Validation targets:** observable horizon feasibility, implementation shortfall
- **Research state:** Candidate

### TE-011 — LatencyToHorizonRatio

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** FQ-002/TE-010 + candidate opportunity horizon
- **Derivation:** `effectiveLatency / targetHorizon`
- **Unit / shape:** ratio
- **Role:** GATE, PROTECTIVE
- **Availability:** NOW/FUTURE depending horizon model
- **Evidence:** PI + H
- **Meaning:** expresses whether system latency is small relative to the opportunity horizon or consumes a material fraction of it
- **Known overlaps:** Freshness, RemainingOpportunity
- **Confidence limits:** horizon itself is provisional before adaptive-horizon research/calibration
- **Validation targets:** TimeToTarget, executable opportunity, missed-opportunity rate
- **Research state:** Candidate

### TE-012 — SpreadBurdenToTarget

- **Family:** Tradability / Execution Preconditions
- **Kind:** DERIVED
- **Raw sources:** TE-001 + candidate target/remaining-move estimate
- **Derivation:** `SpreadPct / positiveTargetPct` or equivalent burden relative to a defined remaining-move quantity
- **Unit / shape:** ratio
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Meaning:** asks whether the displayed spread is small or large relative to the useful move being pursued
- **Known overlaps:** RemainingOpportunity, execution cost floor
- **Confidence limits:** target must not be invented merely to compute this ratio; displayed spread is not the complete round-trip cost
- **Validation targets:** net executable opportunity, target-before-adverse after friction
- **Research state:** Candidate / blocked pending target semantics

### TE-013 — ExplicitCostFloorPct

- **Family:** Tradability / Execution Preconditions
- **Kind:** CONTEXT
- **Raw sources:** parameterized broker/account/exchange cost profile + contemplated order notional
- **Derivation:** convert explicit round-trip monetary costs into percent of contemplated notional under a documented execution profile
- **Unit / shape:** percent
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** EXEC
- **Evidence:** PI
- **Meaning:** keeps account-specific explicit costs separate from market-microstructure friction
- **Known overlaps:** TE-012, future NetExecutableOpportunity
- **Confidence limits:** must never hardcode one user's historical capital/commission assumptions into the general ranking model
- **Validation targets:** net executable opportunity
- **Research state:** Candidate for parameterized ExecutionEvaluator

### TE-014 — ExecutionFeasibilityState

- **Family:** Tradability / Execution Preconditions
- **Kind:** STATE
- **Raw sources:** TE-001..TE-013 as available
- **Derivation:** synthesize spread quality, L1 availability/stability, size/depth compatibility and latency/horizon compatibility without predicting direction
- **Unit / shape:** GOOD / MARGINAL / POOR / UNKNOWN + Strength/Confidence/Coverage
- **Role:** GATE, PROTECTIVE
- **Availability:** NOW for market-only subset; EXEC for size/cost-aware form
- **Evidence:** PI + H
- **Meaning:** final feasibility summary used to reject or discount market opportunities that cannot realistically survive friction/latency
- **Known overlaps:** DataQuality, Freshness, future ExecutionEvaluator
- **Confidence limits:** GOOD does not guarantee a fill; without L2 and execution telemetry the state is necessarily partial
- **Validation targets:** implementation shortfall, fill ratio, net executable opportunity
- **Research state:** Provisional composite

---

## Tradability / Execution Preconditions ownership boundary

This family owns **friction and feasibility**, not directional alpha.

Examples:

~~~text
narrow spread
!= bullish signal

large ASK depth
!= bearish signal by itself
~~~

Directional interpretation of L1 remains in Book/Directional Flow.

The ranking architecture should eventually support two forms:

~~~text
market-only feasibility
→ user/account agnostic

execution-profile feasibility
→ parameterized by intended size, costs and execution policy
~~~

Do not hardcode a single account profile into the market score.

Critical gate concept:

~~~text
predicted/target horizon <= effective system latency
→ opportunity may be structurally unobservable/unusable
~~~

# Family FQ — Freshness / Data Quality

Purpose:

> Decide whether the evidence being interpreted is technically valid, sufficiently complete, temporally aligned and still fresh enough for a seconds-to-~2-minute objective.

This family does **not** predict direction. It controls whether directional/opportunity evidence deserves to be trusted.

## Existing project contract

Local History Viewer V1 already defines a validated complete cycle and preserves real collection timing:

~~~text
requested
received
unique
missing
duplicates
response structure
~~~

and stores:

~~~text
cycleStartedAt
cycleCompletedAt
chunkIndex
chunkReceivedAt
collectedAt per security
server AsOfDate when available
~~~

Therefore this family consumes those validated semantics rather than inventing a second definition of cycle completeness.

### FQ-001 — CycleIntegrityState

- **Family:** Freshness / Data Quality
- **Kind:** GATE
- **Raw sources:** validated cycle diagnostics from collector/storage boundary
- **Derivation:** PASS only when requested/received/unique/missing/duplicates/response-structure checks satisfy the complete-cycle contract; otherwise FAIL with explicit reason(s)
- **Unit / shape:** PASS / FAIL + diagnostics
- **Role:** GATE
- **Availability:** NOW
- **Evidence:** PV
- **Meaning:** prevents ranking on a cycle that is partial, duplicated or structurally invalid
- **Known overlaps:** none; this is foundational
- **Confidence limits:** a structurally complete cycle can still contain stale or semantically invalid individual fields
- **Validation targets:** ranking-input eligibility, integrity regressions
- **Research state:** Candidate based on existing verified contract

### FQ-002 — PerSecurityObservationAgeSeconds

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** per-record `collectedAt` + ranking/decision timestamp
- **Derivation:** `decisionTime - collectedAt(security)`
- **Unit / shape:** seconds
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** NOW
- **Evidence:** PV(time semantics) + PI
- **Meaning:** exact age of the market observation used for this security when it is compared/ranked
- **Known overlaps:** TE-009 consumer alias; FQ-003/FQ-008
- **Confidence limits:** must use per-security timestamp; cycle completion time alone hides sequential-chunk skew
- **Validation targets:** ranking stability under skew, missed opportunity, executable opportunity
- **Research state:** Candidate / primary owner of observation age

### FQ-003 — CycleObservationSkewSeconds

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** minimum and maximum valid per-security `collectedAt` within a cycle
- **Derivation:** `maxCollectedAt - minCollectedAt`
- **Unit / shape:** seconds
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(sequential collection) + PI
- **Meaning:** quantifies how non-simultaneous the full-universe comparison is
- **Known overlaps:** FQ-002
- **Confidence limits:** skew is cycle-level; individual securities still need their own observation age
- **Validation targets:** cross-sectional rank fairness, horizon feasibility
- **Research state:** Candidate

### FQ-004 — FeatureDependencyCoverage

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** explicit dependency list for each feature + current availability/validity
- **Derivation:** ratio/count of valid required/optional dependencies while preserving which critical dependency is missing
- **Unit / shape:** coverage ratio + missing-dependency set
- **Role:** GATE, CONTEXT
- **Availability:** NOW
- **Evidence:** PI
- **Meaning:** records how much of a feature's intended evidence was actually available instead of silently substituting zero/neutral
- **Known overlaps:** family coverage, confidence
- **Confidence limits:** critical missing inputs may invalidate a feature even when numeric coverage looks high
- **Validation targets:** feature eligibility, confidence calibration
- **Research state:** Candidate

### FQ-005 — FieldSemanticValidityState

- **Family:** Freshness / Data Quality
- **Kind:** GATE
- **Raw sources:** provider-field semantics/validation rules + current field value
- **Derivation:** validate null/empty/zero/range/phase semantics per field rather than generic truthiness
- **Unit / shape:** VALID / INVALID / UNKNOWN + reason
- **Role:** GATE
- **Availability:** NOW
- **Evidence:** PV + PI
- **Meaning:** enforces `null != 0 != "" != undefined` and prevents invalid executable-like values from entering features
- **Known overlaps:** TE-008 for two-sided L1
- **Confidence limits:** provider semantics not yet verified remain UNKNOWN rather than guessed
- **Validation targets:** data-integrity regressions, feature correctness
- **Research state:** Candidate

### FQ-006 — SignalEvidenceAgeSeconds

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** timestamp of the event/state transition that created the current signal + decision time
- **Derivation:** `decisionTime - signalEvidenceTime`
- **Unit / shape:** seconds
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Meaning:** distinguishes “the current snapshot is fresh” from “the bullish evidence itself happened long ago”
- **Known overlaps:** FQ-002, PW-007/PW-008, RemainingOpportunity
- **Confidence limits:** requires explicit event/state timestamps; do not approximate every signal's age from cycle age
- **Validation targets:** TimeToTarget, continuation, remaining opportunity
- **Research state:** Candidate

### FQ-007 — ReconfirmationState

- **Family:** Freshness / Data Quality
- **Kind:** STATE
- **Raw sources:** recent confirming observations across the feature's own evidence family
- **Derivation:** classify whether a prior signal has been recently confirmed, merely persisted without new evidence, weakened or invalidated
- **Unit / shape:** RECONFIRMED / PERSISTING / AGING_UNCONFIRMED / WEAKENING / INVALIDATED / UNKNOWN
- **Role:** CONFIRMING, PROTECTIVE, GATE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Meaning:** allows fresh confirming evidence to renew a signal without pretending the original event happened again
- **Known overlaps:** FQ-006, sequence/lifecycle states
- **Confidence limits:** reconfirmation criteria are family-specific; no universal “same value again = confirmation” rule
- **Validation targets:** continuation, false-positive reduction, TimeToTarget
- **Research state:** Candidate

### FQ-008 — FreshnessState

- **Family:** Freshness / Data Quality
- **Kind:** STATE
- **Raw sources:** FQ-002, FQ-006, FQ-007 + target-horizon context
- **Derivation:** synthesize observation age, signal age and reconfirmation into FRESH / RECONFIRMED / AGING / STALE / INVALID
- **Unit / shape:** state + Strength/Confidence
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** NOW + HISTORY
- **Evidence:** PI + H
- **Meaning:** family-level answer to whether this evidence is still timely for the short objective
- **Known overlaps:** TE-011 latency-to-horizon, RemainingOpportunity
- **Confidence limits:** thresholds must be horizon-aware; five seconds can be trivial for one signal and fatal for another
- **Validation targets:** target-before-adverse, TimeToTarget, false-positive reduction
- **Research state:** Provisional composite

### FQ-009 — TemporalAlignmentState

- **Family:** Freshness / Data Quality
- **Kind:** STATE
- **Raw sources:** timestamps of all observations feeding a multi-source feature
- **Derivation:** compare source ages and observation intervals before treating them as one coherent snapshot
- **Unit / shape:** ALIGNED / ACCEPTABLE_SKEW / MATERIAL_SKEW / UNKNOWN
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI
- **Meaning:** prevents LAST-vs-BID/ASK or cross-family sequences from pretending asynchronous observations were simultaneous
- **Known overlaps:** FQ-002/FQ-003
- **Confidence limits:** acceptable skew depends on target horizon and feature semantics
- **Validation targets:** feature correctness, next-direction labels, rank stability
- **Research state:** Candidate

### FQ-010 — CrossFieldConsistencyState

- **Family:** Freshness / Data Quality
- **Kind:** STATE
- **Raw sources:** logically related fields plus documented semantics
- **Derivation:** apply only proven/defensible checks; flag contradictions without treating unusual but possible market events as corruption
- **Unit / shape:** CONSISTENT / SUSPICIOUS / INVALID / UNKNOWN + reasons
- **Role:** GATE, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PI
- **Meaning:** catches impossible/semantically contradictory inputs while preserving genuine extreme events
- **Known overlaps:** FQ-005
- **Confidence limits:** do not assert invariants between non-atomic fields/endpoints unless verified; unusual is not bad data
- **Validation targets:** data-integrity regressions, outlier handling
- **Research state:** Candidate

### FQ-011 — FamilyEvidenceCoverage

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** FQ-004 across all features required/optional for one evidence family
- **Derivation:** summarize family-level availability while preserving critical-missing flags
- **Unit / shape:** ratio + critical-missing set
- **Role:** GATE, CONTEXT
- **Availability:** NOW
- **Evidence:** PI
- **Meaning:** allows Price/Activity/Book/etc. to expose how complete their evidence actually is
- **Known overlaps:** family Confidence
- **Confidence limits:** coverage is not predictive strength; 100% complete weak evidence remains weak
- **Validation targets:** confidence calibration, family eligibility
- **Research state:** Candidate

### FQ-012 — CrossSectionalCoverage

- **Family:** Freshness / Data Quality
- **Kind:** DERIVED
- **Raw sources:** count of valid securities for a normalized feature + eligible universe size
- **Derivation:** `validFeatureCount / eligibleUniverseCount`, retaining absolute counts
- **Unit / shape:** ratio + valid/eligible
- **Role:** CONTEXT, GATE
- **Availability:** NOW
- **Evidence:** PI
- **Meaning:** qualifies percentile/rank evidence; 99th percentile among 20 valid securities is weaker context than 99th among 500
- **Known overlaps:** cross-sectional normalization
- **Confidence limits:** high coverage does not mean high-quality values; universe eligibility must also be valid
- **Validation targets:** rank robustness, confidence calibration
- **Research state:** Candidate

### FQ-013 — DataQualityState

- **Family:** Freshness / Data Quality
- **Kind:** STATE
- **Raw sources:** FQ-001..FQ-012 as applicable
- **Derivation:** synthesize cycle integrity, semantic validity, temporal alignment and coverage into technical trust
- **Unit / shape:** GOOD / DEGRADED / POOR / INVALID / UNKNOWN + Confidence/Coverage/reasons
- **Role:** GATE, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV + PI
- **Meaning:** technical answer to whether downstream interpretation can be trusted enough to participate in ranking
- **Known overlaps:** all downstream family confidence calculations
- **Confidence limits:** DataQuality is not predictive Confidence; perfect data can support a weak hypothesis
- **Validation targets:** ranking-input eligibility, integrity regressions
- **Research state:** Provisional composite

### FQ-014 — PredictiveConfidenceInputs

- **Family:** Freshness / Data Quality
- **Kind:** CONTEXT
- **Raw sources:** FQ-008/FQ-011/FQ-013 + cross-family evidence diversity/agreement from later composition research
- **Derivation:** preserve dimensions separately rather than multiplying prematurely
- **Unit / shape:** DataQuality / Freshness / Coverage / EvidenceDiversity / Agreement
- **Role:** CONTEXT
- **Availability:** NOW + FUTURE
- **Evidence:** PI + H
- **Meaning:** provides ingredients for later confidence composition without confusing confidence with signal strength
- **Known overlaps:** CentralRanker composition
- **Confidence limits:** final confidence mapping is deferred to Issues #10/#11; this is not probability
- **Validation targets:** confidence calibration, top-K reliability
- **Research state:** Candidate context bundle

---

## Freshness / Data Quality ownership boundary

This family owns **technical trust and evidence timeliness**, not directional opportunity.

Important distinctions:

~~~text
fresh data != bullish data
complete data != strong signal
strong signal != high confidence
~~~

A stock can have:

~~~text
Price/Wave Strength = 95
DataQuality = GOOD
Freshness = STALE
~~~

and be rejected/discounted because the evidence is no longer timely.

Likewise:

~~~text
Price/Wave Strength = 55
DataQuality = GOOD
Freshness = FRESH
~~~

means the system is confident that the current evidence is merely mediocre.

Primary ownership correction:

~~~text
FQ-002 owns per-security observation age.
TE-009 consumes it for execution feasibility.
~~~

Do not maintain two competing calculations.

# Family PH — Path Quality / Wave Health

Purpose:

> Describe whether the **recent path leading into the decision point** is orderly, adverse, stalling or deteriorating in a way that changes the usability of the remaining seconds-to-~2-minute opportunity.

This family is primarily **PathRisk / quality / protective evidence**. It is not an independent bullish-alpha family.

Critical objective-alignment rule:

~~~text
clean past path
!=
future opportunity
~~~

A smooth old move can be mostly consumed. A previously noisy stock can still become attractive after a fresh noise-to-trend transition.

This family therefore asks whether recent path behavior improves or degrades the **remaining path from now**.

## Ownership boundary

Primary ownership here includes:

- directional/path efficiency;
- reversal density/depth;
- giveback;
- time since meaningful upward progress;
- effort-to-progress efficiency/deterioration;
- path-health / exhaustion state.

It does **not** own:

- raw return/speed/acceleration → Price/Wave;
- trade/volume/money effort itself → Activity/Flow;
- displayed book direction → Book/Directional Flow;
- freshness/data validity → Freshness/Data Quality;
- future MFE/MAE labels → validation/outcome layer.

### PH-001 — RecentDirectionalEfficiency

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** validated LAST and/or MID history with timestamps
- **Derivation:** candidate path-efficiency form = absolute net directional progress divided by cumulative absolute path movement over a recent window; preserve direction separately
- **Unit / shape:** bounded ratio [0,1] when defined + direction
- **Role:** PROTECTIVE, CONTEXT, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk
- **Meaning:** distinguishes direct recent progress from equally large net movement reached through heavy oscillation
- **Known overlaps:** PH-002/PH-003; PW return profile
- **Confidence limits:** unstable with too few samples or near-zero movement; a high value after a mature consumed move is not bullish by itself
- **Validation targets:** target-before-adverse, MAE-before-target, TimeToTarget, RecoveryTime
- **Research state:** Candidate

### PH-002 — ReversalDensityRecent

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** validated LAST/MID path
- **Derivation:** count meaningful direction reversals over a recent elapsed-time/path interval using a noise-aware threshold; exact threshold TBD
- **Unit / shape:** reversals per time/path window
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk
- **Meaning:** measures how fragmented/choppy the recent path is
- **Known overlaps:** PH-001, PH-003
- **Confidence limits:** must not count bid-ask bounce/tiny jitter as structural reversals; threshold sensitivity must be validated
- **Validation targets:** MAE-before-target, TimeUnderWater, target-before-adverse
- **Research state:** Candidate

### PH-003 — ReversalDepthProfile

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** validated LAST/MID path
- **Derivation:** magnitude distribution/profile of recent adverse reversals inside the current path/leg
- **Unit / shape:** percent/ticks profile
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk
- **Meaning:** separates frequent tiny oscillations from fewer materially adverse reversals
- **Known overlaps:** PH-002, PH-004
- **Confidence limits:** requires explicit path/leg semantics; current broad wave segmentation is deferred to Issue #6
- **Validation targets:** MAE-before-target, RecoveryTime, target-before-adverse
- **Research state:** Candidate / partial until segmentation semantics mature

### PH-004 — GiveBackPct

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** recent local peak/reference + current valid LAST/MID
- **Derivation:** percent surrendered from the relevant recent peak/reference; exact reference hierarchy TBD
- **Unit / shape:** percent
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** measures how much of recent upward progress has already been surrendered
- **Known overlaps:** PH-005; pullback/retest; future wave segmentation
- **Confidence limits:** daily high is not the default reference; relevant micro/leg peak must be defined without future leakage
- **Validation targets:** continuation vs breakdown, target-before-adverse, MAE
- **Research state:** Candidate

### PH-005 — GiveBackToTargetRatio

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** PH-004 + candidate positive target/target frontier
- **Derivation:** `GiveBackPct / positiveTargetPct` when target semantics are valid
- **Unit / shape:** ratio
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** makes adverse giveback economically relative to the short move being pursued
- **Known overlaps:** RemainingOpportunity / TargetFeasibilityFrontier
- **Confidence limits:** blocked until target/frontier semantics are explicit; must not invent a target merely to compute the ratio
- **Validation targets:** target-before-adverse, net useful excursion
- **Research state:** Candidate / blocked pending target semantics

### PH-006 — ProgressSinceRecentLowPct

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** recent local low/reference + current LAST/MID
- **Derivation:** upward progress from the most relevant recent reset/pullback low; exact reference selection TBD
- **Unit / shape:** percent
- **Role:** CONTEXT, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, PathRisk
- **Meaning:** supports distinguishing a fresh post-pullback leg from an old broad wave
- **Known overlaps:** PW-009 CurrentLegObservedMovePct; pullback/retest research
- **Confidence limits:** should converge to one owner after Issue #6 defines leg semantics; avoid duplicate scoring with PW-009
- **Validation targets:** detection lateness, target-before-adverse, TimeToTarget
- **Research state:** Candidate / ownership reconciliation pending Issue #6

### PH-007 — TimeSinceMeaningfulProgressSeconds

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** timestamped LAST/MID path + defined meaningful-progress rule
- **Derivation:** elapsed time since the most recent material upward progress event
- **Unit / shape:** seconds
- **Role:** PROTECTIVE, LEADING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** exposes stalls that raw cumulative momentum can hide
- **Known overlaps:** FQ signal age, PH-008/PH-011, Issue #16 conversion latency
- **Confidence limits:** “meaningful” must be relative to tick/noise/target context; no universal seconds threshold
- **Validation targets:** TimeToTarget, target-before-adverse, continuation vs exhaustion
- **Research state:** Candidate

### PH-008 — ProgressStallState

- **Family:** Path Quality / Wave Health
- **Kind:** STATE
- **Raw sources:** PH-007 + current Price/Activity/Book evidence + later conversion-latency baseline
- **Derivation:** classify whether progress delay is normal, concerning or beyond the current state's expected conversion window
- **Unit / shape:** PROGRESSING / PAUSING / STALLING / STALLED_BEYOND_EXPECTED / UNKNOWN
- **Role:** PROTECTIVE, LEADING
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** distinguishes a normal brief pause from pressure/effort that is no longer converting to useful upward movement
- **Known overlaps:** Issue #16 ProgressStallRelativeToNormalConversion
- **Confidence limits:** current version cannot claim “beyond expected” until conversion-latency research exists
- **Validation targets:** target-before-adverse, TimeToTarget, exhaustion transition
- **Research state:** Provisional / partially blocked by Issue #16

### PH-009 — EffortToProgressEfficiency

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** Activity/Flow family effort profile + Price/Wave useful progress over aligned interval
- **Derivation:** bounded/saturating relation between executed-activity effort and meaningful upward price/MID progress; exact formulation TBD
- **Unit / shape:** efficiency score/state, not naive unbounded ratio
- **Role:** PROTECTIVE, CONFIRMING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, Confirmation
- **Meaning:** asks whether increasing market effort is producing useful upward movement
- **Known overlaps:** AF activity measures; PW price response
- **Confidence limits:** zero/near-zero progress makes naive division unstable; absolute activity differs by stock/regime; no causal intent inference
- **Validation targets:** continuation vs exhaustion, target-before-adverse, MAE
- **Research state:** Candidate

### PH-010 — EffortToProgressDeteriorationState

- **Family:** Path Quality / Wave Health
- **Kind:** STATE
- **Raw sources:** PH-009 over successive comparable intervals
- **Derivation:** detect whether more/similar effort is producing less useful progress over time
- **Unit / shape:** IMPROVING / STABLE / DETERIORATING / SEVERE_DIVERGENCE / UNKNOWN
- **Role:** LEADING, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** candidate early exhaustion evidence before an outright price reversal
- **Known overlaps:** PH-008; AF participation expansion; PW deceleration
- **Confidence limits:** divergence can occur transiently near barriers or during benign pauses; must be interpreted with Book/path/target context
- **Validation targets:** target-before-adverse, exhaustion/reversal, TimeToTarget deterioration
- **Research state:** Candidate

### PH-011 — ProgressPerAdverseExcursion

- **Family:** Path Quality / Wave Health
- **Kind:** DERIVED
- **Raw sources:** recent upward progress + observed adverse excursions inside the path
- **Derivation:** bounded relation of useful progress to adverse movement over the same aligned interval/path
- **Unit / shape:** ratio/quality state
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk
- **Meaning:** summarizes whether recent progress has required disproportionately large adverse travel
- **Known overlaps:** PH-001/PH-003; future MFE/MAE outcome labels
- **Confidence limits:** past realized path quality is not a prediction by itself; no future MAE leakage
- **Validation targets:** MAE-before-target, TimeUnderWater, target-before-adverse
- **Research state:** Candidate

### PH-012 — PathTransitionState

- **Family:** Path Quality / Wave Health
- **Kind:** STATE
- **Raw sources:** PH-001..PH-011 + recent Price/Wave context
- **Derivation:** characterize recent transition rather than only average path quality
- **Unit / shape:** NOISE_TO_ORDERED_UP / ORDERED_UP / ORDERED_TO_CHOPPY / PULLBACK_RESET / STALLING / DETERIORATING / UNKNOWN
- **Role:** LEADING, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** allows a previously noisy stock to become attractive when current path quality is improving, while penalizing deterioration after a formerly clean move
- **Known overlaps:** pullback/retest; PW acceleration; sequence
- **Confidence limits:** transition thresholds/stability requirements are not yet calibrated
- **Validation targets:** target-before-adverse, TimeToTarget, detection lateness
- **Research state:** Provisional state

### PH-013 — WaveHealthState

- **Family:** Path Quality / Wave Health
- **Kind:** STATE
- **Raw sources:** PH-001..PH-012 plus current Price/Activity/Book confirmation context
- **Derivation:** family-level synthesis of path efficiency, giveback, stall and effort-to-progress deterioration
- **Unit / shape:** HEALTHY_PATH / ACCEPTABLE / FRAGILE / STALLING / EXHAUSTING / FAILING / UNKNOWN + Strength/Confidence/Coverage
- **Role:** PROTECTIVE, CONFIRMING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** compact path-health summary used by higher-level opportunity logic instead of independently summing correlated path diagnostics
- **Known overlaps:** RemainingOpportunity, pullback/retest, Sequence, future exhaustion-specific research
- **Confidence limits:** HEALTHY_PATH is not a buy signal; EXHAUSTING remains a hypothesis until validated; family must not double-count PW/AF/BD inputs as separate votes
- **Validation targets:** target-before-adverse, MAE, continuation vs exhaustion, TimeToTarget
- **Research state:** Provisional composite

---

## Path Quality / Wave Health objective-alignment boundary

This family should answer:

~~~text
given that an opportunity may exist,
how usable/fragile is the recent path leading into NOW,
and is progress still converting efficiently?
~~~

It must **not** answer:

~~~text
this stock moved smoothly before,
therefore buy it
~~~

Key architecture:

~~~text
Price/Wave      → direction / speed / acceleration
Activity/Flow   → executed effort
Book/Flow       → displayed directional process
Path/WaveHealth → efficiency / adverse path / stall / deterioration
~~~

Then:

~~~text
PH-001..PH-012
→ PH-013 WaveHealthState
→ PathRisk / RemainingOpportunity context
→ later target-before-adverse validation
~~~

Important no-leakage rule:

~~~text
future MFE/MAE are OUTCOMES/LABELS
not inputs to PH at decision time
~~~

# Family PR — Pullback / Retest / Micro-Barrier State

Purpose:

> Detect whether a short pullback/retest has created a **fresh capturable leg from now**, and whether a nearby micro-level sits materially inside the path to the short target.

This family does **not** encode classical chart-pattern folklore.

Critical rule:

~~~text
pullback exists
!=
healthy pullback
!=
new opportunity
~~~

A pullback becomes useful only when its subsequent state improves the seconds-to-~2-minute opportunity.

Likewise:

~~~text
breakout occurred
!=
continuation guaranteed
~~~

The relevant question is whether crossing a **path-relevant micro barrier** converts into additional progress quickly enough before rejection.

## Ownership boundary

This family owns:

- pullback depth/duration;
- reclaim/retest timing and strength;
- post-retest reacceleration;
- fresh-leg reset semantics;
- distance to relevant micro barriers;
- barrier clearance / acceptance / rejection.

It does **not** own:

- generic GiveBack/path deterioration → Path/WaveHealth;
- raw speed/acceleration → Price/Wave;
- displayed Book direction → Book/Directional Flow;
- broad daily highs/lows as standalone signals;
- future target outcomes → validation/outcome layer.

### PR-001 — PullbackDepthPct

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** recent local peak/reference + current/retreat low using valid LAST/MID history
- **Derivation:** adverse move from relevant local peak to pullback low; exact reference semantics deferred to Issue #6
- **Unit / shape:** percent
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, PathRisk
- **Meaning:** measures how much extension has been reset and how much structure has been surrendered
- **Known overlaps:** PH-004 GiveBackPct
- **Confidence limits:** depth alone does not classify pullback as healthy; must not duplicate PH-004 as a second penalty
- **Validation targets:** post-retest target-before-adverse, MAE, TimeToTarget
- **Research state:** Candidate / reference semantics pending Issue #6

### PR-002 — PullbackDurationSeconds

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** pullback start/end timestamps
- **Derivation:** elapsed time from relevant local peak/retreat onset to pullback low or reclaim phase
- **Unit / shape:** seconds
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** quantifies whether the reset is fast enough to remain relevant to the short objective
- **Known overlaps:** PW WaveAge/LegAge; FQ freshness
- **Confidence limits:** exact phase boundaries depend on pullback/retest state semantics; long duration is not automatically failure without target/horizon context
- **Validation targets:** post-retest TimeToTarget, detection lateness, target-before-adverse
- **Research state:** Candidate

### PR-003 — PullbackCounterPressureState

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** Price/Wave + Activity/Flow + Book/Directional Flow during the retreat
- **Derivation:** characterize whether adverse movement is expanding, contained or fading; exact synthesis TBD
- **Unit / shape:** CONTAINED / EXPANDING / FADING / CONFLICTED / UNKNOWN
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, Confirmation
- **Meaning:** distinguishes a modest reset from a retreat accompanied by growing adverse process
- **Known overlaps:** PH WaveHealthState; BD directional flow
- **Confidence limits:** cross-family inputs must not be re-added as independent votes; state owns only pullback interpretation
- **Validation targets:** retest success/failure, target-before-adverse, breakdown
- **Research state:** Candidate

### PR-004 — ReclaimLatencySeconds

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** pullback low/end timestamp + reclaim event timestamp
- **Derivation:** elapsed time from pullback low/reset point to defined reclaim of relevant micro reference
- **Unit / shape:** seconds
- **Role:** LEADING, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, Confirmation
- **Meaning:** measures how quickly upward process reasserts itself after a reset
- **Known overlaps:** Issue #16 conversion latency; PR-006
- **Confidence limits:** reclaim reference must be explicit; slow reclaim can consume most of the opportunity horizon
- **Validation targets:** target-before-adverse, TimeToTarget, usable lead time
- **Research state:** Candidate

### PR-005 — ReclaimStrengthState

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** reclaimed price/MID level + current Price/Book/Activity response
- **Derivation:** classify whether reclaim is weak, confirmed or rejected based on persistence/progress after reclaim
- **Unit / shape:** WEAK_RECLAIM / CONFIRMED_RECLAIM / FAILED_RECLAIM / UNKNOWN
- **Role:** CONFIRMING, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, PathRisk
- **Meaning:** separates touching/recovering a level from actually re-establishing upward progress
- **Known overlaps:** BD book confirmation; PH path transition
- **Confidence limits:** no single quote/print proves reclaim acceptance; persistence must be defined without future leakage
- **Validation targets:** target-before-adverse, post-retest continuation, MAE
- **Research state:** Candidate

### PR-006 — PostRetestAccelerationState

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** PW acceleration/speed immediately after reclaim + aligned AF/BD confirmation
- **Derivation:** classify whether a fresh leg accelerates after the retest
- **Unit / shape:** REACCELERATING / STEADY / WEAK / DETERIORATING / UNKNOWN
- **Role:** LEADING, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation, RemainingOpportunity
- **Meaning:** tests whether the pullback actually reset into a new fast leg rather than merely stopping the decline
- **Known overlaps:** PW-004; Sequence
- **Confidence limits:** family owns the post-retest interpretation, not a duplicate acceleration vote
- **Validation targets:** TimeToTarget, target-before-adverse, detection lateness
- **Research state:** Candidate

### PR-007 — LegResetStrength

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** PR-001..PR-006 + PH path state
- **Derivation:** synthesize whether the pullback meaningfully reduced extension and produced a fresh upward leg
- **Unit / shape:** NO_RESET / PARTIAL_RESET / FRESH_LEG / STRONG_FRESH_LEG / FAILED / UNKNOWN
- **Role:** LEADING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** explicit representation of renewed opportunity inside an older broad wave
- **Known overlaps:** PW LegAge; MoveConsumptionState
- **Confidence limits:** should not infer large remaining opportunity solely from reset state; direct outcome validation required
- **Validation targets:** target-before-adverse, remaining excursion at detection, TimeToTarget
- **Research state:** Provisional composite

### PR-008 — RetestFailureClockSeconds

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** reclaim/retest state timestamps + subsequent progress/invalidating events
- **Derivation:** elapsed time since retest/reclaim without required continued progress or before explicit failure
- **Unit / shape:** seconds
- **Role:** PROTECTIVE, LEADING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** detects a retest that looked promising but is failing to convert quickly enough
- **Known overlaps:** PH-007/PH-008; Issue #16
- **Confidence limits:** “too long” depends on conversion-latency/target context; exact failure threshold not yet known
- **Validation targets:** failure-before-target, TimeToTarget deterioration, false-start reduction
- **Research state:** Candidate / partially blocked by Issue #16

### PR-009 — DistanceToNearestRelevantMicroBarrierPct

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** current decision reference + recent micro/leg highs or other explicitly defined local barriers
- **Derivation:** smallest positive distance to a relevant barrier that lies above current reference and inside the researched short path
- **Unit / shape:** percent
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, PathRisk
- **Meaning:** identifies whether the desired move must first clear a nearby local obstacle
- **Known overlaps:** PR-010; daily/recent high context
- **Confidence limits:** broad/distant daily highs are not automatically relevant; barrier definition must be causal/observable at decision time
- **Validation targets:** TimeToTarget, barrier-first/rejection outcomes
- **Research state:** Candidate

### PR-010 — BarrierDistanceToTargetRatio

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** PR-009 + candidate positive target
- **Derivation:** `distanceToBarrierPct / positiveTargetPct`
- **Unit / shape:** ratio
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** distinguishes a barrier that consumes a large share of the desired move from one that is economically irrelevant to that target
- **Known overlaps:** TargetFeasibilityFrontier
- **Confidence limits:** blocked until target semantics exist; a near barrier can be positive if rapidly accepted
- **Validation targets:** target-before-adverse, TimeToTarget
- **Research state:** Candidate / blocked pending target semantics

### PR-011 — BarrierClearanceLatencySeconds

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** barrier-cross timestamp + first subsequent meaningful progress/acceptance timestamp
- **Derivation:** elapsed time from crossing a relevant micro barrier to additional confirmed progress
- **Unit / shape:** seconds
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, RemainingOpportunity
- **Meaning:** measures whether the cross converts quickly into useful continuation
- **Known overlaps:** Issue #16 conversion latency; PR-012
- **Confidence limits:** crossing alone is not acceptance; current cadence may create interval uncertainty
- **Validation targets:** target-before-adverse, TimeToTarget, breakout continuation/rejection
- **Research state:** Candidate

### PR-012 — BarrierAcceptanceState

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** barrier level + subsequent BID/MID/LAST path + activity/book confirmation
- **Derivation:** classify post-cross behavior as ACCEPTED / TENTATIVE / REJECTED / FAILED_BREAK / UNKNOWN
- **Unit / shape:** state
- **Role:** CONFIRMING, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, PathRisk
- **Meaning:** differentiates a mere print above a level from sustained market-center/progress above it
- **Known overlaps:** BD flow state; PH path state
- **Confidence limits:** exact persistence requirement uncalibrated; must not peek beyond the decision timestamp when used online
- **Validation targets:** post-break target-before-adverse, MAE, TimeToTarget
- **Research state:** Candidate

### PR-013 — PostBreakGiveBackPct

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** DERIVED
- **Raw sources:** barrier-cross reference + subsequent current path up to decision time
- **Derivation:** surrendered progress after the most recent relevant barrier cross
- **Unit / shape:** percent
- **Role:** PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** PathRisk
- **Meaning:** identifies rejection/failure developing after a cross
- **Known overlaps:** PH-004 GiveBackPct
- **Confidence limits:** should be consumed as barrier-specific context, not a second generic GiveBack penalty
- **Validation targets:** failed break, target-before-adverse, MAE
- **Research state:** Candidate

### PR-014 — PullbackRetestBarrierState

- **Family:** Pullback / Retest / Micro-Barrier State
- **Kind:** STATE
- **Raw sources:** PR-001..PR-013 where valid
- **Derivation:** family-level synthesis of reset/reclaim/reacceleration and barrier path state
- **Unit / shape:** NO_SETUP / RESETTING / RETESTING / FRESH_LEG / BARRIER_PENDING / BARRIER_ACCEPTED / REJECTED / FAILED / UNKNOWN + Strength/Confidence/Coverage
- **Role:** LEADING, CONFIRMING, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation, RemainingOpportunity, PathRisk
- **Meaning:** compact state that tells higher-level logic whether a recent retreat/barrier event has created, preserved or invalidated a fresh short-horizon opportunity
- **Known overlaps:** PH WaveHealthState; Sequence; RemainingOpportunity
- **Confidence limits:** this is not a classical-pattern buy signal; each state must be validated against direct target/adverse outcomes
- **Validation targets:** target-before-adverse, TimeToTarget, detection lateness, MAE
- **Research state:** Provisional composite

---

## Pullback / Retest / Micro-Barrier objective-alignment boundary

This family should answer:

~~~text
did the recent retreat/barrier interaction
create or destroy a fresh capturable leg from NOW?
~~~

It must not answer:

~~~text
pullback = healthy
breakout = bullish
daily high nearby = important
~~~

Preferred flow:

~~~text
retreat/reset
→ reclaim
→ reacceleration
→ barrier interaction if relevant
→ fresh leg / rejection / failure
~~~

Only barriers that materially sit inside or near the current short target path deserve meaningful influence.

# Family SQ — Sequence / Lead-Lag / Opportunity Stage

Purpose:

> Describe **when** major evidence families become active relative to one another, whether a usable precursor exists before price progress, and whether the current opportunity is still early enough to capture.

This family is central to the project because prediction that arrives after most of the useful move is operationally weak.

Critical objective rule:

~~~text
predictive sequence
!=
tradable sequence
~~~

A precursor is valuable only if useful lead remains after observation, ranking, decision and execution latency.

## Observation uncertainty rule

The current collector observes the market in sequential snapshots/chunks, not event-by-event.

Therefore:

~~~text
unobserved ordering
!=
known ordering
~~~

When several families change inside the same unresolved observation interval, use:

~~~text
SIMULTANEOUS_CLUSTER
~~~

rather than inventing a precise causal order.

### SQ-001 — FamilyActivationTimestamp

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** state-transition timestamps from Price/Wave, Activity/Flow, Book/Directional Flow, Path/WaveHealth and Pullback/Retest families
- **Derivation:** earliest observation timestamp at which a family-specific qualifying transition is observable under its own validity rules
- **Unit / shape:** timestamp + source family + interval uncertainty
- **Role:** LEADING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation
- **Meaning:** creates a common timing vocabulary for comparing when evidence families become active
- **Known overlaps:** FQ signal age; Issue #16
- **Confidence limits:** timestamp is observation-time, not hidden event-time; family transition criteria are not yet calibrated
- **Validation targets:** usable lead time, detection lateness, TimeToTarget
- **Research state:** Candidate

### SQ-002 — SequenceOrderingState

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** SQ-001 across qualifying families
- **Derivation:** classify observable ordering only when timing separation exceeds known uncertainty; otherwise emit simultaneous/unknown
- **Unit / shape:** ACTIVITY_THEN_BOOK_THEN_PRICE / BOOK_THEN_ACTIVITY_THEN_PRICE / PRICE_THEN_CONFIRMATION / PULLBACK_RECLAIM_THEN_ACCELERATION / SIMULTANEOUS_CLUSTER / OTHER / UNKNOWN
- **Role:** LEADING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation
- **Meaning:** preserves process shape without pretending causal certainty
- **Known overlaps:** Issue #16 precursor-conversion research
- **Confidence limits:** sequence label is observational, not causal; current sampling cadence may collapse many true event orders
- **Validation targets:** target-before-adverse, TimeToTarget, usable lead time
- **Research state:** Candidate

### SQ-003 — SequenceCompressionState

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** observation intervals for SQ-001 events + collector cadence/skew
- **Derivation:** determine whether candidate event order is resolvable or compressed into the same uncertainty interval
- **Unit / shape:** RESOLVED / PARTIALLY_RESOLVED / SIMULTANEOUS_CLUSTER / UNKNOWN
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PV(collection constraint) + PI
- **Decision role:** Freshness/Trust, Confirmation
- **Meaning:** prevents overconfident lead-lag interpretation when sampling cannot support it
- **Known overlaps:** FQ temporal alignment
- **Confidence limits:** RESOLVED still means resolved at snapshot granularity, not exchange-event granularity
- **Validation targets:** sequence-confidence calibration, feature correctness
- **Research state:** Candidate

### SQ-004 — EarliestQualifiedPrecursorTime

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** SQ-001/SQ-002 + qualifying precursor definition
- **Derivation:** earliest observable time at which a validated candidate precursor state first exists before meaningful price progress
- **Unit / shape:** timestamp + precursor type
- **Role:** LEADING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential
- **Meaning:** anchors how early the system could possibly begin considering the opportunity
- **Known overlaps:** Issue #16 conversion latency
- **Confidence limits:** must not backdate to an event that was not observable from available data at that time
- **Validation targets:** detection lateness, target-before-adverse, usable lead time
- **Research state:** Candidate

### SQ-005 — FirstMeaningfulPriceProgressTime

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** Price/Wave path + meaningful-progress definition
- **Derivation:** first observable timestamp after precursor at which LAST/MID achieves defined material upward progress
- **Unit / shape:** timestamp
- **Role:** CONFIRMING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation
- **Meaning:** provides the conversion endpoint for precursor-to-price timing
- **Known overlaps:** PH-007; Issue #16
- **Confidence limits:** meaningful-progress threshold must be tick/noise/target aware; cannot use future final-wave peak
- **Validation targets:** precursor conversion latency, TimeToTarget
- **Research state:** Candidate

### SQ-006 — ObservedPrecursorLeadSeconds

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** SQ-004 + SQ-005
- **Derivation:** `FirstMeaningfulPriceProgressTime - EarliestQualifiedPrecursorTime` when ordering is resolvable
- **Unit / shape:** seconds + uncertainty interval
- **Role:** LEADING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential
- **Meaning:** measures observed lead between a precursor and initial useful price conversion
- **Known overlaps:** Issue #16 conversion-latency outputs
- **Confidence limits:** positive lead is not proof of causality; unresolved ordering must remain UNKNOWN/SIMULTANEOUS
- **Validation targets:** usable lead time, precursor usefulness
- **Research state:** Candidate

### SQ-007 — CrossFamilyConfirmationLatencySeconds

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** first qualifying family event + timestamps of subsequent independent-family confirmations
- **Derivation:** elapsed time from first qualifying evidence to required cross-family confirmation state(s)
- **Unit / shape:** seconds/profile
- **Role:** CONFIRMING, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, RemainingOpportunity
- **Meaning:** quantifies how much opportunity time is consumed waiting for confirmation
- **Known overlaps:** FQ signal age; Issue #16
- **Confidence limits:** “independent” families are not statistically independent by assumption; confirmation policy remains research
- **Validation targets:** target-before-adverse, detection lateness, TimeToTarget
- **Research state:** Candidate

### SQ-008 — UsableLeadTimeAfterSystemLatency

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** SQ-004 or decision-signal time + target/progress time + FQ/TE observation/decision latency and later execution latency
- **Derivation:** candidate conceptual form `timeToUsefulProgress - effectiveSystemLatencyFromDetection`
- **Unit / shape:** seconds
- **Role:** GATE, LEADING, PROTECTIVE
- **Availability:** FUTURE / EXEC for full form
- **Evidence:** PI + H
- **Decision role:** Potential, Feasibility, RemainingOpportunity
- **Meaning:** asks whether predictive lead remains actionable after the system consumes its own time
- **Known overlaps:** TE-011 LatencyToHorizonRatio; Issue #16 LeadTimeAfterSystemLatency
- **Confidence limits:** full value requires explicit decision/entry timing and target semantics; negative value means the signal may be statistically interesting but operationally too late
- **Validation targets:** executable target-before-adverse, detection lateness, implementation shortfall
- **Research state:** Candidate / partially blocked by Issues #15/#16 and execution telemetry

### SQ-009 — DetectionLatenessState

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** first detector/eligibility timestamp + observed move already completed + future excursion labels during validation
- **Derivation:** during research, quantify how much useful excursion had already occurred before detection; online proxy must use only current observable consumption features
- **Unit / shape:** EARLY / MODERATE / LATE / MOSTLY_CONSUMED / UNKNOWN
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE for validated label; HISTORY for online proxy
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** penalizes detectors that are directionally correct but discover the move after most of its value is gone
- **Known overlaps:** MoveConsumptionState; PW recency concentration; PR LegResetStrength
- **Confidence limits:** future excursion can be used only as evaluation label, never as online input
- **Validation targets:** remaining excursion at detection, target-before-adverse from decision time
- **Research state:** Candidate / label-proxy split required

### SQ-010 — OpportunityStage

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** SQ-001..SQ-009 plus PW/AF/BD/PH/PR family states
- **Derivation:** synthesize observable lifecycle position while preserving separate confidence and remaining-opportunity evidence
- **Unit / shape:** EARLY / CONFIRMED / MATURE / LATE / FAILING / UNDETERMINED
- **Role:** LEADING, CONFIRMING, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation, RemainingOpportunity, PathRisk
- **Meaning:** captures whether the opportunity is forming, validated, already mature, too late or breaking down
- **Known overlaps:** PW wave state; PH wave health; PR reset state
- **Confidence limits:** stage is not score; EARLY is not automatically better than CONFIRMED; LATE depends on remaining opportunity, not wall-clock age alone
- **Validation targets:** target-before-adverse, TimeToTarget, detection lateness, remaining excursion at detection
- **Research state:** Provisional composite

### SQ-011 — SequenceEvidenceDiversity

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** DERIVED
- **Raw sources:** distinct family transitions participating in the current sequence
- **Derivation:** count/structure of materially distinct evidence families supporting the sequence, with redundancy-aware grouping
- **Unit / shape:** structured count/state
- **Role:** CONTEXT, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, Freshness/Trust
- **Meaning:** distinguishes one-family persistence from a sequence supported by several different evidence origins
- **Known overlaps:** FQ PredictiveConfidenceInputs; future CentralRanker EvidenceDiversity
- **Confidence limits:** raw count is insufficient because families share inputs; diversity must follow ownership/redundancy rules
- **Validation targets:** confidence calibration, target-before-adverse
- **Research state:** Candidate

### SQ-012 — SequenceInvalidationState

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** current sequence plus family invalidation/deterioration events
- **Derivation:** detect when the expected next transition fails to appear in time or contrary evidence breaks the sequence
- **Unit / shape:** ACTIVE / WAITING_FOR_CONFIRMATION / STALLED / INVALIDATED / UNKNOWN
- **Role:** PROTECTIVE, LEADING
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, PathRisk
- **Meaning:** prevents a precursor from remaining “alive” indefinitely when conversion/confirmation never arrives
- **Known overlaps:** PH ProgressStallState; PR RetestFailureClock; Issue #16 opportunity half-life
- **Confidence limits:** timeout/invalidation must be evidence-specific and regime-aware; no universal fixed clock
- **Validation targets:** false-positive reduction, target-before-adverse, TimeToTarget
- **Research state:** Provisional / partially blocked by Issue #16

### SQ-013 — SequenceOpportunityState

- **Family:** Sequence / Lead-Lag / Opportunity Stage
- **Kind:** STATE
- **Raw sources:** SQ-001..SQ-012 where valid
- **Derivation:** family-level synthesis of observable ordering, confirmation timing, stage, usable lead and invalidation
- **Unit / shape:** PRECURSOR / BUILDING / CONFIRMED_EARLY / CONFIRMED_MATURE / TOO_LATE / FAILING / CONFLICTED / UNKNOWN + Strength/Confidence/Coverage
- **Role:** LEADING, CONFIRMING, PROTECTIVE, CONTEXT
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI + H
- **Decision role:** Potential, Confirmation, RemainingOpportunity, PathRisk
- **Meaning:** compact sequence summary for higher-level opportunity logic without independently summing each timing derivative
- **Known overlaps:** OpportunityStage; RemainingOpportunity; CentralRanker
- **Confidence limits:** must retain SIMULTANEOUS_CLUSTER/uncertainty; no causal claims; usable-lead semantics depend on Issues #15/#16
- **Validation targets:** target-before-adverse, TimeToTarget, detection lateness, usable lead time
- **Research state:** Provisional composite

---

## Sequence / Lead-Lag objective-alignment boundary

This family should answer:

~~~text
what process is observable,
how early was it observable,
how much confirmation time has been consumed,
and is useful lead still left NOW?
~~~

It must not answer:

~~~text
Activity happened first,
therefore Activity caused the price move
~~~

Core sequence rule:

~~~text
observable order
+ uncertainty
+ remaining lead
> narrative causality
~~~

Preferred flow:

~~~text
family transitions
→ resolvable ordering or SIMULTANEOUS_CLUSTER
→ precursor / confirmation timing
→ usable lead after latency
→ OpportunityStage
→ SequenceOpportunityState
~~~

## Next registry boundary

Next planned family:

~~~text
Remaining Opportunity / Target Frontier
~~~

It will own structured forward opportunity budget, move-consumption state, target/time/adverse frontier and potential-vs-capturable remaining opportunity, while keeping future outcomes separate from online inputs.
