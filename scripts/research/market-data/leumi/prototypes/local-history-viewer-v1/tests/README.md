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
