# Local History Viewer V1

Browser-only research prototype inside Market Flow.

This README is the stable workstream orientation page, not a progress diary.

## Fresh-chat HOT path

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
~~~

Repository-wide rules are already loaded from `AGENTS.md`.

After HOT context, read only the current Stage scope, target files/tests and owning SPEC(s) needed for the task.

Historical rationale remains available from:

~~~text
docs/history/README.md
~~~

but is not preloaded by default.

## Where to look

| Need | File |
|---|---|
| exact operational progress / next action | `STATUS.json` |
| compact technical context / invariants | `AI_CONTEXT.md` |
| full plan / stage scope | `ROADMAP.md` |
| durable normative contracts | `specs/README.md` |
| durable design / rationale | `docs/README.md` |
| preserved historical evidence | `docs/history/README.md` |
| testing policy | `tests/TESTING_POLICY.md` |
| optional human fresh-chat helper | `HANDOFF.md` |
| optional copy/paste continuation prompt | `NEXT_CHAT_PROMPT.md` |

## V1 flow

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel notification
→ Viewer rereads IndexedDB
→ current/history UI
~~~

## Stable V1 boundaries

V1 includes:

- dynamic universe; never hardcode a universe size;
- sequential collection baseline;
- complete-cycle validation;
- IndexedDB local history;
- same-origin Viewer;
- current table, sorting and per-security history;
- recorder/viewer diagnostics;
- self-contained runtime/Bookmarklet;
- bounded sanitized Debug Bundle.

V1 intentionally excludes:

- server/external DB;
- production architecture;
- execution;
- advanced charts/filtering;
- derived momentum metrics;
- automatic retention.

## Source-of-truth ownership

~~~text
STATUS.json  = live progress / current verification
ROADMAP.md   = plan / order / scope
AI_CONTEXT   = compact technical continuation
specs/       = durable behavior/contracts/invariants
docs/        = durable design/evidence/rationale
docs/history = cold historical evidence
~~~
