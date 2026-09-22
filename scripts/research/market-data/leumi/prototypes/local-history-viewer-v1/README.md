# Local History Viewer V1

Browser-only research prototype for recording Leumi market-data snapshots into IndexedDB and viewing current + historical data from a same-origin tab.

## Fast continuation

Current operational state is intentionally **not duplicated in this README**.

Use:

~~~text
AI_CONTEXT.md
STATUS.json
~~~

Rules:

~~~text
STATUS.json = current/next/completed/pending
ROADMAP.md  = scope/order only
README.md   = stable component overview
~~~

## V1 flow

~~~text
Leumi market-data recorder
→ full-cycle validation
→ IndexedDB
→ BroadcastChannel notification
→ same-origin viewer
→ current table + sorting + per-security history
~~~

## V1 scope

- dynamic universe; do not hardcode the number of securities.
- persistent local history in IndexedDB.
- one latest record per security for efficient current-state display.
- same-origin viewer tab.
- live refresh notifications.
- deterministic column sorting.
- per-security history drill-down.
- basic recorder/storage diagnostics.
- filtering intentionally excluded from V1.

## V1 non-goals

- no server.
- no external database.
- no production architecture.
- no execution/trading.
- no advanced charts.
- no complex filtering.
- no new derived momentum metrics in V1.
- no assumption that target polling cadence equals actual full-cycle cadence.

## Browser constraint

IndexedDB, BroadcastChannel and browser storage are origin-scoped.

Therefore recorder and viewer must share the Leumi origin in V1.

Do not design V1 as a localhost viewer expecting direct access to the Leumi-origin IndexedDB.

## Durable design documents

~~~text
REQUIREMENTS.md
ARCHITECTURE.md
DATA_MODEL.md
VIEWER_UX.md
TEST_PLAN.md
ROADMAP.md
~~~

Read them only when the task requires the relevant design detail.

## Current code areas

~~~text
storage/
    IndexedDB schema/connection/upgrade/read/write foundation

tests/
    browser self-tests and future automated browser tests

recorder/
    recorder configuration and collection components
~~~

For the exact current file/stage map, use `AI_CONTEXT.md` and `STATUS.json`.
