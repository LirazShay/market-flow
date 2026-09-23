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
| Meaning | Short canonical description of what information the feature contributes. |
| Plain-language intuition | Explain the feature without assuming formula/statistics knowledge: what is happening in the market when this value rises/falls or changes state? |
| Market mechanism / why it can matter | Explain the concrete market behavior the feature may reflect and why that behavior could affect the seconds-to-~2-minute opportunity. Avoid causal claims that the data cannot prove. |
| Objective connection | Explain exactly how this feature could help answer the project's real question: can a buyer entering now obtain a useful upward move and later exit through the sell-side path quickly enough? |
| Favorable / unfavorable interpretation | Describe what different values/states *may* suggest, including asymmetric or ambiguous cases. Never reduce to “high = good” unless proven. |
| Failure modes / counterexamples | Give concrete situations where the feature looks positive/negative but the actual opportunity can be the opposite. |
| Relationship to other evidence | Explain what this feature adds beyond related features and which other evidence is needed to interpret it correctly. |
| Worked example | Give a small numeric or market-behavior example when useful. |
| Known overlaps | Features/families likely to carry related information. |
| Confidence limits | Conditions that make interpretation weak or invalid. |
| Validation targets | Explicit future outcomes against which usefulness should be tested. |
| Research state | Candidate / blocked / provisional / validated / rejected. |

## Deep-rationale documentation contract

The registry is not allowed to become a list of formulas, acronyms or statistical labels that only a quant can decode.

For every material feature/state, the durable documentation must eventually make the **why** understandable in plain market language.

Minimum explanatory questions:

1. **What is actually happening in the market?**
   - Describe the observable behavior in BID/ASK/LAST/activity/path terms.
2. **Why could that behavior matter?**
   - Explain the plausible market mechanism without pretending causality is proven.
3. **How does it connect to our exact objective?**
   - The question is not “is the stock strong?” but whether a buyer entering now can obtain a useful upward move and later exit through the sell side quickly enough.
4. **What would a favorable reading mean?**
   - Explain what it may suggest about potential, confirmation, remaining opportunity, path risk or feasibility.
5. **What would an unfavorable or ambiguous reading mean?**
   - State when the same metric can mean something different.
6. **What can fool us?**
   - Include counterexamples, stale quotes, spread changes, low depth, already-consumed moves, regime changes, etc. as applicable.
7. **What does this add beyond nearby metrics?**
   - Explain why this metric is not merely a duplicate of another feature.
8. **Give a concrete example when useful.**
   - Prefer simple numbers and a market story over abstract notation alone.

Abbreviations remain useful for identifiers, but the first durable explanation of a concept must spell out the full meaning. A reader should not need to infer the idea from names such as `MFE`, `MAE`, `OFI`, `L1`, `MID` or `LAST` alone.

Important discipline:

~~~text
formula
+
plain-language mechanism
+
objective connection
+
counterexample
+
validation target
=
acceptable research documentation
~~~

A formula without the reasoning behind it is incomplete documentation.

---

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
- **Plain-language intuition:** this asks a very basic question at several recent horizons: “where is the latest traded price now compared with where trades were occurring 10/20/30/60/etc. seconds ago?” A positive profile means trades have migrated upward; a negative profile means they have migrated downward.
- **Market mechanism / why it can matter:** repeated higher transaction prices show that buyers and sellers have actually completed trades at progressively higher levels. That is stronger than a static quote alone because money has changed hands there. However, executed prices describe what already happened; they do not prove the next buyer will pay even more.
- **Objective connection:** for our buy-now/sell-soon objective, recent upward trade-price movement can confirm that the stock is already capable of moving in the desired direction within the relevant horizon. The useful question is whether that movement is still fresh enough that additional upward excursion remains after entry.
- **Favorable / unfavorable interpretation:** a modest positive move that is strengthening in the newest windows may be more attractive than a very large move that happened mostly earlier. Flat/negative returns can be cautionary, but can also precede a fresh reversal; the profile must be interpreted together with acceleration, recency concentration, BID/ASK movement and remaining-opportunity state.
- **Failure modes / counterexamples:** one isolated trade at the ASK can lift LAST without the whole market moving; stale LAST can make the return appear frozen; bid-ask bounce can create false short-window up/down moves; a huge positive return can indicate the move is already consumed rather than attractive.
- **Relationship to other evidence:** PW-001 says how far traded price moved. PW-003 says how fast, PW-004 whether that speed is changing, PW-005 whether the move is fresh or front-loaded, and PW-002 checks whether the quote midpoint moved with it.
- **Worked example:** if LAST was 100.00 sixty seconds ago, 100.10 thirty seconds ago and 100.30 now, the 60s return is +0.30% and the 30s return is about +0.20%. That shape suggests recent upward movement, but by itself does not tell us whether the current BID is high enough to exit profitably or whether the move has already exhausted.
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
- **Plain-language intuition:** `MID` is the midpoint between the best displayed buyer price (`BID1`) and best displayed seller price (`ASK1`). This metric asks whether the **center of the quoted market** has moved up or down over recent windows.
- **Market mechanism / why it can matter:** LAST can move because of one trade, while BID and ASK remain where they were. If MID rises too, the entire top-of-book pricing environment has shifted upward. That makes the move less dependent on a single print and more reflective of current quoted willingness to buy/sell.
- **Objective connection:** we want to enter now and later have a better exit bid. Upward MID migration suggests that both sides of the immediate market have, on average, shifted upward, which can make later BID improvement more plausible than a LAST-only spike.
- **Favorable / unfavorable interpretation:** LAST up + MID up is stronger confirmation than LAST up alone. LAST up while MID is flat/down can mean the trade price moved without broad quote support. MID up while LAST is stale may indicate quotes are moving before the next trade print, which could be early information but also merely a spread shift.
- **Failure modes / counterexamples:** MID can rise simply because ASK jumps while BID stays unchanged, creating a wider spread with no improvement in the exit side. Wide or unstable spreads can make MID economically misleading. Missing either BID1 or ASK1 makes MID unknown, not zero.
- **Relationship to other evidence:** PW-002 compresses BID/ASK into one center value; BD-001/BD-002 preserve which side actually moved. Therefore MID confirms structure, while Book/Directional Flow explains the cause.
- **Worked example:** BID/ASK move from 99.90/100.10 to 100.10/100.30. MID rises from 100.00 to 100.20, showing the quoted market moved upward. But if quotes instead change from 99.90/100.10 to 99.90/100.50, MID also rises to 100.20 even though BID did not improve—so BD quote-migration context is necessary.
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
- **Plain-language intuition:** two stocks can both rise 0.30%, but one may do it in 20 seconds and the other in 10 minutes. This metric distinguishes the **rate of movement**, not just the distance travelled.
- **Market mechanism / why it can matter:** our holding horizon is short. A move that is converting price rapidly can reach a small target before latency, spread burden or reversal consumes the opportunity. Slow movement may still be bullish but operationally useless for a seconds-to-minutes strategy.
- **Objective connection:** speed connects directly to `TimeToTarget`. We need enough movement quickly enough that after detection and entry there is still time to reach an exit-worthy BID.
- **Favorable / unfavorable interpretation:** positive and sufficiently fast movement can support a short target; slowing speed can indicate deceleration or a mature move. Extremely high raw speed is not automatically better because it can be a one-tick jump or a move that is already mostly over.
- **Failure modes / counterexamples:** illiquid securities can jump one tick after a long pause and create absurd `%/sec`; irregular sampling can distort naive speed; extrapolating 0.05% per second into future repeated gains is invalid.
- **Relationship to other evidence:** PW-001 gives movement magnitude; PW-003 divides that movement by actual elapsed time. PW-004 then asks whether this speed is increasing or decreasing. RemainingOpportunity decides whether fast past movement still leaves anything useful.
- **Worked example:** +0.20% in 20 seconds is very different from +0.20% in 120 seconds for a 30-second target horizon. The first demonstrates recent fast conversion; the second may be too slow even though both returns are identical.
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
- **Plain-language intuition:** acceleration asks whether the most recent slice is moving faster than the slice just before it. It is the difference between “still going up” and “going up faster now than a moment ago.”
- **Market mechanism / why it can matter:** a fresh opportunity often matters most when movement is becoming more forceful, while a mature move may still be positive but losing speed. Acceleration can therefore distinguish onset/building behavior from simple historical strength.
- **Objective connection:** if upward progress is accelerating near the decision point, there may be more useful lead left for a short entry. If progress is decelerating sharply, the headline return can remain positive while the remaining opportunity is shrinking.
- **Favorable / unfavorable interpretation:** `ACCELERATING` may support an early/building opportunity when accompanied by healthy path and BID/ASK confirmation. `DECELERATING` is cautionary but can also be a harmless pause or pullback before a fresh leg.
- **Failure modes / counterexamples:** two noisy observations can create fake acceleration; a single jump can make the newest slice look explosive; acceleration into a nearby barrier can immediately reverse. Therefore it needs persistence and path/barrier context.
- **Relationship to other evidence:** speed is the current rate; acceleration is the change in that rate. Recency concentration tells whether most of the move happened recently, while PH/PR families tell whether acceleration is clean or already deteriorating.
- **Worked example:** first 20s: +0.05%; next 20s: +0.15%. The second slice progressed three times as much, so the move is accelerating. If the next 20s adds only +0.01%, the same broader uptrend has shifted into deceleration.
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
- **Plain-language intuition:** this asks “how much of the move happened **recently**, close to now?” A stock can be +1% over five minutes but have done almost all of that four minutes ago, or it can have produced most of the rise in the last 30 seconds.
- **Market mechanism / why it can matter:** recent concentration helps identify whether current movement is still active or whether the large longer-window return is stale baggage from an earlier burst.
- **Objective connection:** we care about what can happen after entry now. A move concentrated in the newest slice is generally more relevant to remaining short-horizon opportunity than an equally large move that was front-loaded long before the decision.
- **Favorable / unfavorable interpretation:** `RECENTLY_CONCENTRATED` can indicate a fresh onset or reacceleration; `FRONT_LOADED` warns that the visible large return may mostly describe history. `EVENLY_DISTRIBUTED` can indicate steadier movement but may be slower.
- **Failure modes / counterexamples:** a sudden newest-slice spike can be the very end of the move rather than the beginning; ratios become unstable when the longer-window net move is near zero; reversals inside the window can hide large path movement behind small net return.
- **Relationship to other evidence:** PW-001 says total move; PW-005 says where in time that move occurred. PW-004 asks whether speed is changing, while SQ/RO determine whether the detection point is early enough and whether useful excursion remains.
- **Worked example:** Stock A is +0.40% over 120s, but only +0.02% in the last 30s. Stock B is also +0.40% over 120s but +0.25% in the last 30s. Same 120s return, very different freshness.
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
- **Plain-language intuition:** this compares what actual recent trades (`LAST`) are doing with what the current quoted market center (`MID`) is doing. Are both moving up together, or is only one of them moving?
- **Market mechanism / why it can matter:** when trades and the quoted market center rise together, the movement is supported by both executed prices and current quotes. When they disagree, the signal may be stale, noisy or in transition.
- **Objective connection:** for a later profitable exit we ultimately need current quotes—especially BID—to follow the trade-price move. LAST-only strength without MID movement is less directly useful to our exit objective.
- **Favorable / unfavorable interpretation:** `CONFIRMED_UP` is stronger structural confirmation. `LAST_ONLY_UP` can mean a temporary/high print without book migration. `MID_ONLY_UP` can mean quotes moved before another trade occurred, potentially early but uncertain. `CONFLICTED` requires caution.
- **Failure modes / counterexamples:** MID can rise because ASK widens upward while BID stays flat; LAST can be stale; neither alignment nor disagreement proves future direction. Therefore Book/Directional Flow must explain which quote side moved.
- **Relationship to other evidence:** this is a bridge between Price/Wave and Book. It deliberately avoids duplicating full quote-migration analysis, which belongs to BD-001..BD-003.
- **Worked example:** LAST rises 100.00→100.20 and MID rises 100.00→100.18: broadly confirmed upward movement. If LAST rises to 100.20 while MID remains 100.00, the trade move lacks current quote-center confirmation.
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
- **Plain-language intuition:** once Issue #6 defines a wave, this simply asks how long the broader upward/downward episode has already been running.
- **Market mechanism / why it can matter:** older waves have had more time to consume available movement, attract late entrants and encounter exhaustion, but age alone does not determine whether opportunity remains. A long wave can generate a fresh sub-leg.
- **Objective connection:** wave age is useful mainly as a lateness/context variable: entering near the beginning of a still-valid move can be different from entering after a long mature episode. It helps prevent “strong because it has risen for a long time” from being mistaken for “good to enter now.”
- **Favorable / unfavorable interpretation:** younger can mean fresher, but also less confirmed. Older can mean mature, but can still be healthy if a reset/reclaim created renewed opportunity. Therefore there is no universal “younger = better” rule.
- **Failure modes / counterexamples:** poor segmentation can make one wave look artificially old or split one wave into several young waves. A fresh pullback/retest can reset the current leg while the broad wave remains old.
- **Relationship to other evidence:** PW-007 is broad episode age; PW-008 is current-leg age. RO MoveConsumptionState and PR LegResetStrength are more directly tied to remaining opportunity.
- **Worked example:** a broad rise began 8 minutes ago, but after a pullback a new leg started 25 seconds ago. `WaveAgeSeconds` is old, while `LegAgeSeconds` is young—exactly why both are needed.
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
- **Plain-language intuition:** a `leg` is the current directional segment inside a broader wave. This metric asks how long the **current segment** has been running since the latest meaningful reset/pullback.
- **Market mechanism / why it can matter:** short opportunities can renew inside an old wave. A fresh leg after a successful pullback can have more remaining room than the broad wave's age would suggest.
- **Objective connection:** this helps answer whether the actionable move we are considering started recently enough that useful excursion may still remain after entry.
- **Favorable / unfavorable interpretation:** a young leg with reclaim/reacceleration can support renewed opportunity. A very old leg may be more consumed. But an extremely young leg can be unconfirmed and fail immediately.
- **Failure modes / counterexamples:** bad leg segmentation can reset the clock on noise; frequent tiny pullbacks can create many false “young legs.” The metric must be combined with PR reset strength and direct outcome validation.
- **Relationship to other evidence:** WaveAge gives broad context; LegAge focuses on the active segment. PW-009 measures how far that leg has already moved.
- **Worked example:** broad wave age 6 minutes, leg age 20 seconds, leg move +0.08%. This could represent a fresh reacceleration inside an older move rather than a stale six-minute opportunity.
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
- **Plain-language intuition:** after the current leg begins, this asks how far price has already travelled before we consider entering.
- **Market mechanism / why it can matter:** a fresh leg that has moved only a little may still have room, while a leg that already delivered a large rapid move may have less remaining opportunity—even if it still looks strong.
- **Objective connection:** this is directly related to lateness. We do not want to reward a detector merely because it finds the strongest-looking stock after most of the tradable leg is already behind us.
- **Favorable / unfavorable interpretation:** a modest observed move combined with fresh acceleration can indicate early-stage potential. A large observed move can be cautionary if no reset occurred. But large movement after a valid reset can still continue, so no fixed consumed-percentage rule is assumed.
- **Failure modes / counterexamples:** the true capacity of a leg varies by stock/regime; “0.3% already moved” can be huge for one security and ordinary for another. Mechanical subtraction from recent-wave averages is explicitly forbidden.
- **Relationship to other evidence:** RO MoveConsumptionState uses this as one input but also needs recent conditional excursion evidence, timing and reset state. PW-009 remains descriptive past movement, not the remaining-opportunity estimate itself.
- **Worked example:** if the current leg started at 100.00 and is now 100.25, observed leg move is +0.25%. That fact alone cannot tell us whether +0.05% or +0.50% remains; it only tells us how much has already happened.
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
- **Plain-language intuition:** instead of showing ten separate price numbers, this summarizes the current **price process** into an interpretable lifecycle such as quiet, waking, building, accelerating, slowing or reversing.
- **Market mechanism / why it can matter:** the same positive return can occur in very different phases. A move that is just waking up is different from one that is already strong but slowing. The state captures the shape of price evolution, not just its current sign.
- **Objective connection:** higher-level logic needs to know whether price evidence suggests an opportunity is forming, strengthening, mature or deteriorating so it can combine that with activity, book, path quality and remaining opportunity.
- **Favorable / unfavorable interpretation:** `AWAKENING/BUILDING/ACCELERATING` may support potential when confirmed elsewhere. `STRONG` is ambiguous because it can be healthy or already mature. `SLOWING/REVERSING` is protective evidence. `UNDETERMINED` means data does not justify a confident lifecycle label.
- **Failure modes / counterexamples:** a neat state label can create false confidence if thresholds are arbitrary or source inputs are stale. Missing data must lower coverage rather than silently forcing a neutral state.
- **Relationship to other evidence:** PW-010 is the **family synthesis** designed to prevent double counting of overlapping returns, speed and acceleration. It is not the final stock score and does not replace Path/Book/Activity/RemainingOpportunity families.
- **Worked example:** a stock with +0.30%/60s, +0.18%/20s, rising MID and increasing speed might map to `ACCELERATING`; the same +0.30%/60s with only +0.01% in the newest 20s and falling MID could map to `SLOWING`.
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
- **Plain-language intuition:** this counts how many separate trades were completed during each recent window. Twenty trades in 20 seconds describes a very different market pulse from two trades in the same period, even if total traded quantity happens to be similar.
- **Market mechanism / why it can matter:** frequent executions mean buyers and sellers are actively meeting, so price can update more often and a short-lived opportunity has more chances to convert. But trade count alone says nothing about which side is stronger or whether those trades are tiny.
- **Objective connection:** our strategy needs a move to develop and later provide an exit within seconds to roughly two minutes. A stock with almost no recent executions may simply be too inactive for that objective, while rising execution count can indicate that the market is becoming active enough for a quick opportunity to exist.
- **Favorable / unfavorable interpretation:** a rising count can support the idea that participation is waking up, especially when price/BID are also progressing upward. Low count can mean inactivity, but a low-count stock can still jump sharply; high count can also accompany selling pressure or churn.
- **Failure modes / counterexamples:** 50 tiny trades can be less economically meaningful than 5 large trades; a burst of trades can be panic selling; repeated executions at the same price can increase count without producing any upward progress. Reset/session errors can create impossible deltas and must not be interpreted as activity.
- **Relationship to other evidence:** AF-001 measures how many executions occurred. AF-002 adjusts that count for elapsed time, AF-005 measures total quantity, AF-006 measures monetary value, and Price/Book families determine direction and price response.
- **Worked example:** 30 trades in the last 20s and 5 trades in the prior 20s means participation accelerated sharply. That is useful context, but if BID and MID are falling, the burst is not a bullish signal.
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
- **Plain-language intuition:** trade count tells how many trades occurred; trade rate tells how densely they occurred in time. Ten trades in 10 seconds is much more active than ten trades in 60 seconds.
- **Market mechanism / why it can matter:** short-horizon opportunities depend on how quickly market participants are interacting. Higher trades-per-second means the market is updating its executed consensus more rapidly, which can help a move reach a target sooner—or can accelerate a reversal just as quickly.
- **Objective connection:** because the target horizon is measured in seconds/minutes, elapsed-time-normalized activity is more useful than raw count. We care whether enough market interaction is occurring fast enough for entry→exit to happen before the opportunity expires.
- **Favorable / unfavorable interpretation:** increasing trade rate can support a fresh move when price and book move in the desired direction. Falling trade rate during a supposed breakout can suggest weak follow-through. However, very high rate during violent selling or two-sided churn is not favorable by itself.
- **Failure modes / counterexamples:** collector cadence can quantize short windows; a sudden cluster of tiny prints may inflate rate; high rate with no progress can be exhaustion/churn rather than strength.
- **Relationship to other evidence:** AF-002 is AF-001 divided by actual elapsed time. AF-003 asks whether this rate itself is accelerating. PH EffortToProgress later checks whether the activity rate is converting into price progress.
- **Worked example:** 12 trades over 12s = 1 trade/sec; 12 trades over 60s = 0.2 trades/sec. Same count, very different suitability for a 20–30s opportunity.
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
- **Plain-language intuition:** this asks whether trades are arriving faster now than just before. It is the activity equivalent of price acceleration.
- **Market mechanism / why it can matter:** a market can transition from quiet to active before or during a short move. Rising execution intensity may indicate more participants are becoming involved, while falling intensity can signal that the burst is losing energy.
- **Objective connection:** a fresh rise in trade-rate can provide earlier evidence that conditions are changing quickly enough for a seconds-to-minutes opportunity. It can be especially useful when it appears before or alongside price/BID acceleration.
- **Favorable / unfavorable interpretation:** `ACCELERATING` activity plus upward price/book migration can support an emerging opportunity. `DECELERATING` activity while price stalls can be cautionary. But accelerating activity with falling price is adverse, and decelerating activity after a clean breakout can simply mean temporary consolidation.
- **Failure modes / counterexamples:** one short burst can create false acceleration; different-sized comparison windows can distort the state; increased rate may be sellers hitting bids rather than buyers lifting asks.
- **Relationship to other evidence:** AF-003 says whether activity speed is changing; AF-004 turns that into a broader burst lifecycle. Direction still comes from PW/BD, while PH evaluates whether the added effort is producing useful progress.
- **Worked example:** previous 20s = 4 trades, latest 20s = 18 trades. Activity clearly accelerated. If BID1 simultaneously rises and price moves cleanly, that combination is more meaningful than AF-003 alone.
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
- **Plain-language intuition:** instead of saying “37 trades = high”, this asks whether the stock is dormant, normal, waking up, bursting, already in sustained high activity, or cooling.
- **Market mechanism / why it can matter:** absolute trade counts vary enormously by stock and time of day. What matters is often the transition from the stock's recent baseline into unusually intense activity, because regime changes can accompany opportunity onset.
- **Objective connection:** the engine wants to discover opportunities near their beginning, not after a long established burst. Distinguishing `WAKING` from `HIGH_ACTIVITY` helps separate a fresh activation from a possibly mature crowded state.
- **Favorable / unfavorable interpretation:** `WAKING/BURSTING` can be useful when upward Price/Book evidence confirms direction. `HIGH_ACTIVITY` is ambiguous: it may mean strong continuation or a mature volatile battle. `COOLING` can warn that momentum support is fading.
- **Failure modes / counterexamples:** market-wide news can raise activity everywhere; open/close periods naturally have different baselines; one illiquid stock can look like it “burst” from 0 to 2 trades. Without self/time-of-day normalization, state confidence must remain limited.
- **Relationship to other evidence:** AF-004 summarizes AF-001..AF-003 and later cross-sectional/time-of-day context. It should not become an independent extra vote on top of its inputs.
- **Worked example:** a stock normally shows 1–2 trades per 20s, then shifts to 10, 18, 24 across successive windows. That is a `WAKING→BURSTING` pattern, but it is only attractive if directional evidence is also favorable.
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
- **Plain-language intuition:** this measures the total number of shares/units traded recently, regardless of how many separate trades were needed to do it.
- **Market mechanism / why it can matter:** high traded quantity means more inventory changed owners. That can indicate materially larger participation than trade count alone suggests. A move supported by meaningful quantity can be harder to dismiss as a few tiny prints—but quantity still has no direction by itself.
- **Objective connection:** for a quick trade, substantial recent quantity can support the idea that enough real participation exists for the move and later exit to be executable, especially when the displayed book and price are moving consistently.
- **Favorable / unfavorable interpretation:** rising quantity together with rising BID/MID and clean price progress can strengthen confirmation. High quantity with flat/falling price may indicate absorption, churn or heavy selling. Low quantity can make a price jump fragile.
- **Failure modes / counterexamples:** one block trade can dominate the window; raw quantities are not comparable across securities with different prices/liquidity; a huge quantity can trade without moving price at all.
- **Relationship to other evidence:** AF-001 measures number of trades; AF-005 measures total quantity. AF-007 combines them into average quantity per trade. AF-006 translates executed activity into money value.
- **Worked example:** Window A has 20 trades totaling 2,000 shares; Window B has 5 trades totaling 20,000 shares. Trade count favors A, quantity favors B—showing why both dimensions are needed.
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
- **Plain-language intuition:** this asks how much money changed hands recently, not merely how many trades or shares were involved.
- **Market mechanism / why it can matter:** the same share quantity can represent very different economic participation in a ₪5 stock versus a ₪500 stock. Monetary turnover provides a more comparable sense of capital actually transacted, although it still depends strongly on security size/liquidity.
- **Objective connection:** a short opportunity supported by meaningful economic turnover may be more robust than one produced by tiny nominal activity, because enough capital is interacting to move and potentially support the exit side.
- **Favorable / unfavorable interpretation:** increasing money turnover plus favorable price/book migration can confirm that the upward move is attracting economically meaningful participation. High money turnover during falling prices can instead indicate strong adverse selling pressure.
- **Failure modes / counterexamples:** large-cap or expensive securities naturally produce larger monetary turnover; one block can dominate; cross-stock comparisons require normalization; monetary value alone does not tell us who was aggressive.
- **Relationship to other evidence:** AF-006 complements AF-001 count and AF-005 quantity. Agreement across all three can raise family confidence, but because they are correlated they must not be scored as three independent signals.
- **Worked example:** 10,000 shares traded in a ₪2 stock ≈ ₪20,000 turnover, while 10,000 shares in a ₪200 stock ≈ ₪2,000,000. Same quantity, very different economic scale.
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
- **Plain-language intuition:** this divides recent traded quantity by number of trades to estimate the average trade size in the sampled window.
- **Market mechanism / why it can matter:** many tiny trades can create high activity count without much inventory transfer, while fewer larger trades can represent more concentrated size. The mix can help describe what kind of participation is occurring.
- **Objective connection:** understanding whether activity is count-led or size-led helps judge whether a burst is likely to provide enough depth/participation for a short move and later exit, while avoiding overvaluing a flood of tiny prints.
- **Favorable / unfavorable interpretation:** rising average size together with rising trade rate and upward price/book progress may suggest broadening participation. A sudden giant average caused by one block is ambiguous. Falling average size with exploding count can still be healthy if the market is becoming highly active.
- **Failure modes / counterexamples:** the arithmetic mean hides the distribution; one huge trade can distort it; no value exists when trade count is zero; snapshot data cannot reconstruct each individual trade size distribution.
- **Relationship to other evidence:** AF-007 explains the relationship between AF-001 count and AF-005 quantity. `LastDealVolume` gives one latest-trade sample, whereas AF-007 summarizes a whole window.
- **Worked example:** 100 trades totaling 10,000 shares → average 100 shares/trade. Ten trades totaling 10,000 shares → average 1,000 shares/trade. Same quantity, very different execution pattern.
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
- **Plain-language intuition:** this checks whether trade frequency, traded quantity and monetary turnover are all expanding together, or whether only one dimension is responsible for the apparent burst.
- **Market mechanism / why it can matter:** a broad expansion is harder to dismiss as a single artifact. For example, rising count + rising quantity + rising money turnover suggests participation is expanding in several ways. Count-only expansion may simply be many tiny trades; size-only expansion may be one block.
- **Objective connection:** the short-horizon engine benefits from knowing whether the activity environment is genuinely broadening enough to support fast movement and exitability, rather than reacting to one noisy counter.
- **Favorable / unfavorable interpretation:** `EXPANDING` can strengthen confidence in an emerging move when direction is favorable. `COUNT_LED` or `SIZE_LED` is not bad, but should be interpreted more cautiously. `CONTRACTING` during a slowing move can support exhaustion concerns.
- **Failure modes / counterexamples:** the three inputs are mechanically related and correlated; a broad expansion can still be downward; a market-wide activity shock can make many stocks look expanded simultaneously.
- **Relationship to other evidence:** AF-008 is a family interpretation layer, not another independent measurement. It synthesizes AF-003/005/006 and later feeds PH EffortToProgress plus Sequence.
- **Worked example:** trade rate doubles, quantity triples and money turnover triples while BID/MID rise: broad participation expansion. If only trade count doubles while quantity/money barely change, the burst is count-led and weaker evidence.
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
- **Plain-language intuition:** this asks whether the most recent trade was unusually small or large compared with the recent trading pattern.
- **Market mechanism / why it can matter:** a very large latest print can be evidence that a meaningful amount of inventory just changed hands, while a tiny print may be less informative. But one trade is always weak evidence because it may be isolated.
- **Objective connection:** when a large latest trade occurs during an already favorable upward sequence, it may strengthen confirmation that the move is supported by material executed size. Conversely, a large print with no upward progress can be cautionary.
- **Favorable / unfavorable interpretation:** large-in-context plus upward BID/MID continuation can support confirmation. Large-in-context with immediate stall/giveback may indicate absorption or a block that did not improve the opportunity. Small does not automatically mean weak if many small trades are occurring rapidly.
- **Failure modes / counterexamples:** `LastDealVolume` had partial measured coverage; timestamps can be stale relative to the current snapshot; one large print can be negotiated/block-like and not representative of continuing flow.
- **Relationship to other evidence:** AF-009 is one-print context. AF-007 summarizes average size over a window. It should never override the broader activity profile.
- **Worked example:** recent average size ≈ 200 shares/trade and latest trade = 2,000 shares. That is large relative to local context, but only becomes useful evidence if subsequent price/book behavior supports it.
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
- **Plain-language intuition:** this would measure the exact time gaps between individual trades—e.g. 800ms, 300ms, 120ms—rather than inferring activity from cumulative counters sampled every few seconds.
- **Market mechanism / why it can matter:** shrinking gaps between trades can show a market rapidly speeding up in true event time. That can reveal onset earlier and more precisely than snapshot trade-count deltas.
- **Objective connection:** for very short opportunities, knowing whether executions are arriving every fraction of a second versus every several seconds can materially affect how quickly a move may reach an exit target and whether our collector is already too slow.
- **Favorable / unfavorable interpretation:** rapidly shrinking inter-trade durations can indicate accelerating activity when combined with favorable direction. Long gaps can indicate inactivity. Neither state is directional by itself.
- **Failure modes / counterexamples:** this cannot be reconstructed honestly from current snapshot counters. Fabricating exact trade times from polling intervals would create false precision. Even very rapid trades can be adverse selling.
- **Relationship to other evidence:** AF-002 is a coarse snapshot-based rate proxy; AF-010 would be the true event-time version if trade-tape data becomes available. Issue #12 decides whether richer tape is worth the dependency.
- **Worked example:** three trades observed individually at gaps of 2.0s, 0.8s and 0.2s show true acceleration. A 5s polling snapshot might only report “3 trades happened” and lose that sequence.
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
- **Plain-language intuition:** this compresses the activity evidence into a readable lifecycle: dormant, normal, waking, accelerating, expanding, high-activity or cooling.
- **Market mechanism / why it can matter:** activity is multi-dimensional. The family state summarizes whether the market is becoming more active, broadly expanding, already very active, or losing participation—without pretending activity alone gives direction.
- **Objective connection:** higher-level opportunity logic needs to know whether there is enough and changing executed participation to support a short move, while relying on Price/Book/Path to decide whether that participation is helping the desired upward path.
- **Favorable / unfavorable interpretation:** `WAKING/ACCELERATING/EXPANDING` can support early opportunity formation when upward directional evidence agrees. `HIGH_ACTIVITY` can be continuation or late-stage battle. `COOLING` can weaken confidence, especially if price progress is also stalling.
- **Failure modes / counterexamples:** strong activity can accompany crashes, churn or exhaustion; a family state built from missing inputs can look cleaner than reality unless Coverage is preserved; correlated submetrics must not be double-counted.
- **Relationship to other evidence:** AF-011 is the intended family synthesis. Price/Wave supplies direction/progress, Book supplies L1 directional structure, PH evaluates effort-to-progress conversion, and SQ handles ordering/timing.
- **Worked example:** trade rate rises, quantity and money turnover expand, but BID/MID fall. AF-011 may be `EXPANDING`, while the overall opportunity remains poor because the activity is occurring in the wrong direction.
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

This family works with **displayed Level 1 (L1) evidence**: the current best bid, best ask and their displayed quantities. It does not claim true signed order flow from the current snapshot feed.

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
- **Derivation:** price change/return of valid BID1 across recent observation windows; candidate lags include ~10/20/30/40/50/60/90s (and longer research windows where useful), always using actual observation timestamps/tolerance rather than assuming exact cadence
- **Unit / shape:** price/percent profile by actual elapsed horizon
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + GL + H
- **Meaning:** detects whether the best displayed buyer price is rising, holding or retreating across short horizons — i.e. whether the market's current best displayed willingness-to-pay has migrated upward or downward
- **Plain-language intuition:** this compares the current best bid (`BID1`) with the best bid from 10/20/30/40/50/60/90 seconds ago. It asks: “are the most aggressive displayed buyers willing to pay more now than they were a short time ago?”
- **Market mechanism / why it can matter:** if BID1 keeps stepping upward, the exit side that matters to a future seller is improving. That can reflect buyers competing at progressively higher prices. If BID1 retreats, the market is offering less for an immediate sale even if the latest trade is still high.
- **Objective connection:** our strategy ultimately needs a higher future bid after entry. BID migration is therefore directly connected to the price at which we may later be able to sell, not merely to where the last transaction printed.
- **Favorable / unfavorable interpretation:** rising BID across several short horizons can support upward pressure, especially if ASK/MID and executed prices also rise. Flat BID with rising LAST can mean the exit side is not following. Falling BID is cautionary, but can occur during a temporary pullback before a fresh reclaim.
- **Failure modes / counterexamples:** a single small displayed order can lift BID briefly; BID can disappear or move because of cancellation/replacement; a higher BID with tiny depth may not support our position size; a wide spread can make BID improvement insufficient economically.
- **Relationship to other evidence:** BD-001 tells us how the buyer-side price moved. BD-002 tells how the seller-side price moved, BD-003 combines both, and BD-017/018 ask whether the current BID is high enough relative to historical entry references.
- **Worked example:** BID1 moves 100.00→100.10→100.20 over 40 seconds while ASK1 moves similarly. That is a cleaner upward migration than LAST rising to 100.20 while BID remains stuck at 100.00.
- **Known overlaps:** BD-003, PW-002 MID movement
- **Confidence limits:** BID1 can disappear or jump because displayed liquidity changes; invalid/zero quote must not be treated as a real price
- **Validation targets:** next MID direction, target-before-adverse, continuation
- **Research state:** Candidate

### BD-002 — BestAskMoveProfile

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** `SellLimit1` history + timestamps
- **Derivation:** price change/return of valid ASK1 across recent observation windows; candidate lags include ~10/20/30/40/50/60/90s (and longer research windows where useful), always using actual observation timestamps/tolerance rather than assuming exact cadence
- **Unit / shape:** price/percent profile by actual elapsed horizon
- **Role:** LEADING, CONFIRMING, PROTECTIVE
- **Availability:** NOW
- **Evidence:** PV(field semantics/coverage) + PI + GL + H
- **Meaning:** detects whether the best displayed seller price is moving upward, holding or retreating across short horizons — observable seller-side quote migration, without claiming participant identity or intent
- **Plain-language intuition:** this compares the current best ask (`ASK1`) with the ask from recent horizons. It asks whether the cheapest displayed seller is demanding a higher, lower or unchanged price.
- **Market mechanism / why it can matter:** when ASK1 rises, the cheapest displayed offer has moved upward; when it falls, sellers are willing to offer lower. But ASK movement alone is ambiguous because it can reflect genuine upward repricing or simply a widening/narrowing spread.
- **Objective connection:** ASK matters on entry and as part of the future price structure. If both BID and ASK migrate upward, the market center is moving in our desired direction. If ASK rises while BID does not, the entry cost may worsen without improving our exit side.
- **Favorable / unfavorable interpretation:** ASK rising together with BID/MID can support whole-book upward migration. ASK falling toward a stable BID may improve entry cost rather than signal weakness. ASK collapsing while BID also falls is more clearly adverse.
- **Failure modes / counterexamples:** one seller cancelling can cause ASK to jump upward without any trade or real buying pressure; ASK can fall because a new seller undercuts even during a broader uptrend; low displayed depth can make quote levels unstable.
- **Relationship to other evidence:** BD-002 is seller-side quote movement. BD-001 is buyer-side movement. The same ASK change has different meaning depending on BID, spread, LAST and persistence, which BD-003/014 preserve.
- **Worked example:** ASK1 rises 100.20→100.40 while BID stays 100.00: spread widens, not necessarily bullish. If BID also rises 100.00→100.20, the whole top of book shifted upward.
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
- **Plain-language intuition:** two markets can end with the same spread but arrive there for opposite reasons. This state records whether BID chased upward, ASK retreated downward, both sides moved up/down, or the spread merely compressed/expanded.
- **Market mechanism / why it can matter:** the cause of spread change matters. BID rising toward ASK can reflect stronger willingness to pay; ASK falling toward BID can reflect sellers accepting less. Both reduce spread, but the directional story is different.
- **Objective connection:** we care whether the market is repricing upward in a way that improves future exitability, not merely whether the spread got smaller. QuoteMigrationState keeps that directional information.
- **Favorable / unfavorable interpretation:** `WHOLE_BOOK_UP` or persistent `BID_CHASING` can support upward pressure. `WHOLE_BOOK_DOWN` is adverse. `COMPRESSION` and `EXPANSION` are ambiguous until we know which side caused them.
- **Failure modes / counterexamples:** snapshot polling can miss intermediate quote moves; one-side cancellation can create a jump; labels describe observable quote behavior, not participant motive.
- **Relationship to other evidence:** BD-003 synthesizes BD-001/002. TE family later evaluates whether the resulting spread is tradable, while PW/MID confirms whether price actually follows.
- **Worked example:** Case A: 100.00/100.20 → 100.10/100.20 = BID chasing. Case B: 100.00/100.20 → 100.00/100.10 = ASK retreating. Both end with 0.10 spread, but only A improved the exit-side bid.
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
- **Plain-language intuition:** this compares displayed quantity at the best bid with displayed quantity at the best ask. If much more size is shown on the bid, the top of book looks buyer-heavy; if more is shown on the ask, it looks seller-heavy.
- **Market mechanism / why it can matter:** displayed imbalance can affect how easily the best quote moves. A relatively thick bid and thin ask may make upward movement easier at the top of book, while the reverse can create more immediate resistance. But displayed size is only what is visible now.
- **Objective connection:** for a quick buy→sell opportunity, a stronger displayed bid side may support exitability and reduce immediate downside, while a thin ask can lower the visible quantity that must trade before the quote steps higher.
- **Favorable / unfavorable interpretation:** positive imbalance can support upward context when it persists and quote prices also migrate upward. Negative imbalance can be cautionary. Either can be meaningless if displayed size cancels quickly or price moves against it.
- **Failure modes / counterexamples:** large displayed orders can be cancelled, replaced or partially executed; quantity does not equal number of participants; one snapshot can be misleading; imbalance can be high simply because spread/tick regime makes queues accumulate differently.
- **Relationship to other evidence:** BD-004 is a static quantity ratio. BD-006/007 ask whether displayed depth persists. BD-005 converts the same information into a microprice tilt, so the two must not receive independent full weight.
- **Worked example:** BID size 10,000 and ASK size 2,000 gives strong positive imbalance. If the 10,000 bid disappears next snapshot, the initial reading was weak; persistence matters.
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
- **Plain-language intuition:** `Microprice` takes BID/ASK prices and their displayed quantities and shifts a reference toward the side that appears harder to consume. If bid size dominates ask size, the reference moves closer to ASK; if ask size dominates, it moves closer to BID.
- **Market mechanism / why it can matter:** unequal visible depth can make one side of the spread easier to clear than the other. The microprice is a compact way to express that top-of-book asymmetry in price units.
- **Objective connection:** a microprice tilted upward can support the idea that the next market-center movement may favor higher prices, which is useful for a short entry only when combined with real quote migration and price confirmation.
- **Favorable / unfavorable interpretation:** upward tilt can support upward pressure; downward tilt can warn of seller-side weight. A strong tilt with no subsequent price progress may actually become evidence of failed pressure or absorption.
- **Failure modes / counterexamples:** it is mathematically derived from queue imbalance, so it can double-count the same information; displayed quantities can vanish; wide spreads can exaggerate the absolute tilt; it is not a fair-value estimate or guaranteed next price.
- **Relationship to other evidence:** BD-005 is largely a transformed version of BD-004 and should be treated as an alternate representation/diagnostic unless validation proves extra value.
- **Worked example:** BID/ASK 100/101 with bid size 9,000 and ask size 1,000 yields a microprice close to 100.9, near the ask. That shows displayed buyer-side weight, not proof that the next trade will be 101.
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
- **Plain-language intuition:** instead of asking “is the bid big now?”, this asks whether meaningful bid quantity remains present, rebuilds after being reduced, or disappears over several observations.
- **Market mechanism / why it can matter:** persistent displayed demand can make the current bid level more credible than a one-frame spike. Rebuilding after executions/cancellations can indicate continued displayed interest, though we cannot know whether it is the same participant.
- **Objective connection:** persistent bid depth can support the ability to exit and can reduce immediate adverse movement while we wait for a short target, especially when BID itself is also moving upward.
- **Favorable / unfavorable interpretation:** `PERSISTENT/REBUILDING` can strengthen buyer-side support; `WEAKENING` can warn that the visible floor is losing support. Persistence without price progress can also mean heavy selling is being absorbed at the bid.
- **Failure modes / counterexamples:** snapshots cannot identify order identity; apparent rebuilding may be entirely new orders; a persistent large bid can still vanish suddenly; displayed size may be insufficient for our full position.
- **Relationship to other evidence:** BD-006 adds time/persistence to static BD-004 imbalance. TE depth ratios later ask whether the quantity is enough for our intended size.
- **Worked example:** bid size remains around 8k–10k shares across four observations while BID rises one tick: more supportive than a single 10k snapshot that vanishes immediately.
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
- **Plain-language intuition:** this asks whether visible selling quantity at the best ask stays present, keeps replenishing, weakens, or disappears across observations.
- **Market mechanism / why it can matter:** persistent/replenishing ask depth can act as a visible obstacle to upward progress; weakening ask depth can make it easier for price to step higher. But snapshots cannot prove iceberg behavior or seller identity.
- **Objective connection:** our short upward target is harder to reach if the best ask repeatedly presents substantial visible supply and price fails to progress. Conversely, ask depth that thins while BID rises can support continuation.
- **Favorable / unfavorable interpretation:** `WEAKENING` ask depth with upward quote migration can be favorable. `PERSISTENT/REPLENISHING` ask with stalled price can be cautionary. Replenishment during strong upward progress may simply reflect healthy two-sided liquidity rather than resistance.
- **Failure modes / counterexamples:** quote replacement can mimic replenishment; a large ask can be cancelled instantly; a small ask can hide deeper selling unavailable in L1.
- **Relationship to other evidence:** BD-007 complements BD-006 and static imbalance. PH effort-to-progress later determines whether persistent displayed supply is actually preventing upward movement.
- **Worked example:** ASK size 2k gets reduced, then returns to 2k on several snapshots while price fails to advance: possible persistent visible obstacle, but not proof of an iceberg.
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
- **Plain-language intuition:** this summarizes whether displayed top-of-book quantities consistently lean upward, downward, balanced or unstable over time.
- **Market mechanism / why it can matter:** persistent asymmetry is more informative than one snapshot because temporary orders/cancellations are common. Combining imbalance with persistence can reveal whether visible pressure has continuity.
- **Objective connection:** a sustained upward lean can support the idea that current BID/ASK structure is favorable enough for a short upward move and exit, while downward/unstable pressure can reduce confidence.
- **Favorable / unfavorable interpretation:** `UP_LEAN` is supportive only when price/quote migration confirms it. `DOWN_LEAN` is protective/adverse. `CONFLICTED/UNSTABLE` means displayed liquidity is not giving a reliable directional clue.
- **Failure modes / counterexamples:** persistent displayed pressure can still fail to move price; the same large bid can absorb selling without causing a rise; snapshots remain vulnerable to hidden/deeper liquidity not seen in L1.
- **Relationship to other evidence:** BD-008 synthesizes BD-004/006/007 so they should not be summed independently. BD-016 later combines this with quote migration and trade-location evidence.
- **Worked example:** bid-heavy imbalance persists for 40s while BID/ASK step upward → stronger upward context. Same imbalance with flat/falling quotes → weak or misleading pressure.
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
- **Plain-language intuition:** this tells how far the current best seller price sits above the latest traded price. It is the immediate gap from the last transaction reference to what a buyer would currently have to pay at the ask.
- **Market mechanism / why it can matter:** a shrinking gap can occur because LAST rises toward ASK or because ASK falls toward LAST—two very different situations. The raw gap shows distance; dynamics tell the cause.
- **Objective connection:** if we enter aggressively at ASK, this gap helps describe how far current transaction price is from the entry-side quote and how much upward price movement may be needed for trade prices to catch up.
- **Favorable / unfavorable interpretation:** a small gap can mean tight alignment, but may simply reflect a narrow spread. A large gap can mean poor immediate entry economics rather than “room to rise.” Direction depends on why the gap changed.
- **Failure modes / counterexamples:** stale LAST can make ASK-LAST look large; ASK can jump after a cancellation; comparing unsynchronized trade/quote snapshots can create misleading geometry.
- **Relationship to other evidence:** BD-009 is one side of the LAST/quote geometry. BD-010 gives LAST-to-BID distance, BD-012 normalizes LAST position inside the spread, BD-014 explains the dynamics.
- **Worked example:** LAST=100, ASK=100.30 gives +0.30%. If ASK fell from 100.50 while LAST stayed 100, the smaller gap reflects sellers retreating downward—not buyer-driven upward movement.
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
- **Plain-language intuition:** this tells how far the current best buyer price is below the latest trade. It approximates how much price concession someone referencing the latest trade would face if they had to sell immediately at BID1.
- **Market mechanism / why it can matter:** a small LAST-to-BID gap means the exit side is close to the latest traded price; a widening gap can signal weakening buyer-side support or simply a wider spread.
- **Objective connection:** our future sale occurs on the buyer side. A smaller gap can make a recent trade price more economically realizable; a large gap can mean headline LAST strength is not currently available as an exit price.
- **Favorable / unfavorable interpretation:** shrinking gap due to BID rising toward LAST is favorable exit-side improvement. Shrinking gap because LAST falls toward BID is not favorable. Cause must be retained.
- **Failure modes / counterexamples:** stale LAST, wide spread, quote jumps and unsynchronized snapshots can distort the reading; a close BID with tiny depth may still be unusable.
- **Relationship to other evidence:** BD-010 complements BD-009 and directly motivates BD-017 historical-LAST→current-BID return. BD-014 distinguishes whether BID moved or LAST moved.
- **Worked example:** LAST=100.30, BID=100.20 → gap≈0.10%. If BID rises to 100.28 while LAST holds, exitability improves; if LAST falls to 100.22 while BID stays, the same smaller gap has a different story.
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
- **Plain-language intuition:** this compares the last traded price with the center between current BID and ASK. If LAST is above MID, the latest trade sits toward the seller side; if below, toward the buyer side.
- **Market mechanism / why it can matter:** repeated trades occurring nearer the ask than the bid can accompany upward pressure; nearer the bid can accompany downward pressure. But because quotes may move after the trade, this is only snapshot geometry.
- **Objective connection:** trade location can help confirm whether recent executions are occurring on the side consistent with upward repricing, which may improve the chance of a higher future BID.
- **Favorable / unfavorable interpretation:** LAST persistently above MID plus upward quote migration is supportive. LAST below MID can be cautionary. A single reading is weak because quote movement can reposition MID after the trade.
- **Failure modes / counterexamples:** unsynchronized timestamps can place LAST outside the current spread; MID can move because only ASK changes; this is not exact aggressor-side classification.
- **Relationship to other evidence:** BD-011 is a signed distance; BD-012 expresses the same geometry normalized by spread. BD-015 looks at persistence/trend across observations.
- **Worked example:** BID/ASK=100/100.20, MID=100.10, LAST=100.18 → trade sits near ask side. If quotes later move to 100.20/100.40 while LAST stays 100.18, the geometry flips without a new trade.
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
- **Plain-language intuition:** this maps LAST's location inside the current BID–ASK interval: near 0 means close to BID, near 0.5 means near the middle, near 1 means close to ASK.
- **Market mechanism / why it can matter:** persistent trade location near ASK can indicate trades occurring toward the upper edge of the quoted market; persistent location near BID can indicate the opposite. It compresses absolute gap sizes into a spread-relative position.
- **Objective connection:** spread-relative trade location can confirm whether executions are happening on the side that supports an upward move, which matters before expecting a better future exit bid.
- **Favorable / unfavorable interpretation:** repeated values near the ASK side plus upward quotes can support upward flow. Values near BID can warn of downward pressure. Values outside [0,1] are not errors by definition; they may indicate quotes moved after the last trade.
- **Failure modes / counterexamples:** wide/narrow spread changes alter the normalized position; stale LAST can produce extreme values; clamping outside values would destroy potentially useful timing information.
- **Relationship to other evidence:** BD-012 unifies BD-009/010/011 into one normalized geometry; BD-013 measures how that position changes through time.
- **Worked example:** BID=100, ASK=101, LAST=100.8 → position=0.8, near ask. If current quotes jump to 101/102 without a new trade, position becomes -0.2; that signals timing mismatch/quote migration, not an impossible price.
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
- **Plain-language intuition:** instead of one spread-position snapshot, this asks whether LAST's relative location is moving upward toward ASK, downward toward BID, or oscillating.
- **Market mechanism / why it can matter:** a persistent migration toward ASK can show that executed prices are increasingly occupying the upper part of the quoted market; migration toward BID can show weakening. But the movement can be caused by LAST, quotes, or both.
- **Objective connection:** a short upward opportunity is more convincing when trade location increasingly supports the upper side while BID/ASK themselves also move upward.
- **Favorable / unfavorable interpretation:** upward migration with whole-book-up movement is supportive. Upward normalized position caused only by ASK collapsing can mean something different. Downward migration is cautionary.
- **Failure modes / counterexamples:** quote changes alone can move the normalized position; sparse observations can skip intermediate states; noisy spread changes can create artificial velocity.
- **Relationship to other evidence:** BD-013 is the dynamic version of BD-012. BD-014 decomposes the cause, preventing us from treating all position changes as the same story.
- **Worked example:** spread position 0.3→0.6→0.9 while BID/ASK both rise suggests trades migrating upward. The same 0.3→0.9 with ASK falling sharply may not indicate buyer-driven progress.
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
- **Plain-language intuition:** this is the “why did the geometry change?” state. It distinguishes LAST rising toward ASK, ASK falling toward LAST, BID rising toward LAST, LAST falling toward BID, or the whole structure moving together.
- **Market mechanism / why it can matter:** identical gap changes can result from opposite forces. The market story matters because buyer-driven upward repricing is more aligned with our objective than sellers simply lowering their asks.
- **Objective connection:** we need evidence that can plausibly produce a higher future BID after entry. Knowing whether BID/LAST/ASK are moving together upward versus merely compressing toward each other helps judge that.
- **Favorable / unfavorable interpretation:** `WHOLE_STRUCTURE_UP`, `BID_CHASING_LAST`, or LAST rising toward a stable/rising ASK can support upward progress. `ASK_RETREATING_TO_LAST` may improve entry cost but is not the same directional signal. `WHOLE_STRUCTURE_DOWN` is adverse.
- **Failure modes / counterexamples:** labels rely on snapshot differences, not participant intent; multiple changes may occur between observations; short-lived quote jumps can produce unstable classification.
- **Relationship to other evidence:** BD-014 is the causal-structure guard around BD-009..013 and BD-001/002. It prevents simple gap contraction from being blindly scored.
- **Worked example:** ASK-LAST goes from 0.30% to 0.10%. Scenario A: LAST rises 100→100.20, ASK stays 100.30. Scenario B: LAST stays 100, ASK falls 100.30→100.10. Same final gap, very different implication.
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
- **Plain-language intuition:** this looks across several observations and asks whether recent trade locations persistently lean toward ASK, BID, the center, or move directionally through the spread.
- **Market mechanism / why it can matter:** repeated upper-spread trade location can be consistent with stronger buying pressure; repeated lower-spread location can be consistent with selling pressure. Persistence matters more than one print.
- **Objective connection:** if executions repeatedly occur near the upper side while the book migrates upward, that can strengthen confidence that the market is repricing in a way favorable to a future exit.
- **Favorable / unfavorable interpretation:** `ASK_LEAN/MIGRATING_UP` can confirm upward context; `BID_LEAN/MIGRATING_DOWN` is cautionary; `CONFLICTED` means trade locations are not giving stable directional evidence.
- **Failure modes / counterexamples:** sparse snapshots miss many trades; quote moves can alter apparent locations; we cannot label hidden individual trades as buyer- or seller-initiated with certainty.
- **Relationship to other evidence:** BD-015 summarizes BD-011/012/013 over time and feeds BD-016; it should not be treated as independent signed order flow.
- **Worked example:** four successive observations place LAST at 0.75, 0.82, 0.90, 0.88 of the spread while quotes rise: persistent ask-side lean. One isolated 0.95 reading would be much weaker.
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
- **Plain-language intuition:** this is the family summary: are quote prices migrating upward, displayed quantities leaning supportively, and trade locations behaving consistently—or are those pieces disagreeing?
- **Market mechanism / why it can matter:** no single L1 metric is reliable enough alone. Combining price migration, persistent displayed pressure and trade-location trend gives a more robust picture of current top-of-book directional structure.
- **Objective connection:** for buy-now/sell-soon, we want the current top of book to support a path toward a higher future BID. BD-016 is the compact directional-book evidence higher-level logic can combine with price, activity, path quality and remaining opportunity.
- **Favorable / unfavorable interpretation:** `UPWARD_FLOW` can strengthen an opportunity when Price/Activity/Path agree. `DOWNWARD_FLOW` is protective/adverse. `CONFLICTED` is valuable information and should reduce confidence rather than being forced to neutral.
- **Failure modes / counterexamples:** L1 is only the visible top level; deeper liquidity is unknown; displayed orders can cancel; snapshot data cannot recover true order flow; one dominant subtype must not overwhelm conflicts from others.
- **Relationship to other evidence:** BD-016 is the intended synthesis of BD-003/008/014/015. BD-019 separately summarizes historical buyer exitability, because backward-looking exitability and current directional pressure are related but not identical.
- **Worked example:** BID/ASK both rising, bid depth persistent, trade locations near ASK → likely `UPWARD_FLOW`. If quotes rise but displayed pressure is unstable and trades sit near BID, state should be `CONFLICTED`, not automatically bullish.
- **Known overlaps:** Sequence, Price/Wave confirmation, future trade-tape flow
- **Confidence limits:** low confidence when only one evidence subtype is available; quote generation can be large relative to executed activity; disagreement across price/activity/book should remain visible
- **Validation targets:** next MID direction, target-before-adverse, TimeToTarget, future cross-sectional rank
- **Research state:** Provisional composite

### BD-017 — HistoricalLastToCurrentBidReturnProfile

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** canonical phase-aware historical `LAST` + current valid BID1 + observation timestamps
- **Derivation:** for each candidate lag `h`, compute `(BID1_now / LAST_then(h) - 1) * 100`; candidate lags include ~10/20/30/40/50/60/90s and may extend to 120s where history supports it
- **Unit / shape:** signed gross-return profile by actual elapsed horizon
- **Role:** CONFIRMING, CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PV(input availability) + PI + H
- **Decision role:** Confirmation, RemainingOpportunity, PathRisk
- **Meaning:** measures the **current top-of-book liquidation return** relative to historical transaction prices. Positive values mean that a hypothetical buyer at the historical trade price would currently see a positive gross mark-to-BID return at the displayed best bid.
- **Plain-language intuition:** look back to a trade price from 10/20/30/... seconds ago and ask: “if someone had bought around that traded price, what is the best displayed buyer willing to pay them right now?” This converts recent history into a direct buyer-exitability view rather than merely asking whether the last trade price itself moved.
- **Market mechanism / why it can matter:** a rising current BID relative to recent historical trade prices means the **exit side of the market** has migrated upward. That is stronger evidence of usable upward progress than a LAST-only rise when the current bid has not followed. Conversely, if LAST rose but BID remains below recent entry references, the apparent move may be less monetisable at the current touch.
- **Objective connection:** the project ultimately cares about buying and then later selling. This metric directly asks whether recent hypothetical buyers have a currently available displayed exit price above their historical entry reference, making it unusually close to the economic question we care about.
- **Favorable / unfavorable interpretation:** broad positive values across several recent lags can suggest that recent buyers are increasingly “in the money” at the current bid and that the market's willingness to pay has advanced. Mixed values can mean the advance is very fresh or fragile. Broad negative values mean many recent entry references are still above the current exit touch.
- **Failure modes / counterexamples:** a positive value can still be unusable when BID depth is too small, the spread is unstable, the quote disappears before execution, the move is already exhausted, or fees/slippage consume the buffer. A negative value can occur during a fresh reversal that has only just begun and still has future opportunity.
- **Relationship to other evidence:** unlike LAST-to-LAST return, it anchors the endpoint on the **current exit side**. Unlike BID-to-BID migration, it anchors the start on an actually observed transaction reference. It should be interpreted together with BID depth, spread, path quality, move-consumption and current directional evidence.
- **Worked example:** LAST 30s ago = 100.00 and BID1 now = 100.30 gives +0.30%. This means the displayed best buyer is now 0.30% above that historical transaction reference; it does not mean our full position was actually bought at 100.00 or can definitely be sold at 100.30.
- **Known overlaps:** PW return profile, BD-001 BID migration, BD-010 LastBidGapPct, RO ObservedMove/MoveConsumption
- **Confidence limits:** historical LAST is a transaction reference, not proof that our strategy could have bought at that exact price; current BID1 is only displayed touch liquidity, not guaranteed fill; available size and costs are separate execution concerns; stale LAST/session boundaries invalidate the comparison
- **Validation targets:** target-before-adverse, continuation, current-to-future BID progression, detection lateness, incremental value beyond LAST/LAST and BID/BID returns
- **Research state:** Candidate — high objective alignment, predictive value still unvalidated

Interpretation example:

~~~text
LAST at t-30s = 100.00
BID1 now       = 100.30

HistoricalLastToCurrentBidReturn(30s) = +0.30%
~~~

This does **not** claim a realized +0.30% trade. It says the current displayed exit side is +0.30% above that historical transaction reference before size, fill certainty, slippage and costs.

### BD-018 — HistoricalAskToCurrentBidTouchReturnProfile

- **Family:** Book / Directional Flow
- **Kind:** DERIVED
- **Raw sources:** historical valid ASK1 + current valid BID1 + observation timestamps
- **Derivation:** for each candidate lag `h`, compute `(BID1_now / ASK1_then(h) - 1) * 100`
- **Unit / shape:** signed gross touch-to-touch round-trip profile by actual elapsed horizon
- **Role:** CONFIRMING, CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PV(L1 availability where valid) + PI + H
- **Decision role:** Confirmation, Feasibility, RemainingOpportunity
- **Meaning:** stricter sibling of BD-017: asks whether a hypothetical trader who could buy at the historical best ask could now liquidate at the current best bid for a positive **gross top-of-book** return
- **Plain-language intuition:** instead of assuming entry at the historical traded price, pretend we had to **cross the spread and buy immediately at ASK1** at time t. Then ask whether the best buyer after h seconds is already above that old ASK. This is a much tougher test because it naturally includes the entry-side spread burden.
- **Market mechanism / why it can matter:** for a short holding period, price appreciation is only useful if it exceeds the gap between where an immediate buyer had to enter and where an immediate seller can exit later. ASK_then→BID_now therefore measures whether the market has migrated enough to overcome that basic two-sided touch hurdle.
- **Objective connection:** this closely mirrors the intended buy-then-sell workflow: pay the seller side on entry, later receive the buyer side on exit. It is therefore a stronger historical benchmark for “could this kind of move have been monetised quickly?” than a simple price-return statistic.
- **Favorable / unfavorable interpretation:** positive values mean the later displayed bid has climbed above the earlier displayed ask; the gross touch hurdle has been cleared. Values near zero mean the move may exist but offers little execution buffer. Negative values mean the market has not yet moved enough to cover even the historical touch-to-touch spread.
- **Failure modes / counterexamples:** the historical ASK might have had insufficient size; current BID may also be too small; quotes can disappear; latency/slippage/fees/impact are excluded; an aggressive buy at ASK is not necessarily the actual strategy we will use. Therefore this is a conservative market-touch benchmark, not a realized P&L record.
- **Relationship to other evidence:** BD-017 uses LAST as the entry reference and is less strict. BD-018 deliberately uses ASK as the entry reference, making it more execution-aware but also more sensitive to spread width. TE features are still needed for size, costs and feasibility.
- **Worked example:** ASK1 30s ago = 100.10 and BID1 now = 100.30 gives about +0.20% gross touch-to-touch return. If explicit and implicit costs exceed that buffer, the trade may still be unattractive.
- **Known overlaps:** BD-017, spread/tradability, TE execution feasibility
- **Confidence limits:** both entry ASK and exit BID are displayed touch prices, not guaranteed fills; depth may be insufficient; quote persistence and latency matter; no fees/slippage/impact included; missing/invalid L1 must remain UNKNOWN
- **Validation targets:** execution-aware target-before-adverse, implementation shortfall, incremental predictive value beyond BD-017
- **Research state:** Candidate — especially useful as a conservative market-touch benchmark

This profile is closer to:

~~~text
buy at historical displayed ask
→ later sell at current displayed bid
~~~

than a LAST-to-LAST return, while still remaining only a quote-based gross proxy.

### BD-019 — RecentBuyerExitabilityState

- **Family:** Book / Directional Flow
- **Kind:** STATE
- **Raw sources:** BD-017 and BD-018 profiles
- **Derivation:** summarize whether recent historical transaction/ask reference cohorts are broadly above or below the current BID1, while retaining the full horizon profile rather than counting overlapping horizons as independent votes
- **Unit / shape:** TOUCH_PROFITABLE / LAST_REFERENCE_POSITIVE_ONLY / MIXED / BROADLY_UNDERWATER / DETERIORATING / UNKNOWN + profile
- **Role:** CONFIRMING, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Confirmation, RemainingOpportunity, PathRisk
- **Meaning:** compact description of whether recent buyers could plausibly exit at today's current touch with gross positive buffer, and whether that buffer is broad or fragile across recent horizons
- **Plain-language intuition:** imagine several groups of recent buyers: those who entered roughly 10s, 20s, 30s, 60s and 90s ago. This state asks whether the current best bid leaves most of those groups above water, only the newest group above water, or almost everyone below water.
- **Market mechanism / why it can matter:** when many recent entry cohorts can already exit at a positive touch return, the upward move has propagated from transaction prices into the actual buyer side. That can indicate broad recent price acceptance. But if only very old cohorts are profitable and the newest cohorts are not, the move may be stalling or giving back.
- **Objective connection:** the desired system repeatedly asks “if I buy now, will there soon be a better bid to sell into?” Recent buyer exitability is not the answer for the future, but it is a direct description of whether the market has recently been delivering that exact outcome to buyers.
- **Favorable / unfavorable interpretation:** TOUCH_PROFITABLE across many recent lags can confirm usable recent upward progress; LAST_REFERENCE_POSITIVE_ONLY says transaction references look profitable but the stricter ask-to-bid hurdle is not yet cleared; MIXED indicates horizon dependence; BROADLY_UNDERWATER is cautionary; DETERIORATING means exitability is worsening even if headline LAST remains elevated.
- **Failure modes / counterexamples:** broad profitability can describe a move that is already mature and nearly exhausted. Broad underwater status can occur just before a fresh reversal. Therefore the state cannot substitute for RemainingOpportunity, sequence stage or path-health evidence.
- **Relationship to other evidence:** this is the synthesis layer over BD-017/018. It should complement, not duplicate, Price/Wave momentum. Its special contribution is the **entry-reference-to-current-exit-side** perspective.
- **Worked example:** if 10/20/30/60s cohorts all show positive ASK_then→BID_now returns but the 90s cohort is also positive, the recent move has broadly cleared its touch hurdle. If 10s turns negative while 30/60s remain positive, that may signal recent deterioration rather than broad weakness.
- **Known overlaps:** PW momentum, RO MoveConsumptionState, PH path quality
- **Confidence limits:** this is backward-looking realized exitability context, not a forecast by itself; overlapping horizons are not independent cohorts; exact state mapping requires validation
- **Validation targets:** future target-before-adverse, future BID progression, continuation vs giveback
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

The final model should consume BD-016 plus BD-019 and explicit conflict/confidence context rather than summing BD-004, BD-005, BD-009..BD-019 as independent votes.

Preferred flow:

~~~text
L1 prices/volumes + LAST geometry/history
→ BD-001..BD-015 quote/flow structure
→ BD-017..BD-018 historical-buyer exitability profiles
→ BD-016 L1DirectionalFlowState + BD-019 RecentBuyerExitabilityState
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

# Family RO — Remaining Opportunity / Target Frontier

Purpose:

> Represent how much **useful upward opportunity may still remain from the current decision point**, across several target/time/adverse combinations, while preserving the difference between raw market potential and what is realistically capturable after time and friction.

This family is one of the core objective families.

Critical distinction:

~~~text
ObservedMove
!=
PotentialRemaining
!=
CapturableRemaining
~~~

And:

~~~text
RemainingOpportunity
!=
generic momentum strength
~~~

## No fabricated probability rule

Before sufficient empirical history:

~~~text
supported / plausible / weak / unsupported / unknown
~~~

may be used as semantic research states.

Do **not** emit calibrated probabilities from this family until Issue #15/#11 establishes them empirically.

## Online-vs-outcome separation

Future realized:

- MFE;
- MAE;
- TimeToTarget;
- WhichBarrierFirst;
- realized executable result

are outcome labels.

They may validate RO features but must not leak into decision-time inputs.

### RO-001 — ObservedMoveFromDecisionContext

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** CONTEXT
- **Raw sources:** decision-time LAST/MID plus relevant current leg/reset reference
- **Derivation:** observed move already completed before the current decision point; exact reference depends on leg/reset semantics
- **Unit / shape:** percent + reference identity
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI
- **Decision role:** RemainingOpportunity
- **Meaning:** records how much movement has already occurred before the engine is deciding
- **Known overlaps:** PW-009, PH-006, SQ-009
- **Confidence limits:** should not become a duplicate momentum score; reference ownership must be reconciled with Issue #6
- **Validation targets:** detection lateness, remaining excursion at decision time
- **Research state:** Candidate

### RO-002 — CurrentPotentialState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** current PW/AF/BD/PH/PR/SQ family states
- **Derivation:** synthesize whether fresh upward process currently exists without estimating remaining magnitude yet
- **Unit / shape:** NONE / WEAK / DEVELOPING / STRONG / CONFLICTED / UNKNOWN
- **Role:** LEADING, CONFIRMING
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Potential
- **Meaning:** separates evidence that upward process exists from the separate question of how much is left
- **Known overlaps:** family scores; SQ OpportunityStage
- **Confidence limits:** strong potential does not imply large remaining excursion or executable opportunity
- **Validation targets:** target-before-adverse, TimeToTarget
- **Research state:** Provisional composite

### RO-003 — PotentialRemainingState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-001/RO-002 + SQ stage + PR reset + future conditional excursion priors from Issue #15 + recent-capacity context later
- **Derivation:** estimate semantic remaining market opportunity before execution friction; exact empirical mapping deferred
- **Unit / shape:** NONE / LOW / MODERATE / HIGH / RENEWED_AFTER_RESET / UNKNOWN
- **Role:** LEADING, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** forward-looking market-only assessment of remaining upward excursion
- **Known overlaps:** MoveConsumptionState; Recent Wave Memory
- **Confidence limits:** cannot be reliably calibrated before Issue #15; must not use recent typical wave minus current move as a deterministic formula
- **Validation targets:** future MFE, target-before-adverse, remaining excursion at decision time
- **Research state:** Candidate / blocked pending direct outcome research

### RO-004 — MoveConsumptionState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-001 + SQ DetectionLatenessState + PR LegResetStrength + later conditional excursion/capacity priors
- **Derivation:** classify how much of comparable useful movement appears already consumed, preserving reset semantics
- **Unit / shape:** EARLY / PARTIALLY_CONSUMED / MATURE / MOSTLY_CONSUMED / RENEWED_AFTER_RESET / UNKNOWN
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** prevents a very strong but mostly completed move from outranking a fresher opportunity
- **Known overlaps:** SQ-009 DetectionLatenessState; PW recency concentration
- **Confidence limits:** broad WaveAge is insufficient; online state cannot use future final excursion
- **Validation targets:** remaining excursion at detection, target-before-adverse
- **Research state:** Candidate / empirical mapping pending

### RO-005 — TimeBudgetAfterLatencySeconds

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** DERIVED
- **Raw sources:** candidate target horizon + FQ-002 observation age + ranking/decision latency + expected entry latency where available
- **Derivation:** `targetHorizon - observationAge - rankingDelay - decisionDelay - expectedEntryDelay`
- **Unit / shape:** seconds
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** NOW for partial market-system form; EXEC for full form
- **Evidence:** PI
- **Decision role:** RemainingOpportunity, Feasibility
- **Meaning:** expresses how much of the target's time horizon remains available after the system consumes time
- **Known overlaps:** TE-011, SQ-008
- **Confidence limits:** expected entry delay is execution-policy dependent; negative/near-zero budget does not imply bearish direction, only unusable timing
- **Validation targets:** executable target-before-adverse, missed opportunity, implementation shortfall
- **Research state:** Candidate

### RO-006 — TargetCandidate

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** CONTEXT
- **Raw sources:** predefined research target grid from Issue #15
- **Derivation:** explicit target size + timeout + adverse barrier specification
- **Unit / shape:** tuple `{targetPct, timeoutSec, adversePct}`
- **Role:** CONTEXT, OUTCOME
- **Availability:** FUTURE
- **Evidence:** PI
- **Decision role:** Outcome, RemainingOpportunity
- **Meaning:** atomic research question against which opportunity evidence is evaluated
- **Known overlaps:** Issue #15 target-before-adverse surface
- **Confidence limits:** grid values are research parameters, not promises or recommended execution thresholds
- **Validation targets:** WhichBarrierFirst, TimeToTarget, MFE/MAE
- **Research state:** Candidate research primitive

### RO-007 — TargetSupportState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** one RO-006 target + current family evidence + later conditional outcome priors
- **Derivation:** semantic support for one target/time/adverse combination
- **Unit / shape:** SUPPORTED / PLAUSIBLE / WEAK / UNSUPPORTED / UNKNOWN + Confidence/Coverage
- **Role:** LEADING, PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** target-specific opportunity evidence without pretending to be calibrated probability
- **Known overlaps:** RO-003, Issue #15 outcome surface
- **Confidence limits:** support mapping must be learned/validated; UNKNOWN must not become UNSUPPORTED
- **Validation targets:** target-before-adverse, TimeToTarget
- **Research state:** Candidate / blocked pending Issue #15

### RO-008 — TargetFeasibilityFrontier

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-006/RO-007 across the research target grid
- **Derivation:** preserve the set of target/time/adverse combinations supported by current evidence
- **Unit / shape:** ordered structured frontier, not one scalar
- **Role:** LEADING, CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** allows the same stock to support a small-fast target while not supporting a larger/slower one
- **Known overlaps:** Issue #15 FastExcursionProfile/TargetBeforeAdverseSurface
- **Confidence limits:** not a probability surface until calibrated; do not interpolate unsupported targets casually
- **Validation targets:** target-specific barrier-first outcomes, TimeToTarget
- **Research state:** Candidate / core future structure

### RO-009 — AdversePathBudgetState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** target candidate + PH path risk + PR barrier state + later conditional MAE distributions
- **Derivation:** characterize whether expected/allowed adverse path remains compatible with the candidate target
- **Unit / shape:** COMFORTABLE / TIGHT / POOR / UNKNOWN
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** PathRisk, RemainingOpportunity
- **Meaning:** keeps a target that requires large adverse movement distinct from a clean target path
- **Known overlaps:** PH family; future MAE labels
- **Confidence limits:** future MAE is label, not online input; semantic mapping awaits Issue #15/#11
- **Validation targets:** MAE-before-target, WhichBarrierFirst, TimeUnderWater
- **Research state:** Candidate / blocked pending empirical outcome distributions

### RO-010 — FrictionBudgetState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** TE spread/tick/depth/latency inputs + execution profile where available
- **Derivation:** characterize how much of the candidate target would be consumed by market/account friction
- **Unit / shape:** LOW_BURDEN / MATERIAL / DOMINANT / UNKNOWN
- **Role:** GATE, PROTECTIVE
- **Availability:** NOW for partial market-only form; EXEC for full form
- **Evidence:** PI
- **Decision role:** Feasibility, RemainingOpportunity
- **Meaning:** prevents raw upside potential from being confused with usable post-friction opportunity
- **Known overlaps:** TE-012/TE-013/TE-014
- **Confidence limits:** family consumes TE outputs; it does not recompute spread/depth/cost independently
- **Validation targets:** implementation shortfall, net executable opportunity
- **Research state:** Candidate

### RO-011 — CapturableRemainingState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-003 + RO-005 + RO-008/RO-009/RO-010 + TE feasibility
- **Derivation:** synthesize market potential that survives time, path and friction constraints
- **Unit / shape:** NONE / LOW / MODERATE / HIGH / UNKNOWN + Confidence/Coverage
- **Role:** LEADING, GATE, PROTECTIVE
- **Availability:** FUTURE + EXEC for full form
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, Feasibility
- **Meaning:** closest online representation of “how much useful opportunity is still capturable from now”
- **Known overlaps:** NetExecutableOpportunity, CentralRanker
- **Confidence limits:** not expected return; no calibrated magnitude/probability until Issues #15/#11 and execution research support it
- **Validation targets:** executable target-before-adverse, net executable excursion, TimeToTarget
- **Research state:** Provisional core composite

### RO-012 — OpportunityBudget

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-002..RO-011 where valid
- **Derivation:** preserve structured dimensions without premature scalar compression
- **Unit / shape:** structured object
- **Role:** LEADING, CONTEXT, PROTECTIVE, GATE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Potential, RemainingOpportunity, PathRisk, Feasibility, Freshness/Trust
- **Meaning:** canonical structured opportunity representation consumed later by CentralRanker
- **Known overlaps:** Issue #10 family composition
- **Confidence limits:** must retain UNKNOWN dimensions rather than filling defaults
- **Validation targets:** target-before-adverse, TimeToTarget, MAE, detection lateness, executable opportunity
- **Research state:** Provisional architecture primitive

Candidate shape:

~~~text
OpportunityBudget {
  currentPotential
  observedMove
  moveConsumption
  potentialRemaining
  targetFeasibilityFrontier
  timeBudgetAfterLatency
  adversePathBudget
  frictionBudget
  capturableRemaining
  confidence
  coverage
}
~~~

### RO-013 — OpportunityDominanceState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** OpportunityBudget for two or more eligible candidates
- **Derivation:** determine whether one candidate clearly dominates another on relevant dimensions without forcing arbitrary early weights
- **Unit / shape:** DOMINATES / DOMINATED / TRADEOFF / EFFECTIVE_TIE / UNKNOWN
- **Role:** CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity, Feasibility
- **Meaning:** supports later cross-sectional ranking while preserving speed/move/path/feasibility tradeoffs
- **Known overlaps:** Issue #10 CentralRanker / LeaderDominanceMargin
- **Confidence limits:** not a final ranking rule; utility tradeoffs and tie semantics require Issue #10/#11
- **Validation targets:** top-K future opportunity quality, leader stability
- **Research state:** Candidate / ownership transitions to CentralRanker in Issue #10

### RO-014 — RemainingOpportunityState

- **Family:** Remaining Opportunity / Target Frontier
- **Kind:** STATE
- **Raw sources:** RO-001..RO-012
- **Derivation:** family-level summary of current remaining opportunity while keeping OpportunityBudget available for detailed reasoning
- **Unit / shape:** NONE / EMERGING / USABLE / STRONG / MOSTLY_CONSUMED / RENEWED / UNUSABLE_AFTER_FRICTION / UNKNOWN + Strength/Confidence/Coverage
- **Role:** LEADING, PROTECTIVE, CONTEXT, GATE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** RemainingOpportunity
- **Meaning:** compact family state for later ranking without losing the structured budget
- **Known overlaps:** SQ OpportunityStage; CentralRanker
- **Confidence limits:** semantic evidence strength only, not probability or expected return
- **Validation targets:** target-before-adverse, remaining excursion, TimeToTarget, executable opportunity
- **Research state:** Provisional composite

---

## Remaining Opportunity objective-alignment boundary

This family should answer:

~~~text
from the current decision point,
what target/time/adverse opportunities still appear supportable,
and how much survives system latency and friction?
~~~

It must not answer by shortcut:

~~~text
recent wave average - current move = remaining opportunity
~~~

or:

~~~text
strong momentum = lots left
~~~

Core architecture:

~~~text
current evidence
→ PotentialRemaining
→ target/time/adverse frontier
→ time/path/friction budgets
→ CapturableRemaining
→ OpportunityBudget
→ later CentralRanker
~~~

Future realized outcome surfaces from Issue #15 validate these concepts but never leak into online inputs.

# Family WM — Recent Wave Memory / Capacity Prior

Purpose:

> Preserve what this same security has **recently demonstrated** about excursion size, speed, adverse path and opportunity arrival under comparable conditions, and expose it only as a conditional prior/context layer.

Critical rule:

~~~text
recent demonstrated capacity
!=
next-wave promise
!=
directional trigger
~~~

This family does not predict direction by itself.

Its job is to answer:

> When current conditions are sufficiently comparable to recent conditions, what movement scale/timing/path has this stock recently shown, with what coverage and what failure history?

## Baseline-denominator rule

Completed waves are selected episodes.

Therefore:

~~~text
WaveMemory alone
cannot estimate opportunity probability
~~~

The all-observation outcome surface from Issue #15 is the baseline denominator/context.

Wave memory must prove incremental value beyond that baseline.

## Ownership boundary

This family owns:

- recent completed-wave / excursion memory summaries;
- amplitude / speed / adverse-path / arrival-capacity priors;
- target-specific recent outcome profiles;
- successful-vs-failed recent episode memory;
- comparable-memory coverage;
- recency / regime / similarity metadata attached to the prior;
- active/censored episode status;
- segmentation-sensitivity metadata.

It does **not** own:

- exact wave segmentation semantics → Issue #6;
- pattern-similarity model → Issue #7;
- direct all-observation future outcome surface → Issue #15;
- current live opportunity score → Remaining Opportunity family;
- regime transferability rules → later Regime family / Issue #9.

### WM-001 — WaveMemoryEpisodeStatus

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** segmented episode lifecycle from Issue #6
- **Derivation:** classify an episode as COMPLETED / ACTIVE_CENSORED / INVALID
- **Unit / shape:** enum
- **Role:** GATE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI
- **Decision role:** Context/Prior, Freshness/Trust
- **Meaning:** prevents unfinished current episodes from contaminating completed-wave statistics
- **Known overlaps:** Issue #6 segmentation lifecycle
- **Confidence limits:** exact completion semantics remain blocked on Issue #6; ACTIVE_CENSORED must not be silently treated as a failure or completed success
- **Validation targets:** leakage-safe backtests, memory-statistic correctness
- **Research state:** Candidate / blocked by Issue #6

### WM-002 — RecentUpwardAmplitudeCapacityProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** completed comparable upward episodes
- **Derivation:** retain robust amplitude distribution summaries such as median/P75/P90 and sample count
- **Unit / shape:** percent distribution summary
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, RemainingOpportunity
- **Meaning:** describes the recent upward excursion scale this stock/regime has actually demonstrated
- **Known overlaps:** RO TargetFeasibilityFrontier; Issue #6 wave amplitude
- **Confidence limits:** not a target promise; max is diagnostic only; distribution must be conditioned by comparability/coverage
- **Validation targets:** target-specific future excursion, incremental value over Issue #15 baseline
- **Research state:** Candidate

### WM-003 — RecentWaveAmplitudeMaxDiagnostic

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** recent completed comparable episodes
- **Derivation:** maximum observed comparable amplitude with episode identity and age
- **Unit / shape:** percent + metadata
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI
- **Decision role:** Context/Prior
- **Meaning:** preserves an extreme recent observation for diagnostics without using it as the default target anchor
- **Known overlaps:** WM-002
- **Confidence limits:** one outlier can dominate; must not be scored as strong capacity evidence by itself
- **Validation targets:** robustness / outlier sensitivity
- **Research state:** Diagnostic only

### WM-004 — RecentSpeedCapacityProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** completed comparable episodes / target-hit times
- **Derivation:** target-specific TimeToTarget and/or episode-speed summaries using actual elapsed time
- **Unit / shape:** seconds / percent-per-second profile
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, RemainingOpportunity
- **Meaning:** captures how quickly this security has recently converted movement opportunities
- **Known overlaps:** Issue #16 conversion latency; RO target frontier
- **Confidence limits:** do not extrapolate linearly from speed; fastest single observation is not a robust prior
- **Validation targets:** TimeToTarget, usable lead, target-before-adverse
- **Research state:** Candidate

### WM-005 — RecentAdversePathCapacityProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** comparable completed target/episode outcomes
- **Derivation:** recent MAE-before-target / giveback / time-under-water / recovery summaries where labels exist
- **Unit / shape:** percent + seconds profile
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** describes how much adverse path recent successful excursions required
- **Known overlaps:** RO AdversePathBudget; Issue #15 outcomes
- **Confidence limits:** future outcome labels are produced by Issue #15/11; no leakage into the episode decision point
- **Validation targets:** MAE-before-target, TimeUnderWater, target-before-adverse
- **Research state:** Candidate / blocked pending outcome labels

### WM-006 — RecentOpportunityArrivalProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** eligible observation denominator + target-before-adverse outcomes from Issue #15
- **Derivation:** target/horizon-specific frequency or intensity of useful excursions among eligible comparable observations
- **Unit / shape:** count/rate profile with denominator
- **Role:** CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** distinguishes a stock with rare large waves from one that repeatedly presents useful short-horizon opportunities
- **Known overlaps:** Issue #15 FastOpportunityPrior
- **Confidence limits:** cannot be derived from completed waves alone; no probability claim before calibrated validation
- **Validation targets:** future target-before-adverse frequency, rank usefulness
- **Research state:** Candidate / blocked pending Issue #15

### WM-007 — RecentConditionalTargetProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** target grid + comparable recent observations/episodes + Issue #15 outcome labels
- **Derivation:** for each target/time/adverse tuple retain hit count, eligible denominator, TimeToTarget distribution and MAE-before-target distribution
- **Unit / shape:** target-indexed structured profile
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, RemainingOpportunity, PathRisk
- **Meaning:** objective-aligned memory of what recently happened for the exact types of targets the engine evaluates
- **Known overlaps:** RO-008 TargetFeasibilityFrontier
- **Confidence limits:** prior/context only; must not be copied directly into online probability or target recommendation
- **Validation targets:** incremental value for target support / frontier calibration
- **Research state:** Candidate / blocked pending Issue #15

### WM-008 — RecentFailureMemoryProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** comparable recent target attempts / observation outcomes
- **Derivation:** summarize adverse-first outcomes, timeout/no-progress, false starts, failed retests and pressure-without-progress where observable
- **Unit / shape:** structured failure counts/rates + metadata
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** ensures recent memory contains cautionary evidence, not only successful waves
- **Known overlaps:** PR failure states; PH stalls; Issue #15
- **Confidence limits:** failure categories need explicit causal-time definitions; no double counting of one episode into incompatible categories without policy
- **Validation targets:** false-positive reduction, target-before-adverse
- **Research state:** Candidate

### WM-009 — DirectionalCapacityAsymmetry

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** recent upward excursion profile + downward/adverse excursion profile
- **Derivation:** preserve upward, downward and general movement capacity separately; exact summary TBD
- **Unit / shape:** structured directional profile
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** distinguishes “moves a lot” from “recently produces usable upward excursions with manageable downside”
- **Known overlaps:** broad volatility context
- **Confidence limits:** broad downside history must not automatically veto a fresh upward micro-opportunity
- **Validation targets:** target-before-adverse, MAE, target-size frontier
- **Research state:** Candidate

### WM-010 — ComparableMemoryCoverage

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** DERIVED
- **Raw sources:** raw recent samples + eligible denominator + current-state/regime matching metadata
- **Derivation:** preserve raw sample count, eligible denominator, comparable sample count, effective recency-weighted count and regime-match quality separately
- **Unit / shape:** structured coverage bundle
- **Role:** GATE, CONTEXT
- **Availability:** HISTORY + FUTURE
- **Evidence:** PI
- **Decision role:** Freshness/Trust, Context/Prior
- **Meaning:** prevents tiny samples such as 2/2 or 3/3 from masquerading as strong memory evidence
- **Known overlaps:** FQ coverage; Issue #9 regime transferability
- **Confidence limits:** no universal minimum count yet; effective sample size depends on comparability/weighting
- **Validation targets:** confidence calibration, prior robustness
- **Research state:** Candidate

Candidate shape:

~~~text
ComparableMemoryCoverage {
  rawSampleCount
  eligibleDenominator
  comparableSampleCount
  effectiveRecencyWeightedCount
  regimeMatchQuality
}
~~~

### WM-011 — MemorySimilarityContext

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** current state descriptors + recent episode descriptors
- **Derivation:** carry similarity dimensions needed by Issue #7 without collapsing them prematurely
- **Unit / shape:** structured similarity inputs
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** interface for asking whether current formation is comparable enough to recent memory to transfer evidence
- **Known overlaps:** Issue #7 pattern similarity
- **Confidence limits:** Issue #5 does not define final similarity function; no nearest-neighbor certainty claim
- **Validation targets:** incremental prior value, recurrence robustness
- **Research state:** Interface candidate / detailed ownership Issue #7

Candidate dimensions:

~~~text
amplitudeShape
duration
speed
activityShape
bookSignature
pathQuality
spread/tradability
endingPattern
session/time
broadMarketContext
~~~

### WM-012 — HierarchicalMemoryFallbackState

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** WM-010/WM-011 + availability of comparable memory layers
- **Derivation:** identify which memory layer is currently being used when exact-state samples are insufficient
- **Unit / shape:** EXACT_STATE_REGIME / LOOSER_STATE_REGIME / SAME_STOCK_RECENT / SAME_STOCK_SESSION / CROSS_SECTIONAL_COMPARABLE / NONE
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Freshness/Trust
- **Meaning:** makes confidence loss explicit when the model backs off to broader, less-specific history
- **Known overlaps:** Issue #9 EvidenceTransferability
- **Confidence limits:** fallback order itself requires validation; broader pooling can introduce bias
- **Validation targets:** confidence calibration, target-support robustness
- **Research state:** Candidate / detailed policy deferred to Issues #7/#9

### WM-013 — MemoryRecencyProfile

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** CONTEXT
- **Raw sources:** episode/observation timestamps
- **Derivation:** preserve recency distribution rather than one blind average age
- **Unit / shape:** seconds/minutes profile
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI
- **Decision role:** Context/Prior
- **Meaning:** exposes whether the memory prior is based on very recent or stale observations
- **Known overlaps:** Issue #9 evidence-specific decay
- **Confidence limits:** recency alone does not determine transferability; regime break can dominate elapsed time
- **Validation targets:** prior decay, confidence calibration
- **Research state:** Candidate

### WM-014 — CapacityTrendState

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** successive recent capacity profiles
- **Derivation:** compare recent amplitude/speed/opportunity-arrival environment over compatible windows
- **Unit / shape:** EXPANDING / STABLE / CONTRACTING / CONFLICTED / UNKNOWN
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** captures whether the recent movement environment is broadening or shrinking
- **Known overlaps:** Regime context
- **Confidence limits:** expanding capacity is not automatically bullish; downside risk/execution difficulty may also expand
- **Validation targets:** target frontier changes, MAE, opportunity arrival
- **Research state:** Candidate

### WM-015 — OpportunityArrivalEnvironmentState

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** WM-006 + inter-opportunity spacing / recent counts
- **Derivation:** classify recent opportunity environment without predicting deterministic periodic timing
- **Unit / shape:** ACTIVE / NORMAL / QUIET / UNKNOWN
- **Role:** CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** summarizes whether useful short-horizon opportunities have recently been dense or sparse
- **Known overlaps:** WaveFrequency / InterWaveSpacing
- **Confidence limits:** must never be interpreted as “next wave is due now”
- **Validation targets:** target-arrival rate, prior usefulness
- **Research state:** Candidate / blocked pending valid denominator

### WM-016 — SegmentationSensitivityState

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** same memory metric recomputed under reasonable alternative wave-segmentation definitions from Issue #6
- **Derivation:** quantify whether conclusions are stable or fragile across segmentation choices
- **Unit / shape:** ROBUST / MODERATELY_SENSITIVE / FRAGILE / UNKNOWN
- **Role:** GATE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI
- **Decision role:** Freshness/Trust, Context/Prior
- **Meaning:** blocks false confidence in memory features that exist only under one convenient wave definition
- **Known overlaps:** Issue #6 segmentation research
- **Confidence limits:** alternative definitions must themselves be defensible; this is methodological robustness, not alpha
- **Validation targets:** stability of downstream target/support improvements
- **Research state:** Candidate / blocked by Issue #6

### WM-017 — RecentWavePrior

- **Family:** Recent Wave Memory / Capacity Prior
- **Kind:** STATE
- **Raw sources:** WM-002..WM-016 where valid
- **Derivation:** structured conditional prior preserving supportive, cautionary, coverage, similarity, recency, regime-match and consistency dimensions
- **Unit / shape:** structured prior + Confidence/Coverage
- **Role:** CONTEXT, PROTECTIVE, CONFIRMING
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Freshness/Trust
- **Meaning:** compact interface for injecting recent same-stock history into RemainingOpportunity without treating memory as an independent bullish vote
- **Known overlaps:** Issues #7/#9, RO PotentialRemaining/TargetFrontier
- **Confidence limits:** no direct probability; poor coverage/transferability must be able to reduce influence near zero
- **Validation targets:** incremental target-before-adverse value beyond current-state + Issue #15 baseline
- **Research state:** Provisional composite

Candidate shape:

~~~text
RecentWavePrior {
  amplitudeCapacity
  speedCapacity
  adversePathCapacity
  opportunityArrival
  targetProfiles
  failureMemory
  directionalAsymmetry
  comparableCoverage
  similarity
  recency
  regimeMatch
  segmentationRobustness
  supportiveEvidence
  cautionaryEvidence
  confidence
}
~~~

---

## Recent Wave Memory objective-alignment boundary

This family should answer:

~~~text
what has this stock recently demonstrated
under sufficiently comparable conditions,
with what denominator, failures and confidence?
~~~

It must not answer:

~~~text
recent waves were large
therefore the next wave will be large
~~~

Core hierarchy:

~~~text
Issue #15 all-observation baseline
→ recent comparable same-stock memory
→ coverage/similarity/regime qualification
→ RecentWavePrior
→ optional adjustment to RemainingOpportunity confidence/context
~~~

The prior should be able to have near-zero influence when coverage or transferability is weak.

# Family MR — Multi-Horizon / Local Regime / Session Context

Purpose:

> Describe the broader cross-scale and local-market environment in which the seconds-to-~2-minute opportunity is forming, and determine how much historical/contextual evidence is transferable to **now**.

Critical rules:

~~~text
micro horizon = primary opportunity process
longer horizons = context by default
~~~

and:

~~~text
Regime
!=
bullish/bearish vote
~~~

Regime primarily answers:

> How comparable is the current environment to the environment in which prior evidence was observed, and how quickly should that evidence decay?

## Horizon authority rule

Candidate conceptual hierarchy:

~~~text
PRIMARY opportunity:
  ~5s / 10s / 20s / 30s / 60s / 120s

NEAR context:
  ~2m / 5m

BROAD context:
  ~10m / 30m / 60m / session
~~~

Exact windows remain research parameters.

Do not use majority-vote logic across overlapping returns.

### MR-001 — MultiHorizonReturnContext

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** CONTEXT
- **Raw sources:** validated LAST/MID history over configured near/broad windows
- **Derivation:** preserve horizon-specific return/profile inputs without summing them as independent votes
- **Unit / shape:** horizon-indexed percent profile
- **Role:** LAGGING_CONTEXT, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** provides broad geometry around the current micro opportunity
- **Known overlaps:** PW return profiles; overlapping windows are highly redundant
- **Confidence limits:** broad negative returns are not automatic vetoes; windows overlap and must not be treated as independent evidence
- **Validation targets:** incremental target-before-adverse value after micro state is known
- **Research state:** Candidate context

### MR-002 — MultiHorizonTrendState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** MR-001 + micro PW state
- **Derivation:** compress overlapping horizon profiles into interpretable cross-scale geometry rather than additive votes
- **Unit / shape:** ALIGNED_UP_CONTEXT / MICRO_ACCELERATION_WITH_UP_CONTEXT / MICRO_UP_INSIDE_BROAD_DOWN / REVERSAL_ATTEMPT / MICRO_UP_AFTER_BROAD_STALL / BROAD_UP_BUT_MICRO_DECELERATING / MIXED / UNKNOWN
- **Role:** CONTEXT, LAGGING_CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** describes how the immediate move sits inside broader intraday movement
- **Known overlaps:** MR-003; PW state
- **Confidence limits:** state is descriptive context, not a buy/reject rule
- **Validation targets:** target-before-adverse, MAE-before-target, target frontier by state
- **Research state:** Provisional state

### MR-003 — HorizonConflictState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** micro/near/broad direction, acceleration and age
- **Derivation:** preserve disagreement rather than forcing one direction
- **Unit / shape:** structured state including microDirection / nearDirection / broadDirection / microAcceleration / conflictAge / resolutionEvidence
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** distinguishes aligned movement from fresh counter-trend micro opportunities and unresolved cross-scale conflict
- **Known overlaps:** MR-002
- **Confidence limits:** conflict is not automatically bad; only subsequent short-horizon outcomes can determine its value
- **Validation targets:** target-before-adverse, MAE, TimeToTarget
- **Research state:** Candidate

### MR-004 — CounterTrendMicroOpportunityState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** MR-002/MR-003 + current micro PW/AF/BD/PH/SQ state
- **Derivation:** classify whether a current positive micro process is aligned with or counter to broader context
- **Unit / shape:** ALIGNED / COUNTER_TREND_FRESH / COUNTER_TREND_CONFIRMED / COUNTER_TREND_WEAK / REVERSAL_ATTEMPT / UNKNOWN
- **Role:** CONTEXT, CONFIRMING, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Confirmation, PathRisk
- **Meaning:** makes counter-trend opportunities first-class instead of silently filtering them out
- **Known overlaps:** PR reset/reclaim; SQ opportunity stage
- **Confidence limits:** broader downtrend cannot be assumed to reduce immediate upside unless validated
- **Validation targets:** target-before-adverse, MAE, target-size frontier
- **Research state:** Candidate

### MR-005 — ContextIncrementalValue

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** LABEL
- **Raw sources:** validation results comparing current micro-state baseline vs baseline + context
- **Derivation:** out-of-sample marginal improvement attributable to near/broad context
- **Unit / shape:** metric bundle / ablation result
- **Role:** OUTCOME
- **Availability:** FUTURE
- **Evidence:** PI
- **Decision role:** Outcome
- **Meaning:** decides whether longer-horizon context deserves any influence after immediate micro evidence is already known
- **Known overlaps:** Issue #11 group ablation
- **Confidence limits:** validation artifact only, never an online feature
- **Validation targets:** target-before-adverse discrimination, TimeToTarget/MAE improvement, ranking lift
- **Research state:** Future validation label

### MR-006 — BroadContextAdversePathState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** broad trend context + later empirical target/adverse distributions
- **Derivation:** characterize whether broad context changes adverse path / target-size support more than immediate direction
- **Unit / shape:** BENIGN / NEUTRAL / ELEVATED_ADVERSE / UNKNOWN
- **Role:** PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** PathRisk, Context/Prior
- **Meaning:** allows broad context to matter through MAE/rejection/target frontier without becoming a blunt directional veto
- **Known overlaps:** RO AdversePathBudget
- **Confidence limits:** blocked until target/adverse validation exists; no direct sign rule
- **Validation targets:** MAE-before-target, WhichBarrierFirst, target frontier
- **Research state:** Candidate / blocked pending Issue #11/#15

### MR-007 — LiquidityRegime

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** TE spread/depth/availability history + activity context
- **Derivation:** classify current local liquidity environment relative to comparable same-phase history
- **Unit / shape:** DEEPER / NORMAL / THINNER / UNSTABLE / UNKNOWN
- **Role:** CONTEXT, GATE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Feasibility, Freshness/Trust
- **Meaning:** one transferability dimension for deciding whether recent evidence remains comparable
- **Known overlaps:** TE family
- **Confidence limits:** regime owns comparison/context, not duplicate spread/depth scoring
- **Validation targets:** prior transferability, execution feasibility stability
- **Research state:** Candidate

### MR-008 — ActivityRegime

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** AF trade-rate/turnover history normalized to same session phase
- **Derivation:** classify local activity environment relative to comparable history
- **Unit / shape:** QUIET / NORMAL / ACTIVE / SURGING / UNKNOWN
- **Role:** CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior
- **Meaning:** distinguishes raw activity intensity from whether that intensity is normal for the current environment
- **Known overlaps:** AF ActivityBurst; MR-015 TimeOfDayAbnormality
- **Confidence limits:** ACTIVE is not bullish; it can accompany both upward and adverse moves
- **Validation targets:** prior transferability, target frontier, conversion latency
- **Research state:** Candidate

### MR-009 — MovementVolatilityRegime

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** recent LAST/MID path variation and excursion distributions
- **Derivation:** classify current local movement environment relative to comparable phase/history
- **Unit / shape:** COMPRESSED / NORMAL / EXPANDED / EXTREME / UNKNOWN
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** describes the movement scale in which current evidence is operating
- **Known overlaps:** WM CapacityTrend; PH path quality
- **Confidence limits:** expanded movement is not directionally positive and may raise downside risk
- **Validation targets:** target frontier, MAE, opportunity arrival
- **Research state:** Candidate

### MR-010 — PathNoiseRegime

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** PH directional efficiency/reversal history
- **Derivation:** classify recent path-noise environment relative to comparable same-phase history
- **Unit / shape:** ORDERLY / NORMAL / CHOPPY / UNSTABLE / UNKNOWN
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, PathRisk
- **Meaning:** qualifies whether historical path-quality priors transfer to the current environment
- **Known overlaps:** PH family
- **Confidence limits:** does not replace live PH path state
- **Validation targets:** MAE, TimeUnderWater, prior transferability
- **Research state:** Candidate

### MR-011 — BookBehaviorRegime

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** BD L1 dynamics over recent comparable history
- **Derivation:** characterize whether quote migration/depth persistence behavior is currently typical or structurally changed
- **Unit / shape:** STABLE / FAST_CHANGING / THIN_VOLATILE / ATYPICAL / UNKNOWN
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Freshness/Trust
- **Meaning:** transferability qualifier for L1-based priors/signals
- **Known overlaps:** BD family; TE liquidity
- **Confidence limits:** displayed-book changes do not imply intent
- **Validation targets:** BD signal stability, conversion-latency transferability
- **Research state:** Candidate

### MR-012 — BroadMarketRegimeContext

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** CONTEXT
- **Raw sources:** future broad-market/reference inputs if available
- **Derivation:** preserve broad-market movement/activity context separately from same-stock state
- **Unit / shape:** structured context / UNKNOWN when unavailable
- **Role:** CONTEXT
- **Availability:** FUTURE
- **Evidence:** H + U
- **Decision role:** Context/Prior
- **Meaning:** optional qualifier for whether same-stock recent evidence occurred under similar market-wide conditions
- **Known overlaps:** cross-sectional normalization
- **Confidence limits:** current project does not yet establish a canonical broad-market feed; must remain UNKNOWN rather than inferred
- **Validation targets:** incremental prior transferability
- **Research state:** Candidate / blocked pending data source

### MR-013 — EvidenceTransferability

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** current-vs-prior state similarity, MR-007..MR-012, time-of-day/session match, WM coverage, horizon match
- **Derivation:** preserve dimensions that determine whether historical evidence should influence current reasoning
- **Unit / shape:** HIGH / MODERATE / LOW / BROKEN / UNKNOWN + dimension bundle
- **Role:** GATE, CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Freshness/Trust
- **Meaning:** central answer to “how much can recent evidence transfer to now?”
- **Known overlaps:** WM ComparableMemoryCoverage/HierarchicalFallback
- **Confidence limits:** no validated weighting formula; poor transferability should reduce prior influence, not fabricate an opposite signal
- **Validation targets:** prior usefulness, confidence calibration, target-support robustness
- **Research state:** Provisional composite

Candidate dimensions:

~~~text
stateSimilarity
regimeSimilarity
timeOfDaySimilarity
sessionCompatibility
recency
sampleCoverage
horizonMatch
~~~

### MR-014 — EvidenceSpecificDecayState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** evidence timestamp + family identity + current transferability/regime state
- **Derivation:** family/evidence-specific decay based on elapsed time and state/regime divergence
- **Unit / shape:** FRESH / DECAYING / WEAK / EXPIRED / INVALIDATED_BY_REGIME / UNKNOWN
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Freshness/Trust, Context/Prior
- **Meaning:** avoids one universal half-life for all evidence
- **Known overlaps:** FQ FreshnessState; Issue #16 OpportunityHalfLife
- **Confidence limits:** exact decay curves/lifetimes require Issues #9/#16; elapsed time alone is insufficient
- **Validation targets:** target-before-adverse, confidence calibration, stale-signal reduction
- **Research state:** Candidate / detailed policy deferred

### MR-015 — RegimeBreakState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** changes in MR-007..MR-012 dimensions
- **Derivation:** detect material environment discontinuity that can invalidate recent priors faster than wall-clock recency
- **Unit / shape:** STABLE / DRIFTING / BROKEN / UNKNOWN
- **Role:** GATE, PROTECTIVE, CONTEXT
- **Availability:** HISTORY
- **Evidence:** PI + H
- **Decision role:** Freshness/Trust, Context/Prior
- **Meaning:** marks when recent same-session memory may no longer describe current conditions
- **Known overlaps:** FQ freshness; WM recency
- **Confidence limits:** no thresholds fixed yet; a large market move is not automatically a regime break unless relevant dimensions changed
- **Validation targets:** prior degradation, target-frontier stability
- **Research state:** Candidate

### MR-016 — SessionEpochCompatibility

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** authoritative current session phase + timestamps of prior/current evidence
- **Derivation:** determine whether evidence/window stays within compatible market mechanics
- **Unit / shape:** COMPATIBLE / PHASE_CHANGED / INCOMPATIBLE / UNKNOWN
- **Role:** GATE, CONTEXT
- **Availability:** NOW + HISTORY
- **Evidence:** PI + U until TASE phase semantics are re-verified
- **Decision role:** Freshness/Trust, Context/Prior
- **Meaning:** prevents short windows or priors from silently crossing materially different trading mechanisms
- **Known overlaps:** session-phase research
- **Confidence limits:** current TASE phase/timing rules must be verified from authoritative source before implementation
- **Validation targets:** feature correctness, prior transferability
- **Research state:** Candidate / semantics verification required

### MR-017 — TimeOfDayAbnormality

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** CONTEXT
- **Raw sources:** same-phase historical distributions for activity/volatility/spread/etc.
- **Derivation:** compare current raw feature intensity against its same-phase/time-of-day baseline
- **Unit / shape:** percentile/z-like abnormality bundle, exact normalization TBD
- **Role:** CONTEXT
- **Availability:** FUTURE
- **Evidence:** GL + PI + H
- **Decision role:** Context/Prior
- **Meaning:** distinguishes “high in absolute terms” from “unusually high for this time/phase”
- **Known overlaps:** cross-sectional/self-relative normalization
- **Confidence limits:** requires sufficient same-phase history; not a directional signal
- **Validation targets:** incremental context value, target frontier, conversion latency
- **Research state:** Candidate / blocked pending history

### MR-018 — RegimeConditionedTargetFeasibilityContext

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** CONTEXT
- **Raw sources:** RO TargetFeasibilityFrontier + MR regime/transferability dimensions
- **Derivation:** preserve how target/time/adverse support changes across empirically comparable regimes
- **Unit / shape:** regime-indexed frontier context
- **Role:** CONTEXT, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, RemainingOpportunity, PathRisk
- **Meaning:** allows the same live micro state to have different supported target frontiers under different local environments
- **Known overlaps:** RO-008; Issue #15
- **Confidence limits:** must be learned from project data; no assumed liquid-regime rule
- **Validation targets:** target-specific barrier-first outcomes, MAE, TimeToTarget
- **Research state:** Candidate / blocked pending empirical outcomes

### MR-019 — LocalContextState

- **Family:** Multi-Horizon / Local Regime / Session Context
- **Kind:** STATE
- **Raw sources:** MR-001..MR-018 where valid
- **Derivation:** family-level synthesis that preserves context geometry and transferability separately from directional micro evidence
- **Unit / shape:** structured state + Confidence/Coverage
- **Role:** CONTEXT, GATE, PROTECTIVE
- **Availability:** FUTURE
- **Evidence:** PI + H
- **Decision role:** Context/Prior, Freshness/Trust, PathRisk
- **Meaning:** compact context object consumed by RecentWavePrior/RemainingOpportunity/CentralRanker without turning long-horizon context into a separate alpha family
- **Known overlaps:** WM RecentWavePrior; FQ confidence; Issue #10
- **Confidence limits:** should never override strong fresh micro evidence merely because broad context disagrees unless validation proves incremental value
- **Validation targets:** incremental target-before-adverse value, confidence calibration, prior robustness
- **Research state:** Provisional composite

---

## Multi-Horizon / Local Regime objective-alignment boundary

This family should answer:

~~~text
what broader context surrounds the micro opportunity,
and how transferable is prior evidence to NOW?
~~~

It must not answer:

~~~text
30m/60m trend is down
therefore reject the stock
~~~

or:

~~~text
regime is bullish
therefore add alpha
~~~

Core hierarchy:

~~~text
current micro evidence
→ cross-scale context
→ regime/session comparability
→ EvidenceTransferability / Decay
→ qualify priors and target frontier
~~~

Fresh current evidence should be able to dominate weak, stale or poorly matched historical context.

## Next registry boundary

Next planned family:

~~~text
Cross-Sectional / Relative Edge Context
~~~

It will own market percentile, self-vs-peer abnormality, rank-rise cause, absolute-eligibility-aware comparison and asynchronous decision-time comparability — while keeping absolute opportunity primary.
