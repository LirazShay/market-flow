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


---

## CI automation direction

ה-self-tests שבתיקייה נועדו לשמש בשני מצבים:

~~~text
Manual browser execution
+
Automated Chromium execution in GitHub Actions
~~~

היעד הוא שלא נבקש בדיקה ידנית עבור behavior שניתן להוכיח ב-CI.

ב-CI:

- IndexedDB אמיתי של Chromium.
- browser APIs אמיתיים כאשר אפשר.
- Leumi endpoints mocked.
- fixtures deterministic.
- no credentials/session data.

לאחר שה-CI עובר, הבדיקה הידנית באתר לאומי משמשת רק לאימות integration אמיתי מול provider.


---

## Stage 6.4 — Playwright harness

Automation files:

~~~text
../package.json
../playwright.config.js
automation/server.js
automation/harness.html
automation/specs/harness-smoke.spec.js
~~~

The harness serves the prototype over HTTP and launches real Chromium.

The smoke test verifies only the automation foundation:

- Chromium starts.
- IndexedDB exists.
- storage modules load in dependency order.
- the existing browser self-test globals load without page errors.

It does **not** execute the Stage 6.1–6.3 self-tests yet; that belongs to Stage 6.6.

Local commands from the prototype directory:

~~~text
npm install
npx playwright install chromium
npm test
~~~

## Stage 6.5 — GitHub Actions

Workflow:

~~~text
.github/workflows/local-history-viewer-v1-ci.yml
~~~

It runs the Playwright browser suite on relevant push/PR changes, uses no Leumi credentials/session, and uploads Playwright diagnostics on failure.


### Verified CI run

Stage 6.4 + 6.5 were verified in GitHub Actions:

~~~text
Workflow: Local History Viewer V1 CI
Run: 35737659820
Commit: ff65a6b0c971a0ba8683effb95dae87f87dccafe
Conclusion: success
~~~

Verified steps:

- dependency installation.
- Chromium installation.
- browser-test server startup.
- Playwright smoke test.
- real Chromium IndexedDB availability.
- storage/self-test modules loaded without browser page errors.

The workflow path filter intentionally ignores documentation/status-only changes so normal project-status updates do not spend CI time unnecessarily.


---

## Stage 6.6 — Automated storage self-tests

Playwright spec:

~~~text
automation/specs/storage-self-tests.spec.js
~~~

The spec runs the existing browser self-tests, unchanged, inside real Chromium IndexedDB:

~~~text
MarketFlowStorageSchemaSelfTest.run()
→ MarketFlowStorageFixtureSelfTest.run()
→ MarketFlowStorageCleanupSelfTest.run()
~~~

It verifies observable results for:

- schema/version/stores/indexes.
- add/put/get/getAll/count.
- exact null/zero/empty-string round-trip.
- targeted fixture cleanup.
- close/reopen persistence behavior.
- schema validity after reopen.

The automation deletes the dedicated test database before and after the suite to keep CI runs isolated.

No Leumi API calls are made in Stage 6.6.


### Stage 6.6 verified

GitHub Actions verification:

~~~text
Run: 35738329705
Commit: e12d472e68760b782b268dd0b0d401b989f916b3
Conclusion: success
~~~

During the first automated run, CI exposed a real bug in the existing Stage 6.3 cleanup test: `deletedKeys` had block scope inside the first `try` block but was referenced later when building the result.

That bug was fixed, then the full browser suite passed.

Stage 6.1–6.3 are now verified automatically in real Chromium IndexedDB, not only implemented.


---

## Stage 6.7 — Mock API fixture infrastructure

Files:

~~~text
fixtures/leumi-api-fixtures.js
automation/helpers/mock-leumi-api.js
automation/specs/mock-leumi-api.spec.js
~~~

The fixtures are synthetic and sanitized. They are not captured account/session data.

The mock layer intercepts only the two expected relative endpoint paths:

~~~text
/lti/lti-app/api/MarketFast/MapHeat2
/lti/lti-app/api/SecuritiesFast/GetSecuritiesData
~~~

Supported deterministic scenarios:

~~~text
success
duplicatePaperId
missingPaperId
mapHeatHttpFailure
invalidMapHeatStructure
securitiesHttpFailure
invalidSecuritiesStructure
~~~

The success fixture intentionally includes both `0` and `null` market values to protect their distinction.

The Stage 6.7 Playwright suite verifies:

- successful dynamic universe loading.
- arbitrary chunk planning with a small fixture universe.
- duplicate PaperId rejection.
- missing PaperId rejection.
- MapHeat2 HTTP failure.
- invalid MapHeat2 structure.
- GetSecuritiesData success fixture.
- preservation of null vs zero.
- GetSecuritiesData HTTP failure fixture.
- invalid GetSecuritiesData structure fixture.

No live Leumi API request is made by these tests.
