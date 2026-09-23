# Momentum Ranking V1 — Durable Research Checkpoint

Checkpoint: 2026-09-23.

Purpose: preserve the substantive reasoning developed in the research chat so a fresh chat can recover it without reading the original conversation.

This is durable knowledge, not live progress. See ../STATUS.json.

---

# 1. Problem definition

Rank the dynamic TASE equity universe to answer:

> Which security currently offers the strongest remaining fast upward opportunity from now, primarily over seconds to about two minutes, while still being observable, sufficiently supported by evidence, liquid enough and executable enough to matter?

This is primarily a **ranking** problem, not exact-price regression.

A smaller but faster useful move may outrank a larger slower move. Do not annualize or linearly repeat short returns; spread, latency, slippage, fill risk and opportunity scarcity invalidate that arithmetic.

Score 0–100 is an internal comparative scale, not probability.

## Objective invariant: this is not a general buy recommendation engine

The system is intentionally different from conventional stock analysis and many trading models.

It is **not** trying to decide whether a security is generally attractive, healthy, fundamentally strong, in a favorable daily trend or suitable to hold.

Its target is:

> a fresh, short-lived upward opportunity starting around now, preferably measurable in seconds and with an outer research horizon of roughly two minutes, that is observable/tradable enough to capture and exit.

Consequences:

- a security may be strongly negative for the day and still become the best current candidate if a new local upward wave is forming;
- a security may be strongly positive for the day and still be unattractive if the useful move has already happened;
- daily return, 30/60-minute trend, prior losses and broader context must not become automatic accept/reject rules;
- those longer-context variables deserve weight only if they add out-of-sample information about the short target;
- the objective is **remaining opportunity from now**, not descriptive stock quality;
- validation must use seconds-to-~2-minute outcomes such as TimeToTarget, target-before-adverse, MFE/MAE and execution-aware feasibility;
- feature selection must reject signals that are good at explaining “good stocks” but do not improve this short-horizon target.

A concise test for every future feature:

~~~text
Does this help distinguish which stock can make a useful upward move from NOW,
fast enough to matter before roughly two minutes,
with an acceptable adverse/execution path?
~~~

If not, it does not belong merely because it is common in trading analysis.

---

# 2. Mental model and architecture

Imagine hundreds of beaches.

Each stock has a stateful observer who watches one beach continuously and knows both current conditions and recent local history. A central judge compares the observers.

~~~text
validated complete cycle
→ StockObserver per security
→ StockCard
→ cross-sectional context
→ CentralRanker
→ leader / NO_OPPORTUNITY
→ later ExecutionEvaluator
~~~

Important separation:

~~~text
State != Score != Confidence != Coverage
~~~

---

# 3. Verified project/data constraints

Project research has already established:

- dynamic universe; never hardcode security count;
- MapHeat2 is used for universe/metadata;
- GetSecuritiesData supplies detailed snapshots;
- canonical ID is String(PaperId or Key);
- useful fields include LAST/base/daily values, trade counter, turnover/money, L1 BID/ASK prices and volumes;
- LastDealVolume was only partially populated in prior coverage evidence;
- L1 itself may be null;
- L2-L5 schema fields existed but were null for the previously tested equity snapshot;
- collection uses sequential chunks, so a full cycle is valid but not a simultaneous market instant;
- prior measured full-cycle cadence was roughly five seconds in the tested configuration;
- preserve null != 0 != "" != undefined.

Local History Viewer V1 provides a validated history/persistence foundation but does not define momentum semantics.

---

# 4. Price / wave shape

LAST alone can be noisy because of bid-ask bounce.

When BID and ASK exist:

~~~text
MID = (BID1 + ASK1) / 2
~~~

Track both trade-price movement and market-center movement.

Candidate horizons include roughly 5/10/20/30/60/120 seconds subject to sampling resolution.

Do not only measure total return. Measure **where in time the movement occurred**.

Example:

~~~text
30–20s +0.02
20–10s +0.07
10–0s  +0.16
~~~

suggests acceleration.

Core concepts:

- direction;
- speed;
- acceleration/deceleration;
- continuity;
- giveback;
- wave age;
- leg age;
- MID confirmation.

A small fresh accelerating move may be more attractive than a large stale move.

~~~text
WaveAge != LegAge
~~~

---

# 5. Activity / trade count

Differences in cumulative DailyDealsQuantity can produce short-window trade counts when valid observations span the interval.

Useful concepts:

- trade rate;
- trade-rate acceleration;
- activity burst;
- inter-trade pulse.

Activity tells us that **something is happening**, not direction.

Possible early sequence:

~~~text
activity wakes
→ book pressure
→ price starts
→ price accelerates
~~~

Valid zero activity is distinct from unknown/missing activity.

---

# 6. Volume / money flow / effort-result

Trade count, traded units and money turnover are related but not identical.

Candidate interpretations:

- trades ↑ + volume ↑ + money ↑ + price ↑ = participation expands with price response;
- many trades with little price progress = possible resistance/absorption/exhaustion;
- isolated large print without continuation is weak evidence.

A major candidate concept:

~~~text
Effort ↑ while Result ↓
→ possible exhaustion
~~~

---

# 7. BID / ASK / LAST dynamics

The most important question is often **who is moving toward whom**.

~~~text
BID ↑, ASK → = buyers chase
BID →, ASK ↓ = ask retreats
BID ↑, ASK ↑ = whole book shifts upward
BID ↓, ASK ↓ = downward book movement
BID ↑, ASK ↓ = spread compression; ambiguous without cause
~~~

Displayed quantity is displayed liquidity, not number of buyers/sellers and not guaranteed executable depth.

Persistence across snapshots matters more than a one-frame queue.

---

# 8. ASK-LAST / BID-LAST / MID-LAST and LAST inside spread

This is a required explicit signal area.

Candidate metrics:

~~~text
AskLastGapPct = (ASK1 - LAST) / LAST * 100
LastBidGapPct = (LAST - BID1) / LAST * 100
MidLastGapPct = (MID - LAST) / LAST * 100
~~~

When spread is valid:

~~~text
LastSpreadPosition = (LAST - BID1) / (ASK1 - BID1)
~~~

Ordinary interpretation:

~~~text
0.0 ≈ LAST at BID
0.5 ≈ LAST at MID
1.0 ≈ LAST at ASK
~~~

Also track dynamics:

- AskLastGap velocity;
- LastSpreadPosition velocity;
- BID/ASK/MID/LAST velocities.

A shrinking ASK-LAST gap has opposite meanings depending on cause:

~~~text
LAST rises toward stable ASK
→ possible buyer advance

ASK falls toward stable LAST
→ ask retreat / seller-side weakness
~~~

Candidate states:

- LAST_CHASING_ASK;
- ASK_RETREATING_TO_LAST;
- WHOLE_BOOK_MOVING_UP;
- LAST_FALLING_TO_BID.

Do not anthropomorphize intent; describe observable quote behavior.

---

# 9. Spread / tick / tradability

Track:

- SpreadPercent;
- SpreadTicks;
- TickPercent;
- spread stability;
- displayed depth;
- trade freshness;
- money liquidity.

Separate:

~~~text
RawSpeed
ExecutableSpeed
~~~

Tradability is likely a gate/multiplier, not a small additive feature.

---

# 10. Freshness

Strong evidence can become useless quickly.

Use both wall-clock age and market/event age.

Candidate lifecycle:

~~~text
FRESH
→ AGING
→ STALE
→ INVALID
~~~

Reconfirmation can refresh evidence.

Distinguish aging, lack of confirmation, weakening and invalidation.

---

# 11. Exhaustion

Do not wait only for price to fall.

Candidates:

- price deceleration;
- effort/result deterioration;
- BID stops chasing;
- ASK retreats;
- LAST shifts toward BID;
- giveback rises;
- time since meaningful progress grows;
- spread deteriorates.

Two exhaustion modes:

1. interest dies;
2. battle remains intense but buyers stop making price progress.

---

# 12. Pullback / retest / breakdown

Ask **what broke**, not only whether LAST ticked down.

Healthy-ish pullback may show small giveback, stable MID/BID, limited counter-move activity.

Breakdown evidence is stronger when LAST/MID/BID/ASK all deteriorate with meaningful activity.

Candidate lifecycle:

~~~text
PULLBACK
→ RETESTING
→ RETEST_PASSED / RETEST_FAILED
~~~

An old broad wave can contain a fresh new leg after a successful retest.

---

# 13. Cross-sectional CentralRanker

Keep both:

~~~text
AbsoluteQuality
RelativePercentile
~~~

Relative rank alone always produces a winner, therefore:

~~~text
NO_OPPORTUNITY
~~~

must be valid.

Useful market context:

- breadth;
- median short-horizon movement;
- market-wide activity acceleration;
- dispersion.

Do not compare fresh and stale chunks as if simultaneous.

---

# 14. Leader persistence and hysteresis

Naive max(score) can flip leaders on noise.

Use:

~~~text
leader persistence
+ challenger evidence
+ dynamic hysteresis
~~~

Possible challenger lifecycle:

~~~text
NORMAL
→ CHALLENGER
→ STRONG_CHALLENGER
→ LEADER
~~~

Overwhelming fresh multi-family evidence may allow fast promotion.

Promotion and demotion need not be symmetric.

Story/state persistence is more meaningful than score persistence alone.

Rank velocity (#180 → #75 → #22 → #5) may be useful as early context.

---

# 15. Data quality / confidence

Core invariant:

~~~text
UNKNOWN != NEUTRAL != ZERO
~~~

Every signal should know:

- dependencies;
- validity;
- observation age;
- semantic validity;
- coverage;
- confidence.

Cycle integrity should validate requested/received/unique/duplicates/missing/unexpected/shape.

Extreme does not mean invalid. The system is searching for unusual events; use cross-sensor consistency rather than blindly clipping outliers.

---

# 16. Market phase / time of day

Opening auction, continuous trading, closing auction and TAL are different mechanisms.

Ordinary short-horizon model should not blindly mix them.

Candidate concept:

~~~text
SessionEpoch
~~~

so short windows do not cross a mechanism boundary.

Time of day is primarily context/normalization rather than an automatic bullish score.

Current TASE schedule/phase rules should be re-verified from official sources when implementation starts.

---

# 17. Highs/lows / breakout

Daily/recent highs are context, not automatic buy signals.

Useful lifecycle:

~~~text
APPROACH
→ TEST
→ BREAK
→ HOLD / ACCEPT
→ CONTINUE
~~~

or:

~~~text
BREAK
→ NO_ACCEPTANCE
→ REJECTION
~~~

Candidate levels include daily/continuous high, recent 30/60/120s high, wave high and leg high.

For this horizon recent/wave highs may matter more than a high printed hours earlier.

---

# 18. Volatility / noise / path quality

Separate:

~~~text
Volatility
Noise
DirectionalMovement
~~~

Candidate path metrics:

- directional efficiency;
- reversal count;
- reversal depth;
- up/down movement dominance;
- giveback;
- adverse movement;
- MID smoothness;
- jump vs trend;
- continuity.

Possible transitions:

~~~text
NOISE_TO_TREND
TRENDING_TO_CHOPPY
~~~

---

# 19. Directional flow from L1

The current snapshot feed cannot reconstruct exact signed direction of every trade between snapshots.

Distinguish:

~~~text
TrueSignedTradeFlow    = unavailable from current feed
L1DirectionalPressure = estimable approximation
~~~

Candidate evidence:

- LAST relative to BID/ASK/MID;
- TradeLocationTrend;
- BID/ASK/MID direction;
- displayed pressure persistence;
- activity acceleration;
- price response.

Useful states:

~~~text
UPWARD_FLOW
DOWNWARD_FLOW
BALANCED
CONFLICTED
UNKNOWN
~~~

Never claim exact buyer/seller percentages without transaction-level data.

---

# 20. Sequence / lead-lag

Current values alone do not reveal lifecycle stage.

Candidate sequences:

~~~text
Activity → Book → Price
Book → Trades → Price
Price → Confirmation
Price → No Confirmation
Pressure → Break → Acceptance
Trend → Pullback → Retest → New Leg
Strong Price → Effort ↑ → Efficiency ↓ → Exhaustion
~~~

When several changes occur between the same snapshots, prefer SIMULTANEOUS_CLUSTER instead of inventing exact order.

Sequence is hypothesis/context until validated.

---

# 21. Signal roles

Candidate roles:

~~~text
LEADING
CONFIRMING
LAGGING_CONTEXT
PROTECTIVE
~~~

This produced three distinct dimensions:

~~~text
Potential
Confirmation
RemainingOpportunity
~~~

A late fully-confirmed move may be less attractive than a slightly less-confirmed fresh formation if remaining opportunity is much higher.

---

# 22. Remaining opportunity / time-to-target

Do not only ask whether price will rise.

Better question:

> Which positive target may be reached, how quickly, and before how much adverse movement?

Future research should use multiple target/time combinations rather than one fixed target.

Useful speed should receive strong preference without naive return-per-second extrapolation.

Observation feasibility matters: a two-second event cannot be treated like a reliable system opportunity if collection/decision latency is comparable.

---

# 23. Adverse path

Future evaluation outcomes should include:

~~~text
MFE
MAE
TimeToTarget
WhichBarrierFirst
TimeUnderWater
RecoveryTime
~~~

A +0.3% outcome reached only after a large adverse excursion is different from a clean +0.3% path.

Initially MAE/MFE are labels/outcomes, not trusted predictions.

---

# 24. Execution reality

Separate:

~~~text
RawMarketMove
TradableMove
FilledMove
NetExecutableMove
~~~

Execution friction includes spread, tick, queue, delay, fill uncertainty, partial fills, slippage, market impact and explicit account costs.

Future evaluation must separate market-prediction quality from execution simulation.

Price touching a limit is not guaranteed fill.

---

# 25. Cross-sectional normalization

For candidate features preserve:

~~~text
RawValue
AbsoluteQuality
MarketPercentile
Coverage
~~~

Later with history add:

~~~text
SelfRelativeAbnormality
TimeOfDayAbnormality
optional PeerPercentile
~~~

UNKNOWN values must not be inserted into percentile pools as zero.

Ties need proper tie handling.

---

# 26. Redundancy / double counting

Architecture should be hierarchical:

~~~text
raw observations
→ derived concepts
→ feature families
→ family states/scores
→ cross-family agreement
→ final ranking
~~~

High-risk overlaps include:

- overlapping return windows;
- trades/volume/money;
- BID/ASK/MID deterministic relations;
- queue imbalance/microprice;
- high proximity/range/breakout;
- giveback reused by path/exhaustion.

Future validation should use group ablation and marginal out-of-sample value, not only feature importance.

Confidence should reward **Evidence Diversity** across independent-ish families.

---

# 27. Family score semantics

Family score 0–100 is semantic evidence strength, not probability.

Keep:

~~~text
FamilyState
FamilyScore
FamilyConfidence
MarketPercentile
Coverage
~~~

Before empirical history:

~~~text
observations
→ interpretable family state
→ semantic strength band
→ cross-sectional refinement
→ family score
~~~

Likely categories:

Opportunity/Alpha:
- Price/Wave;
- Activity/Flow;
- Book/Directional Flow;
- Sequence.

Quality/Lifecycle:
- Path Quality;
- Wave Health / anti-exhaustion;
- Remaining Opportunity;
- breakout/level context.

Feasibility/Trust:
- Tradability;
- Freshness;
- Data Quality;
- observation feasibility.

Some trust families should gate/multiply rather than receive equal additive weights.

---

# 28. Recent Wave Memory — new major direction

The Observer should know what this same stock has actually demonstrated recently.

Example:

~~~text
recent up-waves:
+0.28%
+0.31%
+0.34%
+0.29%
typical duration 40–70s
~~~

This is different evidence from a stock whose recent best waves were only +0.05–0.10%, even if both show the same current momentum.

Interpretation:

> Recent same-session history can inform whether the target magnitude is inside the stock's recently demonstrated movement capacity.

It is context/evidence, not a guarantee.

---

# 29. Recent Realized Wave Capacity

Candidate summaries:

~~~text
UpWaveCount
DownWaveCount

WaveAmplitudeMedian
WaveAmplitudeMean
WaveAmplitudeMax
WaveAmplitudeP75

WaveDurationMedian
WaveSpeedMedian

RecentTargetHitProfile
TimeToTargetProfile

MFEProfile
MAEProfile

WaveFrequency
InterWaveSpacing

AmplitudeTrend
FrequencyTrend

CurrentVsTypicalWaveProgress
~~~

Median is likely more robust than mean when one extreme wave exists.

Candidate ratio:

~~~text
TargetToRecentWaveRatio
= desired target / recent comparable-wave amplitude
~~~

A requested +0.30% target means something different when recent comparable waves cluster near +0.32% versus when the recent maximum is +0.10%.

---

# 30. Recent Target Hit Profile

For target research, an observer may eventually know:

~~~text
waves >= +0.10% : count
waves >= +0.20% : count
waves >= +0.30% : count

median time to target
fastest time
median MAE before target
~~~

This connects wave memory directly to RemainingOpportunity and TimeToTarget.

---

# 31. Wave capacity is dynamic

Do not make typical wave size a permanent stock property.

It may change by:

- recent minutes;
- hour/time of day;
- liquidity regime;
- volatility regime;
- broad-market conditions;
- life stage of the current session.

Candidate trends:

~~~text
WaveAmplitudeTrend = RISING / STABLE / DECLINING
WaveFrequencyTrend = RISING / STABLE / DECLINING
~~~

---

# 32. Wave rhythm / recurrence

Separate:

~~~text
WaveCapacity = how large/fast recent waves are
WaveRhythm   = how often similar waves appear
~~~

Clustering can be meaningful context but must not become a deterministic periodicity rule.

---

# 33. Pattern similarity / RecentWavePrior

A current formation may be compared to recent waves using:

- duration;
- amplitude/speed;
- activity shape;
- book signature;
- spread/tradability;
- path quality;
- ending behavior;
- broad-market/session context.

Future prior should carry:

~~~text
sampleCount
similarity
recency
regimeMatch
outcomeConsistency
~~~

Three recent successes do not justify 100% probability.

Repeated similar failures must also be remembered and may create a cautionary prior.

A RecentWavePrior may be more appropriate as a Confidence/context adjustment than as another large additive Opportunity vote.

---

# 34. Multi-horizon trend context — planned research

The current micro wave must be interpreted inside broader recent direction.

Candidate horizons:

~~~text
~2m / 5m / 10m / 30m / 60m / session-so-far
~~~

Do not add overlapping returns independently. Convert them into states such as:

~~~text
STRONG_UPTREND_ALIGNED
UPTREND_WITH_FRESH_ACCELERATION
UPTREND_BUT_SLOWING
MIXED
COUNTER_TREND_BOUNCE
REVERSAL_ATTEMPT
DOWNTREND
~~~

Example:

~~~text
60m +1.5
30m +1.0
10m +0.5
2m  +0.20
20s +0.08
~~~

is a different context from a +0.08% 20-second bounce inside a negative 60/30/10-minute structure.

---

# 35. Local regime / recency decay — planned research

Recent same-stock history is useful only while the current local regime remains comparable.

Possible regime dimensions:

- spread;
- liquidity/depth;
- trade rate;
- volatility/noise;
- session phase;
- broad-market state;
- book behavior.

Same stock + same day does not necessarily mean same regime.

Recent evidence should decay with time and be discounted sharply after a material regime change.

---

# 36. Research-management conclusions

The active research remains in chat.

GitHub exists to make the research durable and manageable:

~~~text
Chat            = active reasoning
Issues          = backlog / research boundaries
STATUS.json     = exact current/next
ROADMAP.md      = plan/order
AI_CONTEXT.md   = compact continuation
research-checkpoint.md = deep recovery memory
future feature registry = structured signal inventory
~~~

This split is intentional: preserve depth without forcing every fresh chat to reread the entire history.

---

# 37. Important open questions

- How exactly is a wave segmented?
- When is a pullback part of one wave versus the start of a new wave?
- Which recent-wave statistics add information beyond volatility/trend?
- How should RecentWavePrior affect Score versus Confidence?
- How much does multi-horizon trend add beyond current momentum?
- How should local regime similarity be measured?
- Which Family scores are additive, which are gates and which are multipliers?
- How should low-confidence high-potential candidates compete with highly confirmed late candidates?
- Which candidate features survive redundancy/group-ablation tests?
- Is L2 merely useful or eventually necessary?
- Is trade tape more valuable than L2 for the final model?
- What is the shortest horizon that is actually observable with the collection cadence?

These questions are managed by Issues #5–#13 and any additional issues discovered during research.
