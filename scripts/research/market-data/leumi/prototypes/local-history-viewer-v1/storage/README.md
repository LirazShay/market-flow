# Storage Module

Status:

~~~text
Stage 5 complete — basic storage module foundation
Stage 8 next — persistence integration
~~~

התיקייה הזו מיועדת לקוד IndexedDB של Local History Viewer V1.

## Files

- `schema.js` — database/store/index names and schema metadata.
- `connection.js` — Promise-based open/close helpers.
- `upgrade.js` — version 1 object-store/index creation.
- `read.js` — generic readonly helpers: get/getAll/count.
- `write.js` — generic readwrite helpers: put/add/deleteRecord/clear.
- `pure/persistence-records.js` — deterministic Stage 8 record builders; no IndexedDB I/O.

## Current boundary

Stage 5 כולל כעת foundation בסיסי של IndexedDB:

~~~text
schema.js
connection.js
upgrade.js
read.js
write.js
~~~

Write helpers:

~~~text
put(database, storeName, value)
add(database, storeName, value)
deleteRecord(database, storeName, key)
clear(database, storeName)
~~~

כל write helper:
- משתמש ב-readwrite transaction.
- בודק שה-store מוכר ל-schema.
- מחזיר Promise.
- מחזיר request result רק לאחר transaction complete.
- מעביר request/transaction error או abort בצורה מפורשת.

`clear` הוא helper נמוך-רמה בלבד. אין שום auto-clear ב-V1.

Atomic multi-store writes של full cycle עדיין **לא** ממומשים כאן; הם שייכים ל-Stage 8.

Important:

~~~text
put/add/deleteRecord/clear
= single-store transaction helpers
~~~

אסור לחבר כמה calls נפרדים של helpers אלה כדי לדמות atomic commit של cycle.

Stage 8 צריך transaction ייעודי אחד עבור:

~~~text
cycles + history + latest + meta
~~~

וכן persistence מינימלי ל-`sessions` ול-`universe` לפי `docs/data-model.md`.

Source of truth:

~~~text
../docs/data-model.md
~~~
