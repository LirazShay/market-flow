# Current State — Market Flow

Last updated: 2026-09-22

זהו project-level milestone snapshot. Exact micro-progress שייך ל-STATUS.json של כל workstream.

## Current phase

~~~text
Phase 01 — Market Data / Leumi API Research
~~~

## Verified foundation

Leumi market-data research has verified:

- MapHeat2 universe/metadata retrieval.
- GetSecuritiesData detailed snapshot retrieval.
- PaperId == Key join for the tested 561/561 snapshot.
- full tested snapshot retrieval with 3 × 187 chunks.
- field coverage/nullability observations.
- browser table PoC.
- 40.03-minute polling run:
  - 481 completed cycles;
  - 0 failed cycles;
  - 1447 HTTP 200 responses;
  - average cycle ≈ 4986 ms.

Detailed evidence:

~~~text
docs/leumi-api/
scripts/research/market-data/leumi/
~~~

## Active implementation

~~~text
01A — Local History Viewer V1
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Verified implementation milestone:

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

Implemented through this milestone:

~~~text
Recorder
→ dynamic universe + sequential collection
→ validation
→ IndexedDB session/universe/cycle persistence
→ atomic cycles + history + latest + meta
→ failure diagnostics + heartbeat
→ same-origin RTL viewer
→ current table from IndexedDB
→ BroadcastChannel live refresh
→ manual refresh fallback
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

Exact next pointer:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json
~~~

## Production scope not yet started

~~~text
production collector
production database/history stack
scanner/ranking
analysis/signals
execution
order/position management
production UI/monitoring
~~~

The browser prototype does not imply a production technology decision.

## Current unknowns

- exact provider-side reason/limit behind large GetSecuritiesData 403 responses;
- behavior beyond the verified polling window and across all market states;
- deeper order-book source/semantics;
- final production stack;
- final production persistence;
- scanner/analysis architecture.

## Navigation

~~~text
What is active?
→ docs/project/workstreams.md

Exact active workstream status?
→ local STATUS.json

Technical continuation context?
→ local AI_CONTEXT.md

Durable decisions?
→ docs/project/decisions.md
~~~
