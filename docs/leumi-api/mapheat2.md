# MapHeat2

## Endpoint שנצפה

~~~text
GET /lti/lti-app/api/MarketFast/MapHeat2
~~~

## פרמטרים שנצפו

~~~text
indexIdArray=0
sectorIdAndTatSectorArray=0;0
showOnlyDual=0
lowChngPrcDay=-999999999
highChngPrcDay=999999999
lowChngPrcStartYear=-999999999
highChngPrcStartYear=999999999
highLow52=0
lowDailyAverageVolume=-999999999
highDailyAverageVolume=999999999
lowDivYield=-999999999
highDivYield=999999999
lowMarketValue=-999999999999999
highMarketValue=999999999999999
esdRatingModeSelected=0
EsdRatingModeValueSelected=0
page=1
pageCount=...
orderFieldName=DailyNumDeals
order=DESC
rt=true
~~~

## מבנה תגובה

~~~text
data.MapHeat.recordCount
data.MapHeat.maxDateChange
data.MapHeat.records[]
~~~

## ממצא מאומת

ב-2026-09-22 התקבל:

~~~text
recordCount: 561
~~~

הבקשות הבאות נבדקו:

~~~text
pageCount=25  → 25 records
pageCount=50  → 50 records
pageCount=561 → 561 records
~~~

כלומר ניתן היה לקבל את כל רשימת 561 הניירות בקריאה אחת.

## שדות שנצפו בכל record

- Id
- PaperId
- PaperName
- LastDealTime
- PaperRate
- ChangeRate
- BuyRate
- SellRate
- DailyAverageVolume
- DailyVolume
- DailyTmura
- DailyNumDeals
- DividandRating
- ReturnStartYear
- ReturnStartMonths
- MarketValue
- DateChange
- Logo
- Quantity
- ESGRating
- ESGRatingEng
- ESGRatingId

הסבר השדות נמצא ב-[field-reference-he.md](field-reference-he.md).
