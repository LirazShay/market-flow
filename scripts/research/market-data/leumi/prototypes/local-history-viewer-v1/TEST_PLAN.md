# Test Plan — Local History Viewer V1

Status:

~~~text
Stage 4.1 complete
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
