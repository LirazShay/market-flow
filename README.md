# Market Flow

Market Flow הוא repository רחב למחקר ופיתוח של מערכת market-data / analysis / trading infrastructure.

ה-repository אינו שייך ל-workstream אחד. כרגע יש workstream פעיל אחד משמעותי, ובהמשך יתווספו אחרים.

## כניסה מהירה

אם נכנסת בפעם הראשונה:

~~~text
README.md
→ AGENTS.md
→ docs/project/workstreams.md
→ workstream מקומי
   ├── AI_CONTEXT.md
   ├── STATUS.json
   ├── HANDOFF.md   # אם קיים ורלוונטי
   └── files/tests הרלוונטיים
~~~

### איפה נמצא מה?

| צורך | קובץ |
|---|---|
| כללי עבודה קבועים ל-AI/agent | AGENTS.md |
| מטרת Market Flow וה-scope הכללי | PROJECT_CONTEXT.md |
| איזה workstreams קיימים ומה פעיל | docs/project/workstreams.md |
| מצב רוחבי של הפרויקט | docs/project/current-state.md |
| החלטות durable | docs/project/decisions.md |
| מבנה repository | docs/project/repository-structure.md |
| Leumi market-data evidence | docs/leumi-api/README.md |

## Workstream פעיל כרגע

כרגע הפיתוח הפעיל נמצא ב:

~~~text
01A — Local History Viewer V1
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

ה-pointer המדויק תמיד נמצא ב:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json
~~~

נכון לעדכון האחרון:

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

אל תשתמש ב-README הראשי כמקור אמת ל-micro-status; הוא רק דלת כניסה.

## Repository map

~~~text
market-flow/
├── README.md
├── AGENTS.md
├── PROJECT_CONTEXT.md
│
├── docs/
│   ├── project/          project-wide context / workstreams / decisions
│   └── leumi-api/        durable Leumi market-data knowledge
│
├── scripts/
│   └── research/         research / prototypes / evidence
│
├── src/                  future production code
└── tests/                future production tests
~~~

## כללי יסוד

- GitHub repository הוא ה-source of truth, לא היסטוריית chat.
- כל workstream משמעותי מחזיק context/status מקומי משלו.
- STATUS.json = operational pointer.
- ROADMAP.md = plan/order, לא live status.
- research code אינו production code.
- אין לבחור production stack בלי decision מפורש.
- אין להכניס secrets/session/account data ל-repository הציבורי.
