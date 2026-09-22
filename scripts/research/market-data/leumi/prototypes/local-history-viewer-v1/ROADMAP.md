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

### Stage 6 — IndexedDB self-test

Status:

~~~text
Implementation complete — browser execution pending
~~~

Stage 6 מחולק לתת-שלבים קטנים:

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

### Stage 7 — Recorder skeleton

נשתמש ב-flow המאומת ונייצר cycle object, בלי viewer.

### Stage 8 — Persist complete cycles

נחבר recorder ל-IndexedDB ונשמור latest/history/cycles.

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

---

## Resilience / validation

### Stage 16 — Reload and recovery

- reload viewer.
- close/reopen viewer.
- recorder continues.
- DB state restored.

### Stage 17 — Failure simulation

- failed API chunk.
- failed validation.
- DB write failure path.
- stale recorder detection.

### Stage 18 — Storage growth test

נמדוד בפועל:

~~~text
rows/minute
MB/minute
estimated hours before concern
~~~

בלי להוסיף retention עדיין.

### Stage 19 — Integrated V1 run

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
