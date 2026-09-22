# Roadmap — Local History Viewer V1

העבודה תבוצע micro-step by micro-step.

כל שלב אמור להסתיים ב-commit ברור ובמצב שניתן לבדיקה.

---

## Planning

### Stage 1 — Requirements + architecture

Status:

~~~text
Current
~~~

Outputs:

- README
- REQUIREMENTS
- ARCHITECTURE
- ROADMAP

אין implementation.

### Stage 2 — Data model / IndexedDB schema review

נחדד field selection, keys, indexes, transaction boundaries ו-size implications.

אין UI.

### Stage 3 — Viewer UX plan

נגדיר:

- current table columns.
- default sort.
- row click behavior.
- history columns.
- status header.
- null display.
- date/time display.

עדיין ללא implementation.

### Stage 4 — Test plan

נגדיר tests ידניים/אוטומטיים ל:

- schema creation.
- writes.
- reload.
- cross-tab.
- sorting.
- history.
- failure recovery.
- storage growth.

---

## Implementation foundation

### Stage 5 — IndexedDB module

רק create/open/upgrade + stores + basic read/write helpers.

### Stage 6 — IndexedDB self-test

נכניס test data, נקרא אותו חזרה וננקה.

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
