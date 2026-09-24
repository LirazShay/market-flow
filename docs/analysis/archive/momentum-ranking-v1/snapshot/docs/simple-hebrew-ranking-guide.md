# Momentum Ranking V1 — מדריך מעשי פשוט בעברית

Date: 2026-09-24  
Issue: #19  
Scope: practical research guide for the seconds-to-~2-minute momentum-ranking objective

---

# 1. מה אנחנו מנסים למצוא

המטרה אינה למצוא:

- "מניה טובה";
- מניה שעלתה הכי הרבה היום;
- מניה עם הכי הרבה עסקאות;
- מניה עם spread קטן;
- מניה שהייתה חזקה בדקה האחרונה.

המטרה היא שונה:

> מתוך מניות שחיות ונסחרות ממש עכשיו, איזו מניה מראה את ההזדמנות הטובה ביותר **מעכשיו** לתנועה חיובית מהירה ושימושית בטווח של שניות ועד בערך שתי דקות?

במילים קצרות:

```text
remaining capturable opportunity from NOW
```

ולא:

```text
historical strength
```

מניה יכולה להיות שלילית מאוד ביום ועדיין להיות מועמדת טובה כרגע.

מניה יכולה להיות חזקה מאוד בדקה האחרונה ועדיין להיות מועמדת גרועה אם רוב המהלך כבר מאחוריה.

---

# 2. המודל המעשי הקטן

אחרי צמצום החפיפות, ה-candidate model המעשי הוא:

```text
GATES
G1. Recent Executed Activity Now
G2. Data / Quote Validity / Observation Freshness
G3. Size/depth feasibility only where actually required

UNIVERSAL DECISION INTERFACES
M1. Fresh BID Repricing
M2. Activity → Price Progress
M3. Path Usability
M4. Remaining Opportunity

CONDITIONAL
M5. Fresh Reset / Renewal
```

כלומר:

> כמה gates פשוטים + ארבעה interfaces אוניברסליים + reset אחד שרלוונטי רק כשבאמת היה reset.

לא צריך עשרות scores.

---

# 3. סדר ההחלטה

הסדר הלוגי הוא:

```text
1. האם המניה חיה עכשיו?
2. האם הנתונים/הציטוטים תקינים וטריים?
3. האם ה-BID מתקדם עכשיו?
4. האם הפעילות באמת הופכת להתקדמות?
5. האם הדרך למעלה usable?
6. האם עדיין נשאר מהלך מעכשיו?
7. אם היה pullback/reset — האם נוצר renewal אמיתי?
8. rank / NO_OPPORTUNITY
```

זהו סדר בדיקה, לא רשימת weights.

אין כרגע:

- משקלים;
- thresholds קשיחים;
- probability;
- נוסחת score סופית.

אלה דורשים validation אמפירי.

---

# 4. חלונות הזמן — איך לקרוא אותם

חלונות המחקר המעשיים:

```text
10s / 20s / 30s / 60s
```

המשמעות:

| Window | פירוש פשוט | שימוש עיקרי |
|---:|---|---|
| 10s | מה קורה ממש עכשיו | freshness / immediate pulse |
| 20s | האם ה-pulse נמשך | immediate confirmation |
| 30s | האם יש process מקומי | continuity / conversion / path |
| 60s | איך NOW נראה מול הדקה המקומית | broader reference / consumption |

הכלל החשוב:

```text
BidRisePct(10s)
BidRisePct(20s)
BidRisePct(30s)
BidRisePct(60s)
```

אינם ארבעה signals עצמאיים.

הם ארבעה views של אותו process.

## Lookback אינו future outcome

צריך להבדיל:

```text
LOOKBACK WINDOW
= מה קרה לפני NOW

OUTCOME HORIZON
= מה קרה אחרי NOW
```

Issue #15 כבר מגדיר future-outcome horizons:

```text
5, 10, 20, 30, 40, 50, 60, 90, 120 seconds
```

המדריך הזה אינו משנה אותם.

---

# 5. GATE 1 — פעילות עסקאות חיה עכשיו

## שם

**פעילות עסקאות חיה עכשיו**

Identifier:

```text
RecentExecutedActivityNow
```

## השאלה

> האם יש במניה עסקאות אמיתיות עכשיו, או שאנחנו מסתכלים על מניה שכבר שקטה?

## נוסחאות בסיס

```text
TradesInWindow(W)
=
CumulativeTrades(t) - CumulativeTrades(t-W)
```

```text
TradeRate(W)
=
TradesInWindow(W) / W_seconds
```

```text
SecondsSinceLatestTradeIncrement
=
t - LatestObservedTradeIncrementTime
```

Candidate windows:

```text
10s / 20s / 30s / 60s
```

## מה נראה טוב

לא מספר קבוע, אלא pattern:

- יש increments חדשים של עסקאות בזמן האחרון;
- הפעילות אינה print בודד ואחריו שקט;
- היא נראית ביותר מחלון אחד;
- ה-observation האחרון עדיין טרי.

## מה נראה רע

- אין trade increment חדש זמן רב יחסית;
- הייתה פעילות קודם אבל עכשיו היא נעלמה;
- הנתונים חסרים כך שלא ניתן לדעת אם באמת היו עסקאות.

## למה זה חשוב

האסטרטגיה מראש רוצה לבחור רק מניות שחיות עכשיו.

לכן לפני שמנסים להבין direction צריך קודם להוכיח:

```text
there is an active market process now
```

## מתי הוא מטעה

הרבה עסקאות אינן הוכחה לעלייה.

```text
high activity
!=
bullish
```

יכולה להיות פעילות חזקה בזמן:

- ירידה;
- reversal;
- absorption;
- battle ללא progress.

לכן זה **GATE**, לא alpha signal.

## Role

```text
GATE
```

---

# 6. GATE 2 — תקינות וטריות הנתונים

## שם

**תקינות וטריות observation / quote**

Identifiers:

```text
DataQuality
ObservationAge
QuoteValidity
Latency
```

## השאלה

> האם מה שאנחנו רואים מספיק אמין וטרי כדי לקבל ממנו החלטה?

## מה צריך לעבור

לפי מה שזמין במערכת:

- observation תקין;
- BID נדרש קיים ותקין;
- ASK נדרש קיים ותקין כאשר metric משתמש בו;
- timestamps סבירים;
- אין corruption / partial cycle;
- latency ידועה או לפחות אינה UNKNOWN במקום שבו היא קריטית.

## כלל חשוב

```text
UNKNOWN
!=
0
!=
neutral
```

אם metric אינו ניתן לחישוב בגלל data gap:

> הוא UNKNOWN או NOT_APPLICABLE, לא ציון אפס מומצא.

## Role

```text
GATE / TRUST
```

---

# 7. GATE 3 — Size / depth רק כאשר באמת נדרש

אם position size מחייב לדעת שיש כמות מספקת ברמה מסוימת, אפשר להפעיל feasibility check.

אבל:

> אין להפוך depth או queue feature ל-alpha signal רק כי הוא זמין.

Role:

```text
EXECUTION / FEASIBILITY GATE
```

רק כאשר המידע באמת נחוץ לגודל העסקה.

---

# 8. SPREAD — לא metric לדירוג

ההחלטה של הפרויקט היא מפורשת:

```text
spread
→ IGNORE for ranking
→ IGNORE for eligibility
→ IGNORE as predictive evidence
→ raw diagnostic only
```

## למה

אנחנו מראש מחפשים מניות שבהן יש עסקאות אמיתיות עכשיו.

מניה יכולה להראות spread רחב ובכל זאת לבצע עסקאות בפועל.

לכן אסור להסיק:

```text
wide spread
→ unusable opportunity
```

או:

```text
wide spread
→ rank penalty
```

ב-Momentum Ranking V1.

## מה כן מחליף אותו

```text
RecentExecutedActivityNow
+
future BID outcome research
```

Execution telemetry אמיתי יכול בעתיד לענות על fill/slippage questions.

זה layer אחר.

---

# 9. M1 — התקדמות BID טרייה

## שם

**התקדמות BID טרייה**

Identifier:

```text
FreshBidRepricing
```

Canonical child metric:

```text
BidRisePct(W)
```

## נוסחה

```text
BidRisePct(W)
=
(BID_now / BID_W_seconds_ago - 1) * 100
```

Candidate windows:

```text
10s / 20s / 30s
```

60s:

```text
broader local reference
```

## השאלה

> האם ה-BID באמת מתקדם כלפי מעלה עכשיו?

זאת השאלה הכיוונית החשובה ביותר כרגע.

## למה BID

ה-primary future outcome של המחקר הוא:

```text
FutureBidVsCurrentBidReturn(h)
=
BID1[t+h] / BID1[t] - 1
```

לכן current BID advance קרוב יותר ישירות למטרה מאשר להסתמך רק על LAST print.

## מה נראה טוב

דפוס לדוגמה:

```text
10s: BID positive
20s: BID positive
30s: BID positive
```

ובמיוחד כאשר ה-10s האחרון עדיין משתתף בתנועה.

## מה נראה רע

דוגמה:

```text
60s: strong positive
30s: positive
20s: weak
10s: flat/negative
```

כלומר:

> החלון הארוך נראה חזק, אבל NOW כבר אינו מתקדם.

## ASK ו-MID

אפשר לחשב:

```text
AskRisePct(W)
=
(ASK_now / ASK_W_seconds_ago - 1) * 100
```

```text
MidRisePct(W)
=
(MID_now / MID_W_seconds_ago - 1) * 100
```

אבל:

```text
BID movement
ASK movement
MID movement
```

אינם שלושה votes.

הם child evidence של אותו repricing process.

Priority:

```text
BID = primary
MID = raw-market control / confirmation
ASK = support / quote-side confirmation
```

## מתי metric יכול להטעות

- 10s בלבד יכול להיות pulse/noise;
- 60s יכול להראות מהלך שכבר נגמר;
- snapshot cadence יכול לגרום לתנועה להיראות discrete;
- quote move אינו guarantee ל-future continuation.

## Role

```text
CORE PREDICTOR
```

## Overlap

ממזג:

```text
return
speed
acceleration
BID migration
ASK migration
MID migration
```

לא לתת לכל אחד vote נפרד.

---

# 10. M2 — פעילות שהופכת להתקדמות

## שם

**יעילות המרת פעילות להתקדמות BID**

Identifier:

```text
ActivityToPriceProgress
```

Candidate child metric:

```text
ActivityToBidProgressEfficiency(W)
```

## נוסחה פשוטה למחקר

כאשר:

```text
TradesInWindow(W) > 0
```

אפשר לחשב:

```text
ActivityToBidProgressEfficiency(W)
=
BidRisePct(W) / TradesInWindow(W)
```

אם אין עסקאות בחלון:

```text
NOT_APPLICABLE / gate failure
```

ולא חלוקה מלאכותית ב-1.

Candidate windows:

```text
10s / 20s / 30s
```

## השאלה

> כשיש activity — האם היא באמת מייצרת progress?

## Trade-rate acceleration

Candidate:

```text
RecentRate10
=
Trades(t-10,t] / 10
```

```text
PriorRate20
=
Trades(t-30,t-10] / 20
```

```text
TradeRateAcceleration10vsPrior20
=
RecentRate10 - PriorRate20
```

החלונות disjoint בכוונה.

## מה נראה טוב

- activity מתחזקת;
- BID מתקדם במקביל;
- progress אינו נעלם למרות effort;
- אין stall ברור.

## מה נראה רע

- הרבה עסקאות אבל BID שטוח;
- activity עולה ו-BID יורד;
- effort נשאר גבוה וה-progress מתדרדר;
- זמן מאז meaningful progress הולך וגדל.

## למה זה חשוב

Fresh BID Repricing אומר:

> המחיר מתקדם.

M2 שואל:

> האם הפעילות שמגיעה ממשיכה לייצר את ההתקדמות, או שהמנוע עובד אבל הרכב כבר לא מתקדם?

אם M2 לא מוסיף held-out value מעבר ל-M1:

```text
drop / demote
```

## מתי הוא מטעה

יחס progress-per-trade יכול להיראות גבוה כאשר יש מעט מאוד trades.

לכן:

- live-activity gate חייב לעבור;
- efficiency אינו substitute ל-activity recency;
- trade acceleration לבדה אינה directional.

## Timing child

```text
ConversionTimingState
```

שואל:

> אחרי שהפעילות התעוררה, האם progress מגיע בזמן סביר או שאנחנו כבר ב-stall?

אין threshold אוניברסלי כמו:

```text
15s = stalled
```

זה UNKNOWN עד validation.

## Role

```text
CORE CANDIDATE / SECONDARY DYNAMIC PREDICTOR
```

## Overlap

ממזג:

```text
trade-rate acceleration
activity burst
progress-per-trade
effort-to-progress
stall
conversion latency
```

---

# 11. M3 — שימושיות המסלול

## שם

**שימושיות המסלול / כמה מהעלייה נשמרת**

Identifier:

```text
PathUsability
```

Canonical child:

```text
PathGivebackRatio
```

## נוסחה פשוטה

כאשר היה advance חיובי בחלון:

```text
PathGivebackRatio(W)
=
(RecentPeakBid(W) - BID_now)
/
(RecentPeakBid(W) - BID_start(W))
```

אם:

```text
RecentPeakBid(W) <= BID_start(W)
```

אז:

```text
NOT_APPLICABLE
```

Candidate research windows:

```text
20s / 30s / 60s
```

10s יכול להישאר diagnostic אם cadence מספק path אמיתי.

## השאלה

> האם התנועה למעלה usable, או שהיא כל הזמן מחזירה חלק גדול מה-progress?

## מה נראה טוב

- עלייה עם giveback קטן יחסית;
- reversals רדודים יחסית;
- adverse excursion קטן ביחס ל-progress;
- path שמגיע ל-target לפני adverse barrier לעיתים קרובות יותר במחקר.

## מה נראה רע

- כל advance מוחזר מהר;
- reversals עמוקים;
- progress קטן מול adverse movement;
- zig-zag שבו היסטוריית העלייה נראית חיובית אבל קשה לנצל אותה.

## Reversal count

לא נשאר metric עצמאי.

למה?

```text
3 tiny reversals
!=
3 deep reversals
```

Count בלי depth אינו מספיק.

## Reversal depth

גם אינו slot עצמאי.

Depth בלי frequency/context אינו מספיק.

שניהם children של PathUsability.

## למה זה חשוב

המטרה אינה רק:

```text
future price > current price
```

אלא:

```text
usable path before adverse movement
```

## מתי הוא מטעה

```text
clean past path
!=
future continuation
```

מניה יכולה לעלות בצורה מושלמת ואז להיעצר.

לכן M3 אינו alpha bullish עצמאי.

## Role

```text
PROTECTIVE
```

---

# 12. M4 — כמה מההזדמנות עדיין נשארה

## שם

**הזדמנות שנותרה / טריות המהלך**

Identifier:

```text
RemainingOpportunity
```

Candidate child:

```text
RecentProgressShare
```

## נוסחה פשוטה למחקר

```text
PositiveBidRise(W)
=
max(BidRisePct(W), 0)
```

כאשר long-window progress חיובי ומשמעותי:

```text
RecentProgressShare(W_short, W_long)
=
PositiveBidRise(W_short)
/
PositiveBidRise(W_long)
```

Candidate comparisons:

```text
10s vs 30s
20s vs 60s
30s vs 60s
```

אם denominator אינו מתאים:

```text
UNKNOWN / NOT_APPLICABLE
```

לא ממציאים ratio.

## השאלה

> האם ה-progress עדיין מרוכז ליד NOW, או שהחלון נראה חזק בעיקר בגלל מה שכבר קרה?

## מה נראה טוב

דוגמה:

```text
60s positive
30s positive
20s positive
10s still positive
```

כלומר יש evidence שה-progress עדיין חי.

## מה נראה רע

דוגמה:

```text
60s very positive
30s positive
20s weak
10s flat/negative
```

זה pattern של:

```text
historical strength
but
current freshness weakening
```

## למה זה חשוב

היעד הוא:

```text
remaining opportunity from NOW
```

לא לתגמל מהלך שכבר התרחש.

## מה עוד שייך לכאן

```text
move consumption
detection lateness
evidence age
opportunity decay profile
usable lead after system latency
```

## מתי הוא מטעה

- short/long ratio יכול להיות לא יציב כאשר denominator קטן;
- move יכול לבצע reset אמיתי ואז broad age לבדו ייראה "ישן";
- לכן Renewal קיים כ-conditional interface.

## Role

```text
SYNTHESIS
```

הוא אינו alpha vote נוסף שמחברים ל-M1/M2/M3.

---

# 13. M5 — Reset / Renewal אמיתי

## שם

**התחדשות מקומית אחרי pullback**

Identifier:

```text
FreshResetRenewal
```

## השאלה

> אם המהלך הרחב כבר ישן, האם נוצרה התחלה מקומית חדשה?

## Condition

```text
extension
→ pullback
→ reclaim
→ reacceleration
```

רק כאשר הרצף הזה באמת מזוהה:

```text
FreshResetRenewal = APPLICABLE
```

אחרת:

```text
FreshResetRenewal = NOT_APPLICABLE
```

לא:

```text
0
negative
failed signal
```

## למה זה חשוב

יכול להיות:

```text
broad wave = old
local opportunity = young
```

בלי Renewal, מערכת freshness עלולה לפסול move שהתחדש באמת.

## Distance from recent high

אפשר לחשב:

```text
DistanceFromRecentHighPct(W)
=
(BID_now / RecentHighBid(W) - 1) * 100
```

אבל distance לבדו אינו signal.

אותו distance יכול להופיע במצבים שונים לגמרי:

- trend ממשיך;
- stalled near high;
- healthy pullback;
- failed move.

לכן הוא context child בלבד.

Candidate context windows:

```text
60s / 90s / 120s
```

## Role

```text
CONDITIONAL / RESERVE
```

---

# 14. טבלת verdict לכל metric אינטואיטיבי

| Metric | Verdict | למה |
|---|---|---|
| % rise per minute | REDUNDANT / CONTEXT | למעשה `BidRisePct(60s)`; יכול להישאר reference אך אינו signal חדש |
| % rise per 10s / 20s / 30s | CORE MULTI-WINDOW VIEW | views של `FreshBidRepricing`, לא votes נפרדים |
| trades per minute | GATE / CONTEXT | activity של 60s; מוכיח חיות/קצב, לא direction |
| trades per hour | CONTEXT / REDUNDANT | trailing-hour איטי מדי ל-core; scaled short-rate הוא רק שינוי יחידות |
| trade-rate acceleration | SUPPORT | child של Activity→Price Progress; activity אינה directional לבדה |
| BID movement | CORE | evidence מרכזי של current repricing |
| ASK movement | SUPPORT / REDUNDANT AS VOTE | confirmation בתוך אותו repricing channel |
| MID movement | SUPPORT / CONTROL | raw-market control ו-confirmation, לא vote נוסף |
| ASK - LAST distance | CONTEXT / DIAGNOSTIC | רגיש ל-stale LAST ול-timing; חופף ל-quote repricing |
| BID - LAST distance | CONTEXT / DIAGNOSTIC | כנ"ל |
| spread | IGNORE / NOISE FOR RANKING | אינו gate/penalty/predictor בשיטה הנוכחית |
| distance from recent high | CONTEXT / CONDITIONAL | meaningful רק בתוך lifecycle/reset interpretation |
| giveback | PROTECTIVE CORE CHILD | evidence ישיר ל-path usability |
| reversal count | REDUNDANT ALONE | count בלי depth/magnitude אינו מספיק |
| reversal depth | REDUNDANT ALONE | depth בלי frequency/path context אינו מספיק |
| time since latest observed trade | GATE | evidence מרכזי לכך שהמניה חיה עכשיו |

---

# 15. דוגמאות פשוטות

המספרים כאן הם illustrations בלבד.

הם **לא thresholds**.

## Example A — move טרי

נניח:

```text
BidRise10  = +0.15%
BidRise20  = +0.22%
BidRise30  = +0.28%
BidRise60  = +0.31%
```

ויש trade increments רציפים.

פירוש:

- BID מתקדם עכשיו;
- רוב העלייה אינה רק היסטוריה ישנה;
- יש continuity בכמה חלונות.

עדיין צריך לבדוק:

- activity→progress;
- giveback/adverse path;
- remaining opportunity.

---

## Example B — הדקה נראית מצוין אבל NOW נחלש

```text
BidRise60 = +0.80%
BidRise30 = +0.35%
BidRise20 = +0.08%
BidRise10 = -0.02%
```

אם מסתכלים רק על:

```text
% rise per minute = +0.80%
```

המניה נראית חזקה.

אבל לפי ה-objective שלנו:

> ייתכן שרוב ההזדמנות כבר מאחורינו.

זו בדיוק הסיבה ש-%/minute אינו CORE בפני עצמו.

---

## Example C — הרבה עסקאות, אין progress

```text
Trades10s = high relative to recent baseline
TradeRateAcceleration > 0
BidRise10 ≈ 0
BidRise20 ≈ 0
```

פירוש:

> activity קיימת, אבל כרגע אינה הופכת ל-upward repricing.

לכן:

```text
lots of trades
!=
bullish momentum
```

---

## Example D — path לא usable

נניח שה-BID עלה, אבל בכל advance חוזר כמעט כל המהלך.

ה-total return בחלון יכול להיות חיובי.

עדיין:

- MFE יכול להיות טוב;
- MAE יכול להיות גדול;
- target-before-adverse יכול להיות גרוע.

לכן PathUsability חשוב בנפרד מה-direction.

---

## Example E — broad move ישן אבל reset חדש

```text
old extension
→ pullback
→ BID reclaims local level
→ new short-window acceleration
```

ה-60s/120s יכולים לגרום למהלך להיראות ישן.

אבל אם reset/reclaim באמת קיים:

> ייתכן שה-local opportunity צעירה.

זה המקרה שבו FreshResetRenewal יכול להיות APPLICABLE.

---

# 16. מה לא לעשות

## לא לספור אותו מידע פעמיים

לא:

```text
BID score
+ ASK score
+ MID score
+ return score
+ speed score
+ acceleration score
```

כאילו אלה שישה channels.

רובם children של repricing.

## לא להפוך כל window ל-vote

לא:

```text
10s + 20s + 30s + 60s
```

כארבעה votes.

## לא להפוך activity לכיוון

לא:

```text
more trades = more bullish
```

## לא לתגמל past move במקום remaining opportunity

לא:

```text
large 60s return
→ automatically best opportunity now
```

## לא להחזיר spread דרך הדלת האחורית

לא:

```text
wide spread
→ penalty
```

ולא:

```text
wide spread
→ reject
```

## לא להמציא threshold

לא:

```text
5 trades / 10s = active
0.2% / 20s = strong
15s without progress = stalled
```

לפני empirical validation.

---

# 17. סדר עדיפות מעשי — לא weights

ה-priority הלוגי למחקר ולמימוש עתידי הוא:

## Priority 1 — Eligibility

```text
RecentExecutedActivityNow
DataQuality
ObservationAge
QuoteValidity
```

אם אין data אמין או אין market activity:

> אין טעם לדרג.

## Priority 2 — Current direction

```text
FreshBidRepricing
```

אם BID אינו מתקדם עכשיו:

> אין evidence מרכזי להזדמנות חיובית current-state.

## Priority 3 — Conversion quality

```text
ActivityToPriceProgress
```

בודק אם effort באמת מייצר progress.

## Priority 4 — Path risk

```text
PathUsability
```

בודק אם המהלך usable ולא רק positive endpoint.

## Priority 5 — Remaining opportunity

```text
RemainingOpportunity
```

בודק אם אנחנו מגיעים בזמן.

## Priority 6 — Conditional renewal

```text
FreshResetRenewal
```

רק כשיש reset lifecycle אמיתי.

זהו order of reasoning.

זה אינו:

```text
40% + 25% + 20%...
```

---

# 18. Candidate implementation-facing card

StockObserver עתידי יכול להפיק card קטן בסגנון:

```text
securityId

gates:
  recentExecutedActivity
  dataQuality
  observationAge
  quoteValidity

freshBidRepricing:
  bidRise10
  bidRise20
  bidRise30
  bidRise60Reference
  midConfirmation
  askConfirmation

activityToPriceProgress:
  trades10
  trades20
  trades30
  tradeRateAcceleration
  progressEfficiency
  conversionTimingState

pathUsability:
  giveback
  reversalDepth
  adverseEfficiency

remainingOpportunity:
  recentProgressShare
  moveConsumption
  evidenceAge
  usableLead

freshResetRenewal:
  applicable
  lifecycleState
```

אבל CentralRanker אינו אמור פשוט לחבר את כל child fields.

ה-child fields מסבירים את interface.

ה-interface הוא יחידת ההחלטה.

---

# 19. Research validation contract

כל interface שנשאר צריך להוכיח:

```text
individual value
incremental value
leave-one-out value
```

על:

```text
time/session separated
walk-forward / expanding-window
locked final test
```

ולא random snapshot split.

## Primary future outcome

```text
BID(t0) → future BID(t)
```

כולל:

```text
FutureBidVsCurrentBidReturn
BidAdvanceMFE
BidAdvanceMAE
target-before-adverse
Observed TimeToTarget
Observed TimeToAdverse
```

## Parallel control

```text
MID
```

## Diagnostic בלבד

```text
ASK(t0) → future BID
```

הוא אינו קובע איזה model מנצח.

---

# 20. כלל ההסרה

כל retained interface עדיין provisional.

אם validation מראה:

```text
core without X
≈
core with X
```

אז ברירת המחדל:

```text
DROP X
```

המטרה אינה לשמור חמשת interfaces בכל מחיר.

המטרה היא:

> המודל הקטן ביותר שנותן את התוצאה האמפירית הטובה והיציבה מספיק.

---

# 21. Verified / Inferred / Unknown

## Verified — בתוך החלטות הפרויקט

- ה-objective הוא remaining short-horizon opportunity from NOW;
- spread אינו ranking/eligibility/predictive input;
- recent executed activity הוא ה-live-security gate המרכזי;
- BID→future BID הוא primary outcome;
- MID הוא parallel raw-market control;
- ASK→future BID הוא diagnostic בלבד;
- multi-window versions אינם independent votes;
- raw activity אינה directional;
- timing אינו predictor family חדש;
- Renewal הוא conditional, לא universal.

## Inferred — reduction/design decisions

- BID/ASK/MID יכולים לחיות תחת repricing interface אחד;
- trade acceleration ו-effort/progress שייכים ל-conversion interface אחד;
- giveback/reversal/depth שייכים ל-path interface אחד;
- distance-from-high שייך ל-lifecycle/reset context;
- ASK-LAST/BID-LAST אינם מצדיקים כרגע practical slot נפרד;
- ארבעה universal interfaces + conditional Renewal הם candidate practical shape סביר.

## Unknown — דורש empirical data

- איזה window באמת מוסיף value;
- האם M2 מוסיף מעבר ל-M1;
- כמה M3 משפר target-before-adverse;
- האם M4 מוסיף selection value יציב;
- האם Renewal שווה את המורכבות;
- thresholds;
- weights;
- score composition;
- calibrated probabilities;
- exact decay/half-life;
- האם collection cadence הקיים מספיק.

---

# 22. המדריך הקצר ביותר

אם צריך לזכור רק דבר אחד:

```text
1. האם המניה חיה עכשיו?
2. האם ה-BID עולה עכשיו?
3. האם activity באמת מזיזה אותו למעלה?
4. האם העלייה usable בלי giveback/adverse גדול?
5. האם המהלך עדיין טרי ויש opportunity שנשארה?
6. אם היה reset — האם נוצר reclaim + reacceleration אמיתי?
→ rank / NO_OPPORTUNITY
```

ויש כלל שלילי חשוב:

```text
spread לא משתתף בדירוג
```

---

# 23. מסקנת Issue #19

המחקר הרחב יכול להמשיך להחזיק מאות raw/derived fields לצורך diagnostics וניסויים.

אבל ה-user-facing Momentum Ranking V1 צריך להישאר קטן:

```text
GATES
Recent activity + valid fresh data

CORE
Fresh BID Repricing
Activity → Price Progress

PROTECTIVE
Path Usability

SYNTHESIS
Remaining Opportunity

CONDITIONAL
Fresh Reset / Renewal
```

זהו ה-practical candidate model שמתקדם להמשך המחקר.

אין כאן טענה שהוא כבר validated.

השלבים הבאים צריכים להוכיח אמפירית אילו מהחלקים באמת שורדים.
