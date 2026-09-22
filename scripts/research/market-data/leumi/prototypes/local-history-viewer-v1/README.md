# Local History Viewer V1

Browser-only research prototype inside Market Flow.

It is the currently active workstream, not the entire Market Flow project.

## 30-second orientation

| Question | File |
|---|---|
| exact current/next stage | STATUS.json |
| compact technical context | AI_CONTEXT.md |
| full V1 plan/order | ROADMAP.md |
| fresh-chat boundary | HANDOFF.md |
| copy-ready next development chat | NEXT_CHAT_PROMPT.md |
| durable V1 design | docs/ |
| testing / CI policy | tests/TESTING_POLICY.md |

## Current milestone

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

Latest verification:

~~~text
Fast CI: 136 passed / 0 failed
Viewer Checkpoint C: 34 Chromium passed / 0 failed
~~~

Always trust STATUS.json over this milestone text if development has advanced.

## Folder map

~~~text
local-history-viewer-v1/
├── README.md
├── ROADMAP.md
├── STATUS.json
├── AI_CONTEXT.md
├── HANDOFF.md
│
├── docs/          stable V1 design
├── recorder/      market-data recorder
├── storage/       IndexedDB persistence
├── messaging/     BroadcastChannel notification
├── viewer/        same-origin viewer
└── tests/         unit + Playwright + policy
~~~

## V1 flow

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ validated cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel notification
→ viewer re-reads IndexedDB
→ current/history UI
~~~

## Stable V1 boundaries

V1 includes:

- dynamic universe; never hardcode 561.
- sequential collection baseline.
- complete-cycle validation.
- IndexedDB local history.
- same-origin viewer.
- current table, sorting and per-security history.
- recorder/viewer diagnostics.
- tests-first development with Fast CI + sparse Chromium checkpoints.

V1 intentionally excludes:

- server/external DB.
- production architecture.
- execution.
- advanced charts.
- filtering.
- derived momentum metrics.
- automatic retention.

## Source-of-truth ownership

~~~text
STATUS.json
    exact progress

ROADMAP.md
    stage definitions/order

AI_CONTEXT.md
    compact technical continuation

HANDOFF.md
    current fresh-chat boundary

docs/
    durable design

tests/TESTING_POLICY.md
    verification policy
~~~
