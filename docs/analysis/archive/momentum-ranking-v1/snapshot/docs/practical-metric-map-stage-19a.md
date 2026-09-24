# Stage 19.A — מפת המדדים המעשית הראשונית

Date: 2026-09-24
Issue: #19

## מטרת השלב

לתרגם את ה-sparse core המחקרי למפה קטנה שאפשר להבין ולהפעיל, בלי להפוך את 176 ה-metrics למודל.

השאלה היחידה:

> מתוך מניות שיש בהן מסחר אמיתי עכשיו, איזו מניה מראה את הסיכוי המחקרי הטוב ביותר ל-`remaining capturable opportunity from NOW` בטווח של שניות ועד בערך שתי דקות?

זהו מסמך מחקרי ראשוני. אין כאן weights, thresholds או הסתברויות. אלה ייקבעו רק לאחר validation.

## Evidence status

- **Verified:** מבנה היעד של הפרויקט, תיקון ה-spread, primary outcome של BID→future BID, והפרדת Predictor / Support / Protective / Gate / Synthesis כבר נקבעו במחקר הקודם.
- **Inferred:** המיפוי הפשוט למטה הוא התרגום הקטן ביותר כרגע של אותו מחקר למשתנים מעשיים.
- **Hypothesis:** כל metric עדיין חייב להוכיח stable incremental out-of-sample value.
- **Unknown:** thresholds, weights, חלון הזמן הטוב ביותר והאם כל metric יישאר במודל הסופי.

---

## קודם כול: gates, לא דירוג

מניה לא נכנסת בכלל להשוואת momentum אם הנתונים אינם אמינים או אם אין בה מסחר חי עכשיו.

### Gate 1 — פעילות עסקאות חיה עכשיו

Hebrew: **פעילות עסקאות חיה עכשיו**  
Identifier: `RecentExecutedActivityNow`

נוסחאות בסיס:

```text
TradesInWindow(W)
= cumulativeTrades(t) - cumulativeTrades(t-W)

TradeRate(W)
= TradesInWindow(W) / W_seconds

SecondsSinceLatestTradeIncrement
= t - latestObservedTradeIncrementTime
```

מה טוב:
- יש increments חדשים של עסקאות ממש עכשיו;
- הפעילות אינה print בודד ואחריו שקט;
- הפעילות נמשכת ביותר מחלון קצר אחד.

מה רע:
- אין increment חדש זמן רב;
- הפעילות הייתה קודם אבל נעלמה עכשיו.

תפקיד: **GATE**.

חשוב:

```text
הרבה עסקאות
!=
אות לעלייה
```

ה-gate רק מוכיח שהמניה חיה מספיק כדי שיהיה הגיוני לדרג אותה.

### Gates נוספים

```text
DataQuality
ObservationAge / Freshness
required quote validity
latency
size/depth only where position-size feasibility truly requires it
```

אין threshold קשיח עדיין.

### Spread — החלטה מפורשת

```text
spread
→ IGNORE for ranking
→ IGNORE for eligibility
→ IGNORE as predictive evidence
→ raw diagnostic only
```

מניה פעילה יכולה לבצע עסקאות בפועל גם כאשר ה-spread המוצג רחב. לכן ה-spread אינו veto ואינו penalty בשלב הדירוג.

---

# 7 המדדים/סיגנלים המעשיים הראשוניים

## 1. מהירות עליית ה-BID

Hebrew: **מהירות התקדמות ה-BID**  
Identifier: `BidRisePct`  
Role: **CORE / Predictor**

```text
BidRisePct(W)
=
(BID_now / BID_W_seconds_ago - 1) * 100
```

מה הוא שואל:

> האם השוק עצמו מעלה עכשיו את המחיר שבו קונים מוכנים לעמוד?

מה טוב:
- BID מתקדם כלפי מעלה בחלונות הקצרים;
- ההתקדמות עדיין נראית בחלון האחרון ולא רק בהיסטוריה הרחוקה יותר.

מה רע:
- BID שטוח או יורד;
- רוב העלייה הייתה קודם והחלון הקצר כבר לא מתקדם.

למה הוא קרוב למטרה:
ה-primary outcome של המחקר הוא `BID(t0) → future BID(t)`, ולכן זו עדות current-state ישירה יחסית.

חפיפה:
return / speed / acceleration / BID migration הם children של אותו process. אין לתת להם votes עצמאיים.

---

## 2. אישור תנועת הציטוטים

Hebrew: **אישור שהציטוטים עולים יחד**  
Identifier: `QuoteAdvanceConfirmation`  
Role: **SUPPORT**, child evidence של Fresh Market Repricing

נוסחאות בסיס:

```text
AskRisePct(W)
=
(ASK_now / ASK_W_seconds_ago - 1) * 100

MidRisePct(W)
=
(MID_now / MID_W_seconds_ago - 1) * 100
```

פירוש:
- BID הוא העיקרי;
- ASK ו-MID יכולים לאשר שה-repricing רחב יותר;
- MID משמש גם control למחקר.

מה מטעה:
ASK עולה לבדו אינו מספיק. LAST print בודד או ASK שקפץ ללא BID participation אינם vote עצמאי.

חפיפה:
BID/ASK/MID movement שייכים לאותו information channel. לא מחברים שלושה scores כאילו יש שלוש ראיות בלתי תלויות.

---

## 3. האצת קצב העסקאות

Hebrew: **האצת קצב העסקאות**  
Identifier: `TradeRateAcceleration`  
Role: **SUPPORT**

נוסחה ראשונית:

```text
TradeRateAcceleration(W_recent, W_previous)
=
TradesRecent / W_recent
-
TradesPrevious / W_previous
```

מה הוא שואל:

> האם עכשיו מגיעות עסקאות מהר יותר מאשר רגע קודם?

מה טוב:
קצב העסקאות מתחזק במקביל ל-BID advance.

מה רע:
הפעילות נחלשת, או שהיא מתחזקת בלי שום progress במחיר.

למה אינו CORE לבדו:
raw activity אינה directional. הרבה עסקאות יכולות להתרחש גם בזמן stall, absorption או ירידה.

---

## 4. המרת פעילות להתקדמות מחיר

Hebrew: **יעילות המרת פעילות להתקדמות**  
Identifier: `ActivityToBidProgressEfficiency`  
Role: **CORE candidate / Predictor**

נוסחת candidate פשוטה למחקר:

```text
BidProgressPerTrade(W)
=
BidRisePct(W) / max(TradesInWindow(W), 1)
```

את הנוסחה לא משתמשים לבדה. ה-`RecentExecutedActivityNow` gate חייב לעבור קודם.

השאלה:

> כשמגיעות עסקאות — האם הן באמת מתורגמות להתקדמות BID?

מה טוב:
פעילות משמעותית יחד עם BID progress.

מה רע:
הרבה עסקאות ו-BID שאינו מתקדם, או שה-progress לכל effort מתדרדר.

Failure mode:
יחס גבוה בגלל מעט מאוד עסקאות עלול להטעות; לכן זה efficiency evidence ולא replacement ל-live-activity gate.

חפיפה:
`Activity-to-Price Conversion` ו-`Stall / Effort-to-Progress Deterioration` הם אותו process וצריכים להישאר interface אחד.

---

## 5. שימושיות המסלול / Giveback

Hebrew: **כמה מהעלייה נשמרת בלי להחזיר אותה מיד**  
Identifier: `PathGivebackRatio`  
Role: **PROTECTIVE**

נוסחה ראשונית:

```text
PathGivebackRatio(W)
=
(RecentPeakBid(W) - BID_now)
/
max(RecentPeakBid(W) - BID_start(W), epsilon)
```

רלוונטי כאשר היה progress חיובי בחלון.

פירוש:
- קטן יותר = פחות מהמהלך הוחזר;
- גדול יותר = המסלול מחזיר חלק משמעותי מהעלייה.

מה הוא לא אומר:
מסלול נקי בעבר אינו הוכחה שהמחיר ימשיך לעלות.

לכן:
זה protective modifier עבור target-before-adverse / MAE, לא bullish alpha עצמאי.

---

## 6. טריות המהלך / כמה ממנו עדיין חי עכשיו

Hebrew: **טריות ההתקדמות הנוכחית**  
Identifier: `RecentProgressShare`  
Role: **SYNTHESIS input**

נוסחת candidate:

```text
PositiveBidRise(W)
=
max(BidRisePct(W), 0)

RecentProgressShare(W_short, W_long)
=
PositiveBidRise(W_short)
/
max(PositiveBidRise(W_long), epsilon)
```

היא אינה score סופי בפני עצמה.

השאלה:

> האם ה-progress נמצא עדיין בחלק האחרון של החלון, או שהחלון נראה חזק רק בגלל עלייה ישנה?

מה טוב:
יש progress גם עכשיו, לא רק לפני עשרות שניות.

מה רע:
החלון הארוך עדיין מציג עלייה גדולה אבל החלון הקצר כבר שטוח/שלילי.

Failure mode:
כאשר ה-denominator זעיר, ratio לבדו אינו יציב. לכן Remaining Opportunity הוא synthesis של repricing + conversion + path + timing, ולא vote נוסף.

---

## 7. הקשר לשיא קרוב / Reset-Reclaim

Hebrew: **האם נוצר reset אמיתי והתחלה מקומית חדשה**  
Identifier: `RecentHighResetContext`  
Role: **CONDITIONAL / CONTEXT**, לא universal signal

מדד בסיס:

```text
DistanceFromRecentHighPct(W)
=
(BID_now / RecentHighBid(W) - 1) * 100
```

אבל distance מהשיא לבדו אינו signal.

ה-state שרוצים לחקור הוא:

```text
extension
→ pullback
→ reclaim
→ reacceleration
```

רק אם כל הרצף קיים, אפשר לסמן `FreshResetRenewal = APPLICABLE`.

אחרת:

```text
FreshResetRenewal = NOT_APPLICABLE
```

לא zero ולא negative.

המטרה:
לאפשר מצב שבו ה-wave הרחב ישן, אבל נולדה הזדמנות מקומית צעירה.

---

# מפת התפקידים הראשונית

| פריט | תפקיד ראשוני | האם vote עצמאי? |
|---|---|---|
| RecentExecutedActivityNow | GATE | לא |
| BidRisePct | CORE Predictor | כן, כ-interface מרכזי |
| QuoteAdvanceConfirmation | SUPPORT | לא; child של repricing |
| TradeRateAcceleration | SUPPORT | לא לבדו |
| ActivityToBidProgressEfficiency | CORE candidate | רק אם מוסיף incremental value מעבר ל-BID speed |
| PathGivebackRatio | PROTECTIVE | לא bullish vote |
| RecentProgressShare / Remaining Opportunity | SYNTHESIS | לא vote נוסף |
| RecentHighResetContext | CONDITIONAL / CONTEXT | רק כש-reset באמת קיים |
| Spread | IGNORE / raw diagnostic | לעולם לא ב-ranking הנוכחי |

## KISS boundary

המודל המעשי לא אמור לחבר את כל השורות בטבלה.

הכיוון הנוכחי הוא:

```text
live-activity gate
→ BID repricing
→ activity supports / converts
→ path is usable
→ opportunity still fresh
→ optional reset context
→ rank / NO_OPPORTUNITY
```

## מה עדיין לא נקבע בשלב 19.A

- האם 10s, 20s, 30s או 60s הוא החלון העיקרי;
- האם %/minute מועיל מעבר לחלונות seconds;
- האם trades/minute או trades/hour נשארים רק context;
- אילו children מיותרים לחלוטין;
- thresholds;
- weights;
- final formula.

אלה שייכים לשלבים הבאים של Issue #19, ובעיקר 19.B ו-19.C.
