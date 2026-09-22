# Workstreams — Market Flow

זהו project-wide routing table.

המטרה: צ'אט חדש צריך לדעת **לאן להיכנס**, בלי לשכפל לכאן את ה-progress של workstream.

## Default continuation target

### 01A — Local History Viewer V1

Purpose:

Browser-only research prototype שמקליט Leumi market snapshots ל-IndexedDB ומציג current/history באותו origin.

Location:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Operational source of truth:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json
~~~

Fast technical context:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/AI_CONTEXT.md
~~~

Fresh-chat handoff:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/HANDOFF.md
~~~

אין לשכפל כאן stage number, completion state, next pointer או latest CI checkpoint. יש לקרוא אותם ישירות מ-`STATUS.json`.

---

## Research foundation

### 01 — Market Data / Leumi API Research

Knowledge:

~~~text
docs/leumi-api/
~~~

Research code:

~~~text
scripts/research/market-data/leumi/
~~~

המסמכים תחת `docs/leumi-api/` מחזיקים evidence ו-semantics עמידים; הם אינם operational progress של 01A.

---

## Future scope placeholders

~~~text
02 Collector
03 Storage / History
04 Scanner
05 Analysis / Momentum
06 Execution
07 UI / Monitoring
~~~

אלה routing/scope labels בלבד. אין להסיק מהם implementation state.

## Rule for new workstreams

כאשר workstream משמעותי נוצר:

1. צור location ברור;
2. הוסף local README;
3. אם העבודה רב-שלבית, הוסף `AI_CONTEXT.md`, `STATUS.json`, ו-`ROADMAP.md` לפי הצורך;
4. הוסף כאן routing בלבד;
5. שמור operational progress רק ב-`STATUS.json` המקומי.

## Rule for "continue"

~~~text
AGENTS.md
→ this routing table
→ target workstream AI_CONTEXT.md
→ target workstream STATUS.json
→ relevant files/tests
~~~

ה-`STATUS.json` המקומי הוא היחיד שקובע מה עושים עכשיו.
