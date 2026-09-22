# מילון שדות בעברית

המסמך מפריד בין משמעות שניתן להסיק בביטחון גבוה מהשם והערכים לבין שדות פנימיים שאין לנו עליהם תיעוד רשמי.

## MapHeat2

| שדה | משמעות |
|---|---|
| Id | מספר סידורי של הרשומה בתוצאה |
| PaperId | מספר נייר; המזהה שמתחבר ל-Key |
| PaperName | שם נייר הערך |
| LastDealTime | שעת העסקה האחרונה |
| PaperRate | שער/מחיר אחרון |
| ChangeRate | אחוז שינוי יומי ביחס לבסיס |
| BuyRate | שער קנייה הטוב ביותר, BID1 |
| SellRate | שער מכירה הטוב ביותר, ASK1 |
| DailyAverageVolume | נתון ממוצע יומי; היחידות המדויקות לא אומתו |
| DailyVolume | כמות מצטברת שנסחרה היום |
| DailyTmura | תמורה/מחזור כספי יומי |
| DailyNumDeals | מספר עסקאות היום |
| DividandRating | נתון דיבידנד; השם הפנימי שגוי כתיב ולא אומתה הגדרה רשמית |
| ReturnStartYear | תשואה מתחילת השנה |
| ReturnStartMonths | תשואה לתקופת חודשים; מספר החודשים לא אומת |
| MarketValue | שווי שוק |
| DateChange | מועד עדכון הרשומה |
| Logo | שם קובץ לוגו, אם קיים |
| Quantity | נצפה כ-null בדוגמאות; שימוש לא אומת |
| ESGRating | דירוג ESG בעברית |
| ESGRatingEng | דירוג ESG באנגלית |
| ESGRatingId | מזהה מספרי של דירוג ESG |

## GetSecuritiesData — זיהוי

| שדה | משמעות |
|---|---|
| Key | מספר הנייר; מקביל ל-PaperId |
| type | קוד סוג פנימי |
| ItemType | סוג הנכס, למשל Equity או Index |

## GetSecuritiesData — מחיר וזמן

| שדה | משמעות |
|---|---|
| LastKnownRate | השער האחרון הידוע |
| ContinuousLastDealRate | שער העסקה האחרונה במסחר הרציף |
| BaseRate | שער הבסיס |
| BaseRateChangePercentage | אחוז שינוי מהבסיס |
| LastDealRateBaseRateChangePercentage | אחוז שינוי של העסקה האחרונה מהבסיס |
| LastKnownRateDate | תאריך ושעת העדכון של השער האחרון |
| trade_time | זמן עסקה/עדכון בפורמט מלא |
| LastDealTimeOnly | שעת העסקה בלבד |

## GetSecuritiesData — נתונים יומיים

| שדה | משמעות |
|---|---|
| DailyTurnover | כמות מצטברת שנסחרה היום |
| DailyNISRevenue | תמורה כספית יומית מצטברת |
| DailyLowestRate | השער הנמוך של היום |
| DailyHighestRate | השער הגבוה של היום |
| LastDealVolume | הכמות בעסקה האחרונה |
| DailyDealsQuantity | מספר העסקאות היום |
| DailyAvrageRate | שער ממוצע יומי |
| DailyAvrageRateMaof | ייצוג/סקאלה נוספת של השער הממוצע; פירוש רשמי לא אומת |

## ספר פקודות — רמה ראשונה

| שדה | משמעות |
|---|---|
| SellLimit1 | ASK1 |
| BuyLimit1 | BID1 |
| SellVolume1 | כמות ב-ASK1 |
| BuyVolume1 | כמות ב-BID1 |
| ChangeBaseRateBuy1 | אחוז שינוי BID1 לעומת שער הבסיס |
| ChangeBaseRateSell1 | אחוז שינוי ASK1 לעומת שער הבסיס |

## BuyReturn1 / SellReturn1

בנתונים שנצפו:

~~~text
BuyReturn1 = BuyLimit1 × BuyVolume1
SellReturn1 = SellLimit1 × SellVolume1
~~~

לדוגמה שנצפתה:

~~~text
BuyLimit1 = 7752
BuyVolume1 = 35
7752 × 35 = 271320
BuyReturn1 = 271320
~~~

לכן זהו ערך כספי/שערי של הכמות ברמת הספר. אין לסמן אותו כ"שקלים" בלי לאמת את יחידות השער של אותו נייר.

## עומק ספר 2–5

קיימים השדות:

- SellLimit2..5
- BuyLimit2..5
- SellVolume2..5
- BuyVolume2..5
- ChangeBaseRateBuy2..5
- ChangeBaseRateSell2..5

בדוגמאות שנצפו הם היו `null`. לכן אין כרגע הוכחה שהקריאה הזו מספקת עומק 5 פעיל למניות.

## שדות נגזרים/נגזרים פיננסיים

נמצאו:

- BnS_Bursa
- BnSVega
- BnSDelta
- BnSGamma
- BnSOmega
- BnSTheta
- OpenPositions
- GalumPrice
- GalumChangePercentage

בדוגמאות המניות שנצפו הם היו `null`.

השמות Delta/Gamma/Vega/Theta מוכרים כמדדי רגישות בנגזרים, אך לא אומתה המשמעות המדויקת של שדות `BnS_*` במערכת לאומי ולכן אין להסתמך על פירוש מעבר לכך.

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
