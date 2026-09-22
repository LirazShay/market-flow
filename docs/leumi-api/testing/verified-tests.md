# בדיקות מאומתות — 2026-09-22

מסמך זה מכיל רק תוצאות שנצפו בפועל.

---

## MapHeat2

### pageCount=50

~~~text
recordCount: 561
records received: 50
~~~

### pageCount=561

~~~text
recordCount: 561
records received: 561
~~~

מסקנה: בזמן הבדיקה ניתן היה לקבל את כל 561 רשומות `MapHeat2` בקריאה אחת.

---

## GetSecuritiesData — request size

### 100 IDs

~~~text
HTTP status: 200
Securities received: 100
~~~

### 200 IDs

~~~text
HTTP status: 200
Securities received: 200
~~~

### 250 IDs

~~~text
HTTP status: 200
Securities received: 250
~~~

### 400 IDs

~~~text
HTTP status: 403
~~~

### 561 IDs

~~~text
Request URL length: 4419
HTTP status: 403
~~~

לא הוכח האם ה-403 נובע ממספר IDs, מאורך URL, מכלל אבטחה אחר, או משילוב ביניהם.

---

## GetSecuritiesData — 3 × 187

~~~text
recordCount: 561
records received: 561
PaperIds: 561

Chunk sizes:
[187, 187, 187]

Request 1 HTTP status: 200
Request 1 received: 187

Request 2 HTTP status: 200
Request 2 received: 187

Request 3 HTTP status: 200
Request 3 received: 187

Requested total: 561
Received total: 561
Unique securities: 561
Duplicates: 0
Missing: 0

SUCCESS: received all 561 securities
~~~

זהו הנתיב המוכח כרגע לקבלת כל הנתונים.

---

# Field coverage test — 561 securities

Generated:

~~~text
2026-09-22T11:51:52.342Z
~~~

Raw report:

[reports/2026-09-22-1451-field-coverage.md](../reports/2026-09-22-1451-field-coverage.md)

### Record counts

~~~text
MapHeat2 records: 561
GetSecuritiesData records: 561
Merged rows: 561
~~~

### Schema key presence

בכל ה-fields שהתגלו:

~~~text
missingCount = 0
undefinedCount = 0
~~~

### MapHeat2 availability summary

~~~text
ALWAYS_VALUE:    14
PARTIAL_VALUE:    7
NO_USABLE_VALUE:  1
~~~

### GetSecuritiesData availability summary

~~~text
ALWAYS_VALUE:    17
PARTIAL_VALUE:   10
NO_USABLE_VALUE: 33
~~~

---

## Join key

~~~text
PaperId ↔ Key

Comparable: 561
Equal:      561
Different:    0
Equal %:    100
~~~

Verified conclusion:

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
~~~

ב-snapshot שנבדק.

---

## Cross-endpoint comparison

~~~text
PaperRate ↔ LastKnownRate
Equal: 544/561 = 96.97%

ChangeRate ↔ BaseRateChangePercentage
Equal: 548/561 = 97.68%

BuyRate ↔ BuyLimit1
Comparable: 543
Equal: 523 = 96.32% of comparable
Missing details: 18

SellRate ↔ SellLimit1
Comparable: 550
Equal: 528 = 96.00% of comparable
Missing details: 11

DailyVolume ↔ DailyTurnover
Equal: 537/561 = 95.72%

DailyTmura ↔ DailyNISRevenue
Equal: 537/561 = 95.72%

DailyNumDeals ↔ DailyDealsQuantity
Equal: 537/561 = 95.72%

LastDealTime ↔ LastDealTimeOnly
Equal: 556/561 = 99.11%
~~~

Verified conclusion:

- ה-join key זהה.
- שדות market data מקבילים אינם atomic invariant בין שתי הקריאות.

---

## Level 1 availability

~~~text
BuyLimit1:
543 usable
18 null
96.79%

BuyVolume1:
543 usable
18 null
96.79%

SellLimit1:
550 usable
11 null
98.04%

SellVolume1:
550 usable
11 null
98.04%

LastDealVolume:
551 usable
10 null
98.22%
~~~

Conclusion:

BID1 / ASK1 / last trade volume הם nullable.

---

## Book levels 2–5

כל ה-fields הבאים:

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
null = 561/561
coverage = 0%
~~~

Conclusion:

אין כרגע evidence לעומק ספר 2–5 דרך endpoint זה עבור מניות.

---

## Additional 0%-coverage fields

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

תוצאה:

~~~text
null = 561/561
coverage = 0%
~~~

---

## MapHeat2 Quantity

~~~text
Quantity:
null = 561/561
coverage = 0%
~~~

---

## Empty last-trade times

~~~text
MapHeat2.LastDealTime:
485 usable
76 empty strings

GetSecuritiesData.LastDealTimeOnly:
485 usable
76 empty strings
~~~

---

## 76 zero-activity records

נמדדו 76 ערכי zero בכל אחד מה-fields:

~~~text
DailyNumDeals
DailyTmura
DailyVolume

DailyDealsQuantity
DailyTurnover
DailyNISRevenue
DailyHighestRate
DailyLowestRate
DailyAvrageRate
DailyAvrageRateMaof
~~~

וכן 76 empty strings בזמן העסקה האחרון.

זהו ממצא כמותי בלבד. הסיבה לכל נייר לא הוכחה.

---

## Universe type

~~~text
ItemType:
"Equity" = 561/561

type:
1 = 561/561
~~~

---

## מסמכי המשך

- [field-availability.md](../fields/field-availability.md)
- [api-usage-guide.md](../overview/api-usage-guide.md)
- [get-securities-data.md](../endpoints/get-securities-data.md)
