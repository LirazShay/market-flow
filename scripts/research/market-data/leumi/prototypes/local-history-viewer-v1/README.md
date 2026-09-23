# Local History Viewer V1

Browser-only market-data research prototype inside Market Flow.

The durable V1 marker is:

~~~text
VERSION
→ V1
~~~

This README is the stable workstream orientation page, not a progress diary. Operational progress belongs only in `STATUS.json`.

## Fresh-chat HOT path

~~~text
README.md
→ STATUS.json
→ AI_CONTEXT.md
~~~

Repository-wide rules are loaded from `AGENTS.md`.

After HOT context, read only the current Stage scope, target files/tests and owning SPEC(s) needed for the task.

Historical rationale and verification evidence remain discoverable from:

~~~text
docs/history/README.md
~~~

but are not preloaded by default.

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

## Verified V1 behavior

The frozen V1 contract has evidence for:

- dynamic provider-universe discovery; universe size is never hardcoded;
- sequential configurable chunk collection with the conservative verified baseline of 187;
- exact complete-cycle integrity checks for requested / received / unique / missing / duplicate IDs;
- atomic successful-cycle persistence to IndexedDB, with failed cycles unable to leave partial `latest` / `history`;
- preservation of full raw MapHeat records and full raw GetSecuritiesData Security objects;
- preservation of `null != 0 != "" != undefined`;
- IndexedDB as the durable browser source of truth;
- BroadcastChannel as notification only, followed by Viewer DB reread;
- current table, deterministic sorting, per-security history and diagnostics;
- reload/reopen recovery from persisted state;
- one recorder runtime owner while multiple same-origin Viewer windows may exist;
- generated self-contained runtime/Bookmarklet delivery from repository source;
- bounded sanitized Debug Bundle export;
- authenticated live-provider collection and extended live persistence/Viewer operation.

Detailed dated live evidence is archived at:

~~~text
docs/history/live-verification/2026-09-23-stage-19-live-report.md
~~~

Executable verification ownership remains in `tests/` and the normative contracts in `specs/`.

## Known V1 limitations

V1 intentionally remains a research prototype:

- it requires an authenticated browser session on the intended Leumi origin;
- current provider behavior is external and may change independently of this repository;
- a full-universe cycle is not an atomic market snapshot because chunks are collected sequentially; per-cycle/chunk/security timing is preserved instead of inventing one timestamp;
- the verified chunk size of 187 is a conservative configurable baseline, not a permanent provider guarantee;
- IndexedDB is browser-local; V1 has no server sync, external backup or multi-device storage;
- V1 has no automatic retention, so long-running history consumes increasing browser storage;
- BroadcastChannel delivery is best-effort notification; IndexedDB remains authoritative and Viewer reload/manual refresh is the recovery path;
- multiple Viewer windows are allowed; they may show slightly different refresh moments while reading the same IndexedDB authority;
- V1 does not perform trade execution or make trading decisions;
- filtering, charts, derived momentum metrics, column configuration, retention policy and advanced history queries are outside V1.

## Stable V1 boundaries

V1 includes:

- dynamic universe;
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

## Where to look

| Need | File |
|---|---|
| version marker | `VERSION` |
| exact operational progress / next action | `STATUS.json` |
| compact technical context / invariants | `AI_CONTEXT.md` |
| full plan / stage scope | `ROADMAP.md` |
| durable normative contracts | `specs/README.md` |
| durable design / rationale | `docs/README.md` |
| preserved historical evidence | `docs/history/README.md` |
| runtime build / verified download / browser usage | `runtime/README.md` |
| testing policy | `tests/TESTING_POLICY.md` |
| optional human fresh-chat helper | `HANDOFF.md` |
| optional copy/paste continuation prompt | `NEXT_CHAT_PROMPT.md` |

## Source-of-truth ownership

~~~text
STATUS.json  = live progress / current verification
ROADMAP.md   = plan / order / scope
AI_CONTEXT   = compact technical continuation
specs/       = durable behavior/contracts/invariants
docs/        = durable design/evidence/rationale
docs/history = cold historical evidence
code + tests = implemented behavior / executable evidence
~~~
