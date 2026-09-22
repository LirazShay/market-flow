# Recorder Module — Local History Viewer V1

Status:

~~~text
Stage 7.5 + 7.6 implemented — Stage 7 browser checkpoint pending
~~~

התיקייה הזו תכיל את recorder של ה-prototype.

המטרה של Stage 7 היא לקחת את ה-flow שכבר הוכח במחקר:

~~~text
MapHeat2
→ dynamic universe
→ GetSecuritiesData in sequential chunks
→ full-cycle validation
→ cycle object
~~~

ב-Stage 7 עדיין **לא** כותבים ל-IndexedDB. ה-persistence שייך ל-Stage 8.

## Stage 7.1

קבצים:

~~~text
config.js
universe-loader.js
~~~

מוגדרים:

- target cycle interval.
- delay בין chunks.
- chunk size שמבוסס על baseline שכבר נבדק.
- policy לגבי refresh של universe.
- validation של overrides.

Stage 7.2 מוסיף:

- MapHeat2 count request.
- full universe request לפי recordCount.
- validation ל-recordCount ול-records length.
- validation ל-PaperId חסר/כפול.
- canonical securityId כמחרוזת.
- chunk planning לפי config.chunkSize.

אם recordCount משתנה בין קריאת count לקריאה המלאה, הטעינה נכשלת במפורש במקום לקבל universe לא עקבי.

Stage 7.3 מוסיף:

- relative same-origin `GetSecuritiesData` URL.
- validation ל-securityIds לפני request.
- HTTP validation.
- documented response-path validation.
- validation ל-Key חסר/כפול.
- exact requested/received membership validation בלי להניח response order.
- preservation של raw Security records.
- preservation של `Table.AsOfDate`.
- chunk timing metadata:
  - startedAtMs
  - responseReceivedAtMs
  - completedAtMs
  - requestDurationMs
  - parseDurationMs
  - durationMs

Stage 7.4 מוסיף:

- sequential fetch של כל chunks.
- delay רק בין chunks, לא אחרי האחרון.
- no-overlap בתוך cycle יחיד.
- validation שה-chunks מכסים בדיוק את universe.
- validation של requested chunk מול result.
- validation גלובלי ל-missing/unexpected/duplicate Keys.
- in-memory complete cycle object בלבד.
- per-chunk timing summary.
- per-security metadata שמוכן ל-Stage 8:
  - securityId
  - chunkIndex
  - chunkReceivedAtMs
  - collectedAtMs
  - serverAsOfDate
  - raw data

אם chunk נכשל, ה-cycle נכשל מיד ולא ממשיך ל-chunk הבא.

Stage 7.5 מוסיף:

- start/stop recorder loop.
- target start-to-start cadence.
- no-overlap scheduling.
- immediate retry cadence when a cycle takes longer than the target interval, without overlap.
- optional universe refresh every cycle.
- in-memory latest cycle/error state.
- completed/failed counters.
- clean stop while waiting or while a cycle is already in flight.

Stage 7.6 מוסיף mocked browser coverage עבור:

- dynamic universe.
- sequential chunk requests.
- complete-cycle validation.
- HTTP failure propagation.
- missing/duplicate securities.
- recorder start/stop.
- no overlapping requests/cycles.
- latest in-memory state.

עדיין אין:

- DB writes.
- viewer integration.

## Proven baseline carried forward

~~~text
CHUNK_SIZE = 187
CHUNK_DELAY_MS = 1000
SNAPSHOT_INTERVAL_MS = 3000
sequential chunk requests
~~~

חשוב:

`SNAPSHOT_INTERVAL_MS` הוא target cadence בלבד. הוא אינו מבטיח cycle כל 3 שניות.

אין hardcode למספר הניירות; universe size מגיע מ-MapHeat2.
