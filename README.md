# Market Flow

Market Flow הוא repository רחב למחקר ופיתוח של market-data / analysis / trading infrastructure.

ה-README הראשי הוא **דלת כניסה יציבה**, לא מקור ל-progress תפעולי.

## כניסה מהירה

~~~text
README.md
→ AGENTS.md
→ docs/project/workstreams.md
→ workstream README.md
→ workstream STATUS.json
→ workstream AI_CONTEXT.md
→ current task files/tests/specs as needed
~~~

## איפה נמצא מה?

| צורך | קובץ |
|---|---|
| כללי עבודה קבועים ל-AI/agent | AGENTS.md |
| מדיניות טעינת context מדורגת | docs/project/context-loading.md |
| מטרת Market Flow וה-scope הכללי | PROJECT_CONTEXT.md |
| routing בין workstreams | docs/project/workstreams.md |
| evidence/context רוחבי שאינו micro-status | docs/project/current-state.md |
| החלטות durable | docs/project/decisions.md |
| מדיניות Specs וחובת SPEC impact review | docs/project/specification-policy.md |
| מבנה repository | docs/project/repository-structure.md |
| Leumi market-data evidence | docs/leumi-api/README.md |

## Operational state ownership

לכל workstream משמעותי יש `STATUS.json` מקומי.

רק הוא רשאי להחזיק:

- current stage/substep;
- completion / in-progress / verification-pending;
- exact next pointer;
- latest verification evidence שמגדיר את מצב העבודה.

README, handoff, context ו-routing docs רשאים **להפנות** ל-`STATUS.json`, אך אינם מעתיקים ממנו snapshot.

## Repository map

~~~text
market-flow/
├── README.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
│
├── docs/
│   ├── project/
│   └── leumi-api/
│
├── scripts/
│   └── research/
│
├── src/
└── tests/
~~~

## כללי יסוד

- GitHub repository הוא ה-source of truth, לא היסטוריית chat.
- `STATUS.json` = operational state.
- `ROADMAP.md` = plan/order/scope, לא live status.
- research code אינו production code.
- אין לבחור production stack בלי decision מפורש.
- אין להכניס secrets/session/account data ל-repository הציבורי.
