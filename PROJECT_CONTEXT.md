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
→ workstream-local README.md
→ workstream-local STATUS.json
→ workstream-local AI_CONTEXT.md
→ target files/tests/specs as needed
~~~

Operational progress אינו נשמר במסמך הזה.

## Durable research foundation

מחקר Leumi market-data הוכיח, בין היתר:

- MapHeat2 כ-universe/metadata source.
- GetSecuritiesData כ-detailed market snapshot source.
- join מאומת: MapHeat2.PaperId == GetSecuritiesData.Key.
- snapshot שנבדק עם 561 securities.
- full collection שנבדק באמצעות 3 × 187 באותו snapshot.
- field coverage.
- long-running polling evidence של 40.03 דקות עם 481 completed cycles, 0 failed cycles ו-average cycle של כ-4986 ms.

אלו point-in-time observations, לא provider contracts קבועים.

## Workstreams

רשימת workstreams ונתיבי ה-routing נמצאים ב:

~~~text
docs/project/workstreams.md
~~~

ה-progress המדויק של workstream נמצא רק ב-`STATUS.json` המקומי שלו.

## Future scope

ה-scope הרחב עשוי לכלול:

~~~text
collector
production storage/history
scanner/ranking
analysis/signals
execution
order/position management
production UI/monitoring
~~~

אין להניח שרכיב קיים רק משום שהוא מופיע ב-scope.

## Technology discipline

לא נבחר stack סופי לכל המערכת.

קוד JavaScript/IndexedDB/Playwright תחת research/prototypes הוא implementation מחקרי של workstream מסוים, לא הכרעה על production stack עתידי.

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
    workstream routing only

docs/project/current-state.md
    durable project evidence/context; no stage pointer

workstream/AI_CONTEXT.md
    compact technical continuation only

workstream/STATUS.json
    exact operational progress

workstream/ROADMAP.md
    plan/order/scope

workstream/HANDOFF.md
    optional human fresh-chat helper; not part of the default AI hot path

workstream/docs/history/
    preserved cold historical evidence, read on demand
~~~
