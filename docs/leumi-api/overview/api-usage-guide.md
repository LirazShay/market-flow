# מדריך עבודה מומלץ עם Leumi Market APIs

מסמך זה מרכז את ההמלצות הטכניות הנוכחיות לעבודה עם ה-API כפי שנצפה ונבדק בפועל.

> חשוב: זהו API פנימי של אתר לאומי ולא API ציבורי מתועד. לכן כל מסקנה חייבת להישען על תצפית ובדיקה בפועל. אין להניח יציבות חוזית כמו ב-API ציבורי.

---

## 1. המודל הנכון: שתי קריאות עם שני תפקידים שונים

### MapHeat2 — Universe / Discovery / Metadata

תפקידו:

- לקבוע אילו ניירות נמצאים בקבוצה.
- לקבל את מספר הניירים הכולל.
- לקבל `PaperId`.
- לקבל `PaperName`.
- לקבל order / paging / filters.
- לקבל snapshot כללי של חלק מנתוני השוק.

### GetSecuritiesData — Live / Detailed market state

תפקידו:

- לקבל רשימת IDs שכבר ידועה.
- להחזיר snapshot מפורט ועדכני יותר של מצב השוק.
- להחזיר מחיר, BID/ASK level 1, כמויות, נתונים יומיים וזמנים.

### Join key

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

בבדיקת 561 ניירות:

~~~text
561 comparable
561 equal
0 different
100%
~~~

לכן זהו ה-join key המוכח.

אין לבצע join לפי index או order במערך.

---

## 2. MapHeat2 אינו polling source ראשי

### Verified

בהקלטת הרשת נצפה ש-`GetSecuritiesData` נקרא שוב ושוב, בעוד `MapHeat2` הופיע סביב בניית/שינוי רשימת התוצאות ומעברי עמודים.

### Recommendation

~~~text
MapHeat2
→ universe + metadata + IDs

GetSecuritiesData
→ repeated live/detailed snapshots
~~~

אין צורך מוכח לקרוא ל-`MapHeat2` בכל tick.

רענון `MapHeat2` כן הגיוני כאשר:

- האפליקציה עולה מחדש.
- filters משתנים.
- universe משתנה.
- recordCount משתנה.
- נחליט בעתיד על refresh תקופתי לאחר מדידה.

---

## 3. לא לקבע 561 בקוד

### Verified בזמן הבדיקה

~~~text
recordCount = 561
~~~

### Recommendation

~~~text
read recordCount
→ fetch full MapHeat2 dynamically
→ derive PaperIds
~~~

המספר 561 הוא snapshot, לא contract.

---

## 4. batching של GetSecuritiesData

### Verified

~~~text
100 IDs → 200 OK
187 IDs → 200 OK
200 IDs → 200 OK
250 IDs → 200 OK
400 IDs → 403
561 IDs → 403
~~~

מסלול מלא שנבדק:

~~~text
187 + 187 + 187

requested = 561
received = 561
unique = 561
duplicates = 0
missing = 0
~~~

### Recommendation

כרגע להשתמש ב-batches שמרניים סביב 187.

לא לנסות לעקוף את ה-403.

סיבת ה-403 המדויקת עדיין Unknown.

---

## 5. Sequential לפני Parallel

### Verified

3 קריאות sequential עבדו.

### Unknown

טרם נבדק אם parallel batching יציב ורצוי.

### Recommendation

עד evidence אחר:

~~~text
chunk 1 → await
chunk 2 → await
chunk 3 → await
~~~

---

## 6. לשמור raw + normalized

### Recommendation

שמור:

~~~text
RawMapHeatRecord
RawSecurityDataRecord
NormalizedSecuritySnapshot
~~~

למה:

- לכל endpoint יש fields ייחודיים.
- יש fields מקבילים אך לא תמיד זהים בזמן.
- snapshots אינם אטומיים.
- API פנימי יכול להשתנות.
- raw payload מאפשר debug והשוואת schema בעתיד.

---

## 7. Availability נמדדה בפועל על כל 561 הניירות

הדוח המלא:

[field-availability.md](../fields/field-availability.md)

Raw report:

[reports/2026-09-22-1451-field-coverage.md](../../../scripts/research/market-data/leumi/tests/field-coverage/reports/2026-09-22-1451-field-coverage.md)

### Summary

~~~text
MapHeat2:
14 ALWAYS_VALUE
7 PARTIAL_VALUE
1 NO_USABLE_VALUE

GetSecuritiesData:
17 ALWAYS_VALUE
10 PARTIAL_VALUE
33 NO_USABLE_VALUE
~~~

### Recommendation

אל תגדיר field כ-required רק כי הוא קיים ב-schema.

Required צריך להיקבע לפי measured coverage ו-semantics.

---

## 8. Source of truth מומלץ לפי סוג מידע

### Universe / identity / display metadata

העדפה:

~~~text
MapHeat2.PaperId
MapHeat2.PaperName
MapHeat2.MarketValue
MapHeat2 ESG metadata when available
~~~

### Dynamic market snapshot

העדפה:

~~~text
GetSecuritiesData.LastKnownRate
GetSecuritiesData.BaseRate
GetSecuritiesData.DailyDealsQuantity
GetSecuritiesData.DailyTurnover
GetSecuritiesData.DailyNISRevenue
GetSecuritiesData.DailyHighestRate
GetSecuritiesData.DailyLowestRate
GetSecuritiesData.BuyLimit1
GetSecuritiesData.SellLimit1
GetSecuritiesData.BuyVolume1
GetSecuritiesData.SellVolume1
GetSecuritiesData.LastDealVolume
GetSecuritiesData.trade_time
~~~

### למה

- האתר עצמו משתמש ב-`GetSecuritiesData` כרענון החוזר.
- הוא מחזיר מידע מפורט יותר.
- ההשוואה הראתה שחלק מהערכים השתנו בין MapHeat2 לבין GetSecuritiesData באותו flow, כלומר אין atomic snapshot משותף.

---

## 9. השדות המקבילים אינם invariant

תוצאות comparison:

| Meaning | MapHeat2 | GetSecuritiesData | Equal |
|---|---|---|---:|
| מזהה | PaperId | Key | 100% |
| שער אחרון | PaperRate | LastKnownRate | 96.97% |
| שינוי יומי | ChangeRate | BaseRateChangePercentage | 97.68% |
| BID1 | BuyRate | BuyLimit1 | 96.32% מה-comparable |
| ASK1 | SellRate | SellLimit1 | 96.00% מה-comparable |
| כמות יומית | DailyVolume | DailyTurnover | 95.72% |
| מחזור כספי | DailyTmura | DailyNISRevenue | 95.72% |
| מספר עסקאות | DailyNumDeals | DailyDealsQuantity | 95.72% |
| זמן עסקה | LastDealTime | LastDealTimeOnly | 99.11% |

### Verified

רק join key היה זהה ב-100%.

### Inferred

ההבדלים האחרים תואמים לכך שהקריאות בוצעו בזמנים מעט שונים והשוק המשיך להשתנות.

### Recommendation

אל תעשה:

~~~text
assert MapHeat2.PaperRate == GetSecuritiesData.LastKnownRate
~~~

כן תעשה:

~~~text
assert PaperId == Key
~~~

ותתייחס לכל endpoint כ-snapshot בעל timestamp משלו.

---

## 10. NULL אינו 0

זה כלל קריטי.

### Verified

דוגמה:

~~~text
BuyLimit1:
18 null
2 zero

SellLimit1:
11 null
0 zero
~~~

וכן:

~~~text
DailyDealsQuantity:
76 zero
0 null
~~~

### Recommendation

אסור:

~~~js
value || 0
~~~

ואסור:

~~~js
if (!value) {
    // missing
}
~~~

במקום זה:

~~~js
if (value === null || value === undefined) {
    // unavailable
}
~~~

ו-`0` נשמר כ-data תקין.

---

## 11. BID1 / ASK1 הם nullable

### Verified

~~~text
BuyLimit1 / BuyVolume1:
543/561 usable
96.79%

SellLimit1 / SellVolume1:
550/561 usable
98.04%
~~~

### Recommendation

כל normalized model צריך:

~~~text
bid1Price: nullable
bid1Volume: nullable
ask1Price: nullable
ask1Volume: nullable
~~~

Execution/scanner logic חייבת להחליט במפורש מה עושים כאשר צד אחד של הספר חסר.

---

## 12. Book levels 2–5 אינם זמינים בקריאה הזו

### Verified על 561 Equity records

כל:

~~~text
BuyLimit2..5
BuyVolume2..5
SellLimit2..5
SellVolume2..5
ChangeBaseRateBuy2..5
ChangeBaseRateSell2..5
~~~

חזרו:

~~~text
null = 561/561
coverage = 0%
~~~

### Recommendation

לא לבנות עליהם.

אם צריך עומק ספר 2–5, צריך למצוא endpoint או flow אחר ולהוכיח אותו בנפרד.

---

## 13. Fields של derivatives אינם שימושיים כרגע ל-Equity universe

### Verified

~~~text
BnS_Bursa
BnSDelta
BnSGamma
BnSOmega
BnSTheta
BnSVega
GalumPrice
GalumChangePercentage
OpenPositions
~~~

כולם:

~~~text
null = 561/561
~~~

### Recommendation

לא לכלול אותם ב-domain model הפעיל של scanner מניות, אלא אם בעתיד נפתח support לסוגי נייר אחרים ונוכיח שהם מתמלאים.

---

## 14. 76 records עם activity אפס

### Verified counts

אותו count של 76 הופיע ב:

~~~text
DailyDealsQuantity = 0
DailyTurnover = 0
DailyNISRevenue = 0
DailyHighestRate = 0
DailyLowestRate = 0
DailyAvrageRate = 0
LastDealTimeOnly = ""
~~~

### Inferred

הדפוס עקבי עם ניירות ללא פעילות מסחר יומית עד רגע המדידה.

### Recommendation

- לא להתייחס ל-0 כ-data missing.
- אפשר בעתיד לסנן אותם עסקית.
- לא להניח למה לא הייתה פעילות בלי evidence נוסף.

---

## 15. Timestamps ו-stale data

יש:

~~~text
MapHeat2.LastDealTime
MapHeat2.DateChange

GetSecuritiesData.LastKnownRateDate
GetSecuritiesData.trade_time
GetSecuritiesData.LastDealTimeOnly
Table.AsOfDate
~~~

### Recommendation

לכל snapshot שלנו להוסיף:

~~~text
collectedAt
~~~

כך נשמור שלוש שכבות זמן:

~~~text
local collection time
server snapshot/update time
last trade time
~~~

זה חשוב לחישובי momentum של שניות ודקות.

---

## 16. Validation חובה בכל collection cycle

לכל full snapshot:

~~~text
requested IDs
received records
unique Keys
duplicates
missing IDs
new fields
missing fields
type changes
nullability changes
~~~

אם אחד ה-chunks נכשל או חסרים IDs:

- לא לסמן snapshot כ-complete.
- לייצר error ברור.
- לא להסתיר partial data.

---

## 17. Schema drift

API פנימי יכול להשתנות ללא הודעה.

### Recommendation

collector עתידי צריך לזהות:

- field חדש.
- field שנעלם.
- type שהשתנה.
- field שהיה value והפך null.
- field שהיה null והתחיל להתמלא.
- response path שהשתנה.

שינוי כזה צריך log ברור ואפשרות alert/test failure.

---

## 18. Polling frequency

### Unknown

עדיין לא תועדה cadence מדויקת של האתר בכל מצב.

### Recommendation

לא לקבוע תדירות אגרסיבית שרירותית.

קודם למדוד את האתר עצמו, ואז לבחור cadence דומה או שמרנית יותר.

---

## 19. Authentication / Browser context

הקריאות עובדות מתוך session קיים של האתר ובאותו origin.

### Recommendation

- לא לשמור cookies.
- לא לשמור tokens.
- לא לשמור Authorization headers.
- לא להכניס session data ל-Git.
- research scripts נשענים כרגע על browser session פעיל.

מעבר ל-local server authentication הוא נושא נפרד.

---

## 20. Error policy

בכשל יש לתעד לפחות:

~~~text
timestamp
endpoint
chunk
requested count
HTTP status
actual count
error
~~~

Response structure שונה הוא error, לא warning שקט.

---

## 21. Flow מומלץ כרגע

~~~text
START

MapHeat2
→ get current recordCount
→ fetch current universe
→ validate unique PaperId
→ retain raw metadata

split PaperIds into conservative chunks

for each chunk sequentially:
    GetSecuritiesData
    → HTTP validation
    → schema validation
    → expected-count validation

combine security records
→ validate unique Key
→ detect missing IDs

join:
PaperId == Key

build NormalizedSecuritySnapshot
→ preserve null vs zero
→ preserve raw records
→ add collectedAt

END
~~~

---

## 22. מה עדיין Unknown

- הסיבה המדויקת ל-403 בבקשות גדולות.
- הגבול המדויק של IDs/URL.
- האם batching מקבילי מומלץ.
- polling cadence המדויק של האתר.
- semantics רשמי של `DailyAverageVolume`.
- semantics המדויק של `ReturnStartMonths`.
- semantics/scale רשמי של `DailyAvrageRateMaof`.
- האם MapHeat2 `0` ב-BID/ASK תמיד ממפה ל-null ב-GetSecuritiesData.
- האם levels 2–5 מתמלאים דרך endpoint אחר.
- availability בשעות/ימי מסחר אחרים.
- יציבות חוזית עתידית של ה-API.

כל Unknown כזה צריך evidence לפני תלות production.
