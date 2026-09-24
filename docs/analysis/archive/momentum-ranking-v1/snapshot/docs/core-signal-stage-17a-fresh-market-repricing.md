# Stage 17.A — Fresh Market Repricing

Issue: #17  
Stage: 17.A  
Date: 2026-09-23

## Scope

This stage compares only:

1. **Fresh Price Impulse**
2. **BID / Quote Migration Strength**

Concepts 3–8 are intentionally out of scope.

## Executive conclusion

Do **not** keep these as two independent core votes.

They overlap too strongly.

With current verified data, the strongest form of Fresh Price Impulse is primarily MID-based:

~~~text
MID = (BID1 + ASK1) / 2
~~~

Therefore BID/ASK migration is partly the decomposition of the same quoted-market movement that creates MID impulse.

Keeping:

~~~text
Fresh Price Impulse score
+
BID / Quote Migration score
~~~

as two independent additive core signals would risk counting one repricing process twice.

### Stage 17.A decision

Merge the two provisional candidates into one parent concept:

~~~text
Fresh Market Repricing
~~~

Provisional disposition:

~~~text
Fresh Price Impulse
→ MERGE_INTO_PARENT

BID / Quote Migration Strength
→ MERGE_INTO_PARENT

Fresh Market Repricing
→ KEEP_CORE_CANDIDATE
~~~

This reduces the provisional eight-concept list to **seven parent concepts** before Stage 17.B.

This is a conceptual down-selection, not empirical validation.

## 1. What the merged concept asks

> Is the immediate market repricing upward **now**, is that repricing fresh/accelerating rather than stale, and is the exit-side BID participating rather than the apparent rise being caused mainly by ASK widening or an isolated trade print?

The parent must preserve both:

~~~text
how fast/fresh the quoted market is moving
+
which side of the quote caused that movement
~~~

## 2. Why MID alone is insufficient

MID is useful because it reduces dependence on noisy transaction prints.

But:

~~~text
MID up
~~~

can occur in at least two very different ways.

### Case A — whole book / BID participates

~~~text
BID  99.90 → 100.10
ASK 100.10 → 100.30

MID 100.00 → 100.20
~~~

This includes a higher current exit-side BID.

### Case B — ASK widens away

~~~text
BID  99.90 → 99.90
ASK 100.10 → 100.50

MID 100.00 → 100.20
~~~

MID rises by exactly the same amount.

But the BID did not improve.

For the project objective these are not equivalent.

Therefore:

> MID impulse needs BID/ASK cause decomposition.

## 3. Why BID alone is also insufficient

A rising BID is unusually aligned with the project's eventual exit path:

~~~text
buy now
→ later sell into BID
~~~

But a displayed BID can:

- appear briefly;
- move because of thin-book quote revisions;
- be cancelled;
- improve one tick without broader market repricing;
- occur while ASK behavior makes the spread/market state unattractive.

Therefore:

> BID migration is closer to executable relevance, but needs persistence / market-center / ASK context.

This is why the correct answer is not “keep BID, drop price”.

It is one cause-aware repricing concept.

## 4. Literature support — general microstructure, not TASE validation

The external literature supports investigating this merged concept, while not proving TASE predictive value.

### Best-quote order-book dynamics

Cont, Kukanov & Stoikov, *The Price Impact of Order Book Events* (arXiv:1011.6402):

- short-interval price changes are strongly related to order-flow imbalance at best bid/ask;
- the effect depends on market depth;
- trade volume alone was noisier than best-quote order-flow imbalance in their sample.

Relevance:

> the top-of-book state contains short-horizon information beyond a simple recent trade-price change.

### Queue imbalance

Gould & Bonart, *Queue Imbalance as a One-Tick-Ahead Price Predictor in a Limit Order Book* (arXiv:1512.03492):

- displayed bid/ask queue imbalance had statistically significant association with the next MID move in their Nasdaq sample;
- predictive usefulness differed by tick-size regime.

Relevance:

> L1 state can contain short-horizon information, but transfer to TASE must be validated and static imbalance should not be promoted automatically.

### BID and ASK can contribute differently

Research on the relative contribution of BID and ASK quotes to price discovery reports that collapsing both sides to MID can lose short-run information.

Relevance:

> preserve which quote moved rather than treating identical MID changes as identical states.

### Trade-price bounce

Market-microstructure literature documents that transaction-price returns can contain substantial bid-ask bounce / short-horizon transitory effects.

Relevance:

> canonical Fresh Price Impulse should not rely on LAST alone.

## 5. Parent concept structure

### Fresh Market Repricing

Suggested conceptual structure:

~~~text
FreshMarketRepricing {
  marketCenterImpulse
  bidAdvance
  askResponse
  migrationPattern
  freshness
  acceleration
  optionalTradeConfirmation
  confidence
}
~~~

This is a structured state.

It is **not** an additive sum of seven sub-scores.

## 6. Primary child evidence

### Market-center impulse

Primary registry inputs:

~~~text
PW-002 MidReturnProfile
PW-003 RecentPriceSpeed
PW-004 PriceAccelerationState
PW-005 RecencyConcentrationState
~~~

Interpret them as transformations of one underlying recent MID path.

They must collapse into one movement state.

Do not give:

~~~text
return vote
+ speed vote
+ acceleration vote
+ recency vote
~~~

as if they were four independent pieces of evidence.

### Quote-side decomposition

Primary inputs:

~~~text
BD-001 BestBidMoveProfile
BD-002 BestAskMoveProfile
BD-003 QuoteMigrationState
~~~

These answer:

~~~text
did BID rise?
did ASK rise/fall?
did the whole book migrate?
did only one side change?
~~~

### Family synthesis

~~~text
BD-016 L1DirectionalFlowState
~~~

may remain useful as an explanation/synthesis output.

It must not be added as another independent vote on top of BD-001/002/003.

## 7. Secondary / diagnostic evidence

### Static queue imbalance

~~~text
BD-004 L1QueueImbalance
BD-005 MicropriceTilt
~~~

Disposition at this stage:

~~~text
DIAGNOSTIC / VALIDATE_ONLY
~~~

Reason:

- they are highly related to each other;
- displayed quantities can cancel;
- they do not directly say whether BID/ASK prices are currently migrating;
- external evidence supports investigation, not automatic adoption.

They may be promoted later only if they add stable incremental out-of-sample value beyond Fresh Market Repricing.

### Displayed-depth persistence

~~~text
BD-006
BD-007
BD-008
~~~

Useful mainly to qualify the reliability/persistence of the quote state.

Do not make them separate core votes.

## 8. LAST-related evidence

Registry candidates such as:

~~~text
PW-001 TradePriceReturnProfile
PW-006 PriceMidAgreementState
BD-013 LastSpreadPositionVelocity
BD-014 LastQuoteGapDynamicsState
BD-015 TradeLocationTrendState
~~~

may contain useful executed-trade confirmation.

But canonical phase-aware LAST remains semantics-blocked.

Therefore current disposition:

~~~text
OPTIONAL_CONFIRMATION
not required for the parent
not a separate core concept
~~~

The core must remain testable from verified L1/MID history.

## 9. Lead vs confirmation roles

### BID / quote migration component

Provisional role:

~~~text
LEADING + CONFIRMING
~~~

Why it may lead:

- quotes can reprice before the next trade print;
- BID can improve before LAST changes;
- order-book events can contain short-horizon price information.

Why it can fail:

- quote flicker/cancellation;
- thin-book movement;
- transient displayed liquidity.

### Fresh MID impulse component

Provisional role:

~~~text
CONFIRMING + CURRENT_MOTION
~~~

Why it is valuable:

- proves the quoted market center is already moving;
- less dependent on one transaction print;
- acceleration/recency distinguish fresh movement from old movement.

Why it can be late:

- by the time MID acceleration is obvious, part of the opportunity may already be consumed.

### Parent role

~~~text
Fresh Market Repricing
= LEADING/CONFIRMING hybrid
~~~

The internal state should preserve whether:

~~~text
book led price-center
price-center and book moved together
MID moved without BID participation
BID advanced without sustained MID response
~~~

## 10. Provisional priority inside Stage 17.A

If the two old concepts had to be ordered before merging:

### 1. BID / Quote Migration Strength

Provisional advantage:

- closest to the eventual sell-side path;
- can contain earlier quote information;
- cause-aware BID/ASK decomposition prevents misleading MID interpretation.

Primary weakness:

- more vulnerable to cancellation/flicker and displayed-liquidity artifacts.

### 2. Fresh Price Impulse

Provisional advantage:

- simpler evidence that repricing is actually occurring;
- robust MID-based formulation avoids some LAST noise.

Primary weakness:

- more confirming/lagging;
- can be misleading when MID rises because ASK widens while BID stays flat;
- can become strongest after some move is already consumed.

This ordering is **not** the final model decision.

The merge decision is more important than the ordering.

## 11. Redundancy boundary

The following are the **same parent information channel**, not separate core concepts:

~~~text
MID recent return
MID speed
MID acceleration
recency concentration
BID move
ASK move
cause-aware quote migration
~~~

They describe facets of one immediate repricing process.

The parent may still use multiple raw components internally.

But the CentralRanker should receive approximately:

~~~text
one FreshMarketRepricing state
one confidence
one coverage/freshness context
~~~

not seven additive votes.

## 12. Failure modes the parent must preserve

### ASK-only widening

~~~text
MID up
BID flat
ASK sharply up
~~~

Do not interpret as equivalent to whole-book upward migration.

### BID flicker

~~~text
BID up for one snapshot
then immediately disappears
~~~

Require persistence/reconfirmation or lower confidence.

### One-tick thin-book jump

A small displayed quote can move the BID without showing a robust opportunity.

Execution/depth remains a separate gate.

### Stale movement

A large 60-second move with little progress in the newest interval should not score like a fresh impulse.

### Already-consumed move

Strong current repricing does not answer how much remains.

Move Consumption / Remaining Opportunity remains a separate later Stage 17.C question.

## 13. Key falsification tests for later empirical work

Stage 17.A should be rejected/changed if data shows these assumptions fail.

### Test A — BID decomposition incremental value

Compare:

~~~text
MID impulse only
vs
MID impulse + BID/ASK cause decomposition
~~~

Outcome:

~~~text
future BID exitability
target-before-adverse
TimeToTarget
~~~

If side decomposition adds no stable OOS value, simplify the parent.

### Test B — quote-only vs MID-only

Compare:

~~~text
quote migration only
vs
MID impulse only
vs
merged Fresh Market Repricing
~~~

If the merged concept does not outperform/simplify reliably, reconsider the merge structure.

### Test C — quote-leading sequence

Condition on:

~~~text
BID/quote migration observed first
MID progress follows later
~~~

versus:

~~~text
MID already moved first
quote migration only confirms
~~~

Use interval uncertainty honestly.

### Test D — persistence

Test whether one-frame BID migration is materially weaker than migration reconfirmed across observations.

### Test E — spread/depth conditioning

Check whether apparent predictive value disappears after:

- spread burden;
- thin displayed depth;
- unstable quotes

are handled as gates.

### Test F — lateness

Test whether strongest Fresh Market Repricing states occur early enough to preserve useful remaining opportunity.

## 14. Stage 17.A decision table

| Item | Decision |
| --- | --- |
| Fresh Price Impulse as independent core slot | MERGE_INTO_PARENT |
| BID / Quote Migration as independent core slot | MERGE_INTO_PARENT |
| New parent | **Fresh Market Repricing** |
| Parent provisional status | KEEP_CORE_CANDIDATE |
| Static queue imbalance | DIAGNOSTIC / VALIDATE_ONLY |
| Microprice tilt | DIAGNOSTIC / VALIDATE_ONLY |
| Depth persistence | reliability/context support |
| LAST-based confirmation | optional, semantics-blocked until canonical LAST verified |
| Number of provisional parent concepts after this stage | **7** |

## 15. Stage boundary

Stage 17.A does **not** compare Fresh Market Repricing with concepts 3–8.

Next:

> Stage 17.B only — compare Activity-to-Price Conversion, Clean Path / Adverse Efficiency, and Stall / Effort-to-Progress Deterioration, including whether concepts 4 and 5 should themselves merge into one path-conversion parent.
