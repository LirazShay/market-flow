# Storage Module

Status:

~~~text
Stage 5.3 — version 1 schema creation
~~~

התיקייה הזו מיועדת לקוד IndexedDB של Local History Viewer V1.

## Files

- `schema.js` — database/store/index names and schema metadata.
- `connection.js` — Promise-based open/close helpers.
- `upgrade.js` — version 1 object-store/index creation.

## Current boundary

Stage 5.3 מוסיף את upgrade handler עבור יצירה ראשונה של DB version 1.

ה-handler יוצר בדיוק את ששת ה-stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

ואת ה-indexes שמוגדרים ב-`schema.js`.

ה-upgrade path הנתמך כרגע הוא רק:

~~~text
0 -> 1
~~~

כל upgrade path אחר נכשל במפורש במקום לנחש migration.

שימוש עתידי בפתיחה:

~~~text
MarketFlowStorageConnection.openDatabase({
    onUpgradeNeeded: MarketFlowStorageUpgrade.upgradeDatabase
})
~~~

עדיין אין generic read/write helpers; הם מתחילים ב-Stage 5.4.

Source of truth:

~~~text
../DATA_MODEL.md
~~~
