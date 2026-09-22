# Current State — Market Flow

Last updated: 2026-09-22

מסמך זה מתאר את מצב הפרויקט בפועל. הוא צריך להתעדכן בכל שינוי מהותי.

---

## Phase נוכחי

~~~text
Phase 01 — Market Data / Leumi API Research
~~~

המטרה של phase זה:

- לזהות את מקורות market data.
- להבין את ה-flow של האתר.
- להוכיח שניתן לקבל את כל universe.
- להבין schema ו-nullability.
- להכין בסיס אמין לשלב collector עתידי.

---

# Completed / Verified

## API recorder

קיים:

~~~text
scripts/research/leumi/api-recorder.js
~~~

תפקיד:

- intercept של fetch/XHR בדפדפן.
- תיעוד URL/method/status/duration/response.
- ללא שמירת cookies/authorization headers.

## MapHeat2

Endpoint:

~~~text
GET /lti/lti-app/api/MarketFast/MapHeat2
~~~

Verified:

~~~text
recordCount = 561
pageCount=561 → 561 records
~~~

תפקיד שנצפה:

~~~text
universe
metadata
name
ordering
filters
paging
general market snapshot
~~~

## GetSecuritiesData

Endpoint:

~~~text
GET /lti/lti-app/api/SecuritiesFast/GetSecuritiesData
~~~

Verified request-size tests:

~~~text
100 IDs → 200
187 IDs → 200
200 IDs → 200
250 IDs → 200
400 IDs → 403
561 IDs → 403
~~~

סיבת ה-403 המדויקת: Unknown.

## Full-universe collection

Verified:

~~~text
561 IDs
→ 187 + 187 + 187
→ 3 successful calls
→ 561 received
→ 561 unique
→ 0 duplicates
→ 0 missing
~~~

Script:

~~~text
scripts/research/leumi/fetch-all-securities.js
~~~

## Join בין שתי הקריאות

Verified:

~~~text
MapHeat2.PaperId == GetSecuritiesData.Key
561/561 matched
100%
~~~

אין לבצע join לפי array index.

## Browser table proof-of-concept

קיים:

~~~text
scripts/research/leumi/show-all-securities-table.js
~~~

ה-script קורא את ה-universe, מבצע 3 batches, עושה join, פותח טאב חדש, מציג טבלה ומבצע validation של completeness.

המשתמש הריץ והטבלה הוצגה בהצלחה.

## Field availability analysis

קיים:

~~~text
scripts/research/leumi/analyze-field-coverage.js
~~~

Verified snapshot:

~~~text
MapHeat2 records: 561
GetSecuritiesData records: 561
Merged rows: 561
~~~

תיעוד:

~~~text
docs/leumi-api/field-availability.md
docs/leumi-api/field-reference-he.md
docs/leumi-api/reports/2026-09-22-1451-field-coverage.md
~~~

ממצאים עיקריים:

- PaperId == Key ב-100%.
- BID1/ASK1 הם nullable.
- order-book levels 2–5 היו null ב-561/561.
- null ו-0 הם מצבים שונים.
- fields דינמיים בין שני endpoints אינם atomic snapshot משותף.
- כל 561 records שנבדקו היו ItemType = Equity.

## Long-running polling test — code ready

קיים:

~~~text
scripts/research/leumi/long-running-poll-test.js
docs/leumi-api/polling-stability-test.md
~~~

Default concept:

~~~text
MapHeat once
then repeated:
chunk 1
→ 1 sec
chunk 2
→ 1 sec
chunk 3

target snapshot cadence ≈ 3 sec
~~~

ה-script כולל configurable timing, status counters, duration metrics, full-snapshot validation, missing/duplicate detection, stop after consecutive failures ו-manual report/stop.

---

# Pending verification

## Long-running polling stability

עדיין צריך להריץ בפועל לאורך זמן ולתעד:

~~~text
runtime
cycles
HTTP status counts
403/429/5xx
failed cycles
average request duration
average cycle duration
missing / duplicates
~~~

עד שתוצאות אלה נשמרות ב-repo:

~~~text
status = Pending
~~~

אין לטעון שהאתר הוכח כיציב ל-polling ממושך.

---

# Not started

~~~text
production collector
storage/database
historical snapshots
derived metrics
scanner/ranking
momentum rules
signals
execution
buy flow
sell flow
order lifecycle
position lifecycle
production UI
production observability
~~~

---

# Current recommendations

~~~text
MapHeat2
→ universe + metadata

GetSecuritiesData
→ dynamic detailed market state

Join
→ PaperId == Key

Batching
→ conservative chunks around 187
→ sequential until evidence supports another approach

Data
→ preserve null
→ preserve zero
→ retain raw source data
→ normalize separately
~~~

---

# Current unknowns

- exact 403 cause.
- exact request-size limit.
- long-run polling stability.
- site polling cadence in all states.
- best production polling cadence.
- order-book depth source for levels 2–5.
- semantics of several internal fields.
- API behavior at open/close/after-hours.
- final application stack.
- persistence technology.
- scanner architecture.

---

# Next work rule

המשתמש קובע את ה-micro-step הבא.

AI חדש צריך להבין את המצב הנוכחי ולהמתין למשימה הספציפית במקום לרוץ למימוש עתידי.
