# Recorder Module — Local History Viewer V1

Status:

~~~text
Stage 7.3 — single GetSecuritiesData chunk fetch
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

עדיין אין:

- multi-chunk cycle builder.
- polling loop.
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
