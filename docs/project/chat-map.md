# Chat / Workstream Map — Market Flow

מטרת המסמך: לאפשר עבודה בכמה chats בלי לאבד הקשר, כאשר ה-repository ולא היסטוריית הצ'אט הוא ה-source of truth.

## Naming convention

~~~text
NN – Domain / Purpose
~~~

# 01 – Market Data / Leumi API Research

Status:

~~~text
Major research foundation complete
Active implementation continues inside Local History Viewer V1
~~~

Primary docs:

~~~text
docs/leumi-api/
~~~

Primary research code:

~~~text
scripts/research/market-data/leumi/
~~~

Verified research outcomes:

- tested snapshot contained 561 securities.
- MapHeat2 full-universe retrieval worked.
- GetSecuritiesData full coverage worked with 3 × 187.
- PaperId == Key matched 561/561.
- field coverage was measured.
- browser table PoC worked.
- 40.03-minute polling stability run completed 481 cycles with 0 failed cycles.

## 01A – Local History Viewer V1

Location:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Current boundary:

~~~text
Stage 7 recorder complete + browser verified
Stage 8 persistence integration next
~~~

For a new chat at this boundary, read:

~~~text
AGENTS.md
→ local AI_CONTEXT.md
→ local STATUS.json
→ local HANDOFF.md
→ target Stage 8 files/tests
~~~

Do not reconstruct current progress from old chat text.

# Future workstreams

These are placeholders only.

## 02 – Collector
Status: Not started as production work

## 03 – Storage / History
Status: Not started as production work

Current exception: Local History Viewer V1 is a browser research prototype using IndexedDB.

## 04 – Scanner
Status: Not started

## 05 – Analysis / Momentum
Status: Not started

## 06 – Execution
Status: Not started

## 07 – UI / Monitoring
Status: Not started as production work

Current exception: browser research/prototype UI work may exist under scripts/research.

# Rule for every chat

1. identify the workstream.
2. read `AGENTS.md`.
3. for an active workstream with fast context, read its `AI_CONTEXT.md` and `STATUS.json`.
4. at a declared chat boundary, also read local `HANDOFF.md` if present.
5. read broader project/domain docs only when the task actually requires them.
6. do not change another workstream's scope accidentally.
7. durable shared knowledge must be committed to the repository.

# Meaningful milestone updates

Update only the sources whose ownership changed:

~~~text
STATUS.json
  operational progress

AI_CONTEXT.md
  compact working context when focus/invariants/working set changed

component README
  component contract/usage

docs/project/current-state.md
  meaningful project/workstream milestone

docs/project/decisions/D-NNN.md + decisions.md
  durable decision

ROADMAP.md
  only when scope/order/stage definitions changed
~~~
