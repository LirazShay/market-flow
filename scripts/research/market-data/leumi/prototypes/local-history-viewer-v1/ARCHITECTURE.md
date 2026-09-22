# Architecture — Local History Viewer V1

Status:

~~~text
Proposed for V1
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
  |  GetSecuritiesData chunk 2
  |  delay
  |  GetSecuritiesData chunk 3
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

Proposed database:

~~~text
market-flow-leumi-v1
~~~

Version:

~~~text
1
~~~

## Store: meta

Key:

~~~text
key
~~~

דוגמאות:

~~~text
schemaVersion
recorderInstanceId
recordingStartedAt
lastHeartbeatAt
lastCompletedCycleId
lastError
config
~~~

## Store: universe

Key:

~~~text
securityId
~~~

מכיל metadata יחסית איטי:

~~~text
securityId
paperName
marketValue
ESG metadata
rawMapHeat
updatedAt
~~~

## Store: latest

Key:

~~~text
securityId
~~~

מכיל latest normalized + raw detailed record.

מטרה:

~~~text
current table without scanning history
~~~

## Store: history

Primary key מוצע:

~~~text
[securityId, collectedAt]
~~~

Indexes:

~~~text
bySecurityTime: [securityId, collectedAt]
byCollectedAt: collectedAt
byCycleId: cycleId
~~~

Record כולל:

~~~text
securityId
cycleId
chunkIndex
cycleStartedAt
chunkReceivedAt
collectedAt
serverAsOfDate
normalized fields
rawSecurity
~~~

## Store: cycles

Key:

~~~text
cycleId
~~~

Record:

~~~text
cycleId
startedAt
completedAt
durationMs
requested
received
unique
missing
duplicates
chunk summaries
status
error
~~~

---

# 4. Write transaction strategy

לאחר שכל 3 chunks עברו validation:

1. create/complete cycle record.
2. write all history records.
3. upsert all latest records.
4. update meta heartbeat/status.
5. commit transaction.
6. רק לאחר commit לשלוח BroadcastChannel notification.

המטרה היא שה-viewer לעולם לא יקבל notification על data שטרם commit.

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

Channel name מוצע:

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
