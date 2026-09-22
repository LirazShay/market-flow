# AI Context — Local History Viewer V1

Updated: 2026-09-22

This is the fast context entry point for AI work on this workstream.

## Fast continuation rule

For a normal continuation inside this workstream, read only:

1. `AI_CONTEXT.md`
2. `STATUS.json`
3. the files being changed
4. the directly relevant tests

Read the wider project documentation only when:
- entering a different workstream;
- changing architecture, schema, or a durable decision;
- a conflict or stale status is detected;
- API evidence must be re-verified.

## Current focus

~~~text
Stage 6.4 — Playwright browser-test harness
~~~

Natural next batch may include:

~~~text
6.4 Playwright harness
+
6.5 GitHub Actions workflow
~~~

if they remain one coherent test-infrastructure boundary.

Do not continue beyond that natural boundary without a new user instruction.

## Current progress

~~~text
Stages 1–5: Complete

Stage 6:
6.1 Implemented — browser execution pending
6.2 Implemented — browser execution pending
6.3 Implemented — browser execution pending
6.4 Next
6.5 Planned
6.6 Planned
6.7 Planned

Stage 7:
7.1 Complete
7.2 Complete
7.3 Next
7.4 Planned
7.5 Planned
7.6 Planned

Stages 8–20:
Planned
~~~

The machine-readable pointer is `STATUS.json`.

## V1 architecture

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
→ BroadcastChannel notification
→ same-origin Viewer tab
~~~

V1 is browser-only.

No server. No external database. No filtering in V1.

## Critical invariants

### API/data

- Never hardcode universe size 561.
- `MapHeat2.PaperId == GetSecuritiesData.Key` is the verified join.
- Canonical `securityId = String(PaperId or Key)`.
- Conservative verified batching baseline: 187.
- Chunk requests remain sequential until evidence supports otherwise.
- `null`, `0`, and `""` are distinct.
- Preserve the full GetSecuritiesData Security object in `data`.
- Preserve the full MapHeat record in `universe.rawMapHeat`.
- MapHeat2 and GetSecuritiesData are not one atomic shared snapshot.

### Persistence

Database:

~~~text
market-flow-leumi-history-v1
version 1
~~~

History primary key:

~~~text
[cycleId, securityId]
~~~

Successful full-cycle persistence must be atomic across:

~~~text
cycles + history + latest + meta
~~~

If that transaction fails:
- no partial history rows;
- no partially updated latest snapshot;
- no complete cycle becomes visible.

Failed API/validation cycles must not update `latest` or `history`.

IndexedDB is source of truth. BroadcastChannel is notification only.

### Time

Use numeric epoch milliseconds for our indexed/query timestamps.

Do not invent a separate timestamp per security inside one API chunk.

## Verified evidence carried forward

- MapHeat2 snapshot observed with 561 records.
- Full GetSecuritiesData collection verified using 3 × 187 for that snapshot.
- Join verified 561/561.
- 40-minute polling run:
  - 481 completed cycles
  - 0 failed cycles
  - 1447 HTTP 200 responses
  - average full cycle ≈ 4986 ms
- 3000 ms snapshot interval is a target cadence, not a guarantee.

These are point-in-time observations, not API contracts.

## Current implementation map

~~~text
storage/
  schema.js
  connection.js
  upgrade.js
  read.js
  write.js

tests/
  storage-schema-self-test.js
  storage-fixture-roundtrip-self-test.js
  storage-cleanup-reopen-self-test.js

recorder/
  config.js
  universe-loader.js
~~~

## Testing policy

~~~text
Automated CI first
→ Chromium/Playwright
→ real browser APIs where practical
→ mocked Leumi endpoints
→ live Leumi verification after CI passes
~~~

CI must not contain Leumi cookies, tokens, credentials, or account data.

## Documentation/update cadence

For a normal implementation batch:
- update code;
- update tests;
- update `STATUS.json`.

Update this file only when current focus, invariants, or the relevant working set changes.

At a meaningful stage/substage boundary:
- update `ROADMAP.md`;
- update the local README when useful.

Only update:
- `docs/project/decisions.md` for durable decisions;
- `docs/project/current-state.md` for meaningful project/workstream milestones.

## Durable sources — read only when needed

~~~text
ARCHITECTURE.md
DATA_MODEL.md
VIEWER_UX.md
TEST_PLAN.md
ROADMAP.md
docs/leumi-api/
docs/project/decisions.md
~~~

## Conflict rule

If this fast context conflicts with a durable design/decision document:
1. do not guess;
2. inspect the authoritative document;
3. resolve the conflict;
4. update this file in the same work batch.
