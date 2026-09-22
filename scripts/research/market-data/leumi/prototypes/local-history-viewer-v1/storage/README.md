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
- `lifecycle-persistence.js` — Stage 8.2 atomic session/universe lifecycle transactions.

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


## Stage 8 progress

~~~text
Stage 8.1 complete
Fast CI: 115 passed / 0 failed
Next: 8.2 session + universe persistence
~~~

Stage 8.1 now defines deterministic record contracts before IndexedDB I/O:

- universe records;
- session start/stop records;
- complete-cycle metadata;
- history/latest rows;
- recorderState meta record.

Browser transaction semantics remain deferred to the later Stage 8 persistence substeps and final Stage 8 Chromium checkpoint.


## Stage 8.2 transaction contracts

~~~text
startSession
    sessions + meta

persistUniverse
    universe + meta

stopSession
    sessions + meta
~~~

`persistUniverse` atomically replaces the persisted universe snapshot: it clears stale universe rows and writes the complete validated snapshot plus `meta.universeState` inside one transaction.

`universeState` is intentionally minimal:

~~~text
{
  key: "universeState",
  value: {
    loadedAtMs,
    recordCount
  }
}
~~~

Full MapHeat records remain in `universe.rawMapHeat`.


## Stage 8.2 verification

~~~text
Fast CI
Run 35750392640
116 passed / 0 failed

Chromium
Run 35750451464
17 passed / 0 failed
~~~

Verified real IndexedDB behavior:

- session start commits `sessions + meta`;
- universe persistence atomically replaces the universe snapshot and updates `meta.universeState`;
- invalid universe input leaves the previous persisted snapshot unchanged;
- session stop commits `sessions + meta`;
- raw MapHeat `null`, `0`, and `""` values survive IndexedDB round-trip.

Next persistence boundary:

~~~text
Stage 8.3 — one atomic successful-cycle transaction
cycles + history + latest + meta
~~~
