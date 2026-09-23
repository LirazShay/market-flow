# AI Context — Local History Viewer V1

Updated: 2026-09-22

This file contains compact **technical continuation context only**.

Operational progress, completion state, verification-pending state and the exact next pointer live only in:

~~~text
STATUS.json
~~~

## Read order

~~~text
AI_CONTEXT.md
→ STATUS.json
→ target files
→ directly relevant tests
~~~

In a fresh chat also read `HANDOFF.md`.

If this file and `STATUS.json` differ about progress, `STATUS.json` wins.

## Architecture

~~~text
Leumi browser tab
→ Recorder
→ validated complete cycle
→ IndexedDB
   ├── meta
   ├── sessions
   ├── universe
   ├── cycles
   ├── latest
   └── history
→ BroadcastChannel metadata notification
→ same-origin Viewer
→ viewer re-reads IndexedDB
~~~

V1 is browser-only. No server/external DB.

## Critical invariants

### API/data

- never hardcode universe size 561;
- verified join: MapHeat2.PaperId == GetSecuritiesData.Key;
- canonical securityId = String(PaperId or Key);
- conservative verified chunk baseline = 187, configurable;
- sequential chunk requests until evidence supports otherwise;
- null, 0, "" are distinct;
- preserve full raw Security in history/latest;
- preserve full raw MapHeat in universe;
- MapHeat2 + GetSecuritiesData are not one atomic shared snapshot.

### Persistence

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

Successful cycle is atomic across:

~~~text
cycles + history + latest + meta
~~~

DB commit succeeds before recorder exposes completed/latest in memory.

Failed API/validation/DB work never partially updates history/latest.

### Viewer/messaging

- IndexedDB is source of truth.
- BroadcastChannel is notification-only.
- channel name: `market-flow-leumi-v1`.
- viewer is same-origin.
- viewer rereads IndexedDB after `CYCLE_COMMITTED`.
- manual DB-only refresh remains fallback.
- current table joins latest + universe by securityId.
- missing universe metadata must not drop a latest row.
- BroadcastChannel-unavailable mode must not block viewer startup or manual DB refresh.

## Implementation map

~~~text
recorder/
  pure/
  browser adapters + loop + diagnostics

storage/
  schema/read/write
  lifecycle persistence
  successful-cycle persistence
  diagnostics persistence
  pure record builders

messaging/
  channel.js
  pure/channel-message-logic.js

viewer/
  bootstrap.js
  current-table.js
  history-data.js
  security-detail.js
  live-refresh.js
  pure/
    viewer-state.js
    current-table-logic.js

tests/
  unit/
  automation/
  fixtures/
  TESTING_POLICY.md
~~~

## Sorting technical contract

When `STATUS.json` points to sorting work, preserve this V1 contract:

~~~text
Default primary:
DailyDealsQuantity DESC

Final tie-breaker:
paperName ASC

V1:
single-column sorting only
~~~

Numeric/time columns:

~~~text
first click  → DESC
second click → ASC
then toggle
~~~

String columns:

~~~text
first click  → ASC
second click → DESC
then toggle
~~~

Indicator:

~~~text
▲ ASC
▼ DESC
~~~

Requirements:

- deterministic null-safe ordering;
- null/undefined/empty handling must not collapse zero;
- final equal-value tie-breaker is paperName ASC;
- live refresh must preserve selected sort column/direction;
- sortable headers must remain keyboard-accessible.

Likely working set for sorting:

~~~text
viewer/current-table.js
viewer/pure/current-table-logic.js
tests/unit/current-table-logic.test.js
tests/automation/specs/viewer-current-table.spec.js
docs/viewer-ux.md
tests/TESTING_POLICY.md
~~~

## Testing

Use the cheapest layer that proves behavior:

~~~text
pure deterministic behavior
→ Fast unit tests

IndexedDB / DOM / BroadcastChannel / same-origin behavior
→ exact changed/new Chromium test first
→ widen only when justified
→ full Browser CI before every numbered Stage closure

provider/session behavior
→ live verification only when mocks cannot prove it
~~~

Hard verification invariant:

~~~text
any added/modified test
→ run the smallest sufficient target in its real layer

intentional TDD red
→ exact target fails for intended reason
→ implement/fix
→ exact target green
~~~

For browser tests, targeted Chromium is the default red/green loop. Do not spend a full Browser-suite run merely to prove an expected red. Widen only for coupling/risk/evidence or a required checkpoint.

Browser checkpoints are additional integration milestones only. They never permit a changed Playwright/browser test, fixture, harness, or helper to remain unexecuted. An unexpected red, or red remaining after the intended fix, blocks progression and must be reflected in `STATUS.json`.

Every numbered Stage also has a mandatory closure gate:

~~~text
Fast CI green
+ full Browser CI green on final Stage state
→ Stage may become complete
~~~

For code quality, refactoring, and safe changes in existing/legacy code, follow:

~~~text
docs/project/engineering-practices.md
~~~

For sorting and other pure behavior, prefer unit tests for comparison/state logic. Browser DOM/accessibility behavior belongs in Chromium.

## Durable docs — read only when needed

~~~text
docs/architecture.md
docs/data-model.md
docs/viewer-ux.md
docs/test-plan.md
docs/project/decisions.md
docs/leumi-api/
~~~

Do not copy live completion state or the next pointer into this file; link back to `STATUS.json` instead.
