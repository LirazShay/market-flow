# Current State — Market Flow

השם ההיסטורי של הקובץ נשמר לצורכי navigation, אבל התוכן כאן הוא **project-level durable evidence/context בלבד**.

הקובץ אינו מחזיק stage number, completion state, next pointer או latest workstream CI snapshot.

## Durable verified foundation

Leumi market-data research has verified:

- MapHeat2 universe/metadata retrieval.
- GetSecuritiesData detailed snapshot retrieval.
- PaperId == Key join for the tested 561/561 snapshot.
- full tested snapshot retrieval with 3 × 187 chunks.
- field coverage/nullability observations.
- browser table PoC.
- 40.03-minute polling evidence:
  - 481 completed cycles;
  - 0 failed cycles;
  - 1447 HTTP 200 responses;
  - average cycle ≈ 4986 ms.

Detailed evidence:

~~~text
docs/leumi-api/
scripts/research/market-data/leumi/
~~~

## Prototype architecture currently represented in the repository

~~~text
Recorder
→ validated market-data cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel notification
→ same-origin Viewer
→ viewer re-reads IndexedDB
~~~

זהו תיאור architecture, לא completion claim.

## Operational state

Routing:

~~~text
docs/project/workstreams.md
~~~

Exact operational progress:

~~~text
workstream-local STATUS.json
~~~

Technical continuation context:

~~~text
workstream-local AI_CONTEXT.md
~~~

אין לשחזר operational state מהקובץ הזה.

## Durable unknowns

- exact provider-side reason/limit behind large GetSecuritiesData 403 responses;
- behavior beyond verified provider polling windows and across all market states;
- deeper order-book source/semantics;
- final production stack;
- final production persistence;
- scanner/analysis architecture.

The browser prototype does not imply a production technology decision.
