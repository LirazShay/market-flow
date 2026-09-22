# Field Availability / NULL Coverage

## מטרה

לפני שבונים scanner, persistence או execution logic על field כלשהו, צריך לדעת אם הוא באמת זמין, באיזה representation הוא חוזר, ומה המשמעות של `null`, מחרוזת ריקה או `0`.

לא מספיק לראות field בדוגמת JSON אחת.

---

## כלי הבדיקה

~~~text
scripts/research/market-data/leumi/tests/field-coverage/analyze-field-coverage.js
~~~

הסקריפט משתמש ב-snapshot שנוצר על ידי:

~~~text
scripts/research/market-data/leumi/demos/show-all-securities-table.js
~~~

סדר ההרצה:

~~~text
1. run show-all-securities-table.js
2. verify that all securities were loaded
3. in the same Leumi tab run analyze-field-coverage.js
~~~

ה-report הגולמי שנשמר מההרצה המאומתת:

[reports/2026-09-22-1451-field-coverage.md](reports/2026-09-22-1451-field-coverage.md)

---

# Snapshot מאומת — 2026-09-22

Generated:

~~~text
2026-09-22T11:51:52.342Z
~~~

נתוני ה-API עצמם הציגו זמנים סביב 14:51 בשעון המקומי.

~~~text
MapHeat2 records:          561
GetSecuritiesData records: 561
Merged rows:               561
~~~

כל 561 הרשומות ב-`GetSecuritiesData` חזרו:

~~~text
ItemType = "Equity"
type = 1
~~~

לכן ב-snapshot הזה קבוצת 561 הניירות שנבדקה הייתה כולה `Equity`.

בכל ה-fields שהתגלו בשתי התגובות:

~~~text
missingCount = 0
undefinedCount = 0
~~~

כלומר ה-schema היה עקבי ברמת קיום המפתחות. ההבדל בין fields היה בזמינות הערך עצמו: number/string מול `null`/empty string.

---

# Summary

## MapHeat2

~~~text
22 fields total

ALWAYS_VALUE:      14
PARTIAL_VALUE:      7
NO_USABLE_VALUE:    1
~~~

## GetSecuritiesData

~~~text
60 fields total

ALWAYS_VALUE:      17
PARTIAL_VALUE:     10
NO_USABLE_VALUE:   33
~~~

מסקנה חשובה: `GetSecuritiesData` מחזיר schema גדול, אבל יותר ממחצית ה-fields שבו לא נשאו שום ערך שימושי עבור מניות ה-Equity בסנאפשוט הזה.

---

# MapHeat2 — כל ה-fields

| Field | Status | Coverage | Usable | Null | Empty | Zero | Recommendation |
|---|---|---:|---:|---:|---:|---:|---|
| `BuyRate` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 20 | שימושי, אך `0` חייב להישמר כמצב נפרד ולא להיחשב מחיר BID אמיתי |
| `ChangeRate` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 103 | usable |
| `DailyAverageVolume` | PARTIAL_VALUE | 29.23% | 164/561 | 397 | 0 | 1 | nullable; לא לבנות עליו כלל חובה |
| `DailyNumDeals` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 76 | usable; `0` הוא ערך אפשרי |
| `DailyTmura` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 76 | usable; `0` הוא ערך אפשרי |
| `DailyVolume` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 76 | usable; `0` הוא ערך אפשרי |
| `DateChange` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | usable timestamp-like field |
| `DividandRating` | PARTIAL_VALUE | 44.39% | 249/561 | 312 | 0 | 0 | nullable |
| `ESGRating` | PARTIAL_VALUE | 28.88% | 162/561 | 399 | 0 | 0 | nullable metadata |
| `ESGRatingEng` | PARTIAL_VALUE | 28.88% | 162/561 | 399 | 0 | 0 | nullable metadata |
| `ESGRatingId` | PARTIAL_VALUE | 28.88% | 162/561 | 399 | 0 | 0 | nullable metadata |
| `Id` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | response row/order id; לא להשתמש כמזהה נייר |
| `LastDealTime` | PARTIAL_VALUE | 86.45% | 485/561 | 0 | 76 | 0 | empty string אפשרי; nullable semantics במודל שלנו |
| `Logo` | PARTIAL_VALUE | 18.72% | 105/561 | 456 | 0 | 0 | display-only nullable metadata |
| `MarketValue` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | usable |
| `PaperId` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | מזהה join ראשי מול `Key` |
| `PaperName` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | source מומלץ לשם נייר |
| `PaperRate` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 0 | snapshot כללי; ל-live polling עדיף GetSecuritiesData |
| `Quantity` | NO_USABLE_VALUE | 0% | 0/561 | 561 | 0 | 0 | לא לבנות עליו כרגע |
| `ReturnStartMonths` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 27 | הערך זמין; semantics המדויק של התקופה עדיין לא אומת |
| `ReturnStartYear` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 8 | usable |
| `SellRate` | ALWAYS_VALUE | 100% | 561/561 | 0 | 0 | 11 | שימושי, אך `0` חייב להישמר כמצב נפרד |

---

# GetSecuritiesData — fields עם 100% coverage

| Field | Coverage | Zero count | Recommendation |
|---|---:|---:|---|
| `BaseRate` | 100% | 0 | usable |
| `BaseRateChangePercentage` | 100% | 103 | usable |
| `ContinuousLastDealRate` | 100% | 0 | usable live-price field |
| `DailyAvrageRate` | 100% | 76 | usable; spelling הוא כפי שה-API מחזיר |
| `DailyAvrageRateMaof` | 100% | 76 | value קיים; semantics/scale רשמי עדיין לא אומת |
| `DailyDealsQuantity` | 100% | 76 | usable |
| `DailyHighestRate` | 100% | 76 | usable; 0 אפשרי |
| `DailyLowestRate` | 100% | 76 | usable; 0 אפשרי |
| `DailyNISRevenue` | 100% | 76 | usable |
| `DailyTurnover` | 100% | 76 | usable |
| `ItemType` | 100% | 0 | snapshot זה: תמיד `Equity` |
| `Key` | 100% | 0 | join key מול `PaperId` |
| `LastDealRateBaseRateChangePercentage` | 100% | 105 | usable, אך לא להניח שזה תמיד זהה ל-`BaseRateChangePercentage` |
| `LastKnownRate` | 100% | 0 | source מומלץ לשער אחרון ב-live snapshot |
| `LastKnownRateDate` | 100% | 0 | usable timestamp |
| `trade_time` | 100% | 0 | usable timestamp-like field |
| `type` | 100% | 0 | snapshot זה: תמיד `1` |

---

# GetSecuritiesData — fields חלקיים

| Field | Coverage | Usable | Null | Empty | Zero | Recommendation |
|---|---:|---:|---:|---:|---:|---|
| `BuyLimit1` | 96.79% | 543 | 18 | 0 | 2 | nullable BID1 |
| `BuyReturn1` | 96.79% | 543 | 18 | 0 | 2 | nullable; נגזר מרמת BID1 |
| `BuyVolume1` | 96.79% | 543 | 18 | 0 | 2 | nullable BID1 volume |
| `ChangeBaseRateBuy1` | 96.79% | 543 | 18 | 0 | 20 | nullable |
| `ChangeBaseRateSell1` | 98.04% | 550 | 11 | 0 | 40 | nullable |
| `LastDealTimeOnly` | 86.45% | 485 | 0 | 76 | 0 | empty string הוא מצב אמיתי בתגובה |
| `LastDealVolume` | 98.22% | 551 | 10 | 0 | 69 | nullable; 0 גם אפשרי |
| `SellLimit1` | 98.04% | 550 | 11 | 0 | 0 | nullable ASK1 |
| `SellReturn1` | 98.04% | 550 | 11 | 0 | 0 | nullable; נגזר מרמת ASK1 |
| `SellVolume1` | 98.04% | 550 | 11 | 0 | 0 | nullable ASK1 volume |

## מסקנה על Level 1

BID1 ו-ASK1 **אינם required fields**.

ב-snapshot:

~~~text
BID1:
BuyLimit1 / BuyVolume1
543 usable
18 null
coverage 96.79%

ASK1:
SellLimit1 / SellVolume1
550 usable
11 null
coverage 98.04%
~~~

כל scanner או execution logic חייב לדעת להתמודד עם:

~~~text
no BID1
no ASK1
BID1 = 0
LastDealVolume = null
LastDealVolume = 0
~~~

אסור לבצע coercion של `null` ל-`0`.

---

# GetSecuritiesData — 0% coverage עבור מניות בסנאפשוט

כל השדות הבאים היו קיימים ב-schema אבל חזרו `null` ב-561 מתוך 561:

## Book levels 2–5

~~~text
BuyLimit2
BuyLimit3
BuyLimit4
BuyLimit5

BuyVolume2
BuyVolume3
BuyVolume4
BuyVolume5

SellLimit2
SellLimit3
SellLimit4
SellLimit5

SellVolume2
SellVolume3
SellVolume4
SellVolume5

ChangeBaseRateBuy2
ChangeBaseRateBuy3
ChangeBaseRateBuy4
ChangeBaseRateBuy5

ChangeBaseRateSell2
ChangeBaseRateSell3
ChangeBaseRateSell4
ChangeBaseRateSell5
~~~

### Verified

ב-snapshot של כל 561 המניות:

~~~text
coverage = 0%
null = 561/561
~~~

### Recommendation

**לא לבנות כרגע שום פיצ'ר על order-book levels 2–5 דרך endpoint זה.**

אם נצטרך עומק ספר, יש לבצע מחקר נפרד למציאת מקור נתונים אחר או תנאים אחרים שבהם fields אלה מתמלאים.

## Fields נוספים עם 0%

~~~text
BnS_Bursa
BnSDelta
BnSGamma
BnSOmega
BnSTheta
BnSVega
GalumChangePercentage
GalumPrice
OpenPositions
~~~

גם כאן:

~~~text
null = 561/561
coverage = 0%
~~~

עבור universe של `Equity` אין כרגע evidence שהם שימושיים.

---

# Cross-endpoint comparison

| Meaning | MapHeat2 | GetSecuritiesData | Comparable | Equal | Different | Equal % |
|---|---|---|---:|---:|---:|---:|
| מזהה נייר | `PaperId` | `Key` | 561 | 561 | 0 | 100% |
| שער אחרון | `PaperRate` | `LastKnownRate` | 561 | 544 | 17 | 96.97% |
| שינוי יומי | `ChangeRate` | `BaseRateChangePercentage` | 561 | 548 | 13 | 97.68% |
| BID1 | `BuyRate` | `BuyLimit1` | 543 | 523 | 20 | 96.32% |
| ASK1 | `SellRate` | `SellLimit1` | 550 | 528 | 22 | 96.00% |
| כמות יומית | `DailyVolume` | `DailyTurnover` | 561 | 537 | 24 | 95.72% |
| מחזור כספי | `DailyTmura` | `DailyNISRevenue` | 561 | 537 | 24 | 95.72% |
| מספר עסקאות | `DailyNumDeals` | `DailyDealsQuantity` | 561 | 537 | 24 | 95.72% |
| שעת עסקה | `LastDealTime` | `LastDealTimeOnly` | 561 | 556 | 5 | 99.11% |

## מה זה מלמד

### Verified

`PaperId == Key` היה נכון ב-561 מתוך 561. זהו ה-join key המוכח.

שאר השדות המקבילים **אינם snapshot אטומי אחד**: אחוז קטן מהערכים השתנה בין שתי הקריאות.

בדוגמאות שנשמרו, שדות מצטברים כמו volume / revenue / deal count היו לעיתים גדולים יותר ב-`GetSecuritiesData`, ושעת העסקה הייתה לעיתים מאוחרת יותר.

### Inferred

הדפוס תואם לכך ש-`GetSecuritiesData` התקבלה מעט מאוחר יותר ומייצגת snapshot טרי יותר עבור אותם ניירות.

### Recommendation

- לא לבצע assertion ששדות המחיר/volume בשתי הקריאות חייבים להיות זהים.
- כן לבצע assertion ש-`PaperId == Key`.
- ל-live scanner להשתמש ב-`GetSecuritiesData` כמקור הדינמי הראשי.
- להשתמש ב-`MapHeat2` ל-universe, name, metadata ו-discovery.
- אם צריך comparison בין snapshots, להשוות תוך מודעות ל-timestamp ולא כהשוואה אטומית.

---

# 0 מול NULL — ממצא חשוב

`MapHeat2` החזיר:

~~~text
BuyRate zero count: 20
SellRate zero count: 11
~~~

`GetSecuritiesData` החזיר:

~~~text
BuyLimit1 null count: 18
BuyLimit1 zero count: 2

SellLimit1 null count: 11
SellLimit1 zero count: 0
~~~

### Inferred

המספרים תואמים לכך ש-`MapHeat2` עשוי לייצג בחלק מהמקרים "אין level" באמצעות `0`, בעוד `GetSecuritiesData` משתמש לעיתים ב-`null`.

לא הוכח עדיין record-by-record שכל האפסים ממופים בדיוק ל-nulls, ולכן זה נשאר `Inferred`.

### Recommendation

ב-normalized model:

~~~text
0 is not automatically a valid executable quote
null means unavailable
~~~

יש להגדיר validation ספציפי ל-BID/ASK ולא להסתפק בבדיקה `value != null`.

---

# 76 ניירות עם zero/empty activity

נמצא אותו count של `76` במספר fields:

~~~text
MapHeat2:
DailyNumDeals = 0        → 76
DailyTmura = 0           → 76
DailyVolume = 0          → 76
LastDealTime = ""        → 76

GetSecuritiesData:
DailyDealsQuantity = 0   → 76
DailyTurnover = 0        → 76
DailyNISRevenue = 0      → 76
DailyHighestRate = 0     → 76
DailyLowestRate = 0      → 76
DailyAvrageRate = 0      → 76
LastDealTimeOnly = ""    → 76
~~~

### Inferred

הדפוס עקבי מאוד עם קבוצה של 76 ניירות שלא הייתה בהם פעילות מסחר יומית עד רגע המדידה.

לא הוכחנו עדיין את הסיבה לכל אחד מהניירות ולכן אין לתייג אותם אוטומטית כ-"לא נסחרים".

### Recommendation

ל-scanner של momentum:

- `DailyDealsQuantity == 0` הוא data תקין, לא missing data.
- ניתן בעתיד לסנן ניירות ללא פעילות, אבל זה rule עסקי נפרד.
- אין להחליף 0 ב-null ולהפך.

---

# Contract confidence

התוצאות כאן הן **Verified עבור snapshot אחד** בזמן מסחר.

הן אינן חוזה רשמי של API.

יש להריץ coverage נוסף בעתיד:

- בזמן פתיחה.
- במהלך רציף בשעה אחרת.
- סמוך לנעילה.
- אחרי המסחר.
- ביום אחר.
- כאשר universe משתנה.

כל snapshot חדש צריך להישמר תחת:

~~~text
docs/leumi-api/reports/
~~~

---

# כלל למודל העתידי

לפני ש-field הופך ל-required ב-domain model:

~~~text
1. semantics understood
2. coverage measured
3. null/zero behavior understood
4. type stable across measured snapshots
5. fallback/error behavior defined
~~~

אם אחד מהם לא מתקיים, ברירת המחדל היא nullable/optional.
