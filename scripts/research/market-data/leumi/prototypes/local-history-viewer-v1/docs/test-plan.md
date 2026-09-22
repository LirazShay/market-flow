# Test Plan — Local History Viewer V1

## Execution safety rule

This document defines planned cases. Execution rules are authoritative in `../tests/TESTING_POLICY.md`.

Adding or changing a test creates an immediate verification obligation: the changed test must run in its real layer after its final edit and before the next implementation unit.

In addition, **every numbered Stage requires a full Browser CI run before it can be marked complete**. Additional browser checkpoints are integration milestones beyond this minimum cadence; they do not replace per-Stage verification.

Status:

~~~text
Stage 4.1 + Stage 4.2 + Stage 4.3 + Stage 4.4 + Stage 4.5 complete
~~~

המסמך מתאר את תוכנית הבדיקות המלאה של Stage 4. המימוש בפועל מתקדם לפי `../STATUS.json` ו-`tests/TESTING_POLICY.md`.

---

# Stage 4.1 — Storage / Schema Test Cases

מטרה: להוכיח שה-IndexedDB נוצר בדיוק לפי data-model.md וששורד reopen בלי לשנות schema.

## T4.1.1 — Database creation

Expected:

~~~text
Database name:
market-flow-leumi-history-v1

Version:
1
~~~

Pass criteria:

- open succeeds.
- no unexpected exception.
- database version is 1.

---

## T4.1.2 — Required stores exist

Expected stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

Pass criteria:

- כל ששת ה-stores קיימים.
- אין store חסר.
- אין store מיותר שנוצר בטעות.

---

## T4.1.3 — Store key configuration

Expected:

~~~text
meta:
keyPath = "key"

sessions:
keyPath = "sessionId"
autoIncrement = true

universe:
keyPath = "securityId"

cycles:
keyPath = "cycleId"
autoIncrement = true

latest:
keyPath = "securityId"

history:
keyPath = ["cycleId", "securityId"]
~~~

Pass criteria:

- keyPath תואם בדיוק.
- autoIncrement מופעל רק ב-sessions וב-cycles.

---

## T4.1.4 — Required indexes exist

Expected indexes:

~~~text
sessions:
byStartedAt

universe:
byPaperName

cycles:
bySession
byStartedAt
byStatus

history:
bySecurityTime
byCollectedAt
byCycle
bySession
~~~

Pass criteria:

- כל index קיים.
- keyPath של כל index תואם ל-data-model.md.

---

## T4.1.5 — History compound index shape

Expected:

~~~text
bySecurityTime
keyPath = ["securityId", "collectedAtMs"]
~~~

Pass criteria:

- compound key נשמר בסדר הנכון.
- direction/order אינו חלק מה-schema אלא מה-query.

---

## T4.1.6 — Reopen persistence

Procedure:

1. open DB.
2. close DB connection.
3. open again.

Pass criteria:

- database still exists.
- version remains 1.
- stores remain unchanged.
- indexes remain unchanged.

---

## T4.1.7 — Upgrade callback should not recreate existing schema

Procedure:

1. create DB version 1.
2. close.
3. reopen version 1.

Pass criteria:

- onupgradeneeded does not run on ordinary reopen.
- no duplicate store/index creation error.

---

## T4.1.8 — Empty DB is valid

After schema creation, before any recorder data:

~~~text
meta may be empty
sessions = 0
universe = 0
cycles = 0
latest = 0
history = 0
~~~

Pass criteria:

- viewer/storage code can distinguish "empty but valid DB" from "DB failed to open".

---

# Stage 4.1 completion rule

Stage 4.1 נחשב מתוכנן כאשר implementation עתידי יכול להריץ בדיקות שמאמתות:

~~~text
database identity
store existence
keyPath configuration
autoIncrement configuration
index existence
compound index shape
reopen persistence
empty valid state
~~~

אין בשלב זה בדיקות write/rollback/atomicity; הן שייכות ל-Stage 4.2.


---

# Stage 4.2 — Write / Atomicity Test Cases

מטרה: להוכיח שכתיבה מוצלחת שומרת state עקבי, ושכשל באמצע transaction לא משאיר history/latest חלקיים.

## T4.2.1 — Successful session write

Procedure:

1. create empty DB.
2. write a recorder session.
3. commit transaction.

Pass criteria:

- sessions count increases by 1.
- generated sessionId exists.
- meta.recorderState references that sessionId.
- both records are visible only after commit.

---

## T4.2.2 — Universe upsert

Procedure:

1. insert a small universe fixture.
2. read it back.
3. upsert one existing security with changed metadata.

Pass criteria:

- no duplicate securityId is created.
- existing record is replaced/updated.
- total universe count remains unchanged after upsert.
- rawMapHeat remains present.

---

## T4.2.3 — Successful full-cycle atomic write

Use a small synthetic fixture, for example:

~~~text
3 securities
1 complete cycle
~~~

Transaction stores:

~~~text
cycles
history
latest
meta
~~~

Pass criteria after commit:

~~~text
cycles += 1
history += 3
latest count = 3
meta.lastCompletedCycleId = new cycleId
meta.completedCycles incremented
~~~

כל history row חייב להכיל את אותו cycleId.

---

## T4.2.4 — Latest and history consistency

לאחר successful cycle:

לכל securityId:

~~~text
latest[securityId].cycleId
==
new history row cycleId
~~~

וכן:

~~~text
latest[securityId].data
==
history[cycleId, securityId].data
~~~

במובן של structured data equality עבור fixture הבדיקה.

Pass criteria:

- latest מייצג בדיוק את הרשומה שנכתבה ל-history באותו cycle.
- אין security שנמצא ב-history החדש אך חסר ב-latest.

---

## T4.2.5 — Second cycle replaces latest, preserves history

Procedure:

1. commit cycle A for 3 securities.
2. commit cycle B with changed values for the same securities.

Pass criteria:

~~~text
history count = 6
latest count = 3
latest rows reference cycle B
cycle A history still exists
cycle B history exists
~~~

כלומר latest מתחלף, history מצטבר.

---

## T4.2.6 — Null and zero survive round-trip

Fixture must include separately:

~~~text
BuyLimit1 = null
BuyVolume1 = 0
LastDealTimeOnly = ""
BaseRateChangePercentage = 0
~~~

Procedure:

1. write cycle.
2. read latest and history.

Pass criteria:

- null remains null.
- 0 remains 0.
- empty string remains empty string.
- no generic falsy coercion occurred.

---

## T4.2.7 — Transaction rollback on history write failure

מטרת הבדיקה: להכריח failure בתוך T4.

אפשרות fixture:

- create duplicate primary key inside the same transaction.
- or inject an explicit abort in test code.

Pass criteria after transaction failure:

~~~text
no new complete cycle
no new history rows
no latest rows changed
meta.lastCompletedCycleId unchanged
meta.completedCycles unchanged
~~~

העיקרון הוא all-or-nothing.

---

## T4.2.8 — Transaction rollback after some latest writes

הבדיקה צריכה להכשיל transaction לאחר שחלק מפעולות ה-put כבר הוגשו.

Pass criteria:

- לאחר abort, אף latest row אינו נשאר מה-cycle הכושל.
- previous latest snapshot נשאר בשלמותו.
- history של ה-cycle הכושל אינו קיים.

זו הבדיקה הקריטית נגד מצב של current table מעורב.

---

## T4.2.9 — Failed API cycle does not touch latest/history

כאשר validation נכשל לפני T4:

~~~text
missing > 0
or
duplicates > 0
or
received != requested
~~~

Expected write path:

~~~text
cycles/meta diagnostics only
~~~

Pass criteria:

- latest unchanged.
- history unchanged.
- failed cycle may exist in cycles with status="failed".
- failedCycles may increment.
- completedCycles does not increment.

---

## T4.2.10 — No duplicate history row per security/cycle

History primary key:

~~~text
[cycleId, securityId]
~~~

Procedure:

attempt to insert two rows with the same pair.

Pass criteria:

- transaction fails or duplicate insert is rejected.
- database never contains two history rows for the same securityId in the same cycle.

---

## T4.2.11 — Commit visibility

Before transaction complete event:

- consumer code must not broadcast CYCLE_COMMITTED.

After successful complete event:

- committed data is queryable.
- only then may CYCLE_COMMITTED be emitted.

Pass criteria:

~~~text
notification after commit
never before commit
~~~

---

# Stage 4.2 completion rule

Stage 4.2 נחשב מתוכנן כאשר implementation עתידי יכול להוכיח:

~~~text
successful writes
session/meta consistency
universe upsert
history accumulation
latest replacement
latest/history consistency
null/zero preservation
transaction rollback
failed-cycle isolation
history uniqueness
notification only after commit
~~~

בדיקות UI/sorting/history presentation אינן חלק מ-Stage 4.2.


---

# Stage 4.3 — Viewer / Sorting / History Test Cases

מטרה: להוכיח שה-viewer מציג את current state נכון, ממיין בצורה דטרמיניסטית ומציג history של נייר יחיד בלי לערבב נתונים מניירות אחרים.

## T4.3.1 — Current table loads from latest only

Fixture:

~~~text
latest: 3 securities
history: many rows for the same securities
~~~

Pass criteria:

- main table renders exactly 3 rows.
- row count equals latest count.
- rendering does not depend on scanning history.

---

## T4.3.2 — Universe metadata joins by securityId

Fixture:

~~~text
latest.securityId = "604611"
universe.securityId = "604611"
paperName = "Test Security"
~~~

Pass criteria:

- row displays the matching paperName.
- join is by securityId, never by array position.
- missing universe metadata does not corrupt another row.

---

## T4.3.3 — Default sort

Fixture should contain different DailyDealsQuantity values.

Expected default:

~~~text
DailyDealsQuantity DESC
paperName ASC as tie-breaker
~~~

Pass criteria:

- highest DailyDealsQuantity appears first.
- equal values are ordered consistently by paperName ASC.

---

## T4.3.4 — Numeric sort toggle

For a numeric column:

~~~text
first click  → DESC
second click → ASC
third click  → DESC
~~~

Pass criteria:

- order matches numeric values, not string comparison.
- "100" sorts after "20" numerically in ASC.

---

## T4.3.5 — String sort toggle

For a string column:

~~~text
first click  → ASC
second click → DESC
~~~

Pass criteria:

- paperName order changes correctly.
- repeated toggles are deterministic.

---

## T4.3.6 — Null / empty / zero rendering

Fixture contains:

~~~text
BuyLimit1 = null
LastDealTimeOnly = ""
BuyVolume1 = 0
BaseRateChangePercentage = 0
~~~

Expected display:

~~~text
null         → —
empty string → —
0            → 0
~~~

Pass criteria:

- zero is never rendered as dash.
- null and empty may share the visual dash but remain distinct in data.

---

## T4.3.7 — Null-safe sorting

Fixture contains mixed values:

~~~text
10
0
null
25
~~~

Pass criteria:

- valid numeric values sort numerically.
- null does not cause exception.
- null ordering is deterministic.
- null stays after real values in both ASC and DESC according to V1 UX rule.

---

## T4.3.8 — Percentage formatting

Fixture:

~~~text
-1.25
0
2.5
~~~

Pass criteria:

- each displays with % suffix.
- sign is preserved.
- 0 remains visible as 0%.
- visual class may differ, but numeric text is always present.

---

## T4.3.9 — Row opens the correct security detail

Procedure:

1. render 3 latest rows.
2. activate one specific row.

Pass criteria:

- detail view uses that row's securityId.
- header shows matching paperName/securityId.
- no data from adjacent row is used.

---

## T4.3.10 — History query is isolated to one security

Fixture:

~~~text
security A: 5 history rows
security B: 7 history rows
~~~

Open A.

Pass criteria:

- only A rows are returned/rendered.
- no B row appears.
- query uses bySecurityTime or equivalent targeted access.

---

## T4.3.11 — History newest-first

Fixture contains collectedAtMs values in non-sorted insertion order.

Pass criteria:

- newest collectedAtMs appears first.
- oldest appears last within loaded page.
- order does not depend on insertion order.

---

## T4.3.12 — Initial history page size

Fixture:

~~~text
650 history rows for one security
~~~

Expected:

~~~text
initially rendered = 500
remaining = 150
~~~

Pass criteria:

- DOM does not receive all 650 rows at startup.
- "טען ישנים יותר" is available.

---

## T4.3.13 — Load older history

After T4.3.12:

activate:

~~~text
טען ישנים יותר
~~~

Pass criteria:

- remaining older rows are appended.
- already loaded rows are not duplicated.
- chronological newest-first order is preserved.

---

## T4.3.14 — Main table sort state survives detail round-trip

Procedure:

1. sort main table by ASK1 ASC.
2. open a security.
3. return to main table.

Pass criteria:

- selected sort column remains ASK1.
- direction remains ASC.
- table order is restored accordingly.

---

## T4.3.15 — Empty DB viewer state

Fixture:

~~~text
latest count = 0
~~~

Pass criteria:

- viewer shows explicit empty state.
- no misleading empty table is shown as if data loaded normally.
- no exception.

---

# Stage 4.3 completion rule

Stage 4.3 נחשב מתוכנן כאשר implementation עתידי יכול להוכיח:

~~~text
current table uses latest
metadata join correctness
default sort
numeric sort
string sort
null-safe sort
null/zero rendering
percentage formatting
correct row-to-detail navigation
per-security history isolation
newest-first history
history paging
sort-state preservation
empty viewer state
~~~

Cross-tab/reload/recovery behavior אינו חלק מ-Stage 4.3.


---

# Stage 4.4 — Cross-tab / Reload / Recovery Test Cases

מטרה: להוכיח שה-recorder וה-viewer נשארים מופרדים, ש-BroadcastChannel הוא notification בלבד, ושפתיחה/סגירה/רענון של viewer לא פוגעים בהקלטה או בנתונים.

## T4.4.1 — Viewer opens after recorder already started

Procedure:

1. start recorder.
2. allow at least one successful committed cycle.
3. only then open viewer.

Pass criteria:

- viewer loads current state from IndexedDB.
- viewer does not require a past BroadcastChannel message.
- latest rows are visible immediately after DB load.

---

## T4.4.2 — CYCLE_COMMITTED refreshes viewer from DB

Procedure:

1. viewer is open.
2. recorder commits a new cycle.
3. CYCLE_COMMITTED is broadcast.

Pass criteria:

- viewer receives notification.
- viewer re-queries IndexedDB.
- displayed cycle/data advances to the committed cycle.
- message payload itself is not used as the source of market rows.

---

## T4.4.3 — Missed notification does not lose state

Procedure:

1. keep viewer closed while recorder commits one or more cycles.
2. reopen viewer.

Pass criteria:

- viewer shows the latest committed state from IndexedDB.
- no dependency on receiving every BroadcastChannel event.
- history remains complete for committed cycles.

---

## T4.4.4 — Viewer reload does not stop recorder

Procedure:

1. recorder is running.
2. viewer is open.
3. reload viewer page/tab.
4. wait for another recorder cycle.

Pass criteria:

- recorder continues independently.
- new cycles continue to be committed.
- reloaded viewer reconnects and shows fresh state.

---

## T4.4.5 — Viewer close does not stop recorder

Procedure:

1. recorder is running.
2. close viewer tab.
3. wait for several cycles.
4. reopen viewer.

Pass criteria:

- recorder never stops because viewer closed.
- cycle count continues increasing.
- reopened viewer sees newer data than before close.

---

## T4.4.6 — Recorder stop preserves viewer data

Procedure:

1. recorder has committed data.
2. stop recorder normally.
3. keep viewer open.

Pass criteria:

- viewer keeps showing last committed latest/history.
- recorder status becomes STOPPED.
- data is not cleared.
- manual refresh still reads the same persisted data.

---

## T4.4.7 — Recorder heartbeat becomes stale

Fixture/Procedure:

1. recorderState says RUNNING.
2. lastHeartbeatAtMs is older than the configured stale threshold.
3. no fresh heartbeat arrives.

Pass criteria:

- viewer status becomes STALE.
- viewer does not delete or hide latest data.
- stale is visually distinct from STOPPED and ERROR.

---

## T4.4.8 — Recorder resumes after stale state

Procedure:

1. viewer currently shows STALE.
2. recorder writes a fresh heartbeat or completes a new cycle.

Pass criteria:

- viewer returns to RUNNING.
- no viewer reload is required.
- latest committed state remains consistent.

---

## T4.4.9 — Recorder error does not corrupt persisted data

Procedure:

1. commit a valid cycle.
2. simulate recorder error after that cycle.
3. expose RECORDER_ERROR / lastError.

Pass criteria:

- viewer shows ERROR state/banner.
- previous latest/history remain readable.
- no partial failed cycle appears as current.
- error state is separate from data state.

---

## T4.4.10 — Manual viewer refresh is DB-only

Procedure:

1. click or invoke "רענן תצוגה".
2. observe network/API behavior.

Pass criteria:

- viewer re-reads IndexedDB.
- no MapHeat2 request is triggered.
- no GetSecuritiesData request is triggered.
- recorder state is unchanged.

---

## T4.4.11 — Multiple viewers can observe the same recorder

Procedure:

1. recorder is running.
2. open viewer A.
3. open viewer B.
4. commit new cycle.

Pass criteria:

- both viewers can read the same IndexedDB.
- both can react to the notification independently.
- neither viewer becomes the owner of recorder lifecycle.
- closing one viewer does not affect the other or recorder.

---

## T4.4.12 — DATABASE_CLEARED handling

Procedure:

1. viewer is open.
2. clear prototype DB through the explicit clear flow.
3. broadcast DATABASE_CLEARED after successful deletion.

Pass criteria:

- viewer transitions to EMPTY state.
- stale in-memory rows are removed from display.
- no automatic recorder restart occurs.
- next state depends on whether recorder creates a fresh DB/session later.

---

## T4.4.13 — Reopen after browser tab recreation

Procedure:

1. recorder/viewer have persisted data.
2. close viewer tab completely.
3. create a fresh viewer tab in the same origin.

Pass criteria:

- viewer reconstructs state from IndexedDB.
- no in-memory state from the old viewer is required.
- latest/history/meta are sufficient for recovery.

---

## T4.4.14 — BroadcastChannel unavailable/failure fallback

If BroadcastChannel cannot be created or a message is missed:

Pass criteria:

- viewer startup still works from IndexedDB.
- manual refresh still works.
- absence of BroadcastChannel is surfaced as degraded live-update behavior, not as DB failure.
- persisted data remains usable.

---

# Stage 4.4 completion rule

Stage 4.4 נחשב מתוכנן כאשר implementation עתידי יכול להוכיח:

~~~text
viewer can start after recorder
DB is source of truth
notifications trigger DB refresh
missed notifications do not lose state
viewer reload/close does not stop recorder
recorder stop preserves data
stale detection works
recovery from stale works
recorder error preserves last valid data
manual refresh is DB-only
multiple viewers are independent
database clear transitions safely to empty
fresh viewer reconstructs from persisted state
BroadcastChannel failure does not destroy usability
~~~

Storage-growth/integrated long-run planning אינו חלק מ-Stage 4.4.


---

# Stage 4.5 — Storage Growth + Integrated Test Plan

מטרה: להגדיר איך נמדוד בפועל את קצב גדילת ה-IndexedDB ואיך נאמת שה-recorder, persistence וה-viewer עובדים יחד לאורך זמן.

## T4.5.1 — Baseline storage measurement

לפני תחילת recorder:

נמדוד:

~~~text
navigator.storage.estimate().usage
navigator.storage.estimate().quota
history count
latest count
cycles count
~~~

Pass criteria:

- baseline נשמר בדוח.
- אין הסתמכות על quota תיאורטי בלבד.

---

## T4.5.2 — Fixed-duration storage run

הרצה ראשונית מתוכננת:

~~~text
10 minutes
~~~

בסוף נמדוד שוב:

~~~text
usage
history count
latest count
cycles count
completed cycles
failed cycles
~~~

נחשב:

~~~text
bytes added
rows added
bytes / history row
MB / minute
rows / minute
~~~

---

## T4.5.3 — Growth consistency

אם הקצב נשאר קרוב ל-baseline של collector:

~~~text
~1 full cycle every ~5 seconds
~561 history rows per complete cycle
~~~

נבדוק שה-history row count תואם בקירוב:

~~~text
completedCycles × universeSize
~~~

Pass criteria:

- אין growth מסתורי מעבר לנתונים המצופים.
- latest נשאר סביב universe size ולא גדל בכל cycle.
- history בלבד גדל באופן מצטבר.

---

## T4.5.4 — Latest bounded-size invariant

לאחר ריצה ממושכת:

~~~text
latest count == current universe count
~~~

Pass criteria:

- latest אינו צובר versions.
- כל securityId מופיע פעם אחת בלבד.

---

## T4.5.5 — Integrated recorder + viewer run

במהלך recorder פעיל:

1. viewer פתוח.
2. current table מתעדכנת.
3. sorting מופעל על עמודה.
4. נכנסים ל-security detail.
5. history נטענת.
6. חוזרים לטבלה.
7. recorder ממשיך ברקע.

Pass criteria:

- אין recorder failure בגלל viewer activity.
- viewer נשאר usable.
- current state ממשיך להתקדם.
- history ממשיך להצטבר.
- sort state אינו נשבר.

---

## T4.5.6 — Integrated reload during recording

באמצע הריצה:

1. reload viewer.
2. close viewer.
3. reopen viewer.

Pass criteria:

- recorder לא נעצר.
- DB ממשיך לגדול.
- viewer החדש נטען מה-state הקיים.
- latest וה-history נשארים עקביים.

---

## T4.5.7 — Long-run validation counters

בכל report נרשום:

~~~text
runtimeMinutes
cyclesCompleted
cyclesFailed
historyRows
latestRows
universeRows
storageUsageBytes
storageQuotaBytes
averageCycleDurationMs
lastError
~~~

Pass criteria:

- failed cycles מפורטים.
- lastError נשמר אם קיים.
- אין report "success" אם יש data-integrity failure.

---

## T4.5.8 — Capacity estimate

רק אחרי מדידה אמיתית נחשב:

~~~text
MB / minute
MB / hour
estimated hours until selected safety threshold
~~~

אין להסיק capacity ממספר rows בלבד.

ה-estimate יהיה מסומן כ:

~~~text
Measured from this run
~~~

ולא כ-browser guarantee.

---

## T4.5.9 — No automatic retention during V1 test

במהלך בדיקות V1:

~~~text
no auto-delete
no auto-truncate
no hidden cleanup
~~~

Pass criteria:

- growth measurement מייצג את המודל האמיתי.
- כל deletion נעשה רק בפעולה מפורשת.

---

## T4.5.10 — Integrated report artifact

כל integrated run משמעותי יישמר ליד prototype:

~~~text
reports/YYYY-MM-DD-HHMM-integrated-v1.md
~~~

ה-report יכיל:

- config.
- runtime.
- browser storage usage.
- row counts.
- cycle counts.
- failures.
- viewer actions tested.
- pass/fail per integrated scenario.
- known limitations.

---

# Stage 4.5 completion rule

Stage 4.5 נחשב מתוכנן כאשר implementation עתידי יכול למדוד ולהוכיח:

~~~text
actual IndexedDB growth
bytes per row
MB per minute
latest remains bounded
history growth matches completed cycles
recorder + viewer coexist
reload/close/reopen do not stop recorder
integrated diagnostics remain visible
capacity estimate is evidence-based
no hidden retention
integrated report is reproducible
~~~

לא מבצעים עדיין את המדידות עצמן. המדידה בפועל תבוצע בשלבי implementation/testing המאוחרים יותר.


---

# Automated CI + Live Verification Strategy

הבדיקות של V1 יהיו דו-שכבתיות.

## Layer A — Automated GitHub Actions

Environment:

~~~text
GitHub Actions
→ Node test tooling
→ Playwright
→ Chromium
~~~

Browser capabilities אמיתיות:

~~~text
IndexedDB
DOM
BroadcastChannel (where practical)
storage APIs
~~~

External provider:

~~~text
MapHeat2 → mocked
GetSecuritiesData → mocked
~~~

אין cookies/tokens/session של לאומי ב-CI.

### CI suites planned

~~~text
1. storage-schema
2. storage-roundtrip
3. storage-cleanup-reopen
4. recorder-universe
5. recorder-chunks
6. recorder-full-cycle
7. recorder-loop
8. persistence-atomicity
9. viewer-current-table
10. viewer-sorting
11. viewer-history
12. cross-tab/reload
13. failure-paths
14. full mocked E2E
~~~

כל suite בודק observable behavior ולא private implementation.

## Layer B — Live browser verification

מתבצע רק אחרי Layer A ירוק.

Live verification בודק דברים שה-mock אינו יכול להוכיח:

- response shape בפועל באתר.
- current provider behavior.
- same-origin/session behavior.
- real timing/cadence.
- real long-run stability.
- storage growth עם payload אמיתי.

Live test result חייב להיות מסומן:

~~~text
Verified
Inferred
Unknown
~~~

## Rule

כאשר feature ניתן לבדיקה אוטומטית:

~~~text
CI test required before feature is Complete
~~~

כאשר feature תלוי ב-provider אמיתי:

~~~text
CI mocked test passes
+
Live verification pending
~~~

עד שהמשתמש מריץ אותו בפועל.
