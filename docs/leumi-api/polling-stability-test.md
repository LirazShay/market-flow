# Long-running polling stability test

## מטרה

בדיקה מבוקרת של קריאות ה-market data לאורך זמן מתוך browser session פעיל של אתר לאומי.

המטרה אינה לעקוף מגבלות, אלא למדוד האם ה-flow שכבר הוכח ממשיך לעבוד לאורך זמן בקצב מתון וקונפיגורבילי.

הסקריפט:

~~~text
scripts/research/leumi/long-running-poll-test.js
~~~

## Flow

בתחילת ההרצה:

~~~text
MapHeat2 count
→ MapHeat2 full universe
→ validate IDs
→ split by configured CHUNK_SIZE
~~~

לאחר מכן בכל cycle:

~~~text
GetSecuritiesData chunk 1
→ delay
GetSecuritiesData chunk 2
→ delay
GetSecuritiesData chunk 3
→ validate full snapshot
~~~

ב-561 ניירות ו-`CHUNK_SIZE=187` מתקבלות 3 קריאות.

## Default configuration

~~~js
SNAPSHOT_INTERVAL_MS: 3000
CHUNK_DELAY_MS: 1000
CHUNK_SIZE: 187
MAX_RUN_MINUTES: 0
STOP_AFTER_CONSECUTIVE_FAILURES: 3
REFRESH_MAP_EVERY_CYCLE: false
LOG_EACH_REQUEST: true
~~~

### פירוש

- Snapshot target cadence: כל 3 שניות מתחילת cycle אחד לתחילת הבא, כאשר הזמן בפועל לא יכול להיות קצר יותר ממשך ה-cycle עצמו.
- בין chunks יש delay של שנייה.
- MapHeat נטען פעם אחת בלבד בתחילת הבדיקה.
- 0 דקות = רץ עד עצירה ידנית.
- אחרי 3 cycles כושלים ברצף הסקריפט עוצר, כדי לא להמשיך להכות endpoint שנכשל.

## שליטה בזמן ריצה

סטטיסטיקה:

~~~js
__marketFlowPolling.report()
~~~

עצירה:

~~~js
__marketFlowPolling.stop()
~~~

ה-snapshot האחרון:

~~~js
__marketFlowPolling.state.latestSnapshot
~~~

## מה נמדד

- HTTP status counts
- total requests
- request durations
- completed cycles
- failed cycles
- consecutive failures
- cycle duration
- requested/received validation
- unique Keys
- missing IDs
- duplicate Keys
- last error

## מה צריך לשמור לאחר בדיקה

לאחר הרצה של 10–30 דקות לפחות:

~~~js
__marketFlowPolling.report()
~~~

יש לשמור את הפלט תחת:

~~~text
docs/leumi-api/reports/
~~~

ולתעד:

- משך ריצה.
- config.
- מספר cycles.
- status counts.
- failures.
- average request duration.
- average cycle duration.
- האם הופיע HTTP 403/429/5xx.
- האם היו missing/duplicate records.

## Status

Pending real-world long-running run.
