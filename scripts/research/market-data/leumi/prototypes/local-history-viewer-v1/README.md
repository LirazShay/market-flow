# Local History Viewer V1

Browser-only research prototype inside Market Flow.

ה-README הזה מתאר boundaries ו-navigation יציבים בלבד.

## 30-second orientation

| Question | File |
|---|---|
| exact operational progress | STATUS.json |
| compact technical context | AI_CONTEXT.md |
| full V1 plan/order | ROADMAP.md |
| fresh-chat instructions | HANDOFF.md |
| reusable continuation prompt | NEXT_CHAT_PROMPT.md |
| durable normative contracts / Specs | specs/README.md |
| durable V1 design / rationale | docs/ |
| testing / CI policy | tests/TESTING_POLICY.md |
| engineering / safe-change policy | [project engineering practices](../../../../../../docs/project/engineering-practices.md) |

## Operational state source

~~~text
STATUS.json
~~~

אין להעתיק ל-README הזה current stage, completion state, next pointer או latest CI snapshot.

## Folder map

~~~text
local-history-viewer-v1/
├── README.md
├── ROADMAP.md
├── STATUS.json
├── AI_CONTEXT.md
├── HANDOFF.md
├── NEXT_CHAT_PROMPT.md
│
├── specs/
├── docs/
├── recorder/
├── storage/
├── messaging/
├── viewer/
└── tests/
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

- dynamic universe; never hardcode a universe size.
- sequential collection baseline.
- complete-cycle validation.
- IndexedDB local history.
- same-origin viewer.
- current table, sorting and per-security history.
- recorder/viewer diagnostics.
- tests-first development under `tests/TESTING_POLICY.md`.

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
    operational progress + verification state

ROADMAP.md
    stage definitions/order/scope

AI_CONTEXT.md
    compact technical continuation only

HANDOFF.md
    fresh-chat read/continuation instructions

specs/
    durable normative behavior/contracts/invariants

docs/
    durable design/evidence/rationale

tests/TESTING_POLICY.md
    verification policy
~~~
