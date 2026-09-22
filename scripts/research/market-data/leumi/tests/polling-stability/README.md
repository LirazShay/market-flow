# Polling Stability Test

## Script

`long-running-poll-test.js`

## מטרה

להריץ לאורך זמן polling קונפיגורבילי ולבדוק:

- HTTP statuses.
- failed cycles.
- request/cycle durations.
- missing IDs.
- duplicates.
- האם מופיעים 403/429/5xx לאורך זמן.

## Status

הקוד מוכן; real-world long-running verification עדיין Pending עד שתישמר תוצאה מאומתת.

## Documentation

`docs/leumi-api/polling-stability-test.md`
