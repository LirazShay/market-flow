# Storage Module

Status:

~~~text
Stage 5.2 — connection lifecycle
~~~

התיקייה הזו מיועדת לקוד IndexedDB של Local History Viewer V1.

## Files

- `schema.js` — database/store/index names and schema metadata.
- `connection.js` — Promise-based open/close helpers.

## Current boundary

Stage 5.2 מוסיף רק lifecycle של connection:

~~~text
indexedDB.open
Promise success/error
blocked warning
close helper
~~~

עדיין אין schema creation.

אם פתיחה דורשת `onupgradeneeded` ואין upgrade handler, ה-transaction מבוטל בכוונה כדי לא ליצור DB ריק בטעות.

Stage 5.3 יספק את יצירת stores/indexes.

Source of truth:

~~~text
../DATA_MODEL.md
~~~
