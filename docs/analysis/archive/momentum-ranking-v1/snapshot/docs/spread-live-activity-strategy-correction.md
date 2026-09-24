# Spread / Live-Activity Strategy Correction

Date: 2026-09-24

## Decision

Momentum Ranking V1 deliberately searches among securities that are **actively trading now**.

Therefore the practical eligibility question is:

> Are real trades occurring now, frequently enough and recently enough that the security is alive for a seconds-to-minutes decision?

Not:

> Is the displayed BID/ASK spread narrow?

## New hard rule

~~~text
spread
→ IGNORE for ranking
→ IGNORE for eligibility
→ IGNORE as predictive evidence
→ raw diagnostic only
~~~

The active-universe gate is instead built from executed-activity evidence such as:

~~~text
time since latest observed trade
recent trade-count delta
trades per second/minute
short-window activity persistence
~~~

Exact thresholds remain empirical.

## Why this matters

A displayed spread can be wide while real transactions continue to occur actively.

In an active security, the current displayed gap is not sufficient evidence that the opportunity is unusable.

For this project, using spread as a gate would also duplicate/frustrate the actual objective because the model can directly observe:

~~~text
did BID advance after NOW?
did price progress occur quickly?
were real trades still occurring?
~~~

## Outcome correction

Primary future outcome becomes:

~~~text
BID(t0) → future BID(t)
~~~

with:

~~~text
FutureBidVsCurrentBidReturn
BidAdvanceMFE
BidAdvanceMAE
target-before-adverse
TimeToTarget
~~~

MID remains the raw-market control.

ASK(t0)→future BID remains an optional conservative diagnostic only and cannot decide which predictive concept/model wins.

## Execution caveat

Recent executed activity does not guarantee that a specific passive order will fill or that displayed depth will remain.

That requires execution telemetry/tape and is a separate question.

The ranking problem is first:

> Which actively traded security is moving in the desired way from NOW?

## Architectural effect

Mandatory practical gates become approximately:

~~~text
DataQuality
Freshness / ObservationAge
RecentExecutedActivityNow
required quote validity
latency
size/depth only where position-size feasibility actually needs it
~~~

Spread is removed.

## Validation requirement

Issue #11 should explicitly test the active-trading gate and verify that adding spread back after activity/recency are known provides no useful incremental selection value before it is ever reconsidered.
