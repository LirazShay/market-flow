# Workstreams — Market Flow

זהו project-wide routing table.

המטרה: צ'אט חדש צריך לדעת מהר באיזה workstream לעבוד ואיפה נמצא ה-source of truth המקומי.

## Active

### 01A — Local History Viewer V1

Purpose:

Browser-only research prototype שמקליט Leumi market snapshots ל-IndexedDB ומציג current/history באותו origin.

Location:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/
~~~

Exact status:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/STATUS.json
~~~

Fast context:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/AI_CONTEXT.md
~~~

Fresh-chat handoff:

~~~text
scripts/research/market-data/leumi/prototypes/local-history-viewer-v1/HANDOFF.md
~~~

Current pointer at this milestone:

~~~text
Stages 1–12 complete
Next: Stage 13 — Dynamic sorting
~~~

Latest verified checkpoint:

~~~text
Fast CI: 136 passed / 0 failed
Run 35756792160

Viewer Checkpoint C:
34 Chromium tests passed / 0 failed
Run 35756990977
~~~

Important: the local STATUS.json overrides this milestone summary if development has advanced.

---

## Foundation workstream

### 01 — Market Data / Leumi API Research

Status:

~~~text
Major research foundation complete; supporting research remains available as needed.
~~~

Knowledge:

~~~text
docs/leumi-api/
~~~

Research code:

~~~text
scripts/research/market-data/leumi/
~~~

Verified evidence includes universe retrieval, detailed snapshot retrieval, join validation, field coverage and polling stability.

---

## Planned / not started as production work

### 02 — Collector
Status: not started as production work.

### 03 — Storage / History
Status: not started as production work.

Current exception: Local History Viewer V1 uses IndexedDB as a browser prototype.

### 04 — Scanner
Status: not started.

### 05 — Analysis / Momentum
Status: not started.

### 06 — Execution
Status: not started.

### 07 — UI / Monitoring
Status: not started as production work.

Current exception: prototype viewer work exists inside 01A.

---

## Rule for new workstreams

When a meaningful workstream starts:

1. create a clear location in the repository;
2. add a local README;
3. if it will span multiple chats/stages, add:
   - AI_CONTEXT.md
   - STATUS.json
   - ROADMAP.md when staged planning is useful;
   - HANDOFF.md only when a fresh-chat boundary benefits from it;
4. add the workstream here;
5. keep exact operational progress local rather than duplicating it project-wide.

## Rule for "continue"

If the user says only "continue the project":

~~~text
AGENTS.md
→ this file
→ active workstream AI_CONTEXT.md
→ active workstream STATUS.json
→ relevant files/tests
~~~
