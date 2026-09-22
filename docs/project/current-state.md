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
scripts/research/market-data/leumi/capture/api-recorder.js
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
scripts/research/market-data/leumi/collection/fetch-all-securities.js
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
scripts/research/market-data/leumi/demos/show-all-securities-table.js
~~~

ה-script קורא את ה-universe, מבצע 3 batches, עושה join, פותח טאב חדש, מציג טבלה ומבצע validation של completeness.

המשתמש הריץ והטבלה הוצגה בהצלחה.

## Field availability analysis

קיים:

~~~text
scripts/research/market-data/leumi/tests/field-coverage/analyze-field-coverage.js
~~~

Verified snapshot:

~~~text
MapHeat2 records: 561
GetSecuritiesData records: 561
Merged rows: 561
~~~

תיעוד:

~~~text
docs/leumi-api/fields/field-availability.md
docs/leumi-api/fields/field-reference-he.md
scripts/research/market-data/leumi/tests/field-coverage/reports/2026-09-22-1451-field-coverage.md
~~~

ממצאים עיקריים:

- PaperId == Key ב-100%.
- BID1/ASK1 הם nullable.
- order-book levels 2–5 היו null ב-561/561.
- null ו-0 הם מצבים שונים.
- fields דינמיים בין שני endpoints אינם atomic snapshot משותף.
- כל 561 records שנבדקו היו ItemType = Equity.

## Long-running polling stability — verified 40-minute run

קיים:

~~~text
scripts/research/market-data/leumi/tests/polling-stability/long-running-poll-test.js
scripts/research/market-data/leumi/tests/polling-stability/README.md
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

Verified run:

~~~text
Runtime:              40.03 minutes
Cycles completed:     481
Cycles failed:          0
HTTP requests:        1447
HTTP 200:             1447
HTTP 403/429/5xx:        0
Average request:       662 ms
Average cycle:        4986 ms
Latest snapshot:       561 securities
Missing:                 0
Duplicates:              0
~~~

Report:

~~~text
scripts/research/market-data/leumi/tests/polling-stability/reports/2026-09-22-1555-polling-stability.md
~~~

Important:

`SNAPSHOT_INTERVAL_MS=3000` הוא target. בפועל ה-full snapshot cadence שנמדד היה בערך 5 שניות כי ה-cycle הממוצע לקח 4986ms ואין overlapping cycles.

---

# Active implementation

## Local History Viewer V1

Status:

~~~text
Implementation in progress
Current focus: Stage 6.4 — Playwright browser-test harness
~~~

Location:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Fast AI continuation entry point:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

Progress:

~~~text
Stages 1–5: Complete

Stage 6:
6.1–6.3 implemented — browser execution pending
6.4 next
6.5–6.7 planned

Stage 7:
7.1 complete
7.2 complete
7.3 next
7.4–7.6 planned

Stages 8–20:
planned
~~~

Implemented foundation now includes:

~~~text
storage/
  schema.js
  connection.js
  upgrade.js
  read.js
  write.js

tests/
  storage-schema-self-test.js
  storage-fixture-roundtrip-self-test.js
  storage-cleanup-reopen-self-test.js

recorder/
  config.js
  universe-loader.js
~~~

V1 remains:

- browser-only.
- IndexedDB persistence.
- same-origin viewer/recorder.
- BroadcastChannel notification.
- no server.
- filtering postponed to V2.

Current DB stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

Important:

The storage foundation exists as prototype implementation, but full-cycle persistence, viewer UI and integrated V1 validation are not complete yet.

Source of truth for current workstream progress:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json
~~~

---

# Not started / not productionized

~~~text
production collector
production persistence/database
production historical snapshots
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
- long-run polling stability beyond the verified 40-minute window.
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
