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

## Next registry boundary

Next planned family:

~~~text
Path Quality / Wave Health
~~~

It will own directional efficiency, reversals, giveback/path cleanliness and cross-family effort-vs-result deterioration used for exhaustion risk.
