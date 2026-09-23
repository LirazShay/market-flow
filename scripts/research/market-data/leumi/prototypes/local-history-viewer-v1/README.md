# Local History Viewer V1

Browser-only market-data research prototype inside Market Flow.

Durable version marker:

~~~text
VERSION
→ V1
~~~

This README is a compact orientation page, not a progress diary. Operational progress belongs only in `STATUS.json`.

## Fresh-chat HOT path

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
~~~

After HOT context, read only the current task's scope, target code/tests and owning SPEC(s). Historical evidence is discoverable from `docs/history/README.md` but is not loaded by default.

## V1 flow

~~~text
MapHeat2
→ dynamic universe
→ sequential GetSecuritiesData chunks
→ validated complete cycle
→ atomic IndexedDB persistence
→ metadata-only BroadcastChannel
→ Viewer rereads IndexedDB
→ current/history UI
~~~

## Verified V1 behavior

V1 has executable/live evidence for:

- dynamic universe discovery with no hardcoded universe size;
- exact complete-cycle integrity validation;
- atomic IndexedDB `latest` + `history` persistence;
- raw provider-record preservation and `null != 0 != "" != undefined`;
- current table, sorting, per-security history, diagnostics and reload/reopen recovery;
- notification-only BroadcastChannel with IndexedDB as authority;
- one Recorder owner with multiple same-origin Viewers allowed;
- generated self-contained runtime/Bookmarklet and sanitized Debug Bundle;
- authenticated provider collection and extended live operation.

Dated live evidence:

~~~text
docs/history/live-verification/2026-09-23-stage-19-live-report.md
~~~

## Known V1 limitations

- requires an authenticated browser session on the intended Leumi origin;
- provider behavior is external and can change;
- sequential chunks mean a cycle is not an atomic market snapshot; timing metadata is preserved instead;
- chunk size 187 is a configurable verified baseline, not a permanent provider guarantee;
- IndexedDB is browser-local; there is no server sync/backup;
- no automatic retention, so history storage grows over time;
- multiple Viewers may refresh at slightly different moments;
- no execution, filtering, charts, derived momentum metrics or advanced history queries.

## Where to look

| Need | File |
|---|---|
| version | `VERSION` |
| progress / next | `STATUS.json` |
| technical invariants | `AI_CONTEXT.md` |
| plan / scope | `ROADMAP.md` |
| normative contracts | `specs/README.md` |
| design / rationale | `docs/README.md` |
| historical evidence | `docs/history/README.md` |
| runtime usage/download | `runtime/README.md` |
| testing policy | `tests/TESTING_POLICY.md` |

## Source-of-truth ownership

~~~text
STATUS.json  = live progress / verification
ROADMAP.md   = plan / order / scope
AI_CONTEXT   = compact continuation context
specs/       = durable contracts
docs/        = durable design/evidence
docs/history = cold historical evidence
code + tests = implemented behavior / executable evidence
~~~
