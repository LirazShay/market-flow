# Storage Module

Status:

~~~text
Stage 5.4 — basic generic read helpers
~~~

התיקייה הזו מיועדת לקוד IndexedDB של Local History Viewer V1.

## Files

- `schema.js` — database/store/index names and schema metadata.
- `connection.js` — Promise-based open/close helpers.
- `upgrade.js` — version 1 object-store/index creation.
- `read.js` — generic readonly helpers: get/getAll/count.

## Current boundary

Stage 5.4 מוסיף רק helpers כלליים לקריאה:

~~~text
get(database, storeName, key)
getAll(database, storeName)
count(database, storeName)
~~~

כל helper:
- משתמש ב-readonly transaction.
- בודק שה-store מוכר ל-schema.
- מחזיר Promise.
- פותר את ה-Promise רק לאחר השלמת ה-transaction.
- מעביר error/abort בצורה מפורשת.

`getAll` מיועד כרגע לקריאות קטנות כמו `latest` או `universe`; history גדול ייקרא בעתיד דרך index/paging ולא באמצעות full scan.

עדיין אין generic write helpers; הם שייכים ל-Stage 5.5.

Source of truth:

~~~text
../DATA_MODEL.md
~~~
