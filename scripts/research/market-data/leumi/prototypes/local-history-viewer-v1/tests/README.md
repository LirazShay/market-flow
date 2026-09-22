# Local History Viewer V1 — Testing

## Current CI split

The test system has two execution layers:

~~~text
Fast CI
→ Node built-in unit tests
→ runs automatically on ordinary relevant push/PR changes
→ no npm install
→ no Chromium download/startup

Browser CI
→ Playwright + Chromium
→ manual/reusable checkpoint workflow
→ real IndexedDB/browser APIs + mocked Leumi endpoints
~~~

Commands from the prototype root:

~~~text
npm test
npm run test:unit
npm run test:browser
npm run test:all
~~~

`npm test` intentionally means the fast unit suite.

Browser verification is no longer the default test command and no longer runs on every prototype code push.

Durable layer/checkpoint policy:

~~~text
TESTING_POLICY.md
~~~

---

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
npm run test:browser
~~~

## Stage 6.5 — GitHub Actions

Historical Stage 6.5 created the initial browser CI workflow.

Current workflow:

~~~text
.github/workflows/local-history-viewer-v1-ci.yml
~~~

After the testing refactor, it is a manual/reusable browser checkpoint workflow rather than an automatic push/PR workflow.

It uses no Leumi credentials/session and uploads Playwright diagnostics on failure.


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

At that historical Stage 6 checkpoint, path filtering avoided documentation-only runs. The current Browser CI is stricter: it runs only through `workflow_dispatch` or `workflow_call`.


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


### Stage 6.7 verified

GitHub Actions verification:

~~~text
Run: 35738834298
Commit: 8cf907ec0101a7de65ac5e7dc4a80ff7f9e166f8
Conclusion: success
~~~

Verified in Chromium with deterministic synthetic fixtures:

- MapHeat2 success path.
- dynamic universe size.
- arbitrary chunk planning.
- duplicate PaperId rejection.
- missing PaperId rejection.
- MapHeat2 HTTP failure.
- invalid MapHeat2 structure.
- GetSecuritiesData success fixture.
- null vs zero preservation.
- GetSecuritiesData HTTP failure.
- invalid GetSecuritiesData structure.

Stage 6 is now complete.


---

## Testing refactor completed

The testing-refactor mini-project completed on 2026-09-22.

Final verification:

~~~text
Fast CI:    Run 35741459430 — 60 passed, 0 failed
Browser CI: Run 35741876693 — 9 passed, 0 failed
~~~

Current default:

~~~text
ordinary change
→ Fast CI

planned browser checkpoint
→ Browser CI

provider-dependent verification
→ Live Leumi
~~~

See `TESTING_POLICY.md` for the durable checkpoint map.


---

## Stage 7 recorder checkpoint

Recorder Stage 7 was verified after implementing the loop shell and mocked browser coverage.

~~~text
Fast CI
Run: 35744733541
104 passed / 0 failed

Browser CI
Run: 35744806678
13 passed / 0 failed
~~~

The Chromium checkpoint covers dynamic universe loading, sequential chunk fetches, complete-cycle validation, missing/duplicate failures, HTTP failure propagation, recorder start/stop, no-overlap scheduling and existing IndexedDB regressions.

The Browser CI workflow was restored after verification to checkpoint-only triggers:

~~~text
workflow_dispatch
workflow_call
~~~


---

## Historical testing-refactor notes

The completed testing-refactor mini-project documentation was moved out of the executable test tree to:

~~~text
../docs/history/testing-refactor/
~~~

Current test policy remains:

~~~text
TESTING_POLICY.md
~~~


---

## Stage 8.2 lifecycle persistence verification

Because Stage 8.2 changes real IndexedDB transaction semantics, the early-browser exception was used.

~~~text
Fast CI
Run 35750392640
116 passed / 0 failed

Browser CI
Run 35750451464
17 passed / 0 failed
~~~

New browser coverage:

~~~text
tests/automation/specs/persistence-lifecycle.spec.js
~~~

The normal Browser CI workflow remains manual/reusable after the verification run.


---

## Stage 8.3 atomic-cycle verification

Stage 8.3 used the early-browser exception because correctness depends on real multi-store IndexedDB transaction semantics.

~~~text
Fast CI
Run 35751181181
116 passed / 0 failed

Browser CI
Run 35751253126
21 passed / 0 failed
~~~

New browser coverage:

~~~text
tests/automation/specs/successful-cycle-persistence.spec.js
~~~

The normal Browser CI workflow is restored to manual/reusable checkpoint triggers after verification.


---

## Stage 8.4 recorder persistence integration

Coverage added for the full recorder→IndexedDB success boundary:

~~~text
tests/unit/recorder-loop-logic.test.js
tests/automation/specs/recorder-persistence-integration.spec.js
~~~

The unit layer proves that in-memory success is not exposed before `commitCycle` resolves.

The browser layer proves success persistence, DB-commit failure handling, API-failure no-write behavior, and durable session stop state.
