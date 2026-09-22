# Roadmap — Local History Viewer V1

העבודה תבוצע micro-step by micro-step.

כל שלב אמור להסתיים ב-commit ברור ובמצב שניתן לבדיקה.

---

## Planning

### Stage 1 — Requirements + architecture

Status:

~~~text
Complete
~~~

Outputs:

- README
- REQUIREMENTS
- ARCHITECTURE
- ROADMAP

אין implementation.

### Stage 2 — Data model / IndexedDB schema review

Status:

~~~text
Complete
~~~

Output:

~~~text
DATA_MODEL.md
~~~

נסגרו field preservation, stores, keys, indexes, transaction boundaries, time model ו-storage policy.

אין implementation.

### Stage 3 — Viewer UX plan

Status:

~~~text
Complete
~~~

Output:

~~~text
VIEWER_UX.md
~~~

עדיין ללא implementation.

### Stage 4 — Test plan

Stage 4 מחולק לתת-שלבים קטנים:

#### Stage 4.1 — Storage/schema test cases

Status:

~~~text
Complete
~~~

נגדיר רק בדיקות ל:
- DB creation.
- stores.
- indexes.
- reopen/persistence.

#### Stage 4.2 — Write/atomicity test cases

Status:

~~~text
Complete
~~~

נגדיר רק:
- successful writes.
- latest/history consistency.
- rollback on failure.

#### Stage 4.3 — Viewer/sorting/history test cases

Status:

~~~text
Complete
~~~

נגדיר רק:
- current table.
- sorting.
- null/zero.
- per-security history.

#### Stage 4.4 — Cross-tab/reload/recovery test cases

Status:

~~~text
Complete
~~~

נגדיר רק:
- BroadcastChannel.
- viewer reopen.
- recorder independence.
- stale/error states.

#### Stage 4.5 — Storage-growth + integrated test plan

Status:

~~~text
Complete
~~~

נגדיר רק:
- storage growth measurements.
- long-run integrated verification.

אין לבצע את כל Stage 4 בהודעה אחת.

---

## Implementation foundation

### Stage 5 — IndexedDB module

Status:

~~~text
Complete
~~~

Stage 5 מחולק לתת-שלבים קטנים:

#### Stage 5.1 — Storage module skeleton + schema constants

Status:

~~~text
Complete
~~~

Outputs:

~~~text
storage/README.md
storage/schema.js
~~~

מוגדרים רק:
- database name/version.
- store names.
- keyPath.
- autoIncrement.
- index names/keyPaths.

אין עדיין פתיחת DB.

#### Stage 5.2 — Open/close database connection

Status:

~~~text
Complete
~~~

נממש רק:
- indexedDB.open.
- Promise wrapper.
- open success/error.
- close helper.

עדיין ללא schema creation.

#### Stage 5.3 — Version 1 schema creation

Status:

~~~text
Complete
~~~

נממש רק:
- onupgradeneeded.
- create object stores.
- create indexes.

#### Stage 5.4 — Basic generic read helpers

Status:

~~~text
Complete
~~~

נממש רק helpers קטנים לקריאה:
- get.
- getAll.
- count.

#### Stage 5.5 — Basic generic write helpers

Status:

~~~text
Complete
~~~

נממש רק helpers קטנים ל:
- put.
- add.
- delete/clear כאשר נדרש.

Atomic full-cycle persistence עדיין שייך ל-Stage 8.

### Stage 6 — Test infrastructure + IndexedDB self-tests

Status:

~~~text
In progress
~~~

Stage 6 מחולק לתת-שלבים קטנים. המטרה היא גם self-tests ידניים וגם CI אוטומטי ב-Chromium:

#### Stage 6.1 — Schema/open browser self-test

Status:

~~~text
Implemented — browser execution pending
~~~

Outputs:

~~~text
tests/README.md
tests/storage-schema-self-test.js
~~~

בודק רק:
- DB open/upgrade.
- database name/version.
- stores.
- keyPath/autoIncrement.
- indexes.

לא מכניס test data ולא מוחק DB.

#### Stage 6.2 — Small fixture write/read round-trip

Status:

~~~text
Implemented — browser execution pending
~~~

נוסיף fixture קטן בלבד ונאמת:
- put/add.
- get/getAll/count.
- null/zero/empty-string round-trip.

#### Stage 6.3 — Cleanup + reopen persistence self-test

Status:

~~~text
Implemented — browser execution pending
~~~

ננקה רק את fixture של הבדיקה ונאמת:
- cleanup.
- close/reopen.
- schema remains valid.
- test data does not remain.

עדיין ללא Leumi API polling.


#### Stage 6.4 — Playwright browser-test harness

Status:

~~~text
Next
~~~

נקים test tooling בלבד:

- package/test scripts.
- Playwright configuration.
- Chromium runner.
- local test harness/page שמטעין את browser modules בסדר נכון.

Node/Playwright הם test tooling בלבד ולא production stack.

#### Stage 6.5 — GitHub Actions CI workflow

נוסיף workflow שרץ ב-push/PR:

- install dependencies.
- install Chromium.
- run browser tests.
- fail build on test failure.
- upload useful test report/artifact on failure.

ללא secrets וללא Leumi session.

#### Stage 6.6 — Automate existing storage self-tests

נחבר ל-CI את Stage 6.1–6.3:

- schema/open.
- fixture add/put/get/getAll/count.
- null/zero/empty-string round-trip.
- cleanup.
- close/reopen persistence.

IndexedDB יהיה IndexedDB אמיתי של Chromium.

#### Stage 6.7 — Mock API fixture infrastructure

נוסיף deterministic fixtures + request interception עבור:

~~~text
MapHeat2
GetSecuritiesData
~~~

ה-fixtures יהיו קטנים ולא יכילו מידע רגיש.

נכסה לפחות:

- successful universe.
- successful chunks.
- null/zero values.
- duplicate/missing cases.
- HTTP failure.
- invalid response structure.

לא מבצעים live API calls ב-CI.

### Stage 7 — Recorder skeleton

Stage 7 מחולק לתת-שלבים קטנים:

#### Stage 7.1 — Recorder module skeleton + configuration

Status:

~~~text
Complete
~~~

Outputs:

~~~text
recorder/README.md
recorder/config.js
~~~

מוגדרים רק configuration defaults + validation.

אין fetch/polling/DB writes.

#### Stage 7.2 — Universe loader

Status:

~~~text
Complete
~~~

נממש רק:
- MapHeat2 count.
- full universe load.
- PaperId validation.
- chunk planning לפי chunkSize.

#### Stage 7.3 — Single chunk fetch

Status:

~~~text
Next
~~~

נממש רק:
- GetSecuritiesData request עבור chunk אחד.
- response validation.
- chunk timing metadata.

#### Stage 7.4 — Single complete cycle builder

נחבר chunks באופן sequential ונחזיר cycle object מלא בזיכרון.

עדיין ללא polling loop וללא DB writes.

#### Stage 7.5 — Recorder loop shell

נוסיף:
- start/stop.
- target cadence.
- no-overlap cycle scheduling.
- in-memory latest cycle/error state.

Stage 7 עדיין לא כותב ל-IndexedDB; persistence מתחיל ב-Stage 8.


#### Stage 7.6 — Recorder mocked browser tests

לפני Stage 7 Complete נוסיף CI tests עבור:

- dynamic universe size.
- chunk planning.
- sequential chunk execution.
- full-cycle completeness validation.
- missing/duplicate rejection.
- HTTP/error propagation.
- no-overlap scheduling.
- start/stop behavior.

הבדיקות ישתמשו ב-mock API infrastructure של Stage 6.7.

### Stage 8 — Persist complete cycles

נחבר recorder ל-IndexedDB ונשמור latest/history/cycles.

לפני Stage 8 Complete נוסיף automated browser integration tests עבור:

- successful atomic cycle commit.
- latest/history consistency.
- second cycle replaces latest but preserves history.
- rollback on injected failure.
- failed API/validation cycle does not touch latest/history.
- raw field preservation.


### Stage 9 — Recorder diagnostics

heartbeat, state, failures, counters ו-storage estimate.

---

## Viewer

### Stage 10 — Viewer bootstrap

פתיחת same-origin tab וטעינת shell בסיסי.

### Stage 11 — Current table from IndexedDB

טעינת latest והצגת כל securities.

ללא live update עדיין.

### Stage 12 — Cross-tab live refresh

BroadcastChannel + fallback refresh strategy.

### Stage 13 — Dynamic sorting

clickable headers, ASC/DESC, stable/null-safe sort.

### Stage 14 — Security history drill-down

click row → history table from IndexedDB.

### Stage 15 — Viewer diagnostics

recorder status, last cycle, DB row counts, storage usage.

לפני סיום Viewer stages נוסיף Playwright tests עבור:

- main current table.
- default/dynamic sorting.
- null/zero rendering.
- row → detail navigation.
- per-security history.
- paging/load older.
- sort-state preservation.
- empty/error/stale states.
- BroadcastChannel refresh.
- viewer reload/close/reopen.
- multiple viewers כאשר מעשי ב-browser test.


---

## Resilience / validation

### Stage 16 — Reload and recovery

- reload viewer.
- close/reopen viewer.
- recorder continues.
- DB state restored.

### Stage 17 — Failure simulation

CI mocked failure tests:

- failed API chunk.
- invalid response structure.
- duplicate/missing securities.
- failed validation.
- DB write failure path.
- stale recorder detection.
- BroadcastChannel unavailable/degraded path.

רק אחרי שה-CI עובר נבצע live failure/recovery checks שניתן לבדוק בבטחה.

### Stage 18 — Storage growth test

נמדוד בפועל:

~~~text
rows/minute
MB/minute
estimated hours before concern
~~~

בלי להוסיף retention עדיין.

### Stage 19 — Integrated V1 validation

#### Stage 19.1 — Full mocked E2E in GitHub Actions

Chromium + mocked API:

~~~text
Recorder
→ IndexedDB
→ BroadcastChannel
→ Viewer
→ sorting
→ history
~~~

ה-CI חייב לעבור לפני בקשת בדיקה ידנית.

#### Stage 19.2 — Live Leumi browser verification

לאחר CI ירוק:

- user runs against real Leumi session.
- validate real MapHeat2/GetSecuritiesData behavior.
- validate recorder persistence/viewer behavior.
- record Verified vs Unknown results.

#### Stage 19.3 — Long-run live report

הרצה ממושכת עם recorder + viewer + sorting + history.

נשמור report ליד prototype.

### Stage 20 — V1 freeze

- README מלא.
- known limitations.
- verified behavior.
- cleanup.
- version marker.

---

# V2 backlog — intentionally excluded from V1

- filtering.
- multi-column filters.
- saved filter presets.
- derived momentum metrics.
- charts.
- column chooser/reorder.
- retention policy.
- export/import.
- worker/background processing.
- advanced history queries.

V2 מתחיל רק לאחר ש-V1 יציב ומאומת.
