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

## בדיקות גודל בקשה שבוצעו

נבדקו בפועל:

| מספר IDs | תוצאה |
|---:|---|
| 100 | HTTP 200, התקבלו 100 |
| 187 | HTTP 200, התקבלו 187 |
| 200 | HTTP 200, התקבלו 200 |
| 250 | HTTP 200, התקבלו 250 |
| 400 | HTTP 403 |
| 561 | HTTP 403 |

לא חיפשנו את הגבול המדויק, משום שאין צורך בו כרגע.

## אסטרטגיה שנבדקה בהצלחה

561 IDs חולקו לשלוש קבוצות שוות:

~~~text
187 + 187 + 187 = 561
~~~

שלוש הקריאות חזרו HTTP 200 והחזירו:

~~~text
Request 1: 187
Request 2: 187
Request 3: 187
~~~

בדיקת השלמות:

~~~text
Requested total: 561
Received total: 561
Unique securities: 561
Duplicates: 0
Missing: 0
~~~

## שדות שנצפו

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

בדוגמאות שנצפו, רמות ספר 2–5 והשדות האחרונים חזרו בדרך כלל `null`.
