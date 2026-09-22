# Polling Stability Test

המסמך הזה צמוד לקוד שהוא מתאר:

`long-running-poll-test.js`

## מטרה

בדיקה מבוקרת של קריאות market data לאורך זמן מתוך browser session פעיל של אתר לאומי.

## Flow

בתחילת ההרצה:

~~~text
MapHeat2 count
→ MapHeat2 full universe
→ validate IDs
→ split by CHUNK_SIZE
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

## Default configuration שנבדק

~~~js
SNAPSHOT_INTERVAL_MS: 3000
CHUNK_DELAY_MS: 1000
CHUNK_SIZE: 187
MAX_RUN_MINUTES: 0
STOP_AFTER_CONSECUTIVE_FAILURES: 3
REFRESH_MAP_EVERY_CYCLE: false
LOG_EACH_REQUEST: true
~~~

## שליטה בזמן ריצה

~~~js
__marketFlowPolling.report()
__marketFlowPolling.stop()
__marketFlowPolling.state.latestSnapshot
~~~

## מה נמדד

- HTTP status counts.
- total requests.
- request durations.
- completed / failed cycles.
- consecutive failures.
- cycle duration.
- requested / received.
- unique Keys.
- missing IDs.
- duplicates.
- last error.

## Verified run — 2026-09-22

דוח מלא:

[reports/2026-09-22-1555-polling-stability.md](reports/2026-09-22-1555-polling-stability.md)

תוצאה:

~~~text
Runtime:                40.03 minutes
Universe:               561
Chunk sizes:            187 / 187 / 187

Cycles completed:       481
Cycles failed:            0
Consecutive failures:     0

Total HTTP requests:    1447
HTTP 200:               1447
HTTP 403:                  0
HTTP 429:                  0
HTTP 5xx:                  0

Average request:         662 ms
Average full cycle:     4986 ms
~~~

### מסקנה

ה-config הזה הוכח כרגע כיציב במשך 40 דקות לפחות ללא כשל HTTP או כשל validation.

חשוב:

~~~text
SNAPSHOT_INTERVAL_MS = 3000
~~~

הוא target בלבד.

בפועל:

~~~text
averageCycleDurationMs = 4986
~~~

ולכן full snapshot של 561 ניירות התקבל בערך כל 5 שניות, לא כל 3 שניות.

ה-script אינו מאפשר overlapping cycles, וזה behavior רצוי כרגע.

## Status

~~~text
Verified for a 40-minute run
~~~

עדיין לא הוכחו שעות רצופות, יום מסחר שלם, parallel batching או cadence אגרסיבי יותר.
