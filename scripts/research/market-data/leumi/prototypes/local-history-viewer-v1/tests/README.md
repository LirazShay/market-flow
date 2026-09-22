# Local History Viewer V1 — Browser Self-Tests

הבדיקות בתיקייה הזו מיועדות להרצה בדפדפן, באותו origin שבו ה-prototype משתמש ב-IndexedDB.

## Stage 6.1

קובץ:

~~~text
storage-schema-self-test.js
~~~

מטרה:

- לפתוח את ה-DB דרך קוד ה-production prototype.
- להפעיל את version 1 upgrade handler אם צריך.
- לוודא database name/version.
- לוודא שכל ה-stores קיימים.
- לוודא keyPath / autoIncrement.
- לוודא שכל ה-indexes קיימים עם keyPath/unique נכונים.
- לסגור את connection.

הבדיקה **לא**:
- מכניסה test data.
- מוחקת DB.
- קוראת ל-Leumi API.
- בודקת viewer.

Dependencies, לפי הסדר:

~~~text
../storage/schema.js
../storage/connection.js
../storage/upgrade.js
./storage-schema-self-test.js
~~~

הרצה עתידית:

~~~text
await MarketFlowStorageSchemaSelfTest.run()
~~~

התוצאה היא object עם:

~~~text
passed
databaseName
databaseVersion
checks[]
~~~


---

## Stage 6.2

קובץ:

~~~text
storage-fixture-roundtrip-self-test.js
~~~

מטרה:

- להכניס fixture קטן ל-`meta`.
- לבדוק `add`.
- לבדוק `put`.
- לבדוק `get`.
- לבדוק `getAll`.
- לבדוק `count`.
- לוודא round-trip מדויק של:
  - `null`
  - `0`
  - `""`

Dependencies, לפי הסדר:

~~~text
../storage/schema.js
../storage/connection.js
../storage/upgrade.js
../storage/read.js
../storage/write.js
./storage-fixture-roundtrip-self-test.js
~~~

הרצה עתידית:

~~~text
await MarketFlowStorageFixtureSelfTest.run()
~~~

כל fixture מקבל key ייחודי עם prefix:

~~~text
__market_flow_self_test_stage_6_2__:
~~~

Stage 6.2 בכוונה **לא מוחק** את ה-fixture בסיום.

Stage 6.3 ינקה רק records עם prefix זה ויאמת reopen/persistence.


---

## Stage 6.3

קובץ:

~~~text
storage-cleanup-reopen-self-test.js
~~~

מטרה:

- למצוא רק fixtures של Stage 6.2 לפי ה-prefix הייעודי.
- למחוק רק אותם.
- לוודא שכל fixture שנמחק אינו קיים עוד.
- לסגור את ה-DB.
- לפתוח אותו מחדש.
- לוודא שה-fixtures לא חזרו.
- להריץ שוב את Stage 6.1 schema self-test אחרי ה-reopen.

Dependencies, לפי הסדר:

~~~text
../storage/schema.js
../storage/connection.js
../storage/upgrade.js
../storage/read.js
../storage/write.js
./storage-schema-self-test.js
./storage-fixture-roundtrip-self-test.js
./storage-cleanup-reopen-self-test.js
~~~

סדר הרצה:

~~~text
await MarketFlowStorageSchemaSelfTest.run()
await MarketFlowStorageFixtureSelfTest.run()
await MarketFlowStorageCleanupSelfTest.run()
~~~

ה-cleanup מכוון **רק** ל-keys שמתחילים ב:

~~~text
__market_flow_self_test_stage_6_2__:
~~~

הבדיקה לא משתמשת ב-`clear()` ולכן אינה מוחקת records אחרים מה-`meta`.

אם לא קיים fixture של Stage 6.2, הבדיקה נכשלת במפורש ומבקשת להריץ קודם את Stage 6.2.
