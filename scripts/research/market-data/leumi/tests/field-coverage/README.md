# Field Coverage Test

המסמך הזה צמוד לקוד שהוא מתאר:

`analyze-field-coverage.js`

## מטרה

למדוד על snapshot מלא:

- present / missing.
- null / undefined / empty.
- usable coverage.
- zero count.
- types.
- distinct values.
- min/max.
- דוגמאות.
- השוואת fields מקבילים בין שני endpoints.

## Input

דורש את הנתונים שנוצרים על ידי demo הטבלה באותו browser tab:

~~~js
window.__marketFlowTestData
~~~

## Snapshot מאומת — 2026-09-22 14:51

~~~text
MapHeat2 records:          561
GetSecuritiesData records: 561
Merged rows:               561
~~~

### Join key

~~~text
PaperId ↔ Key
561 comparable
561 equal
0 different
100%
~~~

### Availability summary

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

### Level 1

~~~text
BuyLimit1 / BuyVolume1:
543 usable
18 null
96.79%

SellLimit1 / SellVolume1:
550 usable
11 null
98.04%

LastDealVolume:
551 usable
10 null
98.22%
~~~

### Book levels 2–5

כל fields של levels 2–5 שנבדקו חזרו:

~~~text
null = 561/561
coverage = 0%
~~~

### Universe type

~~~text
ItemType = "Equity" 561/561
type = 1             561/561
~~~

## Raw evidence

ה-report הגולמי של ההרצה נשמר ליד הבדיקה:

[reports/2026-09-22-1451-field-coverage.md](reports/2026-09-22-1451-field-coverage.md)

## Durable API knowledge

המסקנות היציבות מהבדיקה מתועדות בנפרד תחת:

~~~text
docs/leumi-api/fields/field-availability.md
docs/leumi-api/fields/field-reference-he.md
~~~

ההפרדה מכוונת:

~~~text
How this test works / how to run it / raw output
→ ליד הקוד

What we learned about the API
→ docs/leumi-api/
~~~
