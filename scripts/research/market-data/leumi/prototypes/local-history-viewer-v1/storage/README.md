# Storage Module

Status:

~~~text
Stage 5.1 — schema constants only
~~~

התיקייה הזו מיועדת לקוד IndexedDB של Local History Viewer V1.

## Files

- `schema.js` — database/store/index names and schema metadata.

## Current boundary

ב-Stage 5.1 עדיין **לא** פותחים IndexedDB ולא יוצרים stores בפועל.

השלב הזה רק מרכז את ה-schema constants במקום אחד כדי שה-open/upgrade code וה-tests העתידיים לא ישכפלו strings.

Source of truth:

~~~text
../DATA_MODEL.md
~~~
