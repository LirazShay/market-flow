# Feature Registry — Momentum Ranking V1

This registry is the durable inventory of candidate inputs, derived features, states, gates and future labels used by the Momentum Ranking research.

It is intentionally built family-by-family. A feature is not considered "adopted" merely because it appears here; predictive value remains subject to later validation.

Evidence codes and role semantics are defined in:

~~~text
evidence-taxonomy.md
~~~

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

## Next registry boundary

Next planned family:

~~~text
Tradability / Execution Preconditions
~~~

It will own spread burden, tick burden, L1 depth/size feasibility, spread stability and observability/latency constraints, without duplicating directional Book evidence.
