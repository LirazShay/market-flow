# Workstreams — Market Flow

זהו project-wide routing table. המטרה היא שצ'אט חדש ידע לאן להיכנס בלי לשכפל live progress.

## Default continuation target

### 01B — Local History Viewer V2

Location:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/
~~~

Operational source of truth:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/STATUS.json
~~~

Fast context:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/README.md
scripts/research/market-data/leumi/prototypes/local-history-viewer-v2/AI_CONTEXT.md
~~~

Do not copy exact live stage/next state into this routing document.

---

## Momentum ranking

### 05 — Momentum Ranking Replacement

Location:

~~~text
docs/analysis/momentum-ranking/
~~~

Operational source of truth:

~~~text
docs/analysis/momentum-ranking/STATUS.json
~~~

The prior Momentum Ranking V1 program is archived:

~~~text
docs/analysis/archive/momentum-ranking-v1/
~~~

---

## Market-data history foundation

### 01A — Local History Viewer V1

Frozen reference:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Its historical/frozen operational record remains in its own `STATUS.json`.

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

---

## Future scope placeholders

~~~text
02 Collector
03 Storage / History
04 Scanner
06 Execution
07 UI / Monitoring
~~~

These are scope/routing labels only.

## Continue rule

~~~text
AGENTS.md
→ this routing table
→ target README
→ target STATUS.json
→ target AI_CONTEXT.md
→ current Issue / relevant artifact
~~~
