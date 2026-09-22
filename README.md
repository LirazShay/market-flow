# Market Flow

Market Flow הוא repository מחקר ופיתוח למערכת market-data רחבה יותר.

## Start here

אם נכנסת ל-repository בפעם הראשונה, אל תנסה לקרוא הכול.

| אני רוצה... | לך לכאן |
|---|---|
| להמשיך את הפיתוח הפעיל | [Local History Viewer V1](scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/README.md) |
| לראות את כל שלבי V1 | [V1 ROADMAP](scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/ROADMAP.md) |
| לדעת בדיוק איפה הפיתוח עומד עכשיו | [V1 STATUS](scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json) |
| להבין את מחקר Leumi API | [Leumi API docs](docs/leumi-api/README.md) |
| להבין את מצב הפרויקט כולו | [Current State](docs/project/current-state.md) |
| לראות החלטות ארכיטקטוניות | [Decision Index](docs/project/decisions.md) |
| להבין איך repository מסודר | [Repository Structure](docs/project/repository-structure.md) |
| לעבוד כ-AI/agent | [AGENTS.md](AGENTS.md) |

## Repository map

~~~text
market-flow/
├── README.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
│
├── docs/
│   ├── project/          cross-project context / decisions / structure
│   └── leumi-api/        durable Leumi API knowledge/evidence
│
├── scripts/
│   └── research/
│       └── market-data/
│           └── leumi/
│               ├── capture/
│               ├── collection/
│               ├── demos/
│               ├── tests/
│               └── prototypes/
│                   └── local-history-viewer-v1/   ← active implementation
│
├── src/                  reserved for future production code
└── tests/                reserved for future production tests
~~~

## Active development

ה-workstream הפעיל הוא:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

בתוך התיקייה הזו יש חלוקה ברורה:

~~~text
README.md       front door / navigation
ROADMAP.md      all V1 stages and order
STATUS.json     authoritative current progress
AI_CONTEXT.md   compact AI continuation context
HANDOFF.md      optional fresh-chat handoff

docs/           stable V1 design documents
recorder/       recorder implementation
storage/        IndexedDB implementation
tests/          executable tests + testing policy
~~~

## Verified Leumi foundation

המחקר עד כה הוכיח, בנקודת הזמן שנבדקה:

- MapHeat2 סיפק universe של 561 ניירות.
- GetSecuritiesData סיפק full coverage ב-3 batches של 187 באותו snapshot שנבדק.
- `MapHeat2.PaperId == GetSecuritiesData.Key` נבדק ב-561/561.
- field coverage נמדד.
- polling stability נבדק במשך 40.03 דקות: 481 cycles הושלמו, 0 נכשלו.

אלה observations שנבדקו, לא API contracts קבועים. אין hardcode ל-561.

## Project rules

- repository הוא source of truth.
- operational progress נמצא ב-`STATUS.json`, לא ב-ROADMAP.
- unknown API behavior נשאר `Unknown` ולא הופך להנחה.
- `null != 0 != ""`.
- research code אינו production code.
- secrets/session data לא נכנסים ל-repository.

