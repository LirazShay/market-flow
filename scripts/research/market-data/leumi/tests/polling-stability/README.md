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

## מה לשמור אחרי הרצה

לאחר בדיקה אמיתית יש לשמור report בתוך התיקייה הזו:

~~~text
reports/YYYY-MM-DD-HHMM-polling-stability.md
~~~

## Status

~~~text
Pending real-world long-running verification
~~~
