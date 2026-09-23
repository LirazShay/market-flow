# Momentum Ranking V1 — Research Workstream

מחקר ותכנון של מנגנון real-time שמדרג את מניות TASE לפי איכות הזדמנות momentum קצרה של שניות עד בערך שתי דקות.

הצ'אט הוא סביבת המחקר הראשית והחיה. GitHub משמש durable support: זיכרון מתמשך, backlog, checkpoints, תוצרים והקשר לצ'אט חדש.

## Fresh-chat HOT path

~~~text
AGENTS.md
→ docs/project/workstreams.md
→ this README
→ STATUS.json
→ AI_CONTEXT.md
→ current GitHub Issue
→ only the relevant research artifact
~~~

אם נדרש לשחזר את כל המחקר:

~~~text
docs/research-checkpoint.md
~~~

## Authority split

~~~text
STATUS.json = live current/next/completion pointer
ROADMAP.md  = plan/order/scope
GitHub Issues = research backlog/task discussion
docs/       = durable research knowledge
chat        = active reasoning/research surface
~~~

אם Issue state סותר את STATUS.json, ה-STATUS.json המקומי קובע.

## Master Issue

~~~text
#3 — [Research] Momentum Ranking V1 — master research program
~~~

## Core architecture

~~~text
validated complete market cycle
→ StockObserver per security
→ StockCard
→ cross-sectional normalization/context
→ CentralRanker
→ leader / NO_OPPORTUNITY
→ later ExecutionEvaluator
~~~

כל Observer הוא stateful. הוא צריך להבין לא רק snapshot אלא process וזיכרון מקומי של אותה מניה.

## Durable dependencies

Provider/data evidence:

~~~text
docs/leumi-api/
~~~

Validated local-history foundation:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

ה-Local History Viewer הוא workstream נפרד; אין להכניס אליו momentum/scoring semantics.

## Core interpretation rules

- score 0–100 אינו probability.
- UNKNOWN אינו 0 ואינו neutral.
- null != 0 != "" != undefined.
- best relative rank אינו מספיק; NO_OPPORTUNITY הוא outcome תקף.
- observed sequence/association אינו בהכרח causality.
- raw market move אינו executable move.
- recent behavior is evidence/context, not guarantee.
- thresholds/weights are provisional until validated on collected TASE data.
- US/Nasdaq evidence may inspire hypotheses but must not be copied blindly to TASE.
