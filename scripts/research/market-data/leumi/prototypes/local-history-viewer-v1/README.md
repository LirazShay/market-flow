# Local History Viewer V1

Browser-only research prototype שמקליט snapshots של Leumi market data ל-IndexedDB ומציג current + historical data באותו origin.

## 30-second orientation

| שאלה | קובץ |
|---|---|
| מהם כל השלבים? | [ROADMAP.md](ROADMAP.md) |
| איפה אנחנו עכשיו? | [STATUS.json](STATUS.json) |
| מה AI צריך לדעת כדי להמשיך? | [AI_CONTEXT.md](AI_CONTEXT.md) |
| מה צריך לקרוא בצ'אט/agent חדש? | [HANDOFF.md](HANDOFF.md) |
| מה להדביק כהודעה ראשונה בצ'אט הפיתוח הבא? | [NEXT_CHAT_PROMPT.md](NEXT_CHAT_PROMPT.md) |
| מה הארכיטקטורה וה-data model? | [docs/](docs/README.md) |
| איך הטסטים עובדים? | [tests/README.md](tests/README.md) |
| מה מדיניות ה-CI/checkpoints? | [tests/TESTING_POLICY.md](tests/TESTING_POLICY.md) |

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
├── docs/
│   ├── README.md
│   ├── requirements.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── viewer-ux.md
│   ├── test-plan.md
│   └── history/
│       └── testing-refactor/
│
├── recorder/
│   ├── README.md
│   ├── pure/
│   └── browser adapters / loop
│
├── storage/
│   ├── README.md
│   └── IndexedDB modules
│
└── tests/
    ├── README.md
    ├── TESTING_POLICY.md
    ├── unit/
    ├── automation/
    └── fixtures/
~~~

## V1 flow

~~~text
MapHeat2
→ dynamic universe
→ GetSecuritiesData sequential chunks
→ validated complete cycle
→ IndexedDB
   ├── sessions
   ├── universe
   ├── cycles
   ├── latest
   ├── history
   └── meta
→ BroadcastChannel notification
→ same-origin viewer
~~~

## Stable V1 boundaries

V1 includes:

- dynamic universe; never hardcode 561.
- sequential collection baseline.
- complete-cycle validation.
- local IndexedDB history.
- latest row per security.
- same-origin viewer.
- sorting and per-security history.
- basic diagnostics.
- tests-first development with Fast CI + sparse Chromium checkpoints.

V1 intentionally excludes:

- server / external DB.
- production architecture.
- execution/trading.
- advanced charts.
- filtering.
- derived momentum metrics.
- automatic retention.

## Source-of-truth rules

~~~text
ROADMAP.md
    scope / order / stage definitions

STATUS.json
    current / next / completed / verification state

AI_CONTEXT.md
    compact continuation context

docs/
    durable V1 design

tests/TESTING_POLICY.md
    durable test/checkpoint policy
~~~

Do not duplicate operational status into design documents.

## Browser constraint

IndexedDB ו-BroadcastChannel הם origin-scoped.

Recorder ו-viewer חייבים לרוץ באותו Leumi origin ב-V1. Localhost viewer לא יכול להניח גישה ל-IndexedDB של Leumi origin.

