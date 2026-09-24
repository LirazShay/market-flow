# Stage 19.B — semantics של חלונות הזמן

Date: 2026-09-24
Issue: #19

## מטרת השלב

לקבוע איך לפרש את חלונות הזמן המעשיים:

```text
10s / 20s / 30s / 60s
```

ולמקם נכון מדדים אינטואיטיביים כמו:

```text
% rise per minute
trades per minute
trades per hour
```

בלי להפוך כל window ל-signal עצמאי ובלי לבחור threshold/weight לפני evidence.

---

## 1. עיקרון יסוד — חלון זמן אינו information channel חדש

אם מחשבים:

```text
BidRisePct(10s)
BidRisePct(20s)
BidRisePct(30s)
BidRisePct(60s)
```

אין כאן ארבע ראיות עצמאיות.

כולן מסתכלות על אותו process:

```text
Fresh Market Repricing
```

בסקאלות זמן שונות.

אותו דבר לגבי:

```text
TradesInWindow(10s)
TradesInWindow(20s)
TradesInWindow(30s)
TradesInWindow(60s)
```

אלה views שונים של activity, לא ארבעה votes.

Hard rule:

> multi-window evidence מתאר shape / freshness / persistence של אותו process. הוא לא יוצר משפחת signal נוספת.

---

# 2. מפת המשמעות של 10s / 20s / 30s / 60s

## 10 שניות — immediate pulse

שאלה:

> מה קורה ממש עכשיו?

שימושים מרכזיים:

- האם הגיעו עסקאות ממש לאחרונה;
- האם BID עדיין מתקדם ברגע האחרון;
- האם activity rate התעורר;
- האם progress ממשיך או נעצר.

Role:

```text
PRIMARY FRESHNESS VIEW
```

יתרון:
רגיש מאוד לשינוי חדש.

חיסרון:
רגיש ל-noise, snapshot timing ו-print בודד.

לכן:

> 10s הוא view חשוב מאוד ל-"עכשיו", אבל לא חייב לעמוד לבדו כהוכחה מספקת.

---

## 20 שניות — immediate confirmation

שאלה:

> האם מה שראינו ב-10s הוא process קצר שנמשך, ולא רק pulse בודד?

שימושים:

- confirmation ל-BID advance;
- activity persistence;
- activity→price conversion;
- התחלה של path usability.

Role:

```text
PRIMARY CONFIRMATION VIEW
```

הוא עדיין בתוך הקבוצה של Issue #15:

```text
5–20s = immediate outcome horizon
```

אבל חשוב להבדיל:

```text
20s predictor lookback
!=
20s future outcome horizon
```

הראשון מסתכל אחורה מ-NOW; השני מודד מה קרה אחרי NOW.

---

## 30 שניות — local process view

שאלה:

> האם יש כאן מהלך מקומי אמיתי עם continuity, ולא רק כמה שניות טובות?

שימושים:

- local repricing shape;
- conversion stability;
- giveback/reversal context;
- השוואה בין "עכשיו" לבין החלק הקודם של המהלך.

Role:

```text
PRIMARY LOCAL-PROCESS VIEW
```

30s מתאים במיוחד לבדיקת:

```text
10s now
vs
previous 20s
```

למשל עבור activity acceleration:

```text
RecentTradeRate10
=
Trades(t-10,t] / 10

PriorTradeRate20
=
Trades(t-30,t-10] / 20

TradeRateAcceleration10vsPrior20
=
RecentTradeRate10 - PriorTradeRate20
```

החלונות כאן disjoint כדי לא להשוות recent activity לחלון שמכיל בתוכו את אותן 10 שניות.

---

## 60 שניות — broader local reference

שאלה:

> איך ה-"עכשיו" נראה ביחס לדקה המקומית האחרונה?

שימושים:

- baseline מקומי;
- move consumption / remaining opportunity;
- האם 10–20s האחרונים עדיין חזקים לעומת המהלך הרחב;
- path/giveback רחב יותר;
- activity persistence ברמה מעט פחות רגישה ל-noise.

Role:

```text
SECONDARY / SYNTHESIS REFERENCE
```

60s אינו "יותר טוב" מ-10s רק כי יש בו יותר data.

למטרה של seconds-to-~2-minutes הוא לעיתים דווקא פחות fresh.

לכן ברירת המחדל המחקרית:

```text
10/20/30s
→ current-state primary panel

60s
→ broader local reference / synthesis
```

זו היררכיית semantics, לא weight קבוע.

---

# 3. איך להשתמש בכמה חלונות בלי double counting

במקום:

```text
Score =
Bid10
+ Bid20
+ Bid30
+ Bid60
```

הגישה הנכונה היא לתאר shape.

דוגמאות:

### מצב A — fresh acceleration

```text
10s strong
20s positive
30s positive
60s modest
```

פירוש אפשרי:

> המהלך המקומי מתגבר עכשיו.

### מצב B — old move / fading now

```text
60s strong
30s positive
20s weak
10s flat/negative
```

פירוש אפשרי:

> ההיסטוריה הקרובה עדיין נראית חזקה, אבל current opportunity עלולה להיות מאוחרת.

### מצב C — one-pulse noise

```text
10s strong
20s weak
30s weak
60s weak
```

פירוש:

> ייתכן pulse חדש, אך עדיין אין persistence.

### מצב D — stable local repricing

```text
10s positive
20s positive
30s positive
60s positive
```

פירוש:

> process עולה קיים בכמה סקאלות זמן.

אבל גם כאן אין להסיק אוטומטית שיש remaining opportunity; ייתכן שהמהלך כבר consumed.

---

# 4. verdict ל-% rise per minute

אם "אחוז עלייה בדקה" מוגדר:

```text
PctRisePerMinute
=
(BID_now / BID_60s_ago - 1) * 100
```

אז:

```text
PctRisePerMinute
=
BidRisePct(60s)
```

כלומר זה לא metric חדש.

Verdict:

```text
CONTEXT / SYNTHESIS INPUT
MOSTLY REDUNDANT with BidRisePct(60s)
```

למה לא CORE יחיד:

- הוא יכול להיראות חזק אף שה-10s האחרונים כבר נעצרו;
- הוא מערבב fresh move עם old move;
- ל-objective קצר מאוד, location of progress inside the minute חשוב יותר מה-total minute return לבדו.

לכן:

> "% בדקה" שימושי כדי להבין את הדקה, אבל לא במקום לראות האם ה-BID עולה עכשיו.

---

# 5. verdict ל-% rise per 10s / 20s / 30s

אלה אינם שלושה metrics נפרדים.

כולם:

```text
BidRisePct(W)
```

עם W שונה.

Verdict:

```text
CORE multi-window view
```

כאשר:

- 10s = freshness;
- 20s = immediate confirmation;
- 30s = local process.

המודל הסופי עשוי לשמור רק subset אם validation יראה שהשאר redundant.

---

# 6. verdict ל-trades per minute

אם מוגדר:

```text
TradesPerMinute
=
TradesInWindow(60s)
```

או:

```text
TradeRate60
=
TradesInWindow(60s) / 60
```

אז זה אותו מידע כמו activity window של 60s, רק ביחידות אחרות.

Verdict:

```text
GATE / CONTEXT
not directional CORE
REDUNDANT as a separate vote
```

שימוש:

- להוכיח שהמניה חיה;
- לתת local activity baseline;
- להשוות 10s/20s current rate מול הדקה הרחבה.

לא להשתמש כך:

```text
more trades/minute
=
more bullish
```

זה אינו מוכח.

---

# 7. verdict ל-trades per hour

יש שתי משמעויות שונות שצריך לא לערבב.

## A. trailing 60-minute count

```text
TradesLastHour
=
TradesInWindow(3600s)
```

Verdict:

```text
CONTEXT only
```

למטרה של seconds-to-~2-minutes זה baseline איטי מדי כדי להיות current directional signal.

הוא עשוי בעתיד לעזור להבין:

- האם current activity חריגה יחסית ל-security;
- liquidity/activity regime.

אבל הוא נכנס רק אם יוכיח incremental value.

## B. short-rate annualized/scaled to "per hour"

למשל:

```text
TradesPerHourEquivalent
=
TradeRate10s * 3600
```

Verdict:

```text
PURE REDUNDANT UNIT CONVERSION
```

אין בו מידע חדש בכלל.

לכן אין ליצור ממנו metric נפרד.

---

# 8. פעילות עסקאות — חלונות מומלצים למחקר

עבור live gate:

```text
SecondsSinceLatestTradeIncrement
TradesInWindow(10s)
TradesInWindow(20s)
TradesInWindow(30s)
TradesInWindow(60s)
```

אבל ה-gate הסופי לא אמור לדרוש "ציון" מכל אחד.

מטרת multi-window activity היא לתאר:

```text
recency
+
persistence
+
current rate
```

בלי לקבוע כרגע:

```text
X trades in 10s = pass
```

thresholds נשארים empirical.

---

# 9. Trade-rate acceleration — primary comparison

Candidate פשוט למחקר:

```text
RecentRate10
=
Trades(t-10,t] / 10

PriorRate20
=
Trades(t-30,t-10] / 20

Acceleration10vsPrior20
=
RecentRate10 - PriorRate20
```

למה comparison כזה מעניין:

- recent window קטן מספיק כדי לתפוס שינוי חדש;
- prior window רחב יותר מייצב מעט את baseline;
- החלונות אינם חופפים.

אבל:

```text
positive acceleration
!=
bullish signal
```

הוא נשאר SUPPORT ונדרש לראות אם activity גם מתורגמת ל-BID progress.

---

# 10. Activity → Price Progress — אותו clock

כדי לא לייצר mismatch, efficiency candidate צריך בדרך כלל להשוות activity ו-price progress על אותו window:

```text
BidProgressPerTrade(W)
=
BidRisePct(W)
/
max(TradesInWindow(W), 1)
```

Candidate windows:

```text
10s / 20s / 30s
```

60s יכול לשמש reference רחב יותר.

המחקר צריך לשאול:

> האם efficiency ב-10–30s מוסיפה ערך אחרי שכבר יודעים את BidRisePct באותם חלונות?

אם לא:

```text
drop / demote
```

---

# 11. Path usability — לא רק 10 שניות

Giveback/reversal evidence צריך מספיק path כדי להיות meaningful.

Research views:

```text
20s
30s
60s
```

10s יכול להישמר diagnostic כאשר cadence מאפשר מספיק observations, אך הוא לא צריך להיכפות כ-primary path window.

Reason:

> path quality דורשת path, לא רק שתי נקודות.

---

# 12. Remaining Opportunity — short vs long בתוך אותו מהלך

Candidate comparisons:

```text
10s vs 30s
20s vs 60s
30s vs 60s
```

מטרה:

> לזהות האם progress עדיין concentrated ב-NOW או שהחלון הארוך חזק רק בגלל עבר קרוב.

דוגמה conceptual:

```text
BidRise30 > 0
BidRise10 <= 0
```

לא אומר אוטומטית "sell" או "bad stock".

הוא אומר:

> current repricing evidence נחלש יחסית למה שקרה מוקדם יותר בתוך החלון.

Remaining Opportunity נשאר synthesis ולא alpha vote נוסף.

---

# 13. recent-high / reset windows

`DistanceFromRecentHigh` אינו CORE universal.

לכן 19.B לא מקבע לו primary window.

Candidate context יכול להיבחן על:

```text
60s / 90s / 120s
```

כדי לזהות:

```text
extension
→ pullback
→ reclaim
→ reacceleration
```

אבל window/threshold סופי ייקבע רק אם Renewal יוכיח incremental value.

---

# 14. predictor lookback מול future outcome horizon

חשוב לא לערבב:

```text
LOOKBACK WINDOW
=
מה קרה לפני NOW

OUTCOME HORIZON
=
מה קרה אחרי NOW
```

Issue #15 כבר קיבע outcome grid:

```text
5, 10, 20, 30, 40, 50, 60, 90, 120s
```

עם interpretation:

```text
5–20s   immediate
30–60s  short
90–120s outer objective boundary
```

19.B אינו משנה את ה-grid הזה.

ה-predictor research panel:

```text
10 / 20 / 30 / 60s
```

הוא lookback panel בלבד.

---

# 15. למה לא להוסיף כרגע 5s predictor window

5s הוא outcome horizon חשוב, אבל predictor lookback של 5s תלוי חזק ב-cadence ובמספר observations הזמינים.

ה-workstream כבר יודע שה-cycle שנבדק בעבר היה בערך 5 שניות, אך Issue #18 עדיין לא קבע cadence סופי.

לכן:

```text
5s predictor window
→ DEFER until cadence evidence
```

זה אינו אומר שאין בו מידע.

זה אומר שלא נכון לבנות עליו practical V1 metric לפני שיודעים שהוא observable בצורה אמינה.

---

# 16. למה לא לקבוע "החלון הטוב ביותר" עכשיו

אין empirical calibration.

לכן 19.B לא אומר:

```text
20s is best
30s is best
60s is too slow
```

באופן מוחלט.

הוא רק קובע semantics:

| Window | משמעות מחקרית | Role ראשוני |
|---:|---|---|
| 10s | מה קורה ממש עכשיו | primary freshness |
| 20s | האם ה-pulse נמשך | primary confirmation |
| 30s | local process / continuity | primary local-process |
| 60s | broader local reference | secondary / synthesis |
| 60min | session-local activity context | context בלבד |

ה-selection האמפירי צריך לבדוק:

```text
individual value
incremental value
leave-one-window-out / reduced-window model
```

ולהעדיף את subset הקטן ביותר שנותן ביצועים שקולים.

---

# 17. practical rule ל-V1 research

מפת החלונות הפשוטה:

```text
10s
= NOW

20s
= NOW confirmed

30s
= local process

60s
= local reference / consumption context

1h
= background context only
```

והכלל החשוב ביותר:

```text
same metric across windows
!=
multiple independent votes
```

---

# 18. מה נשאר ל-19.C

השלב הבא צריך לבצע redundancy elimination מפורש:

- אילו intuitive metrics הם רק aliases;
- ASK/LAST ו-BID/LAST — האם נשארים support/diagnostic או נזרקים;
- BID/ASK/MID movement — איך מתמזגים בלי double count;
- %/minute מול seconds windows;
- trades/minute/hour מול recent activity;
- distance-from-high מול freshness/reset;
- giveback מול reversal count/depth;
- איזה 5–7 items נשארים בפועל למסמך הסופי.

עדיין אין weights, thresholds או final rank formula.
