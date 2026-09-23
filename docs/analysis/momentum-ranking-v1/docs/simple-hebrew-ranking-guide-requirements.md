# Simple Hebrew Ranking Guide — Requirements

Date: 2026-09-24

## Purpose

The final Momentum Ranking research must end in a document that is simple enough to use directly.

Internal research may remain detailed. The user-facing ranking logic must not.

## Target shape

~~~text
5–7 practical metrics/signals
+
a few hard gates
~~~

Not:

~~~text
dozens of families
hundreds of additive indicators
complex academic scoring
~~~

## Provisional practical shortlist

### 1. Short-term price rise / speed

Plain question:

> בכמה המחיר עלה בזמן קצר, והאם העלייה מתרחשת עכשיו?

Candidate windows:

~~~text
10s / 20s / 30s / 60s
~~~

Prefer BID/MID-aware movement over blindly using one LAST print.

### 2. Trades-per-time / activity acceleration

Plain question:

> האם מספר העסקאות ליחידת זמן גדל?

Examples:

~~~text
trades / 10s
trades / 30s
trades / 60s
~~~

Trades/hour may be useful as broad context, but is likely too slow to be a primary signal for a seconds-to-~2-minute objective.

### 3. BID / ASK migration

Plain question:

> האם ה-BID וה-ASK עצמם עולים, ובעיקר האם ה-BID עולה?

This is closer to the future sell-side path than a trade print alone.

### 4. Activity → price progress

Plain question:

> כשמגיעות יותר עסקאות/פעילות, האם המחיר באמת מתקדם כלפי מעלה?

High activity without upward progress is not automatically good.

### 5. Path cleanliness / giveback

Plain question:

> האם העלייה מתקדמת יחסית בצורה נקייה, או שכל רגע מחזירה חלק גדול מהמהלך?

This is mainly protective / target-before-adverse logic.

### 6. Freshness / remaining opportunity

Plain question:

> האם המהלך עדיין חי עכשיו, או שכבר רוב העלייה קרתה ואנחנו מגיעים מאוחר?

This is a synthesis, not another independent alpha signal.

### 7. Spread / depth / freshness gates

Plain question:

> גם אם המניה נראית טובה — האם בכלל אפשר להיכנס/לצאת בלי שה-spread, stale data או depth יהרסו את העסקה?

These are gates, not directional predictors.

## Intuitive metrics that must be explicitly judged

The final guide must include a table for intuitive metrics such as:

~~~text
% rise per minute
trades per minute
trades per hour
BID movement
ASK movement
ASK - LAST distance
BID - LAST distance
BID-ASK spread
distance from recent high
recent trade count acceleration
~~~

For each metric classify:

~~~text
CORE
SUPPORT
GATE
CONTEXT
MOSTLY_REDUNDANT / NOISE
~~~

and explain why in plain Hebrew.

## Final guide requirements

For every retained metric:

1. Hebrew name.
2. Exact simple formula.
3. Recommended time windows.
4. What a strong value looks like.
5. What a weak/bad value looks like.
6. Why it matters.
7. When it misleads.
8. Whether it predicts, protects, or gates.
9. Whether another metric makes it redundant.

## Final ranking recipe

The final document must end with a compact practical flow such as:

~~~text
1. Is price moving up now?
2. Is BID participating?
3. Is activity converting into price progress?
4. Is the path usable?
5. Is the move still fresh?
6. Do spread/freshness/depth gates pass?
→ rank / no opportunity
~~~

The exact recipe remains subject to empirical validation, but the final user-facing explanation must remain this simple.
