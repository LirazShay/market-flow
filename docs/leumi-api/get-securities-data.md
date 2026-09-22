# GetSecuritiesData

## Endpoint שנצפה

~~~text
GET /lti/lti-app/api/SecuritiesFast/GetSecuritiesData
~~~

## Query שנצפה

~~~text
securityIds=604611,662577,...
responseType=1
is_gto=true
force=false
~~~

## מבנה תגובה

~~~text
data.SecuritiesData.Table.AsOfDate
data.SecuritiesData.Table.Security[]
~~~

כל אובייקט `Security` מזוהה באמצעות `Key`.

הקישור לרשומה של `MapHeat2` הוא:

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

בבדיקת 561 הניירות החיבור הזה היה מדויק ב-561/561.

---

## בדיקות גודל בקשה שבוצעו

| מספר IDs | תוצאה |
|---:|---|
| 100 | HTTP 200, התקבלו 100 |
| 187 | HTTP 200, התקבלו 187 |
| 200 | HTTP 200, התקבלו 200 |
| 250 | HTTP 200, התקבלו 250 |
| 400 | HTTP 403 |
| 561 | HTTP 403 |

לא חיפשנו את הגבול המדויק, משום שאין בו צורך כרגע.

לא הוכח אם ה-403 נובע ממספר IDs, מאורך URL, מכלל אבטחה, ממגבלת backend או משילוב שלהם.

---

## batching שנבדק בהצלחה

561 IDs חולקו לשלוש קבוצות:

~~~text
187 + 187 + 187 = 561
~~~

תוצאה:

~~~text
Request 1: HTTP 200 → 187
Request 2: HTTP 200 → 187
Request 3: HTTP 200 → 187

Requested: 561
Received: 561
Unique: 561
Duplicates: 0
Missing: 0
~~~

כרגע זהו מסלול האיסוף המוכח.

---

# Snapshot coverage מאומת — 2026-09-22

הבדיקה המלאה נמצאת ב:

[field-availability.md](field-availability.md)

וה-report הגולמי:

[reports/2026-09-22-1451-field-coverage.md](reports/2026-09-22-1451-field-coverage.md)

ב-snapshot:

~~~text
561 Security records
ItemType = "Equity" for 561/561
type = 1 for 561/561
~~~

## שדות עם 100% value coverage

~~~text
BaseRate
BaseRateChangePercentage
ContinuousLastDealRate
DailyAvrageRate
DailyAvrageRateMaof
DailyDealsQuantity
DailyHighestRate
DailyLowestRate
DailyNISRevenue
DailyTurnover
ItemType
Key
LastDealRateBaseRateChangePercentage
LastKnownRate
LastKnownRateDate
trade_time
type
~~~

## שדות חלקיים

~~~text
BuyLimit1          96.79%  (543 usable, 18 null)
BuyReturn1         96.79%  (543 usable, 18 null)
BuyVolume1         96.79%  (543 usable, 18 null)
ChangeBaseRateBuy1 96.79%  (543 usable, 18 null)

SellLimit1         98.04%  (550 usable, 11 null)
SellReturn1        98.04%  (550 usable, 11 null)
SellVolume1        98.04%  (550 usable, 11 null)
ChangeBaseRateSell1 98.04% (550 usable, 11 null)

LastDealVolume     98.22%  (551 usable, 10 null)
LastDealTimeOnly   86.45%  (485 usable, 76 empty strings)
~~~

### משמעות תכנונית

Level 1 אינו guaranteed.

כל consumer חייב לתמוך במצבים:

~~~text
BuyLimit1 = null
SellLimit1 = null
BuyVolume1 = null
SellVolume1 = null
LastDealVolume = null
LastDealTimeOnly = ""
~~~

אין להמיר `null` ל-`0` באופן אוטומטי.

---

# Book depth 2–5

בכל 561 המניות נבדקו כל השדות הבאים:

~~~text
BuyLimit2..5
BuyVolume2..5
SellLimit2..5
SellVolume2..5
ChangeBaseRateBuy2..5
ChangeBaseRateSell2..5
~~~

תוצאה:

~~~text
coverage = 0%
null = 561/561
~~~

### Conclusion

**אין כרגע evidence ש-`GetSecuritiesData` מספק order-book depth 2–5 למניות דרך הקריאה הזו.**

אין לבנות על fields אלה scanner, strategy או execution logic.

אם נצטרך levels נוספים, יש לבצע מחקר endpoint נפרד.

---

# Fields נוספים עם 0% coverage

גם השדות הבאים היו `null` בכל 561 רשומות ה-Equity:

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

הם נשארים חלק מה-schema אבל אינם מקור נתונים שימושי עבור ה-universe שנבדק.

---

# זמן ועסקה אחרונה

## Always populated

~~~text
LastKnownRateDate
trade_time
~~~

הם חזרו string ב-561/561.

## Partially populated

~~~text
LastDealTimeOnly
~~~

חזר:

~~~text
485 values
76 empty strings
~~~

ולכן empty string חייב להיות מטופל כ-"אין זמן עסקה זמין" ולא כ-timestamp תקין.

---

# 0 הוא data, לא missing

נמצאו 76 ניירות עם:

~~~text
DailyDealsQuantity = 0
DailyTurnover = 0
DailyNISRevenue = 0
DailyHighestRate = 0
DailyLowestRate = 0
DailyAvrageRate = 0
~~~

זה מראה למה אסור לבצע:

~~~js
if (!value) {
    // missing
}
~~~

בשדות מספריים.

יש לבדוק במפורש:

~~~js
value === null
value === undefined
~~~

בנפרד מ:

~~~js
value === 0
~~~

---

# שדות שנצפו

- Key
- type
- ItemType
- LastKnownRate
- ContinuousLastDealRate
- BaseRateChangePercentage
- LastDealRateBaseRateChangePercentage
- LastKnownRateDate
- DailyTurnover
- DailyNISRevenue
- DailyLowestRate
- DailyHighestRate
- LastDealVolume
- DailyDealsQuantity
- BaseRate
- SellLimit1
- BuyLimit1
- SellVolume1
- BuyVolume1
- trade_time
- LastDealTimeOnly
- DailyAvrageRate
- DailyAvrageRateMaof
- ChangeBaseRateBuy1
- ChangeBaseRateSell1
- BuyReturn1
- SellReturn1
- SellLimit2..5
- BuyLimit2..5
- SellVolume2..5
- BuyVolume2..5
- ChangeBaseRateBuy2..5
- ChangeBaseRateSell2..5
- BnS_Bursa
- BnSVega
- BnSDelta
- BnSGamma
- BnSOmega
- BnSTheta
- OpenPositions
- GalumPrice
- GalumChangePercentage

---

# Recommendation

ל-live market snapshot:

- להשתמש ב-`GetSecuritiesData` כמקור הדינמי הראשי.
- לבצע batching שמרני.
- לעשות join לפי `Key`.
- לבצע validation של count/duplicates/missing.
- לשמור fields nullable לפי coverage בפועל.
- לא להשתמש ב-levels 2–5 עד שיש evidence חדש.
- לשמור timestamp מקומי `collectedAt` בנוסף לזמני השרת.
