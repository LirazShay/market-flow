# Polling Stability Report — 2026-09-22 15:55

## Status

~~~text
Verified for this 40-minute run
~~~

הדוח נלקח מ-`__marketFlowPolling.report()` בזמן שהבדיקה עדיין רצה.

## Configuration

~~~json
{
  "SNAPSHOT_INTERVAL_MS": 3000,
  "CHUNK_DELAY_MS": 1000,
  "CHUNK_SIZE": 187,
  "MAX_RUN_MINUTES": 0,
  "STOP_AFTER_CONSECUTIVE_FAILURES": 3,
  "REFRESH_MAP_EVERY_CYCLE": false,
  "LOG_EACH_REQUEST": true
}
~~~

## Runtime

~~~text
StartedAt:       2026-09-22T12:15:29.608Z
CollectedAt:     2026-09-22T12:55:28.987Z
Uptime:          40.03 minutes
Universe:        561
Chunk sizes:     187 / 187 / 187
~~~

## Cycle results

~~~text
Cycles started:     482
Cycles completed:   481
Cycles failed:        0
Consecutive fails:    0
Last error:         null
~~~

הבדיקה הייתה עדיין running בזמן הדוח, ולכן cycle 482 כבר התחיל אך טרם הושלם.

## HTTP results

~~~text
Total requests: 1447

HTTP 200: 1447
HTTP 403:    0
HTTP 429:    0
HTTP 5xx:    0
~~~

### Verified conclusion

במהלך 40.03 דקות, כל 1447 קריאות ה-HTTP שנרשמו הסתיימו ב-`200`.

לא נצפתה חסימה, rate-limit או שגיאת HTTP בזמן חלון הבדיקה הזה.

הקביעה מוגבלת להרצה הזו ול-config הזה בלבד.

## Timing

~~~text
Average request duration: 662 ms
Average cycle duration:  4986 ms
~~~

### Important observation

למרות:

~~~text
SNAPSHOT_INTERVAL_MS = 3000
~~~

משך ה-cycle הממוצע שנמדד היה:

~~~text
4986 ms
~~~

לכן תחת ה-config הנוכחי אין בפועל snapshot מלא כל 3 שניות.

המערכת מריצה את ה-cycle הבא רק לאחר שהקודם הסתיים, ולכן cadence מלא שנמדד הוא בערך:

~~~text
~4.99 seconds per full 561-security snapshot
~12 full snapshots per minute
~~~

זה behavior רצוי מבחינת מניעת overlapping cycles.

הסיבה המדויקת לכל ההפרש בין 3s target ל-4.986s בפועל לא נותחה כאן מעבר לכך שה-cycle כולל 3 requests sequential, delays ועבודת processing/validation.

## Latest completed snapshot

~~~text
Cycle:              481
Duration:           4854 ms
Total securities:   561
Missing:              0
Duplicates:           0
~~~

### Chunk 1

~~~text
Requested: 187
Received:  187
AsOfDate:  2026-09-22 15:55
Duration:  747 ms
~~~

### Chunk 2

~~~text
Requested: 187
Received:  187
AsOfDate:  2026-09-22 15:55
Duration:  601 ms
~~~

### Chunk 3

~~~text
Requested: 187
Received:  187
AsOfDate:  2026-09-22 15:55
Duration:  707 ms
~~~

## Data integrity

ב-481 cycles שהושלמו:

~~~text
Cycles failed: 0
Latest snapshot missing: 0
Latest snapshot duplicates: 0
~~~

ה-script מבצע completeness validation בכל cycle, ולכן `cyclesFailed = 0` הוא evidence לכך שלא נרשמה הפרת validation במחזורים שהושלמו.

## What this verifies

### Verified

עבור browser session, config וקצב אלה:

- 3 batches של 187 יכולים לרוץ sequential לאורך 40 דקות לפחות.
- לא נצפו HTTP 403.
- לא נצפו HTTP 429.
- לא נצפו HTTP 5xx.
- לא היו failed cycles.
- לא נרשמו consecutive failures.
- full snapshots המשיכו להגיע עם 561 securities.
- ה-flow לא יצר overlapping cycles.
- cadence בפועל היה בערך 5 שניות ל-full snapshot.

### Not verified by this run

ההרצה הזו לא מוכיחה:

- יציבות לאורך שעות או יום מסחר שלם.
- אותו behavior בקצב אגרסיבי יותר.
- אותו behavior עם parallel batches.
- אותו behavior אם `MapHeat2` מרוענן בכל cycle.
- behavior בזמן פתיחה/נעילה/אחרי המסחר.
- rate-limit threshold המדויק של האתר.
- שה-API יישאר יציב בעתיד.

## Recommendation after this run

ה-config הבא מקבל כרגע evidence חזק בהרבה מהבדיקות הקודמות:

~~~text
CHUNK_SIZE = 187
CHUNK_DELAY_MS = 1000
sequential batches
MapHeat loaded once at startup
no overlapping cycles
~~~

לדיוק של תדירות sampling יש להתייחס ל-`averageCycleDurationMs` בפועל, ולא רק ל-`SNAPSHOT_INTERVAL_MS`.
