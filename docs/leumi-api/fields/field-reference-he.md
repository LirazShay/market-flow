# מילון שדות בעברית

המסמך מפריד בין:

- משמעות שניתן להסיק בביטחון גבוה מהשם והערכים.
- משמעות שלא אומתה רשמית.
- availability שנמדדה בפועל.

בדיקת availability המלאה:

[field-availability.md](field-availability.md)

Raw report:

[reports/2026-09-22-1451-field-coverage.md](../reports/2026-09-22-1451-field-coverage.md)

---

## MapHeat2

| שדה | משמעות | Availability שנמדדה |
|---|---|---|
| Id | מספר סידורי של הרשומה בתוצאה | 100% |
| PaperId | מספר נייר; המזהה שמתחבר ל-Key | 100% |
| PaperName | שם נייר הערך | 100% |
| LastDealTime | שעת העסקה האחרונה | 86.45%; 76 empty strings |
| PaperRate | שער/מחיר אחרון | 100% |
| ChangeRate | אחוז שינוי יומי ביחס לבסיס | 100% |
| BuyRate | שער קנייה הטוב ביותר, BID1-like | 100%; 20 zero values |
| SellRate | שער מכירה הטוב ביותר, ASK1-like | 100%; 11 zero values |
| DailyAverageVolume | נתון ממוצע יומי; היחידות המדויקות לא אומתו | 29.23%; 397 null |
| DailyVolume | כמות מצטברת שנסחרה היום | 100% |
| DailyTmura | תמורה/מחזור כספי יומי | 100% |
| DailyNumDeals | מספר עסקאות היום | 100% |
| DividandRating | נתון דיבידנד; semantics רשמי לא אומת | 44.39%; 312 null |
| ReturnStartYear | תשואה מתחילת השנה | 100% |
| ReturnStartMonths | תשואה לתקופת חודשים; מספר החודשים לא אומת | 100% |
| MarketValue | שווי שוק | 100% |
| DateChange | מועד עדכון הרשומה | 100% |
| Logo | שם קובץ לוגו, אם קיים | 18.72%; 456 null |
| Quantity | שימוש לא אומת | 0%; null ב-561/561 |
| ESGRating | דירוג ESG בעברית | 28.88%; 399 null |
| ESGRatingEng | דירוג ESG באנגלית | 28.88%; 399 null |
| ESGRatingId | מזהה מספרי של דירוג ESG | 28.88%; 399 null |

---

## GetSecuritiesData — זיהוי

| שדה | משמעות | Availability שנמדדה |
|---|---|---|
| Key | מספר הנייר; מקביל ל-PaperId | 100%; 561 unique |
| type | קוד סוג פנימי | 100%; היה 1 ב-561/561 |
| ItemType | סוג הנכס | 100%; היה Equity ב-561/561 |

---

## GetSecuritiesData — מחיר וזמן

| שדה | משמעות | Availability |
|---|---|---|
| LastKnownRate | השער האחרון הידוע | 100% |
| ContinuousLastDealRate | שער העסקה האחרונה במסחר הרציף | 100% |
| BaseRate | שער הבסיס | 100% |
| BaseRateChangePercentage | אחוז שינוי מהבסיס | 100% |
| LastDealRateBaseRateChangePercentage | אחוז שינוי של העסקה האחרונה מהבסיס | 100% |
| LastKnownRateDate | תאריך ושעת עדכון השער האחרון | 100% |
| trade_time | זמן עסקה/עדכון בפורמט מלא | 100% |
| LastDealTimeOnly | שעת העסקה בלבד | 86.45%; 76 empty strings |

---

## GetSecuritiesData — נתונים יומיים

| שדה | משמעות | Availability |
|---|---|---|
| DailyTurnover | כמות מצטברת שנסחרה היום | 100% |
| DailyNISRevenue | תמורה כספית יומית מצטברת | 100% |
| DailyLowestRate | השער הנמוך של היום | 100% |
| DailyHighestRate | השער הגבוה של היום | 100% |
| LastDealVolume | הכמות בעסקה האחרונה | 98.22%; 10 null |
| DailyDealsQuantity | מספר העסקאות היום | 100% |
| DailyAvrageRate | שער ממוצע יומי | 100% |
| DailyAvrageRateMaof | ייצוג/סקאלה נוספת של השער הממוצע; פירוש רשמי לא אומת | 100% |

ה-spelling `Avrage` הוא כפי שה-API מחזיר.

---

## ספר פקודות — Level 1

| שדה | משמעות | Availability |
|---|---|---|
| SellLimit1 | ASK1 | 98.04%; 11 null |
| BuyLimit1 | BID1 | 96.79%; 18 null |
| SellVolume1 | כמות ב-ASK1 | 98.04%; 11 null |
| BuyVolume1 | כמות ב-BID1 | 96.79%; 18 null |
| ChangeBaseRateBuy1 | אחוז שינוי BID1 לעומת שער הבסיס | 96.79%; 18 null |
| ChangeBaseRateSell1 | אחוז שינוי ASK1 לעומת שער הבסיס | 98.04%; 11 null |

### Recommendation

כל שדות Level 1 הם nullable במודל.

---

## BuyReturn1 / SellReturn1

בנתונים שנצפו:

~~~text
BuyReturn1 = BuyLimit1 × BuyVolume1
SellReturn1 = SellLimit1 × SellVolume1
~~~

בדוגמה שנבדקה בעבר:

~~~text
BuyLimit1 = 7752
BuyVolume1 = 35
7752 × 35 = 271320
BuyReturn1 = 271320
~~~

Availability שנמדדה:

~~~text
BuyReturn1:
543 usable
18 null
96.79%

SellReturn1:
550 usable
11 null
98.04%
~~~

לכן זהו ערך מחושב של price × volume ברמת הספר. אין לסמן אותו כ"שקלים" בלי לאמת את יחידות השער של הנייר.

---

## עומק ספר 2–5

נמצאו ב-schema:

~~~text
SellLimit2..5
BuyLimit2..5
SellVolume2..5
BuyVolume2..5
ChangeBaseRateBuy2..5
ChangeBaseRateSell2..5
~~~

### Verified על snapshot של 561 Equity records

כל אחד מה-fields האלה:

~~~text
null = 561/561
coverage = 0%
~~~

### Recommendation

לא להשתמש בהם כרגע.

אם צריך עומק ספר, לבצע מחקר endpoint נפרד.

---

## שדות נגזרים / derivatives-related

נמצאו:

~~~text
BnS_Bursa
BnSVega
BnSDelta
BnSGamma
BnSOmega
BnSTheta
OpenPositions
GalumPrice
GalumChangePercentage
~~~

### Verified על 561 Equity records

~~~text
null = 561/561
coverage = 0%
~~~

השמות Delta/Gamma/Vega/Theta מזוהים כ-Greeks בעולם הנגזרים, אבל semantics המדויק של `BnS_*` במערכת לאומי לא אומת.

ל-universe של מניות שנבדק אין כרגע evidence שהם שימושיים.

---

## שדות מקבילים בין MapHeat2 ל-GetSecuritiesData

| MapHeat2 | GetSecuritiesData | משמעות | Equal rate |
|---|---|---|---:|
| PaperId | Key | מזהה נייר | 100% |
| PaperRate | LastKnownRate | שער אחרון | 96.97% |
| ChangeRate | BaseRateChangePercentage | שינוי יומי | 97.68% |
| BuyRate | BuyLimit1 | BID1 | 96.32% מה-comparable |
| SellRate | SellLimit1 | ASK1 | 96.00% מה-comparable |
| DailyVolume | DailyTurnover | כמות יומית | 95.72% |
| DailyTmura | DailyNISRevenue | מחזור כספי | 95.72% |
| DailyNumDeals | DailyDealsQuantity | מספר עסקאות | 95.72% |
| LastDealTime | LastDealTimeOnly | שעת עסקה אחרונה | 99.11% |

### Interpretation

- `PaperId == Key` הוא join key מוכח.
- שאר השדות אינם atomic invariant בגלל הפרש זמן בין הקריאות.
- ל-live data מומלץ להעדיף `GetSecuritiesData`.
- ל-universe/name/metadata מומלץ להשתמש ב-`MapHeat2`.

---

## Metadata ברמת התגובה

| שדה | משמעות |
|---|---|
| resultCode | קוד תוצאה; 0 נצפה בתגובה תקינה |
| rsCount | מספר קבוצות תוצאה/מבנה פנימי |
| rtIsr | דגל real-time ישראל |
| rtUsa | דגל real-time ארה"ב |
| logtm | מדד זמן פנימי |
| reqtm | זמן עיבוד בקשה; נראה כמו milliseconds אך לא אומת רשמית |
| responsetm | זמן יצירת התגובה |
| serverId | מזהה שרת backend |
| version | גרסת backend |

---

## כלל שימוש

לפני שימוש ב-field בלוגיקה עסקית:

1. להבין semantics.
2. לבדוק availability.
3. להבחין בין null / empty / zero.
4. להבין timestamp freshness.
5. להגדיר fallback או rejection behavior.
