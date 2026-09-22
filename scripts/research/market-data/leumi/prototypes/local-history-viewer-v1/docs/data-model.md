# Data Model / IndexedDB Schema — Local History Viewer V1

Status:

~~~text
Stage 2 design complete
Stage 5 schema/basic storage foundation implemented + browser verified
Stage 8 persistence integration next
~~~

מטרת המסמך היא להגדיר במדויק מה נשמר ב-IndexedDB, באילו keys/indexes, ומהם גבולות ה-transaction.

---

# 1. Database identity

~~~text
Database name: market-flow-leumi-history-v1
Version:       1
~~~

V1 משתמש ב-IndexedDB של ה-origin שבו רץ אתר לאומי.

אין DB חיצוני ואין server.

---

# 2. Canonical security ID

ב-MapHeat2:

~~~text
PaperId = number
~~~

ב-GetSecuritiesData:

~~~text
Key = string
~~~

מכיוון שזה identifier ולא ערך מתמטי, הייצוג הקנוני שלנו יהיה:

~~~text
securityId = String(PaperId or Key)
~~~

כל join וכל IndexedDB key משתמשים ב-`securityId` כמחרוזת.

ה-raw source values נשמרים ללא שינוי בתוך payload המקורי.

---

# 3. Object stores

V1 כולל שישה stores:

~~~text
meta
sessions
universe
cycles
latest
history
~~~

הפרדה זו מכוונת:

- `universe` = metadata איטי יחסית מ-MapHeat2.
- `latest` = current state מהיר לטבלה.
- `history` = כל הדגימות ההיסטוריות.
- `cycles` = איכות ושלמות כל full snapshot.
- `sessions` = התחלה/עצירה של recorder.
- `meta` = מצב מערכת קטן.

---

# 4. Store: meta

## Purpose

Key/value קטן עבור schema ו-recorder state.

## Key

~~~text
key
~~~

## Records מוצעים

~~~text
{ key: "schemaVersion", value: 1 }

{
  key: "universeState",
  value: {
    loadedAtMs,
    recordCount
  }
}

{
  key: "recorderState",
  value: {
    instanceId,
    sessionId,
    status,
    recordingStartedAtMs,
    lastHeartbeatAtMs,
    lastCompletedCycleId,
    lastCompletedAtMs,
    completedCycles,
    failedCycles,
    lastError,
    config
  }
}
~~~

## Indexes

אין צורך ב-index.

---

# 5. Store: sessions

## Purpose

להפריד בין הרצות recorder שונות בלי למחוק history קיים.

## Key

~~~text
sessionId
~~~

ה-store מוגדר:

~~~text
keyPath: "sessionId"
autoIncrement: true
~~~

## Record

~~~text
{
  sessionId,
  startedAtMs,
  stoppedAtMs,
  status,
  config,
  initialUniverseCount,
  completedCycles,
  failedCycles,
  stopReason
}
~~~

## Indexes

~~~text
byStartedAt: startedAtMs
~~~

## למה צריך session

אם recorder נסגר ונפתח מחדש:

- history נשמר.
- cycle IDs ממשיכים להיות ייחודיים.
- ניתן לדעת איזו דגימה שייכת לאיזו הרצה.
- viewer עתידי יכול לבחור "כל ההיסטוריה" או session מסוים.

---

# 6. Store: universe

## Purpose

לשמור metadata מ-MapHeat2 בלי לשכפל אותו בכל history row.

## Key

~~~text
securityId
~~~

## Record

~~~text
{
  securityId,
  paperName,
  updatedAtMs,
  mapHeatDateChange,
  rawMapHeat
}
~~~

`rawMapHeat` שומר את כל הרשומה המקורית כפי שהתקבלה.

V1 לא מוחק fields מתוך MapHeat2.

## Indexes

~~~text
byPaperName: paperName
~~~

ה-index בשם נועד בעיקר ל-debug/query עתידי; current viewer עדיין יכול למיין בזיכרון.

---

# 7. Store: cycles

## Purpose

רשומה אחת לכל ניסיון ל-full snapshot.

גם cycle כושל יכול להירשם כאן לצורכי diagnostics.

## Key

~~~text
cycleId
~~~

ה-store מוגדר:

~~~text
keyPath: "cycleId"
autoIncrement: true
~~~

## Record — successful cycle

~~~text
{
  cycleId,
  sessionId,
  status: "complete",

  startedAtMs,
  completedAtMs,
  durationMs,

  requested,
  received,
  unique,
  missing,
  duplicates,

  chunks: [
    {
      chunkIndex,
      requested,
      received,
      requestStartedAtMs,
      receivedAtMs,
      durationMs,
      serverAsOfDate,
      httpStatus
    }
  ]
}
~~~

## Record — failed cycle

~~~text
{
  cycleId,
  sessionId,
  status: "failed",

  startedAtMs,
  completedAtMs,
  durationMs,

  requested,
  received,
  unique,
  missing,
  duplicates,

  chunks,
  error
}
~~~

## Indexes

~~~text
bySession: sessionId
byStartedAt: startedAtMs
byStatus: status
~~~

---

# 8. Store: history

## Purpose

לשמור כל security record מכל cycle מוצלח.

זהו מקור ההיסטוריה.

## Primary key

~~~text
[cycleId, securityId]
~~~

ה-store מוגדר:

~~~text
keyPath: ["cycleId", "securityId"]
~~~

### למה לא [securityId, collectedAt]

ה-key החדש נותן invariant פשוט:

~~~text
security אחד
× cycle אחד
= history row אחד בדיוק
~~~

הזמן נשאר index/query field ולא identity.

כך אין תלות בדיוק timestamp לצורך uniqueness.

## Record

~~~text
{
  cycleId,
  sessionId,
  securityId,

  chunkIndex,

  cycleStartedAtMs,
  chunkReceivedAtMs,
  collectedAtMs,
  serverAsOfDate,

  data
}
~~~

## data

`data` הוא אובייקט ה-`Security` המלא שהתקבל מ-GetSecuritiesData.

לדוגמה:

~~~text
data.Key
data.LastKnownRate
data.DailyDealsQuantity
data.BuyLimit1
data.SellLimit1
...
~~~

### V1 preservation rule

**לא זורקים אף field של GetSecuritiesData.**

גם fields שהיו `null` ב-561/561 נשמרים אם הם קיימים ב-response.

הסיבה:

- זה prototype למחקר.
- API פנימי יכול להתחיל למלא field בעתיד.
- לא רוצים לגלות בדיעבד שה-recording זרק מידע שהיה זמין.

אין שכבת normalized duplicate מלאה בתוך history, כדי לא להכפיל storage.

רק metadata הדרוש ל-query נשמר מחוץ ל-`data`.

## Indexes

~~~text
bySecurityTime:
  ["securityId", "collectedAtMs"]

byCollectedAt:
  collectedAtMs

byCycle:
  cycleId

bySession:
  sessionId
~~~

### Query להיסטוריה של נייר

~~~text
index = bySecurityTime
range = [securityId, lowerTime] .. [securityId, upperTime]
direction = prev
~~~

כך מקבלים newest-first בלי scan של כל DB.

---

# 9. Store: latest

## Purpose

current table צריכה 561 records, לא scan של מאות אלפי history rows.

## Key

~~~text
securityId
~~~

## Record shape

אותו מבנה לוגי כמו history row:

~~~text
{
  securityId,
  cycleId,
  sessionId,
  chunkIndex,
  cycleStartedAtMs,
  chunkReceivedAtMs,
  collectedAtMs,
  serverAsOfDate,
  data
}
~~~

בכל cycle מוצלח הרשומה מוחלפת.

## Indexes

V1 לא מוסיף indexes על market fields.

ה-viewer טוען בערך 561 latest rows וממיין אותם בזיכרון.

זה פשוט יותר ומונע יצירת עשרות indexes שאין בהם צורך.

---

# 10. Time model

V1 שומר timestamps כמספר:

~~~text
epoch milliseconds
~~~

לדוגמה:

~~~text
Date.now()
~~~

ולא כמחרוזת מקומית לצורכי index.

שדות זמן מקוריים של ה-API נשארים בתוך `data` ללא שינוי.

## Times שנשמור

~~~text
session.startedAtMs

cycle.startedAtMs
cycle.completedAtMs

chunk.requestStartedAtMs
chunk.receivedAtMs

history.cycleStartedAtMs
history.chunkReceivedAtMs
history.collectedAtMs

serverAsOfDate
~~~

## collectedAtMs

לכל chunk נוצר timestamp לאחר שה-response התקבל.

כל 187 records של אותו chunk יכולים לקבל אותו `collectedAtMs`, כי הם חלק מאותה response.

אין להמציא 187 timestamps שונים.

---

# 11. Atomic transaction boundaries

## T1 — Initialize / upgrade DB

Stores:

~~~text
all stores
~~~

רק ב-`onupgradeneeded`.

---

## T2 — Start recorder session

Stores:

~~~text
sessions
meta
~~~

פעולות:

1. create session.
2. update recorderState.
3. commit.
4. broadcast RECORDER_STARTED.

---

## T3 — Universe refresh

Stores:

~~~text
universe
meta
~~~

פעולות:

1. validate MapHeat2.
2. clear stale universe rows inside the same transaction.
3. write the complete validated universe snapshot.
4. update `meta.universeState` with `loadedAtMs` + `recordCount`.
5. commit.

אין history write.

---

## T4 — Commit successful full cycle

Stores:

~~~text
cycles
history
latest
meta
~~~

זהו ה-transaction הקריטי.

Sequence:

1. create `cycles` record and obtain `cycleId`.
2. write one history row for every security in the validated universe.
3. upsert one latest row for every security in the validated universe.
4. update recorderState counters/heartbeat.
5. commit transaction.
6. רק לאחר commit:
   - update in-memory state.
   - broadcast CYCLE_COMMITTED.

### Invariant

אם transaction נכשל:

~~~text
0 history rows committed
0 latest rows partially updated
no complete cycle visible
~~~

כלומר current table לא יכולה להיות חצי cycle חדש וחצי cycle ישן.

---

## T5 — Record failed cycle

Stores:

~~~text
cycles
meta
~~~

אין writes ל:

~~~text
history
latest
~~~

כך partial API result לא נכנס ל-current/history.

---

## T6 — Stop session

Stores:

~~~text
sessions
meta
~~~

אחר commit:

~~~text
broadcast RECORDER_STOPPED
~~~

---

# 12. Full-cycle validation before T4

לפני פתיחת transaction של successful cycle:

~~~text
requested == universe size
received == universe size
unique == universe size
missing == 0
duplicates == 0
all expected chunks completed
all response structures valid
~~~

רק אם כל התנאים מתקיימים עוברים ל-T4.

---

# 13. Storage policy for V1

## What is stored every cycle

לכל security:

~~~text
small query metadata
+ full raw GetSecuritiesData Security object
~~~

## What is NOT duplicated every cycle

MapHeat2 metadata לא מועתק לכל history row.

הוא נשמר ב-`universe`.

## Why no compression in V1

Compression/field dictionaries יקטינו storage אבל יוסיפו complexity בדיוק בשלב שבו אנחנו רוצים לבדוק correctness.

V1 מעדיף:

~~~text
clarity + recoverability + complete data
~~~

לפני optimization.

---

# 14. Expected row growth

בהתבסס על ה-run המאומת:

~~~text
average full cycle ≈ 4.986 sec
561 history rows / cycle
~~~

בקירוב:

~~~text
~12 cycles/minute
~6,732 history rows/minute
~403,920 history rows/hour
~~~

זה מספר rows משמעותי.

## Important

גודל bytes לרשומה עדיין **Unknown**.

אין להסיק MB/hour ממספר rows בלבד.

Stage 18 ימדוד בפועל:

~~~text
storage before
storage after N cycles
rows added
bytes / row
MB / minute
estimated hours at current browser quota
~~~

---

# 15. Retention

V1:

~~~text
no automatic retention
~~~

ה-history נשמר עד מחיקה מפורשת.

הסיבה: המשתמש רוצה לשחק עם ההיסטוריה ולמדוד את התנהגות ה-DB.

Retention policy היא V2/decision עתידי אחרי storage-growth evidence.

---

# 16. Clear database behavior

V1 יצטרך בהמשך action מפורש:

~~~text
Clear local Market Flow database
~~~

הפעולה:

- לא מופעלת אוטומטית.
- דורשת פעולה מפורשת של המשתמש.
- מוחקת את ה-DB של prototype זה בלבד.
- משדרת DATABASE_CLEARED לאחר הצלחה.

UI/action עצמו יתוכנן בשלב ה-UX.

---

# 17. Schema migration policy

Database version מתחיל ב-1.

כל שינוי עתידי ב:

- store.
- keyPath.
- index.

דורש העלאת version.

אסור למחוק history אוטומטית ב-upgrade.

Migration שאינו בטוח צריך להיכשל בצורה ברורה במקום לבצע destructive reset.

---

# 18. Decisions finalized in Stage 2

~~~text
Canonical securityId: string

Stores:
meta
sessions
universe
cycles
latest
history

History primary key:
[cycleId, securityId]

History indexes:
[securityId, collectedAtMs]
collectedAtMs
cycleId
sessionId

Latest:
one row per securityId

GetSecuritiesData:
all response fields preserved in data

MapHeat2:
stored in universe, not duplicated per history row

Successful full cycle:
atomic write across cycles/history/latest/meta

Failed cycle:
no partial history/latest writes

Timestamps:
epoch milliseconds for our indexes
raw API time fields preserved

Retention:
none in V1
~~~
