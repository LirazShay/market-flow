# Test Plan — Local History Viewer V1

Status:

~~~text
Stage 4.1 + Stage 4.2 complete
~~~

המסמך נבנה בהדרגה. כרגע מוגדר רק תת-השלב הראשון.

---

# Stage 4.1 — Storage / Schema Test Cases

מטרה: להוכיח שה-IndexedDB נוצר בדיוק לפי DATA_MODEL.md וששורד reopen בלי לשנות schema.

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
- keyPath של כל index תואם ל-DATA_MODEL.md.

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
