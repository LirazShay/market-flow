# AI Context — Local History Viewer V1

Updated: 2026-09-22

This is the fast technical entry point for this workstream.

## Read order

~~~text
AI_CONTEXT.md
→ STATUS.json
→ target files
→ directly relevant tests
~~~

In a fresh chat also read HANDOFF.md.

STATUS.json is the only authoritative source for exact current/next progress.

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
- viewer is same-origin.
- manual DB-only refresh remains fallback.
- current table joins latest + universe by securityId.
- missing universe metadata must not drop a latest row.

## Current milestone

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

Latest verification:

~~~text
Fast CI
Run 35756792160
136 passed / 0 failed

Viewer Checkpoint C
Run 35756990977
34 Chromium tests passed / 0 failed
~~~

## Current implementation map

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

## Next working set — Stage 13

Read:

~~~text
ROADMAP.md                  # Stage 13
docs/viewer-ux.md           # sections 8–9
viewer/pure/current-table-logic.js
viewer/current-table.js
tests/unit/current-table-logic.test.js
tests/TESTING_POLICY.md
~~~

Implement deterministic sorting behavior in pure logic first, then UI header interaction.

Default:

~~~text
DailyDealsQuantity DESC
paperName ASC tie-breaker
~~~

Single-column sorting only in V1.

## Testing

~~~text
deterministic sorting
→ Fast unit tests

DOM/browser sorting interaction
→ browser spec may be added now
→ planned Chromium checkpoint after Stages 14–15 unless early-browser exception is justified
~~~

## Durable docs — only when needed

~~~text
docs/architecture.md
docs/data-model.md
docs/viewer-ux.md
docs/test-plan.md
docs/project/decisions.md
docs/leumi-api/
~~~

If this file conflicts with durable design or STATUS.json, inspect the authoritative source and fix the conflict in the same work batch.
