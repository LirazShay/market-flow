# Chat / Workstream Map — Market Flow

מטרת המסמך: לאפשר עבודה בכמה chats בלי לאבד הקשר ובלי שכל chat יצטרך לדעת את כל היסטוריית השיחות.

---

## Naming convention

מומלץ:

~~~text
NN – Domain / Purpose
~~~

---

# 01 – Market Data / Leumi API Research

Status:

~~~text
Active foundation / major research completed
~~~

Purpose:

- להבין market APIs באתר לאומי.
- לגלות endpoints.
- להבין data flow.
- לקבל את כל universe.
- למדוד field availability.
- לבדוק batching.
- לבדוק polling stability.

Primary docs:

~~~text
docs/leumi-api/
~~~

Primary scripts:

~~~text
scripts/research/market-data/leumi/
~~~

Verified outcomes:

- 561 securities were retrieved in the tested snapshot.
- MapHeat2 full-universe call worked.
- GetSecuritiesData full coverage worked using 3 × 187.
- PaperId == Key in 561/561.
- field coverage measured.
- browser table PoC worked.

Current open item:

~~~text
long-running polling stability test
~~~

Script:

~~~text
scripts/research/market-data/leumi/tests/polling-stability/long-running-poll-test.js
~~~

---

# Future workstreams

אלה placeholders בלבד. אין לראות בהם התחייבות שה-phase הבא כבר נבחר.

## 02 – Collector
Status: Not started

## 03 – Storage / History
Status: Not started

## 04 – Scanner
Status: Not started

## 05 – Analysis / Momentum
Status: Not started

## 06 – Execution
Status: Not started

## 07 – UI / Monitoring
Status: Not started as production work

Current exception: a browser table exists only as a research PoC.

---

# Rule for every chat

1. לזהות את ה-workstream שלו.
2. לקרוא PROJECT_CONTEXT.md.
3. לקרוא docs/project/current-state.md.
4. לקרוא את docs של ה-workstream.
5. לא לשנות scope של workstream אחר בלי צורך.
6. כל ידע חדש שחייב להיות משותף — נכנס ל-repo.

---

# When a chat finishes a meaningful milestone

Update:

~~~text
docs/project/current-state.md
docs/project/decisions.md   if a decision was made
docs/project/chat-map.md    if status/responsibility changed
domain docs                 whenever new domain knowledge was learned
~~~
