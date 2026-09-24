# Stage 19.C — Redundancy Elimination

Date: 2026-09-24
Issue: #19

## מטרת השלב

להפסיק לחשוב במונחים של רשימת indicators, ולצמצם את כל המדדים האינטואיטיביים למספר הקטן ביותר של information channels שבאמת שונים זה מזה.

הכלל:

> אם שני metrics מספרים כמעט את אותו סיפור, הם אינם מקבלים שני votes.

המטרה של השלב הזה אינה להוכיח אמפירית שהמדדים שנשארו טובים. המטרה היא להחליט מה בכלל ראוי להגיע לשלב validation כ-concept נפרד.

אין כאן weights, thresholds או probability claims.

---

# 1. תוצאת הצמצום

Stage 19.A הציג שבעה פריטים מעשיים.

אחרי בדיקת החפיפות, המפה המצומצמת היא:

```text
GATES
1. Recent Executed Activity / data validity

UNIVERSAL DECISION INTERFACES
2. Fresh BID Repricing
3. Activity → Price Progress Conversion
4. Path Usability / Adverse Efficiency
5. Remaining Opportunity / Freshness

CONDITIONAL
6. Fresh Reset / Renewal
```

כלומר:

```text
4 universal decision interfaces
+
1 conditional reset interface
+
gates
```

זו בדיוק הצורה הקטנה שתואמת את sparse-core המחקרי.

---

# 2. מה ירד כפריט עצמאי

הפריטים הבאים **לא** צריכים slot עצמאי במודל המעשי:

```text
ASK movement
MID movement
Trade-rate acceleration
% rise per minute
trades per minute
trades per hour
ASK-LAST distance
BID-LAST distance
spread
distance from recent high
reversal count
reversal depth
```

חלקם עדיין שימושיים כ-child evidence, diagnostics או context.

המשמעות של "לא slot עצמאי":

> אפשר עדיין לחשב או לשמור אותם, אבל הם לא מקבלים vote נפרד בדירוג.

---

# 3. Interface 1 — Fresh BID Repricing

Hebrew:

> האם ה-BID באמת מתקדם כלפי מעלה עכשיו?

Canonical practical metric family:

```text
BidRisePct(W)
```

Candidate windows:

```text
10s / 20s / 30s
with 60s as broader reference
```

## מה מתמזג לתוכו

```text
% rise per 10s
% rise per 20s
% rise per 30s
% rise per minute
BID movement
ASK movement
MID movement
price speed
price acceleration
quote migration
```

### למה

כולם מתארים את אותו underlying process:

```text
fresh quoted-market repricing
```

הבדל בין BID, ASK ו-MID הוא evidence decomposition, לא משפחת alpha חדשה.

## Priority

```text
BID = primary
MID = parallel raw-market control
ASK = supporting quote-side evidence
```

## מה לא עושים

לא:

```text
BidScore + AskScore + MidScore
```

כאילו התקבלו שלוש ראיות בלתי תלויות.

לא:

```text
10s score + 20s score + 30s score + 60s score
```

כאילו כל חלון הוא signal נפרד.

---

# 4. Interface 2 — Activity → Price Progress Conversion

Hebrew:

> כשהפעילות מתחזקת, האם היא באמת הופכת להתקדמות BID?

Canonical practical family:

```text
TradeRateAcceleration
+
ActivityToBidProgressEfficiency
+
ConversionTimingState
```

אבל הם interface אחד.

## מה מתמזג לתוכו

```text
trade-rate acceleration
activity burst
trades per short window
activity-to-price conversion
progress-per-trade
effort-to-progress deterioration
stall clock
conversion latency
```

## למה TradeRateAcceleration אינו slot עצמאי

כי:

```text
more activity
!=
upward direction
```

האצה בפעילות יכולה להיות:

- קניות ומכירות אגרסיביות משני הצדדים;
- absorption;
- reversal;
- panic;
- stalled battle.

לכן acceleration היא child evidence בלבד.

## למה trades/minute אינו slot עצמאי

```text
TradesPerMinute
=
TradesInWindow(60s)
```

זה רק activity view ב-60 שניות.

הוא יכול לעזור כ-baseline או gate/context, אבל אינו directional predictor עצמאי.

## למה trades/hour אינו slot עצמאי

Trailing hour:

```text
CONTEXT only
```

Scaled short rate:

```text
REDUNDANT unit conversion
```

---

# 5. Interface 3 — Path Usability / Adverse Efficiency

Hebrew:

> האם הדרך למעלה usable, או שהמחיר כל הזמן מחזיר חלק גדול מהמהלך?

Canonical practical family:

```text
giveback
+
reversal density
+
reversal depth
+
adverse excursion
```

## מה מתמזג לתוכו

```text
giveback
reversal count
reversal depth
progress vs adverse excursion
path cleanliness
```

## למה reversal count אינו slot עצמאי

שתי מניות יכולות לבצע אותו מספר reversals, אבל:

- באחת כל reversal זעיר;
- בשנייה כל reversal מחזיר חצי מהמהלך.

לכן count לבדו חסר magnitude.

## למה reversal depth אינו slot עצמאי

depth בלי frequency גם לא מספר את כל הסיפור.

לכן שניהם child evidence של:

```text
Path Usability
```

## Role

```text
PROTECTIVE
```

לא bullish alpha עצמאי.

---

# 6. Interface 4 — Remaining Opportunity / Freshness

Hebrew:

> האם המהלך עדיין מתרחש עכשיו, או שרוב ההתקדמות כבר מאחורינו?

Canonical practical family:

```text
RecentProgressShare
+
MoveConsumption
+
OpportunityEvidenceAge
+
UsableLeadBudget
```

זה synthesis.

## מה מתמזג לתוכו

```text
short-vs-long progress
move age
detection lateness
evidence decay
usable lead
progress concentration near NOW
```

## למה % rise per minute לא מספיק

מניה יכולה להיות:

```text
+1% over 60s
```

אבל:

```text
last 10s = flat / negative
```

לכן total minute return אינו אומר כמה opportunity נשארה.

## למה distance from recent high לא slot universal

```text
DistanceFromRecentHigh
```

יכול להיות:

- קרוב לשיא כי המניה עדיין מתקדמת;
- קרוב לשיא אבל stalled;
- רחוק מהשיא כי הייתה pullback בריאה;
- רחוק מהשיא כי המהלך נכשל.

לכן distance לבדו אינו directional signal.

הוא context child של lifecycle/reset interpretation.

---

# 7. Conditional Interface — Fresh Reset / Renewal

Hebrew:

> האם אחרי extension/pullback נוצרה הזדמנות מקומית חדשה?

Canonical state:

```text
extension
→ pullback
→ reclaim
→ reacceleration
```

רק אז:

```text
FreshResetRenewal = APPLICABLE
```

אחרת:

```text
NOT_APPLICABLE
```

## למה הוא נשאר נפרד

זה המקרה היחיד שבו:

```text
broad move = old
but
local opportunity = young
```

Remaining Opportunity לבדו עלול לראות מהלך ישן.

Reset אמיתי יכול לשנות את interpretation.

אבל זה conditional reserve, לא universal vote.

---

# 8. Gates — מחוץ ל-alpha

## Recent Executed Activity

Hebrew:

> האם המניה חיה ממש עכשיו?

Children:

```text
SecondsSinceLatestTradeIncrement
TradesInWindow(10s)
TradesInWindow(20s)
TradesInWindow(30s)
TradesInWindow(60s)
activity persistence
```

אלה אינם directional alpha.

הם eligibility evidence.

## Data / quote validity

```text
DataQuality
ObservationAge
required BID/ASK validity
latency
size/depth only where position feasibility requires it
```

## Spread

Hard disposition:

```text
IGNORE for ranking
IGNORE for eligibility
IGNORE as predictive evidence
raw diagnostic only
```

---

# 9. ASK-LAST ו-BID-LAST distances

Candidate metrics:

```text
AskLastDistance
BidLastDistance
```

Stage 19.C disposition:

```text
DIAGNOSTIC / CONTEXT
not retained as independent practical metric
```

## למה

LAST הוא print observation.

המרחק שלו מה-touch יכול להשתנות בגלל:

- quote migration;
- stale LAST;
- discrete prints;
- timing between snapshots;
- movement of BID/ASK after the print.

חלק גדול מהמידע כבר נתפס על ידי:

```text
Fresh BID Repricing
+
quote-side confirmation
+
activity recency
```

לכן אין הצדקה כרגע לתת ל-ASK-LAST/BID-LAST slot נפרד.

אם בעתיד הם מוכיחים incremental out-of-sample value אחרי ה-core:

```text
reconsider
```

אחרת:

```text
drop
```

---

# 10. verdict table — כל המדדים האינטואיטיביים הנדרשים

| Metric אינטואיטיבי | Verdict | Owner / merge target | הסבר פשוט |
|---|---|---|---|
| % rise per minute | REDUNDANT / CONTEXT | Fresh BID Repricing + Remaining Opportunity | זה BidRisePct(60s); לא metric חדש, ועלול להיראות חזק כשהמהלך כבר דעך |
| % rise per 10s / 20s / 30s | CORE | Fresh BID Repricing | multi-window views של אותו process, לא votes נפרדים |
| trades per minute | GATE / CONTEXT | Recent Executed Activity / Conversion | מודד activity ב-60s, לא כיוון |
| trades per hour | CONTEXT / REDUNDANT | background activity context | איטי מדי ל-core; אם רק scaling של short rate אין מידע חדש |
| trade-rate acceleration | SUPPORT | Activity → Price Progress Conversion | useful only when activity converts to upward progress |
| BID movement | CORE | Fresh BID Repricing | primary current-state price evidence |
| ASK movement | SUPPORT / REDUNDANT as vote | Fresh BID Repricing | child confirmation, לא alpha channel נוסף |
| MID movement | SUPPORT / CONTROL | Fresh BID Repricing | raw-market control / confirmation |
| ASK - LAST distance | CONTEXT / DIAGNOSTIC | quote/LAST diagnostic | חופף ל-repricing + stale/print timing; לא slot עצמאי |
| BID - LAST distance | CONTEXT / DIAGNOSTIC | quote/LAST diagnostic | כנ"ל |
| spread | IGNORE / NOISE for ranking | raw diagnostic only | active-trading gate מחליף אותו; אינו veto/penalty |
| distance from recent high | CONTEXT / CONDITIONAL | Remaining Opportunity / Reset | distance לבדו ambiguous |
| giveback | PROTECTIVE CORE CHILD | Path Usability | captures how much progress is surrendered |
| reversal count | REDUNDANT alone | Path Usability | count בלי depth אינו מספיק |
| time since latest observed trade | GATE | Recent Executed Activity | מוכיח שהמניה חיה; לא אומר כיוון |

---

# 11. מה נשאר בפועל למדריך הסופי

## Gates

### G1. המניה חיה עכשיו

```text
RecentExecutedActivityNow
```

### G2. הנתונים והציטוטים תקינים וטריים

```text
DataQuality / ObservationAge / QuoteValidity / Latency
```

### G3. feasibility לפי גודל רק אם באמת נדרש

לא spread.

---

## Universal metric/interface 1

### התקדמות BID טרייה

```text
FreshBidRepricing
```

Plain Hebrew:

> האם ה-BID עולה עכשיו?

---

## Universal metric/interface 2

### פעילות שהופכת להתקדמות

```text
ActivityToPriceProgress
```

Plain Hebrew:

> האם הפעילות מתחזקת וגם באמת מזיזה את ה-BID למעלה?

---

## Universal metric/interface 3

### שימושיות המסלול

```text
PathUsability
```

Plain Hebrew:

> האם העלייה נשמרת יחסית, או שכל הזמן מוחזרת?

---

## Universal metric/interface 4

### כמה מההזדמנות עוד נשארה

```text
RemainingOpportunity
```

Plain Hebrew:

> האם המהלך עדיין קורה עכשיו, או שאנחנו מגיעים מאוחר?

---

## Conditional metric/interface 5

### Reset / Renewal אמיתי

```text
FreshResetRenewal
```

Plain Hebrew:

> אם המהלך הרחב כבר ישן — האם נוצרה התחלה מקומית חדשה אחרי pullback + reclaim?

---

# 12. final candidate flow אחרי redundancy elimination

```text
1. המניה חיה עכשיו?
   NO → reject

2. ה-BID מתקדם עכשיו?
   NO → weak/no current opportunity

3. הפעילות באמת הופכת להתקדמות?
   NO → activity alone is not enough

4. המסלול usable?
   NO → protective penalty / reject depending on validation

5. עדיין נשאר מהלך מעכשיו?
   NO → late / consumed opportunity

6. אם היה reset:
   האם היה reclaim + reacceleration אמיתי?
   YES → local renewal context

→ candidate rank / NO_OPPORTUNITY
```

אין weights.

אין threshold hardcoded.

אין probability.

---

# 13. KISS result

לפני הצמצום אפשר היה בקלות להגיע ל:

```text
10s return
20s return
30s return
60s return
BID move
ASK move
MID move
trade count
trade acceleration
progress/trade
giveback
reversal count
reversal depth
high distance
ASK-LAST
BID-LAST
spread
...
```

אחרי 19.C:

```text
GATE: live activity / valid data

1. Fresh BID Repricing
2. Activity → Price Progress
3. Path Usability
4. Remaining Opportunity
5. Conditional Reset / Renewal
```

זהו ה-candidate set הקטן ביותר כרגע שמכסה את המידע השונה באמת בלי double counting ברור.

---

# 14. Evidence status

## Verified within project design

- spread is excluded from ranking/eligibility;
- BID→future BID is the primary direct outcome family;
- multi-window values are not independent votes;
- raw activity is not directional;
- sparse core architecture separates Predictor / Protective / Synthesis / Conditional roles.

## Inferred / architectural reduction

- ASK/MID movement can be represented as child evidence under Fresh BID Repricing;
- acceleration can be represented under Activity→Price Progress rather than as a separate vote;
- reversal count/depth should merge into Path Usability;
- ASK-LAST/BID-LAST distances do not currently justify a separate practical slot;
- recent-high distance belongs under lifecycle/reset context rather than universal alpha.

## Unknown until empirical validation

- whether Activity→Price Progress adds value beyond BID repricing;
- whether Path Usability improves target-before-adverse selection enough to retain;
- whether Remaining Opportunity adds measurable held-out value;
- whether Reset/Renewal deserves retention;
- which windows survive minimal-model selection;
- thresholds and weights.

Any of the retained interfaces can still be dropped if incremental value is not demonstrated.

---

# 15. Handoff to 19.D

The next stage should build the final comprehensive Hebrew guide from this reduced set.

It should include:

- exact Hebrew name + English identifier;
- simple formula;
- recommended research windows;
- what looks good/bad;
- why it matters;
- when it lies;
- role;
- overlap/merge note;
- the explicit verdict table;
- simple examples;
- final compact ranking flow;
- clear labels for Verified / Inferred / Unknown;
- no arbitrary weights or thresholds.

The final guide should present the five practical interfaces above, not reopen the indicator zoo.
