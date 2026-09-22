# Architecture — Local History Viewer V1

Status:

~~~text
Accepted V1 architecture
Stages 1–7 implemented through the in-memory recorder boundary
Stage 8 persistence integration next
~~~

---

# 1. High-level flow

~~~text
Leumi tab
  |
  |  MapHeat2 once / refresh when needed
  |
  |  GetSecuritiesData chunk 1
  |  delay
  |  ...
  |  delay
  |  GetSecuritiesData chunk N
  v
Recorder
  |
  | validate complete cycle
  v
IndexedDB
  |\
  | \__ latest
  | \__ history
  | \__ cycles
  | \__ universe
  | \__ state/meta
  |
  +---- BroadcastChannel: data changed
             |
             v
       Viewer tab
         |
         +-- current table
         +-- dynamic sorting
         +-- security history
         +-- recorder/storage diagnostics
~~~

---

# 2. Browser origin model

IndexedDB הוא per-origin.

לכן V1 חייב לשמור recorder וה-viewer באותו origin.

האפשרות הפשוטה:

~~~text
Leumi page
→ run recorder
→ run/open viewer script
→ script opens same-origin about:blank child tab
→ viewer accesses same IndexedDB
~~~

V1 לא משתמש ב-localhost viewer.

---

# 3. IndexedDB

ה-schema המפורט נסגר בשלב 2 ומתועד ב:

~~~text
data-model.md
~~~

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

Key decisions:

~~~text
canonical securityId = string

history primary key:
[cycleId, securityId]

history time index:
[securityId, collectedAtMs]

latest:
one row per securityId

GetSecuritiesData:
all returned fields preserved inside data

MapHeat2:
stored once in universe, not duplicated in every history row
~~~

---

# 4. Write transaction strategy

לאחר שכל ה-chunks שתוכננו עבור ה-universe הנוכחי עברו validation:

1. create/complete cycle record.
2. write all history records.
3. upsert all latest records.
4. update meta heartbeat/status.
5. commit transaction.
6. רק לאחר commit לשלוח BroadcastChannel notification.

המטרה היא שה-viewer לעולם לא יקבל notification על data שטרם commit.

## Stage 8 success boundary

Stage 7 currently produces a validated complete cycle in memory.

Once persistence is connected:

~~~text
validated cycle
→ atomic IndexedDB commit
→ only after commit: recorder completed/latest state
→ later: BroadcastChannel notification
~~~

A DB transaction failure must be treated as recorder failure.

The successful cycle commit must be one transaction spanning:

~~~text
cycles + history + latest + meta
~~~

---

# 5. Failure behavior

אם chunk נכשל:

~~~text
cycle status = failed
latest/history are not partially updated
~~~

אפשר לשמור cycle failure diagnostics, אבל לא להכניס 1/3 snapshot ל-latest.

---

# 6. Cross-tab messaging

Channel name:

~~~text
market-flow-leumi-v1
~~~

Messages מינימליים:

~~~text
RECORDER_STARTED
RECORDER_HEARTBEAT
CYCLE_COMMITTED
RECORDER_STOPPED
RECORDER_ERROR
DATABASE_CLEARED
~~~

Message אינו מכיל את כל 561 records.

הוא מכיל רק metadata כגון:

~~~text
cycleId
completedAt
~~~

ה-viewer קורא את הנתונים מה-DB.

---

# 7. Viewer V1

## Main screen

Header/status:

~~~text
Recorder: Running / Stale / Stopped
Last cycle
Last update
561 securities
DB/history count
Storage usage
~~~

Main table:

- current latest row per security.
- sticky header.
- horizontal scroll.
- clickable sortable headers.
- selected sort column + direction.

## Security history screen/panel

לחיצה על row:

~~~text
Security name / id
latest summary
history table
newest first
~~~

V1 לא מצייר chart.

---

# 8. Sorting

ה-sort מתבצע ב-viewer memory על latest rows.

אין צורך ב-IndexedDB index לכל column.

סוגי sort:

~~~text
number
string
timestamp
nullable
~~~

Null ordering צריך להיות deterministic.

הצעה:

~~~text
ASC:  values first, nulls last
DESC: values first, nulls last
~~~

---

# 9. Storage expectations

ב-flow שנמדד:

~~~text
~1 full cycle / 5 seconds
561 records / cycle
~12 cycles / minute
~6,732 history rows / minute
~403,920 rows / hour
~~~

זה volume משמעותי.

V1 עדיין שומר הכול, אבל חובה:

- למדוד usage עם navigator.storage.estimate().
- לא לשמור UI-derived duplicates מיותרים.
- לעקוב אחרי DB growth בבדיקות.

לפני שימוש של שעות רבות נרצה למדוד storage growth בפועל.

---

# 10. V1 deliberate simplifications

- ללא framework.
- ללא server.
- ללא filter.
- ללא charts.
- ללא worker בשלב הראשון.
- ללא compression.
- ללא retention.
- ללא schema abstraction מוגזמת.

אם performance יצדיק זאת, worker/batching/compact schema ייבדקו בשלב נפרד.
