# PROJECT_CONTEXT.md — Market Flow

Market Flow הוא פרויקט רחב שנבנה בהדרגה סביב flow עתידי של:

~~~text
Market Data
→ Collection
→ Storage / History
→ Scanner
→ Analysis / Signals
→ Trading Logic
→ Execution
→ Position / Order Management
→ UI / Monitoring
~~~

זו מפת scope ארוכת טווח, לא טענה שכל הרכיבים כבר קיימים.

## Source of truth

לצ'אט/agent חדש:

~~~text
AGENTS.md
→ docs/project/workstreams.md
→ workstream-local AI_CONTEXT.md
→ workstream-local STATUS.json
→ target files/tests
~~~

אין להסתמך על זיכרון מצ'אט קודם כאשר ה-repository יכול לענות.

## Workstreams

הרשימה והסטטוס הרוחבי של workstreams נמצאים ב:

~~~text
docs/project/workstreams.md
~~~

מצב micro-stage של workstream אינו נשמר במסמך הזה; הוא נשמר ב-STATUS.json המקומי שלו.

## המצב הנוכחי ברמה גבוהה

Phase 01 עוסק ב-Market Data / Leumi API Research.

מחקר ה-foundation כבר הוכיח, בין היתר:

- MapHeat2 כ-universe/metadata source.
- GetSecuritiesData כ-detailed market snapshot source.
- join מאומת: MapHeat2.PaperId == GetSecuritiesData.Key.
- snapshot שנבדק עם 561 securities.
- full collection שנבדק באמצעות 3 × 187 באותו snapshot.
- field coverage.
- long-running polling test של 40.03 דקות: 481 completed cycles, 0 failed cycles.

אלו point-in-time observations, לא provider contracts קבועים.

ה-workstream הפעיל כרגע הוא Local History Viewer V1, אך הוא רק חלק מ-Market Flow ולא הגדרת הפרויקט כולו.

## מה עדיין future scope

Production workstreams עתידיים כוללים בין היתר:

~~~text
collector
production storage/history
scanner/ranking
analysis/signals
execution
order/position management
production UI/monitoring
~~~

אין להניח שהם קיימים רק משום שהם ב-scope.

## Technology discipline

לא נבחר stack סופי לכל המערכת.

קוד JavaScript/IndexedDB/Playwright הנוכחי הוא research/prototype implementation של workstream מסוים, לא הכרעה על stack production עתידי.

Durable technology/architecture decisions נכנסים ל:

~~~text
docs/project/decisions.md
docs/project/decisions/D-NNN.md
~~~

## Documentation ownership

~~~text
AGENTS.md
    universal working rules

docs/project/workstreams.md
    project-wide routing / active workstreams

docs/project/current-state.md
    project-level milestone snapshot

workstream/AI_CONTEXT.md
    compact technical continuation context

workstream/STATUS.json
    exact current pointer

workstream/ROADMAP.md
    plan/order/scope

workstream/HANDOFF.md
    fresh-chat boundary summary when useful
~~~
