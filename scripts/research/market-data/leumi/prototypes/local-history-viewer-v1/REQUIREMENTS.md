# Requirements — Local History Viewer V1

## Goal

לאפשר למשתמש להריץ recorder בדפדפן, לפתוח viewer בטאב נוסף, לראות current market state ולהיכנס להיסטוריה של כל נייר מאז תחילת ההקלטה.

הכול נשמר מקומית בדפדפן.

---

# Functional requirements

## R1 — Recorder

ה-recorder משתמש ב-flow שכבר הוכח:

~~~text
MapHeat2
→ universe

GetSecuritiesData
→ 3 sequential chunks of 187
→ full 561-security cycle
~~~

ברירת המחדל נשענת על ה-baseline המאומת:

~~~text
CHUNK_SIZE = 187
CHUNK_DELAY_MS = 1000
no overlapping cycles
~~~

## R2 — Persistent local history

כל full collection cycle שנחשב valid נשמר ב-IndexedDB.

אסור לשמור רק latest state.

היסטוריה צריכה להישמר עד שהמשתמש מוחק אותה במפורש או עד שנחליט בעתיד על retention policy.

V1 לא מוסיף auto-retention.

## R3 — Fast current-state view

אסור לבנות current table על scan של כל history.

צריך store ייעודי של latest record לכל security.

## R4 — Per-security history

לחיצה על security ב-viewer צריכה לאפשר לראות רשומות קודמות של אותו security לפי זמן, newest-first.

V1 מציג history table.

Chart נשאר ל-V2 או שלב מאוחר יותר.

## R5 — Cross-tab live update

כאשר recorder משלים write מוצלח:

- IndexedDB הוא source of truth.
- BroadcastChannel משמש notification בלבד.
- viewer שקיבל notification מרענן latest data מה-DB.

אם notification אבד, viewer עדיין מסוגל להיטען מחדש מה-DB.

## R6 — Sorting

V1 מאפשר:

- click על column header.
- ascending / descending.
- indicator של direction.
- sort על הנתונים שכבר נטענו ל-current table.

אין filtering ב-V1.

## R7 — Diagnostics

ה-viewer מציג לפחות:

- recorder status/heartbeat.
- last completed cycle.
- last collected time.
- universe size.
- last cycle duration.
- successful/failed cycles.
- last error.
- approximate browser storage usage כאשר זמין.

## R8 — Data integrity

רק cycle שעבר validation מלא נרשם כ-complete.

Validation:

~~~text
requested
received
unique
missing
duplicates
response structure
~~~

אם cycle נכשל, אין להציג אותו כאילו הוא snapshot מלא.

## R9 — Preserve time semantics

מאחר ש-3 chunks נאספים sequentially, snapshot מלא אינו atomic.

יש לשמור:

- cycleId.
- cycleStartedAt.
- cycleCompletedAt.
- chunkIndex.
- chunkReceivedAt.
- server AsOfDate כאשר קיים.
- collectedAt per security record.

אין לתת לכל 561 הרשומות timestamp מזויף אחד כאילו נאספו באותה מילישנייה.

## R10 — Preserve null semantics

~~~text
null != 0
empty string != null
~~~

אין לבצע generic falsy normalization.

---

# Non-functional requirements

## N1 — Browser-only prototype

V1 עובד ללא server.

## N2 — Recoverable

viewer חדש צריך להיות מסוגל להיבנות מחדש מה-IndexedDB בלבד.

## N3 — Recorder survives viewer close

סגירת viewer לא עוצרת recorder.

## N4 — Viewer survives recorder pause

viewer עדיין מציג את המידע האחרון שנשמר.

## N5 — Explicit errors

DB/API/validation failures נראים ב-console וב-status state.

## N6 — No secrets

אין לשמור cookies/session/authentication data ב-IndexedDB או ב-Git.

---

# Acceptance criteria for V1

V1 נחשב עובד כאשר בבדיקה ידנית:

1. recorder רץ לפחות כמה דקות.
2. IndexedDB מכיל latest + history.
3. viewer נפתח בטאב נוסף.
4. current table מכילה את כל securities שנאספו.
5. הנתונים בטבלה משתנים עם הזמן.
6. sorting עובד לפחות על string/number/time columns.
7. לחיצה על security מציגה history מההקלטה.
8. reload של viewer לא מאבד history.
9. recorder ממשיך לעבוד כאשר viewer נסגר.
10. אין missing/duplicate data ב-cycles שמסומנים complete.
